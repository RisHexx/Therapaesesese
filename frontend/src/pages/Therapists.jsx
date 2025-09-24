import React, { useState, useEffect } from 'react';
import axios from 'axios';
import TherapistCard from '../components/TherapistCard.jsx';
import ContactTherapist from '../components/ContactTherapist.jsx';

const Therapists = () => {
  const [therapists, setTherapists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState({
    specialization: ''
  });
  const [selectedTherapist, setSelectedTherapist] = useState(null);
  const [showContactForm, setShowContactForm] = useState(false);

  const specializations = [
    'Anxiety',
    'Depression',
    'Trauma',
    'Relationship Counseling',
    'Family Therapy',
    'Addiction',
    'Grief Counseling',
    'Stress Management',
    'Cognitive Behavioral Therapy (CBT)',
    'Mindfulness',
    'Child Psychology',
    'Adolescent Counseling'
  ];

  const fetchTherapists = async (page = 1, filterParams = filters) => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: '9'
      });

      if (filterParams.specialization) queryParams.append('specialization', filterParams.specialization);

      const res = await axios.get(`/api/therapists/?${queryParams}`);
      setTherapists(res.data.data.therapists);
      setPagination(res.data.data.pagination);
      setCurrentPage(page);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch therapists');
      console.error('Fetch therapists error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTherapists();
  }, []);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= pagination.totalPages) {
      fetchTherapists(page);
    }
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    setCurrentPage(1);
    fetchTherapists(1, newFilters);
  };

  const clearFilters = () => {
    const clearedFilters = { specialization: '' };
    setFilters(clearedFilters);
    setCurrentPage(1);
    fetchTherapists(1, clearedFilters);
  };

  const handleContactTherapist = (therapist) => {
    setSelectedTherapist(therapist);
    setShowContactForm(true);
  };

  const handleContactSuccess = () => {
    setShowContactForm(false);
    setSelectedTherapist(null);
  };

  const handleContactCancel = () => {
    setShowContactForm(false);
    setSelectedTherapist(null);
  };

  if (loading && therapists.length === 0) {
    return (
      <div className="container">
        <div className="card">
          <div style={{ textAlign: 'center', padding: '40px' }}>
            Loading verified therapists...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="therapists-header">
        <h1>Find a Therapist</h1>
        <p>Connect with verified mental health professionals</p>
      </div>

      {error && (
        <div className="alert alert--error" style={{ marginBottom: '20px' }}>
          {error}
        </div>
      )}

      {/* Filters */}
      <div className="card filters-card">
        <h3>Filter Therapists</h3>
        <div className="filters-form">
          <div className="filter-group">
            <label>Specialization</label>
            <select
              value={filters.specialization}
              onChange={(e) => handleFilterChange({ ...filters, specialization: e.target.value })}
            >
              <option value="">All Specializations</option>
              {specializations.map(spec => (
                <option key={spec} value={spec}>{spec}</option>
              ))}
            </select>
          </div>
          
          
          <button className="btn btn--light" onClick={clearFilters}>
            Clear Filters
          </button>
        </div>
      </div>

      {/* Contact Form Modal */}
      {showContactForm && selectedTherapist && (
        <div className="modal-overlay">
          <div className="modal-content">
            <ContactTherapist
              therapist={selectedTherapist}
              onSuccess={handleContactSuccess}
              onCancel={handleContactCancel}
            />
          </div>
        </div>
      )}

      <div className="therapists-grid">
        {therapists.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '40px', gridColumn: '1 / -1' }}>
            <h3>No therapists found</h3>
            {filters.specialization ? (
              <div>
                <p>Try adjusting your filters to see more results.</p>
                <button className="btn btn--light" onClick={clearFilters}>
                  Clear Filters
                </button>
              </div>
            ) : (
              <p>No verified therapists are currently available.</p>
            )}
          </div>
        ) : (
          therapists.map((therapist) => (
            <TherapistCard
              key={therapist._id}
              therapist={therapist}
              onContact={() => handleContactTherapist(therapist)}
            />
          ))
        )}
      </div>

      {pagination.totalPages > 1 && (
        <div className="pagination">
          <button
            className="btn btn--light"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={!pagination.hasPrevPage}
          >
            Previous
          </button>
          
          <span className="pagination-info">
            Page {pagination.currentPage} of {pagination.totalPages}
          </span>
          
          <button
            className="btn btn--light"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={!pagination.hasNextPage}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default Therapists;
