import { Routes, Route } from "react-router-dom";

import LandingPage from "./pages/Landing-Page";
import RegisterPage from "./pages/Auth/RegisterPage";
import LoginPage from "./pages/Auth/LoginForm";
import ResetPasswordPage from "./pages/Auth/ResetPasswordPage";

function App() {
  return (
    <div dir="rtl">
      <Routes>
        <Route
          path="/"
          element={
            <div className="max-w-8xl mx-auto bg-white md:mx-25">
              <LandingPage />
            </div>
          }
        />

        <Route path="/register" element={<RegisterPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/forgot-password" element={<ResetPasswordPage />} />
      </Routes>
    </div>
  );
}

export default App;