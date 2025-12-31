/**
 * Workflow Engine
 *
 * Orchestrates skill execution in different patterns:
 * - sequential: Skills run one after another, passing state
 * - parallel: Skills run concurrently, results merged
 * - conditional: Skills chosen based on state conditions
 * - supervised: Generator-critic loops with quality gates
 */

import type { Env, Validation } from '../types.js';
import { loadSkill, loadSkillValidations, type Skill, type Collaboration } from '../skills/loader.js';

// =============================================================================
// Types
// =============================================================================

export interface WorkflowStep {
  skill: string;
  inputs?: string[];           // Required input keys from state
  outputs?: string[];          // Keys this step adds to state
  condition?: string;          // JS expression for conditional execution
  quality_gate?: QualityGate;  // Optional quality check after step
  timeout_ms?: number;         // Step timeout (default: 30000)
}

export interface QualityGate {
  validator: string;           // Skill ID that validates output
  criteria: string[];          // What must pass
  max_iterations?: number;     // Max retry loops (default: 3)
  on_fail: 'retry' | 'block' | 'warn';
}

export interface WorkflowDefinition {
  id: string;
  name: string;
  description?: string;
  mode: 'sequential' | 'parallel' | 'conditional' | 'supervised';
  steps: WorkflowStep[];
  initial_state?: Record<string, unknown>;
  final_outputs?: string[];    // Keys to extract from final state
}

export interface WorkflowState {
  workflow_id: string;
  current_step: number;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'blocked';
  data: Record<string, unknown>;
  history: StepResult[];
  started_at: number;
  updated_at: number;
  error?: string;
}

export interface StepResult {
  step_index: number;
  skill: string;
  status: 'success' | 'failed' | 'skipped' | 'retrying';
  inputs: Record<string, unknown>;
  outputs: Record<string, unknown>;
  duration_ms: number;
  quality_gate_passed?: boolean;
  iteration?: number;
  error?: string;
}

export interface WorkflowEvent {
  type: 'workflow:start' | 'workflow:step' | 'workflow:complete' | 'workflow:error' | 'workflow:gate';
  workflow_id: string;
  timestamp: number;
  data: Record<string, unknown>;
}

export interface QualityGateResult {
  passed: boolean;
  validator_skill: string;
  criteria_checked: Array<{
    criterion: string;
    passed: boolean;
    details?: string;
  }>;
  validation_errors: Array<{
    validation_id: string;
    severity: 'critical' | 'error' | 'warning';
    message: string;
    matched_pattern?: string;
  }>;
  iteration: number;
  max_iterations: number;
  action: 'continue' | 'retry' | 'block' | 'warn';
  feedback: string;
}

// =============================================================================
// Built-in Workflows (Templates)
// =============================================================================

export const BUILTIN_WORKFLOWS: Record<string, WorkflowDefinition> = {
  'feature-build': {
    id: 'feature-build',
    name: 'Feature Build Pipeline',
    description: 'Standard flow: design → backend → frontend → test',
    mode: 'sequential',
    steps: [
      { skill: 'product-discovery', outputs: ['requirements', 'user_stories'] },
      { skill: 'backend', inputs: ['requirements'], outputs: ['api_design', 'endpoints'] },
      { skill: 'frontend', inputs: ['api_design'], outputs: ['components', 'pages'] },
      {
        skill: 'testing',
        inputs: ['endpoints', 'components'],
        quality_gate: {
          validator: 'code-review',
          criteria: ['no_critical_bugs', 'tests_pass'],
          on_fail: 'retry',
          max_iterations: 2
        }
      }
    ]
  },
  'security-audit': {
    id: 'security-audit',
    name: 'Security Audit Pipeline',
    description: 'Comprehensive security review with quality gates',
    mode: 'supervised',
    steps: [
      { skill: 'security-owasp', outputs: ['vulnerability_report'] },
      {
        skill: 'llm-security-audit',
        inputs: ['vulnerability_report'],
        quality_gate: {
          validator: 'security-owasp',
          criteria: ['no_critical', 'no_high'],
          on_fail: 'block'
        }
      }
    ]
  },
  'game-jam': {
    id: 'game-jam',
    name: 'Game Jam Speed Build',
    description: 'Rapid game development with AI art',
    mode: 'sequential',
    steps: [
      { skill: 'prompt-to-game', outputs: ['game_code', 'asset_requirements'] },
      { skill: 'ai-game-art-generation', inputs: ['asset_requirements'], outputs: ['sprites', 'textures'] },
      { skill: 'prompt-to-game', inputs: ['sprites'], outputs: ['integrated_game'] },
      { skill: 'devops', inputs: ['integrated_game'], outputs: ['deployed_url'] }
    ]
  },
  'research-to-code': {
    id: 'research-to-code',
    name: 'Research to Implementation',
    description: 'Research problem → design solution → implement',
    mode: 'sequential',
    steps: [
      { skill: 'product-discovery', outputs: ['problem_definition', 'constraints'] },
      { skill: 'system-designer', inputs: ['problem_definition'], outputs: ['architecture', 'tech_choices'] },
      { skill: 'backend', inputs: ['architecture'], outputs: ['implementation'] }
    ]
  }
};

// =============================================================================
// Workflow Engine
// =============================================================================

export class WorkflowEngine {
  private env: Env;
  private state: WorkflowState | null = null;
  private events: WorkflowEvent[] = [];

  constructor(env: Env) {
    this.env = env;
  }

  /**
   * Start a new workflow
   */
  async start(
    workflow: WorkflowDefinition,
    initialData?: Record<string, unknown>
  ): Promise<WorkflowState> {
    this.state = {
      workflow_id: workflow.id,
      current_step: 0,
      status: 'running',
      data: { ...workflow.initial_state, ...initialData },
      history: [],
      started_at: Date.now(),
      updated_at: Date.now()
    };

    this.emitEvent('workflow:start', {
      name: workflow.name,
      mode: workflow.mode,
      total_steps: workflow.steps.length
    });

    return this.state;
  }

  /**
   * Execute the next step in the workflow
   */
  async executeStep(workflow: WorkflowDefinition): Promise<StepResult | null> {
    if (!this.state || this.state.status !== 'running') {
      return null;
    }

    const stepIndex = this.state.current_step;
    if (stepIndex >= workflow.steps.length) {
      this.state.status = 'completed';
      this.emitEvent('workflow:complete', {
        total_duration_ms: Date.now() - this.state.started_at,
        steps_completed: this.state.history.length
      });
      return null;
    }

    const step = workflow.steps[stepIndex];
    if (!step) {
      this.state.status = 'failed';
      this.state.error = `Step ${stepIndex} not found in workflow`;
      return null;
    }
    const startTime = Date.now();

    // Check condition if present
    if (step.condition) {
      const shouldRun = this.evaluateCondition(step.condition, this.state.data);
      if (!shouldRun) {
        const result: StepResult = {
          step_index: stepIndex,
          skill: step.skill,
          status: 'skipped',
          inputs: {},
          outputs: {},
          duration_ms: 0
        };
        this.state.history.push(result);
        this.state.current_step++;
        return result;
      }
    }

    // Validate required inputs
    const inputValidation = this.validateInputs(step, this.state.data);
    if (!inputValidation.valid) {
      const result: StepResult = {
        step_index: stepIndex,
        skill: step.skill,
        status: 'failed',
        inputs: {},
        outputs: {},
        duration_ms: Date.now() - startTime,
        error: `Missing required inputs: ${inputValidation.missing.join(', ')}`
      };
      this.state.history.push(result);
      this.state.status = 'failed';
      this.state.error = result.error;
      return result;
    }

    // Load the skill to get its full context
    const skill = await loadSkill(this.env, step.skill);
    if (!skill) {
      const result: StepResult = {
        step_index: stepIndex,
        skill: step.skill,
        status: 'failed',
        inputs: inputValidation.inputs,
        outputs: {},
        duration_ms: Date.now() - startTime,
        error: `Skill not found: ${step.skill}`
      };
      this.state.history.push(result);
      this.state.status = 'failed';
      this.state.error = result.error;
      return result;
    }

    // Emit step event
    this.emitEvent('workflow:step', {
      step_index: stepIndex,
      skill: step.skill,
      skill_name: skill.name,
      inputs: Object.keys(inputValidation.inputs)
    });

    // Create step result (actual execution happens in Claude)
    const result: StepResult = {
      step_index: stepIndex,
      skill: step.skill,
      status: 'success',
      inputs: inputValidation.inputs,
      outputs: {},
      duration_ms: Date.now() - startTime
    };

    this.state.history.push(result);
    this.state.current_step++;
    this.state.updated_at = Date.now();

    return result;
  }

  /**
   * Run quality gate check with actual enforcement
   */
  async checkQualityGate(
    step: WorkflowStep,
    outputs: Record<string, unknown>,
    iteration: number = 1
  ): Promise<QualityGateResult> {
    // Default pass result for steps without gates
    if (!step.quality_gate) {
      return {
        passed: true,
        validator_skill: 'none',
        criteria_checked: [],
        validation_errors: [],
        iteration,
        max_iterations: 1,
        action: 'continue',
        feedback: 'No quality gate defined - proceeding.'
      };
    }

    const gate = step.quality_gate;
    const maxIterations = gate.max_iterations ?? 3;

    // Load validator skill
    const validator = await loadSkill(this.env, gate.validator);
    if (!validator) {
      return {
        passed: false,
        validator_skill: gate.validator,
        criteria_checked: [],
        validation_errors: [{
          validation_id: 'validator_not_found',
          severity: 'critical',
          message: `Validator skill not found: ${gate.validator}`
        }],
        iteration,
        max_iterations: maxIterations,
        action: 'block',
        feedback: `Cannot run quality gate: validator skill "${gate.validator}" not found.`
      };
    }

    // Load validator's validations (code patterns to check)
    const validations = await loadSkillValidations(this.env, gate.validator);

    // Run validation checks against outputs
    const validationErrors: QualityGateResult['validation_errors'] = [];
    const outputStr = JSON.stringify(outputs);
    const outputCode = typeof outputs.code === 'string' ? outputs.code : outputStr;

    for (const validation of validations) {
      const patterns = Array.isArray(validation.pattern) ? validation.pattern : [validation.pattern];

      for (const pattern of patterns) {
        try {
          const regex = new RegExp(pattern, 'gi');
          if (regex.test(outputCode)) {
            validationErrors.push({
              validation_id: validation.id,
              severity: validation.severity,
              message: validation.message,
              matched_pattern: pattern
            });
          }
        } catch {
          // Invalid regex, skip
        }
      }
    }

    // Check criteria against output data
    const criteriaResults: QualityGateResult['criteria_checked'] = [];

    for (const criterion of gate.criteria) {
      const { passed, details } = this.evaluateCriterion(criterion, outputs, validationErrors);
      criteriaResults.push({ criterion, passed, details });
    }

    // Determine if gate passed
    const criticalErrors = validationErrors.filter(e => e.severity === 'critical');
    const hasFailedCriteria = criteriaResults.some(c => !c.passed);
    const passed = criticalErrors.length === 0 && !hasFailedCriteria;

    // Determine action based on result and on_fail setting
    let action: QualityGateResult['action'] = 'continue';
    if (!passed) {
      if (iteration < maxIterations && gate.on_fail === 'retry') {
        action = 'retry';
      } else if (gate.on_fail === 'block') {
        action = 'block';
      } else if (gate.on_fail === 'warn') {
        action = 'warn';
      } else if (gate.on_fail === 'retry' && iteration >= maxIterations) {
        action = 'block'; // Max retries exceeded
      }
    }

    // Build feedback message
    const feedback = this.buildGateFeedback(
      passed,
      criteriaResults,
      validationErrors,
      iteration,
      maxIterations,
      action
    );

    // Emit gate event
    this.emitEvent('workflow:gate', {
      step: step.skill,
      validator: gate.validator,
      iteration,
      max_iterations: maxIterations,
      criteria: gate.criteria,
      passed,
      action,
      errors_count: validationErrors.length
    });

    return {
      passed,
      validator_skill: gate.validator,
      criteria_checked: criteriaResults,
      validation_errors: validationErrors,
      iteration,
      max_iterations: maxIterations,
      action,
      feedback
    };
  }

  /**
   * Evaluate a single criterion against outputs
   */
  private evaluateCriterion(
    criterion: string,
    outputs: Record<string, unknown>,
    validationErrors: QualityGateResult['validation_errors']
  ): { passed: boolean; details?: string } {
    // Built-in criteria checks
    switch (criterion.toLowerCase()) {
      case 'no_critical':
      case 'no_critical_bugs':
        const criticalCount = validationErrors.filter(e => e.severity === 'critical').length;
        return {
          passed: criticalCount === 0,
          details: criticalCount > 0 ? `Found ${criticalCount} critical issues` : 'No critical issues'
        };

      case 'no_high':
        const highCount = validationErrors.filter(e => e.severity === 'critical' || e.severity === 'error').length;
        return {
          passed: highCount === 0,
          details: highCount > 0 ? `Found ${highCount} high-severity issues` : 'No high-severity issues'
        };

      case 'tests_pass':
        const testsPass = outputs.tests_passed === true || outputs.test_status === 'passed';
        return {
          passed: testsPass,
          details: testsPass ? 'Tests passed' : 'Tests did not pass or were not run'
        };

      case 'no_warnings':
        const warningCount = validationErrors.length;
        return {
          passed: warningCount === 0,
          details: warningCount > 0 ? `Found ${warningCount} warnings` : 'No warnings'
        };

      case 'has_tests':
        const hasTests = outputs.tests !== undefined || outputs.test_files !== undefined;
        return {
          passed: hasTests,
          details: hasTests ? 'Tests are present' : 'No tests found'
        };

      case 'has_docs':
        const hasDocs = outputs.documentation !== undefined || outputs.docs !== undefined;
        return {
          passed: hasDocs,
          details: hasDocs ? 'Documentation is present' : 'No documentation found'
        };

      default:
        // Check if criterion is a state key that should be truthy
        if (outputs[criterion] !== undefined) {
          const passed = Boolean(outputs[criterion]);
          return {
            passed,
            details: passed ? `${criterion} is present` : `${criterion} is missing or falsy`
          };
        }

        // Unknown criterion - pass by default with warning
        return {
          passed: true,
          details: `Unknown criterion: ${criterion} (skipped)`
        };
    }
  }

  /**
   * Build human-readable feedback message
   */
  private buildGateFeedback(
    passed: boolean,
    criteria: QualityGateResult['criteria_checked'],
    errors: QualityGateResult['validation_errors'],
    iteration: number,
    maxIterations: number,
    action: QualityGateResult['action']
  ): string {
    const lines: string[] = [];

    if (passed) {
      lines.push('✅ **Quality Gate PASSED**');
      lines.push('');
      lines.push('All criteria met:');
      for (const c of criteria) {
        lines.push(`  ✓ ${c.criterion}: ${c.details || 'passed'}`);
      }
    } else {
      lines.push('❌ **Quality Gate FAILED**');
      lines.push('');

      // Show failed criteria
      const failed = criteria.filter(c => !c.passed);
      if (failed.length > 0) {
        lines.push('**Failed Criteria:**');
        for (const c of failed) {
          lines.push(`  ✗ ${c.criterion}: ${c.details || 'failed'}`);
        }
        lines.push('');
      }

      // Show validation errors
      if (errors.length > 0) {
        lines.push('**Validation Errors:**');
        for (const e of errors.slice(0, 5)) {
          const icon = e.severity === 'critical' ? '🚨' : e.severity === 'error' ? '❌' : '⚠️';
          lines.push(`  ${icon} [${e.severity}] ${e.message}`);
        }
        if (errors.length > 5) {
          lines.push(`  ... and ${errors.length - 5} more`);
        }
        lines.push('');
      }

      // Show action
      lines.push(`**Iteration:** ${iteration}/${maxIterations}`);
      switch (action) {
        case 'retry':
          lines.push('**Action:** Retrying step with feedback above');
          break;
        case 'block':
          lines.push('**Action:** Workflow BLOCKED - manual intervention required');
          break;
        case 'warn':
          lines.push('**Action:** Continuing with warnings (not recommended)');
          break;
      }
    }

    return lines.join('\n');
  }

  /**
   * Validate inputs are present in state
   */
  private validateInputs(
    step: WorkflowStep,
    state: Record<string, unknown>
  ): { valid: boolean; missing: string[]; inputs: Record<string, unknown> } {
    if (!step.inputs || step.inputs.length === 0) {
      return { valid: true, missing: [], inputs: {} };
    }

    const missing: string[] = [];
    const inputs: Record<string, unknown> = {};

    for (const key of step.inputs) {
      if (state[key] === undefined) {
        missing.push(key);
      } else {
        inputs[key] = state[key];
      }
    }

    return { valid: missing.length === 0, missing, inputs };
  }

  /**
   * Evaluate a condition expression
   */
  private evaluateCondition(condition: string, state: Record<string, unknown>): boolean {
    try {
      // Simple condition evaluation (safe subset)
      // Supports: state.key, comparisons, boolean logic
      const safeCondition = condition
        .replace(/state\./g, 'state.')
        .replace(/[^a-zA-Z0-9_.\s<>=!&|()]/g, '');

      const fn = new Function('state', `return ${safeCondition}`);
      return Boolean(fn(state));
    } catch {
      return true; // Default to running if condition is invalid
    }
  }

  /**
   * Emit a workflow event
   */
  private emitEvent(type: WorkflowEvent['type'], data: Record<string, unknown>): void {
    const event: WorkflowEvent = {
      type,
      workflow_id: this.state?.workflow_id || 'unknown',
      timestamp: Date.now(),
      data
    };
    this.events.push(event);
  }

  /**
   * Get current state
   */
  getState(): WorkflowState | null {
    return this.state;
  }

  /**
   * Get all events
   */
  getEvents(): WorkflowEvent[] {
    return this.events;
  }

  /**
   * Format events for notification display
   */
  formatEventsForDisplay(): string {
    return this.events.map(e => {
      const marker = `[SPAWNER_EVENT]${JSON.stringify(e)}[/SPAWNER_EVENT]`;
      return marker;
    }).join('\n');
  }
}

// =============================================================================
// Helper Functions
// =============================================================================

/**
 * Get a built-in workflow by ID
 */
export function getBuiltinWorkflow(id: string): WorkflowDefinition | null {
  return BUILTIN_WORKFLOWS[id] || null;
}

/**
 * List all built-in workflows
 */
export function listBuiltinWorkflows(): { id: string; name: string; description?: string }[] {
  return Object.values(BUILTIN_WORKFLOWS).map(w => ({
    id: w.id,
    name: w.name,
    description: w.description
  }));
}

/**
 * Create a simple sequential workflow from skill IDs
 */
export function createSequentialWorkflow(
  id: string,
  name: string,
  skillIds: string[]
): WorkflowDefinition {
  return {
    id,
    name,
    mode: 'sequential',
    steps: skillIds.map(skill => ({ skill }))
  };
}

/**
 * Format workflow state for display
 */
export function formatWorkflowState(state: WorkflowState): string {
  const lines: string[] = [];

  lines.push(`## Workflow: ${state.workflow_id}`);
  lines.push(`Status: **${state.status.toUpperCase()}**`);
  lines.push(`Progress: Step ${state.current_step + 1}`);
  lines.push('');

  if (state.history.length > 0) {
    lines.push('### Completed Steps:');
    for (const step of state.history) {
      const icon = step.status === 'success' ? '✓' : step.status === 'skipped' ? '○' : '✗';
      lines.push(`${icon} **${step.skill}** (${step.duration_ms}ms)`);
    }
  }

  if (state.error) {
    lines.push('');
    lines.push(`### Error:`);
    lines.push(state.error);
  }

  return lines.join('\n');
}
