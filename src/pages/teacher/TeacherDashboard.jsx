import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { ApiServices } from '../../api/api';
import { BookOpen, Users, ClipboardList, Clock, AlertTriangle, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function TeacherDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [subjectsLoading, setSubjectsLoading] = useState(true);
  const [sessionsLoading, setSessionsLoading] = useState(true);
  const [subjects, setSubjects] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
    if (user && user.userID) {
      fetchTeacherData();
    }
  }, [user]);

  const fetchTeacherData = async () => {
    setErrorMsg(null);
    setSubjectsLoading(true);
    setSessionsLoading(true);

    try {
      // Get teacher courses
      const subList = await ApiServices.getTeacherSubjects({ teacherID: user.userID });
      setSubjects(subList);
      setSubjectsLoading(false);

      // Get past sessions
      const sessList = await ApiServices.getTeacherClassSessions({ teacherID: user.userID, limit: 5 });
      setSessions(sessList);
      setSessionsLoading(false);
    } catch (err) {
      setErrorMsg('Failed to load dashboard data.');
      setSubjectsLoading(false);
      setSessionsLoading(false);
    }
  };

  if (errorMsg) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '50vh',
        gap: '16px',
        textAlign: 'center'
      }}>
        <AlertTriangle size={48} style={{ color: 'var(--color-warning)' }} />
        <p style={{ color: 'var(--color-text-secondary)' }}>{errorMsg}</p>
        <button onClick={fetchTeacherData} className="btn btn-primary" style={{ width: 'auto' }}>
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      
      {/* Title block */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: '800', color: 'var(--color-text-primary)' }}>
          Teacher Panel
        </h1>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.95rem' }}>
          Manage courses, track class students, and review past attendance entries
        </p>
      </div>

      {/* Main Grid: Subjects List on left/center, Past Sessions on right */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr',
        gap: '28px'
      }}>
        
        {/* Subjects List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--color-text-primary)' }}>
              Assigned Courses
            </h2>
            <button 
              onClick={() => navigate('/teacher/take-attendance')}
              className="btn btn-primary"
              style={{ width: 'auto', padding: '8px 16px', fontSize: '0.85rem' }}
            >
              <ClipboardList size={16} /> Mark Attendance
            </button>
          </div>

          {subjectsLoading ? (
            <div style={{ display: 'flex', height: '150px', justifyContent: 'center', alignItems: 'center' }}>
              <div className="loading-spinner" style={{ color: 'var(--color-teacher)' }}></div>
            </div>
          ) : subjects.length === 0 ? (
            <div className="glass-card" style={{ padding: '40px', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
              No subjects registered under your account profile.
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '20px'
            }}>
              {subjects.map((sub) => (
                <div key={sub.id} className="glass-card" style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '16px',
                  justifyContent: 'space-between'
                }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <div style={{
                      display: 'inline-flex',
                      alignSelf: 'flex-start',
                      padding: '4px 8px',
                      borderRadius: '6px',
                      fontSize: '0.75rem',
                      fontWeight: '700',
                      backgroundColor: 'var(--color-teacher-light)',
                      color: 'var(--color-teacher-text)',
                      marginBottom: '4px'
                    }}>
                      Division: {sub.division_name || 'General'}
                    </div>
                    <h3 style={{ fontSize: '1.05rem', fontWeight: '800', color: 'var(--color-text-primary)' }}>
                      {sub.name || sub.subject_name || 'Unknown Course'}
                    </h3>
                    <span style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>
                      Code: {sub.code || sub.subject_code}
                    </span>
                  </div>

                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    borderTop: '1px solid var(--color-border)',
                    paddingTop: '12px'
                  }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Users size={14} style={{ color: 'var(--color-teacher)' }} />
                      <strong>{sub.strength || 0}</strong> Students enrolled
                    </span>

                    <button 
                      onClick={() => navigate(`/teacher/subject/${sub.subject_id || sub.id}/students`, { state: { subjectName: sub.name || sub.subject_name, divisionID: sub.division_id, divisionName: sub.division_name } })}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--color-teacher)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontSize: '0.85rem',
                        fontWeight: '700'
                      }}
                    >
                      Students <ArrowRight size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Past Sessions List */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--color-text-primary)' }}>
            Recent Attendance Sessions
          </h2>

          {sessionsLoading ? (
            <div style={{ display: 'flex', height: '150px', justifyContent: 'center', alignItems: 'center' }}>
              <div className="loading-spinner" style={{ color: 'var(--color-teacher)' }}></div>
            </div>
          ) : sessions.length === 0 ? (
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem', textAlign: 'center', padding: '24px' }}>
              No attendance records uploaded yet.
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

      </div>

      <style>{`
        .session-row:hover {
          background-color: rgba(245, 158, 11, 0.05) !important;
          border-color: rgba(245, 158, 11, 0.2) !important;
        }
      `}</style>

    </div>
  );
}
