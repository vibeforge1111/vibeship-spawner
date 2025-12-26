/**
 * Box Drawing and Color Utilities
 *
 * Consistent terminal rendering with proper box alignment
 */
export declare const COLORS: {
    readonly reset: "\u001B[0m";
    readonly bold: "\u001B[1m";
    readonly dim: "\u001B[2m";
    readonly success: "\u001B[32m";
    readonly warning: "\u001B[33m";
    readonly error: "\u001B[31m";
    readonly info: "\u001B[36m";
    readonly frontend: "\u001B[35m";
    readonly backend: "\u001B[34m";
    readonly database: "\u001B[33m";
    readonly testing: "\u001B[32m";
    readonly planner: "\u001B[36m";
    readonly devops: "\u001B[35m";
    readonly default: "\u001B[37m";
};
export declare const BOX: {
    readonly topLeft: "┌";
    readonly topRight: "┐";
    readonly bottomLeft: "└";
    readonly bottomRight: "┘";
    readonly horizontal: "─";
    readonly vertical: "│";
    readonly teeRight: "├";
    readonly teeLeft: "┤";
    readonly teeDown: "┬";
    readonly teeUp: "┴";
    readonly cross: "┼";
};
export declare const DBOX: {
    readonly topLeft: "╔";
    readonly topRight: "╗";
    readonly bottomLeft: "╚";
    readonly bottomRight: "╝";
    readonly horizontal: "═";
    readonly vertical: "║";
    readonly teeRight: "╠";
    readonly teeLeft: "╣";
    readonly teeDown: "╦";
    readonly teeUp: "╩";
    readonly cross: "╬";
};
export declare const BOX_WIDTH = 55;
export declare const PROGRESS: {
    readonly filled: "█";
    readonly empty: "░";
};
export declare const ICONS: {
    readonly check: "✓";
    readonly cross: "✗";
    readonly spinner: "⟳";
    readonly waiting: "⏳";
    readonly arrow: "→";
    readonly arrowLeft: "←";
    readonly lightning: "↯";
    readonly stop: "⛔";
    readonly warning: "⚠";
};
export declare const AGENT_ICONS: Record<string, string>;
/**
 * Get color for agent by name
 */
export declare function getAgentColor(name: string): string;
/**
 * Get icon for agent by name
 */
export declare function getAgentIcon(name: string): string;
/**
 * Colorize text
 */
export declare function colorize(text: string, color: string): string;
/**
 * Make text bold
 */
export declare function bold(text: string): string;
/**
 * Make text dim
 */
export declare function dim(text: string): string;
/**
 * Render a progress bar
 */
export declare function progressBar(percent: number, width?: number): string;
/**
 * Pad string to width, accounting for emoji/unicode
 */
export declare function padEnd(str: string, width: number): string;
/**
 * Strip ANSI codes for length calculation
 */
export declare function stripAnsi(str: string): string;
/**
 * Calculate visual width of a string (accounting for emojis which are 2 chars wide)
 */
export declare function visualWidth(str: string): number;
/**
 * Draw a single-line box around content
 */
export declare function drawBox(content: string[], width?: number, title?: string, titleColor?: string): string;
/**
 * Draw a double-line box (for emphasis)
 */
export declare function drawDoubleBox(content: string[], width?: number, title?: string, titleColor?: string): string;
/**
 * Draw a double-line box with a divider
 */
export declare function drawDoubleBoxWithDivider(topContent: string[], bottomContent: string[], width?: number, title?: string, titleColor?: string): string;
/**
 * Format duration in human readable form
 */
export declare function formatDuration(ms: number): string;
/**
 * Truncate string with ellipsis
 */
export declare function truncate(str: string, maxLength: number): string;
