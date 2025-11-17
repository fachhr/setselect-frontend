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

interface AdminNotificationEmailProps {
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
  submittedAt: string;
}

export const AdminNotificationEmail = ({
  firstName,
  lastName,
  email,
  phoneCountryCode,
  phoneNumber,
  linkedinUrl,
  desiredLocations,
  salaryMin,
  salaryMax,
  noticePeriodMonths,
  cvStoragePath,
  submittedAt,
}: AdminNotificationEmailProps) => {
  const fullPhone = phoneCountryCode && phoneNumber
    ? `${phoneCountryCode} ${phoneNumber}`
    : phoneNumber || 'Not provided';

  const salaryRange = salaryMin && salaryMax
    ? `CHF ${salaryMin.toLocaleString()} - ${salaryMax.toLocaleString()}`
    : salaryMin
    ? `CHF ${salaryMin.toLocaleString()}+`
    : 'Not specified';

  const locations = desiredLocations.length > 0
    ? desiredLocations.join(', ')
    : 'Not specified';

  const noticePeriod = noticePeriodMonths
    ? `${noticePeriodMonths} month${noticePeriodMonths > 1 ? 's' : ''}`
    : 'Not specified';

  return (
    <Html>
      <Head />
      <Body style={main}>
        <Container style={container}>
          {/* Alert Header */}
          <Section style={alertHeader}>
            <div style={alertIcon}>🎯</div>
            <Heading style={h1}>New Talent Pool Submission</Heading>
            <Text style={timestamp}>{submittedAt}</Text>
          </Section>

          {/* Candidate Summary */}
          <Section style={content}>
            <Section style={summaryBox}>
              <Heading style={h2}>Candidate Information</Heading>

              <Section style={infoRow}>
                <Text style={label}>Name:</Text>
                <Text style={value}>{firstName} {lastName}</Text>
              </Section>

              <Section style={infoRow}>
                <Text style={label}>Email:</Text>
                <Text style={value}>
                  <a href={`mailto:${email}`} style={link}>{email}</a>
                </Text>
              </Section>

              <Section style={infoRow}>
                <Text style={label}>Phone:</Text>
                <Text style={value}>{fullPhone}</Text>
              </Section>

              {linkedinUrl && (
                <Section style={infoRow}>
                  <Text style={label}>LinkedIn:</Text>
                  <Text style={value}>
                    <a href={linkedinUrl} style={link} target="_blank">
                      View Profile
                    </a>
                  </Text>
                </Section>
              )}
            </Section>

            {/* Job Preferences */}
            <Section style={preferencesBox}>
              <Heading style={h2}>Job Preferences</Heading>

              <Section style={infoRow}>
                <Text style={label}>Desired Locations:</Text>
                <Text style={value}>{locations}</Text>
              </Section>

              <Section style={infoRow}>
                <Text style={label}>Salary Range:</Text>
                <Text style={value}>{salaryRange}</Text>
              </Section>

              <Section style={infoRow}>
                <Text style={label}>Notice Period:</Text>
                <Text style={value}>{noticePeriod}</Text>
              </Section>
            </Section>

            {/* CV Information */}
            <Section style={cvBox}>
              <Heading style={h3}>📄 CV Document</Heading>
              <Text style={cvPath}>
                <strong>Storage Path:</strong><br />
                <code style={code}>{cvStoragePath}</code>
              </Text>
              <Text style={hint}>
                Access the CV in Supabase Storage under the <strong>talent-pool-cvs</strong> bucket.
              </Text>
            </Section>

            {/* Action Buttons */}
            <Section style={buttonContainer}>
              <Button
                href={`${process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://your-project.supabase.co'}`}
                style={button}
              >
                View in Supabase
              </Button>
            </Section>

            {/* Next Steps */}
            <Section style={nextStepsBox}>
              <Heading style={h3}>Next Steps</Heading>
              <Text style={stepText}>
                1. Review the candidate's CV in Supabase Storage<br />
                2. Wait for CV parsing to complete (1-2 minutes)<br />
                3. Check the extracted data in the user_profiles table<br />
                4. Match with suitable job opportunities
              </Text>
            </Section>
          </Section>

          {/* Footer */}
          <Hr style={hr} />
          <Section style={footer}>
            <Text style={footerText}>
              This is an automated notification from Silvia's List talent pool system.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

export default AdminNotificationEmail;

// Styles
const main = {
  backgroundColor: '#f6f9fc',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0',
  maxWidth: '600px',
  border: '1px solid #E2E8F0',
};

const alertHeader = {
  padding: '24px',
  backgroundColor: '#0A1628',
  borderBottom: '4px solid #D4AF37',
  textAlign: 'center' as const,
};

const alertIcon = {
  fontSize: '40px',
  marginBottom: '12px',
};

const h1 = {
  color: '#F8FAFC',
  fontSize: '24px',
  fontWeight: 'bold',
  margin: '0 0 8px 0',
};

const timestamp = {
  color: '#CBD5E1',
  fontSize: '14px',
  margin: '0',
};

const content = {
  padding: '24px',
};

const summaryBox = {
  backgroundColor: '#F8FAFC',
  border: '2px solid #D4AF37',
  borderRadius: '8px',
  padding: '20px',
  marginBottom: '20px',
};

const preferencesBox = {
  backgroundColor: '#F1F5F9',
  borderRadius: '8px',
  padding: '20px',
  marginBottom: '20px',
};

const cvBox = {
  backgroundColor: '#FEF3C7',
  border: '1px solid #F59E0B',
  borderRadius: '8px',
  padding: '20px',
  marginBottom: '20px',
};

const nextStepsBox = {
  backgroundColor: '#E0F2FE',
  borderLeft: '4px solid #0EA5E9',
  borderRadius: '8px',
  padding: '20px',
  marginTop: '20px',
};

const h2 = {
  fontSize: '18px',
  fontWeight: 'bold',
  color: '#0A1628',
  margin: '0 0 16px 0',
};

const h3 = {
  fontSize: '16px',
  fontWeight: 'bold',
  color: '#0A1628',
  margin: '0 0 12px 0',
};

const infoRow = {
  marginBottom: '12px',
  display: 'flex' as const,
  gap: '8px',
};

const label = {
  fontSize: '14px',
  fontWeight: '600',
  color: '#64748B',
  margin: '0',
  minWidth: '140px',
};

const value = {
  fontSize: '14px',
  color: '#0A1628',
  margin: '0',
  flex: 1,
};

const link = {
  color: '#D4AF37',
  textDecoration: 'underline',
  fontWeight: '500',
};

const cvPath = {
  fontSize: '13px',
  color: '#78350F',
  margin: '0 0 12px 0',
  lineHeight: '1.6',
};

const code = {
  backgroundColor: '#FDE68A',
  padding: '4px 8px',
  borderRadius: '4px',
  fontSize: '12px',
  fontFamily: 'monospace',
  wordBreak: 'break-all' as const,
  display: 'inline-block',
  marginTop: '4px',
};

const hint = {
  fontSize: '13px',
  color: '#92400E',
  margin: '0',
  fontStyle: 'italic' as const,
};

const stepText = {
  fontSize: '14px',
  color: '#075985',
  margin: '0',
  lineHeight: '1.8',
};

const buttonContainer = {
  textAlign: 'center' as const,
  margin: '24px 0',
};

const button = {
  backgroundColor: '#D4AF37',
  borderRadius: '8px',
  color: '#1a0512',
  fontSize: '15px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '12px 28px',
  cursor: 'pointer',
};

const hr = {
  borderColor: '#E2E8F0',
  margin: '24px 0',
};

const footer = {
  padding: '0 24px 24px',
  textAlign: 'center' as const,
};

const footerText = {
  fontSize: '13px',
  color: '#94A3B8',
  margin: '0',
};
