import React, { useState } from 'react';
import axios from 'axios';

const CreateJournal = ({ onJournalCreated, onCancel }) => {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    mood: 'neutral',
    tags: '',
    date: new Date().toISOString().split('T')[0] // Today's date
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const moodOptions = [
    { value: 'very-good', label: 'Very Good 😊', color: '#48bb78' },
    { value: 'good', label: 'Good 🙂', color: '#68d391' },
    { value: 'neutral', label: 'Neutral 😐', color: '#a0aec0' },
    { value: 'bad', label: 'Bad 😞', color: '#fc8181' },
    { value: 'very-bad', label: 'Very Bad 😢', color: '#f56565' }
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (error) setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.content.trim()) {
      setError('Journal content is required');
      return;
    }

    if (formData.content.length > 5000) {
      setError('Journal content cannot exceed 5000 characters');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const payload = {
        content: formData.content.trim(),
        mood: formData.mood,
        date: formData.date
      };

      if (formData.title.trim()) {
        payload.title = formData.title.trim();
      }

      if (formData.tags.trim()) {
        payload.tags = formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag);
      }

      const res = await axios.post('/api/journals/create', payload);

      if (res.data.success) {
        onJournalCreated(res.data.data);
        setFormData({
          title: '',
          content: '',
          mood: 'neutral',
          tags: '',
          date: new Date().toISOString().split('T')[0]
        });
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create journal entry');
      console.error('Create journal error:', err);
    } finally {
      setLoading(false);
    }
  };

  const selectedMood = moodOptions.find(mood => mood.value === formData.mood);

  return (
    <div className="card create-journal">
      <h3>New Journal Entry</h3>
      <form onSubmit={handleSubmit} className="form">
        <div className="form__group">
          <label htmlFor="date">Date</label>
          <input
            type="date"
            id="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            max={new Date().toISOString().split('T')[0]}
            required
          />
        </div>

        <div className="form__group">
          <label htmlFor="title">Title (Optional)</label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Give your entry a title..."
            maxLength="100"
          />
        </div>

        <div className="form__group">
          <label htmlFor="mood">How are you feeling?</label>
          <div className="mood-selector">
            {moodOptions.map((mood) => (
              <label
                key={mood.value}
                className={`mood-option ${formData.mood === mood.value ? 'selected' : ''}`}
                style={{ borderColor: formData.mood === mood.value ? mood.color : '#e2e8f0' }}
              >
                <input
                  type="radio"
                  name="mood"
                  value={mood.value}
                  checked={formData.mood === mood.value}
                  onChange={handleChange}
                />
                <span>{mood.label}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="form__group">
          <label htmlFor="content">What's on your mind?</label>
          <textarea
            id="content"
            name="content"
            value={formData.content}
            onChange={handleChange}
            placeholder="Write about your day, thoughts, feelings, or anything you'd like to remember..."
            rows="8"
            maxLength="5000"
            required
          />
          <small className="char-count">
            {formData.content.length}/5000 characters
          </small>
        </div>

        <div className="form__group">
          <label htmlFor="tags">Tags (Optional)</label>
          <input
            type="text"
            id="tags"
            name="tags"
            value={formData.tags}
            onChange={handleChange}
            placeholder="work, family, health, goals (separate with commas)"
          />
          <small>Use tags to categorize and find your entries later</small>
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
            disabled={loading || !formData.content.trim()}
          >
            {loading ? 'Saving...' : 'Save Entry'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateJournal;
