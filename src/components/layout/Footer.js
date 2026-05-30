'use client';

import Link from 'next/link';

const FOOTER_LINKS = [
  { href: '/about', label: 'About' },
  { href: '/privacy', label: 'Privacy' },
  { href: '/terms', label: 'Terms' },
];

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer style={styles.footer}>
      <div style={styles.container}>
        {/* Top divider with gradient */}
        <div style={styles.divider} aria-hidden="true" />

        <div style={styles.content}>
          {/* Left - Logo & Copyright */}
          <div style={styles.left}>
            <Link href="/" style={styles.logo}>
              <span style={styles.logoIcon}>◆</span>
              <span style={styles.logoText}>
                Interview<span style={styles.logoAccent}>AI</span>
              </span>
            </Link>
            <p style={styles.copyright}>
              © {currentYear} InterviewAI. All rights reserved.
            </p>
          </div>

          {/* Right - Links */}
          <div style={styles.links}>
            {FOOTER_LINKS.map((link) => (
              <Link key={link.href} href={link.href} style={styles.link}>
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Bottom bar */}
        <div style={styles.bottomBar}>
          <p style={styles.bottomText}>
            Built with AI-powered technology for smarter hiring decisions.
          </p>
        </div>
      </div>
    </footer>
  );
}

const styles = {
  footer: {
    position: 'relative',
    zIndex: 1,
    background: 'rgba(10, 10, 30, 0.5)',
    backdropFilter: 'blur(10px)',
    WebkitBackdropFilter: 'blur(10px)',
    paddingTop: '0',
    paddingBottom: '32px',
  },
  container: {
    maxWidth: '1280px',
    margin: '0 auto',
    padding: '0 24px',
  },
  divider: {
    height: '1px',
    background:
      'linear-gradient(90deg, transparent, rgba(218, 164, 100, 0.3), rgba(222, 195, 132, 0.3), transparent)',
    marginBottom: '40px',
  },
  content: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: '24px',
    marginBottom: '32px',
  },
  left: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    textDecoration: 'none',
  },
  logoIcon: {
    fontSize: '1.1rem',
    background: 'linear-gradient(135deg, #DAA464, #DEC384)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    lineHeight: 1,
  },
  logoText: {
    fontSize: '1.05rem',
    fontWeight: '600',
    color: '#f8fafc',
    letterSpacing: '-0.01em',
  },
  logoAccent: {
    background: 'linear-gradient(135deg, #DAA464, #DEC384)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
  },
  copyright: {
    fontSize: '0.8rem',
    color: '#64748b',
    margin: 0,
  },
  links: {
    display: 'flex',
    alignItems: 'center',
    gap: '32px',
  },
  link: {
    fontSize: '0.85rem',
    fontWeight: '500',
    color: '#94a3b8',
    textDecoration: 'none',
    transition: 'color 0.2s ease',
    letterSpacing: '0.01em',
  },
  bottomBar: {
    borderTop: '1px solid rgba(255, 255, 255, 0.06)',
    paddingTop: '24px',
    textAlign: 'center',
  },
  bottomText: {
    fontSize: '0.75rem',
    color: '#64748b',
    margin: 0,
    letterSpacing: '0.02em',
  },
};
