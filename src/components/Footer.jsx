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
import { useSpecializations } from "../hooks/useSpecializations";
import { useClinicInfo } from "../services/clinicInfoStore";
import ThemeLogo from "./ThemeLogo";

export default function Footer() {
  const clinicInfo = useClinicInfo();
  const { specialties } = useSpecializations();
  const visibleSpecialties = specialties.slice(0, 5);

  return (
    <footer id="contact" dir="rtl" className="mt-8 shadow-md">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
          <div
            style={{ "--reveal-delay": "0ms" }}
            className="reveal-item sm:col-span-2 lg:col-span-1"
          >
            <ThemeLogo className="mb-5 h-12 w-auto object-contain" />
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

          <div style={{ "--reveal-delay": "90ms" }} className="reveal-item">
            <h3 className="mb-5 text-xl font-bold">التخصصات</h3>
            <ul className="space-y-3 text-gray-700 dark:text-[#F0F0F0]">
              {visibleSpecialties.map((specialty) => (
                <li key={specialty.id || specialty.name}>
                  <a
                    href={`/patient/doctors?specialty=${encodeURIComponent(specialty.name)}`}
                    className="inline-flex transition hover:text-[#05ADE8] hover:underline hover:underline-offset-4"
                  >
                    {specialty.name}
                  </a>
                </li>
              ))}
              <li>
                <a
                  href="#specialties"
                  className="inline-flex font-semibold text-[#05ADE8] transition hover:underline hover:underline-offset-4"
                >
                  عرض المزيد
                </a>
              </li>
            </ul>
          </div>

          <div style={{ "--reveal-delay": "180ms" }} className="reveal-item">
            <h3 className="mb-5 text-xl font-bold">تواصل معنا</h3>
            <ul className="space-y-4 text-gray-700 dark:text-[#F0F0F0]">
              <li className="flex items-center gap-3">
                <FaPhoneAlt className="shrink-0" />
                <span>{clinicInfo.phone}</span>
              </li>
              <li className="flex items-center gap-3">
                <FaEnvelope className="shrink-0" />
                <span className="break-all">{clinicInfo.email}</span>
              </li>
              <li className="flex items-center gap-3">
                <FaMapMarkerAlt className="shrink-0" />
                <span>{clinicInfo.address}</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
}
