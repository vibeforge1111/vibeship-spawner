#!/usr/bin/env python3
"""
Run Jury Script

Has multiple LLM models score the contestant outputs.
Randomizes A/B position to prevent bias.

Usage:
    python scripts/run-jury.py --run-id 2024-12-19-123456
    python scripts/run-jury.py --run-id 2024-12-19-123456 --jury claude-opus,gpt-4o
"""

import argparse
import os
import sys
import yaml
import json
import random
from datetime import datetime
from pathlib import Path
from typing import Optional

sys.path.insert(0, str(Path(__file__).parent.parent))

# Import API clients
try:
    import anthropic
except ImportError:
    anthropic = None

try:
    import openai
except ImportError:
    openai = None

try:
    import google.generativeai as genai
except ImportError:
    genai = None


JURY_PROMPT_TEMPLATE = """You are evaluating two responses to the same task.
Do not assume which is better - evaluate purely on merit.

TASK:
{task_prompt}

---

RESPONSE A:
{response_a}

---

RESPONSE B:
{response_b}

---

Evaluate each response and provide your assessment in the following JSON format:

{{
  "response_a": {{
    "correctness": <1-10>,
    "completeness": <1-10>,
    "expertise": <1-10>,
    "gotcha_awareness": <1-10>,
    "benchmark_score": <0-100>
  }},
  "response_b": {{
    "correctness": <1-10>,
    "completeness": <1-10>,
    "expertise": <1-10>,
    "gotcha_awareness": <1-10>,
    "benchmark_score": <0-100>
  }},
  "winner": "<A|B|Tie>",
  "reasoning": "<2-3 sentence explanation of your decision>"
}}

Scoring guide:
- CORRECTNESS: Is the information/code accurate?
- COMPLETENESS: Does it address all aspects of the task?
- EXPERTISE: Does it show deep domain knowledge?
- GOTCHA_AWARENESS: Does it anticipate/avoid common mistakes?
- BENCHMARK_SCORE: Overall quality for professional use (0-100)

Respond ONLY with valid JSON, no other text."""


def load_config() -> dict:
    """Load configuration from config.yaml or config.local.yaml"""
    config_path = Path(__file__).parent.parent / "config.yaml"
    local_config_path = Path(__file__).parent.parent / "config.local.yaml"

    if local_config_path.exists():
        config_path = local_config_path

    with open(config_path) as f:
        config = yaml.safe_load(f)

    # Load API keys from environment
    config["api_keys"] = {
        "anthropic": os.environ.get("ANTHROPIC_API_KEY", ""),
        "openai": os.environ.get("OPENAI_API_KEY", ""),
        "google": os.environ.get("GOOGLE_API_KEY", ""),
        "together": os.environ.get("TOGETHER_API_KEY", ""),
    }

    return config


def load_run_metadata(run_id: str) -> dict:
    """Load metadata from a previous contestant run"""
    metadata_path = Path(__file__).parent.parent / "outputs" / run_id / "metadata.json"

    if not metadata_path.exists():
        print(f"Error: Run metadata not found at {metadata_path}")
        print("Make sure you ran run-contestants.py first.")
        sys.exit(1)

    with open(metadata_path) as f:
        return json.load(f)


def load_contestant_output(run_id: str, skill_id: str, test_id: str, contestant: str) -> str:
    """Load saved contestant output"""
    output_path = (
        Path(__file__).parent.parent
        / "outputs"
        / run_id
        / "contestants"
        / f"{skill_id}_{test_id}_{contestant}.md"
    )

    if not output_path.exists():
        return f"ERROR: Output not found at {output_path}"

    with open(output_path, encoding="utf-8") as f:
        return f.read()


def call_anthropic(prompt: str, config: dict) -> str:
    """Call Anthropic API"""
    if not anthropic:
        return '{"error": "anthropic package not installed"}'

    client = anthropic.Anthropic(api_key=config["api_keys"]["anthropic"])

    try:
        response = client.messages.create(
            model="claude-sonnet-4-20250514",
            max_tokens=1024,
            temperature=config["settings"].get("jury_temperature", 0.1),
            messages=[{"role": "user", "content": prompt}]
        )
        return response.content[0].text
    except Exception as e:
        return json.dumps({"error": str(e)})


def call_openai(prompt: str, config: dict) -> str:
    """Call OpenAI API"""
    if not openai:
        return '{"error": "openai package not installed"}'

    client = openai.OpenAI(api_key=config["api_keys"]["openai"])

    try:
        response = client.chat.completions.create(
            model="gpt-4o",
            max_tokens=1024,
            temperature=config["settings"].get("jury_temperature", 0.1),
            messages=[{"role": "user", "content": prompt}]
        )
        return response.choices[0].message.content
    except Exception as e:
        return json.dumps({"error": str(e)})


def call_google(prompt: str, config: dict) -> str:
    """Call Google Gemini API"""
    if not genai:
        return '{"error": "google-generativeai package not installed"}'

    try:
        genai.configure(api_key=config["api_keys"]["google"])
        model = genai.GenerativeModel("gemini-1.5-pro")
        response = model.generate_content(prompt)
        return response.text
    except Exception as e:
        return json.dumps({"error": str(e)})


def call_together(prompt: str, config: dict) -> str:
    """Call Together API (for Llama)"""
    # Together uses OpenAI-compatible API
    if not openai:
        return '{"error": "openai package not installed (needed for Together)"}'

    client = openai.OpenAI(
        api_key=config["api_keys"]["together"],
        base_url="https://api.together.xyz/v1"
    )

    try:
        response = client.chat.completions.create(
            model="meta-llama/Llama-3.1-70B-Instruct-Turbo",
            max_tokens=1024,
            temperature=config["settings"].get("jury_temperature", 0.1),
            messages=[{"role": "user", "content": prompt}]
        )
        return response.choices[0].message.content
    except Exception as e:
        return json.dumps({"error": str(e)})


JURY_CALLERS = {
    "claude-opus": call_anthropic,
    "gpt-4o": call_openai,
    "gemini-pro": call_google,
    "llama-3.1": call_together,
}


def parse_jury_response(response: str) -> dict:
    """Parse JSON response from jury model"""
    # Try to extract JSON from response
    try:
        # Handle markdown code blocks
        if "```json" in response:
            response = response.split("```json")[1].split("```")[0]
        elif "```" in response:
            response = response.split("```")[1].split("```")[0]

        return json.loads(response.strip())
    except json.JSONDecodeError:
        return {"error": "Failed to parse response", "raw": response}


def run_jury_evaluation(
    task_prompt: str,
    vanilla_output: str,
    skilled_output: str,
    jury_name: str,
    config: dict
) -> dict:
    """Run a single jury evaluation with randomized A/B positioning"""

    # Randomize position
    if random.random() < 0.5:
        response_a = vanilla_output
        response_b = skilled_output
        position_map = {"A": "vanilla", "B": "skilled"}
    else:
        response_a = skilled_output
        response_b = vanilla_output
        position_map = {"A": "skilled", "B": "vanilla"}

    prompt = JURY_PROMPT_TEMPLATE.format(
        task_prompt=task_prompt,
        response_a=response_a,
        response_b=response_b
    )

    # Call the appropriate jury model
    caller = JURY_CALLERS.get(jury_name)
    if not caller:
        return {"error": f"Unknown jury model: {jury_name}"}

    raw_response = caller(prompt, config)
    parsed = parse_jury_response(raw_response)

    # Add position mapping to result
    parsed["position_map"] = position_map
    parsed["jury_model"] = jury_name

    return parsed


def save_jury_scores(run_id: str, skill_id: str, test_id: str, jury_name: str, scores: dict):
    """Save jury scores to file"""
    output_dir = Path(__file__).parent.parent / "outputs" / run_id / "jury-scores"
    output_dir.mkdir(parents=True, exist_ok=True)

    output_file = output_dir / f"{skill_id}_{test_id}_{jury_name}.json"
    with open(output_file, "w") as f:
        json.dump(scores, f, indent=2)


def update_metadata(run_id: str, jury_models_used: list):
    """Update run metadata with jury completion status"""
    metadata_path = Path(__file__).parent.parent / "outputs" / run_id / "metadata.json"

    with open(metadata_path) as f:
        metadata = json.load(f)

    metadata["jury_completed"] = datetime.now().isoformat()
    metadata["jury_models_used"] = jury_models_used
    metadata["status"] = "jury_complete"

    with open(metadata_path, "w") as f:
        json.dump(metadata, f, indent=2)


def main():
    parser = argparse.ArgumentParser(description="Run jury scoring on contestant outputs")
    parser.add_argument("--run-id", required=True, help="Run ID from contestant phase")
    parser.add_argument("--jury", help="Comma-separated jury models (default: all configured)")
    args = parser.parse_args()

    config = load_config()
    metadata = load_run_metadata(args.run_id)

    # Determine which jury models to use
    if args.jury:
        jury_models = [j.strip() for j in args.jury.split(",")]
    else:
        jury_models = [j["name"] for j in config["jury"]]

    # Filter to models with API keys
    available_jury = []
    for jm in jury_models:
        if jm == "claude-opus" and config["api_keys"].get("anthropic"):
            available_jury.append(jm)
        elif jm == "gpt-4o" and config["api_keys"].get("openai"):
            available_jury.append(jm)
        elif jm == "gemini-pro" and config["api_keys"].get("google"):
            available_jury.append(jm)
        elif jm == "llama-3.1" and config["api_keys"].get("together"):
            available_jury.append(jm)
        else:
            print(f"Warning: Skipping {jm} - no API key configured")

    if not available_jury:
        print("Error: No jury models available (check API keys)")
        sys.exit(1)

    print(f"\n{'='*60}")
    print(f"SKILL BENCHMARK - Jury Scoring")
    print(f"Run ID: {args.run_id}")
    print(f"Jury Models: {', '.join(available_jury)}")
    print(f"Test Cases: {len(metadata['test_cases'])}")
    print(f"{'='*60}\n")

    for test_case in metadata["test_cases"]:
        skill_id = test_case["skill_id"]
        test_id = test_case["test_id"]
        task_prompt = test_case["prompt"]

        print(f"\n--- {skill_id}/{test_id} ---")

        # Load contestant outputs
        vanilla_output = load_contestant_output(args.run_id, skill_id, test_id, "vanilla")
        skilled_output = load_contestant_output(args.run_id, skill_id, test_id, "skilled")

        for jury_name in available_jury:
            print(f"  Jury: {jury_name}...", end=" ", flush=True)

            scores = run_jury_evaluation(
                task_prompt,
                vanilla_output,
                skilled_output,
                jury_name,
                config
            )

            if "error" in scores:
                print(f"ERROR: {scores['error']}")
            else:
                # Determine actual winner
                winner_position = scores.get("winner", "Tie")
                if winner_position in ("A", "B"):
                    actual_winner = scores["position_map"].get(winner_position, "unknown")
                else:
                    actual_winner = "tie"

                print(f"Winner: {actual_winner}")

            save_jury_scores(args.run_id, skill_id, test_id, jury_name, scores)

    # Update metadata
    update_metadata(args.run_id, available_jury)

    print(f"\n{'='*60}")
    print(f"Jury scoring complete!")
    print(f"\nNext step:")
    print(f"  python scripts/generate-report.py --run-id {args.run_id}")
    print(f"{'='*60}\n")


if __name__ == "__main__":
    main()
