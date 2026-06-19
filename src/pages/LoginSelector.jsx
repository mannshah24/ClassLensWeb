import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { School, BookOpen, GraduationCap } from 'lucide-react';

export default function LoginSelector() {
  const { isAuthenticated, isStudent, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // If already logged in, redirect directly to dashboard
    if (isAuthenticated) {
      navigate(isStudent ? '/student' : '/teacher');
    }
  }, [isAuthenticated, isStudent, navigate]);

  if (loading) {
    return (
      <div style={{ display: 'flex', height: '100vh', width: '100vw', justifyContent: 'center', alignItems: 'center' }}>
        <div className="loading-spinner" style={{ color: 'var(--color-primary)' }}></div>
      </div>
    );
  }

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      minHeight: '100vh',
      width: '100vw',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '24px',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Background blobs matching the general look */}
      <div className="bg-blob-container">
        <div className="bg-blob bg-blob-1" style={{ backgroundColor: 'var(--color-student-light)' }} />
        <div className="bg-blob bg-blob-2" style={{ backgroundColor: 'var(--color-primary-light)' }} />
      </div>

      <div className="animate-fade-in" style={{
        width: '100%',
        maxWidth: '440px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center'
      }}>
        {/* App Logo */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          marginBottom: '8px'
        }}>
          <School size={36} style={{ color: 'var(--color-text-primary)' }} />
          <h1 style={{
            fontSize: '2.2rem',
            fontWeight: '800',
            color: 'var(--color-text-primary)'
          }}>
            ClassLens
          </h1>
        </div>

        <p style={{
          fontSize: '1.1rem',
          color: 'var(--color-text-secondary)',
          fontWeight: '500',
          marginBottom: '40px'
        }}>
          Choose Your Role
        </p>

        {/* Role Cards */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '24px',
          width: '100%'
        }}>
          {/* Student Card */}
          <div 
            onClick={() => navigate('/login/student')}
            className="glass-card" 
            style={{
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              padding: '30px 24px',
              borderLeft: '4px solid var(--color-student)'
            }}
          >
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              backgroundColor: 'var(--color-student-light)',
              color: 'var(--color-student)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '16px'
            }}>
              <GraduationCap size={28} />
            </div>
            <h3 style={{
              fontSize: '1.25rem',
              fontWeight: '700',
              color: 'var(--color-text-primary)',
              marginBottom: '6px'
            }}>
              Login as a Student
            </h3>
            <p style={{
              fontSize: '0.9rem',
              color: 'var(--color-text-secondary)',
              lineHeight: '1.4'
            }}>
              Access your courses, attendance records, and weekly timetables.
            </p>
          </div>

          {/* Teacher Card */}
          <div 
            onClick={() => navigate('/login/teacher')}
            className="glass-card" 
            style={{
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              padding: '30px 24px',
              borderLeft: '4px solid var(--color-teacher)'
            }}
          >
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              backgroundColor: 'var(--color-teacher-light)',
              color: 'var(--color-teacher)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '16px'
            }}>
              <BookOpen size={28} />
            </div>
            <h3 style={{
              fontSize: '1.25rem',
              fontWeight: '700',
              color: 'var(--color-text-primary)',
              marginBottom: '6px'
            }}>
              Login as Teacher
            </h3>
            <p style={{
              fontSize: '0.9rem',
              color: 'var(--color-text-secondary)',
              lineHeight: '1.4'
            }}>
              Manage classes, track attendance sessions, and gain student insights.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div style={{ marginTop: '48px' }}>
          <button style={{
            background: 'none',
            border: 'none',
            color: 'var(--color-text-secondary)',
            fontWeight: '600',
            fontSize: '0.9rem',
            cursor: 'pointer',
            textDecoration: 'underline'
          }}>
            Need help? Contact support
          </button>
        </div>
      </div>
    </div>
  );
}
