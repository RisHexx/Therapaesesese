import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext.jsx';

const ContactTherapist = ({ therapist, onSuccess, onCancel }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    message: '',
    contactInfo: {
      email: user?.email || '',
      phone: '',
      preferredMethod: 'email'
    }
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name.startsWith('contactInfo.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        contactInfo: {
          ...prev.contactInfo,
          [field]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
    
    // Clear error when user starts typing
    if (error) setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.message.trim()) {
      setError('Please enter a message');
      return;
    }

    if (formData.message.length > 1000) {
      setError('Message cannot exceed 1000 characters');
      return;
    }

    if (!formData.contactInfo.email && !formData.contactInfo.phone) {
      setError('Please provide at least email or phone number');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const payload = {
        message: formData.message.trim(),
        contactInfo: {
          email: formData.contactInfo.email.trim(),
          phone: formData.contactInfo.phone.trim(),
          preferredMethod: formData.contactInfo.preferredMethod
        }
      };

      const res = await axios.post(`/api/therapists/contact/${therapist._id}`, payload);

      if (res.data.success) {
        onSuccess();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send contact request');
      console.error('Contact therapist error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="contact-therapist">
      <div className="contact-header">
        <h3>Contact {therapist.userId?.name || 'Therapist'}</h3>
        <button className="btn btn--light btn--small" onClick={onCancel}>
          ✕
        </button>
      </div>

      <div className="therapist-summary">
        <div className="therapist-basic-info">
          <h4>{therapist.userId?.name}</h4>
          <p>{therapist.experience} years experience</p>
          <div className="specializations-summary">
            {therapist.specialization?.slice(0, 2).map((spec, index) => (
              <span key={index} className="spec-tag">{spec}</span>
            ))}
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="form">
        <div className="form__group">
          <label htmlFor="message">Your Message *</label>
          <textarea
            id="message"
            name="message"
            value={formData.message}
            onChange={handleChange}
            placeholder="Please describe what you're looking for help with, your availability, or any questions you have..."
            rows="5"
            maxLength="1000"
            required
          />
          <small className="char-count">
            {formData.message.length}/1000 characters
          </small>
        </div>

        <div className="contact-info-section">
          <h4>Your Contact Information</h4>
          
          <div className="form__group">
            <label htmlFor="contact-email">Email Address *</label>
            <input
              type="email"
              id="contact-email"
              name="contactInfo.email"
              value={formData.contactInfo.email}
              onChange={handleChange}
              placeholder="your.email@example.com"
              required
            />
          </div>

          <div className="form__group">
            <label htmlFor="contact-phone">Phone Number (Optional)</label>
            <input
              type="tel"
              id="contact-phone"
              name="contactInfo.phone"
              value={formData.contactInfo.phone}
              onChange={handleChange}
              placeholder="(555) 123-4567"
            />
          </div>

          <div className="form__group">
            <label htmlFor="preferred-method">Preferred Contact Method</label>
            <select
              id="preferred-method"
              name="contactInfo.preferredMethod"
              value={formData.contactInfo.preferredMethod}
              onChange={handleChange}
            >
              <option value="email">Email</option>
              <option value="phone">Phone</option>
              <option value="both">Either Email or Phone</option>
            </select>
          </div>
        </div>

        <div className="contact-notice">
          <div className="notice-box">
            <h5>📋 What happens next?</h5>
            <ul>
              <li>Your contact request will be sent directly to the therapist</li>
              <li>They will respond to you using your preferred contact method</li>
              <li>You can discuss scheduling, fees, and treatment approach directly</li>
              <li>All communication after this initial contact is between you and the therapist</li>
            </ul>
          </div>
        </div>

        {error && (
          <div className="alert alert--error">
            {error}
          </div>
        )}

        <div className="form-actions">
          <button
            type="button"
            className="btn btn--light"
            onClick={onCancel}
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn btn--primary"
            disabled={loading || !formData.message.trim()}
          >
            {loading ? 'Sending...' : 'Send Contact Request'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ContactTherapist;
