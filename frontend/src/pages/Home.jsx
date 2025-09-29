import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div>
      {/* Hero Section */}
      <section className="hero">
        <div className="hero__content container">
          <div className="hero__text">
            <h1 className="hero__title">Your mental wellness, simplified.</h1>
            <p className="hero__subtitle">
              Therapease helps you track your mood, journal your thoughts, and connect
              with verified therapists — all in one safe place.
            </p>
            <div className="hero__actions">
              <Link to="/signup" className="btn btn--primary hero__cta">Create free account</Link>
              <Link to="/login" className="btn btn--light">I already have an account</Link>
            </div>
            <div className="hero__meta">
              <span>Secure • Private • Role-based access</span>
            </div>
          </div>
          <div className="hero__visual">
            <div className="hero__card">
              <div className="hero__stat">
                <span className="hero__stat-num">1,200+</span>
                <span className="hero__stat-label">journals created</span>
              </div>
              <div className="hero__stat">
                <span className="hero__stat-num">98%</span>
                <span className="hero__stat-label">report better clarity</span>
              </div>
              <div className="hero__stat">
                <span className="hero__stat-num">150+</span>
                <span className="hero__stat-label">therapists onboard</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features container">
        <div className="features__header">
          <h2>Everything you need to take control</h2>
          <p className="muted">Designed for users, therapists, and admins with the right tools for each role.</p>
        </div>
        <div className="features__grid">
          <div className="feature-card">
            <div className="feature-icon">📝</div>
            <h3>Guided Journaling</h3>
            <p>Capture your thoughts and moods securely. Reflect over time with trends.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🤝</div>
            <h3>Therapist Network</h3>
            <p>Browse verified therapists by specialization and connect with confidence.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🛡️</div>
            <h3>Safe Community</h3>
            <p>Share and learn in a moderated space with flagging and admin tools.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🔐</div>
            <h3>Privacy First</h3>
            <p>Role-based access with secure authentication keeps your data protected.</p>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="hiw container">
        <h2 className="hiw__title">How it works</h2>
        <div className="hiw__steps">
          <div className="step">
            <span className="step__num">1</span>
            <div>
              <h4>Create your account</h4>
              <p>Sign up as a user, therapist, or admin to get the right tools for you.</p>
            </div>
          </div>
          <div className="step">
            <span className="step__num">2</span>
            <div>
              <h4>Start journaling</h4>
              <p>Track moods and write privately. See insights and patterns over time.</p>
            </div>
          </div>
          <div className="step">
            <span className="step__num">3</span>
            <div>
              <h4>Connect & grow</h4>
              <p>Explore the community, find therapists, and continue your journey.</p>
            </div>
          </div>
        </div>
        <div className="hiw__cta">
          <Link to="/signup" className="btn btn--primary">Get started — it’s free</Link>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="cta">
        <div className="cta__content container">
          <h2>Ready to feel better?</h2>
          <p className="muted">Join Therapease and take the first step towards a healthier mind.</p>
          <div className="cta__actions">
            <Link to="/signup" className="btn btn--primary">Create account</Link>
            <Link to="/login" className="btn btn--light">Sign in</Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
