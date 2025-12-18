/**
 * Audit Message Templates
 * 
 * Template-based human-readable message generator for audit logs.
 * These templates turn technical actions into clear, understandable summaries.
 */

export interface MessageContext {
    actorName: string;
    actorRole: string;
    entityType: string;
    action: string;
    beforeState?: Record<string, any>;
    afterState?: Record<string, any>;
    changedFields?: string[];
    reason?: string;
}

type TemplateFunction = (ctx: MessageContext) => string;

/**
 * Action-specific message templates
 * Uses markdown-style **bold** for key names/actions
 */
const ACTION_TEMPLATES: Record<string, TemplateFunction> = {
    // ============================================
    // Settings Actions
    // ============================================
    'SETTINGS_CREATED': (ctx) =>
        `${ctx.actorRole} **${ctx.actorName}** initialized family settings`,

    'SETTINGS_UPDATED': (ctx) =>
        `${ctx.actorRole} **${ctx.actorName}** updated family settings`,

    'REMINDER_CHANGED': (ctx) => {
        const channel = ctx.afterState?.reminders?.defaultChannel;
        const freq = ctx.afterState?.reminders?.defaultFrequency;
        let details = '';
        if (channel) details += ` to **${channel}**`;
        if (freq) details += ` (${freq})`;
        return `${ctx.actorRole} **${ctx.actorName}** changed reminder settings${details}`;
    },

    'VISIBILITY_CHANGED': (ctx) =>
        `${ctx.actorRole} **${ctx.actorName}** updated visibility settings`,

    'GOVERNANCE_CHANGED': (ctx) =>
        `${ctx.actorRole} **${ctx.actorName}** updated governance rules`,

    // ============================================
    // Contribution Actions
    // ============================================
    'CONTRIBUTION_CREATED': (ctx) => {
        const amount = ctx.afterState?.amount;
        return amount
            ? `${ctx.actorRole} **${ctx.actorName}** recorded a contribution of **KES ${Number(amount).toLocaleString()}**`
            : `${ctx.actorRole} **${ctx.actorName}** recorded a new contribution`;
    },

    'CONTRIBUTION_UPDATED': (ctx) =>
        `${ctx.actorRole} **${ctx.actorName}** updated a contribution record`,

    'CONTRIBUTION_EDITED': (ctx) => {
        const beforeAmount = ctx.beforeState?.amount;
        const afterAmount = ctx.afterState?.amount;
        if (beforeAmount && afterAmount && beforeAmount !== afterAmount) {
            return `${ctx.actorRole} **${ctx.actorName}** changed contribution amount from **KES ${Number(beforeAmount).toLocaleString()}** to **KES ${Number(afterAmount).toLocaleString()}**`;
        }
        return `${ctx.actorRole} **${ctx.actorName}** edited a contribution record`;
    },

    'CONTRIBUTION_DELETED': (ctx) => {
        const amount = ctx.beforeState?.amount;
        return amount
            ? `${ctx.actorRole} **${ctx.actorName}** **deleted** a contribution of **KES ${Number(amount).toLocaleString()}**`
            : `${ctx.actorRole} **${ctx.actorName}** **deleted** a contribution record`;
    },

    // ============================================
    // Proof of Payment Actions
    // ============================================
    'PROOF_SUBMITTED': (ctx) => {
        const amount = ctx.afterState?.amount;
        return amount
            ? `${ctx.actorRole} **${ctx.actorName}** submitted payment proof for **KES ${Number(amount).toLocaleString()}**`
            : `${ctx.actorRole} **${ctx.actorName}** submitted a payment proof`;
    },

    'PROOF_CREATED': (ctx) =>
        `${ctx.actorRole} **${ctx.actorName}** submitted a payment proof`,

    'PROOF_APPROVED': (ctx) => {
        const amount = ctx.afterState?.amount;
        return amount
            ? `${ctx.actorRole} **${ctx.actorName}** approved payment proof for **KES ${Number(amount).toLocaleString()}**`
            : `${ctx.actorRole} **${ctx.actorName}** approved a payment proof`;
    },

    'PROOF_REJECTED': (ctx) => {
        const reason = ctx.reason || ctx.afterState?.rejectionReason;
        return reason
            ? `${ctx.actorRole} **${ctx.actorName}** rejected a payment proof: "${reason}"`
            : `${ctx.actorRole} **${ctx.actorName}** rejected a payment proof`;
    },

    'PROOF_DISPUTED': (ctx) =>
        `${ctx.actorRole} **${ctx.actorName}** raised a dispute on a payment proof`,

    'PROOF_ESCALATED': (ctx) =>
        `${ctx.actorRole} **${ctx.actorName}** escalated a payment proof for review`,

    'PROOF_OVERRIDDEN': (ctx) =>
        `${ctx.actorRole} **${ctx.actorName}** **overrode** a payment proof decision`,

    // ============================================
    // Streak Actions
    // ============================================
    'STREAK_UPDATED': (ctx) =>
        `${ctx.actorRole} **${ctx.actorName}** updated a member's contribution streak`,

    'STREAK_RESET': (ctx) =>
        `${ctx.actorRole} **${ctx.actorName}** **reset** a member's contribution streak to zero`,

    'STREAK_OVERRIDE': (ctx) =>
        `${ctx.actorRole} **${ctx.actorName}** **manually adjusted** a member's contribution streak`,

    // ============================================
    // Campaign Actions
    // ============================================
    'CAMPAIGN_CREATED': (ctx) => {
        const name = ctx.afterState?.name;
        return name
            ? `${ctx.actorRole} **${ctx.actorName}** created campaign "**${name}**"`
            : `${ctx.actorRole} **${ctx.actorName}** created a new campaign`;
    },

    'CAMPAIGN_UPDATED': (ctx) =>
        `${ctx.actorRole} **${ctx.actorName}** updated campaign details`,

    'CAMPAIGN_ARCHIVED': (ctx) => {
        const name = ctx.beforeState?.name;
        return name
            ? `${ctx.actorRole} **${ctx.actorName}** archived campaign "**${name}**"`
            : `${ctx.actorRole} **${ctx.actorName}** archived a campaign`;
    },

    'CAMPAIGN_DELETED': (ctx) =>
        `${ctx.actorRole} **${ctx.actorName}** **deleted** a campaign`,

    // ============================================
    // Member/Role Actions
    // ============================================
    'MEMBER_INVITED': (ctx) =>
        `${ctx.actorRole} **${ctx.actorName}** invited a new member`,

    'MEMBER_JOINED': (ctx) =>
        `**${ctx.actorName}** joined the family`,

    'MEMBER_REMOVED': (ctx) =>
        `${ctx.actorRole} **${ctx.actorName}** removed a member from the family`,

    'ROLE_CHANGED': (ctx) => {
        const newRole = ctx.afterState?.role;
        return newRole
            ? `${ctx.actorRole} **${ctx.actorName}** assigned a member the role of **${newRole}**`
            : `${ctx.actorRole} **${ctx.actorName}** changed a member's role`;
    },

    'ROLE_ASSIGNED': (ctx) => {
        const role = ctx.afterState?.role;
        return role
            ? `${ctx.actorRole} **${ctx.actorName}** assigned **${role}** role`
            : `${ctx.actorRole} **${ctx.actorName}** assigned a role`;
    },

    // ============================================
    // Danger Zone Actions
    // ============================================
    'DANGER_ACTION_REQUESTED': (ctx) => {
        const actionType = ctx.afterState?.actionType;
        return actionType
            ? `${ctx.actorRole} **${ctx.actorName}** requested a dangerous action: **${formatActionType(actionType)}**`
            : `${ctx.actorRole} **${ctx.actorName}** requested a dangerous action`;
    },

    'DANGER_ACTION_APPROVED': (ctx) =>
        `${ctx.actorRole} **${ctx.actorName}** approved a dangerous action`,

    'DANGER_ACTION_REJECTED': (ctx) =>
        `${ctx.actorRole} **${ctx.actorName}** rejected a dangerous action request`,

    'DANGER_ACTION_EXECUTED': (ctx) => {
        const actionType = ctx.afterState?.actionType;
        return actionType
            ? `${ctx.actorRole} **${ctx.actorName}** **executed** dangerous action: **${formatActionType(actionType)}**`
            : `${ctx.actorRole} **${ctx.actorName}** **executed** a dangerous action`;
    },

    'DANGER_ACTION_CANCELLED': (ctx) =>
        `${ctx.actorRole} **${ctx.actorName}** cancelled a dangerous action request`,
};

/**
 * Format action type into human-readable text
 */
function formatActionType(actionType: string): string {
    return actionType
        .replace(/_/g, ' ')
        .toLowerCase()
        .replace(/\b\w/g, l => l.toUpperCase());
}

/**
 * Default template for unknown actions
 */
const DEFAULT_TEMPLATE: TemplateFunction = (ctx) => {
    const actionText = ctx.action.replace(/_/g, ' ').toLowerCase();
    const entityText = ctx.entityType.replace(/_/g, ' ');
    return `${ctx.actorRole} **${ctx.actorName}** performed ${actionText} on ${entityText}`;
};

/**
 * Generate a human-readable summary for an audit log entry
 */
export function generateHumanSummary(ctx: MessageContext): string {
    const template = ACTION_TEMPLATES[ctx.action] || DEFAULT_TEMPLATE;
    return template(ctx);
}

/**
 * Strip markdown from summary for plain text display
 */
export function stripMarkdown(summary: string): string {
    return summary.replace(/\*\*/g, '');
}

/**
 * Convert markdown bold to HTML for rich display
 */
export function markdownToHtml(summary: string): string {
    return summary.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
}
