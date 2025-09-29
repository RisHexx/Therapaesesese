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
    <div className="auth-container-centered">
      <div className="floating-shapes">
        <div className="shape shape-1"></div>
        <div className="shape shape-2"></div>
        <div className="shape shape-3"></div>
        <div className="shape shape-4"></div>
        <div className="shape shape-5"></div>
      </div>
      <div className="auth-card-minimal">
        <div className="auth-header">
          <div className="auth-brand">
            <div className="brand-icon">🧠</div>
            <h1 className="brand-name">Therapease</h1>
          </div>
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

          <button className="btn btn--primary" type="submit" disabled={loading} style={{ width: '100%', padding: '10px', fontSize: '14px' }}>
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <div className="form-footer">
          <p>Don't have an account? <Link to="/signup">Create one here</Link></p>
        </div>
      </div>
    </div>
  );
};

export default Login;
