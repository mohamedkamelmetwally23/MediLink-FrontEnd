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
import RouteSkeleton from "./components/RouteSkeleton";
import ScrollLoadingBar from "./components/ScrollLoadingBar";

function App() {
  const { dark } = useTheme();
  const location = useLocation();

  return (
    <div
      dir="rtl"
      className="min-h-screen w-full bg-white text-black dark:bg-[#2E2E2E] dark:text-[#F0F0F0]"
    >
      <ScrollLoadingBar />

      <RouteLoadingOverlay
        key={`${location.pathname}${location.search}`}
        pathname={location.pathname}
      />

      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/terms" element={<LegalPage type="terms" />} />
        <Route path="/conditions" element={<LegalPage type="conditions" />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/forgot-password" element={<ResetPasswordPage />} />
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
      </Routes>

      <ToastContainer
        position="top-center"
        autoClose={2500}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnFocusLoss
        draggable
        pauseOnHover
        rtl
        theme={dark ? "dark" : "light"}
      />
      <ThemeToggle />
    </div>
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
