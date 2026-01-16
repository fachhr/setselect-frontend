'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Send, Mail, MessageSquare } from 'lucide-react';
import { Button, Input, TextArea } from '@/components/ui';

const ContactPage: React.FC = () => {
    const router = useRouter();
    const [submitted, setSubmitted] = useState(false);
    const [formData, setFormData] = useState({ name: '', email: '', subject: 'General Inquiry', message: '' });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitted(true);
    };

    if (submitted) {
        return (
            <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8 animate-in fade-in duration-500">
                <div className="glass-panel max-w-2xl mx-auto pt-12 pb-24 px-4 text-center rounded-2xl">
                    <div className="w-16 h-16 bg-[var(--gold)] rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                        <Send className="w-8 h-8 text-[var(--bg-root)]" />
                    </div>
                    <h2 className="text-3xl font-bold text-[var(--text-primary)] mb-4">Message Sent</h2>
                    <p className="text-[var(--text-secondary)] mb-8 text-lg">
                        Thank you for reaching out. Our team typically responds within 24 hours.
                    </p>
                    <Button onClick={() => router.push('/')} icon={ArrowLeft}>Back to Home</Button>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto animate-in slide-in-from-bottom-4 duration-500">
            {/* Page Header - Centered Hero Style */}
            <div className="bg-[var(--bg-root)] border-b border-[var(--border-subtle)] relative overflow-hidden">
                {/* Ambient gradient orbs */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-4xl pointer-events-none">
                    <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-[var(--secondary)] opacity-[0.08] blur-[100px] rounded-full"></div>
                    <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[var(--primary)] opacity-[0.06] blur-[120px] rounded-full"></div>
                </div>

                <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-12 relative z-10">
                    {/* Back Button */}
                    <div className="mb-8">
                        <button
                            onClick={() => router.back()}
                            className="inline-flex items-center text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--secondary)] transition-colors group focus:outline-none focus:ring-2 focus:ring-[var(--border-focus)] focus:ring-offset-2 focus:ring-offset-[var(--bg-root)] rounded-md px-1"
                        >
                            <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                            Back
                        </button>
                    </div>
                    <div className="text-center">
                        <h1 className="font-title mt-6 text-4xl sm:text-6xl font-bold text-[var(--text-primary)] tracking-tight">Get in <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--secondary)] to-[var(--highlight)]">Touch</span></h1>
                        <p className="mt-4 text-lg text-[var(--text-secondary)]">Have a question about hiring, joining, or partnership?</p>
                    </div>
                </div>
            </div>

            {/* Main Contact Content - No Shadow Card */}
            <div className="max-w-3xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
                <div className="glass-panel rounded-2xl overflow-hidden p-8 md:p-10">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                        {/* Contact Info */}
                        <div className="md:col-span-1 space-y-8">
                            <div>
                                <h3 className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider mb-3">Email</h3>
                                <a href="mailto:hello@setberry.com" className="text-[var(--text-secondary)] hover:text-[var(--gold)] flex items-center gap-2 transition-colors">
                                    <Mail className="w-4 h-4" /> hello@setberry.com
                                </a>
                            </div>

                            <div>
                                <h3 className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider mb-3">Office</h3>
                                <p className="text-[var(--text-secondary)] leading-relaxed text-sm">
                                    SetSelect<br />
                                    Bahnhofstrasse 10<br />
                                    8001 Zürich<br />
                                    Switzerland
                                </p>
                            </div>

                            <div className="p-4 bg-[var(--bg-surface-2)] rounded-lg border border-[var(--border-subtle)]">
                                <h4 className="font-medium text-[var(--text-primary)] mb-1">For Companies</h4>
                                <p className="text-xs text-[var(--text-tertiary)] mb-3">Looking to hire instantly? Skip the queue.</p>
                                <a href="mailto:hello@setberry.com" className="text-xs font-bold text-[var(--gold)] hover:underline">Email Sales Team →</a>
                            </div>
                        </div>

                        {/* Contact Form */}
                        <div className="md:col-span-2">
                            <form onSubmit={handleSubmit} className="space-y-5">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                    <Input
                                        label="Name" id="contactName" required
                                        value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    />
                                    <Input
                                        label="Email" id="contactEmail" type="email" required
                                        value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })}
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label htmlFor="subject" className="block text-sm font-medium text-[var(--text-secondary)]">Subject</label>
                                    <select
                                        id="subject"
                                        className="input-base block w-full rounded-lg p-3 text-sm"
                                        value={formData.subject}
                                        onChange={e => setFormData({ ...formData, subject: e.target.value })}
                                    >
                                        <option>General Inquiry</option>
                                        <option>I&apos;m a Company Hiring</option>
                                        <option>I&apos;m a Candidate</option>
                                        <option>Partnership</option>
                                    </select>
                                </div>

                                <TextArea
                                    label="Message" id="message" required
                                    placeholder="How can we help you?"
                                    value={formData.message} onChange={e => setFormData({ ...formData, message: e.target.value })}
                                />

                                <Button type="submit" className="w-full" icon={MessageSquare}>
                                    Send Message
                                </Button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ContactPage;
