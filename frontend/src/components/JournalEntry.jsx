import React, { useState } from 'react';
import axios from 'axios';

const JournalEntry = ({ journal, onJournalUpdated, onJournalDeleted }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    title: journal.title || '',
    content: journal.content,
    mood: journal.mood,
    tags: journal.tags ? journal.tags.join(', ') : ''
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

  const getMoodDisplay = (mood) => {
    const moodOption = moodOptions.find(m => m.value === mood);
    return moodOption ? moodOption.label : mood;
  };

  const getMoodColor = (mood) => {
    const moodOption = moodOptions.find(m => m.value === mood);
    return moodOption ? moodOption.color : '#a0aec0';
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleEdit = () => {
    setIsEditing(true);
    setError(null);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditData({
      title: journal.title || '',
      content: journal.content,
      mood: journal.mood,
      tags: journal.tags ? journal.tags.join(', ') : ''
    });
    setError(null);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditData(prev => ({
      ...prev,
      [name]: value
    }));
    if (error) setError(null);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    
    if (!editData.content.trim()) {
      setError('Journal content is required');
      return;
    }

    if (editData.content.length > 5000) {
      setError('Journal content cannot exceed 5000 characters');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const payload = {
        content: editData.content.trim(),
        mood: editData.mood
      };

      if (editData.title.trim()) {
        payload.title = editData.title.trim();
      }

      if (editData.tags.trim()) {
        payload.tags = editData.tags.split(',').map(tag => tag.trim()).filter(tag => tag);
      } else {
        payload.tags = [];
      }

      const res = await axios.put(`/api/journals/${journal._id}`, payload);

      if (res.data.success) {
        onJournalUpdated(res.data.data);
        setIsEditing(false);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update journal entry');
      console.error('Update journal error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this journal entry? This action cannot be undone.')) {
      return;
    }

    try {
      setLoading(true);
      const res = await axios.delete(`/api/journals/${journal._id}`);
      
      if (res.data.success) {
        onJournalDeleted(journal._id);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete journal entry');
      console.error('Delete journal error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (isEditing) {
    return (
      <div className="card journal-entry editing">
        <h3>Edit Journal Entry</h3>
        <form onSubmit={handleUpdate} className="form">
          <div className="form__group">
            <label htmlFor="edit-title">Title (Optional)</label>
            <input
              type="text"
              id="edit-title"
              name="title"
              value={editData.title}
              onChange={handleEditChange}
              placeholder="Give your entry a title..."
              maxLength="100"
            />
          </div>

          <div className="form__group">
            <label htmlFor="edit-mood">How are you feeling?</label>
            <div className="mood-selector">
              {moodOptions.map((mood) => (
                <label
                  key={mood.value}
                  className={`mood-option ${editData.mood === mood.value ? 'selected' : ''}`}
                  style={{ borderColor: editData.mood === mood.value ? mood.color : '#e2e8f0' }}
                >
                  <input
                    type="radio"
                    name="mood"
                    value={mood.value}
                    checked={editData.mood === mood.value}
                    onChange={handleEditChange}
                  />
                  <span>{mood.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="form__group">
            <label htmlFor="edit-content">Content</label>
            <textarea
              id="edit-content"
              name="content"
              value={editData.content}
              onChange={handleEditChange}
              rows="8"
              maxLength="5000"
              required
            />
            <small className="char-count">
              {editData.content.length}/5000 characters
            </small>
          </div>

          <div className="form__group">
            <label htmlFor="edit-tags">Tags (Optional)</label>
            <input
              type="text"
              id="edit-tags"
              name="tags"
              value={editData.tags}
              onChange={handleEditChange}
              placeholder="work, family, health, goals (separate with commas)"
            />
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
              onClick={handleCancelEdit}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn--primary"
              disabled={loading || !editData.content.trim()}
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="card journal-entry">
      {error && (
        <div className="alert alert--error" style={{ marginBottom: '16px' }}>
          {error}
        </div>
      )}

      <div className="journal-header">
        <div className="journal-date-info">
          <h3>{journal.title || `Journal Entry - ${formatDate(journal.date)}`}</h3>
          <div className="journal-meta">
            <span className="journal-date">{formatDate(journal.date)}</span>
            <span className="journal-time">at {formatTime(journal.createdAt)}</span>
            <span 
              className="mood-badge"
              style={{ backgroundColor: getMoodColor(journal.mood), color: 'white' }}
            >
              {getMoodDisplay(journal.mood)}
            </span>
          </div>
        </div>

        <div className="journal-actions">
          <button
            className="btn btn--small btn--light"
            onClick={handleEdit}
            disabled={loading}
            title="Edit entry"
          >
            ✏️ Edit
          </button>
          
          <button
            className="btn btn--small btn--danger"
            onClick={handleDelete}
            disabled={loading}
            title="Delete entry"
          >
            🗑️ Delete
          </button>
        </div>
      </div>

      <div className="journal-content">
        <p>{journal.content}</p>
      </div>

      {journal.tags && journal.tags.length > 0 && (
        <div className="journal-tags">
          {journal.tags.map((tag, index) => (
            <span key={index} className="tag">
              #{tag}
            </span>
          ))}
        </div>
      )}

      <div className="journal-footer">
        <small className="journal-timestamp">
          {journal.createdAt !== journal.updatedAt && 'Last updated: '}
          {journal.createdAt !== journal.updatedAt ? formatDate(journal.updatedAt) + ' at ' + formatTime(journal.updatedAt) : ''}
        </small>
      </div>
    </div>
  );
};

export default JournalEntry;
