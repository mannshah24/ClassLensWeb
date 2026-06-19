import React, { useEffect, useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { ApiServices } from '../../api/api';
import { useAuth } from '../../context/AuthContext';
import { ArrowLeft, Search, CheckCircle, XCircle, Undo, Save, AlertCircle } from 'lucide-react';

export default function TeacherAbsenteeList() {
  const { id } = useParams(); // Session ID
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const { subjectName, datetime } = location.state || {};

  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);
  const [saveLoading, setSaveLoading] = useState(false);

  // Core Data
  const [allStudents, setAllStudents] = useState([]);
  const [originalAbsentList, setOriginalAbsentList] = useState([]);
  
  // Running rosters
  const [presentList, setPresentList] = useState([]);
  const [absentList, setAbsentList] = useState([]);

  // UI state
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState(0); // 0 = Absent, 1 = Present

  useEffect(() => {
    if (id && user && user.userID) {
      loadData();
    }
  }, [id, user]);

  const loadData = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      // 1. Get Teacher Subjects to find the subjectID
      const subjects = await ApiServices.getTeacherSubjects({ teacherID: user.userID });
      let matchedSubject = subjects.find(s => (s.name || s.subject_name) === subjectName);
      
      let subjectID = null;
      if (matchedSubject) {
        subjectID = matchedSubject.subject_id || matchedSubject.id;
      } else if (subjects.length > 0) {
        // Fallback: match by code or take first if no direct name matches
        subjectID = subjects[0].subject_id || subjects[0].id;
      }

      if (!subjectID) {
        throw new Error('Course ID could not be resolved.');
      }

      // 2. Fetch Absent students for this session
      const absents = await ApiServices.getPresentAbsentStudents({ sessionID: parseInt(id, 10), isPresent: false });
      setOriginalAbsentList(absents);
      setAbsentList(absents);

      // 3. Fetch Present students for this session
      const presents = await ApiServices.getPresentAbsentStudents({ sessionID: parseInt(id, 10), isPresent: true });
      setPresentList(presents);

      // 4. Set all students as the union of presents and absents
      setAllStudents([...presents, ...absents]);

    } catch (err) {
      console.error(err);
      setErrorMsg('Failed to load student details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const toggleStudent = (student, isCurrentlyAbsent) => {
    if (isCurrentlyAbsent) {
      // Move from Absent to Present
      setAbsentList(prev => prev.filter(s => s.studentID !== student.studentID));
      
      // Re-construct student_list model if missing
      const fullDetails = allStudents.find(s => s.studentID === student.studentID) || {
        studentID: student.studentID,
        studentName: student.studentName,
        totalClasses: 0,
        attendedClasses: 0
      };
      setPresentList(prev => [...prev, fullDetails]);
    } else {
      // Move from Present to Absent
      setPresentList(prev => prev.filter(s => s.studentID !== student.studentID));
      
      // Re-construct present_absentees model
      const originalAbsent = originalAbsentList.find(s => s.studentID === student.studentID) || {
        studentID: student.studentID,
        studentName: student.studentName,
        studentPRN: student.studentPRN || 0
      };
      setAbsentList(prev => [...prev, originalAbsent]);
    }
  };

  const handleReset = () => {
    setAbsentList(originalAbsentList);
    const absentIds = new Set(originalAbsentList.map(s => s.studentID));
    const presents = allStudents.filter(s => !absentIds.has(s.studentID));
    setPresentList(presents);
    setSearchQuery('');
  };

  const handleSave = async () => {
    setSaveLoading(true);
    setErrorMsg(null);

    const originalAbsentIDs = new Set(originalAbsentList.map(s => s.studentID));
    const currentAbsentIDs = new Set(absentList.map(s => s.studentID));

    // Absent originally, now present (removed from absent list)
    const toMarkPresent = [...originalAbsentIDs].filter(id => !currentAbsentIDs.has(id));

    // Present originally, now absent (added to absent list)
    const toMarkAbsent = [...currentAbsentIDs].filter(id => !originalAbsentIDs.has(id));

    // Combine changed IDs
    const allChanged = [...toMarkPresent, ...toMarkAbsent];

    if (allChanged.length === 0) {
      setSaveLoading(false);
      navigate(`/teacher/session/${id}/result`, { state: { subjectName, datetime } });
      return;
    }

    try {
      const success = await ApiServices.changeAttendance({
        sessionID: parseInt(id, 10),
        studentList: allChanged
      });

      if (success) {
        navigate(`/teacher/session/${id}/result`, { state: { subjectName, datetime } });
      } else {
        setErrorMsg('Failed to save changes on the server.');
      }
    } catch (err) {
      setErrorMsg('Network error. Check connection and try again.');
    } finally {
      setSaveLoading(false);
    }
  };

  // Filter lists based on search
  const filteredAbsent = absentList.filter(s => 
    s.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.studentID.toString().includes(searchQuery) ||
    (s.studentPRN && s.studentPRN.toString().includes(searchQuery))
  );

  const filteredPresent = presentList.filter(s => 
    s.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.studentID.toString().includes(searchQuery)
  );

  const originalAbsentIDs = new Set(originalAbsentList.map(s => s.studentID));
  const currentAbsentIDs = new Set(absentList.map(s => s.studentID));
  const hasChanges = originalAbsentIDs.size !== currentAbsentIDs.size || 
    [...originalAbsentIDs].some(id => !currentAbsentIDs.has(id));

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '600px', margin: '0 auto', paddingBottom: '90px' }}>
      
      {/* Title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <button 
          onClick={() => navigate(`/teacher/session/${id}/result`, { state: { subjectName, datetime } })}
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
            Edit Attendance
          </h1>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.85rem' }}>
            Check/uncheck students to override status
          </p>
        </div>
      </div>

      {errorMsg && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          backgroundColor: 'var(--color-danger-light)',
          color: 'var(--color-danger-text)',
          padding: '12px',
          borderRadius: 'var(--radius-md)',
          fontSize: '0.85rem',
          fontWeight: '600'
        }}>
          <AlertCircle size={16} style={{ flexShrink: 0 }} />
          <span>{errorMsg}</span>
        </div>
      )}

      {loading ? (
        <div style={{ display: 'flex', height: '40vh', justifyContent: 'center', alignItems: 'center' }}>
          <div className="loading-spinner" style={{ color: 'var(--color-teacher)' }}></div>
        </div>
      ) : (
        <>
          {/* Search Bar */}
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
              placeholder="Search by student name or PRN..."
              className="form-input"
              style={{ paddingLeft: '44px' }}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Tabs */}
          <div style={{
            display: 'flex',
            background: 'rgba(255, 255, 255, 0.8)',
            borderRadius: '16px',
            padding: '4px',
            border: '1px solid var(--color-border)',
            boxShadow: '0 4px 10px rgba(0,0,0,0.02)'
          }}>
            <button
              onClick={() => setActiveTab(0)}
              style={{
                flex: 1,
                padding: '10px 0',
                borderRadius: '12px',
                border: 'none',
                fontWeight: '700',
                fontSize: '0.85rem',
                cursor: 'pointer',
                backgroundColor: activeTab === 0 ? 'var(--color-teacher)' : 'transparent',
                color: activeTab === 0 ? '#fff' : 'var(--color-text-secondary)',
                transition: 'all var(--transition-fast)'
              }}
            >
              Absent ({filteredAbsent.length})
            </button>
            <button
              onClick={() => setActiveTab(1)}
              style={{
                flex: 1,
                padding: '10px 0',
                borderRadius: '12px',
                border: 'none',
                fontWeight: '700',
                fontSize: '0.85rem',
                cursor: 'pointer',
                backgroundColor: activeTab === 1 ? 'var(--color-teacher)' : 'transparent',
                color: activeTab === 1 ? '#fff' : 'var(--color-text-secondary)',
                transition: 'all var(--transition-fast)'
              }}
            >
              Present ({filteredPresent.length})
            </button>
          </div>

          {/* Scrollable list */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {activeTab === 0 ? (
              filteredAbsent.length === 0 ? (
                <div className="glass-card" style={{ padding: '30px', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
                  No absent students match search.
                </div>
              ) : (
                filteredAbsent.map((st) => (
                  <div 
                    key={st.student_id} 
                    onClick={() => toggleStudent(st, true)}
                    className="glass-card" 
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '14px 20px',
                      cursor: 'pointer'
                    }}
                  >
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                      <span style={{ fontWeight: '700', fontSize: '0.95rem' }}>{st.student_name}</span>
                      <span style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>PRN: {st.studentPRN || 'N/A'}</span>
                    </div>
                    
                    <span style={{
                      padding: '6px 12px',
                      borderRadius: '20px',
                      fontSize: '0.75rem',
                      fontWeight: '700',
                      backgroundColor: 'var(--color-success-light)',
                      color: 'var(--color-success-text)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}>
                      Mark Present
                    </span>
                  </div>
                ))
              )
            ) : (
              filteredPresent.length === 0 ? (
                <div className="glass-card" style={{ padding: '30px', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
                  No present students match search.
                </div>
              ) : (
                filteredPresent.map((st) => (
                  <div 
                    key={st.student_id} 
                    onClick={() => toggleStudent(st, false)}
                    className="glass-card" 
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '14px 20px',
                      cursor: 'pointer'
                    }}
                  >
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                      <span style={{ fontWeight: '700', fontSize: '0.95rem' }}>{st.student_name}</span>
                      <span style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>ID: {st.studentID}</span>
                    </div>
                    
                    <span style={{
                      padding: '6px 12px',
                      borderRadius: '20px',
                      fontSize: '0.75rem',
                      fontWeight: '700',
                      backgroundColor: 'var(--color-danger-light)',
                      color: 'var(--color-danger-text)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}>
                      Mark Absent
                    </span>
                  </div>
                ))
              )
            )}
          </div>

          {/* Action buttons footer */}
          <div style={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            backgroundColor: '#ffffffd0',
            backdropFilter: 'blur(16px)',
            borderTop: '1px solid var(--color-border)',
            padding: '16px 24px env(safe-area-inset-bottom)',
            display: 'flex',
            gap: '16px',
            zIndex: 100
          }}>
            <div style={{ display: 'flex', gap: '16px', width: '100%', maxWidth: '600px', margin: '0 auto' }}>
              <button
                type="button"
                onClick={handleReset}
                className="btn btn-secondary"
                style={{ flex: 1, gap: '6px', fontWeight: '700' }}
              >
                <Undo size={16} /> Reset
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={saveLoading || !hasChanges}
                className="btn btn-primary"
                style={{ flex: 1, backgroundColor: 'var(--color-teacher)', gap: '6px', fontWeight: '700' }}
              >
                {saveLoading ? <div className="loading-spinner"></div> : <><Save size={16} /> Save Changes</>}
              </button>
            </div>
          </div>
        </>
      )}

    </div>
  );
}
