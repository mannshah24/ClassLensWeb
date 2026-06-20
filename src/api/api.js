// API client service replicating ApiServices from the mobile application.
// Connects to the same backend Django endpoints.

const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

/**
 * Extracts error message from response body.
 */
async function extractErrorMessage(response) {
  try {
    const text = await response.text();
    try {
      const decoded = JSON.parse(text);
      if (decoded && typeof decoded === 'object') {
        return decoded.detail || decoded.error || decoded.message || text;
      }
    } catch (_) {
      if (text && text.trim().length > 0) return text.trim();
    }
  } catch (_) {}
  return `Error: ${response.status} ${response.statusText}`;
}

export const ApiServices = {
  baseUrl: BASE_URL,

  /**
   * 1) Get list of all departments
   */
  async getDepartments() {
    const response = await fetch(`${BASE_URL}/getDepartments/`);
    if (!response.ok) {
      throw new Error(`Failed to load Departments: ${response.status}`);
    }
    return await response.json();
  },

  /**
   * 2) Register a new teacher
   */
  async signUpTeacher({ name, email, password, departmentID }) {
    try {
      const response = await fetch(`${BASE_URL}/registerNewTeacher/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json; charset=UTF-8' },
        body: JSON.stringify({ name, email, password, departmentID }),
      });
      if (response.status === 201) {
        return 'success';
      }
      return 'failed';
    } catch (e) {
      console.error(e);
      return 'Could not connect to the server.';
    }
  },

  /**
   * 3) Send verification OTP to email
   */
  async sendOtp({ email }) {
    try {
      const response = await fetch(`${BASE_URL}/sendOtp/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json; charset=UTF-8' },
        body: JSON.stringify({ email }),
      });
      return response.ok;
    } catch (e) {
      console.error(e);
      return false;
    }
  },

  /**
   * 4) Verify OTP sent to email
   */
  async verifyOtp({ email, otp }) {
    try {
      const response = await fetch(`${BASE_URL}/verifyOtp/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json; charset=UTF-8' },
        body: JSON.stringify({ email, otp: parseInt(otp, 10) }),
      });
      return response.ok;
    } catch (e) {
      console.error(e);
      return false;
    }
  },

  /**
   * 5) Verify if email exists/is registered
   */
  async verifyEmail({ email }) {
    try {
      const response = await fetch(`${BASE_URL}/verifyEmail/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json; charset=UTF-8' },
        body: JSON.stringify({ email }),
      });
      if (response.ok) {
        return 'verified';
      }
      const data = await response.json();
      return data.detail || 'No message';
    } catch (e) {
      console.error(e);
      return e.message || 'Error occurred';
    }
  },

  /**
   * 6) Set Password for Teacher or Student
   * Can be used for Teacher (email/password) or Student (prn/password/optional photo)
   */
  async setPassword({ email, prn, password, photoFile }) {
    try {
      if (photoFile && prn) {
        // If student registration with photo
        return await this.registerStudent({ prn, password, photoFile });
      }

      const response = await fetch(`${BASE_URL}/setPassword/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json; charset=UTF-8' },
        body: JSON.stringify({
          ...(email ? { email } : {}),
          ...(prn ? { prn: parseInt(prn, 10) } : {}),
          password
        }),
      });
      return response.ok;
    } catch (e) {
      console.error(e);
      return false;
    }
  },

  /**
   * 7) Verify Student PRN
   */
  async verifyPRN({ prn }) {
    try {
      const response = await fetch(`${BASE_URL}/verifyPRN/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json; charset=UTF-8' },
        body: JSON.stringify({ prn: parseInt(prn, 10) }),
      });

      if (response.ok) {
        const decoded = await response.json();
        return {
          status: 'verified',
          email: decoded.email,
        };
      } else {
        const errorData = await response.json();
        return {
          status: 'error',
          message: errorData.detail || 'Unknown error',
        };
      }
    } catch (e) {
      console.error(e);
      return { status: 'error', message: e.message };
    }
  },

  /**
   * 8) Register new student with photo and password
   */
  async registerStudent({ prn, password, photoFile }) {
    try {
      const formData = new FormData();
      formData.append('prn', prn.toString());
      formData.append('password', password);
      if (photoFile) {
        formData.append('photo', photoFile);
      }

      const response = await fetch(`${BASE_URL}/registerStudent/`, {
        method: 'POST',
        body: formData,
      });

      if (response.status === 200) {
        return true;
      } else if (response.status === 202) {
        const data = await response.json();
        const taskId = data.task_id;
        if (taskId) {
          console.log(`Async registration task initiated: ${taskId}. Polling...`);
          return await this._pollTaskStatus(taskId);
        }
        return false;
      } else {
        const errMsg = await extractErrorMessage(response);
        console.error(`Failed to register student: ${errMsg}`);
        return false;
      }
    } catch (e) {
      console.error('Error in registerStudent API call:', e);
      return false;
    }
  },

  /**
   * 9) Validate Teacher login
   */
  async validateTeacher({ email, password }) {
    try {
      const response = await fetch(`${BASE_URL}/validateTeacher/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json; charset=UTF-8' },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();

      if (response.ok) {
        return {
          status: true,
          teacherID: data.teacher_id,
          teacherName: data.teacher_name,
          message: data.message,
        };
      } else {
        return {
          status: false,
          teacherName: 'teacher',
          message: data.detail || data.message || 'Login failed',
        };
      }
    } catch (e) {
      console.error(e);
      return {
        status: false,
        teacherName: 'teacher',
        message: 'Network error occurred.',
      };
    }
  },

  /**
   * 10) Validate Student login
   */
  async validateStudent({ prn, password }) {
    try {
      const response = await fetch(`${BASE_URL}/validateStudent/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json; charset=UTF-8' },
        body: JSON.stringify({ prn: parseInt(prn, 10), password }),
      });
      const data = await response.json();

      if (response.ok) {
        // Retrieve access token if available
        let accessToken = null;
        for (const key of ['access_token', 'accessToken', 'token', 'authToken']) {
          if (data[key] && data[key].trim().length > 0) {
            accessToken = data[key].trim();
            break;
          }
        }

        return {
          status: true,
          studentName: data.student_name,
          student_id: data.student_id,
          prn: data.prn,
          message: data.message,
          ...(accessToken ? { accessToken } : {}),
        };
      } else {
        return {
          status: false,
          studentName: 'student',
          student_id: 0,
          prn: 0,
          message: data.detail || 'Validation failed',
        };
      }
    } catch (e) {
      console.error(e);
      return {
        status: false,
        studentName: 'student',
        student_id: 0,
        prn: 0,
        message: 'Network error occurred.',
      };
    }
  },

  /**
   * 11) Get Subjects for department/year/semester
   */
  async getSubjects({ departmentName, year, semester }) {
    try {
      const response = await fetch(`${BASE_URL}/getSubjectDetails/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json; charset=UTF-8' },
        body: JSON.stringify({
          department: departmentName,
          year: parseInt(year, 10),
          semester: parseInt(semester, 10),
        }),
      });

      if (response.ok) {
        const data = await response.json();
        return data.subjects || [];
      }
      return [];
    } catch (e) {
      console.error(e);
      throw new Error(`Failed to load subjects: ${e.message}`);
    }
  },

  /**
   * 12) Mark Attendance (Uploads one or more class photos)
   */
  async markAttendance({ imageFiles, departmentName, semester, year, subjectID, divisionID, teacherID }) {
    try {
      const formData = new FormData();
      formData.append('departmentName', departmentName);
      formData.append('year', year.toString());
      formData.append('teacherID', teacherID.toString());
      formData.append('subjectID', subjectID.toString());
      if (divisionID) {
        formData.append('divisionID', divisionID.toString());
      }

      for (const file of imageFiles) {
        formData.append('photo', file);
      }

      const response = await fetch(`${BASE_URL}/markAttendance/`, {
        method: 'POST',
        body: formData,
      });

      if (response.status === 200 || response.status === 202) {
        const data = await response.json();
        return {
          message: data.message || 'Task initiated',
          task_id: data.task_id,
        };
      } else {
        const errMsg = await extractErrorMessage(response);
        return {
          message: errMsg,
          task_id: null,
        };
      }
    } catch (e) {
      console.error('Exception in markAttendance:', e);
      return {
        message: e.message,
        task_id: null,
      };
    }
  },

  /**
   * 13) Resubmit Attendance (re-uploads image files for session)
   */
  async resubmitAttendance({ sessionID, imageFiles }) {
    try {
      const formData = new FormData();
      formData.append('class_session_id', sessionID.toString());
      for (const file of imageFiles) {
        formData.append('photo', file);
      }

      const response = await fetch(`${BASE_URL}/resubmitAttendance/`, {
        method: 'POST',
        body: formData,
      });

      if (response.status === 200 || response.status === 202) {
        const data = await response.json();
        return {
          message: data.message || 'Task initiated',
          task_id: data.task_id,
        };
      } else {
        const errMsg = await extractErrorMessage(response);
        return {
          message: errMsg,
          task_id: null,
        };
      }
    } catch (e) {
      console.error('Exception in resubmitAttendance:', e);
      return {
        message: e.message,
        task_id: null,
      };
    }
  },

  /**
   * 14) Check asynchronous task status (attendance processing status)
   */
  async checkTaskStatus({ taskID }) {
    try {
      const response = await fetch(`${BASE_URL}/attendanceStatus/${taskID}/`);
      if (response.ok) {
        return await response.json();
      }
      throw new Error('Failed to check task status');
    } catch (e) {
      console.error(e);
      return { status: 'error', result: e.message };
    }
  },

  /**
   * 15) Get Teacher Subjects
   */
  async getTeacherSubjects({ teacherID }) {
    try {
      const url = `${BASE_URL}/teacher/subjects/?teacher_id=${teacherID}`;
      const response = await fetch(url);
      if (response.ok) {
        const decoded = await response.json();
        return decoded.subjects || decoded.results || decoded || [];
      }
    } catch (e) {
      console.error('getTeacherSubjects GET failed, falling back:', e);
    }

    // Fallback POST
    try {
      const response = await fetch(`${BASE_URL}/getSubjects/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json; charset=UTF-8' },
        body: JSON.stringify({ teacher_id: teacherID }),
      });
      if (response.ok) {
        const data = await response.json();
        return data.subjects || [];
      }
    } catch (e) {
      console.error('getTeacherSubjects fallback POST failed:', e);
    }
    return [];
  },

  /**
   * 16) Get Divisions
   */
  async getDivisions({ departmentName, year, semester }) {
    try {
      const response = await fetch(`${BASE_URL}/getSubjectDetails/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json; charset=UTF-8' },
        body: JSON.stringify({
          department: departmentName,
          year: year ? parseInt(year, 10) : null,
          semester: semester ? parseInt(semester, 10) : null,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        return data.divisions || [];
      }
      return [];
    } catch (e) {
      console.error(e);
      return [];
    }
  },

  /**
   * 17) Get Student List for a subject (shows overall attendance stats)
   */
  async getStudentList({ subjectID, divisionID }) {
    try {
      const response = await fetch(`${BASE_URL}/students/attendance/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json; charset=UTF-8' },
        body: JSON.stringify({
          subject_id: subjectID,
          ...(divisionID ? { division_id: divisionID } : {}),
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const list = data.attendance || [];
        return list.map(st => ({
          ...st,
          studentID: st.student_id,
          studentName: st.student_name,
          totalClasses: st.total_classes,
          attendedClasses: st.attended_classes,
          attendance_percentage: st.attendance_percentage,
          // snake_case back-compat
          student_id: st.student_id,
          student_name: st.student_name,
          total_classes: st.total_classes,
          attended_classes: st.attended_classes
        }));
      }
      return [];
    } catch (e) {
      console.error(e);
      return [];
    }
  },

  /**
   * 18) Get Student Subject Attendance Records (individual class session level records)
   */
  async getStudentSubjectAttendance({ subjectId, divisionId, year, semester }) {
    try {
      const params = new URLSearchParams();
      if (divisionId) params.append('division_id', divisionId.toString());
      if (year) params.append('year', year.toString());
      if (semester) params.append('semester', semester.toString());

      const url = `${BASE_URL}/student/attendance/subject/${subjectId}/${params.toString() ? '?' + params.toString() : ''}`;
      const response = await fetch(url);
      if (response.ok) {
        const decoded = await response.json();
        return decoded.attendance_records || decoded.records || decoded.results || [];
      }
      return [];
    } catch (e) {
      console.error(e);
      return [];
    }
  },

  /**
   * 19) Get past class sessions for a teacher
   */
  async getTeacherClassSessions({ teacherID, limit }) {
    const normalize = (list) => {
      const items = Array.isArray(list) ? list : [];
      return items.map(s => ({
        ...s,
        id: s.id || s.class_session_id
      }));
    };

    try {
      const params = new URLSearchParams();
      params.append('teacher_id', teacherID.toString());
      if (limit) params.append('limit', limit.toString());

      const url = `${BASE_URL}/teacher/class-sessions/?${params.toString()}`;
      const response = await fetch(url);
      if (response.ok) {
        const decoded = await response.json();
        const rawList = decoded.class_sessions || decoded.sessions || decoded || [];
        return normalize(rawList);
      }
    } catch (e) {
      console.error('getTeacherClassSessions GET failed:', e);
    }

    // Fallback POST
    try {
      const response = await fetch(`${BASE_URL}/getTeacherClassSessions/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json; charset=UTF-8' },
        body: JSON.stringify({ teacher_id: teacherID, limit }),
      });
      if (response.ok) {
        const decoded = await response.json();
        const rawList = decoded.class_sessions || decoded.sessions || decoded || [];
        return normalize(rawList);
      }
    } catch (e) {
      console.error('getTeacherClassSessions fallback POST failed:', e);
    }
    return [];
  },

  /**
   * 20) Get Photos detected during attendance session
   */
  async getSessionPhotos({ sessionID }) {
    try {
      const response = await fetch(`${BASE_URL}/getSessionPhotos/${sessionID}/`);
      if (response.ok) {
        const data = await response.json();
        const photos = data.photos || [];
        return photos.map(p => p.detected_url);
      }
    } catch (e) {
      console.error('getSessionPhotos failed:', e);
    }
    return [];
  },

  /**
   * 21) Get Present or Absent Students list for a specific session
   */
  async getPresentAbsentStudents({ sessionID, isPresent }) {
    try {
      const response = await fetch(`${BASE_URL}/getPresentAbsentList/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json; charset=UTF-8' },
        body: JSON.stringify({
          class_session_id: sessionID,
          isPresent,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const list = data.students || [];
        return list.map(st => ({
          ...st,
          studentID: st.student_id,
          studentName: st.student_name,
          studentPRN: st.student_prn,
          // snake_case back-compat
          student_id: st.student_id,
          student_name: st.student_name,
          student_prn: st.student_prn
        }));
      }
      return [];
    } catch (e) {
      console.error(e);
      return [];
    }
  },

  /**
   * 22) Convenience helper: Get Absent Students list
   */
  async getAbsentStudents({ sessionID }) {
    return this.getPresentAbsentStudents({ sessionID, isPresent: false });
  },

  /**
   * 23) Edit/Change attendance list (Mark students present/absent for a session)
   */
  async changeAttendance({ sessionID, studentList }) {
    try {
      const response = await fetch(`${BASE_URL}/changeAttendance/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json; charset=UTF-8' },
        body: JSON.stringify({
          class_session_id: sessionID,
          student_list: studentList,
        }),
      });
      return response.ok;
    } catch (e) {
      console.error(e);
      return false;
    }
  },

  /**
   * 24) Get Teacher Profile Statistics
   */
  async getTeacherProfile({ teacherID }) {
    try {
      const response = await fetch(`${BASE_URL}/teacherProfile/${teacherID}/`);
      if (response.ok) {
        const data = await response.json();
        if (data.teacher_profile) {
          return {
            name: data.teacher_profile.name,
            email: data.teacher_profile.email,
            totalSubjects: data.teacher_profile.total_subjects,
            totalStudents: data.teacher_profile.total_students,
            department: data.teacher_profile.department_name,
            dateJoined: new Date(data.teacher_profile.date_joined),
          };
        }
      }
    } catch (e) {
      console.error(e);
    }
    return {
      name: 'Teacher',
      email: 'Unknown',
      totalSubjects: 0,
      totalStudents: 0,
      department: 'Unknown',
      dateJoined: new Date(),
    };
  },

  /**
   * 25) Update Student Face Image (Multipart uploader)
   */
  async updateStudentFace({ photoFile, prn, accessToken }) {
    try {
      const sendMultipart = async (endpoint) => {
        const formData = new FormData();
        if (accessToken) {
          // Token authentication
        } else {
          formData.append('prn', prn.trim());
        }
        formData.append('photo', photoFile);

        const headers = {};
        if (accessToken) {
          headers['Authorization'] = `Bearer ${accessToken.trim()}`;
        }

        const response = await fetch(endpoint, {
          method: 'POST',
          headers,
          body: formData,
        });

        const text = await response.text();
        let message = text;
        let taskId = null;
        try {
          const data = JSON.parse(text);
          message = data.detail || data.error || data.message || text;
          taskId = data.task_id;
        } catch (_) {}

        if (response.status === 202 && taskId) {
          console.log(`Async face update task initiated: ${taskId}. Polling...`);
          const isSuccess = await this._pollTaskStatus(taskId);
          return {
            statusCode: isSuccess ? 200 : 500,
            message: isSuccess ? 'Student face updated successfully' : 'Failed to update face',
          };
        }

        return {
          statusCode: response.status,
          message,
        };
      };

      const primary = await sendMultipart(`${BASE_URL}/updateFace/`);
      if (primary.statusCode === 200) {
        return { status: true, message: primary.message || 'Student face updated successfully' };
      }

      // Fallback
      if (primary.statusCode === 404 || primary.statusCode === 405) {
        const fallback = await sendMultipart(`${BASE_URL}/registerStudent/`);
        if (fallback.statusCode === 200) {
          return { status: true, message: fallback.message || 'Student face updated successfully' };
        }
        return { status: false, message: fallback.message || 'Failed to update face' };
      }

      return { status: false, message: primary.message || 'Failed to update face' };
    } catch (e) {
      console.error('Error updating student face:', e);
      return { status: false, message: e.message };
    }
  },

  /**
   * 26) Get Student Dashboard Details (Overall and subject stats, recent activity)
   */
  async getStudentDashboard({ studentId }) {
    try {
      const response = await fetch(`${BASE_URL}/student/dashboard/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json; charset=UTF-8' },
        body: JSON.stringify({ student_id: studentId }),
      });
      const data = await response.json();

      if (response.ok) {
        return { status: true, data };
      } else {
        return { status: false, message: data.detail || 'Failed to load dashboard' };
      }
    } catch (e) {
      console.error('Error fetching student dashboard:', e);
      return { status: false, message: 'Network error. Please try again.' };
    }
  },

  /**
   * 27) Update Notification Token (Student)
   */
  async updateNotificationToken({ studentId, notificationToken }) {
    try {
      const response = await fetch(`${BASE_URL}/student/notification-token/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json; charset=UTF-8' },
        body: JSON.stringify({ student_id: studentId, notification_token: notificationToken }),
      });
      return response.ok;
    } catch (e) {
      console.error(e);
      return false;
    }
  },

  /**
   * 28) Remove Notification Token (Student logout)
   */
  async removeNotificationToken({ studentId }) {
    try {
      const response = await fetch(`${BASE_URL}/student/notification-token/remove/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json; charset=UTF-8' },
        body: JSON.stringify({ student_id: studentId }),
      });
      return response.ok;
    } catch (e) {
      console.error(e);
      return false;
    }
  },

  /**
   * 29) Get Daily Schedule (Today list, indicators if holiday)
   */
  async getDailySchedule({ studentId, date }) {
    try {
      const params = new URLSearchParams();
      if (studentId) params.append('student_id', studentId.toString());
      if (date) params.append('date', date);

      const url = `${BASE_URL}/schedule/daily/?${params.toString()}`;
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        return {
          is_holiday: data.is_holiday || false,
          holiday_name: data.holiday_name || null,
          sessions: data.sessions || [],
        };
      }
    } catch (e) {
      console.error('Error fetching daily schedule:', e);
    }
    return { is_holiday: false, holiday_name: null, sessions: [] };
  },

  /**
   * 30) Update proxy/schedule order
   */
  async updateSessionOrder({ sessionId, uiOrder }) {
    try {
      const response = await fetch(`${BASE_URL}/schedule/daily/reorder/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json; charset=UTF-8' },
        body: JSON.stringify({ session_id: sessionId, ui_order: uiOrder }),
      });
      return response.ok;
    } catch (e) {
      console.error('Error updating session order:', e);
      return false;
    }
  },

  /**
   * 31) Get Weekly Timetable structure
   */
  async getWeeklyTimetable({ studentId }) {
    try {
      const url = `${BASE_URL}/student/timetable/?student_id=${studentId}`;
      const response = await fetch(url);
      if (response.ok) {
        return await response.json();
      }
    } catch (e) {
      console.error('Error fetching weekly timetable:', e);
    }
    return { division_name: null, timetable: {}, holidays: {} };
  },

  /**
   * 32) Update Notification Token (Teacher)
   */
  async updateTeacherNotificationToken({ teacherId, notificationToken }) {
    try {
      const response = await fetch(`${BASE_URL}/teacher/notification-token/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json; charset=UTF-8' },
        body: JSON.stringify({ teacher_id: teacherId, notification_token: notificationToken }),
      });
      return response.ok;
    } catch (e) {
      console.error(e);
      return false;
    }
  },

  /**
   * 33) Remove Notification Token (Teacher logout)
   */
  async removeTeacherNotificationToken({ teacherId }) {
    try {
      const response = await fetch(`${BASE_URL}/teacher/notification-token/remove/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json; charset=UTF-8' },
        body: JSON.stringify({ teacher_id: teacherId }),
      });
      return response.ok;
    } catch (e) {
      console.error(e);
      return false;
    }
  },

  /**
   * Internal polling helper for Celery tasks
   */
  async _pollTaskStatus(taskId) {
    let attempts = 0;
    const maxAttempts = 60;
    const url = `${BASE_URL}/taskStatus/${taskId}/`;

    while (attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 2000));
      attempts++;

      try {
        const response = await fetch(url);
        if (response.ok) {
          const data = await response.json();
          const status = data.status;
          if (status === 'SUCCESS') {
            console.log('Task completed successfully.');
            return true;
          } else if (status === 'FAILURE' || status === 'error') {
            console.error(`Task failed: ${data.error}`);
            return false;
          }
        } else if (response.status === 500) {
          const data = await response.json();
          console.error(`Task failed with 500: ${data.error}`);
          return false;
        }
      } catch (e) {
        console.error('Error polling task status:', e);
      }
    }
    console.warn('Task status polling timed out.');
    return false;
  },
};
