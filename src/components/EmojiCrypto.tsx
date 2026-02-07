import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Lock, Unlock, Copy, Share2, Trash2, CheckCircle,
    Eye, EyeOff, Ghost, Shield, Zap, Link as LinkIcon, History as HistoryIcon, LogOut
} from 'lucide-react';
import { encrypt, decrypt, calculateSecurityMetrics } from '../utils/cipher';
import { hideInStealth, extractFromStealth, encodeInvisible, decodeInvisible } from '../utils/steganography';
import { toBase64, fromBase64, encryptData, decryptData } from '../utils/auth';
import AuthOverlay from './AuthOverlay';

type Mode = 'emoji' | 'stealth' | 'invisible';

interface HistoryItem { in: string, out: string, mode: Mode }

const EmojiCrypto: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'encrypt' | 'decrypt'>('encrypt');
    const [mode, setMode] = useState<Mode>('emoji');
    const [input, setInput] = useState('');
    const [output, setOutput] = useState('');
    const [key, setKey] = useState('');
    const [showKey, setShowKey] = useState(false);
    const [copied, setCopied] = useState(false);
    const [linkCopied, setLinkCopied] = useState(false);
    const [metrics, setMetrics] = useState<any>(null);
    const [isInitialized, setIsInitialized] = useState(false);

    // Auth & Vault State
    const [masterKey, setMasterKey] = useState<CryptoKey | null>(null);
    const [history, setHistory] = useState<HistoryItem[]>([]);
    const [isLocked, setIsLocked] = useState(true);

    // Initialize from URL
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const urlMode = params.get('m') as Mode;
        const urlData = params.get('d');
        const urlKey = params.get('k');

        if (urlData) {
            setMode(urlMode || 'emoji');
            setActiveTab('decrypt');
            try {
                setInput(fromBase64(urlData));
                if (urlKey) setKey(fromBase64(urlKey));
            } catch (e) {
                console.error("Failed to decode URL link", e);
            }
        }
        setIsInitialized(true);
    }, []);

    // Load History when authenticated
    useEffect(() => {
        if (masterKey) {
            const loadHistory = async () => {
                const stored = localStorage.getItem('ENCRYPT_VAULT_DATA');
                if (stored) {
                    try {
                        const decrypted = await decryptData(stored, masterKey);
                        setHistory(JSON.parse(decrypted));
                    } catch (e) {
                        console.error("Failed to decrypt vault", e);
                    }
                }
            };
            loadHistory();
        }
    }, [masterKey]);

    // Save History when changed
    useEffect(() => {
        if (masterKey && history.length > 0) {
            const saveHistory = async () => {
                const encrypted = await encryptData(JSON.stringify(history), masterKey);
                localStorage.setItem('ENCRYPT_VAULT_DATA', encrypted);
            };
            saveHistory();
        }
    }, [history, masterKey]);

    // Process data based on mode and tab
    useEffect(() => {
        if (!isInitialized) return;
        if (!input) {
            setOutput('');
            setMetrics(null);
            return;
        }

        let res = '';
        if (activeTab === 'encrypt') {
            if (mode === 'emoji') res = encrypt(input, key);
            else if (mode === 'stealth') res = hideInStealth(input);
            else if (mode === 'invisible') res = encodeInvisible(input);

            setMetrics(calculateSecurityMetrics(input, key));
        } else {
            if (mode === 'emoji') res = decrypt(input, key);
            else if (mode === 'stealth') res = extractFromStealth(input);
            else if (mode === 'invisible') res = decodeInvisible(input);
        }
        setOutput(res);
    }, [input, key, activeTab, mode, isInitialized]);

    const handleCopy = () => {
        navigator.clipboard.writeText(output);
        setCopied(true);

        if (output && activeTab === 'encrypt' && masterKey) {
            const newItem: HistoryItem = { in: input, out: output, mode };
            setHistory(prev => [newItem, ...prev].slice(0, 10));
        }

        setTimeout(() => setCopied(false), 2000);
    };

    const handleShareLink = () => {
        const baseUrl = window.location.origin + window.location.pathname;
        const params = new URLSearchParams();
        params.set('m', mode);
        params.set('d', toBase64(output));
        if (key) params.set('k', toBase64(key));

        const shareUrl = `${baseUrl}?${params.toString()}`;
        navigator.clipboard.writeText(shareUrl);
        setLinkCopied(true);
        setTimeout(() => setLinkCopied(false), 2000);
    };

    const handleShare = () => {
        if (navigator.share) {
            navigator.share({ title: 'Secure Message', text: output }).catch(() => { });
        }
    };

    const handleClear = () => {
        setInput('');
        setOutput('');
        window.history.replaceState({}, '', window.location.pathname);
    };

    const handleLock = () => {
        setMasterKey(null);
        setIsLocked(true);
    };

    if (isLocked) {
        return <AuthOverlay onAuthenticated={(k) => { setMasterKey(k); setIsLocked(false); }} />;
    }

    return (
        <div style={{ maxWidth: '1000px', margin: '2rem auto', padding: '0 1rem', display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>

            {/* Main Container */}
            <div className="glass" style={{ flex: '1 1 600px', borderRadius: '24px', overflow: 'hidden', position: 'relative' }}>

                {/* Mode Selector */}
                <div style={{ display: 'flex', background: 'rgba(0,0,0,0.3)', padding: '0.5rem', gap: '0.5rem' }}>
                    {[
                        { id: 'emoji', label: 'Emoji Cipher', icon: <Lock size={14} /> },
                        { id: 'stealth', label: 'Stealth Cover', icon: <Ghost size={14} /> },
                        { id: 'invisible', label: 'Invisible Ink', icon: <Shield size={14} /> }
                    ].map((m) => (
                        <button
                            key={m.id}
                            onClick={() => setMode(m.id as Mode)}
                            style={{
                                flex: 1,
                                padding: '0.6rem',
                                borderRadius: '12px',
                                fontSize: '0.8rem',
                                fontWeight: 600,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '0.4rem',
                                background: mode === m.id ? 'var(--primary)' : 'transparent',
                                color: mode === m.id ? 'white' : 'var(--text-secondary)',
                                transition: 'all 0.2s'
                            }}
                        >
                            {m.icon} {m.label}
                        </button>
                    ))}
                </div>

                {/* Tabs */}
                <div style={{ display: 'flex', borderBottom: '1px solid var(--glass-border)' }}>
                    <button
                        onClick={() => { setActiveTab('encrypt'); handleClear(); }}
                        style={{
                            flex: 1,
                            padding: '1.2rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.5rem',
                            color: activeTab === 'encrypt' ? 'var(--primary)' : 'var(--text-secondary)',
                            background: activeTab === 'encrypt' ? 'rgba(0, 113, 227, 0.05)' : 'transparent',
                            fontWeight: 600
                        }}
                    >
                        <Lock size={18} /> Encrypt
                    </button>
                    <button
                        onClick={() => { setActiveTab('decrypt'); }}
                        style={{
                            flex: 1,
                            padding: '1.2rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.5rem',
                            color: activeTab === 'decrypt' ? 'var(--primary)' : 'var(--text-secondary)',
                            background: activeTab === 'decrypt' ? 'rgba(0, 113, 227, 0.05)' : 'transparent',
                            fontWeight: 600
                        }}
                    >
                        <Unlock size={18} /> Decrypt
                    </button>
                </div>

                {/* Content */}
                <div style={{ padding: '2rem' }}>
                    {/* Key Input */}
                    <div style={{ marginBottom: '1.5rem' }}>
                        <div style={{ position: 'relative' }}>
                            <input
                                type={showKey ? 'text' : 'password'}
                                value={key}
                                onChange={(e) => setKey(e.target.value)}
                                placeholder="Security Key (Optional)"
                                style={{
                                    width: '100%',
                                    background: 'rgba(255, 255, 255, 0.03)',
                                    border: '1px solid var(--glass-border)',
                                    borderRadius: '12px',
                                    padding: '0.75rem 1rem',
                                    color: 'var(--text-primary)',
                                    fontSize: '0.9rem'
                                }}
                            />
                            <button
                                onClick={() => setShowKey(!showKey)}
                                style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }}
                            >
                                {showKey ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>
                    </div>

                    <div style={{ marginBottom: '1.5rem' }}>
                        <textarea
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder={activeTab === 'encrypt' ? 'Type your secret message...' : 'Paste here to decrypt...'}
                            style={{
                                width: '100%',
                                minHeight: '120px',
                                background: 'rgba(255, 255, 255, 0.03)',
                                border: '1px solid var(--glass-border)',
                                borderRadius: '16px',
                                padding: '1rem',
                                color: 'var(--text-primary)',
                                fontSize: '1rem',
                                fontFamily: 'inherit',
                                resize: 'none',
                                outline: 'none'
                            }}
                        />
                    </div>

                    <AnimatePresence>
                        {output && (
                            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} style={{ marginBottom: '1.5rem', overflow: 'hidden' }}>
                                <div style={{
                                    width: '100%',
                                    minHeight: mode === 'invisible' && activeTab === 'encrypt' ? '50px' : '80px',
                                    background: 'rgba(0, 113, 227, 0.05)',
                                    border: '1px solid var(--primary)',
                                    borderRadius: '16px',
                                    padding: '1rem',
                                    color: 'var(--text-primary)',
                                    fontSize: mode === 'invisible' ? '0.8rem' : '1.1rem',
                                    wordBreak: 'break-all'
                                }}>
                                    {mode === 'invisible' && activeTab === 'encrypt' ?
                                        <span style={{ color: 'var(--text-secondary)' }}>(Invisible content encoded below)</span> :
                                        output
                                    }
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <div style={{ display: 'flex', gap: '0.8rem', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                        <button onClick={handleClear} style={{ padding: '0.6rem', color: 'var(--text-secondary)' }}><Trash2 size={18} /></button>
                        {output && (
                            <>
                                <button onClick={handleShare} style={{ padding: '0.6rem', color: 'var(--text-primary)' }} title="Share Web API"><Share2 size={18} /></button>

                                {activeTab === 'encrypt' && (
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={handleShareLink}
                                        style={{
                                            padding: '0.6rem 1rem',
                                            borderRadius: '10px',
                                            background: linkCopied ? '#4ade80' : 'rgba(255,255,255,0.05)',
                                            color: 'white',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.5rem',
                                            fontWeight: 600,
                                            fontSize: '0.85rem',
                                            border: '1px solid var(--glass-border)'
                                        }}
                                    >
                                        {linkCopied ? <CheckCircle size={16} /> : <LinkIcon size={16} />}
                                        {linkCopied ? 'Link Copied' : 'Shareable Link'}
                                    </motion.button>
                                )}

                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={handleCopy}
                                    style={{
                                        padding: '0.6rem 1.2rem',
                                        borderRadius: '10px',
                                        background: copied ? '#4ade80' : 'var(--primary)',
                                        color: 'white',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem',
                                        fontWeight: 600,
                                        fontSize: '0.9rem'
                                    }}
                                >
                                    {copied ? <CheckCircle size={18} /> : <Copy size={18} />}
                                    {copied ? 'Copied' : 'Copy Result'}
                                </motion.button>
                            </>
                        )}
                    </div>
                </div>

                <div style={{ padding: '0.8rem 1.5rem', background: 'rgba(0,0,0,0.2)', fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>Mode: {mode.toUpperCase()}</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><Zap size={12} color="var(--primary)" /> Production Mode</span>
                        <button onClick={handleLock} style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: 'var(--text-secondary)', fontSize: '0.75rem' }}>
                            <LogOut size={12} /> Lock
                        </button>
                    </div>
                </div>
            </div>

            {/* Analytics Sidebar */}
            <div style={{ flex: '1 1 300px', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {metrics && activeTab === 'encrypt' && (
                    <div className="glass" style={{ borderRadius: '20px', padding: '1.5rem' }}>
                        <h3 style={{ fontSize: '1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Shield size={18} color="var(--primary)" /> Security Analysis
                        </h3>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div style={{ padding: '0.8rem', background: 'rgba(255,255,255,0.03)', borderRadius: '12px' }}>
                                <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Entropy</div>
                                <div style={{ fontSize: '1.1rem', fontWeight: 700 }}>{metrics.entropy}</div>
                            </div>
                            <div style={{ padding: '0.8rem', background: 'rgba(255,255,255,0.03)', borderRadius: '12px' }}>
                                <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Strength</div>
                                <div style={{ fontSize: '1.1rem', fontWeight: 700, color: metrics.complexity > 70 ? '#4ade80' : '#facc15' }}>{metrics.strength}</div>
                            </div>
                        </div>
                        <div style={{ marginTop: '1rem', padding: '0.8rem', background: 'rgba(0,113,227,0.1)', borderRadius: '12px', border: '1px solid rgba(0,113,227,0.2)' }}>
                            <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Crack Time Est.</div>
                            <div style={{ fontSize: '1rem', fontWeight: 600 }}>{metrics.crackTime}</div>
                        </div>
                    </div>
                )}

                <div className="glass" style={{ borderRadius: '20px', padding: '1.5rem' }}>
                    <h3 style={{ fontSize: '1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <HistoryIcon size={18} color="var(--primary)" /> Encrypted Vault
                    </h3>
                    {history.length === 0 ? (
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>No history yet.</p>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                            {history.map((item, i) => (
                                <div key={i} style={{ padding: '0.8rem', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                    <div style={{ fontSize: '0.6rem', color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>{item.mode.toUpperCase()}</div>
                                    <div style={{ fontSize: '0.85rem', color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.in}</div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Info Box */}
                <div className="glass" style={{ borderRadius: '20px', padding: '1.5rem' }}>
                    <h3 style={{ fontSize: '0.9rem', marginBottom: '1rem', color: 'var(--text-primary)' }}>Sharing Tutorial</h3>
                    <ol style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', paddingLeft: '1.2rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <li>Enter your secret message & key.</li>
                        <li>Click <strong>"Shareable Link"</strong>.</li>
                        <li>Send the link to another laptop/user.</li>
                        <li>They open it and the secret is revealed!</li>
                    </ol>
                </div>
            </div>
        </div>
    );
};

export default EmojiCrypto;
