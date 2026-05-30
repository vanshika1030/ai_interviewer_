'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Building2, TrendingUp, Video } from 'lucide-react';
import BackgroundVideo from '@/components/ui/BackgroundVideo';

export default function Home() {
  const [scrollY, setScrollY] = useState(0);
  const [isPageReady, setIsPageReady] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });

    // Intersection Observer for scroll animations
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('animate-visible');
          }
        });
      },
      { threshold: 0.1 }
    );

    document.querySelectorAll('.animate-on-scroll').forEach((el) => {
      observer.observe(el);
    });

    document.body.classList.add('landing-active');
    let secondFrame;
    const firstFrame = requestAnimationFrame(() => {
      secondFrame = requestAnimationFrame(() => setIsPageReady(true));
    });

    return () => {
      cancelAnimationFrame(firstFrame);
      if (secondFrame) cancelAnimationFrame(secondFrame);
      window.removeEventListener('scroll', handleScroll);
      observer.disconnect();
      document.body.classList.remove('landing-active');
    };
  }, []);

  const scrollToSection = useCallback((e, id) => {
    e.preventDefault();
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);

  return (
    <div className={`landing-container ${isPageReady ? 'landing-ready' : ''}`}>
      
      {/* Background Video directly inside landing container */}
      <BackgroundVideo />

      {/* NAVBAR */}
      <nav className={`navbar ${scrollY > 50 ? 'navbar-scrolled glass-panel' : ''}`}>
        <div className="nav-container">
          <Link href="/" className="logo">
            <span className="logo-icon" aria-hidden="true"></span>
            Interview<span className="logo-accent">AI</span>
          </Link>
          <div className="nav-links">
            <a href="#how-it-works" onClick={(e) => scrollToSection(e, 'how-it-works')}>How it works</a>
            <a href="#features" onClick={(e) => scrollToSection(e, 'features')}>Features</a>
            <a href="#faq" onClick={(e) => scrollToSection(e, 'faq')}>FAQ</a>
          </div>
          <div className="nav-actions">
            <Link href="/auth" className="login-link nav-glass-link">Sign in</Link>
            <Link href="/auth" className="btn-outline-pill nav-glass-link">Sign up</Link>
          </div>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section id="hero" className="hero">
        <div className="hero-content-centered">

          <div className="pill-badge-top animate-on-scroll liquid-glass">
            <span className="badge-highlight">InterviewAI</span> Take your hiring to the next level
          </div>

          <h1 className="hero-headline animate-on-scroll" style={{ animationDelay: '0.1s' }}>
            Take Control and Streamline<br />
            Your Hiring with InterviewAI<span className="cursor-blink">|</span>
          </h1>

          <p className="hero-subtext animate-on-scroll" style={{ animationDelay: '0.2s' }}>
            Stay on top of your candidates with our simple and intuitive AI interviewer.
          </p>

          <div className="hero-cta-group animate-on-scroll" style={{ animationDelay: '0.3s' }}>
            <Link href="/auth" className="btn-gold-pill hero-pill">
              <Building2 className="hero-icon" aria-hidden="true" />
              Recruiter Dashboard
            </Link>
            <Link href="/auth" className="btn-outline-pill hero-pill">
              <Video className="hero-icon" aria-hidden="true" />
              Candidate Area
            </Link>
          </div>
        </div>

        {/* FLOATING WIDGETS OVER PARALLAX BACKGROUND */}
        <div className="widgets-container">
          {/* Left Widget - Stats */}
          <div 
            className="widget-card widget-left liquid-glass"
            style={{ transform: `translateY(${scrollY * -0.15}px) rotate(-6deg)` }}
          >
            <div className="widget-title">Completed Interviews</div>
            <div className="widget-row">
              <span className="widget-number"><span className="dot gold"></span> 327</span>
              <span className="widget-trend green">+11.02 <TrendingUp className="trend-icon" aria-hidden="true" /></span>
            </div>
            <div className="widget-sub">139 points left to become a senior recruiter</div>
          </div>

          {/* Right Widget - AI Analyzing */}
          <div 
            className="widget-card widget-right liquid-glass"
            style={{ transform: `translateY(${scrollY * -0.1}px) rotate(4deg)` }}
          >
            <div className="widget-title">Live Sentiment</div>
            <div className="pulse-circle green"></div>
            <div className="widget-text">Candidate is <strong>confident</strong></div>
            <div className="progress-bar"><div className="progress-fill green" style={{ width: '85%' }}></div></div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS SECTION */}
      <section id="how-it-works" className="section-block">
        <div className="section-header">
          <span className="section-eyebrow">PROCESS</span>
          <h2>Automated Screening <span className="text-gradient">in 3 Steps</span></h2>
          <p>We handle the heavy lifting so you only interview the best.</p>
        </div>
        
        <div className="steps-grid">
          <div className="step-card liquid-glass animate-on-scroll">
            <div className="step-num">01</div>
            <h3>Configure Roles</h3>
            <p>Upload a job description and configure required skills. Our AI generates customized technical and behavioral questions instantly.</p>
          </div>
          <div className="step-card liquid-glass animate-on-scroll" style={{ animationDelay: '0.2s' }}>
            <div className="step-num">02</div>
            <h3>Invite Candidates</h3>
            <p>Send unique secure links to candidates. They take the video interview on their own time, supervised by our anti-cheat system.</p>
          </div>
          <div className="step-card liquid-glass animate-on-scroll" style={{ animationDelay: '0.4s' }}>
            <div className="step-num">03</div>
            <h3>Review Insights</h3>
            <p>Receive comprehensive scorecards, sentiment analysis, and highlight reels for each candidate to make faster hiring decisions.</p>
          </div>
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section id="features" className="section-block">
        <div className="section-header">
          <span className="section-eyebrow">FEATURES</span>
          <h2>Built for <span className="text-gradient">Modern Teams</span></h2>
        </div>

        <div className="bento-grid">
          <div className="bento-box feature-large liquid-glass animate-on-scroll">
            <div className="bento-content">
              <h3>Real-Time AI Proctoring</h3>
              <p>Advanced facial recognition detects multiple faces, unauthorized electronic devices, and tab-switching, ensuring complete integrity of the assessment.</p>
              <div className="bento-visual proctor-visual">
                <div className="visual-scan-line"></div>
                <div className="proctor-feed">
                  <div className="camera-frame">
                    <span className="corner top-left"></span>
                    <span className="corner top-right"></span>
                    <span className="corner bottom-left"></span>
                    <span className="corner bottom-right"></span>
                    <div className="scan-grid"></div>
                    <div className="face-ring">
                      <div className="face-eyes">
                        <span></span>
                        <span></span>
                      </div>
                      <div className="face-mouth"></div>
                    </div>
                    <div className="shoulders"></div>
                    <div className="proctor-chip chip-safe">Face detected</div>
                    <div className="proctor-chip chip-alert">Tab locked</div>
                  </div>
                  <div className="proctor-side-panel">
                    <div className="panel-title">Integrity Monitor</div>
                    <div className="score-ring">98%</div>
                    <div className="check-row"><span></span> Single face</div>
                    <div className="check-row"><span></span> Eye contact stable</div>
                    <div className="check-row"><span></span> No tab switches</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bento-box feature-small liquid-glass animate-on-scroll" style={{ animationDelay: '0.2s' }}>
            <div className="bento-content">
              <h3>Adaptive Questioning</h3>
              <p>The AI adjusts question difficulty in real-time based on the candidate&apos;s previous answers.</p>
            </div>
          </div>

          <div className="bento-box feature-small liquid-glass animate-on-scroll" style={{ animationDelay: '0.4s' }}>
            <div className="bento-content">
              <h3>Actionable Scorecards</h3>
              <p>Objective scoring on communication, technical accuracy, and cultural fit.</p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ SECTION */}
      <section id="faq" className="section-block faq-section">
        <div className="section-header">
          <h2>Got Questions?</h2>
        </div>
        
        <div className="faq-list">
          <div className="faq-item liquid-glass">
            <h4>How does the AI evaluate candidates?</h4>
            <p>Our platform uses natural language processing to evaluate the context and correctness of answers, paired with facial analysis to gauge sentiment and confidence.</p>
          </div>
          <div className="faq-item liquid-glass">
            <h4>Can I customize the interview questions?</h4>
            <p>Yes. You can provide your own question bank or let the AI generate them based on the job description and required competencies.</p>
          </div>
          <div className="faq-item liquid-glass">
            <h4>Is candidate privacy protected?</h4>
            <p>Absolutely. All video streams and transcripts are encrypted in transit and at rest. Data is strictly used for your evaluation purposes.</p>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="landing-footer">
        <div className="footer-content">
          <div className="footer-left">
            <div className="logo-text">Interview<span className="logo-accent">AI</span></div>
            <p>The future of technical hiring.</p>
          </div>
          <div className="footer-links">
            <div className="link-group">
              <strong>Product</strong>
              <a href="#">Features</a>
              <a href="#">Pricing</a>
              <a href="#">Security</a>
            </div>
            <div className="link-group">
              <strong>Company</strong>
              <a href="#">About Us</a>
              <a href="#">Careers</a>
              <a href="#">Contact</a>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© 2024 InterviewAI. All rights reserved.</p>
        </div>
      </footer>

      <style jsx>{`
        /* =======================================================================
           LANDING PAGE SPECIFIC STYLES
           ======================================================================= */
        
        .landing-container {
          width: 100%;
          min-height: 100vh;
          overflow-x: hidden;
          font-family: var(--font-family);
          position: relative;
          opacity: 0;
          background: #050816;
          color: #f8fafc;
          transition: opacity 0.38s ease;
        }

        .landing-container.landing-ready {
          opacity: 1;
        }

        .landing-container:not(.landing-ready) .animate-on-scroll {
          opacity: 0;
          transform: translateY(16px);
          animation: none;
        }

        .landing-container p,
        .landing-container a,
        .landing-container span,
        .landing-container h1,
        .landing-container h2,
        .landing-container h3,
        .landing-container h4 {
          text-shadow: 0 3px 18px rgba(0, 0, 0, 0.66);
        }

        .landing-container p {
          color: #dce8f8;
        }

        /* NAVBAR */
        .navbar {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 1000;
          padding: 20px 0;
          transition: all 0.3s ease;
        }
        
        .navbar.navbar-scrolled {
          padding: 15px 0;
          background: rgba(5, 8, 22, 0.85);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
          box-shadow: 0 4px 30px rgba(0, 0, 0, 0.5);
        }

        .nav-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 24px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .logo {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 1.4rem;
          font-weight: 700;
          color: #f8fafc;
          text-decoration: none;
        }

        .logo-icon {
          width: 14px;
          height: 14px;
          border-radius: 4px;
          background: linear-gradient(135deg, #f4d39c, #DAA464);
          box-shadow: 0 0 22px rgba(218, 164, 100, 0.5);
          transform: rotate(45deg);
          flex: 0 0 auto;
        }
        
        .logo-accent {
          color: #DAA464;
        }

        .nav-links {
          display: flex;
          gap: 32px;
        }

        .nav-links a {
          color: #e5edf8;
          text-decoration: none;
          font-size: 0.95rem;
          font-weight: 650;
          transition: color 0.2s ease;
        }

        .nav-links a:hover {
          color: #ffffff;
        }

        .nav-actions {
          display: flex;
          align-items: center;
          gap: 20px;
        }

        .login-link {
          color: #f8fafc;
          text-decoration: none;
          font-size: 0.95rem;
          font-weight: 700;
        }

        .login-link:hover {
          color: #DAA464;
        }

        .nav-glass-link {
          min-height: 40px;
          padding: 8px 22px;
          border-radius: 999px !important;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          line-height: 1.2;
          border: 1px solid rgba(255, 255, 255, 0.15) !important;
          outline: none;
          outline-offset: 0;
          background: rgba(255, 255, 255, 0.06) !important;
          backdrop-filter: blur(16px) saturate(140%);
          -webkit-backdrop-filter: blur(16px) saturate(140%);
          box-shadow:
            0 4px 16px rgba(0, 0, 0, 0.2),
            inset 0 1px 0 rgba(255, 255, 255, 0.15) !important;
          overflow: hidden;
          transition: all 0.25s ease;
          font-size: 0.9rem;
          font-weight: 600;
          text-decoration: none;
        }

        .nav-glass-link:hover {
          background: rgba(255, 255, 255, 0.1) !important;
          border-color: rgba(218, 164, 100, 0.4) !important;
          box-shadow:
            0 6px 24px rgba(0, 0, 0, 0.25),
            0 0 16px rgba(218, 164, 100, 0.1),
            inset 0 1px 0 rgba(255, 255, 255, 0.2) !important;
        }

        /* HERO SECTION */
        .hero {
          position: relative;
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 100px 20px;
          overflow: hidden;
        }

        .hero-content-centered {
          position: relative;
          z-index: 10;
          text-align: center;
          max-width: 900px;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .pill-badge-top {
          display: inline-flex;
          align-items: center;
          border-radius: 999px;
          padding: 6px 16px;
          font-size: 0.85rem;
          color: #f7fbff;
          font-weight: 650;
          margin-bottom: 30px;
        }

        .badge-highlight {
          color: #DAA464;
          font-weight: 600;
          margin-right: 8px;
        }

        .hero-headline {
          font-size: clamp(2.5rem, 5vw, 4.5rem);
          font-weight: 800;
          line-height: 1.1;
          letter-spacing: -0.02em;
          color: #ffffff;
          margin-bottom: 24px;
        }
        
        .cursor-blink {
          display: inline-block;
          width: 4px;
          height: 1em;
          background-color: #DAA464;
          vertical-align: middle;
          margin-left: 4px;
          animation: blink 1s step-end infinite;
        }

        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }

        .hero-subtext {
          font-size: clamp(1.1rem, 2vw, 1.3rem);
          color: #e5eefb;
          max-width: 600px;
          margin-bottom: 40px;
          line-height: 1.6;
          font-weight: 550;
        }

        .hero-cta-group {
          display: flex;
          gap: 16px;
          flex-wrap: wrap;
          justify-content: center;
        }

        .btn-gold-pill {
          background:
            linear-gradient(135deg, rgba(255,255,255,0.28), rgba(255,255,255,0.08)) padding-box,
            linear-gradient(135deg, rgba(255,255,255,0.75), rgba(218,164,100,0.96), rgba(255,255,255,0.35)) border-box,
            linear-gradient(135deg, #DAA464 0%, #DEC384 100%);
          color: #070a16;
          font-weight: 800;
          font-size: 1rem;
          padding: 15px 34px;
          border-radius: 999px !important;
          text-decoration: none;
          transition: all 0.3s ease;
          box-shadow:
            0 18px 48px rgba(0, 0, 0, 0.36),
            0 0 30px rgba(218, 164, 100, 0.2),
            inset 0 1px 0 rgba(255, 255, 255, 0.48);
          display: inline-flex;
          align-items: center;
          gap: 8px;
          border: 1px solid transparent;
          outline: 1px solid rgba(255, 255, 255, 0.14);
          outline-offset: 4px;
          backdrop-filter: blur(14px) saturate(170%);
          -webkit-backdrop-filter: blur(14px) saturate(170%);
          text-shadow: none !important;
        }

        .btn-gold-pill *,
        .btn-outline-pill *,
        .nav-glass-link * {
          text-shadow: none !important;
        }

        .hero-icon {
          width: 18px;
          height: 18px;
          flex: 0 0 auto;
        }

        .btn-gold-pill:hover {
          transform: translateY(-2px);
          box-shadow:
            0 22px 60px rgba(0, 0, 0, 0.42),
            0 0 36px rgba(218, 164, 100, 0.32),
            inset 0 1px 0 rgba(255, 255, 255, 0.58);
        }

        .btn-outline-pill {
          color: #ffffff;
          font-weight: 800;
          font-size: 1rem;
          padding: 15px 34px;
          border-radius: 999px !important;
          text-decoration: none;
          transition: all 0.3s ease;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          min-height: 54px;
          border: 1px solid rgba(255, 255, 255, 0.18) !important;
          outline: none;
          outline-offset: 0;
          background: rgba(255, 255, 255, 0.07) !important;
          backdrop-filter: blur(20px) saturate(150%);
          -webkit-backdrop-filter: blur(20px) saturate(150%);
          box-shadow:
            0 8px 32px rgba(0, 0, 0, 0.25),
            inset 0 1px 0 rgba(255, 255, 255, 0.2) !important;
          overflow: hidden;
        }

        .btn-outline-pill:hover {
          transform: translateY(-2px);
          background: rgba(255, 255, 255, 0.12) !important;
          border-color: rgba(218, 164, 100, 0.35) !important;
          box-shadow:
            0 12px 40px rgba(0, 0, 0, 0.3),
            0 0 20px rgba(218, 164, 100, 0.12),
            inset 0 1px 0 rgba(255, 255, 255, 0.25) !important;
        }

        .hero-pill {
          min-height: 56px;
          border-radius: 999px !important;
        }

        .nav-glass-link.glass-panel,
        .btn-outline-pill.glass-panel {
          border-color: transparent !important;
          outline: none !important;
        }

        .nav-glass-link.glass-panel::before,
        .btn-outline-pill.glass-panel::before {
          display: none !important;
        }

        /* FLOATING WIDGETS */
        .widgets-container {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          z-index: 5;
        }

        .widget-card {
          position: absolute;
          border-radius: 16px;
          padding: 20px;
          pointer-events: auto;
          transition: transform 0.1s ease-out;
          box-shadow:
            0 24px 70px rgba(0, 0, 0, 0.46),
            0 0 0 1px rgba(255,255,255,0.12),
            inset 0 1px 0 rgba(255,255,255,0.26) !important;
          transform-style: preserve-3d;
        }

        .widget-card::before {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: inherit;
          background: linear-gradient(135deg, rgba(255,255,255,0.22), transparent 42%, rgba(218,164,100,0.1));
          pointer-events: none;
          opacity: 0.7;
        }

        .widget-left {
          top: 30%;
          left: 10%;
          width: 260px;
        }

        .widget-right {
          top: 50%;
          right: 12%;
          width: 240px;
        }

        .widget-title {
          font-size: 0.85rem;
          color: #dbe7f6;
          margin-bottom: 12px;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          font-weight: 750;
        }

        .widget-row {
          display: flex;
          align-items: flex-end;
          gap: 12px;
          margin-bottom: 12px;
        }

        .widget-number {
          font-size: 2rem;
          font-weight: 700;
          color: #f8fafc;
          line-height: 1;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
        }
        .dot.gold { background: #DAA464; box-shadow: 0 0 10px #DAA464; }

        .widget-trend {
          font-size: 0.9rem;
          font-weight: 600;
          margin-bottom: 4px;
          display: inline-flex;
          align-items: center;
          gap: 4px;
        }
        .green { color: #10b981; }

        .trend-icon {
          width: 14px;
          height: 14px;
          flex: 0 0 auto;
        }

        .widget-sub {
          font-size: 0.8rem;
          color: #bfcee2;
          font-weight: 550;
        }

        .pulse-circle {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: rgba(16, 185, 129, 0.2);
          margin-bottom: 16px;
          position: relative;
        }
        
        .pulse-circle::after {
          content: '';
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: #10b981;
          box-shadow: 0 0 15px #10b981;
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.4); }
          70% { box-shadow: 0 0 0 15px rgba(16, 185, 129, 0); }
          100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
        }

        .widget-text {
          font-size: 0.9rem;
          color: #f4f8ff;
          margin-bottom: 12px;
        }

        .progress-bar {
          width: 100%;
          height: 4px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 2px;
          overflow: hidden;
        }

        .progress-fill {
          height: 100%;
          border-radius: 2px;
        }
        .progress-fill.green { background: #10b981; }

        /* SECTIONS */
        .section-block {
          padding: 120px 24px;
          max-width: 1200px;
          margin: 0 auto;
          position: relative;
          z-index: 10;
        }

        .section-header {
          text-align: center;
          margin-bottom: 80px;
        }

        .section-eyebrow {
          display: inline-block;
          font-size: 0.85rem;
          font-weight: 600;
          color: #f1c27d;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          margin-bottom: 16px;
        }

        .section-header h2 {
          font-size: clamp(2rem, 4vw, 3rem);
          font-weight: 800;
          color: #ffffff;
          margin-bottom: 20px;
          line-height: 1.2;
        }

        .section-header p {
          font-size: 1.1rem;
          color: #dce8f8;
          max-width: 600px;
          margin: 0 auto;
          font-weight: 550;
        }

        .text-gradient {
          background: linear-gradient(135deg, #DAA464 0%, #DEC384 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        /* STEPS GRID */
        .steps-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 30px;
        }

        .step-card {
          border-radius: 20px;
          padding: 40px;
          transition: all 0.3s ease;
          box-shadow:
            0 22px 65px rgba(0, 0, 0, 0.38),
            0 0 0 1px rgba(255,255,255,0.12),
            inset 0 1px 0 rgba(255,255,255,0.24) !important;
        }

        .step-card:hover {
          transform: translateY(-8px) scale(1.015);
          box-shadow:
            0 32px 90px rgba(0, 0, 0, 0.48),
            0 0 42px rgba(218,164,100,0.12),
            inset 0 1px 0 rgba(255,255,255,0.3) !important;
        }

        .step-num {
          display: inline-block;
          font-size: 3rem;
          font-weight: 900;
          color: transparent;
          background: linear-gradient(135deg, #f8dba4 0%, #DAA464 45%, #ffffff 100%);
          -webkit-background-clip: text;
          background-clip: text;
          filter: drop-shadow(0 10px 24px rgba(218, 164, 100, 0.42));
          margin-bottom: 20px;
          line-height: 1;
        }

        .step-card:nth-child(2) .step-num {
          background: linear-gradient(135deg, #c8d0ff 0%, #767F9E 44%, #ffffff 100%);
          -webkit-background-clip: text;
          background-clip: text;
          filter: drop-shadow(0 10px 24px rgba(118, 127, 158, 0.5));
        }

        .step-card:nth-child(3) .step-num {
          background: linear-gradient(135deg, #a7f3d0 0%, #22c55e 42%, #ffffff 100%);
          -webkit-background-clip: text;
          background-clip: text;
          filter: drop-shadow(0 10px 24px rgba(34, 197, 94, 0.42));
        }

        .step-card h3 {
          font-size: 1.3rem;
          color: #ffffff;
          margin-bottom: 16px;
        }

        .step-card p {
          color: #dce8f8;
          line-height: 1.6;
          font-size: 0.95rem;
          font-weight: 520;
        }

        /* BENTO GRID */
        .bento-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          grid-template-rows: auto auto;
          gap: 24px;
        }

        .bento-box {
          border-radius: 24px;
          overflow: hidden;
          position: relative;
          box-shadow:
            0 26px 78px rgba(0, 0, 0, 0.42),
            0 0 0 1px rgba(255,255,255,0.12),
            inset 0 1px 0 rgba(255,255,255,0.24) !important;
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }

        .bento-box:hover {
          transform: translateY(-6px);
          box-shadow:
            0 36px 100px rgba(0, 0, 0, 0.52),
            0 0 44px rgba(218,164,100,0.12),
            inset 0 1px 0 rgba(255,255,255,0.3) !important;
        }

        .feature-large {
          grid-column: 1 / -1;
          display: flex;
        }

        .bento-content {
          padding: 40px;
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
          position: relative;
          z-index: 2;
        }

        .bento-box h3 {
          font-size: 1.5rem;
          color: #ffffff;
          margin-bottom: 16px;
        }

        .bento-box p {
          color: #dce8f8;
          line-height: 1.6;
          font-weight: 520;
        }

        .bento-visual {
          flex: 1;
          min-height: 300px;
          background: rgba(0,0,0,0.2);
          border-left: 1px solid rgba(255, 255, 255, 0.05);
          position: relative;
        }

        .proctor-visual {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 28px;
          overflow: hidden;
          background:
            radial-gradient(circle at 32% 28%, rgba(34,197,94,0.18), transparent 28%),
            radial-gradient(circle at 78% 70%, rgba(218,164,100,0.14), transparent 30%),
            rgba(8, 12, 28, 0.42);
        }

        .proctor-feed {
          width: min(100%, 520px);
          min-height: 245px;
          display: grid;
          grid-template-columns: 1fr 150px;
          gap: 16px;
          align-items: stretch;
        }

        .camera-frame,
        .proctor-side-panel {
          position: relative;
          border-radius: 18px;
          background: rgba(5, 9, 22, 0.48);
          border: 1px solid rgba(255,255,255,0.16);
          box-shadow: inset 0 1px 0 rgba(255,255,255,0.18), 0 18px 46px rgba(0,0,0,0.32);
          overflow: hidden;
        }

        .camera-frame {
          min-height: 245px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .scan-grid {
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px);
          background-size: 26px 26px;
          opacity: 0.38;
        }

        .visual-scan-line {
          position: absolute;
          left: 30px;
          right: 30px;
          top: 28%;
          height: 2px;
          background: linear-gradient(90deg, transparent, rgba(34,197,94,0.95), transparent);
          box-shadow: 0 0 24px rgba(34,197,94,0.85);
          z-index: 3;
          animation: proctorScan 3s ease-in-out infinite;
        }

        @keyframes proctorScan {
          0%, 100% { transform: translateY(-42px); opacity: 0.35; }
          50% { transform: translateY(118px); opacity: 1; }
        }

        .face-ring {
          width: 112px;
          height: 138px;
          border-radius: 48% 48% 44% 44%;
          border: 2px solid rgba(34,197,94,0.86);
          box-shadow: 0 0 34px rgba(34,197,94,0.28), inset 0 0 22px rgba(34,197,94,0.12);
          position: relative;
          z-index: 2;
        }

        .face-eyes {
          position: absolute;
          top: 48px;
          left: 28px;
          right: 28px;
          display: flex;
          justify-content: space-between;
        }

        .face-eyes span {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background: rgba(226,232,240,0.86);
          box-shadow: 0 0 12px rgba(226,232,240,0.35);
        }

        .face-mouth {
          position: absolute;
          left: 38px;
          right: 38px;
          bottom: 38px;
          height: 10px;
          border-bottom: 2px solid rgba(226,232,240,0.75);
          border-radius: 0 0 999px 999px;
        }

        .shoulders {
          position: absolute;
          width: 180px;
          height: 86px;
          bottom: 18px;
          border-radius: 90px 90px 0 0;
          border: 2px solid rgba(34,197,94,0.42);
          border-bottom: none;
          z-index: 1;
          opacity: 0.8;
        }

        .corner {
          position: absolute;
          width: 28px;
          height: 28px;
          border-color: rgba(218,164,100,0.85);
          z-index: 4;
        }

        .top-left { top: 18px; left: 18px; border-top: 2px solid rgba(218,164,100,0.85); border-left: 2px solid rgba(218,164,100,0.85); }
        .top-right { top: 18px; right: 18px; border-top: 2px solid rgba(218,164,100,0.85); border-right: 2px solid rgba(218,164,100,0.85); }
        .bottom-left { bottom: 18px; left: 18px; border-bottom: 2px solid rgba(218,164,100,0.85); border-left: 2px solid rgba(218,164,100,0.85); }
        .bottom-right { bottom: 18px; right: 18px; border-bottom: 2px solid rgba(218,164,100,0.85); border-right: 2px solid rgba(218,164,100,0.85); }

        .proctor-chip {
          position: absolute;
          z-index: 5;
          padding: 6px 10px;
          border-radius: 999px;
          font-size: 0.72rem;
          font-weight: 700;
          letter-spacing: 0.02em;
          backdrop-filter: blur(12px);
          border: 1px solid rgba(255,255,255,0.14);
        }

        .chip-safe {
          left: 18px;
          bottom: 18px;
          color: #86efac;
          background: rgba(34,197,94,0.14);
        }

        .chip-alert {
          right: 18px;
          top: 18px;
          color: #fde68a;
          background: rgba(218,164,100,0.14);
        }

        .proctor-side-panel {
          padding: 18px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          gap: 12px;
        }

        .panel-title {
          color: #e4ecf8;
          font-size: 0.76rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.08em;
        }

        .score-ring {
          width: 76px;
          height: 76px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #86efac;
          font-weight: 800;
          font-size: 1.1rem;
          background:
            radial-gradient(circle, rgba(34,197,94,0.12) 56%, transparent 57%),
            conic-gradient(#22c55e 0 98%, rgba(255,255,255,0.1) 98% 100%);
        }

        .check-row {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #e4ecf8;
          font-size: 0.78rem;
          white-space: nowrap;
        }

        .check-row span {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #22c55e;
          box-shadow: 0 0 10px rgba(34,197,94,0.7);
          flex: 0 0 auto;
        }

        /* FAQ */
        .faq-list {
          max-width: 800px;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .faq-item {
          border-radius: 16px;
          padding: 24px 32px;
          box-shadow:
            0 18px 55px rgba(0, 0, 0, 0.32),
            inset 0 1px 0 rgba(255,255,255,0.2) !important;
          transition: transform 0.25s ease, box-shadow 0.25s ease;
        }

        .faq-item:hover {
          transform: translateY(-4px);
          box-shadow:
            0 26px 70px rgba(0, 0, 0, 0.42),
            0 0 32px rgba(218,164,100,0.1),
            inset 0 1px 0 rgba(255,255,255,0.24) !important;
        }

        .faq-item h4 {
          color: #ffffff;
          font-size: 1.1rem;
          margin-bottom: 12px;
        }

        .faq-item p {
          color: #dce8f8;
          line-height: 1.6;
          font-weight: 520;
        }

        /* FOOTER */
        .landing-footer {
          border-top: 1px solid rgba(255, 255, 255, 0.05);
          padding: 80px 24px 40px;
          background: rgba(5, 7, 18, 0.88);
          position: relative;
          z-index: 10;
        }

        .footer-content {
          max-width: 1200px;
          margin: 0 auto;
          display: flex;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 40px;
          margin-bottom: 60px;
        }

        .footer-left p {
          color: #dce8f8;
          margin-top: 16px;
          font-weight: 520;
        }

        .footer-links {
          display: flex;
          gap: 80px;
        }

        .link-group {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .link-group strong {
          color: #ffffff;
          font-weight: 600;
          margin-bottom: 8px;
        }

        .link-group a {
          color: #dce8f8;
          text-decoration: none;
          font-weight: 540;
          transition: color 0.2s ease;
        }

        .link-group a:hover {
          color: #DAA464;
        }

        .footer-bottom {
          max-width: 1200px;
          margin: 0 auto;
          text-align: center;
          color: #cbd8eb;
          font-size: 0.9rem;
          border-top: 1px solid rgba(255, 255, 255, 0.05);
          padding-top: 40px;
        }

        /* ANIMATIONS */
        .animate-on-scroll {
          opacity: 0;
          transform: translateY(30px);
          animation: fadeInUp 0.8s forwards;
        }

        .animate-visible {
          animation: fadeInUp 0.8s forwards;
        }

        @keyframes fadeInUp {
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* MEDIA QUERIES */
        @media (max-width: 1024px) {
          .widget-card { display: none; }
          .feature-large { flex-direction: column; }
          .bento-visual { border-left: none; border-top: 1px solid rgba(255, 255, 255, 0.05); }
        }

        @media (max-width: 768px) {
          .nav-links { display: none; }
          .bento-grid { grid-template-columns: 1fr; }
          .footer-links { gap: 40px; flex-wrap: wrap; }
          .section-block { padding: 80px 24px; }
        }
      `}</style>
    </div>
  );
}
