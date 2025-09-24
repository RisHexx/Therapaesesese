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
    <div className="container">
      <div className="card card--auth">
        <h2>Create your account</h2>
        <form onSubmit={onSubmit} className="form" style={{ marginTop: 16 }}>
          <div className="form__group">
            <label>Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={onChange}
              required
              placeholder="Your full name"
            />
          </div>

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

          <div className="form__group">
            <label>Role</label>
            <select name="role" value={formData.role} onChange={onChange}>
              <option value="user">Normal User</option>
              <option value="therapist">Therapist</option>
              <option value="admin">Admin</option>
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
                <label>Experience (years)</label>
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

          <button className="btn btn--primary" type="submit" disabled={loading}>
            {loading ? 'Creating account...' : 'Sign Up'}
          </button>
        </form>

        <p style={{ marginTop: 16 }}>
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;
