import React from 'react';
import { useAuth } from '../context/AuthContext';
import { School, LogOut, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Header() {
  const { user, logout, isStudent } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const getThemeColor = () => {
    if (!user) return 'var(--color-primary)';
    return isStudent ? 'var(--color-student)' : 'var(--color-teacher)';
  };

  return (
    <header style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '16px 24px',
      background: 'rgba(255, 255, 255, 0.8)',
      backdropFilter: 'blur(12px)',
      borderBottom: '1px solid var(--color-border)',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      boxShadow: '0 2px 10px rgba(0,0,0,0.02)'
    }}>
      <div 
        style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}
        onClick={() => navigate(isStudent ? '/student' : '/teacher')}
      >
        <div style={{
          width: '38px',
          height: '38px',
          borderRadius: '50%',
          backgroundColor: getThemeColor(),
          color: '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <School size={20} />
        </div>
        <span style={{
          fontSize: '1.3rem',
          fontWeight: '800',
          color: 'var(--color-text-primary)',
          fontFamily: 'var(--font-heading)'
        }}>
          ClassLens
        </span>
      </div>

      {user && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px',
            backgroundColor: 'rgba(0,0,0,0.02)',
            padding: '6px 12px',
            borderRadius: '20px',
            border: '1px solid var(--color-border)'
          }}>
            <User size={14} style={{ color: getThemeColor() }} />
            <span style={{ 
              fontSize: '0.85rem', 
              fontWeight: '600', 
              color: 'var(--color-text-primary)' 
            }}>
              {user.userName}
            </span>
            <span style={{
              fontSize: '0.75rem',
              fontWeight: '700',
              textTransform: 'uppercase',
              color: getThemeColor(),
              backgroundColor: isStudent ? 'var(--color-student-light)' : 'var(--color-teacher-light)',
              padding: '2px 6px',
              borderRadius: '4px'
            }}>
              {user.userType}
            </span>
          </div>

          <button
            onClick={handleLogout}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--color-text-secondary)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '8px',
              borderRadius: '50%',
              transition: 'background-color var(--transition-fast), color var(--transition-fast)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--color-danger-light)';
              e.currentTarget.style.color = 'var(--color-danger-text)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = 'var(--color-text-secondary)';
            }}
            title="Log Out"
          >
            <LogOut size={18} />
          </button>
        </div>
      )}
    </header>
  );
}
