import {
  FaPhoneAlt,
  FaEnvelope,
  FaMapMarkerAlt,
  FaLinkedinIn,
  FaInstagram,
  FaFacebookF,
} from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import logo from "../assets/landingPage/logo.png"

export default function Footer() {
  return (
    <footer dir="rtl" className="shadow-md">
      <div className="max-w-7xl mx-auto px-8 py-20">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-10">
          {/* Logo & Description */}
          <div className="text-right">
            <div className="flex justify-start mb-6">
              <img
                src={logo}
                alt="MediLink"
                className="h-12 object-contain"
              />
            </div>

            <p className="text-gray-700 leading-8 text-[18px] ">
              نظام متكامل لإدارة العيادات والمراكز الطبية وتقديم أفضل تجربة
              للمرضى والأطباء
            </p>

            <div className="flex justify-start gap-6 mt-8 text-sky-500 text-2xl">
              <FaFacebookF className="cursor-pointer hover:text-sky-600" />
              <FaXTwitter className="cursor-pointer hover:text-sky-600" />
              <FaInstagram className="cursor-pointer hover:text-sky-600" />
              <FaLinkedinIn className="cursor-pointer hover:text-sky-600" />
            </div>
          </div>

          {/* Quick Links */}
          <div className="text-right">
            <h3 className="font-bold text-xl mb-8">روابط سريعة</h3>

            <ul className="space-y-5 text-gray-700">
              <li>الرئيسية</li>
              <li>من نحن</li>
              <li>خدماتنا</li>
              <li>التخصصات</li>
              <li>الأطباء</li>
            </ul>
          </div>

          {/* Services */}
          <div className="text-right">
            <h3 className="font-bold text-xl mb-8">خدماتنا</h3>

            <ul className="space-y-5 text-gray-700">
              <li>حجز موعد</li>
              <li>الاستشارات</li>
              <li>الملفات الطبية</li>
              <li>المتابعة والتنبيهات</li>
              <li>الدعم الفني</li>
            </ul>
          </div>

          {/* Specialties */}
          <div className="text-right">
            <h3 className="font-bold text-xl mb-8">التخصصات</h3>

            <ul className="space-y-5 text-gray-700">
              <li>الباطنة</li>
              <li>الأطفال</li>
              <li>الجلدية</li>
              <li>الفم والأسنان</li>
              <li>المخ والأعصاب</li>
            </ul>
          </div>

          {/* Contact */}
          <div className="text-right">
            <h3 className="font-bold text-xl mb-8">تواصل معنا</h3>

            <ul className="space-y-6 text-gray-700">
              <li className="flex items-center justify-start gap-3">
                <FaPhoneAlt />
                <span>015 5677 3899</span>
              </li>

              <li className="flex items-center justify-start gap-3">
                <FaEnvelope />
                <span>info@medilink.com</span>
              </li>

              <li className="flex items-center justify-start gap-3">
                <FaMapMarkerAlt />
                <span>القاهرة، مصر</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

    </footer>
  );
}
