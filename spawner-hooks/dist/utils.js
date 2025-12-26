/**
 * Box Drawing and Color Utilities
 *
 * Consistent terminal rendering with proper box alignment
 */
import stringWidth from 'string-width';
// ANSI color codes
export const COLORS = {
    reset: '\x1b[0m',
    bold: '\x1b[1m',
    dim: '\x1b[2m',
    // Status colors
    success: '\x1b[32m', // Green
    warning: '\x1b[33m', // Yellow
    error: '\x1b[31m', // Red
    info: '\x1b[36m', // Cyan
    // Agent colors
    frontend: '\x1b[35m', // Magenta
    backend: '\x1b[34m', // Blue
    database: '\x1b[33m', // Yellow
    testing: '\x1b[32m', // Green
    planner: '\x1b[36m', // Cyan
    devops: '\x1b[35m', // Magenta
    default: '\x1b[37m', // White
};
// Box drawing characters - single line (normal)
export const BOX = {
    topLeft: '\u250C', // ┌
    topRight: '\u2510', // ┐
    bottomLeft: '\u2514', // └
    bottomRight: '\u2518', // ┘
    horizontal: '\u2500', // ─
    vertical: '\u2502', // │
    teeRight: '\u251C', // ├
    teeLeft: '\u2524', // ┤
    teeDown: '\u252C', // ┬
    teeUp: '\u2534', // ┴
    cross: '\u253C', // ┼
};
// Box drawing characters - double line (emphasis)
export const DBOX = {
    topLeft: '\u2554', // ╔
    topRight: '\u2557', // ╗
    bottomLeft: '\u255A', // ╚
    bottomRight: '\u255D', // ╝
    horizontal: '\u2550', // ═
    vertical: '\u2551', // ║
    teeRight: '\u2560', // ╠
    teeLeft: '\u2563', // ╣
    teeDown: '\u2566', // ╦
    teeUp: '\u2569', // ╩
    cross: '\u256C', // ╬
};
// Standard box width for consistency
export const BOX_WIDTH = 55;
// Progress bar characters
export const PROGRESS = {
    filled: '\u2588', // █
    empty: '\u2591', // ░
};
// Status icons
export const ICONS = {
    check: '\u2713', // ✓
    cross: '\u2717', // ✗
    spinner: '\u27F3', // ⟳
    waiting: '\u23F3', // ⏳
    arrow: '\u2192', // →
    arrowLeft: '\u2190', // ←
    lightning: '\u21AF', // ↯
    stop: '\u26D4', // ⛔
    warning: '\u26A0', // ⚠
};
// Agent icons map
export const AGENT_ICONS = {
    frontend: '\uD83C\uDFA8', // 🎨
    backend: '\u2699\uFE0F', // ⚙️
    database: '\uD83D\uDDC4\uFE0F', // 🗄️
    testing: '\uD83E\uDDEA', // 🧪
    planner: '\uD83C\uDFAF', // 🎯
    devops: '\u2601\uFE0F', // ☁️
    payments: '\uD83D\uDCB3', // 💳
    email: '\uD83D\uDCE7', // 📧
    search: '\uD83D\uDD0D', // 🔍
    ai: '\uD83E\uDDE0', // 🧠
    default: '\uD83E\uDD16', // 🤖
};
/**
 * Get color for agent by name
 */
export function getAgentColor(name) {
    const key = name.toLowerCase();
    return COLORS[key] || COLORS.default;
}
/**
 * Get icon for agent by name
 */
export function getAgentIcon(name) {
    const key = name.toLowerCase();
    return AGENT_ICONS[key] || AGENT_ICONS.default;
}
/**
 * Colorize text
 */
export function colorize(text, color) {
    return `${color}${text}${COLORS.reset}`;
}
/**
 * Make text bold
 */
export function bold(text) {
    return `${COLORS.bold}${text}${COLORS.reset}`;
}
/**
 * Make text dim
 */
export function dim(text) {
    return `${COLORS.dim}${text}${COLORS.reset}`;
}
/**
 * Render a progress bar
 */
export function progressBar(percent, width = 20) {
    const clamped = Math.max(0, Math.min(100, percent));
    const filled = Math.round((clamped / 100) * width);
    const empty = width - filled;
    const bar = PROGRESS.filled.repeat(filled) + PROGRESS.empty.repeat(empty);
    return `${bar} ${clamped}%`;
}
/**
 * Pad string to width, accounting for emoji/unicode visual width
 */
export function padEnd(str, width) {
    const visWidth = visualWidth(str);
    const padding = Math.max(0, width - visWidth);
    return str + ' '.repeat(padding);
}
/**
 * Strip ANSI codes for length calculation
 */
export function stripAnsi(str) {
    // eslint-disable-next-line no-control-regex
    return str.replace(/\x1b\[[0-9;]*m/g, '');
}
/**
 * Calculate visual width of a string (accounting for emojis, unicode, etc.)
 * Uses string-width library for accurate terminal width calculation
 */
export function visualWidth(str) {
    return stringWidth(stripAnsi(str));
}
/**
 * Draw a single-line box around content
 */
export function drawBox(content, width = BOX_WIDTH, title, titleColor) {
    const innerWidth = width - 2; // Account for left/right borders
    const lines = [];
    // Top border with optional title
    if (title) {
        const coloredTitle = titleColor ? colorize(` ${title} `, titleColor) : ` ${title} `;
        const titleLen = visualWidth(coloredTitle);
        const remainingWidth = innerWidth - titleLen - 1;
        lines.push(BOX.topLeft +
            BOX.horizontal +
            coloredTitle +
            BOX.horizontal.repeat(Math.max(0, remainingWidth)) +
            BOX.topRight);
    }
    else {
        lines.push(BOX.topLeft + BOX.horizontal.repeat(innerWidth) + BOX.topRight);
    }
    // Content lines
    for (const line of content) {
        const contentWidth = innerWidth - 2; // Account for padding
        const lineWidth = visualWidth(line);
        const truncated = lineWidth > contentWidth
            ? truncateVisual(line, contentWidth - 3) + '...'
            : line;
        const padded = padEnd(truncated, contentWidth);
        lines.push(BOX.vertical + ' ' + padded + ' ' + BOX.vertical);
    }
    // Bottom border
    lines.push(BOX.bottomLeft + BOX.horizontal.repeat(innerWidth) + BOX.bottomRight);
    return lines.join('\n');
}
/**
 * Draw a double-line box (for emphasis)
 */
export function drawDoubleBox(content, width = BOX_WIDTH, title, titleColor) {
    const innerWidth = width - 2;
    const lines = [];
    // Top border with optional title
    if (title) {
        const coloredTitle = titleColor ? colorize(` ${title} `, titleColor) : ` ${title} `;
        const titleLen = visualWidth(coloredTitle);
        const remainingWidth = innerWidth - titleLen - 1;
        lines.push(DBOX.topLeft +
            DBOX.horizontal +
            coloredTitle +
            DBOX.horizontal.repeat(Math.max(0, remainingWidth)) +
            DBOX.topRight);
    }
    else {
        lines.push(DBOX.topLeft + DBOX.horizontal.repeat(innerWidth) + DBOX.topRight);
    }
    // Content lines
    for (const line of content) {
        const contentWidth = innerWidth - 2;
        const lineWidth = visualWidth(line);
        const truncated = lineWidth > contentWidth
            ? truncateVisual(line, contentWidth - 3) + '...'
            : line;
        const padded = padEnd(truncated, contentWidth);
        lines.push(DBOX.vertical + ' ' + padded + ' ' + DBOX.vertical);
    }
    // Bottom border
    lines.push(DBOX.bottomLeft + DBOX.horizontal.repeat(innerWidth) + DBOX.bottomRight);
    return lines.join('\n');
}
/**
 * Draw a double-line box with a divider
 */
export function drawDoubleBoxWithDivider(topContent, bottomContent, width = BOX_WIDTH, title, titleColor) {
    const innerWidth = width - 2;
    const lines = [];
    // Top border with optional title
    if (title) {
        const coloredTitle = titleColor ? colorize(` ${title} `, titleColor) : ` ${title} `;
        const titleLen = visualWidth(coloredTitle);
        const remainingWidth = innerWidth - titleLen - 1;
        lines.push(DBOX.topLeft +
            DBOX.horizontal +
            coloredTitle +
            DBOX.horizontal.repeat(Math.max(0, remainingWidth)) +
            DBOX.topRight);
    }
    else {
        lines.push(DBOX.topLeft + DBOX.horizontal.repeat(innerWidth) + DBOX.topRight);
    }
    // Top content
    for (const line of topContent) {
        const contentWidth = innerWidth - 2;
        const padded = padEnd(line, contentWidth);
        lines.push(DBOX.vertical + ' ' + padded + ' ' + DBOX.vertical);
    }
    // Divider
    lines.push(DBOX.teeRight + DBOX.horizontal.repeat(innerWidth) + DBOX.teeLeft);
    // Bottom content
    for (const line of bottomContent) {
        const contentWidth = innerWidth - 2;
        const padded = padEnd(line, contentWidth);
        lines.push(DBOX.vertical + ' ' + padded + ' ' + DBOX.vertical);
    }
    // Bottom border
    lines.push(DBOX.bottomLeft + DBOX.horizontal.repeat(innerWidth) + DBOX.bottomRight);
    return lines.join('\n');
}
/**
 * Format duration in human readable form
 */
export function formatDuration(ms) {
    const seconds = Math.floor(ms / 1000);
    if (seconds < 60) {
        return `${seconds}s`;
    }
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
}
/**
 * Truncate string with ellipsis
 */
export function truncate(str, maxLength) {
    if (str.length <= maxLength)
        return str;
    return str.substring(0, maxLength - 3) + '...';
}
/**
 * Truncate string to visual width (accounting for emojis)
 * Uses string-width for accurate width calculation
 */
export function truncateVisual(str, maxWidth) {
    const stripped = stripAnsi(str);
    if (stringWidth(stripped) <= maxWidth) {
        return str;
    }
    // Binary search for the right cutoff point
    let result = '';
    for (const char of stripped) {
        const test = result + char;
        if (stringWidth(test) > maxWidth)
            break;
        result = test;
    }
    return result;
}
