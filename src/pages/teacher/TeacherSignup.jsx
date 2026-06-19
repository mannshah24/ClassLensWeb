import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ApiServices } from '../../api/api';
import { ArrowLeft, Mail, AlertCircle } from 'lucide-react';

export default function TeacherSignup() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    if (!email) {
      setErrorMsg('Please enter your university email.');
      return;
    }

    // Validate email domain msubaroda.ac.in
    const domainRegex = /^[a-zA-Z0-9._%+-]+@msubaroda\.ac\.in$/;
    if (!domainRegex.test(email)) {
      setErrorMsg('Please enter a valid university email (e.g. name@msubaroda.ac.in).');
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    try {
      const response = await ApiServices.verifyEmail({ email });
      if (response === 'verified') {
        // Send OTP
        const otpSent = await ApiServices.sendOtp({ email });
        if (otpSent) {
          navigate('/signup/teacher/otp', { state: { email } });
        } else {
          setErrorMsg('Failed to send verification code. Please try again.');
        }
      } else {
        setErrorMsg(response || 'Email verification failed.');
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
      <button className="back-button" onClick={() => navigate('/login/teacher')}>
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
          Register Account
        </h2>
        <p style={{
          fontSize: '0.9rem',
          color: 'var(--color-text-secondary)',
          marginBottom: '24px'
        }}>
          Step 1: Enter university email to receive a verification OTP
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

        <form onSubmit={handleSignup} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="form-group">
            <label className="form-label" htmlFor="teacher-signup-email">University Email Address</label>
            <div style={{ position: 'relative' }}>
              <Mail size={16} style={{
                position: 'absolute',
                left: '14px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--color-text-light)'
              }} />
              <input
                id="teacher-signup-email"
                type="email"
                placeholder="Enter university email"
                className="form-input"
                style={{ paddingLeft: '42px' }}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? <div className="loading-spinner"></div> : 'Get OTP'}
          </button>
        </form>

        <div style={{
          display: 'flex',
          justifyContent: 'center',
          marginTop: '20px',
          fontSize: '0.85rem'
        }}>
          <Link 
            to="/login/teacher" 
            style={{ color: 'var(--theme-color)', fontWeight: '600', textDecoration: 'none' }}
          >
            Already have an account? Login
          </Link>
        </div>
      </div>
    </div>
  );
}
