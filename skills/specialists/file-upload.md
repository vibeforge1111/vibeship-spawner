# File Upload Specialist

## Identity

- **Tags**: `upload`, `files`, `storage`, `images`, `supabase-storage`
- **Domain**: Supabase Storage, presigned URLs, image optimization, file validation
- **Use when**: File upload features, image handling, avatar uploads, document storage

---

## Patterns

### Supabase Storage Setup

```sql
-- Create storage bucket (run in Supabase SQL editor)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'uploads',
  'uploads',
  false,  -- Private bucket
  5242880,  -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf']
);

-- RLS policies for storage
CREATE POLICY "Users can upload to own folder"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'uploads' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can read own files"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'uploads' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete own files"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'uploads' AND
  auth.uid()::text = (storage.foldername(name))[1]
);
```

### Public Bucket for Avatars

```sql
-- Public avatars bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatars',
  'avatars',
  true,  -- Public bucket
  1048576,  -- 1MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp']
);

-- Anyone can read public avatars
CREATE POLICY "Public avatar access"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

-- Users can upload own avatar
CREATE POLICY "Users can upload own avatar"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'avatars' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Users can update own avatar
CREATE POLICY "Users can update own avatar"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'avatars' AND
  auth.uid()::text = (storage.foldername(name))[1]
);
```

### Server Action for Upload

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

  // Validate file type
  if (!ALLOWED_TYPES.includes(file.type)) {
    return { error: 'Invalid file type' };
  }

  // Validate file size
  if (file.size > MAX_FILE_SIZE) {
    return { error: 'File too large (max 5MB)' };
  }

  // Generate unique filename
  const ext = file.name.split('.').pop();
  const filename = `${user.id}/${randomUUID()}.${ext}`;

  // Upload to Supabase Storage
  const { data, error } = await supabase.storage
    .from('uploads')
    .upload(filename, file, {
      contentType: file.type,
      upsert: false,
    });

  if (error) {
    console.error('Upload error:', error);
    return { error: 'Upload failed' };
  }

  // Get public URL (for public buckets) or signed URL (for private)
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

### Avatar Upload Action

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
  if (!file) {
    return { error: 'No file provided' };
  }

  // Validate image
  if (!file.type.startsWith('image/')) {
    return { error: 'Must be an image' };
  }

  if (file.size > 1024 * 1024) {
    return { error: 'Image must be under 1MB' };
  }

  const ext = file.name.split('.').pop();
  const filename = `${user.id}/avatar.${ext}`;

  // Upload with upsert to replace existing
  const { error: uploadError } = await supabase.storage
    .from('avatars')
    .upload(filename, file, {
      contentType: file.type,
      upsert: true,
    });

  if (uploadError) {
    return { error: 'Upload failed' };
  }

  // Get public URL
  const { data: urlData } = supabase.storage
    .from('avatars')
    .getPublicUrl(filename);

  // Update profile with new avatar URL
  const { error: updateError } = await supabase
    .from('profiles')
    .update({ avatar_url: urlData.publicUrl })
    .eq('id', user.id);

  if (updateError) {
    return { error: 'Failed to update profile' };
  }

  revalidatePath('/dashboard/settings');
  return { data: { url: urlData.publicUrl } };
}
```

### Upload Component

```tsx
// components/file-upload.tsx
'use client';

import { useState, useRef } from 'react';
import { uploadFile } from '@/actions/upload';

interface Props {
  onUpload?: (result: { path: string; url: string }) => void;
  accept?: string;
  maxSize?: number; // in MB
}

export function FileUpload({
  onUpload,
  accept = 'image/*,.pdf',
  maxSize = 5,
}: Props) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);

    // Client-side validation
    if (file.size > maxSize * 1024 * 1024) {
      setError(`File must be under ${maxSize}MB`);
      return;
    }

    // Show preview for images
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
          hover:border-blue-500 hover:bg-blue-50 transition
          ${uploading ? 'opacity-50 pointer-events-none' : ''}
        `}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          onChange={handleFileChange}
          className="hidden"
        />

        {preview ? (
          <img src={preview} alt="Preview" className="max-h-48 mx-auto" />
        ) : (
          <div>
            <UploadIcon className="w-12 h-12 mx-auto text-gray-400" />
            <p className="mt-2 text-gray-600">
              {uploading ? 'Uploading...' : 'Click to upload or drag and drop'}
            </p>
            <p className="text-sm text-gray-400">Max {maxSize}MB</p>
          </div>
        )}
      </div>

      {error && (
        <p className="text-red-500 text-sm">{error}</p>
      )}
    </div>
  );
}
```

### Avatar Upload Component

```tsx
// components/avatar-upload.tsx
'use client';

import { useState, useRef } from 'react';
import { uploadAvatar } from '@/actions/avatar';

interface Props {
  currentAvatar?: string | null;
  onUpload?: (url: string) => void;
}

export function AvatarUpload({ currentAvatar, onUpload }: Props) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const displayUrl = preview || currentAvatar || '/default-avatar.png';

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Preview
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target?.result as string);
    reader.readAsDataURL(file);

    // Upload
    setUploading(true);
    const formData = new FormData();
    formData.append('avatar', file);

    const result = await uploadAvatar(formData);
    setUploading(false);

    if (result.error) {
      setPreview(null);
      alert(result.error);
      return;
    }

    onUpload?.(result.data!.url);
  };

  return (
    <div className="flex items-center gap-4">
      <div className="relative">
        <img
          src={displayUrl}
          alt="Avatar"
          className="w-20 h-20 rounded-full object-cover"
        />
        {uploading && (
          <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
            <Spinner className="w-6 h-6 text-white" />
          </div>
        )}
      </div>

      <div>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="text-blue-600 hover:text-blue-700 font-medium"
        >
          Change avatar
        </button>
        <p className="text-sm text-gray-500">JPG, PNG, WebP. Max 1MB.</p>
      </div>
    </div>
  );
}
```

### Drag and Drop Upload

```tsx
// components/dropzone.tsx
'use client';

import { useState, useCallback } from 'react';
import { uploadFile } from '@/actions/upload';

interface Props {
  onUpload?: (files: Array<{ path: string; url: string }>) => void;
  multiple?: boolean;
  accept?: string[];
}

export function Dropzone({ onUpload, multiple = false, accept }: Props) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [files, setFiles] = useState<Array<{ name: string; url: string }>>([]);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const droppedFiles = Array.from(e.dataTransfer.files);
    if (!multiple && droppedFiles.length > 1) {
      alert('Only one file allowed');
      return;
    }

    setUploading(true);
    const results = [];

    for (const file of droppedFiles) {
      const formData = new FormData();
      formData.append('file', file);
      const result = await uploadFile(formData);

      if (result.data) {
        results.push({ name: file.name, ...result.data });
      }
    }

    setFiles((prev) => [...prev, ...results]);
    setUploading(false);
    onUpload?.(results);
  }, [multiple, onUpload]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  return (
    <div
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      className={`
        border-2 border-dashed rounded-lg p-8 text-center transition
        ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}
        ${uploading ? 'opacity-50' : ''}
      `}
    >
      {uploading ? (
        <p>Uploading...</p>
      ) : (
        <>
          <p className="text-gray-600">
            Drag and drop files here, or click to browse
          </p>
          {accept && (
            <p className="text-sm text-gray-400 mt-1">
              Accepted: {accept.join(', ')}
            </p>
          )}
        </>
      )}

      {files.length > 0 && (
        <ul className="mt-4 text-left space-y-2">
          {files.map((file, i) => (
            <li key={i} className="flex items-center gap-2 text-sm">
              <CheckIcon className="w-4 h-4 text-green-500" />
              {file.name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
```

### Signed URLs for Private Files

```typescript
// actions/files.ts
'use server';

import { createClient } from '@/lib/supabase/server';

export async function getSignedUrl(path: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'Unauthorized' };
  }

  // Verify user owns the file
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

### Image Optimization with Next.js

```tsx
// Use Next.js Image for automatic optimization
import Image from 'next/image';

// For Supabase Storage, configure next.config.js
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

// Usage
<Image
  src={avatarUrl}
  alt="Avatar"
  width={80}
  height={80}
  className="rounded-full"
/>
```

---

## Anti-patterns

### No Server-Side Validation

```typescript
// BAD - Trust client
'use server';
export async function upload(formData: FormData) {
  const file = formData.get('file') as File;
  await supabase.storage.from('uploads').upload(file.name, file);
}

// GOOD - Validate everything
export async function upload(formData: FormData) {
  const file = formData.get('file') as File;
  if (!ALLOWED_TYPES.includes(file.type)) return { error: 'Invalid type' };
  if (file.size > MAX_SIZE) return { error: 'Too large' };
  // ... continue
}
```

### Predictable Filenames

```typescript
// BAD - Easy to guess/overwrite
const filename = `${user.id}/avatar.png`;

// GOOD - Add uniqueness
const filename = `${user.id}/${randomUUID()}.png`;
```

### Missing RLS on Storage

Always configure storage RLS policies. Without them, anyone can read/write files.

---

## Gotchas

### 1. File Type Validation

`file.type` can be spoofed. For critical validation, check file headers:
```typescript
// Check magic bytes for images
const buffer = await file.arrayBuffer();
const bytes = new Uint8Array(buffer.slice(0, 4));
// JPEG: [0xFF, 0xD8, 0xFF]
// PNG: [0x89, 0x50, 0x4E, 0x47]
```

### 2. CORS for Direct Uploads

Supabase handles CORS automatically, but if using presigned URLs with custom domains, configure CORS.

### 3. Cleanup Orphaned Files

When deleting records, also delete associated files:
```typescript
await supabase.storage.from('uploads').remove([filePath]);
```

### 4. Storage Quotas

Monitor storage usage. Implement cleanup for old files if needed.

---

## Checkpoints

Before marking file upload complete:

- [ ] Storage bucket created with correct settings
- [ ] RLS policies configured
- [ ] File type validation (server-side)
- [ ] File size validation
- [ ] Unique filenames to prevent conflicts
- [ ] Error handling for upload failures
- [ ] Loading state during upload
- [ ] Preview for images
- [ ] Cleanup when files are replaced/deleted

---

## Squad Dependencies

Often paired with:
- `supabase-backend` for storage setup
- `crud-builder` for file associations
- `react-patterns` for upload components
- `server-client-boundary` for server actions

---

*Last updated: 2025-12-11*
