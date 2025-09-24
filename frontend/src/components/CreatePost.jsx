import React, { useState } from 'react';
import axios from 'axios';

const CreatePost = ({ onPostCreated, onCancel }) => {
  const [formData, setFormData] = useState({
    content: '',
    anonymous: false
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear error when user starts typing
    if (error) setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.content.trim()) {
      setError('Post content is required');
      return;
    }

    if (formData.content.length > 2000) {
      setError('Post content cannot exceed 2000 characters');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const res = await axios.post('/api/posts/create', {
        content: formData.content.trim(),
        anonymous: formData.anonymous
      });

      if (res.data.success) {
        onPostCreated(res.data.data);
        setFormData({ content: '', anonymous: false });
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create post');
      console.error('Create post error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card create-post">
      <h3>Create a Post</h3>
      <form onSubmit={handleSubmit} className="form">
        <div className="form__group">
          <label htmlFor="content">What's on your mind?</label>
          <textarea
            id="content"
            name="content"
            value={formData.content}
            onChange={handleChange}
            placeholder="Share your thoughts, experiences, or ask for support..."
            rows="4"
            maxLength="2000"
            required
          />
          <small className="char-count">
            {formData.content.length}/2000 characters
          </small>
        </div>

        <div className="form__group">
          <label className="checkbox-label">
            <input
              type="checkbox"
              name="anonymous"
              checked={formData.anonymous}
              onChange={handleChange}
            />
            <span className="checkmark"></span>
            Post anonymously
            <small style={{ display: 'block', marginTop: '4px', color: '#718096' }}>
              Your identity will be hidden from other users
            </small>
          </label>
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
            {loading ? 'Posting...' : 'Post'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreatePost;
