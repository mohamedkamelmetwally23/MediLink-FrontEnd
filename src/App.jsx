import LandingPage from "./pages/Landing-Page";
import useTheme from "./hooks/useTheme";

function App() {
  useTheme();
  return (
    <div dir="rtl" className=" w-full">
      <div className="max-w-8xl mx-auto md:mx-25">
        <LandingPage />
      </div>
    </div>
  );
}

export default App;
