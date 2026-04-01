/**
 * Authentication Service
 * Handles user registration, login, and authentication
 * Uses MongoDB backend API
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

/**
 * Get auth token from localStorage
 */
const getToken = () => {
  return localStorage.getItem('geep_token');
};

/**
 * Set auth token in localStorage
 */
const setToken = (token) => {
  if (token) {
    localStorage.setItem('geep_token', token);
  } else {
    localStorage.removeItem('geep_token');
  }
};

/**
 * Make API request with authentication
 */
const apiRequest = async (endpoint, options = {}) => {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.error?.message || data.message || 'An error occurred'
      };
    }

    return {
      success: true,
      ...data
    };
  } catch (error) {
    console.error('API request error:', error);
    return {
      success: false,
      error: error.message || 'Network error. Please check if the server is running.'
    };
  }
};

/**
 * Check if email is already registered
 */
export const checkUserExists = async (email) => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/check-email?email=${encodeURIComponent(email)}`);
    const data = await response.json();
    return data.exists || false;
  } catch (error) {
    console.error('Check email error:', error);
    return false;
  }
};

/**
 * Register a new user
 */
export const registerUser = async (userData) => {
  try {
    // ✅ FIX: classLevel is now properly destructured from userData
    const { name, email, password, role, classLevel } = userData;

    // Validation
    if (!name || !email || !password) {
      return {
        success: false,
        error: 'Please fill in all required fields'
      };
    }

    if (password.length < 6) {
      return {
        success: false,
        error: 'Password must be at least 6 characters'
      };
    }

    // ✅ FIX: Ensure classLevel is always a clean number, never a DOM node or string
    const cleanClassLevel = classLevel !== undefined && classLevel !== ''
      ? parseInt(classLevel.toString(), 10)
      : undefined;

    // Make API call to register
    const result = await apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        name: name.trim(),
        email: email.toLowerCase().trim(),
        password,
        role: role || 'student',
        classLevel: cleanClassLevel
      })
    });

    if (result.success && result.token) {
      setToken(result.token);
      return {
        success: true,
        user: result.user,
        token: result.token,
        message: result.message || 'Registration successful!'
      };
    }

    return result;
  } catch (error) {
    console.error('Registration error:', error);
    return {
      success: false,
      error: 'An error occurred during registration. Please try again.'
    };
  }
};

/**
 * Login user
 */
export const loginUser = async (email, password) => {
  try {
    if (!email || !password) {
      return {
        success: false,
        error: 'Please fill in all fields'
      };
    }

    const result = await apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: email.toLowerCase().trim(),
        password
      })
    });

    if (result.success && result.token) {
      setToken(result.token);
      return {
        success: true,
        user: result.user,
        token: result.token,
        message: result.message || 'Login successful!'
      };
    }

    return result;
  } catch (error) {
    console.error('Login error:', error);
    return {
      success: false,
      error: 'An error occurred during login. Please try again.'
    };
  }
};

/**
 * Get user by ID (for profile updates)
 */
export const getUserById = async (id) => {
  try {
    const result = await apiRequest(`/users/${id}`);
    if (result.success) {
      return result.user;
    }
    return null;
  } catch (error) {
    console.error('Get user error:', error);
    return null;
  }
};

/**
 * Get current user profile
 */
export const getCurrentUser = async () => {
  try {
    const result = await apiRequest('/users/me');
    if (result.success) {
      return result.user;
    }
    return null;
  } catch (error) {
    console.error('Get current user error:', error);
    return null;
  }
};

/**
 * Update user profile
 */
export const updateUserProfile = async (userId, updates) => {
  try {
    const result = await apiRequest('/users/me', {
      method: 'PUT',
      body: JSON.stringify(updates)
    });

    if (result.success) {
      return {
        success: true,
        user: result.user,
        message: result.message || 'Profile updated successfully!'
      };
    }

    return result;
  } catch (error) {
    console.error('Update profile error:', error);
    return {
      success: false,
      error: 'An error occurred. Please try again.'
    };
  }
};

/**
 * Change user password
 */
export const changePassword = async (userId, currentPassword, newPassword) => {
  try {
    if (newPassword.length < 6) {
      return {
        success: false,
        error: 'Password must be at least 6 characters'
      };
    }

    const result = await apiRequest('/users/me/password', {
      method: 'PUT',
      body: JSON.stringify({ currentPassword, newPassword })
    });

    return result;
  } catch (error) {
    console.error('Change password error:', error);
    return {
      success: false,
      error: 'An error occurred. Please try again.'
    };
  }
};

/**
 * Complete a task
 */
export const completeTask = async (taskId, taskInfo) => {
  try {
    const result = await apiRequest('/tasks/complete', {
      method: 'POST',
      body: JSON.stringify(taskInfo || { taskId })
    });

    return result;
  } catch (error) {
    console.error('Complete task error:', error);
    return {
      success: false,
      error: 'An error occurred while completing the task. Please try again.'
    };
  }
};

/**
 * Award a badge
 */
export const awardBadge = async (badgeId, badgeInfo) => {
  try {
    const result = await apiRequest('/tasks/badge', {
      method: 'POST',
      body: JSON.stringify(badgeInfo || { badgeId })
    });

    return result;
  } catch (error) {
    console.error('Award badge error:', error);
    return {
      success: false,
      error: 'An error occurred while awarding the badge. Please try again.'
    };
  }
};

/**
 * Complete a lesson
 */
export const completeLesson = async (lessonId, lessonData) => {
  try {
    const result = await apiRequest('/users/me/complete-lesson', {
      method: 'POST',
      body: JSON.stringify({ lessonId, lessonData })
    });

    return result;
  } catch (error) {
    console.error('Complete lesson error:', error);
    return {
      success: false,
      error: 'An error occurred while completing the lesson. Please try again.'
    };
  }
};

/**
 * Save quiz score
 */
export const saveQuizScoreAPI = async (quizId, score, total, percentage, quizData) => {
  try {
    const result = await apiRequest('/users/me/quiz-score', {
      method: 'POST',
      body: JSON.stringify({ quizId, score, total, percentage, quizData })
    });

    return result;
  } catch (error) {
    console.error('Save quiz score error:', error);
    return {
      success: false,
      error: 'An error occurred while saving quiz score. Please try again.'
    };
  }
};

/**
 * Add points
 */
export const addPointsAPI = async (points) => {
  try {
    const result = await apiRequest('/users/me/points', {
      method: 'POST',
      body: JSON.stringify({ points })
    });

    return result;
  } catch (error) {
    console.error('Add points error:', error);
    return {
      success: false,
      error: 'An error occurred while adding points. Please try again.'
    };
  }
};

/**
 * Logout user (clear token)
 */
export const logout = () => {
  setToken(null);
  localStorage.removeItem('geep_user');
};