import {
  FaEnvelope,
  FaFacebookF,
  FaInstagram,
  FaLinkedinIn,
  FaMapMarkerAlt,
  FaPhoneAlt,
} from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import { toast } from "react-toastify";
import logo from "../assets/landingPage/logo.png";

const columns = [
  {
    title: "روابط سريعة",
    items: ["الرئيسية", "من نحن", "خدماتنا", "التخصصات", "الأطباء"],
  },
  {
    title: "خدماتنا",
    items: ["حجز موعد", "الاستشارات", "الملفات الطبية", "المتابعة والتنبيهات", "الدعم الفني"],
  },
  {
    title: "التخصصات",
    items: ["الباطنة", "الأطفال", "الجلدية", "الفم والأسنان", "المخ والأعصاب"],
  },
];

export default function Footer() {
  return (
    <footer id="contact" dir="rtl" className="mt-8 shadow-md">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-5">
          <div
            style={{ "--reveal-delay": "0ms" }}
            className="reveal-item sm:col-span-2 lg:col-span-1"
          >
            <img src={logo} alt="MediLink" className="mb-5 h-12 object-contain" />
            <p className="leading-8 text-gray-700 dark:text-[#F0F0F0]">
              نظام متكامل لإدارة العيادات والمراكز الطبية وتقديم تجربة أفضل
              للمرضى والأطباء.
            </p>

            <div className="mt-6 flex gap-5 text-2xl text-sky-500">
              {[FaFacebookF, FaXTwitter, FaInstagram, FaLinkedinIn].map((Icon, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => toast.info("روابط التواصل ستكون متاحة قريبًا")}
                  className="hover:text-sky-600"
                  aria-label="social link"
                >
                  <Icon />
                </button>
              ))}
            </div>
          </div>

          {columns.map((column, index) => (
            <div
              key={column.title}
              style={{ "--reveal-delay": `${(index + 1) * 90}ms` }}
              className="reveal-item"
            >
              <h3 className="mb-5 text-xl font-bold">{column.title}</h3>
              <ul className="space-y-3 text-gray-700 dark:text-[#F0F0F0]">
                {column.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          ))}

          <div style={{ "--reveal-delay": "360ms" }} className="reveal-item">
            <h3 className="mb-5 text-xl font-bold">تواصل معنا</h3>
            <ul className="space-y-4 text-gray-700 dark:text-[#F0F0F0]">
              <li className="flex items-center gap-3">
                <FaPhoneAlt className="shrink-0" />
                <span>015 5677 3899</span>
              </li>
              <li className="flex items-center gap-3">
                <FaEnvelope className="shrink-0" />
                <span className="break-all">info@medilink.com</span>
              </li>
              <li className="flex items-center gap-3">
                <FaMapMarkerAlt className="shrink-0" />
                <span>القاهرة، مصر</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
}
