import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext.jsx';
import ReplyForm from './ReplyForm.jsx';

const PostCard = ({ post, onPostUpdated, onPostDeleted }) => {
  const { user } = useAuth();
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [flagged, setFlagged] = useState(false);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' at ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const handleFlag = async (reason = 'other') => {
    try {
      setLoading(true);
      setError(null);

      const res = await axios.post(`/api/posts/flag/${post._id}`, { reason });
      
      if (res.data.success) {
        setFlagged(true);
        // Update the post with new flag count if needed
        const updatedPost = { ...post, flagCount: res.data.data.flagCount };
        onPostUpdated(updatedPost);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to flag post');
      console.error('Flag post error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this post?')) {
      return;
    }

    try {
      setLoading(true);
      const res = await axios.delete(`/api/posts/${post._id}`);
      
      if (res.data.success) {
        onPostDeleted(post._id);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete post');
      console.error('Delete post error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleReplyAdded = (updatedPost) => {
    onPostUpdated(updatedPost);
    setShowReplyForm(false);
  };

  const canDelete = user?.role === 'admin' || post.authorId._id === user?.id;

  return (
    <div className="card post-card">
      {error && (
        <div className="alert alert--error" style={{ marginBottom: '16px' }}>
          {error}
        </div>
      )}

      <div className="post-header">
        <div className="post-author">
          <div className="author-info">
            <span className="author-name">
              {post.anonymous ? 'Anonymous' : post.authorId.name}
            </span>
            {!post.anonymous && (
              <span className={`role-badge role-badge--${post.authorId.role}`}>
                {post.authorId.role}
              </span>
            )}
          </div>
          <span className="post-date">{formatDate(post.createdAt)}</span>
        </div>

        <div className="post-actions">
          {!flagged && (
            <button
              className="btn btn--small btn--light"
              onClick={() => handleFlag()}
              disabled={loading}
              title="Flag this post"
            >
              🚩 Flag
            </button>
          )}
          
          {canDelete && (
            <button
              className="btn btn--small btn--danger"
              onClick={handleDelete}
              disabled={loading}
              title="Delete post"
            >
              🗑️ Delete
            </button>
          )}
        </div>
      </div>

      <div className="post-content">
        <p>{post.content}</p>
      </div>

      <div className="post-footer">
        <div className="post-stats">
          <span className="stat">
            💬 {post.replyCount} {post.replyCount === 1 ? 'reply' : 'replies'}
          </span>
          {post.flagCount > 0 && user?.role === 'admin' && (
            <span className="stat flag-count">
              🚩 {post.flagCount} {post.flagCount === 1 ? 'flag' : 'flags'}
            </span>
          )}
        </div>

        <button
          className="btn btn--small btn--light"
          onClick={() => setShowReplyForm(!showReplyForm)}
        >
          {showReplyForm ? 'Cancel Reply' : 'Reply'}
        </button>
      </div>

      {showReplyForm && (
        <ReplyForm
          postId={post._id}
          onReplyAdded={handleReplyAdded}
          onCancel={() => setShowReplyForm(false)}
        />
      )}

      {post.replies && post.replies.length > 0 && (
        <div className="replies-section">
          <h4>Replies</h4>
          <div className="replies-list">
            {post.replies.map((reply) => (
              <div key={reply._id} className="reply-card">
                <div className="reply-header">
                  <div className="reply-author">
                    <span className="author-name">
                      {reply.anonymous ? 'Anonymous' : reply.authorId.name}
                    </span>
                    {!reply.anonymous && (
                      <span className={`role-badge role-badge--${reply.authorId.role}`}>
                        {reply.authorId.role}
                      </span>
                    )}
                  </div>
                  <span className="reply-date">{formatDate(reply.createdAt)}</span>
                </div>
                <div className="reply-content">
                  <p>{reply.content}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PostCard;
