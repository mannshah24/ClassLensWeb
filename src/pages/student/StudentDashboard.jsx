import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { ApiServices } from '../../api/api';
import { BookOpen, User, Calendar, Award, CheckCircle, AlertTriangle, ArrowUpRight } from 'lucide-react';

export default function StudentDashboard() {
  const { user } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
    if (user && user.userID) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await ApiServices.getStudentDashboard({ studentId: user.userID });
      if (res.status) {
        setData(res.data);
      } else {
        setErrorMsg(res.message || 'Failed to load dashboard data.');
      }
    } catch (err) {
      setErrorMsg('Network error. Check connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', height: '60vh', justifyContent: 'center', alignItems: 'center' }}>
        <div className="loading-spinner" style={{ color: 'var(--color-student)' }}></div>
      </div>
    );
  }

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
        <AlertTriangle size={48} style={{ color: 'var(--color-danger)' }} />
        <p style={{ color: 'var(--color-text-secondary)' }}>{errorMsg}</p>
        <button onClick={fetchDashboardData} className="btn btn-primary" style={{ width: 'auto' }}>
          Retry
        </button>
      </div>
    );
  }

  const {
    student_name,
    prn,
    email,
    year,
    department_name,
    semester,
    overall_attendance,
    subjects = [],
    recent_activity = []
  } = data || {};

  const roundedOverall = overall_attendance !== null && overall_attendance !== undefined 
    ? Math.round(overall_attendance) 
    : 0;

  // Render color based on threshold (75% for default university rule)
  const getAttendanceColor = (pct) => {
    if (pct >= 75) return 'var(--color-success)';
    if (pct >= 60) return 'var(--color-warning)';
    return 'var(--color-danger)';
  };

  const getAttendanceBg = (pct) => {
    if (pct >= 75) return 'var(--color-success-light)';
    if (pct >= 60) return 'var(--color-warning-light)';
    return 'var(--color-danger-light)';
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Welcome Block */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: '800', color: 'var(--color-text-primary)' }}>
          Welcome, {student_name}!
        </h1>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.95rem' }}>
          PRN: {prn} • {department_name} (Year {year}, Sem {semester})
        </p>
      </div>

      {/* Overview Cards Row */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '20px'
      }}>
        {/* Attendance dial */}
        <div className="glass-card" style={{
          display: 'flex',
          alignItems: 'center',
          gap: '24px',
          padding: '24px'
        }}>
          {/* SVG Circular Dial */}
          <div style={{ position: 'relative', width: '90px', height: '90px', flexShrink: 0 }}>
            <svg width="90" height="90" viewBox="0 0 36 36" style={{ transform: 'rotate(-90deg)', width: '100%', height: '100%' }}>
              <path
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="rgba(0,0,0,0.05)"
                strokeWidth="3.2"
              />
              <path
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke={getAttendanceColor(roundedOverall)}
                strokeWidth="3.2"
                strokeDasharray={`${roundedOverall}, 100`}
                strokeLinecap="round"
                style={{ transition: 'stroke-dasharray 1s ease' }}
              />
            </svg>
            <div style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              fontWeight: '800',
              fontSize: '1.25rem',
              color: 'var(--color-text-primary)'
            }}>
              {roundedOverall}%
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-text-secondary)' }}>
              Overall Attendance
            </span>
            <h3 style={{ fontSize: '1.4rem', fontWeight: '800' }}>
              {roundedOverall >= 75 ? 'Safe Standing' : 'Below Threshold'}
            </h3>
            <span style={{ 
              fontSize: '0.8rem', 
              color: getAttendanceColor(roundedOverall),
              fontWeight: '600',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px'
            }}>
              {roundedOverall >= 75 ? <CheckCircle size={12} /> : <AlertTriangle size={12} />}
              Requires min 75% for examinations
            </span>
          </div>
        </div>

        {/* Subjects Streaks */}
        <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '50%',
            backgroundColor: 'var(--color-student-light)',
            color: 'var(--color-student)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <BookOpen size={24} />
          </div>
          <div>
            <span style={{ fontSize: '0.85rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-text-secondary)' }}>
              Course Enrollment
            </span>
            <h3 style={{ fontSize: '1.6rem', fontWeight: '800' }}>{subjects.length} Subjects</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>Enrolled for Semester {semester}</p>
          </div>
        </div>
      </div>

      {/* Main Grid: Subjects & Recent Activity */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr',
        gap: '24px'
      }}>
        {/* Subjects Details */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--color-text-primary)' }}>
            Course-wise Attendance
          </h2>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '16px'
          }}>
            {subjects.length === 0 ? (
              <div className="glass-card" style={{ textAlign: 'center', padding: '40px', color: 'var(--color-text-secondary)' }}>
                No subjects registered.
              </div>
            ) : (
              subjects.map((sub) => {
                const subPct = Math.round(sub.percentage || 0);
                return (
                  <div key={sub.id} className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        <h4 style={{ fontSize: '1rem', fontWeight: '700', color: 'var(--color-text-primary)' }}>
                          {sub.name}
                        </h4>
                        <span style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>
                          {sub.code} • {sub.teacher}
                        </span>
                      </div>
                      <span style={{
                        padding: '4px 8px',
                        borderRadius: '6px',
                        fontSize: '0.75rem',
                        fontWeight: '700',
                        backgroundColor: getAttendanceBg(subPct),
                        color: getAttendanceColor(subPct)
                      }}>
                        {subPct}%
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <div style={{
                        width: '100%',
                        height: '8px',
                        backgroundColor: 'rgba(0,0,0,0.05)',
                        borderRadius: '4px',
                        overflow: 'hidden'
                      }}>
                        <div style={{
                          width: `${subPct}%`,
                          height: '100%',
                          backgroundColor: getAttendanceColor(subPct),
                          borderRadius: '4px',
                          transition: 'width 0.8s ease'
                        }} />
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
                        <span>Classes Attended</span>
                        <span style={{ fontWeight: '600' }}>{sub.attended} / {sub.total}</span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxHeight: '420px' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--color-text-primary)' }}>
            Recent Activity
          </h2>
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            gap: '12px',
            overflowY: 'auto',
            paddingRight: '4px'
          }}>
            {recent_activity.length === 0 ? (
              <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem', textAlign: 'center', padding: '24px' }}>
                No recent attendance records found.
              </p>
            ) : (
              recent_activity.map((act, idx) => {
                const isPresent = act.status === 'Present';
                const formattedDate = new Date(act.date).toLocaleDateString('en-US', {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                });

                return (
                  <div key={idx} style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--color-border)',
                    backgroundColor: 'rgba(255,255,255,0.4)',
                    fontSize: '0.9rem'
                  }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                      <span style={{ fontWeight: '600', color: 'var(--color-text-primary)' }}>{act.subject}</span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>{formattedDate}</span>
                    </div>
                    <span style={{
                      padding: '4px 10px',
                      borderRadius: '20px',
                      fontSize: '0.75rem',
                      fontWeight: '700',
                      backgroundColor: isPresent ? 'var(--color-success-light)' : 'var(--color-danger-light)',
                      color: isPresent ? 'var(--color-success-text)' : 'var(--color-danger-text)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}>
                      <span style={{
                        width: '6px',
                        height: '6px',
                        borderRadius: '50%',
                        backgroundColor: isPresent ? 'var(--color-success)' : 'var(--color-danger)'
                      }} />
                      {act.status}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
