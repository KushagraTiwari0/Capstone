import { createContext, useContext, useState, useEffect } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { getCurrentUser, logout as logoutService, completeLesson as completeLessonAPI, saveQuizScoreAPI, addPointsAPI, awardBadge } from '../services/authService';

const UserContext = createContext();

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

export const UserProvider = ({ children }) => {
  const [user, setUser] = useLocalStorage('geep_user', null);
  const [points, setPoints] = useState(0);
  const [badges, setBadges] = useState([]);
  const [completedLessons, setCompletedLessons] = useState([]);
  const [quizScores, setQuizScores] = useState({});
  const [completedTasks, setCompletedTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load user data from API on mount if token exists
  useEffect(() => {
    const loadUserData = async () => {
      const token = localStorage.getItem('geep_token');
      if (token) {
        try {
          // Fetch current user data from API
          const currentUser = await getCurrentUser();
          if (currentUser) {
            // Check if user is approved - only approved users should be logged in
            // Legacy users (without status) are treated as approved
            const userStatus = currentUser.status || 'approved';
            if (userStatus !== 'approved') {
              // User is pending or rejected, log them out
              logout();
            } else {
              setUser(currentUser);
              // Load user progress from API
              await loadUserProgress();
            }
          } else {
            // If user not found, token might be invalid
            logout();
          }
        } catch (error) {
          console.error('Error loading user data:', error);
          // If token is invalid, clear everything
          logout();
        }
      }
      setIsLoading(false);
    };

    loadUserData();
  }, []);

  // Load user progress from backend
  const loadUserProgress = async () => {
    try {
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const token = localStorage.getItem('geep_token');
      
      if (!token) {
        console.warn('No token available for loading user progress');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/users/me/progress`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          setPoints(data.data.points || 0);
          setBadges(data.data.badges || []);
          setCompletedLessons(data.data.completedLessons || []);
          setCompletedTasks(data.data.completedTasks || []);
          setQuizScores(data.data.quizScores || {});
        }
      } else {
        // Handle non-OK responses
        const errorData = await response.json().catch(() => ({}));
        console.error('Failed to load user progress:', errorData.error?.message || 'Unknown error');
        
        // If unauthorized, clear token and logout
        if (response.status === 401) {
          logout();
        }
      }
    } catch (error) {
      console.error('Error loading user progress:', error);
      // Don't logout on network errors, just log the error
    }
  };

  const login = (userData) => {
    setUser(userData);
    // Load user progress after login
    loadUserProgress();
  };

  const logout = () => {
    logoutService();
    setUser(null);
    setPoints(0);
    setBadges([]);
    setCompletedLessons([]);
    setQuizScores({});
    setCompletedTasks([]);
  };

  const updateUser = (userData) => {
    setUser(userData);
  };

  const addPoints = async (amount) => {
    // Update local state immediately for better UX
    setPoints(prev => prev + amount);
    
    // Save to backend
    try {
      const result = await addPointsAPI(amount);
      if (result.success && result.data) {
        setPoints(result.data.points);
      } else {
        // If backend save fails, revert local state
        setPoints(prev => prev - amount);
        console.error('Failed to save points to backend:', result.error);
      }
    } catch (error) {
      console.error('Error saving points:', error);
      // Revert local state on error
      setPoints(prev => prev - amount);
    }
  };

  const addBadge = async (badge) => {
    // Check if badge already exists locally
    if (badges.find(b => b.id === badge.id || (b.badgeId && b.badgeId.toString() === badge.id.toString()))) {
      return;
    }

    // Update local state immediately
    setBadges(prev => [...prev, badge]);
    
    // Save to backend
    try {
      const result = await awardBadge(badge.id, {
        badgeId: badge.id,
        badgeData: badge
      });
      if (result.success && result.data) {
        // Reload progress to get updated badges from backend
        await loadUserProgress();
      } else {
        // If backend save fails, remove from local state
        setBadges(prev => prev.filter(b => b.id !== badge.id));
        console.error('Failed to save badge to backend:', result.error);
      }
    } catch (error) {
      console.error('Error saving badge:', error);
      // Remove from local state on error
      setBadges(prev => prev.filter(b => b.id !== badge.id));
    }
  };

  const completeLesson = async (lessonId, lessonData) => {
    // Check if already completed locally
    if (completedLessons.includes(lessonId)) {
      return;
    }

    // Update local state immediately
    setCompletedLessons(prev => [...prev, lessonId]);
    
    // Save to backend
    try {
      const result = await completeLessonAPI(lessonId, lessonData);
      if (result.success && result.data) {
        // Update points and level from backend response
        if (result.data.points !== undefined) {
          setPoints(result.data.points);
        }
        // Reload progress to ensure sync
        await loadUserProgress();
      } else {
        // If backend save fails, remove from local state
        setCompletedLessons(prev => prev.filter(id => id !== lessonId));
        console.error('Failed to save lesson completion to backend:', result.error);
      }
    } catch (error) {
      console.error('Error saving lesson completion:', error);
      // Remove from local state on error
      setCompletedLessons(prev => prev.filter(id => id !== lessonId));
    }
  };

  const saveQuizScore = async (quizId, score, percentage, total) => {
    // Update local state immediately
    setQuizScores(prev => ({
      ...prev,
      [quizId]: { score, percentage, total, date: new Date().toISOString() }
    }));
    
    // Save to backend
    try {
      const result = await saveQuizScoreAPI(quizId, score, total, percentage);
      if (result.success && result.data) {
        // Update points and level from backend response
        if (result.data.points !== undefined) {
          setPoints(result.data.points);
        }
        // Reload progress to ensure sync
        await loadUserProgress();
      } else {
        console.error('Failed to save quiz score to backend:', result.error);
        // Don't revert local state for quiz scores as they're less critical
      }
    } catch (error) {
      console.error('Error saving quiz score:', error);
    }
  };

  const completeTask = (taskId) => {
    // This is handled by the TaskSubmit component which calls the backend API directly
    // We just update local state here for immediate UI feedback
    setCompletedTasks(prev => {
      if (prev.includes(taskId)) {
        return prev;
      }
      return [...prev, taskId];
    });
  };

  const value = {
    user,
    points,
    badges,
    completedLessons,
    quizScores,
    completedTasks,
    isLoading,
    login,
    logout,
    updateUser,
    addPoints,
    addBadge,
    completeLesson,
    saveQuizScore,
    completeTask,
    loadUserProgress
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};

