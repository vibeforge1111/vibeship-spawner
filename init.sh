#!/bin/bash

set -e

PROJECT_NAME=${1:-"my-project"}
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo ""
echo "> Spawning VibeShip project: $PROJECT_NAME"
echo ""

# Create project directory
mkdir -p "$PROJECT_NAME"
cd "$PROJECT_NAME"

# Copy templates
cp "$SCRIPT_DIR/templates/CLAUDE.md" ./CLAUDE.md
cp "$SCRIPT_DIR/templates/state.json" ./state.json
cp "$SCRIPT_DIR/templates/task_queue.json" ./task_queue.json

# Create docs directory and copy templates
mkdir -p docs
cp "$SCRIPT_DIR/templates/docs/PRD.md" ./docs/PRD.md
cp "$SCRIPT_DIR/templates/docs/ARCHITECTURE.md" ./docs/ARCHITECTURE.md
touch ./docs/PROJECT_LOG.md

# Copy skills (needed for agent coordination)
cp -r "$SCRIPT_DIR/skills" ./skills

# Update project name in files
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    sed -i '' "s/{project_name}/$PROJECT_NAME/g" ./CLAUDE.md
    sed -i '' "s/{project_name}/$PROJECT_NAME/g" ./state.json
else
    # Linux/Windows (Git Bash)
    sed -i "s/{project_name}/$PROJECT_NAME/g" ./CLAUDE.md
    sed -i "s/{project_name}/$PROJECT_NAME/g" ./state.json
fi

echo "+ Project initialized!"
echo ""
echo "Next steps:"
echo "  cd $PROJECT_NAME"
echo "  claude"
echo ""
echo "Then tell Claude what you want to build."
echo ""
echo "\"You vibe. It ships.\""
echo ""
