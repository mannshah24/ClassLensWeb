import React, { useEffect, useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { ApiServices } from '../../api/api';
import { ArrowLeft, UserCheck, UserX, Edit3, Calendar, AlertTriangle } from 'lucide-react';

export default function TeacherAttendanceResult() {
  const { id } = useParams(); // ClassSession ID
  const navigate = useNavigate();
  const location = useLocation();

  const { subjectName, datetime } = location.state || {};

  const [loading, setLoading] = useState(true);
  const [presentStudents, setPresentStudents] = useState([]);
  const [absentStudents, setAbsentStudents] = useState([]);
  const [errorMsg, setErrorMsg] = useState(null);

  // Tab selector: 0 = Present, 1 = Absent
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    if (id) {
      fetchSessionResults();
    }
  }, [id]);

  const fetchSessionResults = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const [pList, aList] = await Promise.all([
        ApiServices.getPresentAbsentStudents({ sessionID: parseInt(id, 10), isPresent: true }),
        ApiServices.getPresentAbsentStudents({ sessionID: parseInt(id, 10), isPresent: false })
      ]);
      setPresentStudents(pList);
      setAbsentStudents(aList);
    } catch (err) {
      setErrorMsg('Failed to load session details.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', height: '60vh', justifyContent: 'center', alignItems: 'center' }}>
        <div className="loading-spinner" style={{ color: 'var(--color-teacher)' }}></div>
      </div>
    );
  }

  if (errorMsg) {
    return (
      <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', padding: '30px', textAlign: 'center' }}>
        <AlertTriangle size={36} style={{ color: 'var(--color-danger)' }} />
        <p>{errorMsg}</p>
        <button onClick={fetchSessionResults} className="btn btn-primary" style={{ width: 'auto' }}>Retry</button>
      </div>
    );
  }

  const total = presentStudents.length + absentStudents.length;
  const presentPct = total > 0 ? Math.round((presentStudents.length / total) * 100) : 0;

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '700px', margin: '0 auto' }}>
      
      {/* Title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <button 
          onClick={() => navigate('/teacher')}
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            backgroundColor: '#fff',
            border: '1px solid var(--color-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: 'var(--color-text-primary)'
          }}
        >
          <ArrowLeft size={16} />
        </button>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--color-text-primary)' }}>
            Attendance Result
          </h1>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.85rem' }}>
            Verify scanned records and manually override if required
          </p>
        </div>
      </div>

      {/* Meta details card */}
      <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '12px', padding: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--color-text-primary)' }}>
              {subjectName || 'Class Session'}
            </h3>
            <span style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
              <Calendar size={14} /> {datetime || 'Recently marked'}
            </span>
          </div>
          
          <button
            onClick={() => navigate(`/teacher/session/${id}/edit`, { state: { subjectName, datetime } })}
            className="btn btn-secondary"
            style={{ width: 'auto', padding: '8px 16px', fontSize: '0.85rem', fontWeight: '700', gap: '6px' }}
          >
            <Edit3 size={14} /> Edit Students
          </button>
        </div>

        <hr style={{ border: 'none', borderTop: '1px solid var(--color-border)', margin: '4px 0' }} />

        {/* Stats Row */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '12px',
          textAlign: 'center'
        }}>
          <div>
            <span style={{ fontSize: '0.75rem', fontWeight: '600', color: 'var(--color-text-light)', display: 'block' }}>Strength</span>
            <span style={{ fontSize: '1.3rem', fontWeight: '800', color: 'var(--color-text-primary)' }}>{total}</span>
          </div>
          <div>
            <span style={{ fontSize: '0.75rem', fontWeight: '600', color: 'var(--color-text-light)', display: 'block' }}>Present</span>
            <span style={{ fontSize: '1.3rem', fontWeight: '800', color: 'var(--color-success)' }}>{presentStudents.length} ({presentPct}%)</span>
          </div>
          <div>
            <span style={{ fontSize: '0.75rem', fontWeight: '600', color: 'var(--color-text-light)', display: 'block' }}>Absent</span>
            <span style={{ fontSize: '1.3rem', fontWeight: '800', color: 'var(--color-danger)' }}>{absentStudents.length}</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{
        display: 'flex',
        borderBottom: '2px solid var(--color-border)',
        gap: '24px'
      }}>
        <button
          onClick={() => setActiveTab(0)}
          style={{
            padding: '12px 4px',
            border: 'none',
            background: 'none',
            fontSize: '0.95rem',
            fontWeight: '700',
            cursor: 'pointer',
            color: activeTab === 0 ? 'var(--color-teacher-text)' : 'var(--color-text-secondary)',
            borderBottom: activeTab === 0 ? '3px solid var(--color-teacher)' : '3px solid transparent',
            marginBottom: '-2px',
            transition: 'all var(--transition-fast)'
          }}
        >
          Present ({presentStudents.length})
        </button>
        <button
          onClick={() => setActiveTab(1)}
          style={{
            padding: '12px 4px',
            border: 'none',
            background: 'none',
            fontSize: '0.95rem',
            fontWeight: '700',
            cursor: 'pointer',
            color: activeTab === 1 ? 'var(--color-teacher-text)' : 'var(--color-text-secondary)',
            borderBottom: activeTab === 1 ? '3px solid var(--color-teacher)' : '3px solid transparent',
            marginBottom: '-2px',
            transition: 'all var(--transition-fast)'
          }}
        >
          Absent ({absentStudents.length})
        </button>
      </div>

      {/* Student List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {activeTab === 0 ? (
          presentStudents.length === 0 ? (
            <div className="glass-card" style={{ padding: '30px', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
              No students marked present.
            </div>
          ) : (
            presentStudents.map((st) => (
              <div key={st.student_id} className="glass-card" style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '14px 20px'
              }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  <span style={{ fontWeight: '700', fontSize: '0.95rem' }}>{st.student_name}</span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>PRN: {st.student_prn}</span>
                </div>
                <UserCheck size={20} style={{ color: 'var(--color-success)' }} />
              </div>
            ))
          )
        ) : (
          absentStudents.length === 0 ? (
            <div className="glass-card" style={{ padding: '30px', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
              All students are marked present.
            </div>
          ) : (
            absentStudents.map((st) => (
              <div key={st.student_id} className="glass-card" style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '14px 20px'
              }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  <span style={{ fontWeight: '700', fontSize: '0.95rem' }}>{st.student_name}</span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>PRN: {st.student_prn}</span>
                </div>
                <UserX size={20} style={{ color: 'var(--color-danger)' }} />
              </div>
            ))
          )
        )}
      </div>

    </div>
  );
}
