import React, { useState } from 'react';
import { ArrowLeft, Send, Mail, MessageSquare } from 'lucide-react';
import { Button, Input, TextArea } from './UI.tsx';

interface ContactPageProps {
    onBack: () => void;
}

const ContactPage: React.FC<ContactPageProps> = ({ onBack }) => {
    const [submitted, setSubmitted] = useState(false);
    const [formData, setFormData] = useState({ name: '', email: '', subject: 'General Inquiry', message: '' });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitted(true);
    };

    if (submitted) {
        return (
            <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8 animate-in fade-in duration-500">
                <div className="max-w-2xl mx-auto pt-12 pb-24 px-4 text-center">
                    <div className="w-16 h-16 bg-slate-900 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                        <Send className="w-8 h-8 text-white" />
                    </div>
                    <h2 className="text-3xl font-bold text-slate-900 mb-4">Message Sent</h2>
                    <p className="text-slate-600 mb-8 text-lg">
                        Thank you for reaching out. Our team typically responds within 24 hours.
                    </p>
                    <Button onClick={onBack} icon={ArrowLeft}>Back to Home</Button>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto animate-in slide-in-from-bottom-4 duration-500">
            {/* Page Header - Centered Hero Style */}
            <div className="bg-white border-b border-slate-100 px-4 sm:px-6 lg:px-8 pt-8 pb-12">
                <div className="max-w-3xl mx-auto">
                    {/* Back Button */}
                    <div className="mb-8">
                        <button
                            onClick={onBack}
                            className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors group"
                        >
                            <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                            Back
                        </button>
                    </div>
                    <div className="text-center">
                        <h1 className="mt-6 text-4xl sm:text-5xl font-bold text-slate-900 tracking-tight">Get in Touch</h1>
                        <p className="mt-4 text-lg text-slate-500">Have a question about hiring, joining, or partnership?</p>
                    </div>
                </div>
            </div>

            {/* Main Contact Content - No Shadow Card */}
            <div className="max-w-3xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
                <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden p-8 md:p-10">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                        {/* Contact Info */}
                        <div className="md:col-span-1 space-y-8">
                            <div>
                                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3">Email</h3>
                                <a href="mailto:hello@silviaslist.com" className="text-slate-600 hover:text-slate-900 flex items-center gap-2">
                                    <Mail className="w-4 h-4" /> hello@silviaslist.com
                                </a>
                            </div>

                            <div>
                                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3">Office</h3>
                                <p className="text-slate-600 leading-relaxed text-sm">
                                    Silvia's List AG<br />
                                    Bahnhofstrasse 10<br />
                                    8001 Zürich<br />
                                    Switzerland
                                </p>
                            </div>

                            <div className="p-4 bg-slate-50 rounded-lg border border-slate-100">
                                <h4 className="font-medium text-slate-900 mb-1">For Companies</h4>
                                <p className="text-xs text-slate-500 mb-3">Looking to hire instantly? Skip the queue.</p>
                                <a href="mailto:partners@silviaslist.com" className="text-xs font-bold text-slate-900 hover:underline">Email Sales Team →</a>
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

                                <div>
                                    <label htmlFor="subject" className="block text-sm font-medium text-slate-700 mb-1.5">Subject</label>
                                    <select
                                        id="subject"
                                        className="block w-full rounded-lg border-slate-300 bg-slate-50 border p-2.5 text-sm text-slate-900 shadow-sm focus:border-slate-900 focus:ring-slate-900"
                                        value={formData.subject}
                                        onChange={e => setFormData({ ...formData, subject: e.target.value })}
                                    >
                                        <option>General Inquiry</option>
                                        <option>I'm a Company Hiring</option>
                                        <option>I'm a Candidate</option>
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