import darkLogo from "../assets/dark.png";
import lightLogo from "../assets/ligth.png";

export default function ThemeLogo({ className = "", alt = "MediLink" }) {
  return (
    <>
      <img src={lightLogo} alt={alt} className={`${className} dark:hidden`} />
      <img src={darkLogo} alt={alt} className={`${className} hidden dark:block`} />
    </>
  );
}
