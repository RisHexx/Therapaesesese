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
    limit: 20
  });
  const [actionLoading, setActionLoading] = useState(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      
      Object.keys(filters).forEach(key => {
        if (filters[key] && filters[key] !== 'all') {
          params.append(key, filters[key]);
        }
      });

      const res = await axios.get(`/api/admin/users?${params.toString()}`);
      setUsers(res.data.data.users);
      setPagination(res.data.data.pagination);
      setError(null);
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
      page: 1 // Reset to first page when filtering
    }));
  };

  const handlePageChange = (newPage) => {
    setFilters(prev => ({
      ...prev,
      page: newPage
    }));
  };

  const handleBanUser = async (userId, userName) => {
    const reason = prompt(`Enter reason for banning ${userName}:`);
    if (!reason || reason.trim().length === 0) {
      return;
    }

    if (!window.confirm(`Are you sure you want to ban ${userName}?`)) {
      return;
    }

    try {
      setActionLoading(userId);
      await axios.put(`/api/admin/users/${userId}/ban`, { reason: reason.trim() });
      
      // Update user in local state
      setUsers(prev => prev.map(user => 
        user._id === userId 
          ? { ...user, isBanned: true, banReason: reason.trim(), bannedAt: new Date() }
          : user
      ));
      
      alert(`${userName} has been banned successfully.`);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to ban user');
      console.error('Ban user error:', err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleUnbanUser = async (userId, userName) => {
    if (!window.confirm(`Are you sure you want to unban ${userName}?`)) {
      return;
    }

    try {
      setActionLoading(userId);
      await axios.put(`/api/admin/users/${userId}/unban`);
      
      // Update user in local state
      setUsers(prev => prev.map(user => 
        user._id === userId 
          ? { ...user, isBanned: false, banReason: undefined, bannedAt: undefined }
          : user
      ));
      
      alert(`${userName} has been unbanned successfully.`);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to unban user');
      console.error('Unban user error:', err);
    } finally {
      setActionLoading(null);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getRoleBadgeClass = (role) => {
    switch (role) {
      case 'admin': return 'badge--admin';
      case 'therapist': return 'badge--therapist';
      default: return 'badge--user';
    }
  };

  if (loading && users.length === 0) {
    return (
      <div className="users-management">
        <div style={{ textAlign: 'center', padding: '40px' }}>
          Loading users...
        </div>
      </div>
    );
  }

  return (
    <div className="users-management">
      <div className="users-header">
        <h2>Users Management</h2>
        <p>Manage user accounts, roles, and ban status</p>
      </div>

      {/* Filters */}
      <div className="card filters-card">
        <div className="filters-form">
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

          <div className="filter-group">
            <label>Per Page</label>
            <select 
              value={filters.limit} 
              onChange={(e) => handleFilterChange('limit', parseInt(e.target.value))}
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </div>
        </div>
      </div>

      {error && (
        <div className="alert alert--error">
          {error}
          <button 
            className="btn btn--small btn--light" 
            onClick={fetchUsers}
            style={{ marginLeft: '12px' }}
          >
            Retry
          </button>
        </div>
      )}

      {/* Users Table */}
      <div className="card">
        <div className="users-table-container">
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
                <tr key={user._id} className={user.isBanned ? 'user-banned' : ''}>
                  <td>
                    <div className="user-info">
                      <div className="user-details">
                        <div className="user-name">{user.name}</div>
                        <div className="user-email">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className={`badge ${getRoleBadgeClass(user.role)}`}>
                      {user.role}
                    </span>
                  </td>
                  <td>
                    <div className="user-status">
                      {user.isBanned ? (
                        <div>
                          <span className="status-badge status-banned">Banned</span>
                          <div className="ban-info">
                            <small>
                              {user.bannedAt && `Banned: ${formatDate(user.bannedAt)}`}
                            </small>
                            {user.banReason && (
                              <small className="ban-reason">
                                Reason: {user.banReason}
                              </small>
                            )}
                            {user.bannedBy && (
                              <small>
                                By: {user.bannedBy.name}
                              </small>
                            )}
                          </div>
                        </div>
                      ) : (
                        <span className="status-badge status-active">Active</span>
                      )}
                    </div>
                  </td>
                  <td>
                    <span className="join-date">
                      {formatDate(user.createdAt)}
                    </span>
                  </td>
                  <td>
                    <div className="user-actions">
                      {user.role !== 'admin' && (
                        user.isBanned ? (
                          <button
                            className="btn btn--small btn--success"
                            onClick={() => handleUnbanUser(user._id, user.name)}
                            disabled={actionLoading === user._id}
                          >
                            {actionLoading === user._id ? 'Processing...' : 'Unban'}
                          </button>
                        ) : (
                          <button
                            className="btn btn--small btn--danger"
                            onClick={() => handleBanUser(user._id, user.name)}
                            disabled={actionLoading === user._id}
                          >
                            {actionLoading === user._id ? 'Processing...' : 'Ban'}
                          </button>
                        )
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {users.length === 0 && !loading && (
          <div style={{ textAlign: 'center', padding: '40px', color: '#718096' }}>
            No users found matching the current filters.
          </div>
        )}
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="pagination">
          <button
            className="btn btn--light"
            onClick={() => handlePageChange(pagination.currentPage - 1)}
            disabled={!pagination.hasPrev || loading}
          >
            Previous
          </button>
          
          <span className="pagination-info">
            Page {pagination.currentPage} of {pagination.totalPages} 
            ({pagination.totalUsers} total users)
          </span>
          
          <button
            className="btn btn--light"
            onClick={() => handlePageChange(pagination.currentPage + 1)}
            disabled={!pagination.hasNext || loading}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default UsersManagement;
