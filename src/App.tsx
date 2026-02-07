import React from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import EmojiCrypto from './components/EmojiCrypto';

function App() {
  return (
    <div className="app">
      <Navbar />
      <main>
        <Hero />
        <section id="crypto-app" style={{ padding: '4rem 0' }}>
          <EmojiCrypto />
        </section>
      </main>

      <footer style={{
        padding: '4rem 2rem',
        textAlign: 'center',
        borderTop: '1px solid var(--glass-border)',
        background: 'var(--bg-darker)',
        color: 'var(--text-secondary)',
        fontSize: '0.9rem'
      }}>
        <p>&copy; {new Date().getFullYear()} ENCRYPT. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default App;
