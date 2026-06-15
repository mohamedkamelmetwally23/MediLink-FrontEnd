import { useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowRight, Search, Star, X } from "lucide-react";
import adminImage from "../../../assets/landingPage/admin.png";
import doctorImage from "../../../assets/landingPage/doctor1.png";
import doctorDarkImage from "../../../assets/landingPage/login-doctor-dark (2).png";
import loginDoctorImage from "../../../assets/landingPage/login-doctor.png";
import signupDoctorImage from "../../../assets/landingPage/signupDoctor.png";
import { normalizeSpecialtyLabel } from "../users/usersData";
import { useUsersStore } from "../users/useUsersStore";

const doctorImages = [
  doctorImage,
  loginDoctorImage,
  signupDoctorImage,
  adminImage,
  doctorDarkImage,
];

export default function SpecialtyDoctorsPage() {
  const navigate = useNavigate();
  const { specialtyName = "" } = useParams();
  const { users } = useUsersStore();
  const [search, setSearch] = useState("");
  const decodedName = normalizeSpecialtyLabel(decodeURIComponent(specialtyName));

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
      return;
    }

    navigate("/admin/specialties");
  };

  const doctors = useMemo(() => {
    return users
      .filter(
        (user) =>
          user.role === "doctor" &&
          normalizeSpecialtyLabel(user.specialty) === decodedName,
      )
      .map((doctor, index) => ({
        id: doctor.id,
        name: `${doctor.firstName} ${doctor.lastName}`.replace("د.", "").trim(),
        rating: doctor.rating || "",
        image: doctorImages[index % doctorImages.length],
        to: `/admin/users/${doctor.id}/profile`,
      }));
  }, [decodedName, users]);

  const filteredDoctors = useMemo(() => {
    const query = search.trim();
    return doctors.filter((doctor) => (!query ? true : doctor.name.includes(query)));
  }, [doctors, search]);

  return (
    <section className="min-h-screen bg-white text-[#333] dark:bg-[#2f2f2f] dark:text-white">
      <PageHeader specialtyName={decodedName} onBack={handleBack} />

      <main className="px-4 pb-10 pt-[28px] sm:px-6 lg:px-[38px]">
        <div className="mb-[22px] flex justify-end" dir="ltr">
          <SearchBox value={search} onChange={setSearch} />
        </div>

        {filteredDoctors.length === 0 ? (
          <div className="grid min-h-[520px] place-items-center text-[22px] font-medium text-black dark:text-white">
            لا يوجد أطباء حتى الآن
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-x-[22px] gap-y-[48px] sm:grid-cols-2 xl:grid-cols-4">
            {filteredDoctors.map((doctor) => (
              <DoctorCard key={`${doctor.name}-${doctor.to}`} doctor={doctor} />
            ))}
          </div>
        )}
      </main>
    </section>
  );
}

function PageHeader({ specialtyName, onBack }) {
  return (
    <header className="relative flex min-h-[120px] items-start justify-start bg-white px-4 pt-[38px] shadow-[0_1px_8px_rgba(0,0,0,0.03)] dark:bg-[#3a3a3a] sm:px-6 lg:px-[32px]">
      <div className="text-right">
        <h1 className="text-[26px] font-bold leading-[31px] text-[#333] dark:text-white">
          التخصصات
        </h1>
        <p className="mt-1 text-[16px] leading-5 text-[#8a8a8a] dark:text-gray-300">
          التخصصات / {specialtyName}
        </p>
      </div>

      <button
        type="button"
        className="absolute left-6 top-[43px] flex items-center gap-3 text-[20px] font-medium text-[#30bfd6] lg:left-[32px]"
        onClick={onBack}
      >
        <ArrowRight size={20} strokeWidth={2} />
        رجوع
      </button>
    </header>
  );
}

function SearchBox({ value, onChange }) {
  return (
    <label
      className="flex h-[52px] w-full items-center gap-[12px] rounded-[12px] border border-[#d7d7d7] bg-[#fbfbfb] px-[16px] text-[#9a9a9a] dark:border-white/20 dark:bg-[#454545] dark:text-gray-200 sm:w-[260px]"
      dir="ltr"
    >
      <button
        type="button"
        aria-label="مسح البحث"
        className="grid h-6 w-6 place-items-center"
        onClick={() => onChange("")}
      >
        <X size={16} strokeWidth={1.6} />
      </button>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="min-w-0 flex-1 bg-transparent text-right text-[15px] outline-none placeholder:text-[#9a9a9a]"
        placeholder="إبحث هنا..."
        dir="rtl"
      />
      <Search size={20} strokeWidth={1.7} />
    </label>
  );
}

function DoctorCard({ doctor }) {
  return (
    <article className="overflow-hidden rounded-[8px] bg-white text-center shadow-[0_2px_10px_rgba(0,0,0,0.08)] dark:bg-[#505050]">
      <div className="flex h-[184px] items-end justify-center bg-[#f5f5f5] dark:bg-[#444]">
        <img
          src={doctor.image}
          alt={doctor.name}
          className="h-full max-w-full object-contain"
        />
      </div>
      <div className="px-[16px] pb-[18px] pt-[8px]">
        <h2 className="text-[24px] font-bold leading-8 text-[#333] dark:text-white">
          {doctor.name}
        </h2>
        <div
          className="mt-[4px] flex items-center justify-center gap-[6px] text-[15px] font-medium text-black dark:text-white"
          dir="ltr"
        >
          <span>{doctor.rating || "-"}</span>
          <span className="flex gap-[2px] text-[#ffb000]">
            {Array.from({ length: 5 }, (_, index) => (
              <Star
                key={index}
                size={14}
                strokeWidth={1.5}
                fill="currentColor"
              />
            ))}
          </span>
        </div>
        <Link
          to={doctor.to}
          className="mt-[12px] flex h-[52px] items-center justify-center rounded-[9px] bg-gradient-to-l from-[#67d2cb] to-[#0fb8e8] text-[17px] font-medium text-white"
        >
          عرض الملف الشخصي
        </Link>
      </div>
    </article>
  );
}
