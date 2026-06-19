import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { StudentRoute, TeacherRoute } from './components/RouteGuards';
import Layout from './components/Layout';

// Public Pages
import LoginSelector from './pages/LoginSelector';

// Student Auth
import StudentLogin from './pages/student/StudentLogin';
import StudentSignup from './pages/student/StudentSignup';
import StudentOTP from './pages/student/StudentOTP';
import StudentPasswordSetter from './pages/student/StudentPasswordSetter';
import StudentPhotoUploader from './pages/student/StudentPhotoUploader';

// Teacher Auth
import TeacherLogin from './pages/teacher/TeacherLogin';
import TeacherSignup from './pages/teacher/TeacherSignup';
import TeacherOTP from './pages/teacher/TeacherOTP';
import TeacherPasswordSetter from './pages/teacher/TeacherPasswordSetter';

// Student Portal Pages
import StudentDashboard from './pages/student/StudentDashboard';
import StudentSchedule from './pages/student/StudentSchedule';
import StudentFaceUpdate from './pages/student/StudentFaceUpdate';
import StudentProfile from './pages/student/StudentProfile';

// Teacher Portal Pages
import TeacherDashboard from './pages/teacher/TeacherDashboard';
import TeacherTakeAttendance from './pages/teacher/TeacherTakeAttendance';
import TeacherProcessing from './pages/teacher/TeacherProcessing';
import TeacherAttendanceResult from './pages/teacher/TeacherAttendanceResult';
import TeacherAbsenteeList from './pages/teacher/TeacherAbsenteeList';
import StudentListPage from './pages/teacher/StudentListPage';
import TeacherSessions from './pages/teacher/TeacherSessions';
import TeacherProfile from './pages/teacher/TeacherProfile';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routing */}
          <Route path="/" element={<LoginSelector />} />
          
          {/* Student Auth Flows */}
          <Route path="/login/student" element={<StudentLogin />} />
          <Route path="/signup/student" element={<StudentSignup />} />
          <Route path="/signup/student/otp" element={<StudentOTP />} />
          <Route path="/signup/student/password" element={<StudentPasswordSetter />} />
          <Route path="/signup/student/photo" element={<StudentPhotoUploader />} />

          {/* Teacher Auth Flows */}
          <Route path="/login/teacher" element={<TeacherLogin />} />
          <Route path="/signup/teacher" element={<TeacherSignup />} />
          <Route path="/signup/teacher/otp" element={<TeacherOTP />} />
          <Route path="/signup/teacher/password" element={<TeacherPasswordSetter />} />

          {/* Student Protected Portal */}
          <Route path="/student" element={<StudentRoute><Layout /></StudentRoute>}>
            <Route index element={<StudentDashboard />} />
            <Route path="schedule" element={<StudentSchedule />} />
            <Route path="face-update" element={<StudentFaceUpdate />} />
            <Route path="profile" element={<StudentProfile />} />
          </Route>

          {/* Teacher Protected Portal */}
          <Route path="/teacher" element={<TeacherRoute><Layout /></TeacherRoute>}>
            <Route index element={<TeacherDashboard />} />
            <Route path="take-attendance" element={<TeacherTakeAttendance />} />
            <Route path="processing" element={<TeacherProcessing />} />
            <Route path="session/:id/result" element={<TeacherAttendanceResult />} />
            <Route path="session/:id/edit" element={<TeacherAbsenteeList />} />
            <Route path="subject/:subjectId/students" element={<StudentListPage />} />
            <Route path="sessions" element={<TeacherSessions />} />
            <Route path="profile" element={<TeacherProfile />} />
          </Route>

          {/* Fallback Redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
