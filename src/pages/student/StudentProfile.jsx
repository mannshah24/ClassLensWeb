import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { ApiServices } from '../../api/api';
import { User, Mail, ShieldAlert, Award, Calendar, Bookmark, LogOut, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function StudentProfile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
    if (user && user.userID) {
      fetchStudentProfile();
    }
  }, [user]);

  const fetchStudentProfile = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      // Re-use student dashboard endpoint as it returns the full profile data
      const res = await ApiServices.getStudentDashboard({ studentId: user.userID });
      if (res.status) {
        setProfile(res.data);
      } else {
        setErrorMsg('Failed to load profile details.');
      }
    } catch (err) {
      setErrorMsg('Network error. Check connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', height: '50vh', justifyContent: 'center', alignItems: 'center' }}>
        <div className="loading-spinner" style={{ color: 'var(--color-student)' }}></div>
      </div>
    );
  }

  if (errorMsg || !profile) {
    return (
      <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', padding: '30px', textAlign: 'center' }}>
        <ShieldAlert size={36} style={{ color: 'var(--color-danger)' }} />
        <p>{errorMsg || 'Failed to load profile details'}</p>
        <button onClick={fetchStudentProfile} className="btn btn-primary" style={{ width: 'auto' }}>Retry</button>
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
    subjects = []
  } = profile;

  const attendancePct = Math.round(overall_attendance || 0);
  const totalAttended = (subjects || []).reduce((sum, sub) => sum + (sub.attended || 0), 0);
  const totalClasses = (subjects || []).reduce((sum, sub) => sum + (sub.total || 0), 0);

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '600px', margin: '0 auto' }}>
      
      {/* Title */}
      <div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: '800', color: 'var(--color-text-primary)' }}>
          My Profile
        </h1>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.95rem' }}>
          Personal registration details and attendance overview
        </p>
      </div>

      {/* Main Profile Info Card */}
      <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            backgroundColor: 'var(--color-student)',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.8rem',
            fontWeight: 'bold',
            fontFamily: 'var(--font-heading)'
          }}>
            {student_name ? student_name.charAt(0).toUpperCase() : 'S'}
          </div>
          <div>
            <h2 style={{ fontSize: '1.3rem', fontWeight: '800' }}>{student_name}</h2>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.85rem' }}>
              Student Enrollment Portal
            </p>
          </div>
        </div>

        <hr style={{ border: 'none', borderTop: '1px solid var(--color-border)' }} />

        {/* Detailed Fields */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          <div style={{ display: 'flex', gap: '16px' }}>
            <User size={20} style={{ color: 'var(--color-student)', flexShrink: 0 }} />
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: '600', color: 'var(--color-text-light)' }}>PRN (Permanent Registration Number)</span>
              <span style={{ fontSize: '0.95rem', fontWeight: '600' }}>{prn}</span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '16px' }}>
            <Mail size={20} style={{ color: 'var(--color-student)', flexShrink: 0 }} />
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: '600', color: 'var(--color-text-light)' }}>University Email Address</span>
              <span style={{ fontSize: '0.95rem', fontWeight: '600' }}>{email}</span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '16px' }}>
            <Bookmark size={20} style={{ color: 'var(--color-student)', flexShrink: 0 }} />
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: '600', color: 'var(--color-text-light)' }}>Department</span>
              <span style={{ fontSize: '0.95rem', fontWeight: '600' }}>{department_name || 'General Engineering'}</span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '16px' }}>
            <Calendar size={20} style={{ color: 'var(--color-student)', flexShrink: 0 }} />
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: '600', color: 'var(--color-text-light)' }}>Academic Position</span>
              <span style={{ fontSize: '0.95rem', fontWeight: '600' }}>Year {year} • Semester {semester}</span>
            </div>
          </div>

        </div>
      </div>

      {/* Attendance Summary Panel */}
      <div className="glass-card" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '20px 24px',
        borderLeft: '5px solid var(--color-student)'
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--color-text-secondary)' }}>
            Attendance Status
          </span>
          <h4 style={{ fontSize: '1.1rem', fontWeight: '700' }}>
            Overall: {attendancePct}%
          </h4>
          <span style={{ 
            fontSize: '0.78rem', 
            color: 'var(--color-text-secondary)',
            fontWeight: '600',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px'
          }}>
            <CheckCircle size={12} style={{ color: 'var(--color-student)' }} />
            Attended {totalAttended} of {totalClasses} classes
          </span>
        </div>
        
        <div style={{
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          backgroundColor: 'var(--color-student-light)',
          color: 'var(--color-student)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <Award size={28} />
        </div>
      </div>

      {/* Profile Actions */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <button 
          onClick={() => navigate('/student/face-update')}
          className="btn btn-secondary" 
          style={{ justifyContent: 'center', fontWeight: '700' }}
        >
          Update Face Template
        </button>

        <button 
          onClick={handleLogout}
          className="btn btn-primary" 
          style={{ 
            justifyContent: 'center', 
            backgroundColor: 'var(--color-danger)',
            fontWeight: '700'
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--color-danger-text)'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--color-danger)'}
        >
          <LogOut size={16} /> Sign Out
        </button>
      </div>

    </div>
  );
}
