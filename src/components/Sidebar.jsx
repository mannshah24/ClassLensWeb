import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, Calendar, Camera, User, ClipboardList, History } from 'lucide-react';

export default function Sidebar() {
  const { isStudent, user } = useAuth();

  if (!user) return null;

  const links = isStudent 
    ? [
        { to: '/student', label: 'Dashboard', icon: LayoutDashboard },
        { to: '/student/schedule', label: 'Schedule', icon: Calendar },
        { to: '/student/face-update', label: 'Register Face', icon: Camera },
        { to: '/student/profile', label: 'Profile', icon: User },
      ]
    : [
        { to: '/teacher', label: 'Dashboard', icon: LayoutDashboard },
        { to: '/teacher/take-attendance', label: 'Attendance', icon: ClipboardList },
        { to: '/teacher/sessions', label: 'Sessions', icon: History },
        { to: '/teacher/profile', label: 'Profile', icon: User },
      ];

  const getThemeColor = () => {
    return isStudent ? 'var(--color-student)' : 'var(--color-teacher)';
  };

  return (
    <>
      {/* Sidebar for Desktop */}
      <aside className="desktop-sidebar" style={{
        width: '260px',
        background: '#fff',
        borderRight: '1px solid var(--color-border)',
        display: 'flex',
        flexDirection: 'column',
        padding: '24px 16px',
        gap: '8px',
        position: 'sticky',
        top: '71px',
        height: 'calc(100vh - 71px)',
        zIndex: 5
      }}>
        {links.map((link) => {
          const Icon = link.icon;
          return (
            <NavLink
              key={link.to}
              to={link.to}
              end
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 16px',
                borderRadius: 'var(--radius-md)',
                textDecoration: 'none',
                fontWeight: '600',
                fontSize: '0.95rem',
                color: isActive ? '#fff' : 'var(--color-text-secondary)',
                backgroundColor: isActive ? getThemeColor() : 'transparent',
                transition: 'all var(--transition-fast)'
              })}
              className="sidebar-link"
            >
              <Icon size={18} />
              {link.label}
            </NavLink>
          );
        })}
      </aside>

      {/* Bottom Navigation for Mobile Devices */}
      <nav className="mobile-nav" style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        height: '64px',
        backgroundColor: '#ffffffd0',
        backdropFilter: 'blur(20px)',
        borderTop: '1px solid var(--color-border)',
        display: 'flex',
        justifyContent: 'space-around',
        alignItems: 'center',
        zIndex: 90,
        paddingBottom: 'env(safe-area-inset-bottom)' // for iOS notched devices
      }}>
        {links.map((link) => {
          const Icon = link.icon;
          return (
            <NavLink
              key={link.to}
              to={link.to}
              end
              style={({ isActive }) => ({
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '4px',
                textDecoration: 'none',
                fontSize: '0.75rem',
                fontWeight: '600',
                color: isActive ? getThemeColor() : 'var(--color-text-secondary)',
                width: '25%',
                height: '100%',
                transition: 'color var(--transition-fast)'
              })}
            >
              <Icon size={20} />
              <span>{link.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Media query styling inserted into DOM via simple style block */}
      <style>{`
        @media (max-width: 767px) {
          .desktop-sidebar {
            display: none !important;
          }
          .main-content-layout {
            padding-bottom: 80px !important; /* Space for bottom nav bar */
          }
        }
        @media (min-width: 768px) {
          .mobile-nav {
            display: none !important;
          }
        }
        .sidebar-link:not(.active):hover {
          background-color: rgba(0, 0, 0, 0.02) !important;
          color: var(--color-text-primary) !important;
        }
      `}</style>
    </>
  );
}
