import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ApiServices } from '../../api/api';
import CameraCapture from '../../components/CameraCapture';
import { ArrowLeft, CheckCircle, AlertCircle, Sparkles } from 'lucide-react';

export default function StudentPhotoUploader() {
  const navigate = useNavigate();
  const location = useLocation();

  const { prn, password } = location.state || {};

  const [photo, setPhoto] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!prn || !password) {
      navigate('/signup/student');
    }
  }, [prn, password, navigate]);

  const handleCapture = (files) => {
    if (files.length > 0) {
      setPhoto(files[0]);
      setErrorMsg(null);
    } else {
      setPhoto(null);
    }
  };

  const handleRegister = async () => {
    if (!photo) {
      setErrorMsg('Please capture or upload a face photo to complete registration.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    try {
      const isSuccess = await ApiServices.registerStudent({
        prn: parseInt(prn, 10),
        password,
        photoFile: photo
      });

      if (isSuccess) {
        setSuccess(true);
        // Clean up state
        setTimeout(() => {
          navigate('/login/student');
        }, 3000);
      } else {
        setErrorMsg('Registration failed. The face detection model might have failed to detect your face or the server timed out. Please try a clearer picture.');
      }
    } catch (err) {
      setErrorMsg('Network error. Check connection and try again.');
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
      {!success && (
        <button className="back-button" onClick={() => navigate('/signup/student/password', { state: { prn } })}>
          <ArrowLeft size={18} />
        </button>
      )}

      {success ? (
        // Success View
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
            Registration Successful!
          </h2>
          <p style={{ fontSize: '0.95rem', color: 'var(--color-text-secondary)', lineHeight: '1.5' }}>
            Your account is set up and your face template has been registered. You will be redirected to the login page shortly...
          </p>
        </div>
      ) : (
        // Registration View
        <div className="animate-fade-in glass-card" style={{
          width: '100%',
          maxWidth: '440px',
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
            Register Face Photo
          </h2>
          <p style={{
            fontSize: '0.9rem',
            color: 'var(--color-text-secondary)',
            marginBottom: '20px'
          }}>
            Step 4: Register your face template. Capture a clear, front-facing selfie under good lighting.
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
              <span style={{ fontSize: '0.82rem', lineHeight: '1.4' }}>{errorMsg}</span>
            </div>
          )}

          {/* Camera Module */}
          <CameraCapture 
            onCapture={handleCapture} 
            singleMode={true} 
            preferredFacingMode="user"
            themeColor="var(--theme-color)"
          />

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: 'rgba(37, 99, 235, 0.05)',
            border: '1px solid rgba(37, 99, 235, 0.1)',
            padding: '12px',
            borderRadius: 'var(--radius-md)',
            color: 'var(--color-student-text)',
            fontSize: '0.82rem',
            lineHeight: '1.4',
            marginTop: '20px',
            marginBottom: '24px'
          }}>
            <Sparkles size={16} style={{ color: 'var(--color-student)', flexShrink: 0 }} />
            <span>Face profiles are used to securely auto-mark attendance when your teacher takes classroom photos.</span>
          </div>

          <button
            onClick={handleRegister}
            className="btn btn-primary"
            disabled={loading || !photo}
          >
            {loading ? <div className="loading-spinner"></div> : 'Complete Registration'}
          </button>
        </div>
      )}
    </div>
  );
}
