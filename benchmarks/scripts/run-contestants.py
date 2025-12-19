#!/usr/bin/env python3
"""
Run Contestants Script

Runs the same prompts through Vanilla Opus and Skilled Opus,
saving outputs for later jury evaluation.

Usage:
    python scripts/run-contestants.py --skills all
    python scripts/run-contestants.py --skills frontend,copywriting
    python scripts/run-contestants.py --skills frontend --test-id frontend-trap-01
"""

import argparse
import os
import sys
import yaml
import json
import hashlib
from datetime import datetime
from pathlib import Path
from typing import Optional

# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).parent.parent))

try:
    import anthropic
except ImportError:
    print("Error: anthropic package not installed. Run: pip install anthropic")
    sys.exit(1)


def load_config() -> dict:
    """Load configuration from config.yaml or config.local.yaml"""
    config_path = Path(__file__).parent.parent / "config.yaml"
    local_config_path = Path(__file__).parent.parent / "config.local.yaml"

    if local_config_path.exists():
        config_path = local_config_path

    with open(config_path) as f:
        config = yaml.safe_load(f)

    # Substitute environment variables
    api_key = os.environ.get("ANTHROPIC_API_KEY", "")
    if not api_key:
        print("Error: ANTHROPIC_API_KEY environment variable not set")
        sys.exit(1)

    config["api_keys"]["anthropic"] = api_key
    return config


def load_test_cases(skill_id: str) -> dict:
    """Load test cases for a specific skill"""
    test_path = Path(__file__).parent.parent / "test-cases" / f"{skill_id}.yaml"

    if not test_path.exists():
        print(f"Error: Test cases not found at {test_path}")
        return None

    with open(test_path) as f:
        return yaml.safe_load(f)


def load_skill(skill_path: str) -> str:
    """Load skill content from YAML files"""
    base_path = Path(__file__).parent.parent.parent / "spawner-v2" / "skills" / skill_path

    skill_content = []

    # Load skill.yaml if exists
    skill_yaml = base_path / "skill.yaml"
    if skill_yaml.exists():
        with open(skill_yaml) as f:
            data = yaml.safe_load(f)
            if data.get("identity"):
                skill_content.append(f"# Identity\n{data['identity']}")
            if data.get("patterns"):
                skill_content.append("# Patterns")
                for p in data["patterns"]:
                    skill_content.append(f"## {p.get('name', 'Pattern')}\n{p.get('description', '')}")
                    if p.get('example'):
                        skill_content.append(f"```\n{p['example']}\n```")

    # Load sharp-edges.yaml if exists
    sharp_edges_yaml = base_path / "sharp-edges.yaml"
    if sharp_edges_yaml.exists():
        with open(sharp_edges_yaml) as f:
            data = yaml.safe_load(f)
            if data and data.get("sharp_edges"):
                skill_content.append("\n# Sharp Edges (Common Mistakes)")
                for edge in data["sharp_edges"]:
                    skill_content.append(f"\n## {edge.get('id', 'Edge')}: {edge.get('summary', '')}")
                    skill_content.append(f"Severity: {edge.get('severity', 'unknown')}")
                    if edge.get('situation'):
                        skill_content.append(f"Situation: {edge['situation']}")
                    if edge.get('why'):
                        skill_content.append(f"Why it matters: {edge['why']}")
                    if edge.get('solution'):
                        skill_content.append(f"Solution: {edge['solution']}")

    return "\n\n".join(skill_content) if skill_content else ""


def run_contestant(
    client: anthropic.Anthropic,
    prompt: str,
    skill_content: Optional[str],
    config: dict
) -> str:
    """Run a single contestant (vanilla or skilled) on a prompt"""

    system_prompt = ""
    if skill_content:
        system_prompt = f"""You are an expert with deep domain knowledge. Apply the following expertise when responding:

{skill_content}

Use this knowledge to provide expert-level responses, catching common mistakes and applying best practices."""

    temperature = config["settings"].get("contestant_temperature", 0.3)

    try:
        response = client.messages.create(
            model=config["contestants"]["vanilla"]["model"],
            max_tokens=4096,
            temperature=temperature,
            system=system_prompt if system_prompt else None,
            messages=[{"role": "user", "content": prompt}]
        )
        return response.content[0].text
    except Exception as e:
        return f"ERROR: {str(e)}"


def generate_run_id() -> str:
    """Generate a unique run ID based on timestamp"""
    return datetime.now().strftime("%Y-%m-%d-%H%M%S")


def save_output(run_id: str, skill_id: str, test_id: str, contestant: str, output: str):
    """Save contestant output to file"""
    output_dir = Path(__file__).parent.parent / "outputs" / run_id / "contestants"
    output_dir.mkdir(parents=True, exist_ok=True)

    output_file = output_dir / f"{skill_id}_{test_id}_{contestant}.md"
    with open(output_file, "w", encoding="utf-8") as f:
        f.write(output)

    print(f"  Saved: {output_file.name}")


def save_metadata(run_id: str, test_cases: list, skills_tested: list):
    """Save run metadata for later phases"""
    output_dir = Path(__file__).parent.parent / "outputs" / run_id
    output_dir.mkdir(parents=True, exist_ok=True)

    metadata = {
        "run_id": run_id,
        "timestamp": datetime.now().isoformat(),
        "skills_tested": skills_tested,
        "test_cases": test_cases,
        "status": "contestants_complete"
    }

    with open(output_dir / "metadata.json", "w") as f:
        json.dump(metadata, f, indent=2)


def main():
    parser = argparse.ArgumentParser(description="Run benchmark contestants")
    parser.add_argument("--skills", required=True, help="Comma-separated skill IDs or 'all'")
    parser.add_argument("--test-id", help="Run specific test ID only")
    parser.add_argument("--run-id", help="Use specific run ID (default: auto-generated)")
    args = parser.parse_args()

    config = load_config()
    client = anthropic.Anthropic(api_key=config["api_keys"]["anthropic"])

    # Determine which skills to test
    if args.skills == "all":
        skills_to_test = config["skills_to_test"]
    else:
        skills_to_test = [s.strip() for s in args.skills.split(",")]

    run_id = args.run_id or generate_run_id()
    print(f"\n{'='*60}")
    print(f"SKILL BENCHMARK - Contestant Run")
    print(f"Run ID: {run_id}")
    print(f"Skills: {', '.join(skills_to_test)}")
    print(f"{'='*60}\n")

    all_test_cases = []

    for skill_id in skills_to_test:
        print(f"\n--- Skill: {skill_id} ---")

        # Load test cases
        test_data = load_test_cases(skill_id)
        if not test_data:
            print(f"  Skipping {skill_id} - no test cases found")
            continue

        # Load skill content
        skill_path = test_data.get("skill_path", skill_id)
        skill_content = load_skill(skill_path)

        if not skill_content:
            print(f"  Warning: No skill content found for {skill_path}")
        else:
            print(f"  Loaded skill content ({len(skill_content)} chars)")

        # Run each test
        for test in test_data.get("tests", []):
            test_id = test["id"]

            # Skip if filtering by test ID
            if args.test_id and test_id != args.test_id:
                continue

            print(f"\n  Test: {test_id} ({test['type']})")

            prompt = test["prompt"]

            # Run vanilla (no skill)
            print("    Running vanilla...")
            vanilla_output = run_contestant(client, prompt, None, config)
            save_output(run_id, skill_id, test_id, "vanilla", vanilla_output)

            # Run skilled (with skill)
            print("    Running skilled...")
            skilled_output = run_contestant(client, prompt, skill_content, config)
            save_output(run_id, skill_id, test_id, "skilled", skilled_output)

            all_test_cases.append({
                "skill_id": skill_id,
                "test_id": test_id,
                "test_type": test["type"],
                "test_name": test.get("name", ""),
                "prompt": prompt
            })

    # Save metadata
    save_metadata(run_id, all_test_cases, skills_to_test)

    print(f"\n{'='*60}")
    print(f"Contestant run complete!")
    print(f"Run ID: {run_id}")
    print(f"Tests completed: {len(all_test_cases)}")
    print(f"\nNext step:")
    print(f"  python scripts/run-jury.py --run-id {run_id}")
    print(f"{'='*60}\n")


if __name__ == "__main__":
    main()
