import { Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";

import LandingPage from "./pages/Landing-Page";
import RegisterPage from "./pages/Auth/RegisterPage";
import LoginPage from "./pages/Auth/LoginPage";
import ResetPasswordPage from "./pages/Auth/ResetPasswordPage";
import { useTheme } from "./hooks/useTheme";
import ThemeToggle from "./components/ThemeToggle";
import Dashboard from "./pages/admin/Dashbord";
import AdminLayout from "./pages/admin/layout/AdminLayout";
import UsersPage from "./pages/admin/users/UsersPage";
import AddUserPage from "./pages/admin/users/AddUserPage";
import EditUserPage from "./pages/admin/users/EditUserPage";

function App() {
  const { dark } = useTheme();

  return (
    <div
      dir="rtl"
      className="min-h-screen w-full bg-white text-black dark:bg-[#2E2E2E] dark:text-[#F0F0F0]"
    >
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/forgot-password" element={<ResetPasswordPage />} />
        <Route path="/admin" element={<Dashboard />} />
        <Route path="/admin" element={<AdminLayout />}>
          <Route path="users" element={<UsersPage />} />
          <Route path="users/new" element={<AddUserPage />} />
          <Route path="users/:userId/edit" element={<EditUserPage />} />
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

export default App;
