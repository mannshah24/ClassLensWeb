import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { ApiServices } from '../../api/api';
import CameraCapture from '../../components/CameraCapture';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, BookOpen, Layers, CheckCircle2, AlertCircle } from 'lucide-react';

export default function TeacherTakeAttendance() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [subjectsLoading, setSubjectsLoading] = useState(true);
  const [subjects, setSubjects] = useState([]);
  
  // Selection States
  const [selectedSubjectId, setSelectedSubjectId] = useState('');
  const [divisionId, setDivisionId] = useState('');
  const [divisionName, setDivisionName] = useState('');
  const [departmentName, setDepartmentName] = useState('');
  const [year, setYear] = useState('');
  const [semester, setSemester] = useState('');
  
  // Upload States
  const [photos, setPhotos] = useState([]);
  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
    if (user && user.userID) {
      fetchSubjects();
    }
  }, [user]);

  const fetchSubjects = async () => {
    try {
      const list = await ApiServices.getTeacherSubjects({ teacherID: user.userID });
      setSubjects(list);
      
      // Auto-select first subject if available
      if (list.length > 0) {
        handleSubjectChange(list[0].subject_id || list[0].id, list);
      }
    } catch (err) {
      setErrorMsg('Failed to load courses.');
    } finally {
      setSubjectsLoading(false);
    }
  };

  const handleSubjectChange = (subId, subjectList = subjects) => {
    setSelectedSubjectId(subId);
    
    // Find details of the selected subject
    const selectedSub = subjectList.find(s => (s.subject_id || s.id).toString() === subId.toString());
    if (selectedSub) {
      setDivisionId(selectedSub.division_id || '');
      setDivisionName(selectedSub.division_name || 'General');
      
      // Extract other metadata
      setDepartmentName(selectedSub.department_name || selectedSub.department || 'Technology');
      setYear(selectedSub.year || '1');
      setSemester(selectedSub.semester || '1');
    }
  };

  const handleCapture = (files) => {
    setPhotos(files);
    if (files.length > 0) {
      setErrorMsg(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedSubjectId) {
      setErrorMsg('Please select a subject.');
      return;
    }
    if (photos.length === 0) {
      setErrorMsg('Please snap or upload at least one classroom photo.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    const sub = subjects.find(s => (s.subject_id || s.id).toString() === selectedSubjectId.toString());
    const subjectName = sub ? (sub.name || sub.subject_name) : 'Subject';

    try {
      const res = await ApiServices.markAttendance({
        imageFiles: photos,
        departmentName: departmentName || 'Technology',
        semester: parseInt(semester, 10) || 1,
        year: parseInt(year, 10) || 1,
        subjectID: parseInt(selectedSubjectId, 10),
        divisionID: divisionId ? parseInt(divisionId, 10) : null,
        teacherID: user.userID
      });

      if (res.task_id) {
        // Redirect to Celery background task processing panel
        navigate('/teacher/processing', { 
          state: { 
            taskID: res.task_id,
            subjectName: subjectName,
            year: year,
            divisionName: divisionName
          } 
        });
      } else {
        setErrorMsg(res.message || 'Failed to submit attendance.');
      }
    } catch (err) {
      setErrorMsg('Network error. Check connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '600px', margin: '0 auto' }}>
      
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
            Mark Attendance
          </h1>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.85rem' }}>
            Choose course and snap classroom photos to scan student attendance
          </p>
        </div>
      </div>

      <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
        {errorMsg && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: 'var(--color-danger-light)',
            color: 'var(--color-danger-text)',
            padding: '12px',
            borderRadius: 'var(--radius-md)',
            fontSize: '0.82rem',
            fontWeight: '600'
          }}>
            <AlertCircle size={16} style={{ flexShrink: 0 }} />
            <span>{errorMsg}</span>
          </div>
        )}

        {subjectsLoading ? (
          <div style={{ display: 'flex', height: '100px', justifyContent: 'center', alignItems: 'center' }}>
            <div className="loading-spinner" style={{ color: 'var(--color-teacher)' }}></div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            {/* Subject Selection */}
            <div className="form-group">
              <label className="form-label" htmlFor="attendance-subject">Select Subject</label>
              <div style={{ position: 'relative' }}>
                <BookOpen size={16} style={{
                  position: 'absolute',
                  left: '14px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--color-text-light)'
                }} />
                <select
                  id="attendance-subject"
                  className="form-input"
                  style={{ paddingLeft: '42px', appearance: 'none', WebkitAppearance: 'none' }}
                  value={selectedSubjectId}
                  onChange={(e) => handleSubjectChange(e.target.value)}
                  disabled={loading}
                >
                  {subjects.map((sub) => (
                    <option key={sub.id} value={sub.subject_id || sub.id}>
                      {sub.name || sub.subject_name} ({sub.division_name || 'General'})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Autofilled metadata badges */}
            {selectedSubjectId && (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '12px',
                backgroundColor: 'rgba(0,0,0,0.02)',
                padding: '16px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--color-border)',
                fontSize: '0.82rem'
              }}>
                <div>
                  <span style={{ display: 'block', color: 'var(--color-text-light)', fontWeight: '600' }}>Division</span>
                  <span style={{ fontWeight: '700', color: 'var(--color-text-primary)' }}>{divisionName}</span>
                </div>
                <div>
                  <span style={{ display: 'block', color: 'var(--color-text-light)', fontWeight: '600' }}>Department</span>
                  <span style={{ fontWeight: '700', color: 'var(--color-text-primary)' }}>{departmentName}</span>
                </div>
                <div style={{ marginTop: '8px' }}>
                  <span style={{ display: 'block', color: 'var(--color-text-light)', fontWeight: '600' }}>Year</span>
                  <span style={{ fontWeight: '700', color: 'var(--color-text-primary)' }}>Year {year}</span>
                </div>
                <div style={{ marginTop: '8px' }}>
                  <span style={{ display: 'block', color: 'var(--color-text-light)', fontWeight: '600' }}>Semester</span>
                  <span style={{ fontWeight: '700', color: 'var(--color-text-primary)' }}>Semester {semester}</span>
                </div>
              </div>
            )}

            {/* Camera Upload Section */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label className="form-label">Classroom Photo captures</label>
              <CameraCapture 
                onCapture={handleCapture}
                singleMode={false} // Allow capturing multiple frames of the classroom
                preferredFacingMode="environment" // rear camera is ideal for taking classroom shots
                themeColor="var(--color-teacher)"
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ backgroundColor: 'var(--color-teacher)', marginTop: '8px' }}
              disabled={loading || photos.length === 0}
            >
              {loading ? <div className="loading-spinner"></div> : 'Start Processing'}
            </button>

          </form>
        )}

      </div>
    </div>
  );
}
