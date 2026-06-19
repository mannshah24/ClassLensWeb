import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ApiServices } from '../../api/api';
import { ArrowLeft, User, Lock, AlertCircle } from 'lucide-react';

export default function StudentLogin() {
  const [prn, setPrn] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!prn || !password) {
      setErrorMsg('Please fill in all fields.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    try {
      const res = await ApiServices.validateStudent({ prn: parseInt(prn, 10), password });
      
      if (res.status) {
        // Successful login
        login('student', {
          userID: res.student_id,
          userName: res.studentName,
          prn: res.prn,
          accessToken: res.accessToken
        }, rememberMe);
        navigate('/student');
      } else {
        setErrorMsg(res.message || 'Login failed. Please check your credentials.');
      }
    } catch (err) {
      setErrorMsg('Network error. Check your connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="student-theme" style={{
      display: 'flex',
      flexDirection: 'column',
      minHeight: '100vh',
      width: '100vw',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '24px',
      position: 'relative'
    }}>
      {/* Background Blobs */}
      <div className="bg-blob-container">
        <div className="bg-blob bg-blob-1 app-blob-1" />
        <div className="bg-blob bg-blob-2 app-blob-2" />
      </div>

      {/* Floating Back Button */}
      <button className="back-button" onClick={() => navigate('/')}>
        <ArrowLeft size={18} />
      </button>

      <div className="animate-fade-in glass-card" style={{
        width: '100%',
        maxWidth: '400px',
        padding: '32px 24px',
        display: 'flex',
        flexDirection: 'column'
      }}>
        <h2 style={{
          fontSize: '1.8rem',
          fontWeight: '800',
          color: 'var(--color-text-primary)',
          marginBottom: '6px',
          fontFamily: 'var(--font-heading)'
        }}>
          Student Login
        </h2>
        <p style={{
          fontSize: '0.9rem',
          color: 'var(--color-text-secondary)',
          marginBottom: '24px'
        }}>
          Enter your PRN and password to access dashboard
        </p>

        {errorMsg && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: 'var(--color-danger-light)',
            color: 'var(--color-danger-text)',
            padding: '12px',
            borderRadius: 'var(--radius-md)',
            fontSize: '0.85rem',
            fontWeight: '600',
            marginBottom: '20px'
          }}>
            <AlertCircle size={16} style={{ flexShrink: 0 }} />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="form-group">
            <label className="form-label" htmlFor="prn-input">PRN Number</label>
            <div style={{ position: 'relative' }}>
              <User size={16} style={{
                position: 'absolute',
                left: '14px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--color-text-light)'
              }} />
              <input
                id="prn-input"
                type="number"
                pattern="[0-9]*"
                placeholder="Enter your PRN"
                className="form-input"
                style={{ paddingLeft: '42px' }}
                value={prn}
                onChange={(e) => setPrn(e.target.value)}
                disabled={loading}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password-input">Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={16} style={{
                position: 'absolute',
                left: '14px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--color-text-light)'
              }} />
              <input
                id="password-input"
                type="password"
                placeholder="Enter your password"
                className="form-input"
                style={{ paddingLeft: '42px' }}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />
            </div>
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '0.85rem',
            color: 'var(--color-text-secondary)',
            marginTop: '4px'
          }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                style={{ accentColor: 'var(--theme-color)' }}
              />
              Remember me
            </label>
            <Link 
              to="/signup/student" 
              style={{ color: 'var(--theme-color)', fontWeight: '600', textDecoration: 'none' }}
            >
              Sign Up
            </Link>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ marginTop: '12px' }}
            disabled={loading}
          >
            {loading ? <div className="loading-spinner"></div> : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
}
