'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { COMPANY, FDPIC_CONTACT } from '@/lib/legal/constants';

const sections = [
  { id: 'introduction', title: '1. Introduction and scope' },
  { id: 'purpose', title: '2. Purpose of the platform' },
  { id: 'representations', title: '3. Your representations, warranties, and obligations' },
  { id: 'data-processing', title: '4. Data processing, consent, and anonymisation' },
  { id: 'third-party', title: '5. Third-party services, data transfers, and processor responsibilities' },
  { id: 'security', title: '6. Security, data breaches, and cyber incidents' },
  { id: 'liability', title: '7. Limitation of liability and disclaimer' },
  { id: 'rights', title: '8. Your rights under Swiss data-protection law' },
  { id: 'indemnification', title: '9. Candidate responsibilities and indemnification' },
  { id: 'no-employment', title: '10. No employment relationship or recruitment guarantee' },
  { id: 'external-links', title: '11. Disclaimer for external links and third-party content' },
  { id: 'termination', title: '12. Suspension and termination of account' },
  { id: 'ip', title: '13. Intellectual property' },
  { id: 'disputes', title: '14. Dispute resolution' },
  { id: 'compliance', title: '15. Compliance with law and regulatory obligations' },
  { id: 'miscellaneous', title: '16. Miscellaneous provisions' },
  { id: 'contact', title: '17. Contact and support' },
  { id: 'acknowledgement', title: '18. Acknowledgement and acceptance' },
];

const TermsPage: React.FC = () => {
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
              Terms &amp; <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--secondary)] to-[var(--highlight)]">Conditions</span>
            </h1>
            <p className="mt-4 text-lg text-[var(--text-secondary)]">
              Legal agreements governing your use of the SetSelect platform.
            </p>
            <p className="mt-2 text-sm text-[var(--text-tertiary)]">
              Last updated: {COMPANY.terms.lastUpdated} | Effective date: {COMPANY.terms.effectiveDate}
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-3xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="glass-panel rounded-2xl p-8 md:p-12">
          {/* Table of Contents */}
          <nav className="mb-12 pb-8 border-b border-[var(--border-subtle)]">
            <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4">Contents</h2>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
              {sections.map((section) => (
                <li key={section.id}>
                  <a
                    href={`#${section.id}`}
                    className="text-[var(--text-secondary)] hover:text-[var(--gold)] transition-colors"
                  >
                    {section.title}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          {/* Terms Content */}
          <div className="space-y-12 text-[var(--text-secondary)] leading-relaxed">

            {/* Section 1 */}
            <section id="introduction">
              <h2 className="text-xl font-bold text-[var(--text-primary)] mb-4">1. Introduction and scope</h2>
              <div className="space-y-4">
                <p>
                  <strong>1.1</strong> These Terms and Conditions (&ldquo;<strong>Terms</strong>&rdquo;) apply to all individuals (&ldquo;<strong>you</strong>&rdquo;, &ldquo;<strong>Candidate</strong>&rdquo;, &ldquo;<strong>Data Subject</strong>&rdquo;) who upload their CVs, create a profile, or otherwise use the platform operated by <strong>{COMPANY.legalName}</strong>, trading as <strong>{COMPANY.tradingAs}</strong> (&ldquo;<strong>Agency</strong>&rdquo;, &ldquo;<strong>we</strong>&rdquo;, &ldquo;<strong>us</strong>&rdquo;, &ldquo;<strong>our</strong>&rdquo;), a registered recruitment and staffing agency in Switzerland.
                </p>
                <p>
                  <strong>1.2</strong> By uploading a CV, submitting a profile form, or accessing any part of the platform, you confirm that you have read, understood, and fully accepted these Terms in their entirety, including our separate <Link href="/privacy" className="underline hover:text-[var(--gold)]">Privacy Policy</Link> (which governs how your personal data is processed). If you do not accept these Terms, you must not use the platform.
                </p>
                <p>
                  <strong>1.3</strong> These Terms constitute a legally binding agreement between you and the Agency, governed by the laws of Switzerland. Any use of the platform constitutes acceptance of these Terms.
                </p>
                <p>
                  <strong>1.4</strong> The Agency reserves the right to update these Terms at any time. We will publish updated Terms on this page and, for material changes, notify you via email or in-platform notice. Your continued use after publication of updates constitutes acceptance of the updated Terms.
                </p>
                <p>
                  <strong>1.5</strong> The platform is intended for individuals who are at least 16 years of age and legally eligible to work. By using the platform, you confirm that you meet these requirements.
                </p>
              </div>
            </section>

            {/* Section 2 */}
            <section id="purpose">
              <h2 className="text-xl font-bold text-[var(--text-primary)] mb-4">2. Purpose of the platform</h2>
              <div className="space-y-4">
                <p>
                  <strong>2.1</strong> The platform is a <strong>recruitment services marketplace</strong> that enables Candidates to:
                </p>
                <ul className="list-disc list-outside ml-6 space-y-1">
                  <li>Upload and store CVs and professional profile information.</li>
                  <li>Create an <strong>anonymised</strong> or <strong>pseudonymised</strong> profile viewable by employers.</li>
                  <li>Opt-in to disclosure of full CVs and contact details to prospective employers.</li>
                </ul>
                <p>
                  <strong>2.2</strong> The Agency acts as a <strong>data controller</strong> and <strong>recruitment/employment services provider</strong> under Swiss law, specifically:
                </p>
                <ul className="list-disc list-outside ml-6 space-y-1">
                  <li>The revised Federal Act on Data Protection (revFADP), in force since 1 September 2023.</li>
                  <li>The Act on Employment Services (AVG) and Employment Services Ordinance (AVV).</li>
                  <li>The Swiss Code of Obligations (Obligationenrecht, OR), Article 328b.</li>
                </ul>
                <p>
                  <strong>2.3</strong> You acknowledge that:
                </p>
                <ul className="list-disc list-outside ml-6 space-y-1">
                  <li>You are <strong>not</strong> applying for a specific job through the platform.</li>
                  <li>Instead, you are making your CV and professional profile available to a pool of employers.</li>
                  <li>The Agency will facilitate the connection between your profile and interested employers, but the Agency is not a party to any resulting employment relationship.</li>
                </ul>
                <p>
                  <strong>2.4</strong> The Agency may also use your data and profile information (with your consent) for its own recruitment, staffing, or business-development activities, subject to this Privacy Policy and applicable law.
                </p>
              </div>
            </section>

            {/* Section 3 */}
            <section id="representations">
              <h2 className="text-xl font-bold text-[var(--text-primary)] mb-4">3. Your representations, warranties, and obligations</h2>
              <div className="space-y-4">
                <h3 className="font-semibold text-[var(--text-primary)]">3.1 Accuracy and lawfulness</h3>
                <p>You warrant and represent that:</p>
                <ul className="list-[lower-alpha] list-outside ml-6 space-y-2">
                  <li>All information you provide (including your CV, profile data, contact details, work history, qualifications, certifications, and references) is <strong>accurate, complete, true, and current</strong>.</li>
                  <li>You have the <strong>full legal right</strong> to provide, upload, and share the information contained in your CV and profile, including any details about past employers, projects, achievements, clients, or confidential matters.</li>
                  <li>Your upload and use of the platform does not violate any <strong>third-party rights</strong>, including but not limited to: confidentiality, non-disclosure, or trade-secret obligations to current or former employers; intellectual-property rights; non-compete or non-solicitation clauses; or any contractual restrictions on your ability to seek employment elsewhere.</li>
                  <li>All information is true and not misleading, deceptive, or false in any material respect.</li>
                </ul>

                <h3 className="font-semibold text-[var(--text-primary)]">3.2 Responsibility for updates</h3>
                <p>
                  You must notify the Agency <strong>immediately</strong> (within 5 business days) if any information becomes inaccurate, incomplete, outdated, or no longer valid. The Agency is not responsible for decisions made by employers based on outdated or inaccurate information you provided.
                </p>

                <h3 className="font-semibold text-[var(--text-primary)]">3.3 Prohibited content</h3>
                <p>You must <strong>not</strong> upload, submit, or include any content that:</p>
                <ul className="list-disc list-outside ml-6 space-y-1">
                  <li>Is unlawful, criminal, defamatory, discriminatory, harassing, abusive, hateful, or otherwise harmful.</li>
                  <li>Violates any third-party rights (intellectual property, privacy, publicity, confidentiality).</li>
                  <li>Contains malware, viruses, malicious code, or harmful software.</li>
                  <li>Is obscene, sexually explicit, or otherwise inappropriate for a professional recruitment platform.</li>
                  <li>Impersonates or misrepresents your identity, qualifications, or background.</li>
                  <li>Violates these Terms or any applicable law or regulation.</li>
                </ul>
                <p>The Agency reserves the right to immediately remove such content and terminate your access without notice.</p>

                <h3 className="font-semibold text-[var(--text-primary)]">3.4 Data security responsibility</h3>
                <p>
                  You are responsible for ensuring that any information you provide to us is transmitted securely. You must notify the Agency immediately if you suspect any unauthorised access to or use of your personal data.
                </p>

                <h3 className="font-semibold text-[var(--text-primary)]">3.5 Use of AI and automated services</h3>
                <p>
                  You acknowledge that the Agency uses third-party artificial intelligence and automated services (including OpenAI) to assist with profile analysis, anonymisation, matching, and platform operations. By uploading your data, you consent to the processing of your personal data by these AI services as described in the Privacy Policy.
                </p>
                <p>
                  You have the right to request human review of any automated decisions that significantly affect how your profile is presented or processed. To request a review, contact the Agency&apos;s data-protection team at <a href={`mailto:${COMPANY.contacts.privacy}`} className="underline hover:text-[var(--gold)]">{COMPANY.contacts.privacy}</a>.
                </p>
                <p>
                  The Agency monitors developments in Swiss and European AI regulation, including the Council of Europe Convention on Artificial Intelligence (signed by Switzerland in March 2025) and upcoming Swiss AI legislation, and will update its practices accordingly.
                </p>
              </div>
            </section>

            {/* Section 4 */}
            <section id="data-processing">
              <h2 className="text-xl font-bold text-[var(--text-primary)] mb-4">4. Data processing, consent, and anonymisation</h2>
              <div className="space-y-4">
                <h3 className="font-semibold text-[var(--text-primary)]">4.1 Legal basis and scope of processing</h3>
                <p>The Agency processes your personal data (including your CV, profile information, contact details, work history, and other professional information) on the following legal bases under the revised Federal Act on Data Protection (revFADP):</p>
                <ul className="list-[lower-alpha] list-outside ml-6 space-y-2">
                  <li><strong>Recruitment services</strong> (legal basis: performance of the service agreement between you and the Agency, revFADP Art. 6 para. 6-7): Creating and displaying an anonymised or pseudonymised profile on the platform; enabling employers to search, view, and shortlist your profile; and facilitating contact between you and prospective employers.</li>
                  <li><strong>Profile management</strong> (legal basis: performance of the service agreement): Managing your profile, responding to your requests (e.g. access, correction, deletion), and enabling you to control which employers can see your data.</li>
                  <li><strong>Legal compliance</strong> (legal basis: legal obligation under revFADP, AVG/AVV, tax law): Ensuring compliance with Swiss data-protection law, employment law, tax law, and any court orders or regulatory requests.</li>
                  <li><strong>Platform security and improvement</strong> (legal basis: overriding private interest of the Agency, revFADP Art. 31): Detecting and preventing fraud, security incidents, abuse, and improving platform functionality and user experience.</li>
                  <li><strong>Analytics and reporting</strong> (legal basis: consent, where required under FDPIC guidelines): Aggregating and analysing anonymised or pseudonymised data to improve the platform and understand recruitment trends (no individual identification).</li>
                  <li><strong>Direct marketing</strong> (legal basis: consent, opt-in): Sending you updates about relevant job opportunities, platform news, and recruitment tips. You may opt out of marketing communications at any time.</li>
                </ul>
                <p>
                  We rely on consent only where specifically required by law (e.g., for marketing communications and analytics). For core recruitment services, the legal basis is the service agreement you enter into by creating a profile and our overriding legitimate interest as a licensed recruitment agency. This approach is consistent with revFADP, which permits data processing unless a justification ground is violated (Art. 6 revFADP), and with Art. 328b of the Swiss Code of Obligations and Art. 18-19 of the Employment Services Act (AVG/AVV).
                </p>

                <h3 className="font-semibold text-[var(--text-primary)]">4.2 Explicit consent to anonymisation and profile disclosure</h3>
                <p>By uploading your CV, you explicitly consent to:</p>
                <ul className="list-[lower-alpha] list-outside ml-6 space-y-2">
                  <li>The Agency <strong>anonymising or pseudonymising</strong> your profile (e.g. removing your name, contact details, and generalising your employer name to &ldquo;Senior Role in Tier 1 Swiss Bank&rdquo;) so that employers cannot easily identify you from the anonymised profile alone.</li>
                  <li>The <strong>disclosure of your anonymised profile</strong> to employers using the Agency&apos;s platform, who will then decide whether to view your full details.</li>
                  <li>The <strong>disclosure of your full CV and contact details</strong> to employers you have explicitly approved or who have received your permission to contact you.</li>
                </ul>

                <h3 className="font-semibold text-[var(--text-primary)]">4.3 Important caveat: Residual identifiability</h3>
                <p>You <strong>acknowledge and accept</strong> that:</p>
                <ul className="list-[lower-alpha] list-outside ml-6 space-y-2">
                  <li><strong>Anonymisation does not guarantee complete anonymity</strong>, especially in <strong>niche, specialised, or small-market environments</strong> (such as senior commodity-trading roles in Switzerland).</li>
                  <li>Even with anonymisation applied, an employer may be able to <strong>identify or re-identify you</strong> based on: your professional experience, career progression, and work history; your specific skills, qualifications, or certifications; the industries, companies, and geographies where you have worked; other contextual information available in the anonymised profile.</li>
                  <li><strong>Residual re-identification is a known risk</strong> in small professional communities, and the Agency cannot fully eliminate this risk while maintaining the profile&apos;s usefulness to employers.</li>
                  <li>You assume this risk by uploading your profile. If you are uncomfortable with residual identifiability, you may choose <strong>not</strong> to use this platform, or request deletion of your profile at any time.</li>
                </ul>

                <h3 className="font-semibold text-[var(--text-primary)]">4.4 Explicit consent to data transfers and third-party processing</h3>
                <p>You explicitly consent to:</p>
                <ul className="list-[lower-alpha] list-outside ml-6 space-y-2">
                  <li>The <strong>storage and processing of your personal data</strong> by the Agency and its authorised third-party <strong>service providers</strong> (i.e. data processors acting on the Agency&apos;s behalf), including cloud infrastructure and hosting providers, artificial intelligence and machine-learning platforms, backup, security, logging, and monitoring services, and payment processors and analytics providers.</li>
                  <li>The <strong>transfer of your personal data</strong> to countries <strong>outside Switzerland and the European Economic Area</strong> (e.g. the United States), where such transfers are made under <strong>Standard Contractual Clauses (SCCs)</strong> as recognised by the Swiss Federal Data Protection and Information Commissioner, contractual data protection obligations, or other legally recognised safeguards (as detailed in the Privacy Policy).</li>
                  <li>The <strong>disclosure of your full CV, contact details, and professional information</strong> to employers that use the Agency&apos;s platform, if you have given explicit consent or initiated contact with them.</li>
                  <li>The processing of your <strong>particularly sensitive personal data</strong> (as defined under Swiss data-protection law), if you have voluntarily provided it (e.g. health information, biometric data, ethnic background, union membership, political affiliation). By voluntarily including such information in your CV or profile, you consent to its processing as described in the <Link href="/privacy" className="underline hover:text-[var(--gold)]">Privacy Policy</Link>.</li>
                </ul>

                <h3 className="font-semibold text-[var(--text-primary)]">4.5 Withdrawal of consent</h3>
                <p>You may <strong>withdraw your consent</strong> at any time by:</p>
                <ul className="list-disc list-outside ml-6 space-y-1">
                  <li>Sending a written request to the Agency&apos;s data-protection contact at <a href={`mailto:${COMPANY.contacts.privacy}`} className="underline hover:text-[var(--gold)]">{COMPANY.contacts.privacy}</a>.</li>
                </ul>
                <p>
                  <strong>Important</strong>: Withdrawal of consent does <strong>not</strong> affect the lawfulness of data processing that occurred <strong>before</strong> your withdrawal. Employers who have already received your full CV or contact details may continue to possess and use that information (the Agency cannot retrieve it after disclosure).
                </p>

                <h3 className="font-semibold text-[var(--text-primary)]">4.6 Data retention</h3>
                <p>
                  The Agency will retain your personal data <strong>only as long as necessary</strong> to fulfil the purposes set out above or as required by Swiss or international law (e.g. tax retention periods of {COMPANY.dataRetentionYears} years for invoicing records).
                </p>
                <p>Upon deletion of your profile or expiry of the retention period, the Agency will:</p>
                <ul className="list-disc list-outside ml-6 space-y-1">
                  <li><strong>Delete or irreversibly anonymise</strong> your personal data.</li>
                  <li>Ensure that any backups are securely destroyed within a reasonable timeframe.</li>
                  <li>Securely delete or anonymise data held by third-party processors.</li>
                </ul>
                <p>You may request the deletion or anonymisation of your data at any time (subject to legal retention obligations).</p>
              </div>
            </section>

            {/* Section 5 */}
            <section id="third-party">
              <h2 className="text-xl font-bold text-[var(--text-primary)] mb-4">5. Third-party services, data transfers, and processor responsibilities</h2>
              <div className="space-y-4">
                <h3 className="font-semibold text-[var(--text-primary)]">5.1 Use of third-party providers</h3>
                <p>The platform relies on <strong>third-party software, cloud infrastructure, and service providers</strong> to operate, secure, store, and process your data. For a complete list of our third-party service providers and their roles, see our <Link href="/privacy" className="underline hover:text-[var(--gold)]">Privacy Policy</Link>.</p>

                <h3 className="font-semibold text-[var(--text-primary)]">5.2 Your acknowledgement</h3>
                <p>You acknowledge and accept that:</p>
                <ul className="list-[lower-alpha] list-outside ml-6 space-y-2">
                  <li>These providers act as <strong>data processors</strong> (or sub-processors) under Swiss data-protection law and process your data <strong>on behalf of</strong> the Agency.</li>
                  <li>The Agency has contractually obligated these providers to implement appropriate data protection measures. See our <Link href="/privacy" className="underline hover:text-[var(--gold)]">Privacy Policy</Link> for details on Data Processing Agreements and safeguards.</li>
                  <li>Your data may be <strong>stored or processed in Switzerland, the European Economic Area (EEA), or other countries</strong> (including the United States), depending on the provider&apos;s infrastructure and operations.</li>
                  <li>The Agency <strong>cannot guarantee</strong> that third-party services will be <strong>free from errors, outages, security incidents, or data breaches</strong>.</li>
                  <li>You use the platform and third-party services <strong>at your own risk</strong>, understanding that no system is 100% secure.</li>
                </ul>

                <h3 className="font-semibold text-[var(--text-primary)]">5.3 Data transfers abroad (Non-EEA countries)</h3>
                <p>Where data is transferred to countries without equivalent data protection, the Agency relies on Standard Contractual Clauses and contractual data protection obligations. You consent to these transfers, understanding that laws in non-EEA countries may require data access by government authorities. See our <Link href="/privacy" className="underline hover:text-[var(--gold)]">Privacy Policy</Link> for details on international transfer safeguards.</p>

                <h3 className="font-semibold text-[var(--text-primary)]">5.4 The Agency&apos;s responsibility for processors</h3>
                <p>The Agency remains the <strong>data controller</strong> and is responsible for:</p>
                <ul className="list-disc list-outside ml-6 space-y-1">
                  <li><strong>Carefully selecting</strong> processors based on their security capabilities and data-protection compliance.</li>
                  <li><strong>Contracting with processors</strong> under agreements that require appropriate data protection measures (see <Link href="/privacy" className="underline hover:text-[var(--gold)]">Privacy Policy</Link> for details).</li>
                  <li><strong>Monitoring and auditing</strong> processors&apos; security and compliance measures.</li>
                  <li><strong>Responding to data-subject rights requests</strong> (access, deletion, etc.).</li>
                </ul>
                <p>The Agency is <strong>not responsible</strong> for:</p>
                <ul className="list-disc list-outside ml-6 space-y-1">
                  <li><strong>Actions or failures within the processors&apos; own systems or infrastructure</strong>, provided the Agency selected them with due care and contractually required security measures.</li>
                  <li><strong>Outages, errors, or security incidents</strong> caused solely and directly by a processor&apos;s negligence or breach, unless the Agency also failed in its supervisory duties.</li>
                </ul>

                <h3 className="font-semibold text-[var(--text-primary)]">5.5 Sub-processors and your veto right</h3>
                <p>
                  Under revFADP, the Agency&apos;s processors (e.g. Supabase) may only engage <strong>sub-processors</strong> with the Agency&apos;s <strong>prior written approval</strong>. Processors must disclose sub-processors to the Agency and obtain approval before involving additional third parties.
                </p>
                <p>You may request a current list of sub-processors by contacting the Agency&apos;s data-protection team.</p>
              </div>
            </section>

            {/* Section 6 */}
            <section id="security">
              <h2 className="text-xl font-bold text-[var(--text-primary)] mb-4">6. Security, data breaches, and cyber incidents</h2>
              <div className="space-y-4">
                <h3 className="font-semibold text-[var(--text-primary)]">6.1 Security measures</h3>
                <p>The Agency implements <strong>appropriate technical and organisational measures</strong> to protect your personal data against:</p>
                <ul className="list-disc list-outside ml-6 space-y-1">
                  <li>Unauthorised or unlawful access, disclosure, alteration, and destruction.</li>
                  <li>Accidental loss, damage, or impairment.</li>
                  <li>Cyber-attacks, hacking, malware, and other security threats.</li>
                </ul>
                <p>These measures include (but are not limited to):</p>
                <ul className="list-disc list-outside ml-6 space-y-1">
                  <li>Encryption of data in transit and at rest.</li>
                  <li>Secure authentication (passwords, multi-factor authentication).</li>
                  <li>Periodic review of security practices.</li>
                  <li>Network firewalls, intrusion detection, and logging.</li>
                  <li>Access controls and least-privilege principles.</li>
                  <li>Ongoing data protection awareness by the controller.</li>
                  <li>Incident response and breach-notification procedures.</li>
                </ul>
                <p>Measures are aligned with the <strong>Swiss Data Protection Authority (FDPIC)</strong> guidelines and <strong>revFADP Article 8</strong> requirements.</p>

                <h3 className="font-semibold text-[var(--text-primary)]">6.2 Limitation of liability for data breaches and cyber incidents</h3>
                <p><strong>You acknowledge that:</strong></p>
                <ul className="list-[lower-alpha] list-outside ml-6 space-y-2">
                  <li><strong>No system is 100% secure.</strong> Despite the Agency&apos;s reasonable precautions, cyber-attacks, hacking, malware, ransomware, denial-of-service attacks, social engineering, insider threats, and other malicious acts <strong>may occur</strong> and could result in: unauthorised access to or disclosure of your personal data; corruption, alteration, or loss of your data; temporary or prolonged unavailability of the platform.</li>
                  <li>
                    To the <strong>fullest extent permitted by mandatory Swiss law</strong>, you agree that:
                    <ul className="list-disc list-outside ml-6 mt-2 space-y-1">
                      <li>The Agency is <strong>not liable</strong> for any <strong>indirect, incidental, consequential, special, or punitive damages</strong> arising from a data breach, cyber-attack, or other security incident, even if such incident is caused by the Agency&apos;s <strong>ordinary negligence</strong>, provided such negligence does not constitute <strong>gross negligence or wilful misconduct</strong> under Swiss law (which cannot be excluded).</li>
                      <li>The Agency&apos;s <strong>liability for direct damages</strong> caused by a data breach or security incident is <strong>limited</strong> to your actual, quantifiable losses directly and causally linked to the incident, <strong>capped at {COMPANY.liabilityCap}</strong> (or such higher limit as is mandatory under Swiss law).</li>
                    </ul>
                  </li>
                  <li>
                    <strong>Your sole and exclusive remedy</strong> in case of a data breach, cyber-attack, or security incident is:
                    <ul className="list-disc list-outside ml-6 mt-2 space-y-1">
                      <li><strong>Compensation for proven, quantifiable damages</strong> (within the cap above).</li>
                      <li><strong>Rights granted under revFADP</strong>, including the right to information, correction, deletion, and (if applicable) compensation under Article 51 revFADP for proven material or non-material losses.</li>
                      <li><strong>Lodging a complaint with the Swiss Federal Data Protection and Information Commissioner (FDPIC)</strong> (see Section 8).</li>
                    </ul>
                  </li>
                </ul>

                <h3 className="font-semibold text-[var(--text-primary)]">6.3 Notification of data breaches</h3>
                <p>In the event of a <strong>data security breach</strong> that is <strong>likely to result in a high risk</strong> to your rights and freedoms (as assessed under revFADP Article 24), the Agency will:</p>
                <ul className="list-[lower-alpha] list-outside ml-6 space-y-2">
                  <li>Notify you <strong>as quickly as possible</strong> and <strong>without undue delay</strong>.</li>
                  <li>Provide you with information about: the nature and scope of the breach; the categories and approximate number of data subjects affected; the likely consequences of the breach; measures taken or proposed to remedy the breach and mitigate harm; the Agency&apos;s data-protection contact.</li>
                  <li>Also notify the <strong>Swiss Federal Data Protection and Information Commissioner (FDPIC)</strong> as required by revFADP Article 24 (1).</li>
                  <li><strong>Document the breach</strong> internally, including all facts, consequences, and measures taken (documentation retained for at least 2 years).</li>
                </ul>
                <p>You will not be charged for breach notifications or resulting assistance.</p>

                <h3 className="font-semibold text-[var(--text-primary)]">6.4 Force majeure</h3>
                <p>The Agency is <strong>not liable</strong> for service interruptions, data loss, or unavailability caused by events <strong>beyond its reasonable control</strong>, including:</p>
                <ul className="list-disc list-outside ml-6 space-y-1">
                  <li>Widespread internet outages, power failures, or infrastructure failures.</li>
                  <li>Cyber-attacks on critical national infrastructure or major cloud providers affecting multiple customers.</li>
                  <li>Government measures, war, natural disasters, or acts of God.</li>
                  <li>Strikes, labour disputes, or public emergencies.</li>
                </ul>
                <p>The Agency will use <strong>reasonable efforts</strong> to restore service and minimise impact, but will not be liable for damages resulting from such force-majeure events.</p>
              </div>
            </section>

            {/* Section 7 */}
            <section id="liability">
              <h2 className="text-xl font-bold text-[var(--text-primary)] mb-4">7. Limitation of liability and disclaimer</h2>
              <div className="space-y-4">
                <h3 className="font-semibold text-[var(--text-primary)]">7.1 Disclaimer of warranties</h3>
                <p>The Agency provides the platform on an <strong>&ldquo;as-is&rdquo; and &ldquo;as-available&rdquo; basis</strong>. To the <strong>maximum extent permitted by Swiss law</strong>, the Agency <strong>disclaims all warranties</strong>, whether express, implied, statutory, or otherwise, including:</p>
                <ul className="list-disc list-outside ml-6 space-y-1">
                  <li><strong>Merchantability</strong>: The platform is fit for sale or general commercial use.</li>
                  <li><strong>Fitness for a particular purpose</strong>: The platform is suitable for your specific needs or goals.</li>
                  <li><strong>Non-infringement</strong>: The platform does not infringe third-party rights.</li>
                  <li><strong>Uninterrupted or error-free operation</strong>: The platform will always be available and free from bugs, glitches, or downtime.</li>
                  <li><strong>Accuracy, completeness, or timeliness</strong>: Information displayed on the platform is accurate and current.</li>
                  <li><strong>Security</strong>: Your data is absolutely safe and cannot be breached or compromised.</li>
                </ul>

                <h3 className="font-semibold text-[var(--text-primary)]">7.2 Exclusion of liability</h3>
                <p>To the <strong>maximum extent permitted by Swiss law</strong>, the Agency shall <strong>not be liable</strong> for:</p>
                <ul className="list-[lower-alpha] list-outside ml-6 space-y-2">
                  <li><strong>Loss of data, corruption of data, or data breach</strong>, even if foreseeable or if the Agency was advised of the possibility of such loss.</li>
                  <li><strong>Loss of profits, revenue, business opportunities, business reputation, or anticipated savings</strong>, whether direct or indirect.</li>
                  <li><strong>Loss of time, convenience, or enjoyment</strong>.</li>
                  <li><strong>Consequential, incidental, special, punitive, or exemplary damages</strong>, even if such damages were foreseeable.</li>
                  <li><strong>Third-party claims or actions</strong> arising from your use of the platform.</li>
                  <li><strong>Actions, decisions, or employment consequences resulting from employers&apos; access to your profile or CV</strong>, including: hiring decisions (whether positive or negative); salary or compensation offers; discrimination or unfair treatment by employers; non-hiring or rejection of your application.</li>
                  <li><strong>Loss or damage arising from:</strong> your use or inability to use the platform; your violation of these Terms or applicable law; your infringement of third-party rights; your provision of inaccurate, incomplete, or unlawful information; any act or omission of third parties (including employers, competitors, or cybercriminals).</li>
                  <li><strong>Reliance on content</strong> displayed on the platform, including job descriptions, employer information, salary data, or other user-generated content.</li>
                </ul>

                <h3 className="font-semibold text-[var(--text-primary)]">7.3 Cap on total liability</h3>
                <p>
                  <strong>In no event shall the Agency&apos;s aggregate liability to you</strong> for any and all claims arising out of or related to these Terms, your use of the platform, or your provision of data <strong>exceed {COMPANY.liabilityCap}</strong>, subject to the exception in Section 7.4 below.
                </p>
                <p>This cap applies to all liability theories (contract, tort, warranty, negligence, strict liability, etc.).</p>

                <h3 className="font-semibold text-[var(--text-primary)]">7.4 Exception: Mandatory Swiss law</h3>
                <p>Nothing in Sections 7.1–7.3 excludes or limits liability where such exclusion or limitation is <strong>prohibited by mandatory Swiss law</strong>, including:</p>
                <ul className="list-disc list-outside ml-6 space-y-1">
                  <li><strong>Gross negligence or wilful misconduct</strong> by the Agency (which cannot be excluded or limited).</li>
                  <li><strong>Fundamental breach of material contractual obligations</strong> that deprive you of substantially the entire benefit of the contract.</li>
                  <li><strong>Material violations of revFADP</strong> that result in your provable, quantifiable losses.</li>
                  <li><strong>Consumer protection rights</strong> under Swiss law (if applicable).</li>
                </ul>
                <p>Where Swiss law does not permit the full exclusion of liability, these Terms shall be interpreted to exclude or limit liability <strong>to the maximum extent permitted by law</strong>, and the partial invalidity of any clause shall not affect the validity of the remaining Terms.</p>
              </div>
            </section>

            {/* Section 8 */}
            <section id="rights">
              <h2 className="text-xl font-bold text-[var(--text-primary)] mb-4">8. Your rights under Swiss data-protection law</h2>
              <div className="space-y-4">
                <h3 className="font-semibold text-[var(--text-primary)]">8.1 Rights under revFADP</h3>
                <p>Under the revised <strong>Federal Act on Data Protection (revFADP)</strong>, you have rights including:</p>
                <ul className="list-disc list-outside ml-6 space-y-1">
                  <li>Access to your personal data</li>
                  <li>Correction of inaccurate data</li>
                  <li>Deletion of your data (subject to legal retention requirements)</li>
                  <li>Objection to processing</li>
                  <li>Data portability</li>
                  <li>Withdrawal of consent</li>
                </ul>
                <p className="mt-4">For detailed descriptions of each right and how they apply, see our <Link href="/privacy" className="underline hover:text-[var(--gold)]">Privacy Policy</Link>.</p>

                <h3 className="font-semibold text-[var(--text-primary)]">8.2 How to exercise your rights</h3>
                <p>To exercise any of the above rights, please contact the Agency&apos;s <strong>data-protection team</strong> at:</p>
                <ul className="list-disc list-outside ml-6 space-y-1">
                  <li><strong>Email</strong>: <a href={`mailto:${COMPANY.contacts.privacy}`} className="underline hover:text-[var(--gold)]">{COMPANY.contacts.privacy}</a></li>
                  <li><strong>Mailing address</strong>: {COMPANY.legalName}, {COMPANY.address.street}, {COMPANY.address.postalCode} {COMPANY.address.city}, {COMPANY.address.country}</li>
                  <li><strong>Data Protection Contact</strong>: {COMPANY.owner}</li>
                </ul>
                <p>When you submit a request, please include:</p>
                <ul className="list-disc list-outside ml-6 space-y-1">
                  <li>Your name and email address.</li>
                  <li>The specific right you wish to exercise (e.g. &ldquo;request access to my data&rdquo;).</li>
                  <li>Any relevant details (e.g. a description of the data you seek).</li>
                </ul>
                <p>
                  The Agency will respond to your request <strong>within 30 days</strong> of receipt. If your request is complex, the Agency may request a reasonable extension (up to a further 30 days) and will inform you accordingly.
                </p>
                <p>
                  <strong>Note</strong>: If you cannot agree on whether the Agency&apos;s response is adequate, you have the right to lodge a complaint with the FDPIC (see Section 8.3 below).
                </p>

                <h3 className="font-semibold text-[var(--text-primary)]">8.3 Right to lodge a complaint with the FDPIC</h3>
                <p>If you believe that the Agency has violated your data-protection rights under revFADP, you may lodge a <strong>formal complaint</strong> with the:</p>
                <p className="ml-6">
                  <strong>{FDPIC_CONTACT.name}</strong><br />
                  Address: {FDPIC_CONTACT.address}<br />
                  Website: <a href={FDPIC_CONTACT.website} target="_blank" rel="noopener noreferrer" className="underline hover:text-[var(--gold)]">{FDPIC_CONTACT.website}</a><br />
                  Complaints: <a href={FDPIC_CONTACT.complaints} target="_blank" rel="noopener noreferrer" className="underline hover:text-[var(--gold)]">{FDPIC_CONTACT.complaints}</a>
                </p>
                <p>The FDPIC will investigate your complaint and may issue enforcement decisions or conduct audits. You do <strong>not</strong> need to use the Agency&apos;s dispute-resolution procedures first; you may file a complaint with the FDPIC at any time.</p>
              </div>
            </section>

            {/* Section 9 */}
            <section id="indemnification">
              <h2 className="text-xl font-bold text-[var(--text-primary)] mb-4">9. Candidate responsibilities and indemnification</h2>
              <div className="space-y-4">
                <h3 className="font-semibold text-[var(--text-primary)]">9.1 Your responsibility for content accuracy</h3>
                <p>You are solely responsible for the <strong>accuracy, completeness, and truthfulness</strong> of all information you upload or provide. The Agency does <strong>not</strong>:</p>
                <ul className="list-disc list-outside ml-6 space-y-1">
                  <li>Verify your employment history, qualifications, or certifications.</li>
                  <li>Conduct background checks or criminal record checks (unless explicitly offered as a separate service).</li>
                  <li>Confirm that your CV is up to date or matches information on LinkedIn, other platforms, or elsewhere.</li>
                </ul>
                <p>Employers are responsible for conducting their own due diligence and verification of your credentials.</p>

                <h3 className="font-semibold text-[var(--text-primary)]">9.2 Indemnification</h3>
                <p>You agree to <strong>indemnify, defend, and hold harmless</strong> the Agency, its parent company, affiliates, subsidiaries, officers, directors, employees, agents, and service providers from and against:</p>
                <ul className="list-[lower-alpha] list-outside ml-6 space-y-2">
                  <li>
                    Any <strong>third-party claims, lawsuits, damages, losses, liabilities, costs, and expenses</strong> (including reasonable legal fees) arising out of or related to:
                    <ul className="list-disc list-outside ml-6 mt-2 space-y-1">
                      <li>Your breach of these Terms or the Privacy Policy.</li>
                      <li>Your infringement or violation of any <strong>third-party intellectual-property rights, confidentiality obligations, trade-secret rights, or other proprietary rights</strong>.</li>
                      <li>Your provision of <strong>inaccurate, incomplete, false, misleading, or unlawful information</strong> in your CV or profile.</li>
                      <li>Your breach of any <strong>non-compete, non-solicitation, or non-disclosure agreement</strong> with your current or former employer (by using this platform to seek new employment).</li>
                      <li>Your violation of any <strong>applicable law or regulation</strong> (including labour law, anti-discrimination law, data protection law, etc.).</li>
                      <li>Your upload of <strong>content that violates third-party rights or is unlawful</strong> (e.g. defamatory, harassing, or infringing content).</li>
                    </ul>
                  </li>
                  <li>
                    Claims by <strong>current or former employers</strong> (or other third parties) alleging that:
                    <ul className="list-disc list-outside ml-6 mt-2 space-y-1">
                      <li>Your CV contains confidential information, trade secrets, or proprietary content belonging to them.</li>
                      <li>You are violating a non-compete, non-disclosure, or non-solicitation agreement.</li>
                      <li>You have infringed their intellectual-property rights.</li>
                      <li>You have defamed them or disclosed false information about them.</li>
                    </ul>
                  </li>
                  <li>
                    Any <strong>dispute, injury, or damage</strong> caused by an <strong>employer&apos;s actions or decisions</strong> based on your profile, CV, or information accessed through the platform, including:
                    <ul className="list-disc list-outside ml-6 mt-2 space-y-1">
                      <li>Discrimination or unfair hiring practices by an employer.</li>
                      <li>A dispute or claim arising from an employment negotiation, offer, or contract with an employer sourced through the platform.</li>
                      <li>Reputational harm resulting from an employer&apos;s use of your information.</li>
                    </ul>
                  </li>
                </ul>

                <h3 className="font-semibold text-[var(--text-primary)]">9.3 Defence of claims</h3>
                <p>The Agency reserves the right, at its sole discretion and expense, to:</p>
                <ul className="list-disc list-outside ml-6 space-y-1">
                  <li>Defend, settle, or compromise any third-party claim subject to indemnification.</li>
                  <li>Control all legal proceedings and defence strategy.</li>
                </ul>
                <p>You will cooperate fully with the Agency in the defence of any such claim.</p>
              </div>
            </section>

            {/* Section 10 */}
            <section id="no-employment">
              <h2 className="text-xl font-bold text-[var(--text-primary)] mb-4">10. No employment relationship or recruitment guarantee</h2>
              <div className="space-y-4">
                <h3 className="font-semibold text-[var(--text-primary)]">10.1 Platform is not a job application</h3>
                <p>By uploading your CV to the platform, you are <strong>not</strong> applying for any specific job. Instead, you are:</p>
                <ul className="list-disc list-outside ml-6 space-y-1">
                  <li>Making your professional profile available to a pool of employers.</li>
                  <li>Enabling employers to initiate contact with you if they are interested.</li>
                </ul>

                <h3 className="font-semibold text-[var(--text-primary)]">10.2 No guarantee of job offers or outcomes</h3>
                <p>The Agency <strong>does not guarantee, promise, or warrant</strong> that:</p>
                <ul className="list-[lower-alpha] list-outside ml-6 space-y-2">
                  <li>You will receive any <strong>job interviews, offers, or employment</strong> as a result of using the platform.</li>
                  <li>You will be <strong>matched with any employer</strong> or job opening.</li>
                  <li>Any employer will <strong>view, download, or express interest</strong> in your profile.</li>
                  <li>Any <strong>salary, benefits, or compensation level</strong> offered by an employer.</li>
                  <li>Any <strong>specific employment terms or conditions</strong>.</li>
                  <li><strong>Protection against discrimination, unfair hiring practices, or breach of contract</strong> by employers.</li>
                </ul>
                <p>The Agency is a <strong>platform facilitator</strong>, not a guarantor of employment outcomes. Your ability to secure employment depends on many factors beyond the Agency&apos;s control, including employer decisions, market conditions, your qualifications, and competition from other candidates.</p>

                <h3 className="font-semibold text-[var(--text-primary)]">10.3 No party to employment relationship</h3>
                <p>The Agency is <strong>not a party to any employment relationship</strong> between you and any employer. Once you are hired:</p>
                <ul className="list-[lower-alpha] list-outside ml-6 space-y-2">
                  <li>You enter into a direct <strong>employment contract with the employer</strong>, not the Agency.</li>
                  <li>
                    The employer is responsible for:
                    <ul className="list-disc list-outside ml-6 mt-2 space-y-1">
                      <li>Compliance with Swiss labour law, employment contracts, and regulations.</li>
                      <li>Payment of salary, benefits, and social insurance contributions.</li>
                      <li>Workplace safety, discrimination prevention, and other employment obligations.</li>
                    </ul>
                  </li>
                  <li>
                    The Agency is <strong>not responsible</strong> for:
                    <ul className="list-disc list-outside ml-6 mt-2 space-y-1">
                      <li>Terms of employment (salary, hours, duties, benefits).</li>
                      <li>Workplace disputes, discrimination, or harassment.</li>
                      <li>Breach of employment contract by the employer.</li>
                      <li>Wrongful termination or violation of labour law by the employer.</li>
                    </ul>
                  </li>
                  <li>Any dispute arising from your employment <strong>must be resolved directly with the employer or through Swiss labour courts</strong>, not with the Agency.</li>
                </ul>

                <h3 className="font-semibold text-[var(--text-primary)]">10.4 Services are recruitment services only</h3>
                <p>The Agency provides <strong>recruitment services</strong> (connecting candidates with employers). {COMPANY.legalName} also offers <strong>job coaching and career consulting</strong> services. The Agency does <strong>not</strong> provide:</p>
                <ul className="list-disc list-outside ml-6 space-y-1">
                  <li>Legal advice on employment contracts or labour law.</li>
                  <li>Tax or financial advice.</li>
                  <li>Health or safety certifications.</li>
                </ul>
                <p>If you need such services, you should consult qualified independent professionals (lawyers, accountants, etc.).</p>
              </div>
            </section>

            {/* Section 11 */}
            <section id="external-links">
              <h2 className="text-xl font-bold text-[var(--text-primary)] mb-4">11. Disclaimer for external links and third-party content</h2>
              <div className="space-y-4">
                <h3 className="font-semibold text-[var(--text-primary)]">11.1 Third-party websites and content</h3>
                <p>The platform may contain <strong>links to third-party websites or services</strong> (e.g. employer websites, job boards, social-media profiles). The Agency:</p>
                <ul className="list-[lower-alpha] list-outside ml-6 space-y-2">
                  <li>Does <strong>not control, endorse, or assume responsibility</strong> for the content, accuracy, or legality of any third-party websites or services.</li>
                  <li>Is <strong>not liable</strong> for any damage, loss, or harm resulting from your access to or use of any third-party website or content.</li>
                  <li>Disclaims all warranties regarding third-party content (accuracy, completeness, safety, legality, non-infringement).</li>
                </ul>
                <p>Your access to and use of third-party websites is <strong>entirely at your own risk</strong> and is subject to their own terms and conditions and privacy policies.</p>

                <h3 className="font-semibold text-[var(--text-primary)]">11.2 Employer communications and negotiations</h3>
                <p>The Agency is <strong>not responsible</strong> for any:</p>
                <ul className="list-[lower-alpha] list-outside ml-6 space-y-2">
                  <li><strong>Direct communication</strong> between you and an employer (e.g. email, phone, video interviews).</li>
                  <li><strong>Negotiation, offer, or contract terms</strong> discussed directly between you and an employer.</li>
                  <li><strong>Employment decisions, discrimination, or unfair treatment</strong> by employers.</li>
                  <li><strong>Breach of employment contract, wages, or employment terms</strong> by employers.</li>
                  <li><strong>Disputes arising from employment negotiations or agreements</strong> with employers.</li>
                </ul>
                <p>These are matters <strong>between you and the employer</strong> and must be resolved directly or through Swiss labour courts, not through the Agency.</p>
              </div>
            </section>

            {/* Section 12 */}
            <section id="termination">
              <h2 className="text-xl font-bold text-[var(--text-primary)] mb-4">12. Suspension and termination of account</h2>
              <div className="space-y-4">
                <h3 className="font-semibold text-[var(--text-primary)]">12.1 Right to suspend or terminate</h3>
                <p>The Agency reserves the right to:</p>
                <ul className="list-[lower-alpha] list-outside ml-6 space-y-2">
                  <li>
                    <strong>Suspend or restrict your access</strong> to the platform at any time, with or without notice, if:
                    <ul className="list-disc list-outside ml-6 mt-2 space-y-1">
                      <li>You breach these Terms or the Privacy Policy.</li>
                      <li>You provide false, inaccurate, or misleading information.</li>
                      <li>You violate any applicable law or regulation.</li>
                      <li>Your profile or content violates third-party rights or is unlawful.</li>
                      <li>The Agency reasonably suspects fraud, abuse, or misuse of the platform.</li>
                      <li>There is a legal obligation to do so (e.g. court order, regulatory action).</li>
                    </ul>
                  </li>
                  <li>
                    <strong>Delete your profile and all associated data</strong> permanently, if:
                    <ul className="list-disc list-outside ml-6 mt-2 space-y-1">
                      <li>You request deletion.</li>
                      <li>You remain inactive for {COMPANY.inactivityPeriodMonths} months.</li>
                      <li>You have violated these Terms in a serious or repeated manner.</li>
                      <li>Required by law (e.g. data-protection regulations).</li>
                    </ul>
                  </li>
                </ul>

                <h3 className="font-semibold text-[var(--text-primary)]">12.2 Consequences of termination</h3>
                <p>Upon suspension or termination of your access:</p>
                <ul className="list-[lower-alpha] list-outside ml-6 space-y-2">
                  <li>You lose access to the platform and your profile.</li>
                  <li>Your profile is removed from employer searches.</li>
                  <li>Employers who have already received your full CV or contact details may retain and use that information (the Agency cannot retrieve it after disclosure).</li>
                  <li>The Agency may <strong>delete your personal data</strong> upon termination, except where required by law to retain it (e.g. for {COMPANY.dataRetentionYears} years for tax/invoicing purposes).</li>
                  <li>You may <strong>request a copy of your data</strong> in a portable format before deletion (see Section 8.1(e)).</li>
                </ul>

                <h3 className="font-semibold text-[var(--text-primary)]">12.3 Appeal</h3>
                <p>If you believe your access was suspended or terminated unfairly, you may contact the Agency&apos;s support team:</p>
                <p className="ml-6">
                  <strong>Email</strong>: <a href={`mailto:${COMPANY.contacts.support}`} className="underline hover:text-[var(--gold)]">{COMPANY.contacts.support}</a>
                </p>
                <p>The Agency will review your request within 10 business days and respond with a decision.</p>
              </div>
            </section>

            {/* Section 13 */}
            <section id="ip">
              <h2 className="text-xl font-bold text-[var(--text-primary)] mb-4">13. Intellectual property</h2>
              <div className="space-y-4">
                <h3 className="font-semibold text-[var(--text-primary)]">13.1 Platform IP</h3>
                <p>All content on the platform (including text, graphics, logos, images, software, code, design, layout, and functionality) is <strong>owned or licensed by the Agency</strong> and is protected by:</p>
                <ul className="list-disc list-outside ml-6 space-y-1">
                  <li>Copyright (author&apos;s rights under Swiss law).</li>
                  <li>Trademarks and logos.</li>
                  <li>Patents and trade secrets.</li>
                  <li>Other intellectual-property laws.</li>
                </ul>
                <p>You may <strong>view and use the platform</strong> for personal, non-commercial purposes only.</p>

                <h3 className="font-semibold text-[var(--text-primary)]">13.2 Restrictions</h3>
                <p>You must <strong>not</strong>:</p>
                <ul className="list-[lower-alpha] list-outside ml-6 space-y-2">
                  <li><strong>Reproduce, distribute, modify, or create derivative works</strong> from the platform or its content.</li>
                  <li><strong>Scrape, crawl, or use bots</strong> to extract data from the platform or CV database.</li>
                  <li><strong>Reverse-engineer or decompile</strong> the platform&apos;s software or code.</li>
                  <li><strong>Remove or obscure</strong> copyright, trademark, or other proprietary notices.</li>
                  <li><strong>Rent, lease, or sell</strong> access to the platform or its data.</li>
                </ul>
                <p>Unauthorised use is a violation of intellectual-property law and these Terms, and may result in legal action and damages.</p>

                <h3 className="font-semibold text-[var(--text-primary)]">13.3 Your IP</h3>
                <p>You retain <strong>ownership of your CV, profile information, and uploaded content</strong>. By uploading, you grant the Agency a <strong>non-exclusive, royalty-free, worldwide license</strong> to:</p>
                <ul className="list-disc list-outside ml-6 space-y-1">
                  <li>Store, process, and display your CV and profile.</li>
                  <li>Anonymise and disclose your profile to employers.</li>
                  <li>Use your data for analytics, research, and platform improvement (in anonymised form).</li>
                </ul>
                <p className="mt-2">This license terminates upon deletion of your profile and data, except for anonymised data that no longer identifies you.</p>
              </div>
            </section>

            {/* Section 14 */}
            <section id="disputes">
              <h2 className="text-xl font-bold text-[var(--text-primary)] mb-4">14. Dispute resolution</h2>
              <div className="space-y-4">
                <h3 className="font-semibold text-[var(--text-primary)]">14.1 Informal resolution</h3>
                <p>Before initiating formal legal proceedings, the parties agree to attempt to <strong>resolve disputes informally</strong> by:</p>
                <ul className="list-disc list-outside ml-6 space-y-1">
                  <li>Sending a written explanation of the dispute to the Agency&apos;s support team or legal contact.</li>
                  <li>Engaging in good-faith discussions to reach a mutually acceptable resolution.</li>
                </ul>
                <p>The parties will allow <strong>30 days</strong> for informal resolution before initiating formal proceedings.</p>

                <h3 className="font-semibold text-[var(--text-primary)]">14.2 Governing law</h3>
                <p>These Terms are <strong>governed by and construed in accordance with the laws of Switzerland</strong>, without regard to conflict-of-laws principles. The revFADP, Swiss Code of Obligations, and other Swiss laws apply.</p>

                <h3 className="font-semibold text-[var(--text-primary)]">14.3 Jurisdiction and courts</h3>
                <p><strong>Exclusive jurisdiction</strong> for any disputes arising out of or related to these Terms shall be with the <strong>competent courts</strong> of <strong>{COMPANY.jurisdiction}</strong>, Switzerland, unless:</p>
                <ul className="list-[lower-alpha] list-outside ml-6 space-y-2">
                  <li><strong>Mandatory consumer-protection rules</strong> require a different jurisdiction (e.g. your home-country courts if you are classified as a consumer).</li>
                  <li>You are entitled to bring claims in a court of your habitual residence under Swiss law.</li>
                </ul>

                <h3 className="font-semibold text-[var(--text-primary)]">14.4 Optional ADR (Mediation)</h3>
                <p>The parties may also pursue <strong>alternative dispute resolution (ADR)</strong>, such as:</p>
                <ul className="list-disc list-outside ml-6 space-y-1">
                  <li><strong>Mediation</strong>: A neutral third party facilitates negotiation to reach a settlement.</li>
                  <li><strong>Arbitration</strong>: A private arbitrator resolves the dispute (subject to Swiss arbitration law).</li>
                </ul>
                <p>If either party requests mediation, the other party will cooperate in good faith.</p>
              </div>
            </section>

            {/* Section 15 */}
            <section id="compliance">
              <h2 className="text-xl font-bold text-[var(--text-primary)] mb-4">15. Compliance with law and regulatory obligations</h2>
              <div className="space-y-4">
                <h3 className="font-semibold text-[var(--text-primary)]">15.1 Legal compliance</h3>
                <p>You agree to use the platform only for <strong>lawful purposes</strong> and in compliance with:</p>
                <ul className="list-[lower-alpha] list-outside ml-6 space-y-2">
                  <li>All <strong>Swiss federal and cantonal laws</strong> (labour law, data protection, tax law, competition law, criminal law, etc.).</li>
                  <li>All <strong>applicable laws in other jurisdictions</strong> where you live or work.</li>
                  <li>Any <strong>applicable international or foreign laws</strong> relevant to your use of the platform.</li>
                </ul>

                <h3 className="font-semibold text-[var(--text-primary)]">15.2 Restricted uses</h3>
                <p>You must <strong>not</strong>:</p>
                <ul className="list-[lower-alpha] list-outside ml-6 space-y-2">
                  <li>Use the platform to <strong>facilitate unlawful activities</strong> (e.g. fraud, money laundering, tax evasion, trafficking).</li>
                  <li><strong>Discriminate against others</strong> based on protected characteristics (age, gender, ethnicity, religion, disability, etc.).</li>
                  <li><strong>Harass, threaten, or abuse</strong> other users or the Agency&apos;s staff.</li>
                  <li><strong>Violate intellectual-property rights, confidentiality, or privacy</strong> of third parties.</li>
                  <li><strong>Breach any contract or legal obligation</strong> (e.g. non-compete agreements, employment contracts).</li>
                  <li>Use the platform to engage in <strong>unauthorised wage discrimination analysis or cartel activity</strong> (sharing sensitive salary data to coordinate wages among competing employers).</li>
                </ul>

                <h3 className="font-semibold text-[var(--text-primary)]">15.3 Cooperation with authorities</h3>
                <p>The Agency will <strong>cooperate fully</strong> with:</p>
                <ul className="list-disc list-outside ml-6 space-y-1">
                  <li>Swiss regulatory authorities (FDPIC, State Secretariat for Economic Affairs, cantonal authorities).</li>
                  <li>Law-enforcement agencies (police, prosecutors, courts).</li>
                  <li>Other government bodies with lawful authority.</li>
                </ul>
                <p>The Agency may <strong>disclose your data</strong> to such authorities without notice or consent if required by law or court order.</p>
              </div>
            </section>

            {/* Section 16 */}
            <section id="miscellaneous">
              <h2 className="text-xl font-bold text-[var(--text-primary)] mb-4">16. Miscellaneous provisions</h2>
              <div className="space-y-4">
                <h3 className="font-semibold text-[var(--text-primary)]">16.1 Entire agreement</h3>
                <p>These Terms, together with the <Link href="/privacy" className="underline hover:text-[var(--gold)]">Privacy Policy</Link> and any other documents specifically referenced, constitute the <strong>entire agreement</strong> between you and the Agency regarding your use of the platform. They supersede all prior negotiations, agreements, understandings, and representations, whether written or oral, express or implied.</p>

                <h3 className="font-semibold text-[var(--text-primary)]">16.2 Amendment and waiver</h3>
                <ul className="list-[lower-alpha] list-outside ml-6 space-y-2">
                  <li>The Agency may <strong>update these Terms</strong> at any time by publishing revised Terms on this page. Material changes will be communicated via email or in-platform notice. Continued use of the platform after publication constitutes acceptance of updated Terms.</li>
                  <li>The <strong>failure of the Agency to enforce any provision</strong> of these Terms shall <strong>not be deemed a waiver</strong> of such provision or right. The Agency may enforce any provision at any time, even if it has not enforced it previously.</li>
                  <li>A waiver of one provision or incident does not waive any other provision or future incidents.</li>
                </ul>

                <h3 className="font-semibold text-[var(--text-primary)]">16.3 Severability</h3>
                <p>If any provision of these Terms is found to be <strong>invalid, unenforceable, or prohibited</strong> by Swiss law, that provision shall be:</p>
                <ul className="list-[lower-alpha] list-outside ml-6 space-y-2">
                  <li><strong>Severally severed</strong> (removed) from these Terms.</li>
                  <li><strong>Modified to the minimum extent necessary</strong> to make it enforceable while preserving the intent.</li>
                </ul>
                <p>The <strong>remaining provisions</strong> shall remain in <strong>full force and effect</strong>. If the modification materially affects the balance of rights and obligations, the parties may renegotiate in good faith.</p>

                <h3 className="font-semibold text-[var(--text-primary)]">16.4 Headings and interpretation</h3>
                <ul className="list-[lower-alpha] list-outside ml-6 space-y-2">
                  <li>Section headings are <strong>for convenience only</strong> and do not affect the interpretation or legal effect of the Terms.</li>
                  <li>The use of &ldquo;<strong>including</strong>&rdquo; means &ldquo;<strong>including without limitation</strong>&rdquo;; examples are illustrative and non-exhaustive.</li>
                  <li>The use of &ldquo;<strong>may</strong>&rdquo; denotes <strong>discretion</strong> (optional); &ldquo;<strong>shall</strong>&rdquo; and &ldquo;<strong>must</strong>&rdquo; denote <strong>obligation</strong> (mandatory).</li>
                </ul>

                <h3 className="font-semibold text-[var(--text-primary)]">16.5 Assignment and delegation</h3>
                <ul className="list-[lower-alpha] list-outside ml-6 space-y-2">
                  <li>The Agency may <strong>assign these Terms</strong> (or any rights/obligations) to a successor company, subsidiary, or buyer of its business, with notice to you.</li>
                  <li>You may <strong>not assign these Terms</strong> without the Agency&apos;s prior written consent. Any unauthorised assignment is void.</li>
                </ul>

                <h3 className="font-semibold text-[var(--text-primary)]">16.6 Third-party beneficiaries</h3>
                <p>These Terms are intended solely for the benefit of you and the Agency. No third party (including employers, processors, or other individuals) has any rights or claims under these Terms.</p>

                <h3 className="font-semibold text-[var(--text-primary)]">16.7 Survival</h3>
                <p>Provisions that, by their nature, should survive termination of these Terms (including Sections 6, 7, 8, 9, 11, 13, 14, and 15) shall survive the termination or expiry of your access.</p>
              </div>
            </section>

            {/* Section 17 */}
            <section id="contact">
              <h2 className="text-xl font-bold text-[var(--text-primary)] mb-4">17. Contact and support</h2>
              <div className="space-y-4">
                <h3 className="font-semibold text-[var(--text-primary)]">17.1 Customer support</h3>
                <p>For questions, complaints, or technical support, please contact:</p>
                <ul className="list-disc list-outside ml-6 space-y-1">
                  <li><strong>Email</strong>: <a href={`mailto:${COMPANY.contacts.support}`} className="underline hover:text-[var(--gold)]">{COMPANY.contacts.support}</a></li>
                  <li><strong>Mailing address</strong>: {COMPANY.legalName}, {COMPANY.address.street}, {COMPANY.address.postalCode} {COMPANY.address.city}, {COMPANY.address.country}</li>
                </ul>
                <p>The Agency will respond to support requests within 2–3 business days.</p>

                <h3 className="font-semibold text-[var(--text-primary)]">17.2 Data protection contact</h3>
                <p>For questions, complaints, or requests related to your personal data (access, correction, deletion, complaints), please contact:</p>
                <ul className="list-disc list-outside ml-6 space-y-1">
                  <li><strong>Email</strong>: <a href={`mailto:${COMPANY.contacts.privacy}`} className="underline hover:text-[var(--gold)]">{COMPANY.contacts.privacy}</a></li>
                  <li><strong>Data Protection Contact</strong>: {COMPANY.owner}</li>
                </ul>
                <p>Requests under Section 8 will be responded to within <strong>30 days</strong> as required by revFADP.</p>

                <h3 className="font-semibold text-[var(--text-primary)]">17.3 Legal contact</h3>
                <p>For legal notices, contractual disputes, or formal complaints:</p>
                <ul className="list-disc list-outside ml-6 space-y-1">
                  <li><strong>Email</strong>: <a href={`mailto:${COMPANY.contacts.legal}`} className="underline hover:text-[var(--gold)]">{COMPANY.contacts.legal}</a></li>
                  <li><strong>Mailing address</strong>: {COMPANY.legalName}, Legal Department, {COMPANY.address.street}, {COMPANY.address.postalCode} {COMPANY.address.city}, {COMPANY.address.country}</li>
                </ul>
              </div>
            </section>

            {/* Section 18 */}
            <section id="acknowledgement">
              <h2 className="text-xl font-bold text-[var(--text-primary)] mb-4">18. Acknowledgement and acceptance</h2>
              <div className="space-y-4">
                <p><strong>By uploading your CV, submitting a profile form, or accessing the platform, you confirm that:</strong></p>
                <ol className="list-decimal list-outside ml-6 space-y-2">
                  <li>You have <strong>read these Terms in full</strong> and understand them.</li>
                  <li>You <strong>accept all provisions</strong>, including the limitations of liability, data processing, and dispute-resolution clauses.</li>
                  <li>You are <strong>legally able to enter into this contract</strong> (you are of legal age and have capacity under Swiss law).</li>
                  <li>You <strong>agree to be bound</strong> by these Terms and the Privacy Policy.</li>
                  <li>You have reviewed the <Link href="/privacy" className="underline hover:text-[var(--gold)]">Privacy Policy</Link> separately and understand how your personal data is processed.</li>
                  <li>You understand the <strong>risks of residual identifiability</strong> in a niche market and accept those risks.</li>
                  <li>You understand the <strong>limitation of liability</strong> and that the Agency is not responsible for employment outcomes, employer decisions, or cyber-attacks.</li>
                </ol>
                <p className="font-semibold text-[var(--text-primary)]">If you do not agree with these Terms, you must not use the platform.</p>
              </div>
            </section>

            {/* Footer */}
            <div className="mt-12 pt-8 border-t border-[var(--border-subtle)]">
              <p className="text-sm text-[var(--text-tertiary)]">
                <strong>Last updated:</strong> {COMPANY.terms.lastUpdated}<br />
                <strong>Next scheduled review:</strong> {COMPANY.terms.nextReview}<br />
                <strong>Contact:</strong> <a href={`mailto:${COMPANY.contacts.legal}`} className="underline hover:text-[var(--gold)]">{COMPANY.contacts.legal}</a>
              </p>
              <div className="mt-4 text-xs text-[var(--text-tertiary)]">
                <p className="font-semibold mb-1">Version History</p>
                <ul className="space-y-1">
                  <li>Version 1.0 &mdash; 25 January 2026: Initial publication.</li>
                  <li>Version 1.1 &mdash; 29 January 2026: Restructured legal bases (Art. 6 revFADP); added age restriction; added AI regulation monitoring statement; updated review schedule to quarterly.</li>
                </ul>
              </div>
              <p className="text-xs text-[var(--text-tertiary)] mt-4 italic">
                This Terms and Conditions document has been prepared to align with Swiss data-protection law (revFADP), Swiss employment law (OR Art. 328b, AVG/AVV), and best practices for recruitment platforms.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsPage;
