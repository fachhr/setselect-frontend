import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Heading,
  Text,
  Button,
  Hr,
} from '@react-email/components';
import * as React from 'react';

interface UserConfirmationEmailProps {
  firstName: string;
  lastName: string;
  email: string;
}

export const UserConfirmationEmail = ({
  firstName,
  lastName,
  email,
}: UserConfirmationEmailProps) => {
  return (
    <Html>
      <Head />
      <Body style={main}>
        <Container style={container}>
          {/* Header with Gold Accent */}
          <Section style={header}>
            <div style={goldBar}></div>
            <Heading style={h1}>Thank You for Joining Silvia's List!</Heading>
          </Section>

          {/* Main Content */}
          <Section style={content}>
            <Text style={greeting}>
              Hi {firstName},
            </Text>

            <Text style={paragraph}>
              Your profile has been successfully submitted to our talent pool. We're excited to help you find your next opportunity in Switzerland!
            </Text>

            {/* What Happens Next Box */}
            <Section style={infoBox}>
              <Heading style={h2}>What Happens Next?</Heading>

              <Section style={step}>
                <div style={stepNumber}>1</div>
                <div style={stepContent}>
                  <Text style={stepTitle}>Profile Review</Text>
                  <Text style={stepText}>
                    Our team will review your complete profile and match you with relevant opportunities.
                  </Text>
                </div>
              </Section>

              <Section style={step}>
                <div style={stepNumber}>2</div>
                <div style={stepContent}>
                  <Text style={stepTitle}>CV Processing</Text>
                  <Text style={stepText}>
                    We're using AI to extract key information from your CV to better match you with suitable positions.
                  </Text>
                </div>
              </Section>

              <Section style={step}>
                <div style={stepNumber}>3</div>
                <div style={stepContent}>
                  <Text style={stepTitle}>We'll Contact You</Text>
                  <Text style={stepText}>
                    When we find a match that fits your preferences, we'll reach out via email with more details.
                  </Text>
                </div>
              </Section>
            </Section>

            <Text style={paragraph}>
              <strong>Questions or need to update your profile?</strong><br />
              Feel free to reach out to us at{' '}
              <a href="mailto:contact@silviaslist.com" style={link}>
                contact@silviaslist.com
              </a>
            </Text>

            <Text style={paragraph}>
              We're committed to finding you the perfect opportunity that matches your skills and preferences.
            </Text>

            {/* CTA Button */}
            <Section style={buttonContainer}>
              <Button
                href="mailto:contact@silviaslist.com"
                style={button}
              >
                Contact Us
              </Button>
            </Section>
          </Section>

          {/* Footer */}
          <Hr style={hr} />
          <Section style={footer}>
            <Text style={footerText}>
              Your privacy is important to us. All data is handled according to our{' '}
              <a href="https://silviaslist.com/terms" style={link}>
                Terms & Conditions
              </a>.
            </Text>
            <Text style={footerText}>
              © {new Date().getFullYear()} Silvia's List. All rights reserved.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

export default UserConfirmationEmail;

// Styles - Navy & Gold theme matching the website
const main = {
  backgroundColor: '#f6f9fc',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0',
  maxWidth: '600px',
};

const header = {
  padding: '32px 24px',
  backgroundColor: '#0A1628',
  borderRadius: '8px 8px 0 0',
  textAlign: 'center' as const,
};

const goldBar = {
  height: '4px',
  backgroundColor: '#D4AF37',
  marginBottom: '24px',
  borderRadius: '2px',
};

const h1 = {
  color: '#F8FAFC',
  fontSize: '28px',
  fontWeight: 'bold',
  margin: '0',
  lineHeight: '1.3',
};

const content = {
  padding: '32px 24px',
};

const greeting = {
  fontSize: '18px',
  color: '#0A1628',
  margin: '0 0 16px 0',
  fontWeight: '600',
};

const paragraph = {
  fontSize: '16px',
  lineHeight: '1.6',
  color: '#334155',
  margin: '16px 0',
};

const infoBox = {
  backgroundColor: '#F1F5F9',
  borderLeft: '4px solid #D4AF37',
  borderRadius: '8px',
  padding: '24px',
  margin: '24px 0',
};

const h2 = {
  fontSize: '20px',
  fontWeight: 'bold',
  color: '#0A1628',
  margin: '0 0 20px 0',
};

const step = {
  display: 'flex' as const,
  marginBottom: '20px',
  alignItems: 'flex-start' as const,
};

const stepNumber = {
  width: '32px',
  height: '32px',
  borderRadius: '50%',
  backgroundColor: 'rgba(212, 175, 55, 0.15)',
  color: '#D4AF37',
  display: 'flex' as const,
  alignItems: 'center' as const,
  justifyContent: 'center' as const,
  fontWeight: 'bold' as const,
  fontSize: '16px',
  flexShrink: 0,
  marginRight: '16px',
};

const stepContent = {
  flex: 1,
};

const stepTitle = {
  fontSize: '16px',
  fontWeight: '600',
  color: '#0A1628',
  margin: '0 0 4px 0',
};

const stepText = {
  fontSize: '14px',
  color: '#64748B',
  margin: '0',
  lineHeight: '1.5',
};

const link = {
  color: '#D4AF37',
  textDecoration: 'underline',
};

const buttonContainer = {
  textAlign: 'center' as const,
  margin: '32px 0',
};

const button = {
  backgroundColor: '#D4AF37',
  borderRadius: '8px',
  color: '#1a0512',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '14px 32px',
  cursor: 'pointer',
};

const hr = {
  borderColor: '#E2E8F0',
  margin: '32px 0',
};

const footer = {
  padding: '0 24px 32px',
  textAlign: 'center' as const,
};

const footerText = {
  fontSize: '14px',
  color: '#94A3B8',
  lineHeight: '1.6',
  margin: '8px 0',
};
