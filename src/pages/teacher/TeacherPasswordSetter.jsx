import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ApiServices } from '../../api/api';
import { ArrowLeft, Lock, Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react';

export default function TeacherPasswordSetter() {
  const navigate = useNavigate();
  const location = useLocation();

  const { email } = location.state || {};

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!email) {
      navigate('/signup/teacher');
    }
  }, [email, navigate]);

  const handleConfirmPassword = async (e) => {
    e.preventDefault();
    if (!password || !confirmPassword) {
      setErrorMsg('Please fill in all fields.');
      return;
    }

    if (password.length < 8) {
      setErrorMsg('Password must be at least 8 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    try {
      const response = await ApiServices.setPassword({ email, password });
      if (response) {
        setSuccess(true);
        setTimeout(() => {
          navigate('/login/teacher');
        }, 3000);
      } else {
        setErrorMsg('Failed to set password. Please try again.');
      }
    } catch (err) {
      setErrorMsg('Network error. Check connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="teacher-theme" style={{
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

      {/* Back Button */}
      {!success && (
        <button className="back-button" onClick={() => navigate('/signup/teacher/otp', { state: { email } })}>
          <ArrowLeft size={18} />
        </button>
      )}

      {success ? (
        // Success panel
        <div className="animate-scale-in glass-card" style={{
          width: '100%',
          maxWidth: '400px',
          padding: '40px 24px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          gap: '16px'
        }}>
          <div style={{
            width: '72px',
            height: '72px',
            borderRadius: '50%',
            backgroundColor: 'var(--color-success-light)',
            color: 'var(--color-success)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '8px'
          }}>
            <CheckCircle size={40} />
          </div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: '800', color: 'var(--color-text-primary)' }}>
            Password Set!
          </h2>
          <p style={{ fontSize: '0.95rem', color: 'var(--color-text-secondary)', lineHeight: '1.5' }}>
            Your account has been registered successfully. Redirecting you to login screen...
          </p>
        </div>
      ) : (
        // Setter Form
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
            Set Password
          </h2>
          <p style={{
            fontSize: '0.9rem',
            color: 'var(--color-text-secondary)',
            marginBottom: '24px',
            lineHeight: '1.4'
          }}>
            Step 3: Setup your password password for <strong>{email}</strong>
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

          <form onSubmit={handleConfirmPassword} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label" htmlFor="teacher-pass">Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} style={{
                  position: 'absolute',
                  left: '14px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--color-text-light)'
                }} />
                <input
                  id="teacher-pass"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter password (min 8 chars)"
                  className="form-input"
                  style={{ paddingLeft: '42px', paddingRight: '42px' }}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '14px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: 'var(--color-text-secondary)',
                    cursor: 'pointer'
                  }}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="teacher-confirm-pass">Confirm Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} style={{
                  position: 'absolute',
                  left: '14px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--color-text-light)'
                }} />
                <input
                  id="teacher-confirm-pass"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Re-enter password"
                  className="form-input"
                  style={{ paddingLeft: '42px', paddingRight: '42px' }}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ marginTop: '12px' }}
              disabled={loading}
            >
              {loading ? <div className="loading-spinner"></div> : 'Confirm'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
