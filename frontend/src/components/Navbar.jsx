import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const goToDashboard = () => {
    if (!user) return;
    if (user.role === 'admin') navigate('/dashboard/admin');
    else if (user.role === 'therapist') navigate('/dashboard/therapist');
    else navigate('/dashboard/user');
  };

  return (
    <nav className="navbar">
      <div className="navbar__brand" onClick={() => navigate('/')}>Therapease</div>
      <div className="navbar__links">
        {!isAuthenticated ? (
          <>
            <Link to="/login" className="btn btn--light">Login</Link>
            <Link to="/signup" className="btn btn--primary">Sign Up</Link>
          </>
        ) : (
          <>
            <Link to="/posts" className="btn btn--light">Posts</Link>
            {/* Only show Journal for regular users */}
            {user?.role === 'user' && (
              <Link to="/journals" className="btn btn--light">Journal</Link>
            )}
            {/* Only show Therapists page for regular users */}
            {user?.role === 'user' && (
              <Link to="/therapists" className="btn btn--light">Therapists</Link>
            )}
            {user?.role === 'admin' && (
              <Link to="/admin" className="btn btn--primary">Admin</Link>
            )}
            <button className="btn btn--light" onClick={goToDashboard}>Dashboard</button>
            <span className="navbar__user">{user?.name} ({user?.role})</span>
            <button className="btn btn--danger" onClick={handleLogout}>Logout</button>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
