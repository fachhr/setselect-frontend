import { resend, EMAIL_CONFIG } from './resend';
import AdminNotificationEmail from '@/emails/AdminNotification';

interface SendAdminNotificationParams {
  firstName: string;
  lastName: string;
  email: string;
  phoneCountryCode?: string;
  phoneNumber?: string;
  linkedinUrl?: string;
  desiredLocations: string[];
  salaryMin?: number;
  salaryMax?: number;
  noticePeriodMonths?: number;
  cvStoragePath: string;
}

/**
 * Sends a notification email to the admin when a new profile is submitted
 *
 * @param params - Complete candidate information
 * @returns Promise that resolves to the Resend API response
 * @throws Error if email sending fails
 */
export async function sendAdminNotification(params: SendAdminNotificationParams) {
  try {
    // Check if email system is configured
    if (!resend) {
      throw new Error('Email system not configured: RESEND_API_KEY is missing');
    }

    const submittedAt = new Date().toLocaleString('en-US', {
      dateStyle: 'full',
      timeStyle: 'short',
      timeZone: 'Europe/Zurich',
    });

    const { data, error } = await resend.emails.send({
      from: EMAIL_CONFIG.FROM,
      to: EMAIL_CONFIG.ADMIN_EMAIL,
      replyTo: params.email,
      subject: `🎯 New Talent Submission: ${params.firstName} ${params.lastName}`,
      react: AdminNotificationEmail({
        ...params,
        submittedAt,
      }),
    });

    if (error) {
      console.error('[Email Error] Failed to send admin notification:', error);
      throw new Error(`Failed to send admin notification: ${error.message}`);
    }

    console.log('[Email Success] Admin notification sent:', {
      emailId: data?.id,
      candidate: `${params.firstName} ${params.lastName}`,
    });

    return data;
  } catch (error) {
    console.error('[Email Error] Unexpected error sending admin notification:', error);
    throw error;
  }
}
