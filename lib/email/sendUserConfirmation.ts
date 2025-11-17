import { resend, EMAIL_CONFIG } from './resend';
import UserConfirmationEmail from '@/emails/UserConfirmation';

interface SendUserConfirmationParams {
  firstName: string;
  lastName: string;
  email: string;
}

/**
 * Sends a confirmation email to a user after they submit their profile
 *
 * @param params - User information for personalization
 * @returns Promise that resolves to the Resend API response
 * @throws Error if email sending fails
 */
export async function sendUserConfirmation({
  firstName,
  lastName,
  email,
}: SendUserConfirmationParams) {
  try {
    // Check if email system is configured
    if (!resend) {
      throw new Error('Email system not configured: RESEND_API_KEY is missing');
    }

    const { data, error } = await resend.emails.send({
      from: EMAIL_CONFIG.FROM,
      to: email,
      replyTo: EMAIL_CONFIG.REPLY_TO,
      subject: 'Welcome to Silvia\'s List Talent Pool! 🎯',
      react: UserConfirmationEmail({
        firstName,
        lastName,
        email,
      }),
    });

    if (error) {
      console.error('[Email Error] Failed to send user confirmation:', error);
      throw new Error(`Failed to send confirmation email: ${error.message}`);
    }

    console.log('[Email Success] User confirmation sent:', {
      emailId: data?.id,
      recipient: email,
    });

    return data;
  } catch (error) {
    console.error('[Email Error] Unexpected error sending user confirmation:', error);
    throw error;
  }
}
