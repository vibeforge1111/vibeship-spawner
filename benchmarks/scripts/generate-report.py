#!/usr/bin/env python3
"""
Generate Report Script

Aggregates jury scores into a final benchmark report.
Also generates per-skill improvement-areas.md files.

Usage:
    python scripts/generate-report.py --run-id 2024-12-19-123456
"""

import argparse
import json
from datetime import datetime
from pathlib import Path
from collections import defaultdict
from typing import Dict, List


def load_run_data(run_id: str) -> tuple:
    """Load metadata and jury scores for a run"""
    base_path = Path(__file__).parent.parent / "outputs" / run_id

    # Load metadata
    metadata_path = base_path / "metadata.json"
    if not metadata_path.exists():
        print(f"Error: Metadata not found at {metadata_path}")
        return None, None

    with open(metadata_path) as f:
        metadata = json.load(f)

    # Load all jury scores
    scores_dir = base_path / "jury-scores"
    jury_scores = []

    if scores_dir.exists():
        for score_file in scores_dir.glob("*.json"):
            with open(score_file) as f:
                score_data = json.load(f)
                # Parse filename to get test info
                parts = score_file.stem.rsplit("_", 1)
                jury_name = parts[-1]
                skill_test = parts[0].rsplit("_", 1)
                skill_id = skill_test[0]
                test_id = "_".join(skill_test)

                score_data["_skill_id"] = skill_id
                score_data["_test_id"] = test_id
                score_data["_jury_name"] = jury_name
                score_data["_file"] = score_file.name

                jury_scores.append(score_data)

    return metadata, jury_scores


def calculate_statistics(jury_scores: List[dict]) -> dict:
    """Calculate aggregate statistics from jury scores"""

    stats = {
        "overall": {
            "vanilla_wins": 0,
            "skilled_wins": 0,
            "ties": 0,
            "total": 0,
            "vanilla_avg_score": [],
            "skilled_avg_score": [],
        },
        "by_skill": defaultdict(lambda: {
            "vanilla_wins": 0,
            "skilled_wins": 0,
            "ties": 0,
            "total": 0,
            "vanilla_scores": [],
            "skilled_scores": [],
            "tests": defaultdict(lambda: {"jury_results": []})
        }),
        "by_jury": defaultdict(lambda: {
            "vanilla_wins": 0,
            "skilled_wins": 0,
            "ties": 0,
            "total": 0,
        }),
    }

    for score in jury_scores:
        if "error" in score:
            continue

        skill_id = score.get("_skill_id", "unknown")
        test_id = score.get("_test_id", "unknown")
        jury_name = score.get("_jury_name", "unknown")
        position_map = score.get("position_map", {})

        # Determine winner
        winner_position = score.get("winner", "Tie")
        if winner_position == "A":
            actual_winner = position_map.get("A", "unknown")
        elif winner_position == "B":
            actual_winner = position_map.get("B", "unknown")
        else:
            actual_winner = "tie"

        # Get scores for each contestant
        response_a = score.get("response_a", {})
        response_b = score.get("response_b", {})

        vanilla_score = None
        skilled_score = None

        if position_map.get("A") == "vanilla":
            vanilla_score = response_a.get("benchmark_score")
            skilled_score = response_b.get("benchmark_score")
        else:
            vanilla_score = response_b.get("benchmark_score")
            skilled_score = response_a.get("benchmark_score")

        # Update overall stats
        stats["overall"]["total"] += 1
        if actual_winner == "vanilla":
            stats["overall"]["vanilla_wins"] += 1
        elif actual_winner == "skilled":
            stats["overall"]["skilled_wins"] += 1
        else:
            stats["overall"]["ties"] += 1

        if vanilla_score is not None:
            stats["overall"]["vanilla_avg_score"].append(vanilla_score)
        if skilled_score is not None:
            stats["overall"]["skilled_avg_score"].append(skilled_score)

        # Update by_skill stats
        skill_stats = stats["by_skill"][skill_id]
        skill_stats["total"] += 1
        if actual_winner == "vanilla":
            skill_stats["vanilla_wins"] += 1
        elif actual_winner == "skilled":
            skill_stats["skilled_wins"] += 1
        else:
            skill_stats["ties"] += 1

        if vanilla_score is not None:
            skill_stats["vanilla_scores"].append(vanilla_score)
        if skilled_score is not None:
            skill_stats["skilled_scores"].append(skilled_score)

        skill_stats["tests"][test_id]["jury_results"].append({
            "jury": jury_name,
            "winner": actual_winner,
            "vanilla_score": vanilla_score,
            "skilled_score": skilled_score,
            "reasoning": score.get("reasoning", ""),
        })

        # Update by_jury stats
        jury_stats = stats["by_jury"][jury_name]
        jury_stats["total"] += 1
        if actual_winner == "vanilla":
            jury_stats["vanilla_wins"] += 1
        elif actual_winner == "skilled":
            jury_stats["skilled_wins"] += 1
        else:
            jury_stats["ties"] += 1

    # Calculate averages
    if stats["overall"]["vanilla_avg_score"]:
        stats["overall"]["vanilla_avg"] = sum(stats["overall"]["vanilla_avg_score"]) / len(stats["overall"]["vanilla_avg_score"])
    else:
        stats["overall"]["vanilla_avg"] = 0

    if stats["overall"]["skilled_avg_score"]:
        stats["overall"]["skilled_avg"] = sum(stats["overall"]["skilled_avg_score"]) / len(stats["overall"]["skilled_avg_score"])
    else:
        stats["overall"]["skilled_avg"] = 0

    for skill_id, skill_stats in stats["by_skill"].items():
        if skill_stats["vanilla_scores"]:
            skill_stats["vanilla_avg"] = sum(skill_stats["vanilla_scores"]) / len(skill_stats["vanilla_scores"])
        else:
            skill_stats["vanilla_avg"] = 0

        if skill_stats["skilled_scores"]:
            skill_stats["skilled_avg"] = sum(skill_stats["skilled_scores"]) / len(skill_stats["skilled_scores"])
        else:
            skill_stats["skilled_avg"] = 0

    return stats


def generate_report_markdown(run_id: str, metadata: dict, stats: dict) -> str:
    """Generate the main benchmark report in markdown format"""

    overall = stats["overall"]
    total = overall["total"]

    if total == 0:
        return "# Benchmark Report\n\nNo results found."

    skilled_win_rate = (overall["skilled_wins"] / total) * 100 if total > 0 else 0
    vanilla_win_rate = (overall["vanilla_wins"] / total) * 100 if total > 0 else 0
    tie_rate = (overall["ties"] / total) * 100 if total > 0 else 0

    score_delta = overall["skilled_avg"] - overall["vanilla_avg"]

    report = f"""# Skill Benchmark Report

**Run ID:** {run_id}
**Date:** {metadata.get('timestamp', 'Unknown')}
**Skills Tested:** {', '.join(metadata.get('skills_tested', []))}
**Jury Models:** {', '.join(metadata.get('jury_models_used', []))}

---

## Overall Results

```
                    Vanilla    Skilled    Delta
Avg Benchmark:      {overall['vanilla_avg']:.1f}        {overall['skilled_avg']:.1f}       {score_delta:+.1f}
Win Rate:           {vanilla_win_rate:.0f}%         {skilled_win_rate:.0f}%
```

| Metric | Value |
|--------|-------|
| Skilled Wins | {overall['skilled_wins']} ({skilled_win_rate:.1f}%) |
| Vanilla Wins | {overall['vanilla_wins']} ({vanilla_win_rate:.1f}%) |
| Ties | {overall['ties']} ({tie_rate:.1f}%) |
| Total Evaluations | {total} |

**Target: 70% skilled win rate** {'✅ PASS' if skilled_win_rate >= 70 else '❌ BELOW TARGET'}

---

## Results by Jury Model

"""

    for jury_name, jury_stats in stats["by_jury"].items():
        j_total = jury_stats["total"]
        if j_total > 0:
            j_skilled_rate = (jury_stats["skilled_wins"] / j_total) * 100
            report += f"### {jury_name}\n"
            report += f"- Skilled wins: {jury_stats['skilled_wins']}/{j_total} ({j_skilled_rate:.0f}%)\n"
            report += f"- Vanilla wins: {jury_stats['vanilla_wins']}/{j_total}\n"
            report += f"- Ties: {jury_stats['ties']}/{j_total}\n\n"

    report += """---

## Results by Skill

"""

    for skill_id, skill_stats in stats["by_skill"].items():
        s_total = skill_stats["total"]
        if s_total > 0:
            s_skilled_rate = (skill_stats["skilled_wins"] / s_total) * 100
            s_delta = skill_stats["skilled_avg"] - skill_stats["vanilla_avg"]

            status = "✅" if s_skilled_rate >= 70 else "⚠️"

            report += f"""### {skill_id} {status}

| Metric | Vanilla | Skilled | Delta |
|--------|---------|---------|-------|
| Avg Score | {skill_stats['vanilla_avg']:.1f} | {skill_stats['skilled_avg']:.1f} | {s_delta:+.1f} |
| Wins | {skill_stats['vanilla_wins']} | {skill_stats['skilled_wins']} | - |

"""

    report += """---

## Detailed Test Results

"""

    for skill_id, skill_stats in stats["by_skill"].items():
        report += f"### {skill_id}\n\n"

        for test_id, test_data in skill_stats["tests"].items():
            report += f"#### {test_id}\n\n"
            report += "| Jury | Winner | Vanilla | Skilled | Reasoning |\n"
            report += "|------|--------|---------|---------|----------|\n"

            for result in test_data["jury_results"]:
                reasoning = result["reasoning"][:80] + "..." if len(result.get("reasoning", "")) > 80 else result.get("reasoning", "")
                report += f"| {result['jury']} | {result['winner']} | {result['vanilla_score']} | {result['skilled_score']} | {reasoning} |\n"

            report += "\n"

    report += f"""---

## Improvement Recommendations

Based on these results, focus on:

1. **Skills below 70% win rate** - Review sharp edges and identity
2. **Tests where skilled lost** - Analyze what vanilla did better
3. **Low jury agreement** - May indicate ambiguous test cases

---

*Generated: {datetime.now().isoformat()}*
"""

    return report


def generate_improvement_areas(skill_id: str, skill_stats: dict, run_id: str) -> str:
    """Generate improvement-areas.md for a specific skill"""

    s_total = skill_stats["total"]
    if s_total == 0:
        return ""

    s_skilled_rate = (skill_stats["skilled_wins"] / s_total) * 100
    s_delta = skill_stats["skilled_avg"] - skill_stats["vanilla_avg"]

    # Collect wins and losses
    wins = []
    losses = []

    for test_id, test_data in skill_stats["tests"].items():
        skilled_votes = sum(1 for r in test_data["jury_results"] if r["winner"] == "skilled")
        vanilla_votes = sum(1 for r in test_data["jury_results"] if r["winner"] == "vanilla")

        if skilled_votes > vanilla_votes:
            wins.append((test_id, test_data, skilled_votes, vanilla_votes))
        elif vanilla_votes > skilled_votes:
            losses.append((test_id, test_data, skilled_votes, vanilla_votes))

    content = f"""# {skill_id.replace('-', ' ').title()} Skill - Improvement Areas

> Generated from benchmark run {run_id}

## Benchmark Summary

| Metric | Value |
|--------|-------|
| Win Rate | {s_skilled_rate:.1f}% {'✅' if s_skilled_rate >= 70 else '⚠️ BELOW TARGET'} |
| Avg Score Delta | {s_delta:+.1f} (Skilled: {skill_stats['skilled_avg']:.1f}, Vanilla: {skill_stats['vanilla_avg']:.1f}) |
| Tests Evaluated | {s_total} |

"""

    if losses:
        content += "## Tests Where Skill Lost\n\n"
        for test_id, test_data, skilled_votes, vanilla_votes in losses:
            content += f"### {test_id}\n"
            content += f"- **Jury vote:** Vanilla {vanilla_votes} - Skilled {skilled_votes}\n"
            content += "- **Jury reasoning:**\n"
            for r in test_data["jury_results"]:
                if r["winner"] == "vanilla":
                    content += f"  - {r['jury']}: {r.get('reasoning', 'No reasoning provided')}\n"
            content += "- **Root cause:** [TODO: Analyze]\n"
            content += "- **Action:** [TODO: Define fix]\n"
            content += "- **Status:** [ ] Not started\n\n"

    if wins:
        content += "## Tests Where Skill Won (Reinforce)\n\n"
        for test_id, test_data, skilled_votes, vanilla_votes in wins:
            content += f"### {test_id}\n"
            content += f"- **Jury vote:** Skilled {skilled_votes} - Vanilla {vanilla_votes}\n"
            for r in test_data["jury_results"]:
                if r["winner"] == "skilled":
                    content += f"- **Why it won ({r['jury']}):** {r.get('reasoning', 'No reasoning provided')}\n"
            content += "\n"

    content += f"""## Improvement Backlog

- [ ] Review tests where skill lost
- [ ] Analyze jury reasoning for patterns
- [ ] Update sharp edges if gaps found
- [ ] Strengthen identity if expertise lacking
- [ ] Re-run benchmark after fixes

---

*Last updated: {datetime.now().strftime('%Y-%m-%d')}*
"""

    return content


def save_report(run_id: str, report: str):
    """Save the main report"""
    output_path = Path(__file__).parent.parent / "outputs" / run_id / "report.md"
    with open(output_path, "w", encoding="utf-8") as f:
        f.write(report)
    print(f"Report saved: {output_path}")


def save_improvement_areas(skill_id: str, content: str):
    """Save improvement-areas.md to skill folder"""
    # Find the skill folder
    skills_base = Path(__file__).parent.parent.parent / "spawner-v2" / "skills"

    # Search for the skill folder
    for category in skills_base.iterdir():
        if category.is_dir():
            skill_folder = category / skill_id
            if skill_folder.exists():
                output_path = skill_folder / "improvement-areas.md"
                with open(output_path, "w", encoding="utf-8") as f:
                    f.write(content)
                print(f"Improvement areas saved: {output_path}")
                return

    print(f"Warning: Could not find skill folder for {skill_id}")


def main():
    parser = argparse.ArgumentParser(description="Generate benchmark report")
    parser.add_argument("--run-id", required=True, help="Run ID to generate report for")
    parser.add_argument("--no-improvement-files", action="store_true",
                        help="Skip generating per-skill improvement files")
    args = parser.parse_args()

    print(f"\n{'='*60}")
    print(f"SKILL BENCHMARK - Report Generation")
    print(f"Run ID: {args.run_id}")
    print(f"{'='*60}\n")

    metadata, jury_scores = load_run_data(args.run_id)

    if metadata is None:
        return

    print(f"Loaded {len(jury_scores)} jury evaluations")

    # Calculate statistics
    stats = calculate_statistics(jury_scores)

    # Generate main report
    report = generate_report_markdown(args.run_id, metadata, stats)
    save_report(args.run_id, report)

    # Generate per-skill improvement files
    if not args.no_improvement_files:
        print("\nGenerating skill improvement files...")
        for skill_id, skill_stats in stats["by_skill"].items():
            content = generate_improvement_areas(skill_id, skill_stats, args.run_id)
            if content:
                save_improvement_areas(skill_id, content)

    print(f"\n{'='*60}")
    print(f"Report generation complete!")
    print(f"\nView report: outputs/{args.run_id}/report.md")
    print(f"{'='*60}\n")


if __name__ == "__main__":
    main()
