import React from 'react';
import { motion } from 'framer-motion';
import { Lock, ArrowRight, ShieldCheck } from 'lucide-react';

const Hero: React.FC = () => {
    return (
        <section className="gradient-bg hero-gradient" style={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            textAlign: 'center',
            padding: '0 1rem',
            position: 'relative',
            overflow: 'hidden'
        }}>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    background: 'rgba(0, 113, 227, 0.1)',
                    padding: '0.5rem 1rem',
                    borderRadius: '100px',
                    border: '1px solid rgba(0, 113, 227, 0.2)',
                    marginBottom: '2rem',
                    color: 'var(--primary)',
                    fontSize: '0.85rem',
                    fontWeight: 600
                }}
            >
                <Lock size={14} />
                <span>Next generation of privacy is here</span>
            </motion.div>

            <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                style={{
                    fontSize: 'clamp(3rem, 8vw, 6rem)',
                    lineHeight: 1.1,
                    maxWidth: '900px',
                    marginBottom: '1.5rem',
                    letterSpacing: '-0.04em'
                }}
            >
                Secure your digital <br />
                <span style={{ color: 'var(--primary)' }}>empire with ease.</span>
            </motion.h1>

            <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                style={{
                    color: 'var(--text-secondary)',
                    fontSize: 'clamp(1rem, 2vw, 1.25rem)',
                    maxWidth: '600px',
                    marginBottom: '3rem'
                }}
            >
                The most advanced encryption platform for modern businesses.
                Protect your data with military-grade security in seconds.
            </motion.p>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
                style={{ display: 'flex', gap: '1rem' }}
            >
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    style={{
                        background: 'var(--primary)',
                        color: 'white',
                        padding: '1rem 2rem',
                        borderRadius: '30px',
                        fontSize: '1.1rem',
                        fontWeight: 600,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                    }}
                >
                    Start Free Trial <ArrowRight size={20} />
                </motion.button>
                <motion.button
                    whileHover={{ scale: 1.05, background: 'rgba(255, 255, 255, 0.1)' }}
                    whileTap={{ scale: 0.95 }}
                    style={{
                        background: 'transparent',
                        color: 'var(--text-primary)',
                        padding: '1rem 2rem',
                        borderRadius: '30px',
                        fontSize: '1.1rem',
                        fontWeight: 600,
                        border: '1px solid var(--glass-border)'
                    }}
                >
                    View Demo
                </motion.button>
            </motion.div>

            {/* Decorative elements */}
            <motion.div
                animate={{
                    y: [0, -20, 0],
                    rotate: [0, 5, 0]
                }}
                transition={{ duration: 5, repeat: Infinity }}
                style={{
                    position: 'absolute',
                    top: '20%',
                    right: '10%',
                    opacity: 0.1,
                    filter: 'blur(1px)'
                }}
            >
                <ShieldCheck size={120} color="var(--primary)" />
            </motion.div>
        </section>
    );
};

export default Hero;
