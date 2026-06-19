import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ApiServices } from '../../api/api';
import CameraCapture from '../../components/CameraCapture';
import { ArrowLeft, CheckCircle, AlertCircle, Sparkles } from 'lucide-react';

export default function StudentFaceUpdate() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [photo, setPhoto] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleCapture = (files) => {
    if (files.length > 0) {
      setPhoto(files[0]);
      setErrorMsg(null);
    } else {
      setPhoto(null);
    }
  };

  const handleUpdate = async () => {
    if (!photo) {
      setErrorMsg('Please capture or select a face photo first.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    try {
      const res = await ApiServices.updateStudentFace({
        photoFile: photo,
        prn: user.prn ? user.prn.toString() : '',
        accessToken: user.accessToken
      });

      if (res.status) {
        setSuccess(true);
        setTimeout(() => {
          navigate('/student/profile');
        }, 3000);
      } else {
        setErrorMsg(res.message || 'Failed to update face. Please use a clearer selfie.');
      }
    } catch (err) {
      setErrorMsg('Network error. Check connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in" style={{ maxWidth: '440px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <button 
          onClick={() => navigate('/student/profile')}
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            backgroundColor: '#fff',
            border: '1px solid var(--color-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: 'var(--color-text-primary)'
          }}
        >
          <ArrowLeft size={16} />
        </button>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--color-text-primary)' }}>
            Update Face Template
          </h1>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.85rem' }}>
            Replace your registered biometric attendance selfie
          </p>
        </div>
      </div>

      {success ? (
        // Success dialog
        <div className="glass-card" style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          padding: '40px 24px',
          gap: '16px'
        }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            backgroundColor: 'var(--color-success-light)',
            color: 'var(--color-success)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <CheckCircle size={32} />
          </div>
          <h2 style={{ fontSize: '1.3rem', fontWeight: '800' }}>Face Template Updated!</h2>
          <p style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', lineHeight: '1.4' }}>
            Your biometric records have been updated. All future classroom captures will sync with this new image. Redirecting to profile page...
          </p>
        </div>
      ) : (
        // Capture panel
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {errorMsg && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: 'var(--color-danger-light)',
              color: 'var(--color-danger-text)',
              padding: '12px',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.82rem',
              fontWeight: '600'
            }}>
              <AlertCircle size={16} style={{ flexShrink: 0 }} />
              <span style={{ lineHeight: '1.4' }}>{errorMsg}</span>
            </div>
          )}

          <CameraCapture 
            onCapture={handleCapture}
            singleMode={true}
            preferredFacingMode="user"
            themeColor="var(--color-student)"
          />

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: 'rgba(37, 99, 235, 0.04)',
            border: '1px solid rgba(37, 99, 235, 0.08)',
            padding: '12px',
            borderRadius: 'var(--radius-md)',
            color: 'var(--color-student-text)',
            fontSize: '0.8rem',
            lineHeight: '1.4'
          }}>
            <Sparkles size={14} style={{ color: 'var(--color-student)', flexShrink: 0 }} />
            <span>Face updates trigger re-extraction of embeddings. Make sure your facial features are fully visible.</span>
          </div>

          <button
            onClick={handleUpdate}
            className="btn btn-primary"
            disabled={loading || !photo}
          >
            {loading ? <div className="loading-spinner"></div> : 'Update Face Template'}
          </button>
        </div>
      )}

    </div>
  );
}
