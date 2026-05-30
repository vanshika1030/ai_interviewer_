'use client';
import './landing.css';

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

          </div>
  );
}
