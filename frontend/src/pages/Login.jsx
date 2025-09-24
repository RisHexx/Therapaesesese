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
    <div className="container">
      <div className="card card--auth">
        <h2>Login</h2>
        <form onSubmit={onSubmit} className="form" style={{ marginTop: 16 }}>
          <div className="form__group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={onChange}
              required
              placeholder="you@example.com"
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
              placeholder="••••••••"
            />
          </div>

          {error && <div className="alert alert--error">{error}</div>}

          <button className="btn btn--primary" type="submit" disabled={loading}>
            {loading ? 'Signing in...' : 'Login'}
          </button>
        </form>

        <p style={{ marginTop: 16 }}>
          Don't have an account? <Link to="/signup">Sign up</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
