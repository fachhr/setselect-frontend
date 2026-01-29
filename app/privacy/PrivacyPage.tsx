'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { COMPANY, THIRD_PARTY_PROCESSORS, FDPIC_CONTACT } from '@/lib/legal/constants';

const PrivacyPage: React.FC = () => {
  const router = useRouter();

  return (
    <div className="max-w-7xl mx-auto animate-in slide-in-from-bottom-4 duration-500">
      {/* Page Header */}
      <div className="bg-[var(--bg-root)] border-b border-[var(--border-subtle)] relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-4xl pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-[var(--secondary)] opacity-[0.08] blur-[100px] rounded-full"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[var(--primary)] opacity-[0.06] blur-[120px] rounded-full"></div>
        </div>

        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-12 relative z-10">
          <div className="mb-8">
            <button
              onClick={() => router.back()}
              className="inline-flex items-center text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--gold)] transition-colors group"
            >
              <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
              Back
            </button>
          </div>

          <div className="text-center">
            <h1 className="font-title text-4xl sm:text-6xl font-bold text-[var(--text-primary)] tracking-tight">
              Privacy <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--secondary)] to-[var(--highlight)]">Policy</span>
            </h1>
            <p className="mt-4 text-lg text-[var(--text-secondary)]">
              How we collect, use, and protect your personal data.
            </p>
            <p className="mt-2 text-sm text-[var(--text-tertiary)]">
              Last updated: {COMPANY.terms.lastUpdated}
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-3xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="glass-panel rounded-2xl p-8 md:p-12">
          <div className="space-y-12 text-[var(--text-secondary)] leading-relaxed">

            {/* Introduction */}
            <section>
              <h2 className="text-xl font-bold text-[var(--text-primary)] mb-4">Introduction</h2>
              <p>
                This Privacy Policy explains how <strong>{COMPANY.legalName}</strong>, trading as <strong>{COMPANY.tradingAs}</strong> (&ldquo;we&rdquo;, &ldquo;us&rdquo;, &ldquo;our&rdquo;, or the &ldquo;Agency&rdquo;), collects, uses, stores, and protects your personal data when you use our recruitment platform.
              </p>
              <p className="mt-4">
                We are committed to protecting your privacy and complying with the Swiss Federal Act on Data Protection (revFADP) and, where applicable, the EU General Data Protection Regulation (GDPR).
              </p>
              <p className="mt-4">
                Our platform is intended for individuals who are legally eligible to work. We do not knowingly collect personal data from individuals under 16 years of age.
              </p>
              <p className="mt-4">
                This Privacy Policy should be read together with our <Link href="/terms" className="underline hover:text-[var(--gold)]">Terms &amp; Conditions</Link>.
              </p>
            </section>

            {/* Data Controller */}
            <section>
              <h2 className="text-xl font-bold text-[var(--text-primary)] mb-4">Data Controller</h2>
              <p>The data controller responsible for your personal data is:</p>
              <div className="mt-4 p-4 bg-[var(--bg-surface-2)] rounded-lg border border-[var(--border-subtle)]">
                <p className="font-semibold text-[var(--text-primary)]">{COMPANY.legalName}</p>
                <p>Trading as: {COMPANY.tradingAs}</p>
                <p>{COMPANY.address.street}</p>
                <p>{COMPANY.address.postalCode} {COMPANY.address.city}, {COMPANY.address.country}</p>
                <p className="mt-2">
                  <strong>Data Protection Contact:</strong> {COMPANY.owner}<br />
                  <strong>Email:</strong> <a href={`mailto:${COMPANY.contacts.privacy}`} className="underline hover:text-[var(--gold)]">{COMPANY.contacts.privacy}</a>
                </p>
              </div>
            </section>

            {/* What Data We Collect */}
            <section>
              <h2 className="text-xl font-bold text-[var(--text-primary)] mb-4">What Data We Collect</h2>
              <p>We collect the following categories of personal data:</p>

              <h3 className="font-semibold text-[var(--text-primary)] mt-6 mb-2">Information you provide directly:</h3>
              <ul className="list-disc list-outside ml-6 space-y-1">
                <li><strong>Identity data:</strong> First name, last name</li>
                <li><strong>Contact data:</strong> Email address, phone number, LinkedIn URL</li>
                <li><strong>Professional data:</strong> CV/resume, work history, qualifications, certifications, skills, languages, years of experience</li>
                <li><strong>Preference data:</strong> Desired roles, preferred locations, salary expectations, notice period, work eligibility</li>
                <li><strong>Consent records:</strong> Timestamp of Terms acceptance</li>
              </ul>

              <h3 className="font-semibold text-[var(--text-primary)] mt-6 mb-2">Information collected automatically:</h3>
              <ul className="list-disc list-outside ml-6 space-y-1">
                <li><strong>Technical data:</strong> IP address, browser type, device information</li>
                <li><strong>Usage data:</strong> Pages visited, time spent on platform (with consent via analytics)</li>
                <li><strong>Security data:</strong> reCAPTCHA verification tokens for spam prevention</li>
              </ul>

              <h3 className="font-semibold text-[var(--text-primary)] mt-6 mb-2">Sensitive data:</h3>
              <p>
                We do not intentionally collect sensitive personal data (health information, religious beliefs, political opinions, etc.). If you include such information in your CV, you explicitly consent to its processing by uploading the document.
              </p>
            </section>

            {/* How We Use Your Data */}
            <section>
              <h2 className="text-xl font-bold text-[var(--text-primary)] mb-4">How We Use Your Data</h2>
              <p>We process your personal data for the following purposes:</p>

              <div className="mt-4 overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="border-b border-[var(--border-subtle)]">
                      <th className="text-left py-2 pr-4 font-semibold text-[var(--text-primary)]">Purpose</th>
                      <th className="text-left py-2 font-semibold text-[var(--text-primary)]">Legal Basis</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border-subtle)]">
                    <tr>
                      <td className="py-3 pr-4">Creating and displaying your anonymised profile to employers</td>
                      <td className="py-3">Consent / Contract performance</td>
                    </tr>
                    <tr>
                      <td className="py-3 pr-4">Facilitating contact between you and prospective employers</td>
                      <td className="py-3">Consent / Contract performance</td>
                    </tr>
                    <tr>
                      <td className="py-3 pr-4">AI-powered profile analysis and anonymisation</td>
                      <td className="py-3">Consent</td>
                    </tr>
                    <tr>
                      <td className="py-3 pr-4">Responding to your data access/deletion requests</td>
                      <td className="py-3">Legal obligation (revFADP)</td>
                    </tr>
                    <tr>
                      <td className="py-3 pr-4">Platform security and fraud prevention</td>
                      <td className="py-3">Legitimate interest</td>
                    </tr>
                    <tr>
                      <td className="py-3 pr-4">Website analytics (with consent)</td>
                      <td className="py-3">Consent</td>
                    </tr>
                    <tr>
                      <td className="py-3 pr-4">Compliance with Swiss law and regulations</td>
                      <td className="py-3">Legal obligation</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            {/* Automated Decision-Making */}
            <section>
              <h2 className="text-xl font-bold text-[var(--text-primary)] mb-4">Automated Decision-Making and Profiling</h2>
              <p>
                We use artificial intelligence (OpenAI) to assist with profile analysis and anonymisation. This involves automated processing of your CV and professional data to:
              </p>
              <ul className="list-disc list-outside ml-6 space-y-1 mt-4">
                <li>Extract and structure professional information from your CV</li>
                <li>Generate an anonymised version of your profile for employer viewing</li>
                <li>Detect and extract profile pictures from uploaded documents</li>
                <li>Categorise skills and experience for matching purposes</li>
              </ul>
              <p className="mt-4">
                These automated processes influence how your profile is presented to employers. Under Swiss data protection law, you have the right to:
              </p>
              <ul className="list-disc list-outside ml-6 space-y-1 mt-4">
                <li>Be informed about automated decisions that significantly affect you</li>
                <li>Express your view on such decisions</li>
                <li>Request that an automated decision be reviewed by a person</li>
              </ul>
              <p className="mt-4">
                To request human review of any automated processing of your profile, contact us at <a href={`mailto:${COMPANY.contacts.privacy}`} className="underline hover:text-[var(--gold)]">{COMPANY.contacts.privacy}</a>.
              </p>
            </section>

            {/* Third-Party Processors */}
            <section>
              <h2 className="text-xl font-bold text-[var(--text-primary)] mb-4">Third-Party Service Providers</h2>
              <p>We use the following third-party service providers (data processors) to operate our platform:</p>

              <div className="mt-4 overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="border-b border-[var(--border-subtle)]">
                      <th className="text-left py-2 pr-4 font-semibold text-[var(--text-primary)]">Provider</th>
                      <th className="text-left py-2 pr-4 font-semibold text-[var(--text-primary)]">Role</th>
                      <th className="text-left py-2 font-semibold text-[var(--text-primary)]">Purpose</th>
                    </tr>
                  </thead>
                  <tbody>
                    {THIRD_PARTY_PROCESSORS.map((processor) => (
                      <tr key={processor.provider} className="border-b border-[var(--border-subtle)]">
                        <td className="py-2 pr-4 font-medium">{processor.provider}</td>
                        <td className="py-2 pr-4">{processor.role}</td>
                        <td className="py-2">{processor.purpose}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <p className="mt-4">
                All processors are bound by Data Processing Agreements (DPAs) aligned with European data protection standards. These agreements require processors to implement appropriate security measures and restrict how they may process your data.
              </p>
            </section>

            {/* Analytics */}
            <section>
              <h2 className="text-xl font-bold text-[var(--text-primary)] mb-4">Analytics</h2>
              <p>
                We use <strong>Vercel Analytics</strong> to understand how visitors use our website. This is a privacy-friendly analytics solution that:
              </p>
              <ul className="list-disc list-outside ml-6 space-y-1 mt-4">
                <li>Only collects aggregated, anonymised usage data</li>
                <li>Does not use cookies for tracking</li>
                <li>Does not collect personal identifiers</li>
                <li>Is only enabled after you provide consent</li>
              </ul>
              <p className="mt-4">
                You can manage your analytics preferences through our consent banner. If you decline analytics consent, no usage data will be collected.
              </p>
            </section>

            {/* International Data Transfers */}
            <section>
              <h2 className="text-xl font-bold text-[var(--text-primary)] mb-4">International Data Transfers</h2>
              <p>
                Your personal data may be transferred to and processed in countries outside Switzerland and the European Economic Area (EEA), including the United States, where our service providers operate.
              </p>
              <p className="mt-4">
                When transferring data internationally, we ensure adequate protection through:
              </p>
              <ul className="list-disc list-outside ml-6 space-y-1 mt-2">
                <li><strong>Standard Contractual Clauses (SCCs)</strong> as recognised by the Swiss Federal Data Protection and Information Commissioner</li>
                <li><strong>Contractual data protection obligations</strong> within our processor agreements</li>
                <li><strong>Technical safeguards</strong> including encryption in transit and at rest</li>
              </ul>
              <p className="mt-4">
                You acknowledge that laws in some countries may permit government access to data. By using our platform, you consent to these international transfers with the safeguards described above.
              </p>
            </section>

            {/* Data Retention */}
            <section>
              <h2 className="text-xl font-bold text-[var(--text-primary)] mb-4">Data Retention</h2>
              <p>We retain your personal data according to the following schedule:</p>

              <div className="mt-4 overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="border-b border-[var(--border-subtle)]">
                      <th className="text-left py-2 pr-4 font-semibold text-[var(--text-primary)]">Data Type</th>
                      <th className="text-left py-2 font-semibold text-[var(--text-primary)]">Retention Period</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border-subtle)]">
                    <tr>
                      <td className="py-3 pr-4">Active profile data</td>
                      <td className="py-3">Until you request deletion</td>
                    </tr>
                    <tr>
                      <td className="py-3 pr-4">Inactive profiles</td>
                      <td className="py-3">{COMPANY.inactivityPeriodMonths} months of inactivity, then deleted</td>
                    </tr>
                    <tr>
                      <td className="py-3 pr-4">Tax/invoicing records</td>
                      <td className="py-3">{COMPANY.dataRetentionYears} years (Swiss legal requirement)</td>
                    </tr>
                    <tr>
                      <td className="py-3 pr-4">Consent records</td>
                      <td className="py-3">Duration of relationship + 3 years</td>
                    </tr>
                    <tr>
                      <td className="py-3 pr-4">Security logs</td>
                      <td className="py-3">90 days</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <p className="mt-4">
                After retention periods expire, data is securely deleted or irreversibly anonymised.
              </p>
            </section>

            {/* Your Rights */}
            <section>
              <h2 className="text-xl font-bold text-[var(--text-primary)] mb-4">Your Rights Under Swiss Data Protection Law</h2>
              <p>Under the revised Federal Act on Data Protection (revFADP), you have the following rights:</p>

              <ul className="list-disc list-outside ml-6 space-y-3 mt-4">
                <li>
                  <strong>Right to access:</strong> Request information about what personal data we hold about you and how it is processed.
                </li>
                <li>
                  <strong>Right to correction:</strong> Request correction of inaccurate or incomplete data.
                </li>
                <li>
                  <strong>Right to deletion:</strong> Request deletion of your personal data (subject to legal retention requirements).
                </li>
                <li>
                  <strong>Right to object:</strong> Object to processing that infringes your rights, including for direct marketing purposes.
                </li>
                <li>
                  <strong>Right to data portability:</strong> Request your personal data in a commonly used electronic format.
                </li>
                <li>
                  <strong>Right to withdraw consent:</strong> Withdraw your consent at any time (this does not affect lawfulness of prior processing).
                </li>
              </ul>
            </section>

            {/* How to Exercise Your Rights */}
            <section>
              <h2 className="text-xl font-bold text-[var(--text-primary)] mb-4">How to Exercise Your Rights</h2>
              <p>To exercise any of your data protection rights, contact us at:</p>
              <div className="mt-4 p-4 bg-[var(--bg-surface-2)] rounded-lg border border-[var(--border-subtle)]">
                <p><strong>Email:</strong> <a href={`mailto:${COMPANY.contacts.privacy}`} className="underline hover:text-[var(--gold)]">{COMPANY.contacts.privacy}</a></p>
                <p><strong>Mail:</strong> {COMPANY.legalName}, {COMPANY.address.street}, {COMPANY.address.postalCode} {COMPANY.address.city}, {COMPANY.address.country}</p>
              </div>
              <p className="mt-4">
                Please include your name, email address, and the specific right you wish to exercise. We will respond within <strong>30 days</strong> as required by revFADP.
              </p>
              <p className="mt-4">
                If you are unsatisfied with our response, you may lodge a complaint with the:
              </p>
              <div className="mt-4 p-4 bg-[var(--bg-surface-2)] rounded-lg border border-[var(--border-subtle)]">
                <p className="font-semibold text-[var(--text-primary)]">{FDPIC_CONTACT.name}</p>
                <p>{FDPIC_CONTACT.address}</p>
                <p className="mt-2">
                  <a href={FDPIC_CONTACT.website} target="_blank" rel="noopener noreferrer" className="underline hover:text-[var(--gold)]">{FDPIC_CONTACT.website}</a>
                </p>
              </div>
            </section>

            {/* Security */}
            <section>
              <h2 className="text-xl font-bold text-[var(--text-primary)] mb-4">Security Measures</h2>
              <p>We implement appropriate technical and organisational measures to protect your data, including:</p>
              <ul className="list-disc list-outside ml-6 space-y-1 mt-4">
                <li>Encryption of data in transit (TLS/HTTPS) and at rest</li>
                <li>Access controls and authentication requirements</li>
                <li>Periodic review of security practices</li>
                <li>Incident response procedures</li>
              </ul>
              <p className="mt-4">
                In the event of a data breach likely to result in high risk to your rights, we will notify you and the FDPIC as required by revFADP Article 24.
              </p>
            </section>

            {/* Cookies */}
            <section>
              <h2 className="text-xl font-bold text-[var(--text-primary)] mb-4">Cookies</h2>
              <p>
                For detailed information about our use of cookies and similar technologies, please see our <Link href="/cookies" className="underline hover:text-[var(--gold)]">Cookie Policy</Link>.
              </p>
            </section>

            {/* Changes */}
            <section>
              <h2 className="text-xl font-bold text-[var(--text-primary)] mb-4">Changes to This Policy</h2>
              <p>
                We may update this Privacy Policy from time to time. Material changes will be communicated via email or notice on our platform. The &ldquo;Last updated&rdquo; date at the top indicates when the policy was last revised.
              </p>
              <p className="mt-4">
                Continued use of our platform after changes constitutes acceptance of the updated policy.
              </p>
            </section>

            {/* Contact */}
            <section>
              <h2 className="text-xl font-bold text-[var(--text-primary)] mb-4">Contact Us</h2>
              <p>For privacy-related questions or concerns:</p>
              <div className="mt-4 p-4 bg-[var(--bg-surface-2)] rounded-lg border border-[var(--border-subtle)]">
                <p><strong>Data Protection Contact:</strong> {COMPANY.owner}</p>
                <p><strong>Email:</strong> <a href={`mailto:${COMPANY.contacts.privacy}`} className="underline hover:text-[var(--gold)]">{COMPANY.contacts.privacy}</a></p>
                <p><strong>General Inquiries:</strong> <a href={`mailto:${COMPANY.contacts.support}`} className="underline hover:text-[var(--gold)]">{COMPANY.contacts.support}</a></p>
              </div>
            </section>

            {/* Footer */}
            <div className="mt-12 pt-8 border-t border-[var(--border-subtle)]">
              <p className="text-sm text-[var(--text-tertiary)]">
                <strong>Last updated:</strong> {COMPANY.terms.lastUpdated}<br />
                <strong>Contact:</strong> <a href={`mailto:${COMPANY.contacts.privacy}`} className="underline hover:text-[var(--gold)]">{COMPANY.contacts.privacy}</a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPage;
