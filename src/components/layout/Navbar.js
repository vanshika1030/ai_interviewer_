'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { Globe } from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();

  // If we are not on the landing page, we can either render the original navbar or keep this new sleek one.
  // We'll keep the sleek one everywhere for consistency, but adjust positioning.
  const isLanding = pathname === '/';

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      style={{
        position: isLanding ? 'absolute' : 'sticky',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        padding: '24px 24px',
        width: '100%',
      }}
    >
      <div 
        className="liquid-glass"
        style={{
          borderRadius: '9999px',
          padding: '12px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          maxWidth: '1024px',
          margin: '0 auto',
        }}
      >
        {/* Left Side */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
          {/* Logo */}
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
            <Globe size={24} color="#ffffff" />
            <span style={{ color: '#ffffff', fontWeight: 600, fontSize: '1.125rem' }}>InterviewAI</span>
          </Link>

          {/* Links (Desktop) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }} className="desktop-only">
            {['Features', 'Pricing', 'About'].map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase()}`}
                style={{
                  color: 'rgba(255, 255, 255, 0.8)',
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  textDecoration: 'none',
                  transition: 'color 0.3s ease',
                }}
                onMouseEnter={(e) => (e.target.style.color = '#ffffff')}
                onMouseLeave={(e) => (e.target.style.color = 'rgba(255, 255, 255, 0.8)')}
              >
                {item}
              </a>
            ))}
          </div>
        </div>

        {/* Right Side */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <Link
            href="/recruiter/create"
            style={{
              color: '#ffffff',
              fontSize: '0.875rem',
              fontWeight: 500,
              textDecoration: 'none',
              cursor: 'pointer',
              transition: 'opacity 0.3s ease',
            }}
            onMouseEnter={(e) => (e.target.style.opacity = '0.8')}
            onMouseLeave={(e) => (e.target.style.opacity = '1')}
          >
            Sign Up
          </Link>

          <Link
            href="/candidate"
            className="liquid-glass"
            style={{
              borderRadius: '9999px',
              padding: '8px 24px',
              fontSize: '0.875rem',
              fontWeight: 500,
              color: '#ffffff',
              textDecoration: 'none',
              cursor: 'pointer',
              transition: 'opacity 0.3s ease',
            }}
            onMouseEnter={(e) => (e.target.style.opacity = '0.9')}
            onMouseLeave={(e) => (e.target.style.opacity = '1')}
          >
            Login
          </Link>
        </div>
      </div>

      <style jsx>{`
        @media (max-width: 768px) {
          .desktop-only {
            display: none !important;
          }
        }
      `}</style>
    </motion.nav>
  );
}
