"""CLI flag validation tests for vibeship-spawner.

Tests that all enhance CLI flags parse correctly across 3 scripts:
- run-jury.py: --output-dir, --verbose, --max-samples, --version, --config
- run-contestants.py: --verbose, --timeout, --parallel, --version, --config
- generate-report.py: --format, --output-file, --no-improvement-files, --version, --config
"""

import os
import sys
import subprocess
import pytest

SCRIPTS_DIR = os.path.join(os.path.dirname(__file__), "..", "benchmarks", "scripts")


def run_help(script_name):
    """Run a script with --help and return stdout"""
    script_path = os.path.join(SCRIPTS_DIR, script_name)
    result = subprocess.run(
        [sys.executable, script_path, "--help"],
        capture_output=True,
        text=True,
    )
    return result.stdout


# --- run-jury.py tests ---

def test_jury_output_dir_flag():
    help_out = run_help("run-jury.py")
    assert "--output-dir" in help_out, "--output-dir flag should be defined in run-jury.py"


def test_jury_verbose_flag():
    help_out = run_help("run-jury.py")
    assert "--verbose" in help_out, "--verbose flag should be defined in run-jury.py"


def test_jury_max_samples_flag():
    help_out = run_help("run-jury.py")
    assert "--max-samples" in help_out, "--max-samples flag should be defined in run-jury.py"


def test_jury_version_flag():
    help_out = run_help("run-jury.py")
    assert "--version" in help_out, "--version flag should be defined in run-jury.py"


def test_jury_config_flag():
    help_out = run_help("run-jury.py")
    assert "--config" in help_out, "--config flag should be defined in run-jury.py"


# --- run-contestants.py tests ---

def test_contestants_verbose_flag():
    help_out = run_help("run-contestants.py")
    assert "--verbose" in help_out, "--verbose flag should be defined in run-contestants.py"


def test_contestants_timeout_flag():
    help_out = run_help("run-contestants.py")
    assert "--timeout" in help_out, "--timeout flag should be defined in run-contestants.py"


def test_contestants_parallel_flag():
    help_out = run_help("run-contestants.py")
    assert "--parallel" in help_out, "--parallel flag should be defined in run-contestants.py"


def test_contestants_version_flag():
    help_out = run_help("run-contestants.py")
    assert "--version" in help_out, "--version flag should be defined in run-contestants.py"


def test_contestants_config_flag():
    help_out = run_help("run-contestants.py")
    assert "--config" in help_out, "--config flag should be defined in run-contestants.py"


# --- generate-report.py tests ---

def test_report_format_flag():
    help_out = run_help("generate-report.py")
    assert "--format" in help_out, "--format flag should be defined in generate-report.py"


def test_report_output_file_flag():
    help_out = run_help("generate-report.py")
    assert "--output-file" in help_out, "--output-file flag should be defined in generate-report.py"


def test_report_no_improvement_files_flag():
    help_out = run_help("generate-report.py")
    assert "--no-improvement-files" in help_out, "--no-improvement-files flag should be defined in generate-report.py"


def test_report_version_flag():
    help_out = run_help("generate-report.py")
    assert "--version" in help_out, "--version flag should be defined in generate-report.py"


def test_report_config_flag():
    help_out = run_help("generate-report.py")
    assert "--config" in help_out, "--config flag should be defined in generate-report.py"
