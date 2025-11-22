Good colors but design adjustments we don't want


import React, { useState, useMemo, useRef } from 'react';
import {
    Search,
    MapPin,
    Briefcase,
    ChevronDown,
    Mail,
    ArrowRight,
    DollarSign,
    Clock,
    Menu,
    X,
    Upload,
    FileText,
    CheckCircle,
    ArrowLeft,
    Linkedin,
    Smartphone,
    MessageSquare,
    Send,
    Filter,
    Zap,
    Shield,
    Users,
    Check,
    Globe
} from 'lucide-react';

// --- GLOBAL STYLES ---
const GlobalStyles = () => (
    <style>{`
    :root {
      /* --- PREMIUM SWISS NAVY PALETTE --- */
      
      /* Backgrounds */
      --bg-root: #0A1628;
      --bg-surface-1: #0D1B2E; /* Cards */
      --bg-surface-2: #162943; /* Inputs/Hovers */
      --bg-surface-3: #1F3A5F; /* Dropdowns */
      
      /* Borders & Dividers */
      --border-subtle: #1F3A5F;
      --border-strong: #2C4A6E;

      /* Typography */
      --text-primary: #F8FAFC;   /* White */
      --text-secondary: #94A3B8; /* Slate 400 */
      --text-tertiary: #64748B;  /* Slate 500 */
      --text-accent: #3B82F6;    /* Brand Blue */

      /* Accents */
      --gold: #D4AF37;
      --gold-dim: rgba(212, 175, 55, 0.15);
      --gold-border: rgba(212, 175, 55, 0.3);
      
      --blue: #3B82F6;
      --blue-dim: rgba(59, 130, 246, 0.15);

      /* Status */
      --error: #EF4444;
    }

    body {
      background-color: var(--bg-root);
      background-image: radial-gradient(circle at 50% 0%, #162943 0%, #0A1628 40%);
      color: var(--text-primary);
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      -webkit-font-smoothing: antialiased;
    }

    /* Scrollbar Polish */
    ::-webkit-scrollbar { width: 6px; }
    ::-webkit-scrollbar-track { background: var(--bg-root); }
    ::-webkit-scrollbar-thumb { background: var(--border-strong); border-radius: 3px; }
    ::-webkit-scrollbar-thumb:hover { background: var(--text-secondary); }

    /* Utility Classes */
    .glass-panel {
      background: var(--bg-surface-1);
      border: 1px solid var(--border-subtle);
      box-shadow: 0 4px 20px rgba(0,0,0,0.2);
    }
    
    .input-base {
      background: var(--bg-surface-2);
      border: 1px solid var(--border-strong);
      color: var(--text-primary);
      transition: all 0.2s ease;
    }
    .input-base:focus {
      border-color: var(--blue);
      box-shadow: 0 0 0 1px var(--blue);
      outline: none;
    }
    
    .btn-gold {
      background: var(--gold);
      color: #0A1628;
      font-weight: 600;
      transition: all 0.2s;
    }
    .btn-gold:hover {
      filter: brightness(1.1);
      transform: translateY(-1px);
    }

    ::selection {
      background: var(--gold-dim);
      color: var(--gold);
    }
  `}</style>
);

// --- MOCK DATA ---
const CANDIDATES = [
    { id: 'SVL-025', role: 'Senior Full Stack Engineer', skills: ['React', 'Node.js', 'TypeScript'], experience: '8 years', seniority: 'Senior', cantons: ['ZH', 'ZG'], salaryMin: 140000, salaryMax: 160000, availability: 'Immediate', entryDate: 'Nov 18, 2025', verified: true },
    { id: 'SVL-024', role: 'Frontend Developer', skills: ['Vue.js', 'Tailwind', 'Figma'], experience: '3 years', seniority: 'Mid-level', cantons: ['GE', 'VD'], salaryMin: 95000, salaryMax: 110000, availability: '1 Month Notice', entryDate: 'Nov 17, 2025', verified: true },
    { id: 'SVL-023', role: 'DevOps Engineer', skills: ['Kubernetes', 'Docker', 'Python'], experience: '5 years', seniority: 'Mid-level', cantons: ['ZH', 'BE'], salaryMin: 120000, salaryMax: 140000, availability: 'Immediate', entryDate: 'Nov 17, 2025', verified: false },
    { id: 'SVL-022', role: 'CTO / VP of Engineering', skills: ['Leadership', 'Strategy', 'Go'], experience: '12+ years', seniority: 'Executive', cantons: ['ZH', 'ZG', 'SZ'], salaryMin: 180000, salaryMax: 250000, availability: '3 Months Notice', entryDate: 'Nov 16, 2025', verified: true },
    { id: 'SVL-021', role: 'Junior Backend Dev', skills: ['Java', 'Spring Boot'], experience: '1 year', seniority: 'Junior', cantons: ['BS', 'BL'], salaryMin: 80000, salaryMax: 95000, availability: 'Immediate', entryDate: 'Nov 15, 2025', verified: false },
    { id: 'SVL-020', role: 'Product Manager', skills: ['Agile', 'Scrum', 'Jira'], experience: '6 years', seniority: 'Senior', cantons: ['ZH'], salaryMin: 130000, salaryMax: 150000, availability: 'Negotiable', entryDate: 'Nov 14, 2025', verified: true }
];

const CANTONS = [
    { code: 'AG', name: 'Aargau' }, { code: 'BS', name: 'Basel-Stadt' }, { code: 'BE', name: 'Bern' },
    { code: 'GE', name: 'Geneva' }, { code: 'LU', name: 'Lucerne' }, { code: 'SG', name: 'St. Gallen' },
    { code: 'VD', name: 'Vaud' }, { code: 'ZG', name: 'Zug' }, { code: 'ZH', name: 'Zürich' }
];

const MAIN_CANTON_CODES = ['ZH', 'GE', 'VD', 'BE', 'BS', 'ZG'];

const SENIORITY_LEVELS = [
    { label: 'Junior (0-2 years)', value: 'Junior' },
    { label: 'Mid-level (3-6 years)', value: 'Mid-level' },
    { label: 'Senior (7+ years)', value: 'Senior' },
    { label: 'Executive / Lead', value: 'Executive' },
];

const NOTICE_PERIOD_OPTIONS = [
    { label: 'Immediate', value: 'immediate' },
    { label: '1 Month', value: '1_month' },
    { label: '2 Months', value: '2_months' },
    { label: '3 Months', value: '3_months' },
    { label: '6 Months', value: '6_months' },
    { label: 'Negotiable', value: 'negotiable' },
];

// --- UI COMPONENTS ---

const Badge = ({ children, variant = 'default' }) => {
    const variants = {
        default: 'bg-[var(--bg-surface-2)] text-[var(--text-secondary)] border-[var(--border-subtle)]',
        gold: 'bg-[var(--gold-dim)] text-[var(--gold)] border-[var(--gold-border)]',
        blue: 'bg-[var(--blue-dim)] text-[var(--blue)] border-[rgba(59,130,246,0.3)]',
    };
    return (
        <span className={`px-2.5 py-0.5 rounded-md text-xs font-medium border ${variants[variant] || variants.default}`}>
            {children}
        </span>
    );
};

const Button = ({ children, variant = 'primary', className = '', onClick, icon: Icon, type = 'button', disabled = false }) => {
    const variants = {
        primary: "btn-gold shadow-lg shadow-[rgba(212,175,55,0.1)]",
        secondary: "bg-[var(--bg-surface-2)] hover:bg-[var(--bg-surface-3)] text-[var(--text-primary)] border border-[var(--border-strong)]",
        outline: "bg-transparent hover:bg-[var(--bg-surface-2)] text-[var(--text-secondary)] border border-[var(--border-subtle)]",
        ghost: "bg-transparent hover:bg-[var(--bg-surface-2)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]",
    };

    return (
        <button type={type} disabled={disabled} onClick={onClick} className={`inline-flex items-center justify-center px-4 py-2 rounded-lg text-sm transition-all duration-200 disabled:opacity-50 ${variants[variant]} ${className}`}>
            {Icon && <Icon className="w-4 h-4 mr-2" />}
            {children}
        </button>
    );
};

const Input = ({ label, id, type = "text", placeholder, required, value, onChange, min, step }) => (
    <div className="space-y-1.5">
        <label htmlFor={id} className="block text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
            {label} {required && <span className="text-[var(--error)]">*</span>}
        </label>
        <input
            type={type}
            id={id}
            value={value}
            onChange={onChange}
            required={required}
            min={min}
            step={step}
            className="input-base block w-full rounded-lg p-3 text-sm placeholder-[var(--text-tertiary)]"
            placeholder={placeholder}
        />
    </div>
);

// --- PAGE LAYOUTS ---

const PageLayout = ({ children, title, subtitle, onBack }) => (
    <div className="max-w-7xl mx-auto animate-in fade-in duration-500">
        {/* Sticky Navigation Bar for Internal Pages */}
        <div className="sticky top-16 z-30 bg-[var(--bg-root)]/95 backdrop-blur-xl border-b border-[var(--border-subtle)] px-4 sm:px-6 lg:px-8 py-4 mb-8">
            <div className="max-w-3xl mx-auto flex items-center justify-between">
                <button
                    onClick={onBack}
                    className="flex items-center text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--gold)] transition-colors"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" /> Back
                </button>
                <span className="text-xs font-bold text-[var(--text-tertiary)] uppercase tracking-widest">Silvia's List</span>
            </div>
        </div>

        {/* Centered Header Content */}
        <div className="px-4 text-center mb-12">
            <h1 className="text-3xl sm:text-5xl font-bold text-[var(--text-primary)] tracking-tight mb-3">{title}</h1>
            {subtitle && <p className="text-lg text-[var(--text-secondary)] max-w-xl mx-auto">{subtitle}</p>}
        </div>

        {/* Main Content Container */}
        <div className="max-w-3xl mx-auto px-4 sm:px-6 pb-20">
            {children}
        </div>
    </div>
);

// --- PAGES ---

const TermsPage = ({ onBack }) => (
    <PageLayout
        title="Terms of Service"
        subtitle="Legal agreements governing our platform."
        onBack={onBack}
    >
        <div className="glass-panel rounded-2xl p-8 md:p-12">
            <div className="space-y-8 text-[var(--text-secondary)] leading-relaxed">
                <section>
                    <h2 className="text-xl font-bold text-[var(--text-primary)] mb-3">1. The Platform</h2>
                    <p>Silvia's List connects top tech talent ("Candidates") with companies ("Employers") in Switzerland.</p>
                </section>
                <section>
                    <h2 className="text-xl font-bold text-[var(--text-primary)] mb-3">2. Privacy</h2>
                    <p>We respect your anonymity. Profiles are hidden until you approve a request.</p>
                </section>
                <div className="pt-8 border-t border-[var(--border-subtle)] text-xs text-[var(--text-tertiary)]">
                    Last updated: Nov 2025
                </div>
            </div>
        </div>
    </PageLayout>
);

const CompaniesPage = ({ onBack, onContactClick }) => (
    <PageLayout
        title="The Modern Way to Hire"
        subtitle="Direct access to Switzerland's top 10% pre-vetted tech talent."
        onBack={onBack}
    >
        <div className="grid grid-cols-1 gap-6 mb-12">
            {[
                { icon: Zap, title: "Speed", desc: "First interviews in < 48 hours." },
                { icon: Shield, title: "Vetted", desc: "We screen every single profile." },
                { icon: Users, title: "Direct", desc: "No agencies. Direct contact." }
            ].map((feature, i) => (
                <div key={i} className="glass-panel p-6 rounded-xl flex items-start gap-4">
                    <div className="p-3 bg-[var(--bg-surface-2)] rounded-lg text-[var(--gold)]">
                        <feature.icon className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="font-bold text-[var(--text-primary)] mb-1">{feature.title}</h3>
                        <p className="text-sm text-[var(--text-secondary)]">{feature.desc}</p>
                    </div>
                </div>
            ))}
        </div>
        <div className="text-center">
            <Button variant="primary" size="lg" className="w-full sm:w-auto px-8 py-3 text-base" onClick={onContactClick}>
                Start Hiring Now
            </Button>
        </div>
    </PageLayout>
);

const ContactPage = ({ onBack }) => {
    const [submitted, setSubmitted] = useState(false);

    if (submitted) return (
        <PageLayout title="Message Sent" onBack={onBack}>
            <div className="text-center glass-panel p-12 rounded-2xl">
                <div className="w-16 h-16 bg-[var(--bg-surface-2)] rounded-full flex items-center justify-center mx-auto mb-6 text-[var(--gold)]">
                    <Check className="w-8 h-8" />
                </div>
                <p className="text-[var(--text-secondary)]">We'll be in touch shortly.</p>
                <Button className="mt-6" onClick={onBack} variant="outline">Back to Home</Button>
            </div>
        </PageLayout>
    );

    return (
        <PageLayout title="Get in Touch" subtitle="Hiring? Joining? Partnership?" onBack={onBack}>
            <div className="glass-panel rounded-2xl overflow-hidden p-8 md:p-10">
                <form onSubmit={(e) => { e.preventDefault(); setSubmitted(true); }} className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <Input label="Name" id="name" required />
                        <Input label="Email" id="email" type="email" required />
                    </div>
                    <div className="space-y-1.5">
                        <label className="block text-xs font-semibold text-[var(--text-secondary)] uppercase">Subject</label>
                        <select className="input-base block w-full rounded-lg p-3 text-sm">
                            <option>General Inquiry</option>
                            <option>Hiring Talent</option>
                            <option>Joining as Talent</option>
                        </select>
                    </div>
                    <div className="space-y-1.5">
                        <label className="block text-xs font-semibold text-[var(--text-secondary)] uppercase">Message</label>
                        <textarea rows={4} className="input-base block w-full rounded-lg p-3 text-sm resize-none" required></textarea>
                    </div>
                    <Button type="submit" variant="primary" icon={Send} className="w-full">Send Message</Button>
                </form>
            </div>
        </PageLayout>
    );
};

const JoinForm = ({ onBack }) => {
    const [step, setStep] = useState(1);
    const [file, setFile] = useState(null);

    // State for range and formatted values
    const [salary, setSalary] = useState({ min: '', max: '' });
    const [location, setLocation] = useState([]);

    const formatMoney = (val) => val ? new Intl.NumberFormat('de-CH').format(val) : '';

    const handleSubmit = (e) => {
        e.preventDefault();
        setTimeout(() => setStep(3), 800);
    };

    if (step === 3) return (
        <PageLayout title="Application Received" onBack={onBack}>
            <div className="text-center glass-panel p-12 rounded-2xl">
                <div className="w-16 h-16 bg-[var(--bg-surface-2)] rounded-full flex items-center justify-center mx-auto mb-6 text-[var(--gold)]">
                    <CheckCircle className="w-8 h-8" />
                </div>
                <p className="text-[var(--text-secondary)] mb-6">
                    We've received your profile. Our team will review your data and match you with top Swiss companies.
                </p>
                <Button onClick={onBack} variant="outline" icon={ArrowLeft}>Back to Candidates</Button>
            </div>
        </PageLayout>
    );

    return (
        <PageLayout title="Join Silvia's List" subtitle="Create your profile. Connect with top opportunities." onBack={onBack}>
            <form onSubmit={handleSubmit} className="glass-panel rounded-2xl p-8 space-y-8">

                {/* 1. CV Upload */}
                <section>
                    <h3 className="text-lg font-bold text-[var(--text-primary)] mb-4 flex items-center gap-2">
                        <span className="w-6 h-6 rounded bg-[var(--gold)] text-[#0A1628] text-xs flex items-center justify-center">1</span>
                        Upload CV
                    </h3>
                    <div
                        className={`border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer
              ${file ? 'border-[var(--gold)] bg-[var(--bg-surface-2)]' : 'border-[var(--border-strong)] hover:border-[var(--text-secondary)] hover:bg-[var(--bg-surface-2)]'}`}
                        onClick={() => !file && setFile({ name: 'cv.pdf', size: 1024 * 1024 })} // Mock upload
                    >
                        {file ? (
                            <div className="flex items-center justify-center gap-3">
                                <FileText className="w-5 h-5 text-[var(--gold)]" />
                                <span className="text-sm text-[var(--text-primary)]">{file.name}</span>
                                <button onClick={(e) => { e.stopPropagation(); setFile(null); }} className="text-xs text-[var(--error)] hover:underline ml-2">Remove</button>
                            </div>
                        ) : (
                            <>
                                <Upload className="w-8 h-8 text-[var(--text-tertiary)] mx-auto mb-3" />
                                <p className="text-sm text-[var(--text-secondary)]">Click to upload PDF or DOCX</p>
                            </>
                        )}
                    </div>
                </section>

                <div className="h-px bg-[var(--border-subtle)]" />

                {/* 2. Personal Details */}
                <section className="space-y-6">
                    <h3 className="text-lg font-bold text-[var(--text-primary)] mb-4 flex items-center gap-2">
                        <span className="w-6 h-6 rounded bg-[var(--gold)] text-[#0A1628] text-xs flex items-center justify-center">2</span>
                        Personal Details
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                        <Input label="First Name" id="fname" required />
                        <Input label="Last Name" id="lname" required />
                    </div>
                    <Input label="Email" id="email" type="email" required />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="block text-xs font-semibold text-[var(--text-secondary)] uppercase">LinkedIn *</label>
                            <div className="relative">
                                <Linkedin className="absolute left-3 top-3 w-4 h-4 text-[var(--text-tertiary)]" />
                                <input type="url" required className="input-base block w-full rounded-lg p-3 pl-10 text-sm" placeholder="linkedin.com/in/..." />
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <label className="block text-xs font-semibold text-[var(--text-secondary)] uppercase">Phone *</label>
                            <div className="grid grid-cols-3 gap-2">
                                <select className="input-base rounded-lg px-2 text-sm col-span-1"><option>+41</option><option>+49</option></select>
                                <input type="tel" required className="input-base rounded-lg p-3 text-sm col-span-2" placeholder="79 000 00 00" />
                            </div>
                        </div>
                    </div>
                </section>

                <div className="h-px bg-[var(--border-subtle)]" />

                {/* 3. Job Profile */}
                <section className="space-y-6">
                    <h3 className="text-lg font-bold text-[var(--text-primary)] mb-4 flex items-center gap-2">
                        <span className="w-6 h-6 rounded bg-[var(--gold)] text-[#0A1628] text-xs flex items-center justify-center">3</span>
                        Job Profile
                    </h3>
                    <Input label="Current Role" id="role" placeholder="e.g. Senior Frontend Engineer" required />
                    <Input label="Years of Experience" id="exp" type="number" placeholder="e.g. 5" min="0" required />
                </section>

                <div className="h-px bg-[var(--border-subtle)]" />

                {/* 4. Preferences */}
                <section className="space-y-6">
                    <h3 className="text-lg font-bold text-[var(--text-primary)] mb-4 flex items-center gap-2">
                        <span className="w-6 h-6 rounded bg-[var(--gold)] text-[#0A1628] text-xs flex items-center justify-center">4</span>
                        Preferences
                    </h3>

                    <div className="space-y-1.5">
                        <label className="block text-xs font-semibold text-[var(--text-secondary)] uppercase">Notice Period *</label>
                        <select className="input-base block w-full rounded-lg p-3 text-sm" required>
                            <option value="">Select...</option>
                            {NOTICE_PERIOD_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                        </select>
                    </div>

                    <div className="space-y-1.5">
                        <label className="block text-xs font-semibold text-[var(--text-secondary)] uppercase">Salary Expectation (CHF) *</label>
                        <div className="grid grid-cols-2 gap-4">
                            <input
                                type="number"
                                placeholder="Min (e.g. 120000)"
                                className="input-base rounded-lg p-3 text-sm"
                                onChange={e => setSalary({ ...salary, min: e.target.value })}
                            />
                            <input
                                type="number"
                                placeholder="Max (e.g. 160000)"
                                className="input-base rounded-lg p-3 text-sm"
                                onChange={e => setSalary({ ...salary, max: e.target.value })}
                            />
                        </div>
                        {salary.min && salary.max && (
                            <p className="text-xs text-[var(--gold)] mt-1">
                                Target: {formatMoney(salary.min)} – {formatMoney(salary.max)} CHF
                            </p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <label className="block text-xs font-semibold text-[var(--text-secondary)] uppercase">Preferred Cantons (Max 5)</label>
                        <div className="flex flex-wrap gap-2">
                            {CANTONS.map(c => (
                                <button
                                    key={c.code}
                                    type="button"
                                    onClick={() => setLocation(prev => prev.includes(c.code) ? prev.filter(code => code !== c.code) : prev.length < 5 ? [...prev, c.code] : prev)}
                                    className={`px-3 py-1.5 text-xs font-medium rounded border transition-all
                      ${location.includes(c.code)
                                            ? 'bg-[var(--blue)] border-[var(--blue)] text-white'
                                            : 'bg-[var(--bg-surface-2)] border-[var(--border-strong)] text-[var(--text-secondary)] hover:border-[var(--blue)]'}
                    `}
                                >
                                    {c.name}
                                </button>
                            ))}
                        </div>
                        {location.length > 0 && <p className="text-xs text-[var(--text-tertiary)]">{location.length}/5 selected</p>}
                    </div>
                </section>

                <div className="pt-4">
                    <Button type="submit" variant="primary" className="w-full py-3 text-base" disabled={!file}>Submit Application</Button>
                </div>

            </form>
        </PageLayout>
    );
};

// --- MAIN APP ---

export default function App() {
    const [view, setView] = useState('candidates');
    const [filtersOpen, setFiltersOpen] = useState(false);

    // Filters State
    const [search, setSearch] = useState('');
    const [cantons, setCantons] = useState([]);
    const [seniority, setSeniority] = useState([]);
    const [salary, setSalary] = useState([0, 300000]);

    // Modal
    const [modalId, setModalId] = useState(null);

    // Filter Logic
    const filtered = useMemo(() => CANDIDATES.filter(c => {
        const matchSearch = c.role.toLowerCase().includes(search.toLowerCase()) || c.skills.some(s => s.toLowerCase().includes(search.toLowerCase()));
        const matchCanton = cantons.length === 0 || c.cantons.some(code => cantons.includes(code));
        const matchLevel = seniority.length === 0 || seniority.includes(c.seniority);
        const matchSalary = c.salaryMin >= salary[0];
        return matchSearch && matchCanton && matchLevel && matchSalary;
    }), [search, cantons, seniority, salary]);

    // Determine displayed cantons for sidebar
    const sidebarCantons = useMemo(() => {
        const allCodes = new Set([...MAIN_CANTON_CODES, ...cantons]);
        return CANTONS.filter(c => allCodes.has(c.code));
    }, [cantons]);

    const formatMoney = (val) => new Intl.NumberFormat('de-CH', { style: 'currency', currency: 'CHF', maximumSignificantDigits: 3 }).format(val);

    return (
        <div className="min-h-screen font-sans">
            <GlobalStyles />

            {/* NAVBAR */}
            <nav className="sticky top-0 z-50 bg-[var(--bg-root)]/90 backdrop-blur-md border-b border-[var(--border-subtle)]">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex justify-between items-center">
                    <div className="flex items-center gap-3 cursor-pointer" onClick={() => setView('candidates')}>
                        <div className="w-8 h-8 bg-[var(--gold)] rounded flex items-center justify-center text-[#0A1628] font-bold font-serif">S</div>
                        <span className="text-lg font-bold tracking-tight text-[var(--text-primary)]">Silvia's <span className="font-light text-[var(--text-tertiary)]">List</span></span>
                    </div>
                    <div className="hidden md:flex items-center gap-8">
                        <button onClick={() => setView('companies')} className="text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">For Companies</button>
                        <button onClick={() => setView('join')} className="text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">For Talent</button>
                        <div className="h-4 w-px bg-[var(--border-strong)]"></div>
                        <Button variant="primary" icon={ArrowRight} onClick={() => setView('join')}>Join the List</Button>
                    </div>
                    <button className="md:hidden p-2 text-[var(--text-secondary)]" onClick={() => setFiltersOpen(!filtersOpen)}><Menu className="w-6 h-6" /></button>
                </div>
            </nav>

            {/* CONTENT */}
            {view !== 'candidates' ? (
                <div className="pt-8">
                    {view === 'join' && <JoinForm onBack={() => setView('candidates')} onTermsClick={() => setView('terms')} />}
                    {view === 'terms' && <TermsPage onBack={() => setView('candidates')} />}
                    {view === 'contact' && <ContactPage onBack={() => setView('candidates')} />}
                    {view === 'companies' && <CompaniesPage onBack={() => setView('candidates')} onContactClick={() => setView('contact')} />}
                </div>
            ) : (
                <>
                    {/* HERO */}
                    <div className="bg-[var(--bg-root)] border-b border-[var(--border-subtle)] px-4 py-20 text-center relative overflow-hidden">
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-4xl pointer-events-none">
                            <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-[var(--gold)] opacity-5 blur-[100px] rounded-full"></div>
                            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[var(--blue)] opacity-5 blur-[120px] rounded-full"></div>
                        </div>
                        <div className="relative z-10 max-w-3xl mx-auto">
                            <div className="inline-block mb-6">
                                <Badge variant="gold">Switzerland's #1 Tech Talent Pool</Badge>
                            </div>
                            <h1 className="text-5xl sm:text-6xl font-bold text-[var(--text-primary)] tracking-tight mb-6 leading-tight">
                                Discover exceptional <br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--text-primary)] to-[var(--text-secondary)]">Swiss tech talent</span>.
                            </h1>
                            <p className="text-xl text-[var(--text-secondary)] font-light leading-relaxed">
                                Browse pre-screened professionals in Zurich, Geneva, and beyond. <br className="hidden sm:block" />
                                Skip the recruiters and connect directly.
                            </p>
                        </div>
                    </div>

                    {/* MAIN GRID */}
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex flex-col lg:flex-row gap-10">
                        {/* SIDEBAR */}
                        <aside className="w-full lg:w-72 flex-shrink-0">
                            <div className="lg:hidden mb-6">
                                <button onClick={() => setFiltersOpen(!filtersOpen)} className="w-full flex items-center justify-between px-4 py-3 bg-[var(--bg-surface-2)] border border-[var(--border-strong)] rounded-lg text-sm text-[var(--text-primary)]">
                                    <span className="flex items-center gap-2"><Filter className="w-4 h-4" /> Filters</span>
                                    <ChevronDown className={`w-4 h-4 transition-transform ${filtersOpen ? 'rotate-180' : ''}`} />
                                </button>
                            </div>

                            <div className={`${filtersOpen ? 'block' : 'hidden'} lg:block space-y-8`}>
                                {/* SEARCH - No spacer needed, aligned by layout structure */}
                                <div className="relative">
                                    <Search className="w-4 h-4 text-[var(--text-tertiary)] absolute left-3 top-3" />
                                    <input
                                        type="text"
                                        placeholder="Search skills, roles..."
                                        className="input-base block w-full rounded-lg py-2.5 pl-10 text-sm"
                                        value={search}
                                        onChange={e => setSearch(e.target.value)}
                                    />
                                </div>

                                {/* Seniority */}
                                <div>
                                    <h3 className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider mb-3 flex items-center gap-2"><Briefcase className="w-3 h-3" /> Seniority</h3>
                                    <div className="space-y-2">
                                        {SENIORITY_LEVELS.map(level => (
                                            <label key={level.value} className="flex items-center gap-3 cursor-pointer group">
                                                <input type="checkbox" className="w-4 h-4 rounded border-[var(--border-strong)] bg-[var(--bg-surface-2)] text-[var(--blue)] focus:ring-[var(--blue)]"
                                                    checked={seniority.includes(level.value)}
                                                    onChange={() => setSeniority(p => p.includes(level.value) ? p.filter(s => s !== level.value) : [...p, level.value])}
                                                />
                                                <span className="text-sm text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] transition-colors">{level.label}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                {/* Cantons */}
                                <div>
                                    <h3 className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider mb-3 flex items-center gap-2"><MapPin className="w-3 h-3" /> Location</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {sidebarCantons.map(c => (
                                            <button key={c.code} onClick={() => setCantons(p => p.includes(c.code) ? p.filter(x => x !== c.code) : [...p, c.code])}
                                                className={`px-3 py-1 text-xs font-medium rounded border transition-all ${cantons.includes(c.code) ? 'bg-[var(--blue)] border-[var(--blue)] text-white' : 'bg-[var(--bg-surface-2)] border-[var(--border-strong)] text-[var(--text-secondary)] hover:border-[var(--blue)]'}`}>
                                                {c.name}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Salary */}
                                <div>
                                    <h3 className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider mb-3 flex items-center gap-2"><DollarSign className="w-3 h-3" /> Salary (Min)</h3>
                                    <input type="range" min="50000" max="250000" step="10000" className="w-full accent-[var(--blue)] h-1 bg-[var(--bg-surface-3)] rounded-lg appearance-none cursor-pointer"
                                        onChange={e => setSalary([parseInt(e.target.value), 300000])} />
                                    <div className="flex justify-between mt-2 text-xs text-[var(--text-tertiary)] font-mono">
                                        <span>{salary[0] > 0 ? formatMoney(salary[0]) : 'Any'}</span>
                                        <span>+</span>
                                    </div>
                                </div>
                            </div>
                        </aside>

                        {/* RESULTS */}
                        <main className="flex-1">
                            <div className="flex justify-between items-baseline mb-6 pb-4 border-b border-[var(--border-subtle)]">
                                <h2 className="text-xl font-bold text-[var(--text-primary)]">Candidates</h2>
                                <span className="text-sm text-[var(--text-tertiary)]">{filtered.length} results</span>
                            </div>

                            <div className="space-y-4">
                                {filtered.map(c => (
                                    <div key={c.id} className="glass-panel rounded-xl p-6 transition-all hover:border-[var(--gold)] hover:shadow-[0_0_30px_rgba(212,175,55,0.1)] group">
                                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6">
                                            <div className="flex-1">
                                                <div className="flex flex-wrap items-center gap-3 mb-2">
                                                    <span className="font-mono text-[10px] text-[var(--text-tertiary)] border border-[var(--border-strong)] px-1.5 rounded">{c.id}</span>
                                                    <Badge variant="default">{c.seniority}</Badge>
                                                    {c.verified && <Badge variant="gold">Verified</Badge>}
                                                    <span className="text-xs text-[var(--text-tertiary)] flex items-center ml-auto sm:ml-0"><Clock className="w-3 h-3 mr-1" /> {c.entryDate}</span>
                                                </div>
                                                <h3 className="text-xl font-bold text-[var(--text-primary)] mb-1 group-hover:text-[var(--gold)] transition-colors">{c.role}</h3>
                                                <div className="flex flex-wrap gap-4 text-sm text-[var(--text-secondary)] mt-3 mb-4">
                                                    <span className="flex items-center gap-1"><Briefcase className="w-4 h-4 text-[var(--text-tertiary)]" /> {c.experience}</span>
                                                    <span className="flex items-center gap-1"><MapPin className="w-4 h-4 text-[var(--text-tertiary)]" /> {c.cantons.join(', ')}</span>
                                                    <span className="flex items-center gap-1 font-mono"><DollarSign className="w-4 h-4 text-[var(--text-tertiary)]" /> {formatMoney(c.salaryMin)}</span>
                                                </div>
                                                <div className="flex flex-wrap gap-2">
                                                    {c.skills.map(s => (
                                                        <span key={s} className="px-2 py-1 text-xs font-medium text-[var(--text-secondary)] bg-[var(--bg-surface-2)] border border-[var(--border-strong)] rounded">
                                                            {s}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                            <div className="flex flex-col items-end gap-3 min-w-[140px]">
                                                <div className="text-right hidden sm:block">
                                                    <span className="block text-[10px] uppercase tracking-wider text-[var(--text-tertiary)] font-bold">Availability</span>
                                                    <span className="text-sm text-[var(--text-primary)] font-medium">{c.availability}</span>
                                                </div>
                                                <Button variant="primary" className="w-full sm:w-auto" onClick={() => setModalId(c.id)}>Request Intro</Button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {filtered.length === 0 && (
                                    <div className="text-center py-20 border-2 border-dashed border-[var(--border-subtle)] rounded-xl">
                                        <div className="w-12 h-12 bg-[var(--bg-surface-2)] rounded-full flex items-center justify-center mx-auto mb-4 text-[var(--text-tertiary)]">
                                            <Search className="w-6 h-6" />
                                        </div>
                                        <h3 className="text-lg font-medium text-[var(--text-primary)]">No candidates found</h3>
                                        <p className="text-[var(--text-secondary)]">Try adjusting your filters.</p>
                                    </div>
                                )}
                            </div>
                        </main>
                    </div>
                </>
            )}

            {/* MODAL */}
            {modalId && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0A1628]/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-[var(--bg-surface-1)] border border-[var(--border-strong)] rounded-2xl shadow-2xl max-w-md w-full p-8 relative">
                        <button onClick={() => setModalId(null)} className="absolute top-4 right-4 text-[var(--text-tertiary)] hover:text-[var(--text-primary)]"><X className="w-5 h-5" /></button>
                        <div className="text-center mb-6">
                            <div className="w-12 h-12 bg-[var(--bg-surface-2)] rounded-full flex items-center justify-center mx-auto mb-4 border border-[var(--border-strong)] text-[var(--gold)]">
                                <Mail className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-bold text-[var(--text-primary)]">Request Introduction</h3>
                            <p className="text-sm text-[var(--text-secondary)] mt-2">Candidate <span className="font-mono text-[var(--gold)]">{modalId}</span></p>
                        </div>
                        <div className="space-y-4">
                            <div className="bg-[var(--bg-surface-2)] p-4 rounded-lg border border-[var(--border-subtle)] text-center text-sm text-[var(--text-secondary)]">
                                Email us at <strong className="text-[var(--text-primary)] border-b border-[var(--gold)]">silvia@silviaslist.com</strong>
                            </div>
                            <Button variant="primary" className="w-full" onClick={() => { alert('Copied!'); setModalId(null); }}>Copy Email Address</Button>
                            <Button variant="ghost" className="w-full" onClick={() => setModalId(null)}>Cancel</Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
