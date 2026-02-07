import React from 'react';
import { Shield, Menu, X } from 'lucide-react';
import { motion } from 'framer-motion';

const Navbar: React.FC = () => {
    const [isOpen, setIsOpen] = React.useState(false);

    return (
        <nav className="glass" style={{
            position: 'fixed',
            top: 0,
            width: '100%',
            zIndex: 1000,
            padding: '1rem 2rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Shield size={28} color="var(--primary)" />
                <span style={{
                    fontSize: '1.5rem',
                    fontWeight: 700,
                    fontFamily: 'var(--font-heading)',
                    letterSpacing: '-0.02em'
                }}>
                    ENCRYPT
                </span>
            </div>

            <div className="nav-links" style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
                {['Product', 'Security', 'Enterprise', 'Pricing'].map((item) => (
                    <a key={item} href={`#${item.toLowerCase()}`} style={{
                        color: 'var(--text-secondary)',
                        fontSize: '0.9rem',
                        fontWeight: 500
                    }}
                        onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-primary)')}
                        onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-secondary)')}
                    >
                        {item}
                    </a>
                ))}
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    style={{
                        background: 'var(--primary)',
                        color: 'white',
                        padding: '0.5rem 1.2rem',
                        borderRadius: '20px',
                        fontSize: '0.9rem',
                        fontWeight: 600
                    }}
                >
                    Get Started
                </motion.button>
            </div>

            <div style={{ display: 'none' }} className="mobile-menu">
                {isOpen ? <X onClick={() => setIsOpen(false)} /> : <Menu onClick={() => setIsOpen(true)} />}
            </div>
        </nav>
    );
};

export default Navbar;
