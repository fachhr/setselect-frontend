import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

export async function POST(request: NextRequest) {
    try {
        const resend = new Resend(process.env.RESEND_API_KEY);
        const { email } = await request.json();

        if (!email || !email.includes('@')) {
            return NextResponse.json(
                { error: 'Invalid email address' },
                { status: 400 }
            );
        }

        await resend.emails.send({
            from: 'SetSelect <noreply@setberry.com>',
            to: 'hello@setberry.com',
            replyTo: email,
            subject: 'New Access Request - SetSelect',
            text: `A new access request has been submitted.\n\nRequester Email: ${email}\n\nPlease review and grant access if appropriate.`,
            html: `
                <h2>New Access Request</h2>
                <p>A new access request has been submitted for SetSelect.</p>
                <p><strong>Requester Email:</strong> ${email}</p>
                <p>Please review and grant access if appropriate.</p>
            `,
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Failed to send access request email:', error);
        return NextResponse.json(
            { error: 'Failed to send notification' },
            { status: 500 }
        );
    }
}
