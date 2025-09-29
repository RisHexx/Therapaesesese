import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const Login = () => {
  const { login, error, clearError, loading, user } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const onChange = (e) => {
    if (error) clearError();
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Clear any previous auth error when landing on the login page
  useEffect(() => {
    if (error) clearError();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onSubmit = async (e) => {
    e.preventDefault();
    const res = await login(formData);
    if (res.success) {
      const role = res.user?.role || user?.role || 'user';
      if (role === 'admin') navigate('/dashboard/admin');
      else if (role === 'therapist') navigate('/dashboard/therapist');
      else navigate('/dashboard/user');
    }
  };

  return (
    <div className="auth-container">
      {/* Visual Side */}
      <div className="auth-visual">
        <div className="auth-visual-content">
          <h1>Welcome back to Therapease</h1>
          <p>Continue your journey towards better mental wellness. Access your personalized dashboard and connect with your support network.</p>
          
          <div className="auth-features">
            <div className="auth-feature">
              <div className="auth-feature-icon">📊</div>
              <span>Track your progress and mood patterns</span>
            </div>
            <div className="auth-feature">
              <div className="auth-feature-icon">💬</div>
              <span>Connect with verified therapists</span>
            </div>
            <div className="auth-feature">
              <div className="auth-feature-icon">🔒</div>
              <span>Your data is secure and private</span>
            </div>
          </div>
        </div>
      </div>

      {/* Form Side */}
      <div className="auth-content">
        <div className="auth-card">
          <div className="auth-header">
            <h2>Sign in to your account</h2>
            <p>Enter your credentials to access your dashboard</p>
          </div>


          <form onSubmit={onSubmit} className="form">
            <div className="form__group">
              <label>Email address</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={onChange}
                required
                placeholder="Enter your email"
              />
            </div>
            <div className="form__group">
              <label>Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={onChange}
                required
                placeholder="Enter your password"
              />
            </div>

            {error && <div className="alert alert--error">{error}</div>}

            <button className="btn btn--primary" type="submit" disabled={loading} style={{ width: '100%', padding: '12px' }}>
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          <div className="form-footer">
            <p>Don't have an account? <Link to="/signup">Create one here</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
