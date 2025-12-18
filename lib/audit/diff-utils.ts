/**
 * Audit Diff Utilities
 * 
 * Utilities for computing human-readable diffs between audit log states.
 * Flattens nested JSON and only shows changed fields.
 */

export interface DiffEntry {
    field: string;
    before: string | null;
    after: string | null;
}

/**
 * Flatten nested object into dot-notation keys
 * { a: { b: 1 } } => { "a.b": 1 }
 */
export function flattenObject(
    obj: Record<string, any>,
    prefix = ''
): Record<string, any> {
    const result: Record<string, any> = {};

    if (!obj || typeof obj !== 'object') {
        return result;
    }

    for (const [key, value] of Object.entries(obj)) {
        const newKey = prefix ? `${prefix}.${key}` : key;

        if (value && typeof value === 'object' && !Array.isArray(value) && !(value instanceof Date)) {
            Object.assign(result, flattenObject(value, newKey));
        } else {
            result[newKey] = value;
        }
    }

    return result;
}

/**
 * Format a flattened key into human-readable text
 * "reminders.defaultChannel" => "Reminders → Default Channel"
 */
export function formatFieldName(key: string): string {
    return key
        .split('.')
        .map(part =>
            part
                // Insert space before capitals (camelCase)
                .replace(/([A-Z])/g, ' $1')
                // Handle underscores
                .replace(/_/g, ' ')
                .trim()
                // Capitalize first letter
                .replace(/^\w/, c => c.toUpperCase())
        )
        .join(' → ');
}

/**
 * Format a value for display
 */
export function formatValue(value: any): string {
    if (value === null || value === undefined) {
        return '—'; // Em-dash for null/undefined
    }
    if (typeof value === 'boolean') {
        return value ? 'Yes' : 'No';
    }
    if (value instanceof Date) {
        return value.toLocaleDateString();
    }
    if (Array.isArray(value)) {
        return value.length === 0 ? 'None' : value.join(', ');
    }
    if (typeof value === 'object') {
        return JSON.stringify(value);
    }
    return String(value);
}

/**
 * Compute diff between before and after states
 * Only returns fields that actually changed
 */
export function computeDiff(
    before: Record<string, any> | null | undefined,
    after: Record<string, any> | null | undefined
): DiffEntry[] {
    const flatBefore = before ? flattenObject(before) : {};
    const flatAfter = after ? flattenObject(after) : {};

    // Collect all unique keys
    const allKeys = new Set([
        ...Object.keys(flatBefore),
        ...Object.keys(flatAfter)
    ]);

    const diffs: DiffEntry[] = [];

    for (const key of allKeys) {
        const beforeVal = flatBefore[key];
        const afterVal = flatAfter[key];

        // Skip if values are identical (deep comparison for objects)
        if (JSON.stringify(beforeVal) === JSON.stringify(afterVal)) {
            continue;
        }

        diffs.push({
            field: formatFieldName(key),
            before: beforeVal !== undefined ? formatValue(beforeVal) : null,
            after: afterVal !== undefined ? formatValue(afterVal) : null,
        });
    }

    return diffs;
}

/**
 * Get a contextual "before state" label
 * Replaces "N/A" with meaningful text
 */
export function getBeforeStateLabel(beforeState: any): string {
    if (!beforeState || Object.keys(beforeState).length === 0) {
        return 'Initial State (first time setting)';
    }
    return 'Previous Value';
}

/**
 * Check if this is an initial creation (no before state)
 */
export function isInitialCreation(beforeState: any): boolean {
    return !beforeState || Object.keys(beforeState).length === 0;
}

/**
 * Get impact indicators for UI display
 */
export function getImpactIndicators(
    affectsMoney: boolean,
    affectsStreaks: boolean,
    affectsRules: boolean
): { emoji: string; label: string }[] {
    const indicators: { emoji: string; label: string }[] = [];

    if (affectsMoney) {
        indicators.push({ emoji: '💰', label: 'Affects Financial Records' });
    }
    if (affectsStreaks) {
        indicators.push({ emoji: '🔥', label: 'Affects Contribution Streaks' });
    }
    if (affectsRules) {
        indicators.push({ emoji: '📋', label: 'Affects Family Rules' });
    }

    if (indicators.length === 0) {
        indicators.push({ emoji: '📝', label: 'Informational Only' });
    }

    return indicators;
}

/**
 * Mask IP address for privacy (show only first and last octet)
 * "192.168.1.100" => "192.***.***. 100"
 */
export function maskIpAddress(ip: string | null | undefined): string {
    if (!ip) return 'Unknown';

    const parts = ip.split('.');
    if (parts.length === 4) {
        return `${parts[0]}.***.***. ${parts[3]}`;
    }

    // Handle IPv6 or other formats
    if (ip.includes(':')) {
        const v6Parts = ip.split(':');
        if (v6Parts.length >= 2) {
            return `${v6Parts[0]}:***:${v6Parts[v6Parts.length - 1]}`;
        }
    }

    return 'Hidden';
}

/**
 * Format device info for display
 */
export function formatDeviceInfo(deviceInfo: any): string {
    if (!deviceInfo) return 'Unknown Device';

    const userAgent = deviceInfo.userAgent || '';

    // Extract browser and OS from user agent
    if (userAgent.includes('Chrome')) {
        if (userAgent.includes('Android')) return 'Android (Chrome)';
        if (userAgent.includes('Windows')) return 'Windows (Chrome)';
        if (userAgent.includes('Mac')) return 'macOS (Chrome)';
        if (userAgent.includes('Linux')) return 'Linux (Chrome)';
        return 'Chrome Browser';
    }
    if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) {
        if (userAgent.includes('iPhone')) return 'iPhone (Safari)';
        if (userAgent.includes('iPad')) return 'iPad (Safari)';
        return 'Safari Browser';
    }
    if (userAgent.includes('Firefox')) {
        return 'Firefox Browser';
    }
    if (userAgent.includes('Edge')) {
        return 'Microsoft Edge';
    }

    return 'Unknown Browser';
}
