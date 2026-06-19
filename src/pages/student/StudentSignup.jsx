import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ApiServices } from '../../api/api';
import { ArrowLeft, User, AlertCircle } from 'lucide-react';

export default function StudentSignup() {
  const [prn, setPrn] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  const navigate = useNavigate();

  const handleVerifyPRN = async (e) => {
    e.preventDefault();
    if (!prn) {
      setErrorMsg('Please enter your PRN.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    try {
      const res = await ApiServices.verifyPRN({ prn: parseInt(prn, 10) });
      if (res.status === 'verified') {
        // Trigger sending OTP to the student's email
        const otpSent = await ApiServices.sendOtp({ email: res.email });
        if (otpSent) {
          // Proceed to OTP stage, pass the email and PRN in route state
          navigate('/signup/student/otp', { state: { prn, email: res.email } });
        } else {
          setErrorMsg('Failed to send verification OTP to your registered email.');
        }
      } else {
        setErrorMsg(res.message || 'PRN verification failed.');
      }
    } catch (err) {
      setErrorMsg('Network error. Please try again.');
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

      {/* Back Button */}
      <button className="back-button" onClick={() => navigate('/login/student')}>
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
          Verify PRN
        </h2>
        <p style={{
          fontSize: '0.9rem',
          color: 'var(--color-text-secondary)',
          marginBottom: '24px'
        }}>
          Step 1: Enter your PRN to verify your college registration
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

        <form onSubmit={handleVerifyPRN} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="form-group">
            <label className="form-label" htmlFor="signup-prn">Permanent Registration Number (PRN)</label>
            <div style={{ position: 'relative' }}>
              <User size={16} style={{
                position: 'absolute',
                left: '14px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--color-text-light)'
              }} />
              <input
                id="signup-prn"
                type="number"
                pattern="[0-9]*"
                placeholder="Enter PRN"
                className="form-input"
                style={{ paddingLeft: '42px' }}
                value={prn}
                onChange={(e) => setPrn(e.target.value)}
                disabled={loading}
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? <div className="loading-spinner"></div> : 'Verify & Send OTP'}
          </button>
        </form>
      </div>
    </div>
  );
}
