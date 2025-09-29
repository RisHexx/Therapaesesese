import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const Signup = () => {
  const { register, error, clearError, loading } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'user',
    specialization: '',
    licenseNumber: '',
    experience: ''
  });

  const onChange = (e) => {
    if (error) clearError();
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    const payload = { ...formData };
    if (payload.role !== 'therapist') {
      delete payload.specialization;
      delete payload.licenseNumber;
      delete payload.experience;
    } else {
      payload.experience = Number(payload.experience || 0);
    }

    const res = await register(payload);
    if (res.success) {
      // Redirect based on role
      const role = res.user?.role || 'user';
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
          <h1>Join the Therapease community</h1>
          <p>Start your mental wellness journey today. Connect with professionals, track your progress, and find the support you need.</p>
          
          <div className="auth-features">
            <div className="auth-feature">
              <div className="auth-feature-icon">✨</div>
              <span>Personalized wellness dashboard</span>
            </div>
            <div className="auth-feature">
              <div className="auth-feature-icon">🎯</div>
              <span>Goal tracking and insights</span>
            </div>
            <div className="auth-feature">
              <div className="auth-feature-icon">🤝</div>
              <span>Professional therapist network</span>
            </div>
            <div className="auth-feature">
              <div className="auth-feature-icon">📱</div>
              <span>Mobile-friendly experience</span>
            </div>
          </div>
        </div>
      </div>

      {/* Form Side */}
      <div className="auth-content">
        <div className="auth-card">
          <div className="auth-header">
            <h2>Create your account</h2>
            {/* <p>Get started with your free Therapease account</p> */}
          </div>


          <form onSubmit={onSubmit} className="form">
            <div className="form__group">
              <label>Full Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={onChange}
                required
                placeholder="Enter your full name"
              />
            </div>

            <div className="form__group">
              <label>Email Address</label>
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
                placeholder="Create a strong password"
              />
            </div>

            <div className="form__group">
              <label>Account Type</label>
              <select name="role" value={formData.role} onChange={onChange}>
                <option value="user">Individual User</option>
                <option value="therapist">Licensed Therapist</option>
                <option value="admin">Administrator</option>
              </select>
            </div>

            {formData.role === 'therapist' && (
              <div className="grid-2">
                <div className="form__group">
                  <label>Specialization</label>
                  <input
                    type="text"
                    name="specialization"
                    value={formData.specialization}
                    onChange={onChange}
                    placeholder="e.g. CBT, Anxiety, Depression"
                    required={formData.role === 'therapist'}
                  />
                </div>
                <div className="form__group">
                  <label>License Number</label>
                  <input
                    type="text"
                    name="licenseNumber"
                    value={formData.licenseNumber}
                    onChange={onChange}
                    placeholder="Your license ID"
                    required={formData.role === 'therapist'}
                  />
                </div>
                <div className="form__group">
                  <label>Years of Experience</label>
                  <input
                    type="number"
                    name="experience"
                    min="0"
                    max="50"
                    value={formData.experience}
                    onChange={onChange}
                    placeholder="0"
                    required={formData.role === 'therapist'}
                  />
                </div>
              </div>
            )}

            {error && <div className="alert alert--error">{error}</div>}

            <button className="btn btn--primary" type="submit" disabled={loading} style={{ width: '100%', padding: '12px' }}>
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <div className="form-footer">
            <p>Already have an account? <Link to="/login">Sign in here</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
