import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Lock, Shield, ArrowRight } from 'lucide-react';
import { deriveKeyFromPassword } from '../utils/auth';

interface AuthOverlayProps {
    onAuthenticated: (key: CryptoKey) => void;
}

const AuthOverlay: React.FC<AuthOverlayProps> = ({ onAuthenticated }) => {
    const [password, setPassword] = useState('');
    const [isSetup, setIsSetup] = useState(false);
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const storedHash = localStorage.getItem('ENCRYPT_MASTER_HASH');
        setIsSetup(!!storedHash);
    }, []);

    const handleSetup = async () => {
        if (!password || password.length < 8) {
            setError('Password must be at least 8 characters');
            return;
        }
        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        setLoading(true);
        try {
            const key = await deriveKeyFromPassword(password);
            // We store a sentinel value encrypted with the key to verify future logins
            const sentinel = "AUTHENTICATED";
            const encoder = new TextEncoder();
            const iv = window.crypto.getRandomValues(new Uint8Array(12));
            const encrypted = await window.crypto.subtle.encrypt(
                { name: 'AES-GCM', iv },
                key,
                encoder.encode(sentinel)
            );

            const storageData = {
                iv: btoa(String.fromCharCode(...iv)),
                data: btoa(String.fromCharCode(...new Uint8Array(encrypted)))
            };

            localStorage.setItem('ENCRYPT_MASTER_SENTINEL', JSON.stringify(storageData));
            localStorage.setItem('ENCRYPT_MASTER_HASH', 'EXT_SET'); // Just a flag
            onAuthenticated(key);
        } catch (e) {
            setError('Failed to initialize vault');
        } finally {
            setLoading(false);
        }
    };

    const handleLogin = async () => {
        setLoading(true);
        setError('');
        try {
            const key = await deriveKeyFromPassword(password);
            const sentinelData = JSON.parse(localStorage.getItem('ENCRYPT_MASTER_SENTINEL') || '{}');

            const iv = new Uint8Array(atob(sentinelData.iv).split('').map(c => c.charCodeAt(0)));
            const data = new Uint8Array(atob(sentinelData.data).split('').map(c => c.charCodeAt(0)));

            const decoded = await window.crypto.subtle.decrypt(
                { name: 'AES-GCM', iv },
                key,
                data
            );

            const result = new TextDecoder().decode(decoded);
            if (result === "AUTHENTICATED") {
                onAuthenticated(key);
            } else {
                setError('Invalid Master Password');
            }
        } catch (e) {
            setError('Invalid Master Password');
        } finally {
            setLoading(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{
                position: 'fixed',
                inset: 0,
                zIndex: 2000,
                background: 'rgba(0,0,0,0.8)',
                backdropFilter: 'blur(20px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '1rem'
            }}
        >
            <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                className="glass"
                style={{
                    maxWidth: '400px',
                    width: '100%',
                    padding: '2.5rem',
                    borderRadius: '28px',
                    textAlign: 'center'
                }}
            >
                <div style={{
                    width: '60px',
                    height: '60px',
                    borderRadius: '50%',
                    background: 'rgba(0, 113, 227, 0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 1.5rem',
                    color: 'var(--primary)'
                }}>
                    {isSetup ? <Lock size={30} /> : <Shield size={30} />}
                </div>

                <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>
                    {isSetup ? 'Unlock Your Vault' : 'Setup Master Vault'}
                </h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '2rem' }}>
                    {isSetup
                        ? 'Enter your Master Password to access your secrets.'
                        : 'Create a password to locally encrypt your history and links.'}
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <input
                        type="password"
                        placeholder="Master Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        onKeyDown={(e: React.KeyboardEvent) => {
                            if (e.key === 'Enter') {
                                isSetup ? handleLogin() : handleSetup();
                            }
                        }}
                        style={{
                            width: '100%',
                            background: 'rgba(255, 255, 255, 0.05)',
                            border: '1px solid var(--glass-border)',
                            borderRadius: '12px',
                            padding: '0.8rem 1rem',
                            color: 'white',
                            textAlign: 'center',
                            fontSize: '1rem'
                        }}
                    />

                    {!isSetup && (
                        <input
                            type="password"
                            placeholder="Confirm Password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            style={{
                                width: '100%',
                                background: 'rgba(255, 255, 255, 0.05)',
                                border: '1px solid var(--glass-border)',
                                borderRadius: '12px',
                                padding: '0.8rem 1rem',
                                color: 'white',
                                textAlign: 'center',
                                fontSize: '1rem'
                            }}
                        />
                    )}

                    {error && (
                        <p style={{ color: '#ff4d4d', fontSize: '0.8rem', marginTop: '0.2rem' }}>{error}</p>
                    )}

                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => {
                            if (isSetup) handleLogin();
                            else handleSetup();
                        }}
                        disabled={loading}
                        style={{
                            marginTop: '1rem',
                            padding: '1rem',
                            borderRadius: '12px',
                            background: 'var(--primary)',
                            color: 'white',
                            fontWeight: 600,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.5rem',
                            opacity: loading ? 0.7 : 1
                        }}
                    >
                        {loading ? 'Processing...' : (
                            <>
                                {isSetup ? 'Unlock' : 'Create Vault'} <ArrowRight size={18} />
                            </>
                        )}
                    </motion.button>
                </div>

                {!isSetup && (
                    <p style={{ marginTop: '1.5rem', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                        <Shield size={12} style={{ marginRight: '4px', verticalAlign: 'middle' }} />
                        Zero-Knowledge: Your password never leaves this device.
                    </p>
                )}
            </motion.div>
        </motion.div>
    );
};

export default AuthOverlay;
