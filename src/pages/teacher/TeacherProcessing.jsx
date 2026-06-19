import React, { useEffect, useState, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ApiServices } from '../../api/api';
import { AlertCircle } from 'lucide-react';

export default function TeacherProcessing() {
  const navigate = useNavigate();
  const location = useLocation();
  const { taskID, subjectName, year, divisionName } = location.state || {};

  const [status, setStatus] = useState('PENDING');
  const [errorMsg, setErrorMsg] = useState(null);
  
  const pollIntervalRef = useRef(null);

  useEffect(() => {
    if (!taskID) {
      navigate('/teacher');
      return;
    }

    startPolling();

    return () => {
      clearInterval(pollIntervalRef.current);
    };
  }, [taskID]);

  const startPolling = () => {
    let attempts = 0;
    const maxAttempts = 30; // 60 seconds total

    pollIntervalRef.current = setInterval(async () => {
      attempts++;
      if (attempts >= maxAttempts) {
        clearInterval(pollIntervalRef.current);
        setErrorMsg('Task execution timed out. Please check session records manually.');
        return;
      }

      try {
        const res = await ApiServices.checkTaskStatus({ taskID });
        setStatus(res.status);

        if (res.status === 'SUCCESS') {
          clearInterval(pollIntervalRef.current);
          const result = res.result || {};
          const sessionID = result.class_session_id;

          if (sessionID) {
            navigate(`/teacher/session/${sessionID}/result`, { 
              state: { 
                subjectName,
                datetime: new Date().toLocaleDateString('en-US', {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })
              } 
            });
          } else {
            setErrorMsg('Task succeeded, but class session ID was missing.');
          }
        } else if (res.status === 'FAILURE' || res.status === 'error') {
          clearInterval(pollIntervalRef.current);
          setErrorMsg(res.result || 'Face recognition model failed to analyze images.');
        }
      } catch (err) {
        console.warn('Error polling task status:', err);
      }
    }, 2000);
  };

  return (
    <div className="teacher-theme" style={{
      display: 'flex',
      flexDirection: 'column',
      minHeight: '80vh',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '24px',
      textAlign: 'center'
    }}>
      <div className="glass-card" style={{
        width: '100%',
        maxWidth: '440px',
        padding: '40px 24px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '24px'
      }}>
        <h2 style={{ fontSize: '1.6rem', fontWeight: '800', color: 'var(--color-text-primary)' }}>
          Processing Attendance
        </h2>

        {errorMsg ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <AlertCircle size={48} style={{ color: 'var(--color-danger)' }} />
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.95rem' }}>{errorMsg}</p>
            <button onClick={() => navigate('/teacher')} className="btn btn-primary" style={{ width: 'auto' }}>
              Back to Panel
            </button>
          </div>
        ) : (
          <>
            {/* Spinner with soft pulsing scale */}
            <div style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              border: '6px solid rgba(245, 158, 11, 0.1)',
              borderTopColor: 'var(--color-teacher)',
              animation: 'spin 1s linear infinite'
            }} />

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--color-teacher-text)', letterSpacing: '0.05em' }}>
                Status: {status}
              </span>
              <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem', lineHeight: '1.4' }}>
                ClassLens AI is running face matching for {subjectName} (Div {divisionName || 'General'}). This may take a few moments. Please do not close the window.
              </p>
            </div>
          </>
        )}
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
