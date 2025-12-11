---
name: file-upload
description: Use when implementing file uploads - enforces server-side validation, proper storage bucket RLS, and secure file handling patterns
tags: [upload, files, storage, images, supabase-storage]
---

# File Upload Specialist

## Overview

File uploads are an attack vector. Without proper validation, users can upload malware, exceed storage limits, or access other users' files. Supabase Storage helps, but misconfiguration creates security holes.

**Core principle:** Never trust file metadata from the client. Validate type and size server-side. Always configure RLS on storage buckets.

## The Iron Law

```
NO FILE UPLOAD WITHOUT SERVER-SIDE TYPE AND SIZE VALIDATION
```

Client-side validation is UX, not security. `file.type` can be spoofed. File extensions can lie. Always validate on the server before storing.

## When to Use

**Always:**
- Image upload features
- Avatar/profile pictures
- Document uploads
- Any user-provided files
- File attachments

**Don't:**
- Static assets bundled with app
- Files from trusted internal sources
- Pre-signed URLs from your own backend

Thinking "I'll validate file type on the client"? Stop. That's UX, not security.

## The Process

### Step 1: Create Storage Bucket with RLS

Bucket must have RLS. No exceptions:

```sql
-- Create bucket with restrictions
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'uploads',
  'uploads',
  false,  -- Private by default
  5242880,  -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
);

-- RLS: Users can only access their own folder
CREATE POLICY "Users upload to own folder"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'uploads' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users read own files"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'uploads' AND
  auth.uid()::text = (storage.foldername(name))[1]
);
```

### Step 2: Implement Server-Side Validation

Every upload validated before storage:

```typescript
const MAX_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

if (!ALLOWED_TYPES.includes(file.type)) {
  return { error: 'Invalid file type' };
}

if (file.size > MAX_SIZE) {
  return { error: 'File too large' };
}
```

### Step 3: Generate Unique Filenames

Prevent overwrites and enumeration attacks.

## Patterns

### Server Action for Upload

<Good>
```typescript
// actions/upload.ts
'use server';

import { createClient } from '@/lib/supabase/server';
import { randomUUID } from 'crypto';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];

export async function uploadFile(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'Unauthorized' };
  }

  const file = formData.get('file') as File;
  if (!file) {
    return { error: 'No file provided' };
  }

  // Server-side type validation
  if (!ALLOWED_TYPES.includes(file.type)) {
    return { error: 'Invalid file type. Allowed: JPEG, PNG, WebP, PDF' };
  }

  // Server-side size validation
  if (file.size > MAX_FILE_SIZE) {
    return { error: 'File too large. Maximum 5MB.' };
  }

  // Generate unique filename in user's folder
  const ext = file.name.split('.').pop()?.toLowerCase() || 'bin';
  const filename = `${user.id}/${randomUUID()}.${ext}`;

  const { data, error } = await supabase.storage
    .from('uploads')
    .upload(filename, file, {
      contentType: file.type,
      upsert: false,  // Don't overwrite
    });

  if (error) {
    console.error('Upload error:', error);
    return { error: 'Upload failed' };
  }

  const { data: urlData } = supabase.storage
    .from('uploads')
    .getPublicUrl(data.path);

  return {
    data: {
      path: data.path,
      url: urlData.publicUrl,
    },
  };
}
```
Auth check. Type validation. Size validation. Unique filename. User's folder for RLS.
</Good>

<Bad>
```typescript
export async function uploadFile(formData: FormData) {
  const file = formData.get('file') as File;

  // No auth check!
  // No type validation!
  // No size validation!
  // Predictable filename!

  const { data } = await supabase.storage
    .from('uploads')
    .upload(file.name, file);  // Original filename - can overwrite!

  return { url: data?.path };
}
```
No validation. No auth. Predictable filenames. Security nightmare.
</Bad>

### Upload Component with Preview

<Good>
```tsx
'use client';

import { useState, useRef } from 'react';
import { uploadFile } from '@/actions/upload';

const MAX_SIZE_MB = 5;

export function FileUpload({ onUpload }: { onUpload?: (result: { path: string; url: string }) => void }) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);

    // Client-side validation for UX (server still validates)
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      setError(`File must be under ${MAX_SIZE_MB}MB`);
      return;
    }

    // Preview for images
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => setPreview(e.target?.result as string);
      reader.readAsDataURL(file);
    }

    // Upload
    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    const result = await uploadFile(formData);
    setUploading(false);

    if (result.error) {
      setError(result.error);
      setPreview(null);
      return;
    }

    onUpload?.(result.data!);
  };

  return (
    <div className="space-y-4">
      <div
        onClick={() => inputRef.current?.click()}
        className={`
          border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
          hover:border-blue-500 transition
          ${uploading ? 'opacity-50 pointer-events-none' : ''}
        `}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*,.pdf"
          onChange={handleFileChange}
          className="hidden"
        />

        {preview ? (
          <img src={preview} alt="Preview" className="max-h-48 mx-auto" />
        ) : (
          <p className="text-gray-600">
            {uploading ? 'Uploading...' : 'Click to upload'}
          </p>
        )}
      </div>

      {error && <p className="text-red-500">{error}</p>}
    </div>
  );
}
```
Client validation for UX. Preview before upload. Loading state. Error display. Server does real validation.
</Good>

<Bad>
```tsx
export function FileUpload() {
  const handleChange = async (e) => {
    const file = e.target.files[0];

    // No client-side feedback
    // No loading state
    // No error handling

    const formData = new FormData();
    formData.append('file', file);
    await uploadFile(formData);
  };

  return <input type="file" onChange={handleChange} />;
}
```
No feedback. No loading. No error handling. Bad UX.
</Bad>

### Avatar Upload with Upsert

<Good>
```typescript
// actions/avatar.ts
'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function uploadAvatar(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'Unauthorized' };
  }

  const file = formData.get('avatar') as File;

  // Validate image
  if (!file.type.startsWith('image/')) {
    return { error: 'Must be an image' };
  }

  if (file.size > 1024 * 1024) {
    return { error: 'Image must be under 1MB' };
  }

  // Fixed filename for avatars - upsert replaces old one
  const ext = file.type.split('/')[1];
  const filename = `${user.id}/avatar.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from('avatars')
    .upload(filename, file, {
      contentType: file.type,
      upsert: true,  // Replace existing avatar
    });

  if (uploadError) {
    return { error: 'Upload failed' };
  }

  const { data: urlData } = supabase.storage
    .from('avatars')
    .getPublicUrl(filename);

  // Add cache buster for immediate update
  const url = `${urlData.publicUrl}?t=${Date.now()}`;

  // Update profile
  await supabase
    .from('profiles')
    .update({ avatar_url: url })
    .eq('id', user.id);

  revalidatePath('/settings');
  return { data: { url } };
}
```
Fixed filename with upsert. Cache buster for immediate display. Profile updated.
</Good>

<Bad>
```typescript
export async function uploadAvatar(formData: FormData) {
  const file = formData.get('avatar') as File;

  // No validation!
  // No auth!

  await supabase.storage
    .from('avatars')
    .upload(file.name, file);  // Random filename - orphaned files!

  // Profile not updated - avatar doesn't display!
}
```
No validation. Orphaned files. Profile not updated.
</Bad>

### Signed URLs for Private Files

<Good>
```typescript
// actions/files.ts
'use server';

export async function getSignedUrl(path: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'Unauthorized' };
  }

  // Verify user owns the file (path starts with their ID)
  if (!path.startsWith(`${user.id}/`)) {
    return { error: 'Forbidden' };
  }

  const { data, error } = await supabase.storage
    .from('uploads')
    .createSignedUrl(path, 3600); // 1 hour expiry

  if (error) {
    return { error: 'Failed to generate URL' };
  }

  return { data: { url: data.signedUrl } };
}
```
Verifies user owns file. Short expiry. Server-side only.
</Good>

<Bad>
```typescript
export async function getSignedUrl(path: string) {
  // No auth check!
  // No ownership verification!

  const { data } = await supabase.storage
    .from('uploads')
    .createSignedUrl(path, 86400 * 7); // Week-long expiry!

  return { url: data?.signedUrl };
}
```
No ownership check. Anyone can access any file. Long expiry is dangerous.
</Bad>

## Anti-Patterns

| Anti-Pattern | Why It Fails | What To Do Instead |
|--------------|--------------|-------------------|
| Client-only validation | Can be bypassed | Validate server-side |
| Trusting file.type | Can be spoofed | Check magic bytes for critical apps |
| Predictable filenames | Enumeration attacks | Use UUID in filename |
| No RLS on storage | Anyone can access files | Configure bucket policies |
| Long-lived signed URLs | Leaked URLs stay valid | Short expiry (1 hour max) |

## Red Flags - STOP

If you catch yourself:
- Skipping server-side file validation
- Using original filename directly
- Not configuring RLS on storage bucket
- Creating signed URLs without ownership check
- Allowing unlimited file sizes

**ALL of these mean: STOP. Review storage security. Configure RLS. Validate everything.**

## Common Rationalizations

| Excuse | Reality |
|--------|---------|
| "Client validates the type" | Client validation is for UX, not security. |
| "It's just images, what's the risk?" | Malicious images exploit parsers. Validate. |
| "The bucket is private" | Private without RLS means anyone authenticated can access. |
| "File size limit is in the bucket config" | That's a fallback. Validate in code for better errors. |
| "Only admins upload files" | Admins make mistakes. Validate everything. |
| "I'll add RLS later" | You'll forget. Files will leak. |

## Gotchas

### file.type Can Be Spoofed

For critical applications, check magic bytes:

```typescript
const buffer = await file.arrayBuffer();
const bytes = new Uint8Array(buffer.slice(0, 4));

// JPEG starts with [0xFF, 0xD8, 0xFF]
// PNG starts with [0x89, 0x50, 0x4E, 0x47]
const isJpeg = bytes[0] === 0xFF && bytes[1] === 0xD8 && bytes[2] === 0xFF;
const isPng = bytes[0] === 0x89 && bytes[1] === 0x50;
```

### Cleanup Orphaned Files

When deleting records, delete associated files:

```typescript
// When deleting a post with attachments
await supabase.storage.from('uploads').remove([attachment.path]);
await supabase.from('posts').delete().eq('id', postId);
```

### Next.js Image Optimization

Configure remote patterns for Supabase:

```javascript
// next.config.js
module.exports = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
};
```

### Cache Busting for Replaced Images

When upsert replaces an image, browsers cache the old one:

```typescript
const url = `${publicUrl}?t=${Date.now()}`;
```

## Verification Checklist

Before marking file upload complete:

- [ ] Storage bucket created with file size limit
- [ ] RLS policies configured on storage bucket
- [ ] Server-side file type validation
- [ ] Server-side file size validation
- [ ] Unique filenames with UUID
- [ ] Files stored in user's folder for RLS
- [ ] Error handling for upload failures
- [ ] Loading state during upload
- [ ] Preview for image uploads
- [ ] Signed URLs verify ownership before generating

Can't check all boxes? You have file upload vulnerabilities. Fix them.

## Integration

**Pairs well with:**
- `supabase-backend` - Storage setup
- `crud-builder` - File associations with records
- `react-patterns` - Upload components
- `security-audit` - File upload security review

**Requires:**
- Supabase Storage configured
- RLS policies on storage bucket

## References

- [Supabase Storage Documentation](https://supabase.com/docs/guides/storage)
- [Supabase Storage RLS](https://supabase.com/docs/guides/storage/security/access-control)
- [OWASP File Upload Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/File_Upload_Cheat_Sheet.html)

---

*This specialist follows the world-class skill pattern.*
