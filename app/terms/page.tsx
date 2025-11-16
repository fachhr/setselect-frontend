import Link from 'next/link';
import Button from '@/components/ui/Button';

export default function TermsPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12" style={{
      background: 'var(--background-gradient)',
      backgroundAttachment: 'fixed'
    }}>
      <div className="max-w-4xl w-full">
        <div className="bg-[var(--light)] rounded-xl shadow-lg p-8 sm:p-12">
          {/* Title Section */}
          <div className="mb-12 pb-8 border-b border-[var(--light-400)]">
            <h1 className="text-4xl sm:text-5xl font-bold text-[var(--text-[var(--accent-gold)])] mb-4 tracking-tight">
              Terms and Conditions
            </h1>
            <p className="text-[var(--text-secondary)] text-lg">
              Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>

          {/* Content */}
          <div className="space-y-12 prose prose-lg max-w-none">
            {/* Section 1 */}
            <section>
              <div className="flex items-start gap-4 mb-6">
                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-[var(--accent-gold-alpha)] flex items-center justify-center">
                  <span className="text-[var(--accent-gold)] font-bold text-lg">1</span>
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-[var(--text-[var(--accent-gold)])] mb-4">
                    Talent Pool Participation
                  </h2>
                  <p className="text-[var(--text-secondary)] leading-relaxed mb-4">
                    By joining Silvia's List talent pool, you agree to allow us to:
                  </p>
                  <ul className="space-y-3 text-[var(--text-secondary)] list-none">
                    <li className="flex items-start gap-3">
                      <span className="text-[var(--accent-gold)] mt-1 flex-shrink-0">•</span>
                      <span>Store and process your professional information</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-[var(--accent-gold)] mt-1 flex-shrink-0">•</span>
                      <span>Share your profile with potential employers and clients</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-[var(--accent-gold)] mt-1 flex-shrink-0">•</span>
                      <span>Contact you about relevant job opportunities</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-[var(--accent-gold)] mt-1 flex-shrink-0">•</span>
                      <span>Use AI technology to extract information from your CV</span>
                    </li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Section 2 */}
            <section>
              <div className="flex items-start gap-4 mb-6">
                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-[var(--accent-gold-alpha)] flex items-center justify-center">
                  <span className="text-[var(--accent-gold)] font-bold text-lg">2</span>
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-4">
                    Data Collection and Use
                  </h2>
                  <p className="text-[var(--text-secondary)] leading-relaxed mb-6">
                    We collect and process the following types of information:
                  </p>

                  <div className="space-y-6">
                    <div>
                      <h3 className="text-xl font-semibold text-[var(--text-primary)] mb-3">
                        2.1 Information You Provide
                      </h3>
                      <ul className="space-y-3 text-[var(--text-secondary)] list-none">
                        <li className="flex items-start gap-3">
                          <span className="text-[var(--accent-gold)] mt-1 flex-shrink-0">•</span>
                          <span>Personal contact details (name, email, phone number, LinkedIn)</span>
                        </li>
                        <li className="flex items-start gap-3">
                          <span className="text-[var(--accent-gold)] mt-1 flex-shrink-0">•</span>
                          <span>Professional preferences (job types, locations, industries, salary expectations)</span>
                        </li>
                        <li className="flex items-start gap-3">
                          <span className="text-[var(--accent-gold)] mt-1 flex-shrink-0">•</span>
                          <span>Work availability and capacity</span>
                        </li>
                        <li className="flex items-start gap-3">
                          <span className="text-[var(--accent-gold)] mt-1 flex-shrink-0">•</span>
                          <span>Your uploaded CV document</span>
                        </li>
                      </ul>
                    </div>

                    <div>
                      <h3 className="text-xl font-semibold text-[var(--text-primary)] mb-3">
                        2.2 Information We Extract
                      </h3>
                      <p className="text-[var(--text-secondary)] leading-relaxed mb-4">
                        Using AI-powered CV parsing, we automatically extract:
                      </p>
                      <ul className="space-y-3 text-[var(--text-secondary)] list-none">
                        <li className="flex items-start gap-3">
                          <span className="text-[var(--accent-gold)] mt-1 flex-shrink-0">•</span>
                          <span>Education history and qualifications</span>
                        </li>
                        <li className="flex items-start gap-3">
                          <span className="text-[var(--accent-gold)] mt-1 flex-shrink-0">•</span>
                          <span>Professional work experience</span>
                        </li>
                        <li className="flex items-start gap-3">
                          <span className="text-[var(--accent-gold)] mt-1 flex-shrink-0">•</span>
                          <span>Skills and competencies</span>
                        </li>
                        <li className="flex items-start gap-3">
                          <span className="text-[var(--accent-gold)] mt-1 flex-shrink-0">•</span>
                          <span>Languages and proficiency levels</span>
                        </li>
                        <li className="flex items-start gap-3">
                          <span className="text-[var(--accent-gold)] mt-1 flex-shrink-0">•</span>
                          <span>Certifications and licenses</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Section 3 */}
            <section>
              <div className="flex items-start gap-4 mb-6">
                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-[var(--accent-gold-alpha)] flex items-center justify-center">
                  <span className="text-[var(--accent-gold)] font-bold text-lg">3</span>
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-4">
                    How We Use Your Data
                  </h2>
                  <p className="text-[var(--text-secondary)] leading-relaxed mb-4">
                    Your information is used for job matching, profile sharing with employers, communication about opportunities, and service improvement.
                  </p>
                </div>
              </div>
            </section>

            {/* Section 4 */}
            <section>
              <div className="flex items-start gap-4 mb-6">
                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-[var(--accent-gold-alpha)] flex items-center justify-center">
                  <span className="text-[var(--accent-gold)] font-bold text-lg">4</span>
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-4">
                    Data Storage and Security
                  </h2>
                  <p className="text-[var(--text-secondary)] leading-relaxed mb-4">
                    Your data is stored securely using Supabase (PostgreSQL) and AWS infrastructure with servers in Europe. We use encrypted transmission (HTTPS/TLS), secure access controls, and regular security monitoring.
                  </p>
                </div>
              </div>
            </section>

            {/* Section 5 */}
            <section>
              <div className="flex items-start gap-4 mb-6">
                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-[var(--accent-gold-alpha)] flex items-center justify-center">
                  <span className="text-[var(--accent-gold)] font-bold text-lg">5</span>
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-4">
                    Your Rights (GDPR & Swiss Data Protection)
                  </h2>
                  <p className="text-[var(--text-secondary)] leading-relaxed mb-4">
                    You have the right to access, rectify, erase, port, and object to processing of your data. Contact us at{' '}
                    <a href="mailto:privacy@silviaslist.com" className="text-[var(--accent-gold)] hover:text-[var(--accent-gold)]-dark underline">
                      privacy@silviaslist.com
                    </a>
                    {' '}to exercise these rights.
                  </p>
                </div>
              </div>
            </section>

            {/* Section 6 */}
            <section>
              <div className="flex items-start gap-4 mb-6">
                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-[var(--accent-gold-alpha)] flex items-center justify-center">
                  <span className="text-[var(--accent-gold)] font-bold text-lg">6</span>
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-4">
                    Data Sharing
                  </h2>
                  <p className="text-[var(--text-secondary)] leading-relaxed mb-4">
                    We share your profile with potential employers and necessary service providers. We will never sell your data or use it for unrelated marketing purposes.
                  </p>
                </div>
              </div>
            </section>

            {/* Section 7 */}
            <section>
              <div className="flex items-start gap-4 mb-6">
                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-[var(--accent-gold-alpha)] flex items-center justify-center">
                  <span className="text-[var(--accent-gold)] font-bold text-lg">7</span>
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-4">
                    AI and Automated Processing
                  </h2>
                  <p className="text-[var(--text-secondary)] leading-relaxed mb-4">
                    We use OpenAI's GPT-4 to extract information from your CV. This processing saves time, improves accuracy, and can be reviewed/corrected upon request.
                  </p>
                </div>
              </div>
            </section>

            {/* Section 8 */}
            <section>
              <div className="flex items-start gap-4 mb-6">
                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-[var(--accent-gold-alpha)] flex items-center justify-center">
                  <span className="text-[var(--accent-gold)] font-bold text-lg">8</span>
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-4">
                    Contact Information
                  </h2>
                  <p className="text-[var(--text-secondary)] leading-relaxed mb-4">
                    For questions about these terms:{' '}
                    <a href="mailto:contact@silviaslist.com" className="text-[var(--accent-gold)] hover:text-[var(--accent-gold)]-dark underline">
                      contact@silviaslist.com
                    </a>
                  </p>
                  <p className="text-[var(--text-secondary)] leading-relaxed">
                    For privacy inquiries:{' '}
                    <a href="mailto:privacy@silviaslist.com" className="text-[var(--accent-gold)] hover:text-[var(--accent-gold)]-dark underline">
                      privacy@silviaslist.com
                    </a>
                  </p>
                </div>
              </div>
            </section>

            {/* Acceptance */}
            <div className="mt-12 pt-8 border-t-2 border-[var(--light-400)]">
              <p className="text-[var(--text-secondary)] leading-relaxed text-center">
                By submitting your profile to Silvia's List, you acknowledge that you have read, understood, and agree to be bound by these Terms and Conditions.
              </p>
            </div>
          </div>

          {/* Back Button */}
          <div className="mt-12 text-center">
            <Link href="/">
              <Button variant="outline" size="lg">
                <svg className="w-5 h-5 -ml-1 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to Home
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
