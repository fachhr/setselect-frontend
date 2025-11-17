import { Resend } from 'resend';

// Initialize Resend client
// Will be null if API key is not configured - handled gracefully in send functions
const apiKey = process.env.RESEND_API_KEY;

// Export resend client (may be null if not configured)
export const resend = apiKey ? new Resend(apiKey) : null;

// Email configuration constants
export const EMAIL_CONFIG = {
  FROM: process.env.FROM_EMAIL || 'noreply@silviaslist.com',
  ADMIN_EMAIL: process.env.ADMIN_EMAIL || 'admin@silviaslist.com',
  REPLY_TO: 'contact@silviaslist.com',
} as const;

/**
 * Check if email system is properly configured
 */
export function isEmailConfigured(): boolean {
  return resend !== null && !!apiKey;
}
