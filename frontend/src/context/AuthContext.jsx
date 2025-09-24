import React, { createContext, useContext, useReducer, useEffect } from 'react';
import axios from 'axios';

// Initial state
const initialState = {
  user: null,
  token: localStorage.getItem('token'),
  isAuthenticated: false,
  loading: true,
  error: null
};

// Action types
const AUTH_ACTIONS = {
  USER_LOADED: 'USER_LOADED',
  REGISTER_SUCCESS: 'REGISTER_SUCCESS',
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  AUTH_ERROR: 'AUTH_ERROR',
  LOGOUT: 'LOGOUT',
  CLEAR_ERROR: 'CLEAR_ERROR',
  SET_LOADING: 'SET_LOADING'
};

// Reducer
const authReducer = (state, action) => {
  switch (action.type) {
    case AUTH_ACTIONS.USER_LOADED:
      return {
        ...state,
        isAuthenticated: true,
        loading: false,
        user: action.payload,
        error: null
      };
    case AUTH_ACTIONS.REGISTER_SUCCESS:
    case AUTH_ACTIONS.LOGIN_SUCCESS:
      localStorage.setItem('token', action.payload.token);
      return {
        ...state,
        ...action.payload,
        isAuthenticated: true,
        loading: false,
        error: null
      };
    case AUTH_ACTIONS.AUTH_ERROR:
    case AUTH_ACTIONS.LOGOUT:
      localStorage.removeItem('token');
      return {
        ...state,
        token: null,
        isAuthenticated: false,
        loading: false,
        user: null,
        error: action.payload
      };
    case AUTH_ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        error: null
      };
    case AUTH_ACTIONS.SET_LOADING:
      return {
        ...state,
        loading: action.payload
      };
    default:
      return state;
  }
};

// Create context
const AuthContext = createContext();

// Auth Provider component
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Set auth token in axios headers
  const setAuthToken = (token) => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  };

  // Load user
  const loadUser = async () => {
    const token = localStorage.getItem('token');
    if (token) {
      setAuthToken(token);
    } else {
      // No token, just mark loading as complete
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });
      return;
    }

    try {
      const res = await axios.get('/api/auth/me');
      dispatch({
        type: AUTH_ACTIONS.USER_LOADED,
        payload: res.data.data
      });
    } catch (err) {
      console.error('Load user error:', err);
      // If unauthenticated (401/403), clear token and mark loading complete
      if (err?.response?.status === 401 || err?.response?.status === 403) {
        localStorage.removeItem('token');
        setAuthToken(null);
        dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });
        dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });
      } else {
        dispatch({
          type: AUTH_ACTIONS.AUTH_ERROR,
          payload: err.response?.data?.message || 'Authentication failed'
        });
      }
    }
  };

  // Register user
  const register = async (formData) => {
    const config = {
      headers: {
        'Content-Type': 'application/json'
      }
    };

    try {
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: true });
      const res = await axios.post('/api/auth/register', formData, config);
      
      // Set token in axios headers immediately
      setAuthToken(res.data.token);
      
      dispatch({
        type: AUTH_ACTIONS.REGISTER_SUCCESS,
        payload: res.data
      });

      // Load user data
      await loadUser();
      return { success: true, user: res.data.user };
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Registration failed';
      dispatch({
        type: AUTH_ACTIONS.AUTH_ERROR,
        payload: errorMessage
      });
      return { success: false, error: errorMessage };
    }
  };

  // Login user
  const login = async (formData) => {
    const config = {
      headers: {
        'Content-Type': 'application/json'
      }
    };

    try {
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: true });
      const res = await axios.post('/api/auth/login', formData, config);
      
      // Set token in axios headers immediately
      setAuthToken(res.data.token);
      
      dispatch({
        type: AUTH_ACTIONS.LOGIN_SUCCESS,
        payload: res.data
      });

      // Load user data
      await loadUser();
      return { success: true, user: res.data.user };
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Login failed';
      dispatch({
        type: AUTH_ACTIONS.AUTH_ERROR,
        payload: errorMessage
      });
      return { success: false, error: errorMessage };
    }
  };

  // Logout
  const logout = async () => {
    try {
      await axios.get('/api/auth/logout');
    } catch (err) {
      console.error('Logout error:', err);
    }
    
    // Clear token from axios headers
    setAuthToken(null);
    dispatch({ type: AUTH_ACTIONS.LOGOUT });
  };

  // Clear errors
  const clearError = () => {
    dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });
  };

  useEffect(() => {
    // Set token in axios headers on app initialization
    const token = localStorage.getItem('token');
    if (token) {
      setAuthToken(token);
    }
    loadUser();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        ...state,
        register,
        login,
        logout,
        clearError,
        loadUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
