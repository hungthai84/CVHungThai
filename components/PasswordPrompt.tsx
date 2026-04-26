import React, { useState, useEffect, useRef } from 'react';
import * as Icons from './Icons';

interface PasswordPromptProps {
    onClose: () => void;
    onSuccess: () => void;
}

const PasswordPrompt: React.FC<PasswordPromptProps> = ({ onClose, onSuccess }) => {
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const inputRef = useRef<HTMLInputElement>(null);
    const correctPassword = 'HungTh@i22061984';

    useEffect(() => {
        // Auto-focus the input field when the component mounts
        inputRef.current?.focus();
    }, []);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (password === correctPassword) {
            setError('');
            onSuccess();
        } else {
            setError('Mật khẩu không đúng. Vui lòng thử lại.');
            setPassword('');
            inputRef.current?.focus();
            // Optional: add a shake animation on error
            const form = e.currentTarget as HTMLFormElement;
            form.classList.add('shake');
            setTimeout(() => form.classList.remove('shake'), 500);
        }
    };

    return (
        <div className="permission-notice-overlay" onClick={onClose}>
            <div className="permission-notice-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '400px' }}>
                <div className="permission-notice-icon">
                    <Icons.ShieldCheckIcon />
                </div>
                <h4>Yêu cầu xác thực</h4>
                <p>Vui lòng nhập mật khẩu để truy cập trang cài đặt.</p>
                
                <form onSubmit={handleSubmit} style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div style={{ position: 'relative' }}>
                        <input
                            ref={inputRef}
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Nhập mật khẩu"
                            style={{
                                width: '100%',
                                padding: '0.75rem 1rem',
                                borderRadius: '15px',
                                border: `var(--color-brand-glass-border)`,
                                backgroundColor: 'var(--sidebar-bg)',
                                color: 'var(--color-brand-text-primary)',
                                fontSize: '1rem',
                                boxSizing: 'border-box',
                                transition: 'box-shadow 0.2s',
                            }}
                        />
                    </div>
                    {error && <p style={{ color: '#ef4444', fontSize: '0.875rem', margin: '0', textAlign: 'center' }}>{error}</p>}
                    <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                        Xác nhận
                    </button>
                </form>
                
                <button 
                    onClick={onClose} 
                    className="video-popup-close-btn" 
                    style={{ position: 'absolute', top: '0.5rem', right: '0.5rem', width: '2rem', height: '2rem' }}
                    aria-label="Close"
                >
                    <Icons.XMarkIcon />
                </button>
            </div>
        </div>
    );
};

export default PasswordPrompt;
