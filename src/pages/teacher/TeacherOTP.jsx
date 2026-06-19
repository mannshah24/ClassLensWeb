import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ApiServices } from '../../api/api';
import { ArrowLeft, KeyRound, AlertCircle, CheckCircle } from 'lucide-react';

export default function TeacherOTP() {
  const navigate = useNavigate();
  const location = useLocation();

  const { email } = location.state || {};

  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [infoMsg, setInfoMsg] = useState(null);
  
  // Timer state
  const [secondsRemaining, setSecondsRemaining] = useState(30);
  const timerRef = useRef(null);

  useEffect(() => {
    if (!email) {
      navigate('/signup/teacher');
      return;
    }
    startTimer();
    return () => {
      clearInterval(timerRef.current);
    };
  }, [email, navigate]);

  const startTimer = () => {
    clearInterval(timerRef.current);
    setSecondsRemaining(30);
    timerRef.current = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    if (!otp) {
      setErrorMsg('Please enter the OTP.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);
    setInfoMsg(null);

    try {
      const isVerified = await ApiServices.verifyOtp({ email, otp: parseInt(otp, 10) });
      if (isVerified) {
        // OTP Verified, proceed to Password Setup
        navigate('/signup/teacher/password', { state: { email } });
      } else {
        setErrorMsg('Invalid OTP. Please try again.');
      }
    } catch (err) {
      setErrorMsg('Verification failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setErrorMsg(null);
    setInfoMsg(null);
    try {
      const sent = await ApiServices.sendOtp({ email });
      if (sent) {
        setInfoMsg('Verification OTP resent! Please check your email.');
        startTimer();
      } else {
        setErrorMsg('Failed to send OTP.');
      }
    } catch (err) {
      setErrorMsg('Error resending OTP.');
    }
  };

  const formattedTime = () => {
    const minutes = Math.floor(secondsRemaining / 60).toString().padLeft(2, '0');
    const seconds = (secondsRemaining % 60).toString().padLeft(2, '0');
    return `${minutes}:${seconds}`;
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
      <button className="back-button" onClick={() => navigate('/signup/teacher')}>
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
          Enter Verification Code
        </h2>
        <p style={{
          fontSize: '0.9rem',
          color: 'var(--color-text-secondary)',
          marginBottom: '24px',
          lineHeight: '1.4'
        }}>
          Step 2: An OTP verification code has been sent to <strong>{email}</strong>
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

        {infoMsg && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: 'var(--color-success-light)',
            color: 'var(--color-success-text)',
            padding: '12px',
            borderRadius: 'var(--radius-md)',
            fontSize: '0.85rem',
            fontWeight: '600',
            marginBottom: '20px'
          }}>
            <CheckCircle size={16} style={{ flexShrink: 0 }} />
            <span>{infoMsg}</span>
          </div>
        )}

        <form onSubmit={handleVerifyOTP} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="form-group">
            <label className="form-label" htmlFor="teacher-signup-otp">Verification OTP</label>
            <div style={{ position: 'relative' }}>
              <KeyRound size={16} style={{
                position: 'absolute',
                left: '14px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--color-text-light)'
              }} />
              <input
                id="teacher-signup-otp"
                type="number"
                pattern="[0-9]*"
                placeholder="Enter 4-digit OTP"
                className="form-input"
                style={{ paddingLeft: '42px', letterSpacing: '6px', textAlign: 'center', fontWeight: 'bold' }}
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                disabled={loading}
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? <div className="loading-spinner"></div> : 'Confirm'}
          </button>
        </form>

        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '8px',
          marginTop: '24px',
          fontSize: '0.85rem',
          color: 'var(--color-text-secondary)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span>Didn't receive code?</span>
            <button 
              type="button"
              onClick={handleResendOTP}
              disabled={secondsRemaining > 0}
              style={{
                background: 'none',
                border: 'none',
                color: secondsRemaining === 0 ? 'var(--theme-color)' : 'var(--color-text-light)',
                fontWeight: '700',
                cursor: secondsRemaining === 0 ? 'pointer' : 'not-allowed'
              }}
            >
              Resend
            </button>
          </div>
          {secondsRemaining > 0 && (
            <span>Resend available in: {secondsRemaining}s</span>
          )}
        </div>
      </div>
    </div>
  );
}
// String polyfill helper
if (!String.prototype.padLeft) {
  String.prototype.padLeft = function (length, character) {
    return this.padStart(length, character);
  };
}
