import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { ApiServices } from '../../api/api';
import { ArrowUp, ArrowDown, CheckCircle, Calendar, AlertTriangle, AlertCircle, Coffee, Clock } from 'lucide-react';

export default function StudentSchedule() {
  const { user } = useAuth();

  // Navigation segment: 0 = Today, 1 = Weekly
  const [activeSegment, setActiveSegment] = useState(0);

  // Daily Schedule state
  const [dailyLoading, setDailyLoading] = useState(true);
  const [dailyError, setDailyError] = useState(null);
  const [isHoliday, setIsHoliday] = useState(false);
  const [holidayName, setHolidayName] = useState('');
  const [todaySessions, setTodaySessions] = useState([]);

  // Weekly Timetable state
  const [weeklyLoading, setWeeklyLoading] = useState(true);
  const [weeklyError, setWeeklyError] = useState(null);
  const [divisionName, setDivisionName] = useState('');
  const [timetable, setTimetable] = useState({});
  const [weeklyHolidays, setWeeklyHolidays] = useState({});
  
  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  
  // Set default selected day based on today's weekday (1 = Monday, 6 = Saturday, 7 = Sunday)
  const getInitialDay = () => {
    const dayIndex = new Date().getDay();
    if (dayIndex >= 1 && dayIndex <= 6) {
      return days[dayIndex - 1];
    }
    return "Monday";
  };
  
  const [selectedDay, setSelectedDay] = useState(getInitialDay());

  useEffect(() => {
    if (user && user.userID) {
      fetchDailySchedule();
      fetchWeeklyTimetable();
    }
  }, [user]);

  const fetchDailySchedule = async () => {
    setDailyLoading(true);
    setDailyError(null);
    try {
      const data = await ApiServices.getDailySchedule({ studentId: user.userID });
      setIsHoliday(data.is_holiday || false);
      setHolidayName(data.holiday_name || '');
      
      const rawSessions = data.sessions || [];
      // Sort sessions by ui_order ascending
      const sorted = [...rawSessions].sort((a, b) => (a.ui_order || 0) - (b.ui_order || 0));
      setTodaySessions(sorted);
    } catch (err) {
      setDailyError('Failed to load today\'s schedule.');
    } finally {
      setDailyLoading(false);
    }
  };

  const fetchWeeklyTimetable = async () => {
    setWeeklyLoading(true);
    setWeeklyError(null);
    try {
      const res = await ApiServices.getWeeklyTimetable({ studentId: user.userID });
      setDivisionName(res.division_name);
      setTimetable(res.timetable || {});
      setWeeklyHolidays(res.holidays || {});
    } catch (err) {
      setWeeklyError('Failed to load weekly timetable.');
    } finally {
      setWeeklyLoading(false);
    }
  };

  // Reorder daily sessions locally and sync to server
  const shiftSession = async (index, direction) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= todaySessions.length) return;

    // Swap locally
    const updated = [...todaySessions];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;
    
    setTodaySessions(updated);

    // Save to server
    for (let i = 0; i < updated.length; i++) {
      const session = updated[i];
      if (session.id) {
        session.ui_order = i;
        await ApiServices.updateSessionOrder({
          sessionId: session.id,
          uiOrder: i
        });
      }
    }
  };

  const getHolidayText = (hName) => {
    const lower = (hName || '').toLowerCase();
    if (lower.includes('closure') || lower.includes('strike') || lower.includes('rain') || !hName) {
      return "Today is marked as Holiday.";
    }
    return `Today is marked as ${hName}.`;
  };

  const getBadgeStyle = (session) => {
    const isCancelled = session.is_cancelled;
    const isMoved = session.is_moved;
    const attendanceMarked = session.attendance_marked;

    if (isCancelled) {
      return { bg: 'var(--color-danger-light)', text: 'var(--color-danger-text)', label: 'Cancelled' };
    }
    if (isMoved) {
      return { bg: 'var(--color-warning-light)', text: 'var(--color-warning-text)', label: 'Moved' };
    }
    if (attendanceMarked) {
      return { bg: 'var(--color-success-light)', text: 'var(--color-success-text)', label: 'Completed' };
    }
    return { bg: 'var(--color-student-light)', text: 'var(--color-student-text)', label: 'Scheduled' };
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Title */}
      <div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: '800', color: 'var(--color-text-primary)' }}>
          Class Schedule
        </h1>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.95rem' }}>
          View daily schedule and timetable structure
        </p>
      </div>

      {/* Segment Selector Tab Bar */}
      <div style={{
        display: 'flex',
        background: 'rgba(255, 255, 255, 0.8)',
        borderRadius: '30px',
        padding: '4px',
        maxWidth: '360px',
        boxShadow: '0 4px 10px rgba(0,0,0,0.03)',
        border: '1px solid var(--color-border)'
      }}>
        <button
          onClick={() => setActiveSegment(0)}
          style={{
            flex: 1,
            padding: '10px 0',
            borderRadius: '26px',
            border: 'none',
            fontWeight: '700',
            fontSize: '0.9rem',
            cursor: 'pointer',
            backgroundColor: activeSegment === 0 ? 'var(--color-student)' : 'transparent',
            color: activeSegment === 0 ? '#fff' : 'var(--color-text-secondary)',
            transition: 'all var(--transition-fast)'
          }}
        >
          Today
        </button>
        <button
          onClick={() => setActiveSegment(1)}
          style={{
            flex: 1,
            padding: '10px 0',
            borderRadius: '26px',
            border: 'none',
            fontWeight: '700',
            fontSize: '0.9rem',
            cursor: 'pointer',
            backgroundColor: activeSegment === 1 ? 'var(--color-student)' : 'transparent',
            color: activeSegment === 1 ? '#fff' : 'var(--color-text-secondary)',
            transition: 'all var(--transition-fast)'
          }}
        >
          Weekly Timetable
        </button>
      </div>

      {/* TODAY CONTENT */}
      {activeSegment === 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {dailyLoading ? (
            <div style={{ display: 'flex', height: '40vh', justifyContent: 'center', alignItems: 'center' }}>
              <div className="loading-spinner" style={{ color: 'var(--color-student)' }}></div>
            </div>
          ) : dailyError ? (
            <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', padding: '30px', textAlign: 'center' }}>
              <AlertCircle size={36} style={{ color: 'var(--color-danger)' }} />
              <p>{dailyError}</p>
              <button onClick={fetchDailySchedule} className="btn btn-primary" style={{ width: 'auto' }}>Retry</button>
            </div>
          ) : isHoliday ? (
            // Holiday Card View
            <div className="glass-card" style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '40px 24px',
              textAlign: 'center',
              gap: '16px'
            }}>
              <div style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                backgroundColor: 'var(--color-warning-light)',
                color: 'var(--color-warning)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Coffee size={32} />
              </div>
              <h2 style={{ fontSize: '1.4rem', fontWeight: '800' }}>No Classes Today!</h2>
              <p style={{ color: 'var(--color-text-secondary)' }}>{getHolidayText(holidayName)}</p>
              <span style={{ color: 'var(--color-success)', fontWeight: '600', fontSize: '0.9rem' }}>Enjoy your day off!</span>
            </div>
          ) : (
            // Today's Sessions List
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                <span style={{ fontWeight: '700', color: 'var(--color-text-primary)' }}>Today's Lectures</span>
                <span style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', fontWeight: '600' }}>
                  {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                </span>
              </div>

              {todaySessions.length === 0 ? (
                <div className="glass-card" style={{ padding: '30px', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
                  No sessions scheduled for today.
                </div>
              ) : (
                todaySessions.map((session, idx) => {
                  const badge = getBadgeStyle(session);
                  const teacher = session.proxy_teacher_name 
                    ? `${session.proxy_teacher_name} (Proxy)` 
                    : (session.teacher_name || 'No teacher');
                  const isCancelled = session.is_cancelled;

                  return (
                    <div key={session.id || idx} className="glass-card" style={{
                      display: 'flex',
                      alignItems: 'center',
                      padding: '16px 20px',
                      gap: '16px',
                      opacity: isCancelled ? 0.6 : 1
                    }}>
                      <div style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        backgroundColor: badge.bg,
                        color: badge.text.includes('text') ? badge.text : 'var(--color-student)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}>
                        <Clock size={18} />
                      </div>
                      
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', flex: 1 }}>
                        <h4 style={{
                          fontSize: '0.95rem',
                          fontWeight: '700',
                          color: 'var(--color-text-primary)',
                          textDecoration: isCancelled ? 'line-through' : 'none'
                        }}>
                          {session.subject_name || 'Unknown Subject'}
                        </h4>
                        <span style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>
                          {session.subject_code} • {teacher}
                        </span>
                      </div>

                      {/* Swapping Reorder Controls */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        {idx > 0 && (
                          <button 
                            type="button"
                            onClick={() => shiftSession(idx, -1)}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-light)' }}
                            title="Shift Up"
                          >
                            <ArrowUp size={16} />
                          </button>
                        )}
                        {idx < todaySessions.length - 1 && (
                          <button 
                            type="button"
                            onClick={() => shiftSession(idx, 1)}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-light)' }}
                            title="Shift Down"
                          >
                            <ArrowDown size={16} />
                          </button>
                        )}
                      </div>

                      {/* Badge */}
                      <span style={{
                        padding: '4px 10px',
                        borderRadius: '8px',
                        fontSize: '0.75rem',
                        fontWeight: '700',
                        backgroundColor: badge.bg,
                        color: badge.text
                      }}>
                        {badge.label}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>
      )}

      {/* WEEKLY TIMETABLE CONTENT */}
      {activeSegment === 1 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {weeklyLoading ? (
            <div style={{ display: 'flex', height: '40vh', justifyContent: 'center', alignItems: 'center' }}>
              <div className="loading-spinner" style={{ color: 'var(--color-student)' }}></div>
            </div>
          ) : weeklyError ? (
            <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', padding: '30px', textAlign: 'center' }}>
              <AlertCircle size={36} style={{ color: 'var(--color-danger)' }} />
              <p>{weeklyError}</p>
              <button onClick={fetchWeeklyTimetable} className="btn btn-primary" style={{ width: 'auto' }}>Retry</button>
            </div>
          ) : (
            <>
              {/* Day selection slider */}
              <div style={{
                display: 'flex',
                gap: '8px',
                overflowX: 'auto',
                paddingBottom: '8px',
                scrollbarWidth: 'none'
              }}>
                {days.map((day) => {
                  const isSelected = day === selectedDay;
                  return (
                    <button
                      key={day}
                      onClick={() => setSelectedDay(day)}
                      style={{
                        padding: '10px 18px',
                        borderRadius: '20px',
                        border: 'none',
                        fontWeight: '700',
                        fontSize: '0.85rem',
                        cursor: 'pointer',
                        flexShrink: 0,
                        backgroundColor: isSelected ? 'var(--color-student)' : '#fff',
                        color: isSelected ? '#fff' : 'var(--color-text-primary)',
                        boxShadow: isSelected ? '0 4px 12px rgba(37,99,235,0.2)' : 'none',
                        transition: 'all var(--transition-fast)'
                      }}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>

              {divisionName && (
                <span style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--color-text-secondary)' }}>
                  Division: {divisionName}
                </span>
              )}

              {/* Day timetable content */}
              {(() => {
                const dayHoliday = weeklyHolidays[selectedDay];
                const isDayHoliday = dayHoliday && dayHoliday.is_holiday;
                const sessionsList = timetable[selectedDay] || [];

                if (isDayHoliday) {
                  return (
                    <div className="glass-card" style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '30px 24px',
                      textAlign: 'center',
                      gap: '12px'
                    }}>
                      <Coffee size={24} style={{ color: 'var(--color-warning)' }} />
                      <h3 style={{ fontSize: '1.2rem', fontWeight: '800' }}>No Classes!</h3>
                      <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>
                        {getHolidayText(dayHoliday.holiday_name)}
                      </p>
                    </div>
                  );
                }

                if (sessionsList.length === 0) {
                  return (
                    <div className="glass-card" style={{ padding: '30px', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
                      No lectures scheduled for {selectedDay}.
                    </div>
                  );
                }

                return (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {sessionsList.map((session, idx) => {
                      const subject = session.subject_name || 'Unknown Subject';
                      const teacher = session.default_teacher_name || 'No teacher';

                      return (
                        <div key={idx} className="glass-card" style={{
                          display: 'flex',
                          alignItems: 'center',
                          padding: '16px 20px',
                          gap: '16px'
                        }}>
                          <div style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '50%',
                            backgroundColor: 'var(--color-student-light)',
                            color: 'var(--color-student)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}>
                            <Calendar size={18} />
                          </div>

                          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                            <h4 style={{ fontSize: '0.95rem', fontWeight: '700', color: 'var(--color-text-primary)' }}>
                              {subject}
                            </h4>
                            <span style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>
                              {teacher} • {session.program || ''} Sem {session.semester || ''}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
            </>
          )}
        </div>
      )}

    </div>
  );
}
