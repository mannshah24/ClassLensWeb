import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ApiServices } from '../../api/api';
import { ArrowLeft, KeyRound, AlertCircle, CheckCircle } from 'lucide-react';

export default function StudentOTP() {
  const navigate = useNavigate();
  const location = useLocation();

  const { prn, email } = location.state || {};

  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [infoMsg, setInfoMsg] = useState(null);

  useEffect(() => {
    // If no state is passed, go back to PRN entry
    if (!email || !prn) {
      navigate('/signup/student');
    }
  }, [email, prn, navigate]);

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
        navigate('/signup/student/password', { state: { prn, email } });
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
        setInfoMsg('A new OTP has been sent to your email.');
      } else {
        setErrorMsg('Failed to resend OTP.');
      }
    } catch (err) {
      setErrorMsg('Error resending OTP.');
    }
  };

  // Mask the email for privacy (e.g. j***@example.com)
  const maskEmail = (str) => {
    if (!str) return '';
    const parts = str.split('@');
    if (parts.length < 2) return str;
    const name = parts[0];
    const domain = parts[1];
    return name.charAt(0) + '***@' + domain;
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

      {/* Back Button */}
      <button className="back-button" onClick={() => navigate('/signup/student')}>
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
          Verify Email OTP
        </h2>
        <p style={{
          fontSize: '0.9rem',
          color: 'var(--color-text-secondary)',
          marginBottom: '24px'
        }}>
          Step 2: Enter the OTP sent to your registered email {maskEmail(email)}
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
            <label className="form-label" htmlFor="signup-otp">Verification OTP</label>
            <div style={{ position: 'relative' }}>
              <KeyRound size={16} style={{
                position: 'absolute',
                left: '14px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--color-text-light)'
              }} />
              <input
                id="signup-otp"
                type="number"
                pattern="[0-9]*"
                placeholder="Enter 6-digit OTP"
                className="form-input"
                style={{ paddingLeft: '42px', letterSpacing: '4px', textAlign: 'center', fontWeight: 'bold' }}
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
            {loading ? <div className="loading-spinner"></div> : 'Verify OTP'}
          </button>
        </form>

        <div style={{
          display: 'flex',
          justifyContent: 'center',
          marginTop: '20px',
          fontSize: '0.85rem'
        }}>
          <button 
            type="button"
            onClick={handleResendOTP}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--theme-color)',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            Didn't receive OTP? Resend
          </button>
        </div>
      </div>
    </div>
  );
}
