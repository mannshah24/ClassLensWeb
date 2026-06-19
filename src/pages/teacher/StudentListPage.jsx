import React, { useEffect, useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { ApiServices } from '../../api/api';
import { ArrowLeft, Search, AlertTriangle, Users, BookOpen, Clock, Calendar, Check, X } from 'lucide-react';

export default function StudentListPage() {
  const { subjectId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const { subjectName, divisionID, divisionName } = location.state || {};

  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [errorMsg, setErrorMsg] = useState(null);

  // Selected student for detailed view
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentRecords, setStudentRecords] = useState([]);
  const [recordsLoading, setRecordsLoading] = useState(false);

  useEffect(() => {
    if (subjectId) {
      fetchStudentList();
    }
  }, [subjectId]);

  const fetchStudentList = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const list = await ApiServices.getStudentList({
        subjectID: parseInt(subjectId, 10),
        divisionID: divisionID ? parseInt(divisionID, 10) : null
      });
      setStudents(list);
    } catch (err) {
      setErrorMsg('Failed to load course students.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectStudent = async (student) => {
    if (selectedStudent && selectedStudent.studentID === student.studentID) {
      // Toggle close
      setSelectedStudent(null);
      setStudentRecords([]);
      return;
    }

    setSelectedStudent(student);
    setRecordsLoading(true);
    try {
      const allRecords = await ApiServices.getStudentSubjectAttendance({
        subjectId: parseInt(subjectId, 10),
        divisionId: divisionID ? parseInt(divisionID, 10) : null
      });
      
      // Filter records specifically for this student
      const filtered = allRecords.filter(rec => rec.student_id === student.studentID);
      // Sort by class_datetime descending (recent first)
      filtered.sort((a, b) => new Date(b.class_datetime) - new Date(a.class_datetime));
      setStudentRecords(filtered);
    } catch (err) {
      console.warn('Failed to load student attendance logs:', err);
    } finally {
      setRecordsLoading(false);
    }
  };

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

  const filteredStudents = students.filter(st =>
    st.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    st.studentID.toString().includes(searchQuery)
  );

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '700px', margin: '0 auto' }}>
      
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
            Course Students
          </h1>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.85rem' }}>
            Check overall metrics and individual student logs
          </p>
        </div>
      </div>

      {/* Meta Card */}
      <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '20px', padding: '20px' }}>
        <div style={{
          width: '48px',
          height: '48px',
          borderRadius: '50%',
          backgroundColor: 'var(--color-teacher-light)',
          color: 'var(--color-teacher)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0
        }}>
          <BookOpen size={22} />
        </div>
        <div>
          <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--color-text-primary)' }}>
            {subjectName || 'Course'}
          </h3>
          <span style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
            Division: {divisionName || 'General'} • {students.length} Student(s) enrolled
          </span>
        </div>
      </div>

      {errorMsg ? (
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', padding: '30px', textAlign: 'center' }}>
          <AlertTriangle size={36} style={{ color: 'var(--color-danger)' }} />
          <p>{errorMsg}</p>
          <button onClick={fetchStudentList} className="btn btn-primary" style={{ width: 'auto' }}>Retry</button>
        </div>
      ) : loading ? (
        <div style={{ display: 'flex', height: '40vh', justifyContent: 'center', alignItems: 'center' }}>
          <div className="loading-spinner" style={{ color: 'var(--color-teacher)' }}></div>
        </div>
      ) : (
        <>
          {/* Search bar */}
          <div style={{ position: 'relative' }}>
            <Search size={18} style={{
              position: 'absolute',
              left: '14px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--color-text-light)'
            }} />
            <input
              type="text"
              placeholder="Search students by name or ID..."
              className="form-input"
              style={{ paddingLeft: '44px' }}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Roster Cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {filteredStudents.length === 0 ? (
              <div className="glass-card" style={{ padding: '30px', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
                No students match query.
              </div>
            ) : (
              filteredStudents.map((st) => {
                const pct = Math.round(st.attendance_percentage || 0);
                const isSelected = selectedStudent && selectedStudent.studentID === st.studentID;

                return (
                  <div key={st.studentID} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <div 
                      onClick={() => handleSelectStudent(st)}
                      className="glass-card" 
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '14px 20px',
                        cursor: 'pointer',
                        borderLeft: isSelected ? '4px solid var(--color-teacher)' : '1px solid var(--glass-border)'
                      }}
                    >
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        <span style={{ fontWeight: '700', fontSize: '0.95rem' }}>{st.studentName}</span>
                        <span style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>
                          ID: {st.studentID} • Attended: {st.attended_classes} / {st.total_classes}
                        </span>
                      </div>

                      <span style={{
                        padding: '4px 10px',
                        borderRadius: '8px',
                        fontSize: '0.8rem',
                        fontWeight: '700',
                        backgroundColor: getAttendanceBg(pct),
                        color: getAttendanceColor(pct)
                      }}>
                        {pct}%
                      </span>
                    </div>

                    {/* Collapsible detail drawer */}
                    {isSelected && (
                      <div style={{
                        margin: '0 8px 12px 8px',
                        padding: '16px',
                        backgroundColor: 'rgba(255,255,255,0.5)',
                        border: '1px solid var(--color-border)',
                        borderTop: 'none',
                        borderRadius: '0 0 var(--radius-md) var(--radius-md)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '12px',
                        animation: 'fadeIn var(--transition-fast)'
                      }}>
                        <h4 style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--color-text-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Clock size={14} /> Chronological Session Log
                        </h4>

                        {recordsLoading ? (
                          <div style={{ display: 'flex', padding: '12px 0', justifyContent: 'center' }}>
                            <div className="loading-spinner" style={{ width: '18px', height: '18px', color: 'var(--color-teacher)' }}></div>
                          </div>
                        ) : studentRecords.length === 0 ? (
                          <span style={{ fontSize: '0.82rem', color: 'var(--color-text-light)', textAlign: 'center' }}>
                            No session history records found.
                          </span>
                        ) : (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '180px', overflowY: 'auto' }}>
                            {studentRecords.map((rec) => {
                              const isPresent = rec.status === true || rec.status === 'true';
                              const recDate = new Date(rec.class_datetime || rec.marked_at).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              });

                              return (
                                <div key={rec.class_session_id} style={{
                                  display: 'flex',
                                  justifyContent: 'space-between',
                                  alignItems: 'center',
                                  fontSize: '0.8rem',
                                  padding: '6px 12px',
                                  backgroundColor: '#fff',
                                  borderRadius: '6px',
                                  border: '1px solid var(--color-border)'
                                }}>
                                  <span style={{ color: 'var(--color-text-secondary)', fontWeight: '500' }}>
                                    {recDate}
                                  </span>
                                  <span style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '4px',
                                    fontWeight: '700',
                                    color: isPresent ? 'var(--color-success)' : 'var(--color-danger)'
                                  }}>
                                    {isPresent ? <Check size={12} /> : <X size={12} />}
                                    {isPresent ? 'Present' : 'Absent'}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </>
      )}

    </div>
  );
}
