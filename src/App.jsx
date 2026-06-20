import { useEffect, useState } from "react";
import { Routes, Route, useLocation, Navigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";

import LandingPage from "./pages/Landing-Page";
import LegalPage from "./pages/LegalPage";
import RegisterPage from "./pages/Auth/RegisterPage";
import LoginPage from "./pages/Auth/LoginPage";
import ResetPasswordPage from "./pages/Auth/ResetPasswordPage";
import { useTheme } from "./hooks/useTheme";
import ThemeToggle from "./components/ThemeToggle";
import AssistantButton from "./components/AssistantButton";
import Dashboard from "./pages/admin/Dashbord";
import ActivityPage from "./pages/admin/activity/ActivityPage";
import AdminLayout from "./pages/admin/layout/AdminLayout";
import UsersPage from "./pages/admin/users/UsersPage";
import AddUserPage from "./pages/admin/users/AddUserPage";
import EditUserPage from "./pages/admin/users/EditUserPage";
import UserProfilePage from "./pages/admin/users/UserProfilePage";
import DoctorsPage from "./pages/admin/doctors/DoctorsPage";
import AddDoctorPage from "./pages/admin/doctors/AddDoctorPage";
import EditDoctorPage from "./pages/admin/doctors/EditDoctorPage";
import SpecialtiesPage from "./pages/admin/specialties/SpecialtiesPage";
import SpecialtyDoctorsPage from "./pages/admin/specialties/SpecialtyDoctorsPage";
import ClinicManagementPage from "./pages/admin/clinic/ClinicManagementPage";
import AppointmentsPage from "./pages/admin/appointments/AppointmentsPage";
import ReceptionistsPage from "./pages/admin/receptionists/ReceptionistsPage";
import AddReceptionistPage from "./pages/admin/receptionists/AddReceptionistPage";
import EditReceptionistPage from "./pages/admin/receptionists/EditReceptionistPage";
import DoctorLayout from "./pages/doctor/layout/DoctorLayout";
import DoctorDashboard from "./pages/doctor/Dashboard";
import DoctorAppointmentsPage from "./pages/doctor/AppointmentsPage";
import DoctorPatientsPage from "./pages/doctor/PatientsPage";
import DoctorPatientProfilePage from "./pages/doctor/PatientProfilePage";
import DoctorActivityPage from "./pages/doctor/ActivityPage";
import ReceptionistLayout from "./pages/receptionist/layout/ReceptionistLayout";
import ReceptionistDashboard from "./pages/receptionist/Dashboard";
import ReceptionistAppointmentsPage from "./pages/receptionist/AppointmentsPage";
import ReceptionistDoctorsPage from "./pages/receptionist/DoctorsPage";
import ReceptionistDoctorProfilePage from "./pages/receptionist/DoctorProfilePage";
import ReceptionistPatientsPage from "./pages/receptionist/PatientsPage";
import ReceptionistPatientProfilePage from "./pages/receptionist/PatientProfilePage";
import ReceptionistSchedulePage from "./pages/receptionist/SchedulePage";
import ReceptionistBookingPage from "./pages/receptionist/BookingPage";
import RouteSkeleton from "./components/RouteSkeleton";
import PatientOnboardingPage from "./pages/patient/PatientOnboardingPage";
import PatientHomePage from "./pages/patient/PatientHomePage";
import PatientDoctorsPage from "./pages/patient/PatientDoctorsPage";
import PatientDoctorProfilePage from "./pages/patient/PatientDoctorProfilePage";
import PatientBookingPage from "./pages/patient/PatientBookingPage";
import PatientProfilePage from "./pages/patient/PatientProfilePage";
import {
  PatientChangePasswordPage,
  PatientEditProfilePage,
} from "./pages/patient/PatientEditProfilePage";

function App() {
  const { dark } = useTheme();
  const location = useLocation();
  const [, setAuthVersion] = useState(0);
  const showPatientAssistant =
    location.pathname.startsWith("/patient") && hasPatientSession();

  useEffect(() => {
    const handleAuthChange = () => setAuthVersion((version) => version + 1);

    window.addEventListener("medilink-auth-change", handleAuthChange);
    window.addEventListener("storage", handleAuthChange);

    return () => {
      window.removeEventListener("medilink-auth-change", handleAuthChange);
      window.removeEventListener("storage", handleAuthChange);
    };
  }, []);

  return (
    <div
      lang="ar"
      className="w-full min-h-screen bg-white text-black dark:bg-[#2E2E2E] dark:text-[#F0F0F0] overflow-x-hidden"
    >
      <div dir="rtl" className="w-full overflow-x-hidden">
      

        <RouteLoadingOverlay
          key={`${location.pathname}${location.search}`}
          pathname={location.pathname}
        />

        <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/legal" element={<LegalPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/forgot-password" element={<ResetPasswordPage />} />
        <Route path="/patient/:patientId/patientinformation" element={<PatientOnboardingPage />} />
        <Route path="/patient/:patientId/home" element={<PatientHomePage />} />
        <Route path="/patient/doctors" element={<PatientDoctorsPage />} />
        <Route path="/patient/doctors/:doctorId" element={<PatientDoctorProfilePage />} />
        <Route path="/patient/doctors/:doctorId/book" element={<PatientBookingPage />} />
        <Route path="/patient/:patientId/profile" element={<PatientProfilePage />} />
        <Route path="/patient/:patientId/profile/edit" element={<PatientEditProfilePage />} />
        <Route path="/patient/:patientId/profile/change-password" element={<PatientChangePasswordPage />} />
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="activity" element={<ActivityPage />} />
          <Route path="users" element={<UsersPage />} />
          <Route path="users/profile" element={<UserProfilePage />} />
          <Route path="users/new" element={<AddUserPage />} />
          <Route path="users/:userId/profile" element={<UserProfilePage />} />
          <Route path="users/:userId/edit" element={<EditUserPage />} />
          <Route path="doctors" element={<DoctorsPage />} />
          <Route path="doctors/new" element={<AddDoctorPage />} />
          <Route path="doctors/:doctorId/edit" element={<EditDoctorPage />} />
          <Route path="specialties" element={<SpecialtiesPage />} />
          <Route path="specialties/:specialtyName" element={<SpecialtyDoctorsPage />} />
          <Route path="appointments" element={<AppointmentsPage />} />
          <Route path="clinic" element={<ClinicManagementPage />} />
          <Route path="receptionists" element={<ReceptionistsPage />} />
          <Route path="receptionists/new" element={<AddReceptionistPage />} />
          <Route
            path="receptionists/:receptionistId/edit"
            element={<EditReceptionistPage />}
          />
        </Route>
        <Route path="/doctor" element={<DoctorLayout />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<DoctorDashboard />} />
          <Route path="activity" element={<DoctorActivityPage />} />
          <Route path="appointments" element={<DoctorAppointmentsPage />} />
          <Route path="patients" element={<DoctorPatientsPage />} />
          <Route path="patients/:patientId/profile" element={<DoctorPatientProfileRoute />} />
        </Route>
        <Route path="/receptionist" element={<ReceptionistLayout />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<ReceptionistDashboard />} />
          <Route path="patients" element={<ReceptionistPatientsPage />} />
          <Route path="patients/:patientId/profile" element={<ReceptionistPatientProfilePage />} />
          <Route path="doctors" element={<ReceptionistDoctorsPage />} />
          <Route path="doctors/:doctorId/profile" element={<ReceptionistDoctorProfilePage />} />
          <Route path="appointments" element={<ReceptionistAppointmentsPage />} />
          <Route path="schedule" element={<ReceptionistSchedulePage />} />
          <Route path="book" element={<ReceptionistBookingPage />} />
        </Route>
        </Routes>

        <ToastContainer
        position="top-center"
        autoClose={2500}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnFocusLoss
        draggable
        pauseOnHover={false}
        rtl
        theme={dark ? "dark" : "light"}
      />
        {showPatientAssistant && <AssistantButton />}
        <ThemeToggle />
      </div>
    </div>
  );
}

function hasPatientSession() {
  const token =
    localStorage.getItem("medilinkToken") ||
    localStorage.getItem("token") ||
    localStorage.getItem("accessToken");
  const role = localStorage.getItem("medilinkRole");

  return Boolean(token && (role === "patient" || role === "user"));
}

function DoctorPatientProfileRoute() {
  const location = useLocation();

  return (
    <DoctorPatientProfilePage
      key={location.key}
      startExam={location.state?.startExam === true}
    />
  );
}

function RouteLoadingOverlay({ pathname }) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setIsVisible(false);
    }, 420);

    return () => window.clearTimeout(timer);
  }, []);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[950] bg-white dark:bg-[#2E2E2E]">
      <RouteSkeleton pathname={pathname} />
    </div>
  );
}

export default App;
