/**
 * Chatbot Utilities
 * Centralized utilities for AI content generation
 */

/**
 * Estimates token count for text
 * @param {string} text - Text to estimate
 * @returns {number} Estimated token count
 */
export function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

/**
 * Detects spam indicators in text
 * @param {string} text - Text to analyze
 * @returns {string[]} Array of spam warnings
 */
export function spamHints(text: string): string[] {
  const issues: string[] = [];
  const linkCount = (text.match(/https?:\/\//g) || []).length;
  if (linkCount > 1) issues.push('Too many links (≤ 1 recommended)');
  if (/[A-Z]{6,}/.test(text)) issues.push('ALL-CAPS detected');
  if (/\b(guarantee|buy now|free!!!|act now|risk[- ]?free)\b/i.test(text)) {
    issues.push('Spammy wording found');
  }
  if (/[!?]{3,}/.test(text)) issues.push('Excessive punctuation');
  return issues;
}

/**
 * Robust JSON parser with fallback strategies
 * @param {string} raw - Raw text potentially containing JSON
 * @returns {T} Parsed object
 */
export function robustJsonParse<T = any>(raw: string): T {
  let src = (raw ?? '').trim();
  
  // Remove markdown code blocks
  const fence = src.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  if (fence) src = fence[1].trim();
  
  // Extract JSON from text
  if (!fence) {
    const start = src.indexOf('{');
    const end = src.lastIndexOf('}');
    if (start !== -1 && end !== -1 && end > start) src = src.slice(start, end + 1);
  }
  
  // Handle plain text format
  if (!/^\s*\{/.test(src)) {
    const subj = src.match(/^\s*Subject:\s*(.*)$/im)?.[1]?.trim();
    const prev = src.match(/^\s*Preview:\s*(.*)$/im)?.[1]?.trim();
    const body = src.match(/^\s*Body:\s*([\s\S]*)$/im)?.[1]?.trim();
    if (subj || body) {
      return { subject: subj ?? '', preview: prev ?? '', body: body ?? src } as T;
    }
    // If no structured format, treat as body
    return { subject: '', preview: '', body: src } as T;
  }
  
  // Clean up JSON
  src = src.replace(/[\u2018-\u201B]/g, "'").replace(/[\u201C-\u201F]/g, '"');
  src = src.replace(/(\n|{|,)\s*([A-Za-z0-9_]+)\s*:/g, (_m, p1, p2) => `${p1} "${p2}":`);
  src = src.replace(/,\s*([}\]])/g, '$1');
  
  try {
    return JSON.parse(src);
  } catch {
    // Final fallback - return as body text
    return { subject: '', preview: '', body: raw } as T;
  }
}

/**
 * Saves template to localStorage
 * @param {string} key - Storage key
 * @param {Record<string, any>} data - Data to save
 */
export function saveTemplate(key: string, data: Record<string, any>): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error('Failed to save template:', error);
  }
}

/**
 * Loads template from localStorage
 * @param {string} key - Storage key
 * @returns {T | null} Loaded data or null
 */
export function loadTemplate<T = any>(key: string): T | null {
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : null;
  } catch (error) {
    console.error('Failed to load template:', error);
    return null;
  }
}

/**
 * Copies text to clipboard with fallback
 * @param {string} text - Text to copy
 */
export async function safeCopy(text: string): Promise<void> {
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    const ta = document.createElement('textarea');
    ta.value = text;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
  }
  
  // Show notification
  const alertDiv = document.createElement('div');
  alertDiv.innerHTML = 'Copied!';
  alertDiv.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: white;
    color: black;
    padding: 12px 20px;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    z-index: 10000;
    font-family: system-ui;
    font-weight: 500;
  `;
  document.body.appendChild(alertDiv);
  setTimeout(() => document.body.removeChild(alertDiv), 2000);
}

// ============================================
// Structured Payload Builder
// ============================================

export interface SenderData {
  role: string;
  senderName: string;
  senderEmail?: string;
  language: string;
  level: 'Simple' | 'Intermediate' | 'Advanced';
}

export interface EmailToolData {
  niche: string;
  target: string;
  tone: string;
  prospectName?: string;
  company?: string;
  prospectEmail?: string;
  ctaText: string;
  wordLimit: number | '';
  variants: number;
}

export interface WhatsAppToolData {
  niche: string;
  target: string;
  variant: string;
  prospectName?: string;
  ctaText: string;
  wordLimit: number | '';
  spamFree: boolean;
  variants: number;
}

export interface LinkedInToolData {
  niche: string;
  target: string;
  variant: string;
  prospectName?: string;
  ctaText: string;
  wordLimit: number | '';
  spamFree: boolean;
  variants: number;
}

export interface ContractToolData {
  niche: string;
  projectScope: string;
  variant: string;
  clientName?: string;
  ctaText: string;
  wordLimit: number | '';
  variants: number;
}

export interface StructuredPayload {
  data: {
    tool: string;
    lang: string;
    lvl: string;
    senderRole?: string;
    senderName?: string;
    senderEmail?: string;
    wl?: number;
    variantType?: string;
    niche: string;
    target?: string;
    cta: string;
    prospect?: {
      name?: string;
      company?: string;
      email?: string;
    };
    projectScope?: string;
    spamFree?: boolean;
  };
  variants: number;
  expectJson: boolean;
}

/**
 * Builds structured payload for API
 * @param {string} tool - Tool type
 * @param {SenderData} senderData - Sender information
 * @param {any} toolData - Tool-specific data
 * @returns {StructuredPayload} Structured payload
 */
export function buildStructuredPayload(
  tool: 'emails' | 'whatsapp' | 'linkedin' | 'contracts',
  senderData: SenderData,
  toolData: any
): StructuredPayload {
  // Map language to 2-letter code
  const langMap: Record<string, string> = {
    'English': 'en',
    'Hindi': 'hi',
    'Spanish': 'es',
    'French': 'fr',
    'Portuguese': 'pt',
    'German': 'de',
    'Bengali': 'bn',
    'Urdu': 'ur',
    'Arabic': 'ar'
  };

  const payload: StructuredPayload = {
    data: {
      tool,
      lang: langMap[senderData.language] || 'en',
      lvl: senderData.level.toLowerCase(),
      senderRole: senderData.role,
      senderName: senderData.senderName,
      senderEmail: senderData.senderEmail,
      niche: toolData.niche,
      cta: toolData.ctaText
    },
    variants: toolData.variants || 1,
    expectJson: tool === 'emails'
  };

  // Add word limit if specified
  if (toolData.wordLimit && Number(toolData.wordLimit) > 0) {
    payload.data.wl = Number(toolData.wordLimit);
  }

  // Add variant type if specified
  if (toolData.tone) {
    payload.data.variantType = toolData.tone.toLowerCase().replace(/\s+/g, '_');
  } else if (toolData.variant) {
    payload.data.variantType = toolData.variant.toLowerCase().replace(/\s+/g, '_');
  }

  // Add target for non-contract tools
  if (tool !== 'contracts' && toolData.target) {
    payload.data.target = toolData.target;
  }

  // Add prospect details if available
  if (toolData.prospectName || toolData.company || toolData.prospectEmail) {
    payload.data.prospect = {
      name: toolData.prospectName || '',
      company: toolData.company || '',
      email: toolData.prospectEmail || ''
    };
  }

  // Add project scope for contracts
  if (tool === 'contracts' && toolData.projectScope) {
    payload.data.projectScope = toolData.projectScope;
  }

  // Add spam-free flag
  if (typeof toolData.spamFree === 'boolean') {
    payload.data.spamFree = toolData.spamFree;
  }

  return payload;
}
