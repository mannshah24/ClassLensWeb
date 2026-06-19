import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { ApiServices } from '../../api/api';
import { Clock, ArrowRight, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function TeacherSessions() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [sessions, setSessions] = useState([]);
  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
    if (user && user.userID) {
      fetchSessions();
    }
  }, [user]);

  const fetchSessions = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const list = await ApiServices.getTeacherClassSessions({ teacherID: user.userID });
      setSessions(list);
    } catch (err) {
      setErrorMsg('Failed to load past sessions.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '700px', margin: '0 auto' }}>
      
      {/* Title */}
      <div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: '800', color: 'var(--color-text-primary)' }}>
          Class Sessions History
        </h1>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.95rem' }}>
          Check and override scanned student attendances for past classes
        </p>
      </div>

      {errorMsg ? (
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', padding: '30px', textAlign: 'center' }}>
          <AlertTriangle size={36} style={{ color: 'var(--color-warning)' }} />
          <p>{errorMsg}</p>
          <button onClick={fetchSessions} className="btn btn-primary" style={{ width: 'auto' }}>Retry</button>
        </div>
      ) : loading ? (
        <div style={{ display: 'flex', height: '50vh', justifyContent: 'center', alignItems: 'center' }}>
          <div className="loading-spinner" style={{ color: 'var(--color-teacher)' }}></div>
        </div>
      ) : (
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: '700', color: 'var(--color-text-primary)' }}>
            All Sessions ({sessions.length})
          </h2>

          {sessions.length === 0 ? (
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem', textAlign: 'center', padding: '32px' }}>
              No class sessions have been recorded.
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {sessions.map((sess) => {
                const dateObj = new Date(sess.class_datetime || sess.date);
                const formattedDate = dateObj.toLocaleDateString('en-US', {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                });

                return (
                  <div 
                    key={sess.id} 
                    onClick={() => navigate(`/teacher/session/${sess.id}/result`, { state: { subjectName: sess.subject_name, datetime: formattedDate } })}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '14px 16px',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--color-border)',
                      backgroundColor: 'rgba(255,255,255,0.4)',
                      cursor: 'pointer',
                      transition: 'background-color var(--transition-fast)'
                    }}
                    className="session-row"
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '50%',
                        backgroundColor: 'var(--color-teacher-light)',
                        color: 'var(--color-teacher)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <Clock size={16} />
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        <span style={{ fontWeight: '700', fontSize: '0.9rem', color: 'var(--color-text-primary)' }}>
                          {sess.subject_name || 'Class Session'}
                        </span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
                          {formattedDate} • Year {sess.year} {sess.division_name ? `• Div ${sess.division_name}` : ''}
                        </span>
                      </div>
                    </div>
                    <ArrowRight size={16} style={{ color: 'var(--color-text-light)' }} />
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      <style>{`
        .session-row:hover {
          background-color: rgba(245, 158, 11, 0.05) !important;
          border-color: rgba(245, 158, 11, 0.2) !important;
        }
      `}</style>

    </div>
  );
}
