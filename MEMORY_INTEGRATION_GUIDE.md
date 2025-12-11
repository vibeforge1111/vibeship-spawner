# VibeMemo Integration Guide for Spawner

> Step-by-step guide to fork, customize, and integrate VibeMemo into Vibeship Spawner

## Overview

This guide covers:
1. Forking and customizing VibeMemo for Spawner
2. Adding remote memory option (user's own API keys)
3. Spawner-specific memory types
4. User setup workflow
5. Prompts for optimal Claude integration

---

## Part 1: Fork & Setup

### Step 1: Fork the Repository

```bash
# Fork on GitHub first, then clone your fork
git clone https://github.com/vibeforge1111/vibememo.git vibeship-memory
cd vibeship-memory

# Add upstream for future updates
git remote add upstream https://github.com/RLabs-Inc/memory.git
```

### Step 2: Understand the Structure

```
vibeship-memory/
├── python/
│   └── memory_engine/
│       ├── api.py                  # FastAPI server (main entry)
│       ├── memory.py               # Core memory engine
│       ├── curator.py              # Session-based curation
│       ├── transcript_curator.py   # Transcript → memories
│       ├── storage.py              # ChromaDB + SQLite
│       ├── embeddings.py           # Sentence transformers
│       ├── retrieval_strategies.py # Smart vector retrieval
│       ├── session_primer.py       # "We last spoke..."
│       └── config.py               # Configuration
├── integration/
│   └── claude-code/
│       ├── hooks/                  # Claude Code hooks
│       └── install.sh              # One-command install
├── start_server.py                 # Quick start script
└── pyproject.toml                  # Dependencies
```

### Step 3: Install and Test Baseline

```bash
# Install uv if not present
curl -LsSf https://astral.sh/uv/install.sh | sh

# Install dependencies
uv sync

# Start the server
uv run start_server.py

# Test health endpoint
curl http://localhost:8765/health
```

### Step 3.5: Update Dependencies for Spawner

Update `pyproject.toml` to include Spawner-specific dependencies:

```toml
[project]
name = "vibeship-memory"
version = "0.1.0"
description = "Memory system for Vibeship Spawner"
requires-python = ">=3.10"

dependencies = [
    # Original VibeMemo dependencies
    "fastapi>=0.104.0",
    "uvicorn>=0.24.0",
    "pydantic>=2.0.0",
    "httpx>=0.25.0",
    
    # Local storage
    "chromadb>=0.4.0",           # Vector database
    "sentence-transformers>=2.2.0",  # Local embeddings
    
    # MCP integration
    "mcp>=0.1.0",                # Model Context Protocol SDK
    
    # Utilities
    "python-dotenv>=1.0.0",
    "rich>=13.0.0",              # Nice terminal output
]

[project.optional-dependencies]
# For AI curation (optional)
ai = [
    "anthropic>=0.18.0",
    "openai>=1.0.0",
]

# For remote storage (optional)
remote = [
    "supabase>=2.0.0",
]

# For development
dev = [
    "pytest>=7.0.0",
    "pytest-asyncio>=0.21.0",
    "black>=23.0.0",
    "ruff>=0.1.0",
]

[build-system]
requires = ["hatchling"]
build-backend = "hatchling.build"

[tool.hatch.build.targets.wheel]
packages = ["python/memory_engine"]
```

Install with options:
```bash
# Local only (no API keys needed)
uv sync

# With AI curation support
uv sync --extra ai

# With remote storage support
uv sync --extra remote

# Everything
uv sync --all-extras
```

### Step 4: Create Start Script

Create `start_server.py`:

```python
#!/usr/bin/env python3
"""
Quick start script for Spawner Memory server.
Run: uv run start_server.py
"""

import os
import sys
import uvicorn
from pathlib import Path

# Add python directory to path
sys.path.insert(0, str(Path(__file__).parent / "python"))


def main():
    """Start the Spawner Memory server."""
    print("🧠 Spawner Memory Server")
    print("=" * 40)
    
    # Check if this is first run
    data_dir = Path("./data")
    if not data_dir.exists():
        print("📁 First run - creating data directory...")
        data_dir.mkdir(parents=True)
    
    # Check embedding model
    print("🔍 Checking embedding model...")
    try:
        from memory_engine.embeddings import _get_model
        _get_model()  # This downloads if needed
        print("✅ Embedding model ready")
    except Exception as e:
        print(f"⚠️  Embedding model issue: {e}")
        print("   Will download on first use (~90MB)")
    
    # Show configuration
    provider = os.getenv("SPAWNER_MEMORY_PROVIDER", "local")
    curation = os.getenv("SPAWNER_CURATION_PROVIDER", "local")
    
    print(f"\n📦 Storage: {provider}")
    print(f"🤖 Curation: {curation}")
    
    if curation == "local":
        print("   (Rule-based extraction, no API key needed)")
    elif curation == "claude" and not os.getenv("ANTHROPIC_API_KEY"):
        print("   ⚠️  ANTHROPIC_API_KEY not set, will use rule-based")
    elif curation == "openai" and not os.getenv("OPENAI_API_KEY"):
        print("   ⚠️  OPENAI_API_KEY not set, will use rule-based")
    
    print(f"\n🌐 Starting server at http://localhost:8765")
    print("   Press Ctrl+C to stop\n")
    
    # Start server
    uvicorn.run(
        "memory_engine.api:app",
        host="localhost",
        port=8765,
        reload=False,
        log_level="info",
    )


if __name__ == "__main__":
    main()
```

Create `python/memory_engine/api.py`:

```python
"""
FastAPI server for Spawner Memory.
Provides REST API in addition to MCP interface.
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import logging

from .engine import SpawnerMemoryEngine
from .spawner_types import SpawnerMemoryType
from .config import SpawnerMemoryConfig

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize
config = SpawnerMemoryConfig.from_env()
engine = SpawnerMemoryEngine(config)

# Create FastAPI app
app = FastAPI(
    title="Spawner Memory",
    description="Memory system for Vibeship Spawner",
    version="0.1.0",
)

# CORS for local development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# =========== Models ===========

class StartSessionRequest(BaseModel):
    project_id: Optional[str] = None
    project_name: Optional[str] = None
    project_description: Optional[str] = None

class EndSessionRequest(BaseModel):
    summary: Optional[str] = None
    transcript: Optional[str] = None

class SearchRequest(BaseModel):
    query: str
    memory_types: Optional[List[str]] = None
    limit: int = 5

class AddMemoryRequest(BaseModel):
    content: str
    memory_type: str
    importance: Optional[float] = None
    tags: Optional[List[str]] = None

class UpdateProjectRequest(BaseModel):
    current_goals: Optional[List[str]] = None
    open_issues: Optional[List[str]] = None
    resolved_issue: Optional[str] = None


# =========== Endpoints ===========

@app.get("/health")
async def health():
    """Health check."""
    return {"status": "ok", "service": "spawner-memory"}


@app.post("/session/start")
async def start_session(request: StartSessionRequest):
    """Start a new session."""
    primer = await engine.start_session(
        project_id=request.project_id,
        project_name=request.project_name,
        project_description=request.project_description,
    )
    return {
        "status": "ok",
        "project_id": engine.current_project_id,
        "session_id": engine.current_session_id,
        "primer": primer,
    }


@app.post("/session/end")
async def end_session(request: EndSessionRequest):
    """End current session."""
    result = await engine.end_session(
        summary=request.summary,
        transcript=request.transcript,
    )
    return {"status": "ok", "result": result}


@app.post("/memory/search")
async def search_memories(request: SearchRequest):
    """Search memories."""
    memory_types = None
    if request.memory_types:
        memory_types = [SpawnerMemoryType(t) for t in request.memory_types]
    
    memories = await engine.search(
        query=request.query,
        memory_types=memory_types,
        limit=request.limit,
    )
    return {
        "status": "ok",
        "memories": [m.dict() for m in memories],
    }


@app.post("/memory/add")
async def add_memory(request: AddMemoryRequest):
    """Add a memory."""
    memory_id = await engine.add_memory(
        content=request.content,
        memory_type=SpawnerMemoryType(request.memory_type),
        importance=request.importance,
        tags=request.tags,
    )
    return {"status": "ok", "memory_id": memory_id}


@app.get("/context")
async def get_context():
    """Get full project context."""
    context = await engine.get_context()
    return {"status": "ok", "context": context}


@app.post("/project/update")
async def update_project(request: UpdateProjectRequest):
    """Update project manifest."""
    await engine.update_project(
        current_goals=request.current_goals,
        open_issues=request.open_issues,
        resolved_issue=request.resolved_issue,
    )
    return {"status": "ok"}


@app.get("/projects")
async def list_projects(limit: int = 10):
    """List recent projects."""
    projects = engine.list_projects(limit)
    return {
        "status": "ok",
        "projects": [p.dict() for p in projects],
    }


@app.get("/stats")
async def get_stats():
    """Get memory statistics."""
    stats = engine.get_stats()
    return {"status": "ok", "stats": stats}
```

---

## Part 2: Spawner Customizations

### Step 4: Add Spawner Memory Types

Create `python/memory_engine/spawner_types.py`:

```python
"""
Spawner-specific memory types and schemas.
These extend VibeMemo's base memory system with project-building context.
"""

from enum import Enum
from typing import Optional, List
from pydantic import BaseModel, Field
from datetime import datetime


class SpawnerMemoryType(str, Enum):
    """Memory types specific to vibe coding projects."""
    
    # Project Context
    PROJECT_IDENTITY = "project_identity"      # What is this project
    ARCHITECTURE_DECISION = "architecture_decision"  # Why we chose X
    TECH_STACK = "tech_stack"                  # What tools/frameworks
    
    # Development State
    CURRENT_GOAL = "current_goal"              # What we're working on
    KNOWN_ISSUE = "known_issue"                # Bugs, blockers
    RESOLVED_ISSUE = "resolved_issue"          # Fixed problems
    
    # Quality & Validation  
    GUARDRAIL_PASSED = "guardrail_passed"      # What's been validated
    SHARP_EDGE_HIT = "sharp_edge_hit"          # Gotchas encountered
    
    # Session Context
    SESSION_SUMMARY = "session_summary"        # End-of-session recap
    BREAKTHROUGH = "breakthrough"              # Aha moments
    
    # User Context
    USER_PREFERENCE = "user_preference"        # How user likes to work
    SKILL_LEVEL = "skill_level"               # User's expertise areas


class SpawnerMemory(BaseModel):
    """Extended memory schema for Spawner."""
    
    # Core fields (from VibeMemo)
    content: str
    importance_weight: float = Field(ge=0, le=1, default=0.5)
    semantic_tags: List[str] = []
    
    # Spawner extensions
    memory_type: SpawnerMemoryType
    project_id: Optional[str] = None
    
    # For decisions
    decision: Optional[str] = None
    reasoning: Optional[str] = None
    alternatives_considered: Optional[List[str]] = None
    
    # For issues
    issue_status: Optional[str] = None  # open, resolved, wontfix
    resolution: Optional[str] = None
    
    # For validation
    validation_type: Optional[str] = None  # security, patterns, production
    files_validated: Optional[List[str]] = None
    
    # Temporal
    created_at: datetime = Field(default_factory=datetime.utcnow)
    valid_until: Optional[datetime] = None  # For time-sensitive memories
    
    # Retrieval hints
    trigger_phrases: List[str] = []
    related_memories: List[str] = []  # IDs of related memories


class ProjectManifest(BaseModel):
    """Project-level context that persists across all sessions."""
    
    project_id: str
    name: str
    description: Optional[str] = None
    
    # Stack
    frameworks: List[str] = []  # ["nextjs", "supabase", "tailwind"]
    languages: List[str] = []   # ["typescript", "python"]
    deployment: Optional[str] = None  # "vercel", "railway", etc
    
    # State
    created_at: datetime = Field(default_factory=datetime.utcnow)
    last_session: Optional[datetime] = None
    total_sessions: int = 0
    
    # Key decisions (summary)
    architecture_summary: Optional[str] = None
    
    # Active context
    current_goals: List[str] = []
    open_issues: List[str] = []


# Memory importance weights by type
DEFAULT_IMPORTANCE = {
    SpawnerMemoryType.PROJECT_IDENTITY: 1.0,
    SpawnerMemoryType.ARCHITECTURE_DECISION: 0.9,
    SpawnerMemoryType.TECH_STACK: 0.8,
    SpawnerMemoryType.CURRENT_GOAL: 0.7,
    SpawnerMemoryType.KNOWN_ISSUE: 0.8,
    SpawnerMemoryType.RESOLVED_ISSUE: 0.4,
    SpawnerMemoryType.GUARDRAIL_PASSED: 0.3,
    SpawnerMemoryType.SHARP_EDGE_HIT: 0.9,
    SpawnerMemoryType.SESSION_SUMMARY: 0.5,
    SpawnerMemoryType.BREAKTHROUGH: 0.9,
    SpawnerMemoryType.USER_PREFERENCE: 0.6,
    SpawnerMemoryType.SKILL_LEVEL: 0.7,
}
```

### Step 5: Add Spawner Curation Prompts

Create `python/memory_engine/spawner_curator.py`:

```python
"""
Spawner-specific curation prompts and logic.
Teaches Claude how to extract meaningful memories from coding sessions.
"""

SPAWNER_CURATION_SYSTEM_PROMPT = """
You are a memory curator for Vibeship Spawner, a tool that helps vibe coders build production-ready products.

Your job is to analyze a coding session transcript and extract memories that will be valuable in future sessions.

## What to Remember

### HIGH VALUE (importance: 0.8-1.0)
- **Architecture Decisions**: "We chose Supabase over Firebase because..." 
- **Sharp Edges Hit**: Gotchas and bugs that took time to figure out
- **Breakthroughs**: Moments where something finally worked
- **Project Identity**: What this project is and who it's for

### MEDIUM VALUE (importance: 0.5-0.7)
- **Current Goals**: What we're actively working toward
- **Tech Stack Details**: Specific versions, configurations
- **User Preferences**: How they like to work, communication style
- **Known Issues**: Bugs we know about but haven't fixed

### LOW VALUE (importance: 0.2-0.4)
- **Resolved Issues**: Fixed problems (keep briefly for context)
- **Guardrails Passed**: Validation checks that passed
- **Session Summaries**: High-level recap of what happened

### DO NOT REMEMBER
- Generic coding patterns Claude already knows
- Temporary debugging attempts that didn't lead anywhere
- Code snippets without context
- Obvious information that doesn't add value

## Memory Format

For each memory, provide:

```json
{
  "content": "Clear, concise description of what to remember",
  "memory_type": "One of: project_identity, architecture_decision, tech_stack, current_goal, known_issue, resolved_issue, guardrail_passed, sharp_edge_hit, session_summary, breakthrough, user_preference, skill_level",
  "importance_weight": 0.0-1.0,
  "semantic_tags": ["relevant", "tags", "for", "search"],
  "trigger_phrases": ["phrases that should", "surface this memory"],
  "reasoning": "Why this is worth remembering"
}
```

## Examples

### Good Memory (Architecture Decision)
```json
{
  "content": "Using Supabase Edge Functions instead of Next.js API routes for webhooks because Edge Functions have longer timeout (60s vs 10s on Vercel)",
  "memory_type": "architecture_decision",
  "importance_weight": 0.9,
  "semantic_tags": ["supabase", "edge-functions", "webhooks", "architecture"],
  "trigger_phrases": ["webhook", "api route", "timeout", "edge function"],
  "reasoning": "Critical architectural decision that affects how webhooks are implemented"
}
```

### Good Memory (Sharp Edge Hit)
```json
{
  "content": "Supabase RLS policies using auth.uid() fail silently for 1-2 seconds after user signup due to token refresh timing. Workaround: use service_role for initial data creation in signup flow.",
  "memory_type": "sharp_edge_hit",
  "importance_weight": 0.95,
  "semantic_tags": ["supabase", "rls", "auth", "signup", "gotcha"],
  "trigger_phrases": ["empty data after signup", "rls not working", "new user sees nothing"],
  "reasoning": "Hard-to-debug issue that will likely recur. Solution is non-obvious."
}
```

### Bad Memory (Too Generic)
```json
{
  "content": "Use TypeScript for type safety",
  "reasoning": "BAD: Claude already knows this. Not project-specific."
}
```

## Output Format

Return a JSON array of memories to create. Only include memories that meet the value threshold.
If the session has no memories worth keeping, return an empty array.

```json
{
  "memories": [...],
  "session_summary": "One paragraph summary of what happened this session",
  "project_manifest_updates": {
    "current_goals": ["updated", "goals"],
    "open_issues": ["any", "new", "issues"]
  }
}
```
"""


SPAWNER_RETRIEVAL_PROMPT = """
You are retrieving memories for a Vibeship Spawner session.

Current context:
- Project: {project_name}
- Stack: {stack}
- User message: {user_message}

Based on this context, which memories are most relevant?

Consider:
1. Direct relevance to the user's current question/task
2. Architecture decisions that constrain solutions
3. Known issues that might be related
4. Sharp edges they might hit
5. User preferences for how to respond

Return the memory IDs in order of relevance, with a brief reason for each.
"""


SESSION_PRIMER_TEMPLATE = """
## Session Context

**Project:** {project_name}
{project_description}

**Stack:** {stack}

**Last Session:** {last_session_date}
{last_session_summary}

**Current Goals:**
{current_goals}

**Open Issues:**
{open_issues}

**Key Decisions:**
{key_decisions}

---

*Memories will surface naturally as we work. Let's continue where we left off.*
"""


def generate_session_primer(project_manifest, recent_memories, last_session):
    """Generate the session primer that starts each conversation."""
    
    # Format current goals
    goals = project_manifest.current_goals
    goals_str = "\n".join(f"- {g}" for g in goals) if goals else "None specified"
    
    # Format open issues
    issues = project_manifest.open_issues
    issues_str = "\n".join(f"- {i}" for i in issues) if issues else "None tracked"
    
    # Get key architecture decisions from recent memories
    decisions = [m for m in recent_memories if m.memory_type == "architecture_decision"]
    decisions_str = "\n".join(f"- {d.content}" for d in decisions[:5]) if decisions else "None recorded"
    
    # Format last session info
    if last_session:
        last_date = last_session.created_at.strftime("%B %d, %Y")
        last_summary = last_session.content
    else:
        last_date = "First session"
        last_summary = "This is our first session together."
    
    return SESSION_PRIMER_TEMPLATE.format(
        project_name=project_manifest.name,
        project_description=project_manifest.description or "No description yet",
        stack=", ".join(project_manifest.frameworks + project_manifest.languages),
        last_session_date=last_date,
        last_session_summary=last_summary,
        current_goals=goals_str,
        open_issues=issues_str,
        key_decisions=decisions_str,
    )
```

### Step 6: Extend Local Storage for Spawner

VibeMemo uses SQLite + ChromaDB locally. We need to extend it for Spawner memory types.

Create `python/memory_engine/local_storage.py`:

```python
"""
Extended local storage for Spawner Memory.
Builds on VibeMemo's ChromaDB + SQLite foundation.
"""

import sqlite3
import json
from pathlib import Path
from typing import List, Optional, Dict, Any
from datetime import datetime
import chromadb
from chromadb.config import Settings

from .spawner_types import SpawnerMemory, SpawnerMemoryType, ProjectManifest, DEFAULT_IMPORTANCE
from .embeddings import get_embedding


class LocalSpawnerStorage:
    """
    Local storage backend using SQLite (metadata) + ChromaDB (vectors).
    This is the default, free, privacy-first option.
    """
    
    def __init__(
        self,
        db_path: str = "./data/spawner_memory.db",
        chroma_path: str = "./data/chroma",
    ):
        self.db_path = Path(db_path)
        self.chroma_path = Path(chroma_path)
        
        # Ensure directories exist
        self.db_path.parent.mkdir(parents=True, exist_ok=True)
        self.chroma_path.mkdir(parents=True, exist_ok=True)
        
        # Initialize SQLite
        self.conn = sqlite3.connect(str(self.db_path))
        self.conn.row_factory = sqlite3.Row
        self._init_schema()
        
        # Initialize ChromaDB
        self.chroma_client = chromadb.PersistentClient(
            path=str(self.chroma_path),
            settings=Settings(anonymized_telemetry=False)
        )
        self.collection = self.chroma_client.get_or_create_collection(
            name="spawner_memories",
            metadata={"hnsw:space": "cosine"}
        )
    
    def _init_schema(self):
        """Initialize SQLite schema for Spawner memories."""
        cursor = self.conn.cursor()
        
        # Projects table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS projects (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                description TEXT,
                frameworks TEXT,  -- JSON array
                languages TEXT,   -- JSON array
                deployment TEXT,
                architecture_summary TEXT,
                current_goals TEXT,  -- JSON array
                open_issues TEXT,    -- JSON array
                created_at TEXT NOT NULL,
                last_session TEXT,
                total_sessions INTEGER DEFAULT 0
            )
        """)
        
        # Memories table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS memories (
                id TEXT PRIMARY KEY,
                project_id TEXT NOT NULL,
                content TEXT NOT NULL,
                memory_type TEXT NOT NULL,
                importance_weight REAL DEFAULT 0.5,
                semantic_tags TEXT,  -- JSON array
                trigger_phrases TEXT,  -- JSON array
                
                -- Decision-specific fields
                decision TEXT,
                reasoning TEXT,
                alternatives_considered TEXT,  -- JSON array
                
                -- Issue-specific fields
                issue_status TEXT,
                resolution TEXT,
                
                -- Validation-specific fields
                validation_type TEXT,
                files_validated TEXT,  -- JSON array
                
                -- Temporal
                created_at TEXT NOT NULL,
                valid_until TEXT,
                last_accessed TEXT,
                access_count INTEGER DEFAULT 0,
                
                FOREIGN KEY (project_id) REFERENCES projects(id)
            )
        """)
        
        # Sessions table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS sessions (
                id TEXT PRIMARY KEY,
                project_id TEXT NOT NULL,
                summary TEXT,
                started_at TEXT NOT NULL,
                ended_at TEXT,
                memories_created INTEGER DEFAULT 0,
                transcript_hash TEXT,  -- To avoid re-processing
                
                FOREIGN KEY (project_id) REFERENCES projects(id)
            )
        """)
        
        # Indexes for common queries
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_memories_project ON memories(project_id)")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_memories_type ON memories(memory_type)")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_memories_importance ON memories(importance_weight DESC)")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_sessions_project ON sessions(project_id)")
        
        self.conn.commit()
    
    # =========== Project Operations ===========
    
    def create_project(self, manifest: ProjectManifest) -> str:
        """Create a new project."""
        cursor = self.conn.cursor()
        cursor.execute("""
            INSERT INTO projects (id, name, description, frameworks, languages, 
                                  deployment, current_goals, open_issues, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            manifest.project_id,
            manifest.name,
            manifest.description,
            json.dumps(manifest.frameworks),
            json.dumps(manifest.languages),
            manifest.deployment,
            json.dumps(manifest.current_goals),
            json.dumps(manifest.open_issues),
            manifest.created_at.isoformat(),
        ))
        self.conn.commit()
        return manifest.project_id
    
    def get_project(self, project_id: str) -> Optional[ProjectManifest]:
        """Get project by ID."""
        cursor = self.conn.cursor()
        cursor.execute("SELECT * FROM projects WHERE id = ?", (project_id,))
        row = cursor.fetchone()
        
        if not row:
            return None
        
        return ProjectManifest(
            project_id=row["id"],
            name=row["name"],
            description=row["description"],
            frameworks=json.loads(row["frameworks"] or "[]"),
            languages=json.loads(row["languages"] or "[]"),
            deployment=row["deployment"],
            architecture_summary=row["architecture_summary"],
            current_goals=json.loads(row["current_goals"] or "[]"),
            open_issues=json.loads(row["open_issues"] or "[]"),
            created_at=datetime.fromisoformat(row["created_at"]),
            last_session=datetime.fromisoformat(row["last_session"]) if row["last_session"] else None,
            total_sessions=row["total_sessions"],
        )
    
    def update_project(self, manifest: ProjectManifest) -> None:
        """Update existing project."""
        cursor = self.conn.cursor()
        cursor.execute("""
            UPDATE projects SET
                name = ?,
                description = ?,
                frameworks = ?,
                languages = ?,
                deployment = ?,
                architecture_summary = ?,
                current_goals = ?,
                open_issues = ?,
                last_session = ?,
                total_sessions = ?
            WHERE id = ?
        """, (
            manifest.name,
            manifest.description,
            json.dumps(manifest.frameworks),
            json.dumps(manifest.languages),
            manifest.deployment,
            manifest.architecture_summary,
            json.dumps(manifest.current_goals),
            json.dumps(manifest.open_issues),
            manifest.last_session.isoformat() if manifest.last_session else None,
            manifest.total_sessions,
            manifest.project_id,
        ))
        self.conn.commit()
    
    def find_project_by_name(self, name: str) -> Optional[ProjectManifest]:
        """Find project by name (fuzzy match)."""
        cursor = self.conn.cursor()
        cursor.execute(
            "SELECT * FROM projects WHERE name LIKE ? ORDER BY last_session DESC LIMIT 1",
            (f"%{name}%",)
        )
        row = cursor.fetchone()
        if row:
            return self.get_project(row["id"])
        return None
    
    def list_projects(self, limit: int = 10) -> List[ProjectManifest]:
        """List recent projects."""
        cursor = self.conn.cursor()
        cursor.execute(
            "SELECT id FROM projects ORDER BY last_session DESC NULLS LAST LIMIT ?",
            (limit,)
        )
        return [self.get_project(row["id"]) for row in cursor.fetchall()]
    
    # =========== Memory Operations ===========
    
    def store_memory(self, project_id: str, memory: SpawnerMemory) -> str:
        """Store a memory with embedding."""
        import uuid
        memory_id = str(uuid.uuid4())
        
        # Store metadata in SQLite
        cursor = self.conn.cursor()
        cursor.execute("""
            INSERT INTO memories (
                id, project_id, content, memory_type, importance_weight,
                semantic_tags, trigger_phrases, decision, reasoning,
                alternatives_considered, issue_status, resolution,
                validation_type, files_validated, created_at, valid_until
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            memory_id,
            project_id,
            memory.content,
            memory.memory_type.value,
            memory.importance_weight,
            json.dumps(memory.semantic_tags),
            json.dumps(memory.trigger_phrases),
            memory.decision,
            memory.reasoning,
            json.dumps(memory.alternatives_considered) if memory.alternatives_considered else None,
            memory.issue_status,
            memory.resolution,
            memory.validation_type,
            json.dumps(memory.files_validated) if memory.files_validated else None,
            memory.created_at.isoformat(),
            memory.valid_until.isoformat() if memory.valid_until else None,
        ))
        self.conn.commit()
        
        # Store embedding in ChromaDB
        embedding = get_embedding(memory.content)
        self.collection.add(
            ids=[memory_id],
            embeddings=[embedding],
            metadatas=[{
                "project_id": project_id,
                "memory_type": memory.memory_type.value,
                "importance": memory.importance_weight,
                "tags": ",".join(memory.semantic_tags),
            }],
            documents=[memory.content],
        )
        
        return memory_id
    
    def search_memories(
        self,
        project_id: str,
        query: str,
        memory_types: Optional[List[SpawnerMemoryType]] = None,
        limit: int = 10,
        min_importance: float = 0.0,
    ) -> List[SpawnerMemory]:
        """Search memories by semantic similarity."""
        
        # Build ChromaDB filter
        where_filter = {"project_id": project_id}
        if memory_types:
            where_filter["memory_type"] = {"$in": [t.value for t in memory_types]}
        if min_importance > 0:
            where_filter["importance"] = {"$gte": min_importance}
        
        # Query ChromaDB
        query_embedding = get_embedding(query)
        results = self.collection.query(
            query_embeddings=[query_embedding],
            where=where_filter,
            n_results=limit,
            include=["metadatas", "documents", "distances"],
        )
        
        # Fetch full memories from SQLite
        memories = []
        for memory_id in results["ids"][0]:
            memory = self.get_memory(memory_id)
            if memory:
                memories.append(memory)
        
        return memories
    
    def get_memory(self, memory_id: str) -> Optional[SpawnerMemory]:
        """Get memory by ID."""
        cursor = self.conn.cursor()
        cursor.execute("SELECT * FROM memories WHERE id = ?", (memory_id,))
        row = cursor.fetchone()
        
        if not row:
            return None
        
        # Update access stats
        cursor.execute("""
            UPDATE memories SET last_accessed = ?, access_count = access_count + 1
            WHERE id = ?
        """, (datetime.utcnow().isoformat(), memory_id))
        self.conn.commit()
        
        return SpawnerMemory(
            content=row["content"],
            memory_type=SpawnerMemoryType(row["memory_type"]),
            importance_weight=row["importance_weight"],
            semantic_tags=json.loads(row["semantic_tags"] or "[]"),
            trigger_phrases=json.loads(row["trigger_phrases"] or "[]"),
            project_id=row["project_id"],
            decision=row["decision"],
            reasoning=row["reasoning"],
            alternatives_considered=json.loads(row["alternatives_considered"]) if row["alternatives_considered"] else None,
            issue_status=row["issue_status"],
            resolution=row["resolution"],
            validation_type=row["validation_type"],
            files_validated=json.loads(row["files_validated"]) if row["files_validated"] else None,
            created_at=datetime.fromisoformat(row["created_at"]),
            valid_until=datetime.fromisoformat(row["valid_until"]) if row["valid_until"] else None,
        )
    
    def get_memories_by_type(
        self,
        project_id: str,
        memory_type: SpawnerMemoryType,
        limit: int = 20,
    ) -> List[SpawnerMemory]:
        """Get all memories of a specific type."""
        cursor = self.conn.cursor()
        cursor.execute("""
            SELECT id FROM memories 
            WHERE project_id = ? AND memory_type = ?
            ORDER BY importance_weight DESC, created_at DESC
            LIMIT ?
        """, (project_id, memory_type.value, limit))
        
        return [self.get_memory(row["id"]) for row in cursor.fetchall()]
    
    def get_recent_memories(
        self,
        project_id: str,
        limit: int = 20,
    ) -> List[SpawnerMemory]:
        """Get most recent memories."""
        cursor = self.conn.cursor()
        cursor.execute("""
            SELECT id FROM memories 
            WHERE project_id = ?
            ORDER BY created_at DESC
            LIMIT ?
        """, (project_id, limit))
        
        return [self.get_memory(row["id"]) for row in cursor.fetchall()]
    
    def delete_memory(self, memory_id: str) -> bool:
        """Delete a memory."""
        cursor = self.conn.cursor()
        cursor.execute("DELETE FROM memories WHERE id = ?", (memory_id,))
        self.conn.commit()
        
        # Also remove from ChromaDB
        try:
            self.collection.delete(ids=[memory_id])
        except:
            pass  # May not exist in ChromaDB
        
        return cursor.rowcount > 0
    
    # =========== Session Operations ===========
    
    def create_session(self, project_id: str) -> str:
        """Create a new session."""
        import uuid
        session_id = str(uuid.uuid4())
        
        cursor = self.conn.cursor()
        cursor.execute("""
            INSERT INTO sessions (id, project_id, started_at)
            VALUES (?, ?, ?)
        """, (session_id, project_id, datetime.utcnow().isoformat()))
        
        # Update project session count
        cursor.execute("""
            UPDATE projects SET 
                total_sessions = total_sessions + 1,
                last_session = ?
            WHERE id = ?
        """, (datetime.utcnow().isoformat(), project_id))
        
        self.conn.commit()
        return session_id
    
    def end_session(
        self,
        session_id: str,
        summary: str,
        memories_created: int = 0,
    ) -> None:
        """End a session with summary."""
        cursor = self.conn.cursor()
        cursor.execute("""
            UPDATE sessions SET
                summary = ?,
                ended_at = ?,
                memories_created = ?
            WHERE id = ?
        """, (summary, datetime.utcnow().isoformat(), memories_created, session_id))
        self.conn.commit()
    
    def get_last_session(self, project_id: str) -> Optional[Dict[str, Any]]:
        """Get the last session for a project."""
        cursor = self.conn.cursor()
        cursor.execute("""
            SELECT * FROM sessions 
            WHERE project_id = ? AND ended_at IS NOT NULL
            ORDER BY ended_at DESC
            LIMIT 1
        """, (project_id,))
        row = cursor.fetchone()
        
        if not row:
            return None
        
        return dict(row)
    
    # =========== Maintenance Operations ===========
    
    def decay_memories(self, project_id: str, decay_factor: float = 0.95) -> int:
        """
        Apply decay to old, unused memories.
        Reduces importance of memories that haven't been accessed recently.
        """
        cursor = self.conn.cursor()
        
        # Decay memories not accessed in 30+ days
        thirty_days_ago = (datetime.utcnow() - timedelta(days=30)).isoformat()
        
        cursor.execute("""
            UPDATE memories SET
                importance_weight = importance_weight * ?
            WHERE project_id = ? 
                AND (last_accessed IS NULL OR last_accessed < ?)
                AND importance_weight > 0.1
        """, (decay_factor, project_id, thirty_days_ago))
        
        self.conn.commit()
        return cursor.rowcount
    
    def cleanup_expired_memories(self, project_id: str) -> int:
        """Remove memories past their valid_until date."""
        cursor = self.conn.cursor()
        now = datetime.utcnow().isoformat()
        
        # Get IDs to delete from ChromaDB too
        cursor.execute("""
            SELECT id FROM memories 
            WHERE project_id = ? AND valid_until IS NOT NULL AND valid_until < ?
        """, (project_id, now))
        ids_to_delete = [row["id"] for row in cursor.fetchall()]
        
        # Delete from SQLite
        cursor.execute("""
            DELETE FROM memories 
            WHERE project_id = ? AND valid_until IS NOT NULL AND valid_until < ?
        """, (project_id, now))
        self.conn.commit()
        
        # Delete from ChromaDB
        if ids_to_delete:
            try:
                self.collection.delete(ids=ids_to_delete)
            except:
                pass
        
        return len(ids_to_delete)
    
    def get_storage_stats(self, project_id: str) -> Dict[str, Any]:
        """Get storage statistics for a project."""
        cursor = self.conn.cursor()
        
        cursor.execute("""
            SELECT 
                COUNT(*) as total_memories,
                AVG(importance_weight) as avg_importance,
                COUNT(DISTINCT memory_type) as memory_types_used
            FROM memories WHERE project_id = ?
        """, (project_id,))
        row = cursor.fetchone()
        
        cursor.execute("""
            SELECT memory_type, COUNT(*) as count
            FROM memories WHERE project_id = ?
            GROUP BY memory_type
        """, (project_id,))
        type_counts = {r["memory_type"]: r["count"] for r in cursor.fetchall()}
        
        return {
            "total_memories": row["total_memories"],
            "avg_importance": row["avg_importance"],
            "memory_types_used": row["memory_types_used"],
            "by_type": type_counts,
        }


from datetime import timedelta
```

Create `python/memory_engine/embeddings.py`:

```python
"""
Local embedding generation using sentence-transformers.
No API keys required - runs entirely on your machine.
"""

from typing import List, Optional
from functools import lru_cache
import numpy as np

# Lazy load to avoid slow imports on startup
_model = None


def _get_model():
    """Lazy load the embedding model."""
    global _model
    if _model is None:
        from sentence_transformers import SentenceTransformer
        # This model is fast, small, and good for semantic search
        _model = SentenceTransformer('all-MiniLM-L6-v2')
    return _model


def get_embedding(text: str) -> List[float]:
    """
    Generate embedding for text using local model.
    
    Returns 384-dimensional vector.
    """
    model = _get_model()
    embedding = model.encode(text, convert_to_numpy=True)
    return embedding.tolist()


def get_embeddings_batch(texts: List[str]) -> List[List[float]]:
    """Generate embeddings for multiple texts efficiently."""
    model = _get_model()
    embeddings = model.encode(texts, convert_to_numpy=True, batch_size=32)
    return embeddings.tolist()


def cosine_similarity(a: List[float], b: List[float]) -> float:
    """Calculate cosine similarity between two vectors."""
    a = np.array(a)
    b = np.array(b)
    return np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b))


@lru_cache(maxsize=1000)
def get_embedding_cached(text: str) -> tuple:
    """Cached version for repeated queries."""
    return tuple(get_embedding(text))
```

Create `python/memory_engine/local_curator.py`:

```python
"""
Local curation without API keys.
Uses rule-based extraction instead of LLM analysis.
"""

import re
from typing import List, Dict, Any, Optional
from datetime import datetime

from .spawner_types import SpawnerMemory, SpawnerMemoryType, DEFAULT_IMPORTANCE


class LocalCurator:
    """
    Rule-based memory curation.
    No API keys required - runs entirely locally.
    Less sophisticated than AI curation, but free and private.
    """
    
    # Patterns that indicate valuable content
    DECISION_PATTERNS = [
        r"(?:we|I|let's)\s+(?:chose|decided|picked|went with|selected)\s+(.+?)(?:because|since|for|due to)",
        r"(?:using|use|chose)\s+(\w+)\s+(?:instead of|over|rather than)\s+(\w+)",
        r"the\s+(?:approach|solution|strategy|architecture)\s+(?:is|will be)\s+(.+)",
    ]
    
    ISSUE_PATTERNS = [
        r"(?:bug|issue|problem|error|failing|broken|doesn't work|not working)[:.\s]+(.+)",
        r"(?:getting|seeing|having)\s+(?:an?\s+)?(?:error|issue|problem)\s+(?:with|when|where)\s+(.+)",
        r"(?:TODO|FIXME|BUG|HACK)[:.\s]+(.+)",
    ]
    
    SHARP_EDGE_PATTERNS = [
        r"(?:gotcha|watch out|be careful|heads up|note that|important)[:.\s]+(.+)",
        r"(?:turns out|apparently|actually)\s+(.+?)(?:doesn't|won't|can't|isn't)",
        r"(?:workaround|fix|solution)\s+(?:is|was)\s+to\s+(.+)",
        r"(?:spent|wasted)\s+(?:\d+\s+)?(?:hours?|time)\s+(?:on|figuring out|debugging)\s+(.+)",
    ]
    
    GOAL_PATTERNS = [
        r"(?:let's|we need to|goal is to|working on|building|implementing)\s+(.+)",
        r"(?:next|today|now)\s+(?:we|I)\s+(?:will|should|need to)\s+(.+)",
    ]
    
    TECH_STACK_PATTERNS = [
        r"using\s+(next\.?js|react|vue|angular|svelte|supabase|firebase|prisma|drizzle)",
        r"(?:stack|tech|framework)[:.\s]+(.+)",
        r"(?:deployed?|hosting)\s+(?:on|to|with)\s+(vercel|netlify|railway|aws|gcp)",
    ]
    
    def __init__(self):
        self.compiled_patterns = {
            "decision": [re.compile(p, re.IGNORECASE) for p in self.DECISION_PATTERNS],
            "issue": [re.compile(p, re.IGNORECASE) for p in self.ISSUE_PATTERNS],
            "sharp_edge": [re.compile(p, re.IGNORECASE) for p in self.SHARP_EDGE_PATTERNS],
            "goal": [re.compile(p, re.IGNORECASE) for p in self.GOAL_PATTERNS],
            "tech_stack": [re.compile(p, re.IGNORECASE) for p in self.TECH_STACK_PATTERNS],
        }
    
    def curate_transcript(
        self,
        transcript: str,
        project_id: str,
    ) -> Dict[str, Any]:
        """
        Extract memories from session transcript using pattern matching.
        
        Returns:
            {
                "memories": List[SpawnerMemory],
                "session_summary": str,
                "project_updates": dict
            }
        """
        memories = []
        goals_found = []
        issues_found = []
        
        # Split into lines/sentences for analysis
        lines = transcript.split('\n')
        
        for line in lines:
            line = line.strip()
            if not line or len(line) < 20:
                continue
            
            # Check for decisions
            for pattern in self.compiled_patterns["decision"]:
                match = pattern.search(line)
                if match:
                    content = self._clean_match(match.group(0))
                    memories.append(SpawnerMemory(
                        content=content,
                        memory_type=SpawnerMemoryType.ARCHITECTURE_DECISION,
                        importance_weight=DEFAULT_IMPORTANCE[SpawnerMemoryType.ARCHITECTURE_DECISION],
                        semantic_tags=self._extract_tags(content),
                        trigger_phrases=self._extract_triggers(content),
                        project_id=project_id,
                    ))
                    break
            
            # Check for issues
            for pattern in self.compiled_patterns["issue"]:
                match = pattern.search(line)
                if match:
                    content = self._clean_match(match.group(0))
                    issues_found.append(content)
                    memories.append(SpawnerMemory(
                        content=content,
                        memory_type=SpawnerMemoryType.KNOWN_ISSUE,
                        importance_weight=DEFAULT_IMPORTANCE[SpawnerMemoryType.KNOWN_ISSUE],
                        semantic_tags=self._extract_tags(content),
                        trigger_phrases=self._extract_triggers(content),
                        project_id=project_id,
                        issue_status="open",
                    ))
                    break
            
            # Check for sharp edges
            for pattern in self.compiled_patterns["sharp_edge"]:
                match = pattern.search(line)
                if match:
                    content = self._clean_match(match.group(0))
                    memories.append(SpawnerMemory(
                        content=content,
                        memory_type=SpawnerMemoryType.SHARP_EDGE_HIT,
                        importance_weight=DEFAULT_IMPORTANCE[SpawnerMemoryType.SHARP_EDGE_HIT],
                        semantic_tags=self._extract_tags(content),
                        trigger_phrases=self._extract_triggers(content),
                        project_id=project_id,
                    ))
                    break
            
            # Check for goals
            for pattern in self.compiled_patterns["goal"]:
                match = pattern.search(line)
                if match:
                    content = self._clean_match(match.group(1) if match.lastindex else match.group(0))
                    goals_found.append(content)
                    break
            
            # Check for tech stack mentions
            for pattern in self.compiled_patterns["tech_stack"]:
                match = pattern.search(line)
                if match:
                    tech = match.group(1).lower()
                    memories.append(SpawnerMemory(
                        content=f"Using {tech} in the stack",
                        memory_type=SpawnerMemoryType.TECH_STACK,
                        importance_weight=DEFAULT_IMPORTANCE[SpawnerMemoryType.TECH_STACK],
                        semantic_tags=[tech, "stack", "framework"],
                        trigger_phrases=[tech, "tech stack", "what are we using"],
                        project_id=project_id,
                    ))
                    break
        
        # Generate session summary
        summary = self._generate_summary(memories, goals_found, issues_found)
        
        # Deduplicate memories
        memories = self._deduplicate(memories)
        
        return {
            "memories": memories,
            "session_summary": summary,
            "project_updates": {
                "current_goals": goals_found[:5],  # Limit to 5
                "open_issues": [i for i in issues_found[:5]],
            }
        }
    
    def _clean_match(self, text: str) -> str:
        """Clean up matched text."""
        # Remove extra whitespace
        text = ' '.join(text.split())
        # Capitalize first letter
        text = text[0].upper() + text[1:] if text else text
        # Ensure ends with period
        if text and text[-1] not in '.!?':
            text += '.'
        return text
    
    def _extract_tags(self, content: str) -> List[str]:
        """Extract semantic tags from content."""
        # Common tech terms to look for
        tech_terms = [
            "next", "nextjs", "react", "vue", "angular", "svelte",
            "supabase", "firebase", "prisma", "drizzle", "postgres",
            "auth", "authentication", "api", "webhook", "stripe",
            "vercel", "netlify", "railway", "docker", "kubernetes",
            "typescript", "javascript", "python", "rust", "go",
        ]
        
        content_lower = content.lower()
        tags = [term for term in tech_terms if term in content_lower]
        
        # Add generic category tags
        if any(word in content_lower for word in ["error", "bug", "issue", "problem"]):
            tags.append("issue")
        if any(word in content_lower for word in ["chose", "decided", "using", "picked"]):
            tags.append("decision")
        if any(word in content_lower for word in ["gotcha", "workaround", "careful"]):
            tags.append("gotcha")
        
        return tags[:10]  # Limit tags
    
    def _extract_triggers(self, content: str) -> List[str]:
        """Extract trigger phrases for retrieval."""
        # Take key noun phrases that might trigger this memory
        triggers = []
        
        # Simple extraction: 2-3 word phrases with nouns
        words = content.lower().split()
        for i in range(len(words) - 1):
            phrase = f"{words[i]} {words[i+1]}"
            if len(phrase) > 5 and not phrase.startswith(("the ", "a ", "an ", "to ", "is ")):
                triggers.append(phrase)
        
        return triggers[:5]
    
    def _generate_summary(
        self,
        memories: List[SpawnerMemory],
        goals: List[str],
        issues: List[str],
    ) -> str:
        """Generate a simple session summary."""
        parts = []
        
        # Count by type
        decisions = [m for m in memories if m.memory_type == SpawnerMemoryType.ARCHITECTURE_DECISION]
        sharp_edges = [m for m in memories if m.memory_type == SpawnerMemoryType.SHARP_EDGE_HIT]
        
        if decisions:
            parts.append(f"Made {len(decisions)} architecture decision(s)")
        if sharp_edges:
            parts.append(f"encountered {len(sharp_edges)} gotcha(s)")
        if issues:
            parts.append(f"identified {len(issues)} issue(s)")
        if goals:
            parts.append(f"working toward: {goals[0]}")
        
        if parts:
            return "Session: " + ", ".join(parts) + "."
        else:
            return "Session completed with no significant memories extracted."
    
    def _deduplicate(self, memories: List[SpawnerMemory]) -> List[SpawnerMemory]:
        """Remove duplicate or very similar memories."""
        seen_content = set()
        unique = []
        
        for memory in memories:
            # Normalize for comparison
            normalized = memory.content.lower().strip()
            
            # Skip if we've seen something very similar
            is_duplicate = False
            for seen in seen_content:
                if self._similarity(normalized, seen) > 0.8:
                    is_duplicate = True
                    break
            
            if not is_duplicate:
                seen_content.add(normalized)
                unique.append(memory)
        
        return unique
    
    def _similarity(self, a: str, b: str) -> float:
        """Simple word overlap similarity."""
        words_a = set(a.split())
        words_b = set(b.split())
        
        if not words_a or not words_b:
            return 0.0
        
        intersection = words_a & words_b
        union = words_a | words_b
        
        return len(intersection) / len(union)
```

### Step 7: Add Remote Memory Support

Create `python/memory_engine/remote_storage.py`:

```python
"""
Remote storage backend for users who want cloud-synced memory.
Supports multiple providers with user's own API keys.
"""

import os
import json
import httpx
from abc import ABC, abstractmethod
from typing import List, Optional, Dict, Any
from datetime import datetime

from .spawner_types import SpawnerMemory, ProjectManifest


class RemoteStorageBackend(ABC):
    """Abstract base for remote storage providers."""
    
    @abstractmethod
    async def store_memory(self, project_id: str, memory: SpawnerMemory) -> str:
        """Store a memory, return its ID."""
        pass
    
    @abstractmethod
    async def search_memories(
        self, 
        project_id: str, 
        query: str, 
        limit: int = 10
    ) -> List[SpawnerMemory]:
        """Search memories by semantic similarity."""
        pass
    
    @abstractmethod
    async def get_project(self, project_id: str) -> Optional[ProjectManifest]:
        """Get project manifest."""
        pass
    
    @abstractmethod
    async def update_project(self, manifest: ProjectManifest) -> None:
        """Update project manifest."""
        pass


class CloudflareStorageBackend(RemoteStorageBackend):
    """
    Cloudflare Workers + D1 + Vectorize backend.
    
    User provides:
    - CLOUDFLARE_ACCOUNT_ID
    - CLOUDFLARE_API_TOKEN
    - CLOUDFLARE_D1_DATABASE_ID
    - CLOUDFLARE_VECTORIZE_INDEX_NAME
    """
    
    def __init__(
        self,
        account_id: str,
        api_token: str,
        d1_database_id: str,
        vectorize_index: str,
    ):
        self.account_id = account_id
        self.api_token = api_token
        self.d1_database_id = d1_database_id
        self.vectorize_index = vectorize_index
        self.base_url = f"https://api.cloudflare.com/client/v4/accounts/{account_id}"
        self.headers = {
            "Authorization": f"Bearer {api_token}",
            "Content-Type": "application/json",
        }
    
    async def store_memory(self, project_id: str, memory: SpawnerMemory) -> str:
        """Store memory in D1 and vector in Vectorize."""
        memory_id = f"{project_id}_{datetime.utcnow().timestamp()}"
        
        async with httpx.AsyncClient() as client:
            # Store metadata in D1
            d1_response = await client.post(
                f"{self.base_url}/d1/database/{self.d1_database_id}/query",
                headers=self.headers,
                json={
                    "sql": """
                        INSERT INTO memories (id, project_id, content, memory_type, importance, metadata, created_at)
                        VALUES (?, ?, ?, ?, ?, ?, ?)
                    """,
                    "params": [
                        memory_id,
                        project_id,
                        memory.content,
                        memory.memory_type.value,
                        memory.importance_weight,
                        json.dumps(memory.dict()),
                        memory.created_at.isoformat(),
                    ]
                }
            )
            
            # Store vector in Vectorize
            # Note: You'd need to generate embedding first
            # This is simplified - real implementation would call embedding API
            
        return memory_id
    
    async def search_memories(
        self, 
        project_id: str, 
        query: str, 
        limit: int = 10
    ) -> List[SpawnerMemory]:
        """Search using Vectorize semantic search."""
        async with httpx.AsyncClient() as client:
            # Query Vectorize
            response = await client.post(
                f"{self.base_url}/vectorize/indexes/{self.vectorize_index}/query",
                headers=self.headers,
                json={
                    "vector": await self._get_embedding(query),
                    "topK": limit,
                    "filter": {"project_id": project_id},
                    "returnMetadata": True,
                }
            )
            
            results = response.json().get("result", {}).get("matches", [])
            
            # Fetch full memories from D1
            memory_ids = [r["id"] for r in results]
            memories = await self._fetch_memories_by_ids(memory_ids)
            
            return memories
    
    async def _get_embedding(self, text: str) -> List[float]:
        """Get embedding using Workers AI or OpenAI."""
        # Implementation depends on user's preference
        # Could use Workers AI (free) or OpenAI (user's key)
        pass
    
    async def _fetch_memories_by_ids(self, ids: List[str]) -> List[SpawnerMemory]:
        """Fetch memories from D1 by IDs."""
        pass
    
    async def get_project(self, project_id: str) -> Optional[ProjectManifest]:
        """Get project from D1."""
        pass
    
    async def update_project(self, manifest: ProjectManifest) -> None:
        """Update project in D1."""
        pass


class SupabaseStorageBackend(RemoteStorageBackend):
    """
    Supabase backend for users who already have a Supabase project.
    
    User provides:
    - SUPABASE_URL
    - SUPABASE_SERVICE_KEY
    """
    
    def __init__(self, supabase_url: str, supabase_key: str):
        self.url = supabase_url
        self.key = supabase_key
        self.headers = {
            "apikey": supabase_key,
            "Authorization": f"Bearer {supabase_key}",
            "Content-Type": "application/json",
        }
    
    async def store_memory(self, project_id: str, memory: SpawnerMemory) -> str:
        """Store memory using Supabase's vector support (pgvector)."""
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{self.url}/rest/v1/spawner_memories",
                headers=self.headers,
                json={
                    "project_id": project_id,
                    "content": memory.content,
                    "memory_type": memory.memory_type.value,
                    "importance": memory.importance_weight,
                    "metadata": memory.dict(),
                    "embedding": await self._get_embedding(memory.content),
                }
            )
            return response.json().get("id")
    
    async def search_memories(
        self, 
        project_id: str, 
        query: str, 
        limit: int = 10
    ) -> List[SpawnerMemory]:
        """Search using Supabase's vector similarity search."""
        embedding = await self._get_embedding(query)
        
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{self.url}/rest/v1/rpc/search_memories",
                headers=self.headers,
                json={
                    "query_embedding": embedding,
                    "match_count": limit,
                    "filter_project_id": project_id,
                }
            )
            
            results = response.json()
            return [SpawnerMemory(**r["metadata"]) for r in results]
    
    async def _get_embedding(self, text: str) -> List[float]:
        """Get embedding - user can configure provider."""
        pass
    
    async def get_project(self, project_id: str) -> Optional[ProjectManifest]:
        pass
    
    async def update_project(self, manifest: ProjectManifest) -> None:
        pass


def get_storage_backend(config: Dict[str, Any]) -> RemoteStorageBackend:
    """Factory to create appropriate storage backend based on config."""
    
    provider = config.get("provider", "local")
    
    if provider == "cloudflare":
        return CloudflareStorageBackend(
            account_id=config["cloudflare_account_id"],
            api_token=config["cloudflare_api_token"],
            d1_database_id=config["cloudflare_d1_id"],
            vectorize_index=config["cloudflare_vectorize_index"],
        )
    
    elif provider == "supabase":
        return SupabaseStorageBackend(
            supabase_url=config["supabase_url"],
            supabase_key=config["supabase_key"],
        )
    
    else:
        # Default to local storage (original VibeMemo behavior)
        return None  # Use local ChromaDB + SQLite
```

### Step 7: Update Configuration

Update `python/memory_engine/config.py`:

```python
"""
Spawner Memory configuration.
Supports both local and remote storage backends.
"""

import os
from typing import Optional, Literal
from pydantic import BaseModel, Field


class StorageConfig(BaseModel):
    """Storage backend configuration."""
    
    provider: Literal["local", "cloudflare", "supabase"] = "local"
    
    # Local storage paths
    local_db_path: str = Field(default="./data/spawner_memory.db")
    local_chroma_path: str = Field(default="./data/chroma")
    
    # Cloudflare (user's own account)
    cloudflare_account_id: Optional[str] = None
    cloudflare_api_token: Optional[str] = None
    cloudflare_d1_id: Optional[str] = None
    cloudflare_vectorize_index: Optional[str] = None
    
    # Supabase (user's own project)
    supabase_url: Optional[str] = None
    supabase_key: Optional[str] = None


class EmbeddingConfig(BaseModel):
    """Embedding model configuration."""
    
    provider: Literal["local", "openai", "workers_ai"] = "local"
    
    # Local (sentence-transformers)
    local_model: str = "all-MiniLM-L6-v2"
    
    # OpenAI (user's key)
    openai_api_key: Optional[str] = None
    openai_model: str = "text-embedding-3-small"
    
    # Workers AI (via Cloudflare)
    workers_ai_model: str = "@cf/baai/bge-base-en-v1.5"


class CurationConfig(BaseModel):
    """Memory curation configuration."""
    
    # Which LLM to use for curation
    provider: Literal["claude", "openai", "local"] = "claude"
    
    # API keys (user provides)
    anthropic_api_key: Optional[str] = None
    openai_api_key: Optional[str] = None
    
    # Models
    claude_model: str = "claude-sonnet-4-20250514"
    openai_model: str = "gpt-4o-mini"
    
    # Curation behavior
    auto_curate_on_session_end: bool = True
    min_session_length_for_curation: int = 5  # messages
    
    
class SpawnerMemoryConfig(BaseModel):
    """Main configuration for Spawner Memory."""
    
    storage: StorageConfig = Field(default_factory=StorageConfig)
    embedding: EmbeddingConfig = Field(default_factory=EmbeddingConfig)
    curation: CurationConfig = Field(default_factory=CurationConfig)
    
    # Server
    host: str = "localhost"
    port: int = 8765
    
    # Memory retrieval
    max_memories_per_query: int = 5
    min_similarity_threshold: float = 0.3
    
    # Session primer
    include_session_primer: bool = True
    max_primer_length: int = 1000  # tokens
    
    @classmethod
    def from_env(cls) -> "SpawnerMemoryConfig":
        """Load configuration from environment variables."""
        return cls(
            storage=StorageConfig(
                provider=os.getenv("SPAWNER_MEMORY_PROVIDER", "local"),
                cloudflare_account_id=os.getenv("CLOUDFLARE_ACCOUNT_ID"),
                cloudflare_api_token=os.getenv("CLOUDFLARE_API_TOKEN"),
                cloudflare_d1_id=os.getenv("CLOUDFLARE_D1_ID"),
                cloudflare_vectorize_index=os.getenv("CLOUDFLARE_VECTORIZE_INDEX"),
                supabase_url=os.getenv("SUPABASE_URL"),
                supabase_key=os.getenv("SUPABASE_SERVICE_KEY"),
            ),
            embedding=EmbeddingConfig(
                provider=os.getenv("SPAWNER_EMBEDDING_PROVIDER", "local"),
                openai_api_key=os.getenv("OPENAI_API_KEY"),
            ),
            curation=CurationConfig(
                provider=os.getenv("SPAWNER_CURATION_PROVIDER", "claude"),
                anthropic_api_key=os.getenv("ANTHROPIC_API_KEY"),
                openai_api_key=os.getenv("OPENAI_API_KEY"),
            ),
        )
```

---

## Part 3: Main Memory Engine

### Step 8: Create the Main Engine

Create `python/memory_engine/engine.py`:

```python
"""
Main Spawner Memory Engine.
Coordinates storage, curation, and retrieval.
Defaults to local storage - no API keys required.
"""

import os
from typing import List, Optional, Dict, Any
from datetime import datetime
import logging

from .config import SpawnerMemoryConfig
from .spawner_types import SpawnerMemory, SpawnerMemoryType, ProjectManifest, DEFAULT_IMPORTANCE
from .local_storage import LocalSpawnerStorage
from .local_curator import LocalCurator
from .spawner_curator import generate_session_primer, SPAWNER_CURATION_SYSTEM_PROMPT

logger = logging.getLogger(__name__)


class SpawnerMemoryEngine:
    """
    Main entry point for Spawner Memory.
    
    Usage:
        engine = SpawnerMemoryEngine()  # Uses local storage by default
        
        # Start session
        primer = await engine.start_session(project_id="my-project")
        
        # Search memories
        memories = await engine.search("authentication setup")
        
        # Add memory
        await engine.add_memory(
            content="Using JWT tokens with 24h expiry",
            memory_type=SpawnerMemoryType.ARCHITECTURE_DECISION
        )
        
        # End session
        await engine.end_session(summary="Implemented auth flow")
    """
    
    def __init__(self, config: Optional[SpawnerMemoryConfig] = None):
        self.config = config or SpawnerMemoryConfig.from_env()
        
        # Initialize storage (local by default)
        if self.config.storage.provider == "local":
            self.storage = LocalSpawnerStorage(
                db_path=self.config.storage.local_db_path,
                chroma_path=self.config.storage.local_chroma_path,
            )
        else:
            # Remote storage - import only if needed
            from .remote_storage import get_storage_backend
            self.storage = get_storage_backend(self.config.storage.dict())
        
        # Initialize curator (local/rule-based by default)
        if self.config.curation.provider == "local":
            self.curator = LocalCurator()
            self.ai_curator = None
        else:
            self.curator = LocalCurator()  # Fallback
            self._init_ai_curator()
        
        # Session state
        self.current_project_id: Optional[str] = None
        self.current_session_id: Optional[str] = None
        self.session_messages: List[Dict[str, str]] = []
    
    def _init_ai_curator(self):
        """Initialize AI curator if API keys available."""
        if self.config.curation.provider == "claude":
            if self.config.curation.anthropic_api_key:
                from anthropic import Anthropic
                self.ai_client = Anthropic(api_key=self.config.curation.anthropic_api_key)
                self.ai_curator = "claude"
            else:
                logger.warning("Claude curation requested but no API key. Falling back to local.")
                self.ai_curator = None
                
        elif self.config.curation.provider == "openai":
            if self.config.curation.openai_api_key:
                from openai import OpenAI
                self.ai_client = OpenAI(api_key=self.config.curation.openai_api_key)
                self.ai_curator = "openai"
            else:
                logger.warning("OpenAI curation requested but no API key. Falling back to local.")
                self.ai_curator = None
    
    # =========== Session Management ===========
    
    async def start_session(
        self,
        project_id: Optional[str] = None,
        project_name: Optional[str] = None,
        project_description: Optional[str] = None,
    ) -> str:
        """
        Start a new session.
        
        Returns session primer with project context.
        """
        # Find or create project
        if project_id:
            project = self.storage.get_project(project_id)
        elif project_name:
            project = self.storage.find_project_by_name(project_name)
        else:
            project = None
        
        # Create new project if needed
        if not project:
            import uuid
            project_id = project_id or str(uuid.uuid4())[:8]
            project = ProjectManifest(
                project_id=project_id,
                name=project_name or f"Project {project_id}",
                description=project_description,
            )
            self.storage.create_project(project)
            logger.info(f"Created new project: {project.name}")
        
        # Start session
        self.current_project_id = project.project_id
        self.current_session_id = self.storage.create_session(project.project_id)
        self.session_messages = []
        
        # Generate session primer
        recent_memories = self.storage.get_recent_memories(project.project_id, limit=20)
        last_session = self.storage.get_last_session(project.project_id)
        
        # Convert last session dict to memory-like object for primer
        last_session_memory = None
        if last_session:
            last_session_memory = type('obj', (object,), {
                'created_at': datetime.fromisoformat(last_session['ended_at']),
                'content': last_session.get('summary', 'No summary available.')
            })()
        
        primer = generate_session_primer(project, recent_memories, last_session_memory)
        
        return primer
    
    async def end_session(
        self,
        summary: Optional[str] = None,
        transcript: Optional[str] = None,
    ) -> str:
        """
        End the current session.
        
        Triggers memory curation from transcript.
        """
        if not self.current_session_id:
            return "No active session to end."
        
        memories_created = 0
        
        # Build transcript from session messages if not provided
        if not transcript and self.session_messages:
            transcript = "\n".join(
                f"{msg['role']}: {msg['content']}"
                for msg in self.session_messages
            )
        
        # Curate memories from transcript
        if transcript:
            if self.ai_curator:
                curation_result = await self._ai_curate(transcript)
            else:
                curation_result = self.curator.curate_transcript(
                    transcript, self.current_project_id
                )
            
            # Store extracted memories
            for memory in curation_result.get("memories", []):
                self.storage.store_memory(self.current_project_id, memory)
                memories_created += 1
            
            # Update project with goals/issues
            updates = curation_result.get("project_updates", {})
            if updates:
                project = self.storage.get_project(self.current_project_id)
                if updates.get("current_goals"):
                    project.current_goals = updates["current_goals"]
                if updates.get("open_issues"):
                    project.open_issues = list(set(project.open_issues + updates["open_issues"]))
                self.storage.update_project(project)
            
            # Use generated summary if not provided
            summary = summary or curation_result.get("session_summary", "Session ended.")
        
        # End session in storage
        self.storage.end_session(
            self.current_session_id,
            summary=summary or "Session ended.",
            memories_created=memories_created,
        )
        
        result = f"Session ended. {memories_created} memories created."
        
        # Reset state
        self.current_session_id = None
        self.session_messages = []
        
        return result
    
    async def _ai_curate(self, transcript: str) -> Dict[str, Any]:
        """Use AI to curate memories from transcript."""
        import json
        
        prompt = f"""Analyze this coding session transcript and extract valuable memories.

<transcript>
{transcript}
</transcript>

Return a JSON object with:
- memories: array of memory objects
- session_summary: one paragraph summary
- project_updates: {{current_goals: [...], open_issues: [...]}}

Each memory should have: content, memory_type, importance_weight, semantic_tags, trigger_phrases, reasoning"""

        try:
            if self.ai_curator == "claude":
                response = self.ai_client.messages.create(
                    model=self.config.curation.claude_model,
                    max_tokens=4096,
                    system=SPAWNER_CURATION_SYSTEM_PROMPT,
                    messages=[{"role": "user", "content": prompt}]
                )
                result_text = response.content[0].text
                
            elif self.ai_curator == "openai":
                response = self.ai_client.chat.completions.create(
                    model=self.config.curation.openai_model,
                    messages=[
                        {"role": "system", "content": SPAWNER_CURATION_SYSTEM_PROMPT},
                        {"role": "user", "content": prompt}
                    ]
                )
                result_text = response.choices[0].message.content
            
            # Parse JSON from response
            # Handle potential markdown code blocks
            if "```json" in result_text:
                result_text = result_text.split("```json")[1].split("```")[0]
            elif "```" in result_text:
                result_text = result_text.split("```")[1].split("```")[0]
            
            result = json.loads(result_text)
            
            # Convert to SpawnerMemory objects
            memories = []
            for m in result.get("memories", []):
                memories.append(SpawnerMemory(
                    content=m["content"],
                    memory_type=SpawnerMemoryType(m["memory_type"]),
                    importance_weight=m.get("importance_weight", 0.5),
                    semantic_tags=m.get("semantic_tags", []),
                    trigger_phrases=m.get("trigger_phrases", []),
                    project_id=self.current_project_id,
                    reasoning=m.get("reasoning"),
                ))
            
            return {
                "memories": memories,
                "session_summary": result.get("session_summary", ""),
                "project_updates": result.get("project_updates", {}),
            }
            
        except Exception as e:
            logger.error(f"AI curation failed: {e}. Falling back to local.")
            return self.curator.curate_transcript(transcript, self.current_project_id)
    
    # =========== Memory Operations ===========
    
    async def search(
        self,
        query: str,
        memory_types: Optional[List[SpawnerMemoryType]] = None,
        limit: int = 5,
    ) -> List[SpawnerMemory]:
        """Search for relevant memories."""
        if not self.current_project_id:
            return []
        
        return self.storage.search_memories(
            project_id=self.current_project_id,
            query=query,
            memory_types=memory_types,
            limit=limit,
        )
    
    async def add_memory(
        self,
        content: str,
        memory_type: SpawnerMemoryType,
        importance: Optional[float] = None,
        tags: Optional[List[str]] = None,
        **kwargs,
    ) -> str:
        """Add a memory to the current project."""
        if not self.current_project_id:
            raise ValueError("No active session. Call start_session first.")
        
        memory = SpawnerMemory(
            content=content,
            memory_type=memory_type,
            importance_weight=importance or DEFAULT_IMPORTANCE.get(memory_type, 0.5),
            semantic_tags=tags or [],
            project_id=self.current_project_id,
            **kwargs,
        )
        
        memory_id = self.storage.store_memory(self.current_project_id, memory)
        return memory_id
    
    async def get_context(
        self,
        include_decisions: bool = True,
        include_sharp_edges: bool = True,
        include_issues: bool = True,
    ) -> str:
        """Get full context for current project."""
        if not self.current_project_id:
            return "No active project."
        
        project = self.storage.get_project(self.current_project_id)
        if not project:
            return "Project not found."
        
        parts = [f"# {project.name}\n"]
        
        if project.description:
            parts.append(f"{project.description}\n")
        
        if project.frameworks or project.languages:
            stack = ", ".join(project.frameworks + project.languages)
            parts.append(f"**Stack:** {stack}\n")
        
        if include_decisions:
            decisions = self.storage.get_memories_by_type(
                self.current_project_id,
                SpawnerMemoryType.ARCHITECTURE_DECISION,
                limit=10,
            )
            if decisions:
                parts.append("\n## Architecture Decisions")
                for d in decisions:
                    parts.append(f"- {d.content}")
        
        if include_sharp_edges:
            edges = self.storage.get_memories_by_type(
                self.current_project_id,
                SpawnerMemoryType.SHARP_EDGE_HIT,
                limit=10,
            )
            if edges:
                parts.append("\n## Sharp Edges (Gotchas)")
                for e in edges:
                    parts.append(f"- ⚠️ {e.content}")
        
        if include_issues:
            issues = self.storage.get_memories_by_type(
                self.current_project_id,
                SpawnerMemoryType.KNOWN_ISSUE,
                limit=10,
            )
            open_issues = [i for i in issues if i.issue_status == "open"]
            if open_issues:
                parts.append("\n## Open Issues")
                for i in open_issues:
                    parts.append(f"- 🐛 {i.content}")
        
        if project.current_goals:
            parts.append("\n## Current Goals")
            for g in project.current_goals:
                parts.append(f"- {g}")
        
        return "\n".join(parts)
    
    async def update_project(
        self,
        current_goals: Optional[List[str]] = None,
        open_issues: Optional[List[str]] = None,
        resolved_issue: Optional[str] = None,
        **kwargs,
    ) -> None:
        """Update project manifest."""
        if not self.current_project_id:
            raise ValueError("No active project.")
        
        project = self.storage.get_project(self.current_project_id)
        
        if current_goals is not None:
            project.current_goals = current_goals
        
        if open_issues is not None:
            project.open_issues = open_issues
        
        if resolved_issue:
            # Remove from open issues
            project.open_issues = [i for i in project.open_issues if resolved_issue not in i]
            
            # Add resolution memory
            await self.add_memory(
                content=f"Resolved: {resolved_issue}",
                memory_type=SpawnerMemoryType.RESOLVED_ISSUE,
                issue_status="resolved",
            )
        
        for key, value in kwargs.items():
            if hasattr(project, key):
                setattr(project, key, value)
        
        self.storage.update_project(project)
    
    # =========== Message Tracking ===========
    
    def track_message(self, role: str, content: str):
        """Track a message for session transcript."""
        self.session_messages.append({
            "role": role,
            "content": content,
            "timestamp": datetime.utcnow().isoformat(),
        })
    
    # =========== Utilities ===========
    
    def list_projects(self, limit: int = 10) -> List[ProjectManifest]:
        """List recent projects."""
        return self.storage.list_projects(limit)
    
    def get_stats(self) -> Dict[str, Any]:
        """Get memory statistics for current project."""
        if not self.current_project_id:
            return {}
        return self.storage.get_storage_stats(self.current_project_id)
```

---

## Part 4: MCP Integration

### Step 8: Create Spawner Memory MCP Server

Create `python/memory_engine/mcp_server.py`:

```python
"""
MCP Server for Spawner Memory.
Exposes memory tools to Claude Desktop and Claude Code.
"""

import json
from typing import Any
from mcp.server import Server
from mcp.types import Tool, TextContent

from .config import SpawnerMemoryConfig
from .memory import SpawnerMemoryEngine
from .spawner_curator import generate_session_primer


# Initialize
config = SpawnerMemoryConfig.from_env()
memory_engine = SpawnerMemoryEngine(config)
server = Server("spawner-memory")


@server.list_tools()
async def list_tools() -> list[Tool]:
    """List available memory tools."""
    return [
        Tool(
            name="memory_start_session",
            description="Start a new session for a project. Returns session primer with context.",
            inputSchema={
                "type": "object",
                "properties": {
                    "project_id": {
                        "type": "string",
                        "description": "Project identifier. If not provided, will prompt to identify or create project."
                    },
                    "project_description": {
                        "type": "string", 
                        "description": "Description of project if creating new one."
                    }
                }
            }
        ),
        Tool(
            name="memory_search",
            description="Search memories relevant to current context.",
            inputSchema={
                "type": "object",
                "properties": {
                    "query": {
                        "type": "string",
                        "description": "What to search for in memories."
                    },
                    "memory_types": {
                        "type": "array",
                        "items": {"type": "string"},
                        "description": "Filter by memory types (optional)."
                    }
                },
                "required": ["query"]
            }
        ),
        Tool(
            name="memory_add",
            description="Add a memory to the current project.",
            inputSchema={
                "type": "object",
                "properties": {
                    "content": {
                        "type": "string",
                        "description": "The memory content."
                    },
                    "memory_type": {
                        "type": "string",
                        "enum": [
                            "project_identity", "architecture_decision", "tech_stack",
                            "current_goal", "known_issue", "resolved_issue",
                            "guardrail_passed", "sharp_edge_hit", "session_summary",
                            "breakthrough", "user_preference", "skill_level"
                        ],
                        "description": "Type of memory."
                    },
                    "importance": {
                        "type": "number",
                        "description": "Importance weight 0-1 (optional)."
                    },
                    "tags": {
                        "type": "array",
                        "items": {"type": "string"},
                        "description": "Semantic tags for search (optional)."
                    }
                },
                "required": ["content", "memory_type"]
            }
        ),
        Tool(
            name="memory_end_session",
            description="End the current session. Triggers AI curation of session transcript.",
            inputSchema={
                "type": "object",
                "properties": {
                    "session_summary": {
                        "type": "string",
                        "description": "Brief summary of what was accomplished (optional, AI will generate if not provided)."
                    },
                    "transcript": {
                        "type": "string",
                        "description": "Session transcript for AI curation (optional)."
                    }
                }
            }
        ),
        Tool(
            name="memory_update_project",
            description="Update project manifest (goals, issues, etc).",
            inputSchema={
                "type": "object",
                "properties": {
                    "current_goals": {
                        "type": "array",
                        "items": {"type": "string"},
                        "description": "Update current goals."
                    },
                    "open_issues": {
                        "type": "array",
                        "items": {"type": "string"},
                        "description": "Update open issues."
                    },
                    "resolved_issue": {
                        "type": "string",
                        "description": "Mark an issue as resolved."
                    }
                }
            }
        ),
        Tool(
            name="memory_get_context",
            description="Get full context for current project (primer + relevant memories).",
            inputSchema={
                "type": "object",
                "properties": {
                    "include_all_decisions": {
                        "type": "boolean",
                        "description": "Include all architecture decisions."
                    },
                    "include_sharp_edges": {
                        "type": "boolean",
                        "description": "Include known sharp edges."
                    }
                }
            }
        )
    ]


@server.call_tool()
async def call_tool(name: str, arguments: dict[str, Any]) -> list[TextContent]:
    """Handle tool calls."""
    
    if name == "memory_start_session":
        result = await memory_engine.start_session(
            project_id=arguments.get("project_id"),
            project_description=arguments.get("project_description")
        )
        return [TextContent(type="text", text=result)]
    
    elif name == "memory_search":
        memories = await memory_engine.search(
            query=arguments["query"],
            memory_types=arguments.get("memory_types"),
            limit=config.max_memories_per_query
        )
        return [TextContent(type="text", text=json.dumps([m.dict() for m in memories], default=str))]
    
    elif name == "memory_add":
        memory_id = await memory_engine.add_memory(
            content=arguments["content"],
            memory_type=arguments["memory_type"],
            importance=arguments.get("importance"),
            tags=arguments.get("tags", [])
        )
        return [TextContent(type="text", text=f"Memory added with ID: {memory_id}")]
    
    elif name == "memory_end_session":
        result = await memory_engine.end_session(
            summary=arguments.get("session_summary"),
            transcript=arguments.get("transcript")
        )
        return [TextContent(type="text", text=result)]
    
    elif name == "memory_update_project":
        await memory_engine.update_project(
            current_goals=arguments.get("current_goals"),
            open_issues=arguments.get("open_issues"),
            resolved_issue=arguments.get("resolved_issue")
        )
        return [TextContent(type="text", text="Project updated.")]
    
    elif name == "memory_get_context":
        context = await memory_engine.get_full_context(
            include_decisions=arguments.get("include_all_decisions", True),
            include_sharp_edges=arguments.get("include_sharp_edges", True)
        )
        return [TextContent(type="text", text=context)]
    
    else:
        return [TextContent(type="text", text=f"Unknown tool: {name}")]


async def main():
    """Run the MCP server."""
    from mcp.server.stdio import stdio_server
    
    async with stdio_server() as (read_stream, write_stream):
        await server.run(read_stream, write_stream, server.create_initialization_options())


if __name__ == "__main__":
    import asyncio
    asyncio.run(main())
```

---

## Part 4: User Setup & Workflow

### Step 9: Create User Documentation

Create `docs/USER_GUIDE.md`:

```markdown
# Spawner Memory - User Guide

## Quick Start (Local Mode - Recommended)

The simplest setup - everything runs on your machine. **No API keys required.**

### 1. Install

```bash
# Clone
git clone https://github.com/vibeship/vibeship-memory.git
cd vibeship-memory

# Install uv (Python package manager)
curl -LsSf https://astral.sh/uv/install.sh | sh

# Install dependencies
uv sync
```

### 2. Verify Installation

```bash
# This should complete without errors
uv run python -c "from memory_engine.local_storage import LocalSpawnerStorage; print('OK')"
```

First run will download the embedding model (~90MB). This only happens once.

### 3. Start Memory Server

```bash
uv run start_server.py
```

You should see:
```
Spawner Memory Server starting...
Loading embedding model...
Server running at http://localhost:8765
```

**Keep this terminal open** while using Claude.

### 4. Configure Claude Desktop

**macOS:** `~/Library/Application Support/Claude/claude_desktop_config.json`
**Linux:** `~/.config/claude/claude_desktop_config.json`  
**Windows:** `%APPDATA%\Claude\claude_desktop_config.json`

Add:
```json
{
  "mcpServers": {
    "spawner-memory": {
      "command": "uv",
      "args": ["run", "python", "-m", "memory_engine.mcp_server"],
      "cwd": "/full/path/to/vibeship-memory"
    }
  }
}
```

Replace `/full/path/to/vibeship-memory` with your actual path.

### 5. Restart Claude Desktop

Close and reopen Claude Desktop. The memory server should now be connected.

### 6. Test It

Start a conversation:
```
You: I'm starting a new project called InvoiceApp for freelancers
Claude: [Creates project, remembers identity]

You: We'll use Next.js with Supabase
Claude: [Remembers tech stack decision]
```

Close the chat. Start a new one:
```
You: What project are we working on?
Claude: [Should remember InvoiceApp with Next.js + Supabase]
```

---

## Local Mode Details

### What's Stored

All data stays on your machine in `./data/`:
- `spawner_memory.db` - SQLite database with memories and projects
- `chroma/` - Vector embeddings for semantic search

### No API Keys Needed

Local mode uses:
- **sentence-transformers** for embeddings (runs locally)
- **SQLite** for metadata (no server needed)
- **ChromaDB** for vector search (runs locally)

### Memory Curation Options

**Option A: Rule-Based (Default, No API)**

Spawner extracts memories using pattern matching:
- Detects decisions: "we chose X because Y"
- Detects issues: "getting an error with..."
- Detects sharp edges: "turns out X doesn't work when..."

Not as smart as AI curation, but completely free and private.

**Option B: AI Curation (Needs API Key)**

For smarter memory extraction, add your API key:

```bash
# Using Claude (recommended)
export ANTHROPIC_API_KEY=sk-ant-...
export SPAWNER_CURATION_PROVIDER=claude

# Or using OpenAI
export OPENAI_API_KEY=sk-...
export SPAWNER_CURATION_PROVIDER=openai
```

AI curation:
- Understands context better
- Extracts more nuanced memories
- Generates better session summaries
- Costs ~$0.01-0.05 per session

### Data Location

Default paths (configurable via environment):
```bash
export SPAWNER_DB_PATH="./data/spawner_memory.db"
export SPAWNER_CHROMA_PATH="./data/chroma"
```

### Backup Your Data

Your memories are valuable! Back them up:
```bash
# Simple backup
cp -r ./data ./data-backup-$(date +%Y%m%d)

# Or sync to cloud storage
rsync -av ./data/ ~/Dropbox/spawner-memory-backup/
```

---

## Claude Code Integration

### Configure for Claude Code

Add to your `~/.claude/mcp_servers.json`:

```json
{
  "spawner-memory": {
    "command": "uv",
    "args": ["run", "python", "-m", "memory_engine.mcp_server"],
    "cwd": "/full/path/to/vibeship-memory"
  }
}
```

### Per-Project Memory

Each project gets its own memory space. When you start:

```
You: Start a session for my-saas-app
Claude: [Loads memories specific to my-saas-app]
```

### Automatic Project Detection

Spawner tries to detect your project from:
1. Current working directory name
2. package.json name field
3. Project description you provide

---

## Remote Mode (Cloud Sync)

For users who want memories synced across devices.

### Option A: Cloudflare (Recommended)

Uses Cloudflare's free tier for storage.

**Setup:**
1. Create a Cloudflare account
2. Create a D1 database
3. Create a Vectorize index
4. Get your API token

**Configure:**
```bash
export SPAWNER_MEMORY_PROVIDER=cloudflare
export CLOUDFLARE_ACCOUNT_ID=your_account_id
export CLOUDFLARE_API_TOKEN=your_api_token
export CLOUDFLARE_D1_ID=your_d1_database_id
export CLOUDFLARE_VECTORIZE_INDEX=your_index_name
```

### Option B: Supabase

If you already have a Supabase project.

**Setup:**
1. Run the schema migration (see `migrations/supabase.sql`)
2. Enable pgvector extension
3. Get your service key

**Configure:**
```bash
export SPAWNER_MEMORY_PROVIDER=supabase
export SUPABASE_URL=https://your-project.supabase.co
export SUPABASE_SERVICE_KEY=your_service_key
```

---

## AI Curation Setup

Spawner uses AI to curate memories from your sessions.

### Claude (Default)

Uses Claude to analyze sessions and extract memories.

```bash
export SPAWNER_CURATION_PROVIDER=claude
export ANTHROPIC_API_KEY=your_anthropic_key
```

### OpenAI

Alternative if you prefer OpenAI.

```bash
export SPAWNER_CURATION_PROVIDER=openai
export OPENAI_API_KEY=your_openai_key
```

### Local (No API Key)

Rule-based extraction, no AI curation.

```bash
export SPAWNER_CURATION_PROVIDER=local
```

---

## Workflow

### Starting a Session

When you start working on a project:

1. Claude will automatically load the session primer
2. You'll see context from previous sessions
3. Relevant memories surface as you work

### During a Session

- **Architecture decisions** are automatically captured
- **Issues** you discuss are tracked
- **Sharp edges** you hit are remembered for next time

### Ending a Session

When you're done:

1. Say "end session" or close the chat
2. AI analyzes the transcript
3. Valuable memories are extracted
4. Session summary is saved

### Explicit Memory Commands

You can also explicitly manage memories:

```
"Remember that we're using Stripe for payments"
"Add a known issue: webhook sometimes times out"
"What do you remember about our auth setup?"
"What sharp edges have we hit before?"
```

---

## Best Practices

### DO:
- Be specific about architecture decisions
- Mention why you chose something, not just what
- Flag issues as you encounter them
- Review session summaries for accuracy

### DON'T:
- Expect Claude to remember code (it stores concepts, not code)
- Store sensitive data (API keys, passwords)
- Rely on memory for critical documentation

---

## Troubleshooting

### "Memory not loading"
- Check if server is running: `curl http://localhost:8765/health`
- Verify MCP config is correct
- Restart Claude Desktop

### "No memories found"
- Check project ID matches
- Try broader search terms
- Verify storage backend is configured

### "AI curation not working"
- Verify API key is set
- Check API key has credit
- Try switching providers
```

---

## Part 5: Prompts for Claude Code Implementation

### Step 10: Create Implementation Prompts

Create `docs/IMPLEMENTATION_PROMPTS.md`:

```markdown
# Implementation Prompts for Claude Code

Use these prompts when building Spawner Memory with Claude Code.

---

## Initial Setup Prompt

```
I'm building Spawner Memory, a fork of VibeMemo customized for Vibeship Spawner.

The project is at: /path/to/vibeship-memory

Key goals:
1. Add Spawner-specific memory types (architecture decisions, sharp edges, etc)
2. Support both local and remote storage (Cloudflare, Supabase)
3. Create MCP server for Claude integration
4. Build AI curation system for session memories

Start by reviewing the existing VibeMemo codebase and understanding its architecture.
Then let's implement the Spawner customizations.

Reference docs are in docs/v2/ if you need architecture context.
```

---

## Memory Types Implementation

```
Let's implement Spawner-specific memory types.

Create python/memory_engine/spawner_types.py with:
- SpawnerMemoryType enum with these types:
  - project_identity, architecture_decision, tech_stack
  - current_goal, known_issue, resolved_issue
  - guardrail_passed, sharp_edge_hit
  - session_summary, breakthrough
  - user_preference, skill_level

- SpawnerMemory model extending the base with:
  - memory_type field
  - project_id field
  - decision/reasoning fields for architecture decisions
  - issue_status/resolution for issues
  - trigger_phrases for retrieval

- ProjectManifest model with:
  - project metadata
  - stack info
  - current goals and issues
  - session history

Include default importance weights for each memory type.
```

---

## Remote Storage Implementation

```
Implement remote storage backends for Spawner Memory.

Create python/memory_engine/remote_storage.py with:

1. Abstract RemoteStorageBackend base class with:
   - store_memory(project_id, memory)
   - search_memories(project_id, query, limit)
   - get_project(project_id)
   - update_project(manifest)

2. CloudflareStorageBackend using:
   - D1 for metadata storage
   - Vectorize for semantic search
   - User provides their own API credentials

3. SupabaseStorageBackend using:
   - Supabase tables for metadata
   - pgvector for semantic search
   - User provides their own project credentials

4. Factory function get_storage_backend(config) that returns appropriate backend

User should be able to use remote storage with their own API keys for privacy and control.
```

---

## Curation System Implementation

```
Implement the AI curation system for Spawner Memory.

Create python/memory_engine/spawner_curator.py with:

1. SPAWNER_CURATION_SYSTEM_PROMPT that teaches AI how to:
   - Identify valuable memories from session transcripts
   - Classify memories by type
   - Assign importance weights
   - Generate trigger phrases for retrieval

2. SESSION_PRIMER_TEMPLATE for session start context

3. generate_session_primer() function that creates context from:
   - Project manifest
   - Recent memories
   - Last session summary
   - Current goals and issues

4. curate_session() function that:
   - Takes session transcript
   - Calls AI to extract memories
   - Returns structured memories to store

The curation prompt should emphasize:
- HIGH VALUE: Architecture decisions, sharp edges, breakthroughs
- MEDIUM VALUE: Goals, issues, preferences
- LOW VALUE: Resolved issues, validations
- SKIP: Generic knowledge, temporary debugging
```

---

## MCP Server Implementation

```
Create the MCP server for Spawner Memory.

Create python/memory_engine/mcp_server.py with these tools:

1. memory_start_session
   - Input: project_id (optional), project_description (optional)
   - Returns: Session primer with full context
   - Creates new project if needed

2. memory_search
   - Input: query, memory_types (optional)
   - Returns: Relevant memories
   - Uses semantic search

3. memory_add
   - Input: content, memory_type, importance (optional), tags (optional)
   - Adds memory to current project
   - Auto-generates embedding

4. memory_end_session
   - Input: session_summary (optional), transcript (optional)
   - Triggers AI curation
   - Stores session summary

5. memory_update_project
   - Input: current_goals, open_issues, resolved_issue
   - Updates project manifest

6. memory_get_context
   - Returns full context for current project
   - Includes primer + all relevant memories

Use the MCP SDK and make sure it works with Claude Desktop and Claude Code.
```

---

## Testing Prompt

```
Let's test the Spawner Memory implementation.

Create tests in tests/test_spawner_memory.py that verify:

1. Memory types work correctly
   - Can create memories of each type
   - Importance weights apply correctly

2. Storage backends work
   - Local storage creates/retrieves memories
   - Remote storage (mock) handles API calls correctly

3. Curation works
   - Session transcript produces memories
   - Memory types are classified correctly
   - Importance is assigned appropriately

4. MCP server responds correctly
   - Each tool returns expected format
   - Error handling works

5. Session flow works end-to-end
   - Start session → work → end session
   - Memories persist between sessions
   - Session primer includes relevant context

Run tests with: uv run pytest tests/
```

---

## Integration Testing Prompt

```
Let's do integration testing with Claude Desktop.

1. Start the memory server:
   uv run start_server.py

2. Configure Claude Desktop to use our MCP server

3. Test this conversation flow:
   
   User: "I'm starting a new project called InvoiceApp. It's a SaaS for freelancers to send invoices."
   
   Expected: Claude should create a project and remember the identity.
   
   User: "Let's use Next.js with Supabase for the backend."
   
   Expected: Claude should remember the tech stack decision.
   
   User: "I'm having an issue where new users see empty data after signup."
   
   Expected: Claude should remember this as a known issue.
   
   [Continue conversation about fixing the issue]
   
   User: "OK let's end the session for today."
   
   Expected: Claude should curate memories from the session.

4. Start a NEW conversation and verify:
   - Session primer includes project context
   - Previous decisions are remembered
   - Known issues are tracked

Document any issues found during testing.
```

---

## Optimization Prompt

```
Let's optimize Spawner Memory for production use.

Review and improve:

1. Performance
   - Memory retrieval should be <100ms
   - Embedding generation should be cached
   - Database queries should be efficient

2. Token efficiency
   - Session primer should be concise
   - Memories should be deduplicated
   - Old low-importance memories should decay

3. Error handling
   - Graceful degradation if storage fails
   - Clear error messages for users
   - Retry logic for API calls

4. Memory management
   - Implement memory decay for old, unused memories
   - Limit total memories per project
   - Archive instead of delete

5. Security
   - No sensitive data in memories
   - API keys never logged
   - User data isolation

Run profiling and identify bottlenecks.
```
```

---

## Part 6: Claude System Prompt for Memory

### Step 11: Create Claude Integration Prompt

Create `docs/CLAUDE_SYSTEM_PROMPT.md`:

```markdown
# Claude System Prompt for Spawner Memory

Add this to Claude's system prompt or custom instructions to enable optimal memory usage.

---

## Full System Prompt

```
You have access to Spawner Memory, a persistent memory system that helps you remember projects across conversations.

## Memory Tools Available

- `memory_start_session`: Start session, get project context
- `memory_search`: Find relevant memories
- `memory_add`: Store new memories
- `memory_end_session`: End session, trigger curation
- `memory_update_project`: Update project goals/issues
- `memory_get_context`: Get full project context

## How to Use Memory

### Session Start
At the start of EVERY conversation:
1. Call `memory_start_session` with project_id if known
2. Review the session primer for context
3. Use this context to provide continuity

### During Conversation
When the user mentions something important:
- Architecture decisions → Store with `memory_add` (type: architecture_decision)
- Problems/bugs → Store with `memory_add` (type: known_issue)
- Solutions that worked → Store with `memory_add` (type: sharp_edge_hit if it was tricky)
- Preferences → Store with `memory_add` (type: user_preference)

When you need context:
- Call `memory_search` with relevant query
- Check for existing decisions before suggesting new approaches
- Reference previous work naturally

### Session End
When the conversation is ending:
1. Call `memory_end_session` 
2. Include a brief summary of what was accomplished
3. Update project goals/issues if changed

## Memory Etiquette

### DO:
- Reference memories naturally: "As we decided before..." not "According to memory ID 123..."
- Store decisions with reasoning, not just outcomes
- Flag sharp edges that would help future sessions
- Keep memories concise but complete

### DON'T:
- Store code snippets (store concepts instead)
- Create duplicate memories
- Store temporary debugging attempts
- Mention the memory system explicitly unless asked

## What Makes Good Memories

### HIGH VALUE (always store):
- "We chose Supabase over Firebase because of RLS policies and real-time subscriptions"
- "Hit a bug: auth.uid() in RLS fails for 1-2s after signup. Workaround: use service_role for initial data"
- "User prefers detailed explanations with code examples"

### MEDIUM VALUE (store if significant):
- "Current goal: implement Stripe webhooks"
- "Known issue: sometimes webhook times out"
- "Using Next.js 14 App Router with TypeScript"

### LOW VALUE (usually skip):
- "Added console.log for debugging"
- "Tried three different approaches before finding the fix"
- "User said hello"

## Context Injection

When memories are relevant to the current task:
- Mention them naturally in your response
- Use them to avoid suggesting things that didn't work
- Build on previous decisions rather than starting fresh

Example:
User: "How should we handle authentication?"
Good: "Since we're using Supabase (as we set up last time), I'd recommend using their built-in auth with the middleware pattern we discussed. Remember we hit that cold-start issue - let's make sure to handle that."
Bad: "I found in my memories that you're using Supabase. Memory search returned 3 results about authentication..."
```

---

## Compact Version (for Custom Instructions)

```
You have Spawner Memory for project continuity.

Start sessions: Call memory_start_session to get context.
During work: Store important decisions, issues, and breakthroughs.
End sessions: Call memory_end_session for curation.

Store: Architecture decisions (with why), sharp edges, user preferences.
Skip: Code snippets, temporary debugging, obvious things.

Reference memories naturally without mentioning the system.
Build on previous work rather than starting fresh.
```
```

---

## Summary

### Files Created:
1. `python/memory_engine/spawner_types.py` - Memory type definitions
2. `python/memory_engine/spawner_curator.py` - Curation prompts
3. `python/memory_engine/remote_storage.py` - Cloud storage backends
4. `python/memory_engine/config.py` - Configuration
5. `python/memory_engine/mcp_server.py` - MCP server
6. `docs/USER_GUIDE.md` - User documentation
7. `docs/IMPLEMENTATION_PROMPTS.md` - Claude Code prompts
8. `docs/CLAUDE_SYSTEM_PROMPT.md` - Claude integration

### User Workflow:
1. Clone and install
2. Choose storage: local (free) or remote (sync)
3. Configure API keys if using AI curation
4. Add MCP server to Claude Desktop/Code
5. Start coding with persistent memory!

### Your Workflow:
1. Fork VibeMemo
2. Feed implementation prompts to Claude Code
3. Build incrementally, test as you go
4. Dogfood it on real projects
5. Iterate based on what's missing
