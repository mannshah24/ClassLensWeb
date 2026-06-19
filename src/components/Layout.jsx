import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';
import { useAuth } from '../context/AuthContext';

export default function Layout() {
  const { isStudent } = useAuth();
  const themeClass = isStudent ? 'student-theme' : 'teacher-theme';

  return (
    <div className={`app-container ${themeClass}`} style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Background Animated Blobs */}
      <div className="bg-blob-container">
        <div className="bg-blob bg-blob-1 app-blob-1" />
        <div className="bg-blob bg-blob-2 app-blob-2" />
      </div>

      {/* Sticky Header */}
      <Header />

      {/* Main Body */}
      <div style={{ display: 'flex', flex: 1, position: 'relative' }}>
        <Sidebar />
        
        {/* Main Content Area */}
        <main className="main-content-layout" style={{
          flex: 1,
          padding: '24px',
          overflowY: 'auto',
          position: 'relative'
        }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
