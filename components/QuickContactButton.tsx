import React, { useState } from 'react';
import * as Icons from './Icons';
import { useI18n } from '../contexts/i18n';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

const QuickContactButton: React.FC = () => {
    const { language } = useI18n();
    const [isOpen, setIsOpen] = useState(false);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitSuccess, setSubmitSuccess] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    // Multilingual texts
    const labels = {
        title: language === 'vi' ? 'Liên Hệ Nhanh' : 'Quick Contact',
        subtitle: language === 'vi' ? 'Gửi tin nhắn trực tiếp đến tôi từ CV này' : 'Send a message directly to me from this CV',
        namePlaceholder: language === 'vi' ? 'Tên của bạn' : 'Your name',
        emailPlaceholder: language === 'vi' ? 'Email của bạn' : 'Your email',
        messagePlaceholder: language === 'vi' ? 'Lời nhắn của bạn...' : 'Your message...',
        sendButton: language === 'vi' ? 'Gửi tin nhắn' : 'Send Message',
        sending: language === 'vi' ? 'Đang gửi...' : 'Sending...',
        successText: language === 'vi' ? 'Gửi tin nhắn thành công! Xin cảm ơn.' : 'Message sent successfully! Thank you.',
        errorText: language === 'vi' ? 'Đã xảy ra lỗi khi gửi. Vui lòng thử lại.' : 'An error occurred. Please try again.',
        closeButton: language === 'vi' ? 'Đóng' : 'Close',
        validationEmail: language === 'vi' ? 'Email không hợp lệ.' : 'Please enter a valid email.',
        validationFields: language === 'vi' ? 'Vui lòng điền đầy đủ thông tin.' : 'Please fill out all fields.'
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMessage('');

        if (!name.trim() || !email.trim() || !message.trim()) {
            setErrorMessage(labels.validationFields);
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            setErrorMessage(labels.validationEmail);
            return;
        }

        setIsSubmitting(true);
        try {
            await addDoc(collection(db, 'messages'), {
                name: name.trim(),
                email: email.trim(),
                message: message.trim(),
                createdAt: serverTimestamp()
            });

            setSubmitSuccess(true);
            setName('');
            setEmail('');
            setMessage('');
            setTimeout(() => {
                setSubmitSuccess(false);
                setIsOpen(false);
            }, 3000);
        } catch (error) {
            console.error('Error submitting message:', error);
            try {
                handleFirestoreError(error, OperationType.CREATE, 'messages');
            } catch (firestoreErr: any) {
                setErrorMessage(labels.errorText + ` (${firestoreErr.message})`);
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <>
            {/* Floating Action Button */}
            <button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-6 right-6 md:bottom-8 md:right-8 z-50 flex h-14 w-14 items-center justify-center rounded-full text-white shadow-xl hover:scale-110 active:scale-95 transition-all duration-300"
                style={{
                    backgroundColor: 'var(--color-brand-orange)',
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.25), 0 0 15px rgba(var(--accent-color-rgb), 0.4)'
                }}
                aria-label={labels.title}
                title={labels.title}
            >
                <Icons.ChatBubbleLeftRightIcon size={26} />
            </button>

            {/* Modal Overlay */}
            {isOpen && (
                <div 
                    className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-fade-in"
                    onClick={() => setIsOpen(false)}
                >
                    <div 
                        className="relative w-full max-w-md overflow-hidden rounded-2xl border p-6 shadow-2xl transition-all duration-300 animate-slide-up"
                        style={{
                            backgroundColor: 'rgba(var(--card-bg-rgb), 0.95)',
                            borderColor: 'var(--card-border)',
                            backdropFilter: 'blur(16px)',
                            color: 'var(--color-brand-text-primary)',
                            boxShadow: 'var(--card-box-shadow)'
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Close button */}
                        <button 
                            onClick={() => setIsOpen(false)}
                            className="absolute top-4 right-4 text-slate-400 hover:text-slate-200 transition-colors"
                            aria-label="Close"
                        >
                            <Icons.XMarkIcon size={20} />
                        </button>

                        <div className="mb-5 flex items-center gap-3">
                            <div 
                                className="flex h-10 w-10 items-center justify-center rounded-xl text-white" 
                                style={{ backgroundColor: 'var(--color-brand-orange)' }}
                            >
                                <Icons.ChatBubbleLeftRightIcon size={20} />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold tracking-tight">{labels.title}</h3>
                                <p className="text-xs text-slate-400 mt-0.5">{labels.subtitle}</p>
                            </div>
                        </div>

                        {submitSuccess ? (
                            <div className="py-8 text-center flex flex-col items-center justify-center animate-fade-in">
                                <div className="h-16 w-16 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mb-4 border border-green-500/20">
                                    <Icons.CheckIcon size={32} />
                                </div>
                                <h4 className="text-base font-semibold text-green-400">{labels.successText}</h4>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-4">
                                {errorMessage && (
                                    <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-xs text-red-400">
                                        {errorMessage}
                                    </div>
                                )}

                                <div>
                                    <label htmlFor="contact_name" className="block text-xs font-medium text-slate-300 mb-1">
                                        {labels.namePlaceholder}
                                    </label>
                                    <input
                                        type="text"
                                        id="contact_name"
                                        className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 transition-all"
                                        style={{
                                            backgroundColor: 'var(--color-brand-progress-bg)',
                                            borderColor: 'rgba(var(--accent-color-rgb), 0.2)',
                                            color: 'var(--color-brand-text-primary)'
                                        }}
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        disabled={isSubmitting}
                                        required
                                    />
                                </div>

                                <div>
                                    <label htmlFor="contact_email" className="block text-xs font-medium text-slate-300 mb-1">
                                        {labels.emailPlaceholder}
                                    </label>
                                    <input
                                        type="email"
                                        id="contact_email"
                                        className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 transition-all"
                                        style={{
                                            backgroundColor: 'var(--color-brand-progress-bg)',
                                            borderColor: 'rgba(var(--accent-color-rgb), 0.2)',
                                            color: 'var(--color-brand-text-primary)'
                                        }}
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        disabled={isSubmitting}
                                        required
                                    />
                                </div>

                                <div>
                                    <label htmlFor="contact_message" className="block text-xs font-medium text-slate-300 mb-1">
                                        {labels.messagePlaceholder}
                                    </label>
                                    <textarea
                                        id="contact_message"
                                        rows={4}
                                        className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 transition-all resize-none"
                                        style={{
                                            backgroundColor: 'var(--color-brand-progress-bg)',
                                            borderColor: 'rgba(var(--accent-color-rgb), 0.2)',
                                            color: 'var(--color-brand-text-primary)'
                                        }}
                                        value={message}
                                        onChange={(e) => setMessage(e.target.value)}
                                        disabled={isSubmitting}
                                        required
                                    ></textarea>
                                </div>

                                <button
                                    type="submit"
                                    className="w-full py-2.5 px-4 rounded-xl text-white font-medium text-sm flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:scale-100"
                                    style={{ backgroundColor: 'var(--color-brand-orange)' }}
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? (
                                        <>
                                            <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                                            {labels.sending}
                                        </>
                                    ) : (
                                        <>
                                            <Icons.PaperAirplaneIcon size={16} />
                                            {labels.sendButton}
                                        </>
                                    )}
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            )}
        </>
    );
};

export default QuickContactButton;
