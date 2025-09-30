import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const Signup = () => {
  const { register, logout, error, clearError, loading } = useAuth();
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
      const role = res.user?.role || 'user';
      
      // Handle therapist verification flow
      if (role === 'therapist') {
        // Check if therapist account is verified
        if (res.user?.isVerified === false) {
          // Clear form and logout the user before redirecting
          setFormData({ name: '', email: '', password: '', role: 'user', specialization: '', licenseNumber: '', experience: '' });
          
          // Logout the user to prevent them from being logged in while unverified
          await logout();
          
          // Redirect to pending verification page
          navigate('/therapist-pending');
          return;
        }
        navigate('/dashboard/therapist');
      } else if (role === 'admin') {
        navigate('/dashboard/admin');
      } else {
        navigate('/dashboard/user');
      }
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
          <h2>Create your account</h2>
          <p>Get started with your free Therapease account</p>
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
            <div className="therapist-fields">
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

          <button className="btn btn--primary" type="submit" disabled={loading} style={{ width: '100%', padding: '10px', fontSize: '14px' }}>
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <div className="form-footer">
          <p>Already have an account? <Link to="/login">Sign in here</Link></p>
        </div>
      </div>
    </div>
  );
};

export default Signup;
