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
            const userStatus = currentUser.status || 'approved';
            if (userStatus !== 'approved') {
              logout();
            } else {
              setUser(currentUser);
              
              // Set initial combined points immediately to prevent "0" flash
              const lessonPts = currentUser.points || 0;
              const gamePts = currentUser.exp || 0;
              setPoints(lessonPts + gamePts);

              // Load user progress from API
              await loadUserProgress();
            }
          } else {
            logout();
          }
        } catch (error) {
          console.error('Error loading user data:', error);
          logout();
        }
      }
      setIsLoading(false);
    };

    loadUserData();
  }, []);

  // 🌟 THE FIX: Load BOTH progress and game stats simultaneously! 🌟
  const loadUserProgress = async () => {
    try {
      const API_BASE_URL = import.meta.env.VITE_API_URL ;
      const token = localStorage.getItem('geep_token');
      
      if (!token) {
        console.warn('No token available for loading user progress');
        return;
      }

      // Fetch from BOTH APIs at the same time using Promise.all
      const [progressRes, statsRes] = await Promise.all([
        fetch(`${API_BASE_URL}/users/me/progress`, {
          headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
        }),
        fetch(`${API_BASE_URL}/games/stats`, {
          headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
        }).catch(() => ({ ok: false })) // Catch errors safely
      ]);

      if (progressRes.ok) {
        const progData = await progressRes.json();
        
        // Safely extract the game EXP from the dedicated Games endpoint
        let gameExp = 0;
        if (statsRes.ok) {
          const statsData = await statsRes.json();
          if (statsData.success && statsData.data) {
            gameExp = statsData.data.exp || 0;
          }
        }

        if (progData.success && progData.data) {
          
          // Combine authoritative Lesson points with authoritative Game EXP
          const lessonPts = progData.data.points || 0;
          setPoints(lessonPts + gameExp);

          setBadges(progData.data.badges || []);
          setCompletedLessons(progData.data.completedLessons || []);
          setCompletedTasks(progData.data.completedTasks || []);
          setQuizScores(progData.data.quizScores || {});
        }
      } else {
        const errorData = await progressRes.json().catch(() => ({}));
        console.error('Failed to load user progress:', errorData.error?.message || 'Unknown error');
        
        if (progressRes.status === 401) {
          logout();
        }
      }
    } catch (error) {
      console.error('Error loading user progress:', error);
    }
  };

  const login = (userData) => {
    setUser(userData);
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
        // Reload combined progress safely
        await loadUserProgress();
      } else {
        // If backend save fails, revert local state
        setPoints(prev => prev - amount);
        console.error('Failed to save points to backend:', result.error);
      }
    } catch (error) {
      console.error('Error saving points:', error);
      setPoints(prev => prev - amount);
    }
  };

  const addBadge = async (badge) => {
    if (badges.find(b => b.id === badge.id || (b.badgeId && b.badgeId.toString() === badge.id.toString()))) {
      return;
    }

    setBadges(prev => [...prev, badge]);
    
    try {
      const result = await awardBadge(badge.id, {
        badgeId: badge.id,
        badgeData: badge
      });
      if (result.success && result.data) {
        await loadUserProgress();
      } else {
        setBadges(prev => prev.filter(b => b.id !== badge.id));
        console.error('Failed to save badge to backend:', result.error);
      }
    } catch (error) {
      console.error('Error saving badge:', error);
      setBadges(prev => prev.filter(b => b.id !== badge.id));
    }
  };

  const completeLesson = async (lessonId, lessonData) => {
    if (completedLessons.includes(lessonId)) return;

    setCompletedLessons(prev => [...prev, lessonId]);
    
    try {
      const result = await completeLessonAPI(lessonId, lessonData);
      if (result.success && result.data) {
        await loadUserProgress();
      } else {
        setCompletedLessons(prev => prev.filter(id => id !== lessonId));
        console.error('Failed to save lesson completion to backend:', result.error);
      }
    } catch (error) {
      console.error('Error saving lesson completion:', error);
      setCompletedLessons(prev => prev.filter(id => id !== lessonId));
    }
  };

  const saveQuizScore = async (quizId, score, percentage, total) => {
    setQuizScores(prev => ({
      ...prev,
      [quizId]: { score, percentage, total, date: new Date().toISOString() }
    }));
    
    try {
      const result = await saveQuizScoreAPI(quizId, score, total, percentage);
      if (result.success && result.data) {
        await loadUserProgress();
      } else {
        console.error('Failed to save quiz score to backend:', result.error);
      }
    } catch (error) {
      console.error('Error saving quiz score:', error);
    }
  };

  const completeTask = (taskId) => {
    setCompletedTasks(prev => {
      if (prev.includes(taskId)) return prev;
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