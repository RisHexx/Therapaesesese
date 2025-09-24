import React, { useState } from 'react';
import axios from 'axios';

const ReplyForm = ({ postId, onReplyAdded, onCancel }) => {
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
      setError('Reply content is required');
      return;
    }

    if (formData.content.length > 1000) {
      setError('Reply content cannot exceed 1000 characters');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const res = await axios.post(`/api/posts/reply/${postId}`, {
        content: formData.content.trim(),
        anonymous: formData.anonymous
      });

      if (res.data.success) {
        onReplyAdded(res.data.data);
        setFormData({ content: '', anonymous: false });
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add reply');
      console.error('Add reply error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="reply-form">
      <h4>Add a Reply</h4>
      <form onSubmit={handleSubmit} className="form">
        <div className="form__group">
          <textarea
            name="content"
            value={formData.content}
            onChange={handleChange}
            placeholder="Write your reply..."
            rows="3"
            maxLength="1000"
            required
          />
          <small className="char-count">
            {formData.content.length}/1000 characters
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
            Reply anonymously
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
            className="btn btn--small btn--light"
            onClick={onCancel}
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn btn--small btn--primary"
            disabled={loading || !formData.content.trim()}
          >
            {loading ? 'Replying...' : 'Reply'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ReplyForm;
