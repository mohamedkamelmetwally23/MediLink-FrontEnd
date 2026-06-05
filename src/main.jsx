import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router";
import App from "./App.jsx";
import { ThemeProvider } from "./context/ThemeContext";
import "./index.css";
import "react-toastify/dist/ReactToastify.css";

createRoot(document.getElementById("root")).render(
  // <StrictMode>
  //   <App />
  // </StrictMode>,
  <ThemeProvider>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </ThemeProvider>,
);
