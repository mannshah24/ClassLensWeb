import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { ApiServices } from '../../api/api';
import { User, Mail, Bookmark, Calendar, BookOpen, Users, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function TeacherProfile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
    if (user && user.userID) {
      fetchTeacherProfile();
    }
  }, [user]);

  const fetchTeacherProfile = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const data = await ApiServices.getTeacherProfile({ teacherID: user.userID });
      setProfile(data);
    } catch (err) {
      setErrorMsg('Failed to load profile details.');
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
        <div className="loading-spinner" style={{ color: 'var(--color-teacher)' }}></div>
      </div>
    );
  }

  if (errorMsg || !profile) {
    return (
      <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', padding: '30px', textAlign: 'center' }}>
        <AlertCircle size={36} style={{ color: 'var(--color-danger)' }} />
        <p>{errorMsg || 'Failed to load profile details'}</p>
        <button onClick={fetchTeacherProfile} className="btn btn-primary" style={{ width: 'auto' }}>Retry</button>
      </div>
    );
  }

  const { name, email, totalSubjects, totalStudents, department, dateJoined } = profile;

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '600px', margin: '0 auto' }}>
      
      {/* Title */}
      <div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: '800', color: 'var(--color-text-primary)' }}>
          My Profile
        </h1>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.95rem' }}>
          Personal registration details and administrative statistics
        </p>
      </div>

      {/* Main Profile Info Card */}
      <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            backgroundColor: 'var(--color-teacher)',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.8rem',
            fontWeight: 'bold',
            fontFamily: 'var(--font-heading)'
          }}>
            {name ? name.charAt(0).toUpperCase() : 'T'}
          </div>
          <div>
            <h2 style={{ fontSize: '1.3rem', fontWeight: '800' }}>{name}</h2>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.85rem' }}>
              University Faculty Member
            </p>
          </div>
        </div>

        <hr style={{ border: 'none', borderTop: '1px solid var(--color-border)', margin: '4px 0' }} />

        {/* Detailed Fields */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          <div style={{ display: 'flex', gap: '16px' }}>
            <User size={20} style={{ color: 'var(--color-teacher)', flexShrink: 0 }} />
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: '600', color: 'var(--color-text-light)' }}>Faculty ID</span>
              <span style={{ fontSize: '0.95rem', fontWeight: '600' }}>{user.userID}</span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '16px' }}>
            <Mail size={20} style={{ color: 'var(--color-teacher)', flexShrink: 0 }} />
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: '600', color: 'var(--color-text-light)' }}>Faculty Email Address</span>
              <span style={{ fontSize: '0.95rem', fontWeight: '600' }}>{email}</span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '16px' }}>
            <Bookmark size={20} style={{ color: 'var(--color-teacher)', flexShrink: 0 }} />
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: '600', color: 'var(--color-text-light)' }}>Department</span>
              <span style={{ fontSize: '0.95rem', fontWeight: '600' }}>{department || 'N/A'}</span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '16px' }}>
            <Calendar size={20} style={{ color: 'var(--color-teacher)', flexShrink: 0 }} />
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: '600', color: 'var(--color-text-light)' }}>Member Since</span>
              <span style={{ fontSize: '0.95rem', fontWeight: '600' }}>
                {dateJoined ? dateJoined.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A'}
              </span>
            </div>
          </div>

        </div>
      </div>

      {/* Stats Cards Row */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '20px'
      }}>
        <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px 20px' }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            backgroundColor: 'var(--color-teacher-light)',
            color: 'var(--color-teacher)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <BookOpen size={20} />
          </div>
          <div>
            <span style={{ fontSize: '0.7rem', fontWeight: '600', color: 'var(--color-text-light)', display: 'block' }}>SUBJECTS</span>
            <span style={{ fontSize: '1.2rem', fontWeight: '800' }}>{totalSubjects} Course(s)</span>
          </div>
        </div>

        <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px 20px' }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            backgroundColor: 'var(--color-teacher-light)',
            color: 'var(--color-teacher)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <Users size={20} />
          </div>
          <div>
            <span style={{ fontSize: '0.7rem', fontWeight: '600', color: 'var(--color-text-light)', display: 'block' }}>TOTAL ENROLLMENT</span>
            <span style={{ fontSize: '1.2rem', fontWeight: '800' }}>{totalStudents} Student(s)</span>
          </div>
        </div>
      </div>

      {/* Sign Out Button */}
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
  );
}
