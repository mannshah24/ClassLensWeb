import React, { createContext, useContext, useState, useEffect } from 'react';
import { ApiServices } from '../api/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize Auth state from localStorage
  useEffect(() => {
    const checkSession = async () => {
      try {
        const rememberMe = localStorage.getItem('classlens_remember_me') === 'true';
        if (rememberMe) {
          const userType = localStorage.getItem('classlens_user_type');
          const userID = localStorage.getItem('classlens_user_id');
          const userName = localStorage.getItem('classlens_user_name');
          const token = localStorage.getItem('classlens_access_token');
          const prn = localStorage.getItem('classlens_prn');
          const email = localStorage.getItem('classlens_email');

          if (userType && userID) {
            setUser({
              userType,
              userID: parseInt(userID, 10),
              userName,
              accessToken: token,
              prn: prn ? parseInt(prn, 10) : null,
              email: email || null
            });
          }
        }
      } catch (e) {
        console.error('Error loading session:', e);
      } finally {
        setLoading(false);
      }
    };
    checkSession();
  }, []);

  /**
   * Login handler
   * @param {string} userType 'student' | 'teacher'
   * @param {object} userData { userID, userName, prn, email, accessToken }
   * @param {boolean} rememberMe
   */
  const login = (userType, userData, rememberMe = true) => {
    const formattedUser = {
      userType,
      userID: userData.userID || userData.student_id || userData.teacherID,
      userName: userData.userName || userData.studentName || userData.teacherName,
      accessToken: userData.accessToken || null,
      prn: userData.prn || null,
      email: userData.email || null,
    };

    setUser(formattedUser);

    if (rememberMe) {
      localStorage.setItem('classlens_remember_me', 'true');
      localStorage.setItem('classlens_user_type', userType);
      localStorage.setItem('classlens_user_id', formattedUser.userID.toString());
      localStorage.setItem('classlens_user_name', formattedUser.userName);
      if (formattedUser.accessToken) {
        localStorage.setItem('classlens_access_token', formattedUser.accessToken);
      }
      if (formattedUser.prn) {
        localStorage.setItem('classlens_prn', formattedUser.prn.toString());
      }
      if (formattedUser.email) {
        localStorage.setItem('classlens_email', formattedUser.email);
      }
    } else {
      localStorage.setItem('classlens_remember_me', 'false');
    }
  };

  /**
   * Logout handler
   */
  const logout = async () => {
    if (user) {
      try {
        // Attempt token teardown on the backend before local logout
        if (user.userType === 'student') {
          await ApiServices.removeNotificationToken({ studentId: user.userID });
        } else if (user.userType === 'teacher') {
          await ApiServices.removeTeacherNotificationToken({ teacherId: user.userID });
        }
      } catch (e) {
        console.warn('Backend notification token cleanup failed on logout:', e);
      }
    }

    setUser(null);
    localStorage.removeItem('classlens_remember_me');
    localStorage.removeItem('classlens_user_type');
    localStorage.removeItem('classlens_user_id');
    localStorage.removeItem('classlens_user_name');
    localStorage.removeItem('classlens_access_token');
    localStorage.removeItem('classlens_prn');
    localStorage.removeItem('classlens_email');
  };

  const value = {
    user,
    loading,
    login,
    logout,
    isAuthenticated: !!user,
    isStudent: user?.userType === 'student',
    isTeacher: user?.userType === 'teacher'
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
