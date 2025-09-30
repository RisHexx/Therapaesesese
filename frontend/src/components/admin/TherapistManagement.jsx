import React, { useState, useEffect } from 'react';
import axios from 'axios';

const TherapistManagement = () => {
  const [therapists, setTherapists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTherapist, setSelectedTherapist] = useState(null);
  const [showContactForm, setShowContactForm] = useState(false);
  const [contactForm, setContactForm] = useState({
    message: '',
    email: '',
    phone: '',
    preferredMethod: 'email'
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchTherapists = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch all verified therapists
      const response = await axios.get('/api/therapists');
      
      if (response.data.success) {
        const allTherapists = response.data.data || [];
        // Filter for verified therapists only
        const verifiedTherapists = allTherapists.filter(therapist => 
          therapist.verified === true && therapist.isActive !== false
        );
        setTherapists(verifiedTherapists);
      } else {
        setTherapists([]);
      }
      
    } catch (err) {
      console.error('Error fetching therapists:', err);
      if (err.response?.status >= 500) {
        setError('Server error while fetching therapists');
      } else if (err.response?.status === 404) {
        setError('Therapists endpoint not found');
      } else if (err.code === 'NETWORK_ERROR' || err.message.includes('Network Error')) {
        setError('Unable to connect to server. Please check if the backend is running.');
      } else {
        setError(err.response?.data?.message || 'Failed to fetch therapists');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTherapists();
  }, []);

  const handleContactTherapist = (therapist) => {
    setSelectedTherapist(therapist);
    setShowContactForm(true);
    setContactForm({
      message: '',
      email: '',
      phone: '',
      preferredMethod: 'email'
    });
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setContactForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmitContact = async (e) => {
    e.preventDefault();
    
    if (!selectedTherapist || !selectedTherapist._id) {
      alert('Error: No therapist selected');
      return;
    }
    
    if (!contactForm.message.trim()) {
      alert('Please enter a message');
      return;
    }

    if (!contactForm.email && !contactForm.phone) {
      alert('Please provide at least email or phone contact information');
      return;
    }

    try {
      setSubmitting(true);
      
      const contactData = {
        message: contactForm.message.trim(),
        contactInfo: {
          email: contactForm.email || '',
          phone: contactForm.phone || '',
          preferredMethod: contactForm.preferredMethod
        }
      };

      const response = await axios.post(
        `/api/therapists/contact/${selectedTherapist._id}`,
        contactData
      );

      if (response.data.success) {
        alert('Contact request sent successfully!');
        setShowContactForm(false);
        setSelectedTherapist(null);
        setContactForm({
          message: '',
          email: '',
          phone: '',
          preferredMethod: 'email'
        });
      } else {
        throw new Error('Failed to send contact request');
      }

    } catch (err) {
      console.error('Error sending contact request:', err);
      const errorMessage = err.response?.data?.message || 'Failed to send contact request';
      alert(`Error: ${errorMessage}`);
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateString) => {
    try {
      if (!dateString) return 'Unknown date';
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      return 'Invalid date';
    }
  };

  if (loading) {
    return (
      <div className="admin-section">
        <div className="loading-state">
          <div className="loading-spinner">👨‍⚕️</div>
          <p>Loading therapists...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-section">
        <div className="error-state">
          <div className="error-icon">⚠️</div>
          <h3>Failed to Load Therapists</h3>
          <p>{error}</p>
          <button className="btn btn--primary" onClick={fetchTherapists}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-section">
      <div className="admin-header">
        <div>
          <h2>Therapist Management</h2>
          <p>Manage and contact verified therapists</p>
        </div>
        <button className="btn btn--light" onClick={fetchTherapists}>
          🔄 Refresh
        </button>
      </div>

      {therapists.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">👨‍⚕️</div>
          <h3>No Verified Therapists</h3>
          <p>No verified therapists are currently available in the system.</p>
        </div>
      ) : (
        <div className="therapists-grid">
          {therapists.map((therapist) => {
            // Safety check to prevent errors
            if (!therapist || !therapist._id) return null;
            
            return (
              <div key={therapist._id} className="therapist-card">
                <div className="therapist-header">
                  <div className="therapist-info">
                    <h3>{therapist.userId?.name || 'Unknown Therapist'}</h3>
                    <p className="therapist-email">{therapist.userId?.email || 'No email provided'}</p>
                    <p className="therapist-joined">
                      Joined: {therapist.createdAt ? formatDate(therapist.createdAt) : 'Unknown date'}
                    </p>
                  </div>
                  <div className="therapist-status">
                    <span className="status-badge verified">
                      ✅ Verified
                    </span>
                  </div>
                </div>

              <div className="therapist-details">
                <div className="detail-row">
                  <strong>Specialization:</strong>
                  <span>{Array.isArray(therapist.specialization) 
                    ? therapist.specialization.join(', ') 
                    : therapist.specialization || 'Not specified'}</span>
                </div>
                <div className="detail-row">
                  <strong>License:</strong>
                  <span>{therapist.licenseNumber || 'Not provided'}</span>
                </div>
                <div className="detail-row">
                  <strong>Experience:</strong>
                  <span>{therapist.experience || 0} years</span>
                </div>
                {therapist.rating && (
                  <div className="detail-row">
                    <strong>Rating:</strong>
                    <span>⭐ {therapist.rating.average?.toFixed(1) || 'N/A'} ({therapist.rating.count || 0} reviews)</span>
                  </div>
                )}
              </div>

                <div className="therapist-actions">
                  <button
                    className="btn btn--primary btn--small"
                    onClick={() => handleContactTherapist(therapist)}
                  >
                    📧 Contact Therapist
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Contact Form Modal */}
      {showContactForm && selectedTherapist && (
        <div className="modal-overlay" onClick={() => setShowContactForm(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Contact {selectedTherapist.userId?.name}</h3>
              <button 
                className="modal-close"
                onClick={() => setShowContactForm(false)}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitContact} className="contact-form">
              <div className="form-group">
                <label htmlFor="message">Message *</label>
                <textarea
                  id="message"
                  name="message"
                  value={contactForm.message}
                  onChange={handleFormChange}
                  placeholder="Enter your message to the therapist..."
                  rows="4"
                  maxLength="1000"
                  required
                />
                <small>{contactForm.message.length}/1000 characters</small>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="email">Email</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={contactForm.email}
                    onChange={handleFormChange}
                    placeholder="your.email@example.com"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="phone">Phone</label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={contactForm.phone}
                    onChange={handleFormChange}
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="preferredMethod">Preferred Contact Method</label>
                <select
                  id="preferredMethod"
                  name="preferredMethod"
                  value={contactForm.preferredMethod}
                  onChange={handleFormChange}
                >
                  <option value="email">Email</option>
                  <option value="phone">Phone</option>
                  <option value="either">Either</option>
                </select>
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  className="btn btn--light"
                  onClick={() => setShowContactForm(false)}
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn--primary"
                  disabled={submitting}
                >
                  {submitting ? 'Sending...' : 'Send Message'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TherapistManagement;
