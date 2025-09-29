import React, { useState, useEffect } from 'react';
import axios from 'axios';

const UsersManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({});
  const [filters, setFilters] = useState({
    role: 'all',
    status: 'all',
    search: '',
    page: 1,
    limit: 15
  });
  const [actionLoading, setActionLoading] = useState(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams();
      
      Object.keys(filters).forEach(key => {
        if (filters[key] && filters[key] !== 'all') {
          params.append(key, filters[key]);
        }
      });

      const res = await axios.get(`/api/admin/users?${params.toString()}`);
      setUsers(res.data.data.users || []);
      setPagination(res.data.data.pagination || {});
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch users');
      console.error('Fetch users error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [filters]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1
    }));
  };

  const handleUserAction = async (userId, action, reason = '') => {
    try {
      setActionLoading(userId);
      setError(null);

      const payload = { action };
      if (reason) payload.reason = reason;

      const res = await axios.put(`/api/admin/users/${userId}/action`, payload);
      
      if (res.data.success) {
        // Update user in local state
        setUsers(prev => prev.map(user => 
          user._id === userId 
            ? { ...user, status: action === 'ban' ? 'banned' : 'active' }
            : user
        ));
      }
    } catch (err) {
      setError(err.response?.data?.message || `Failed to ${action} user`);
      console.error(`${action} user error:`, err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleBanUser = (userId, userName) => {
    const reason = prompt(`Reason for banning ${userName}:`);
    if (reason !== null) {
      handleUserAction(userId, 'ban', reason);
    }
  };

  const handleUnbanUser = (userId) => {
    if (window.confirm('Are you sure you want to unban this user?')) {
      handleUserAction(userId, 'unban');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin': return 'red';
      case 'therapist': return 'green';
      case 'user': return 'blue';
      default: return 'gray';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'green';
      case 'banned': return 'red';
      case 'pending': return 'orange';
      default: return 'gray';
    }
  };

  const handlePageChange = (newPage) => {
    setFilters(prev => ({
      ...prev,
      page: newPage
    }));
  };

  if (loading) {
    return (
      <div className="admin-section">
        <div className="loading-state">
          <div className="loading-spinner">👥</div>
          <p>Loading users...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-section">
        <div className="error-state">
          <div className="error-icon">⚠️</div>
          <h3>Failed to Load Users</h3>
          <p>{error}</p>
          <button className="btn btn--primary" onClick={fetchUsers}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-section">
      <div className="admin-header">
        <h2>Users Management</h2>
        <p>Manage platform users, roles, and permissions</p>
      </div>

      {/* Filters */}
      <div className="users-filters">
        <div className="filter-group">
          <label>Role</label>
          <select 
            value={filters.role} 
            onChange={(e) => handleFilterChange('role', e.target.value)}
          >
            <option value="all">All Roles</option>
            <option value="user">Users</option>
            <option value="therapist">Therapists</option>
            <option value="admin">Admins</option>
          </select>
        </div>

        <div className="filter-group">
          <label>Status</label>
          <select 
            value={filters.status} 
            onChange={(e) => handleFilterChange('status', e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="banned">Banned</option>
            <option value="pending">Pending</option>
          </select>
        </div>

        <div className="filter-group">
          <label>Search</label>
          <input
            type="text"
            placeholder="Search by name or email..."
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
          />
        </div>

        <button className="btn btn--light" onClick={fetchUsers}>
          🔄 Refresh
        </button>
      </div>

      {/* Users Table */}
      <div className="users-table-container">
        {users.length === 0 ? (
          <div className="empty-state">
            <h3>No users found</h3>
            <p>Try adjusting your filters or check back later.</p>
          </div>
        ) : (
          <table className="users-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Role</th>
                <th>Status</th>
                <th>Joined</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user._id}>
                  <td>
                    <div className="user-info">
                      <div className="user-name">{user.name}</div>
                      <div className="user-email">{user.email}</div>
                    </div>
                  </td>
                  <td>
                    <span className={`badge badge--${getRoleColor(user.role)}`}>
                      {user.role}
                    </span>
                  </td>
                  <td>
                    <span className={`badge badge--${getStatusColor(user.status || (user.isBanned ? 'banned' : 'active'))}`}>
                      {user.status || (user.isBanned ? 'banned' : 'active')}
                    </span>
                  </td>
                  <td>{formatDate(user.createdAt)}</td>
                  <td>
                    <div className="user-actions">
                      {user.isBanned ? (
                        <button
                          className="btn btn--small btn--success"
                          onClick={() => handleUnbanUser(user._id)}
                          disabled={actionLoading === user._id}
                        >
                          {actionLoading === user._id ? 'Processing...' : 'Unban'}
                        </button>
                      ) : (
                        <button
                          className="btn btn--small btn--danger"
                          onClick={() => handleBanUser(user._id, user.name)}
                          disabled={actionLoading === user._id || user.role === 'admin'}
                        >
                          {actionLoading === user._id ? 'Processing...' : 'Ban'}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="pagination">
          <button
            className="btn btn--light"
            onClick={() => handlePageChange(pagination.currentPage - 1)}
            disabled={!pagination.hasPrevPage}
          >
            Previous
          </button>
          
          <span className="pagination-info">
            Page {pagination.currentPage} of {pagination.totalPages}
          </span>
          
          <button
            className="btn btn--light"
            onClick={() => handlePageChange(pagination.currentPage + 1)}
            disabled={!pagination.hasNextPage}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default UsersManagement;
