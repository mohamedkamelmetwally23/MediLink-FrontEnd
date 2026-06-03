import image1 from "../assets/landingPage/12 1.png";
import image2 from "../assets/landingPage/12 1 (1).png";
import image3 from "../assets/landingPage/12 1 (2).png";
import image4 from "../assets/landingPage/12 1 (3).png";
import image5 from "../assets/landingPage/12 1 (4).png";
import image6 from "../assets/landingPage/12 1 (5).png";
import { FaStar, FaStarHalfAlt, FaRegStar } from "react-icons/fa";

export default function Doctors() {
  const doctors = [
    {
      id: 1,
      name: "د. ندي حسين",
      image: image1,
      specialty: "أخصائية جلدية",
      rating: 5,
    },
    {
      id: 2,
      name: "د. عادل محمد",
      image: image2,
      specialty: "إستشاري أمراض باطنة",
      rating: 5,
    },
    {
      id: 3,
      name: "د. عبد الله محمود",
      image: image3,
      specialty: "أخصائي جراحة عظام",
      rating: 3,
    },
    {
      id: 4,
      name: "د. سامح شوقي",
      image: image4,
      specialty: "إستشاري أطفال",
      rating: 5,
    },
    {
      id: 5,
      name: "د. سارة أحمد",
      image: image5,
      specialty: "أخصائية تغذية",
      rating: 4,
    },
    {
      id: 6,
      name: "د. علي عبد الرحمن",
      image: image6,
      specialty: "استشاري أسنان",
      rating: 4.7,
    },
    {
      id: 7,
      name: "د. محمد كامل",
      image: image4,
      specialty: "استشاري باطنة",
      rating: 4.5,
    },
  ];

  return (
    <section className="py-3 px-6 lg:px-12 shadow-sm">
      <h2 className="text-center text-4xl font-bold mb-5">الأطباء</h2>
      <p className="text-center mb-3 text-[#6D6D6D]">
        فريق من أفضل الأطباء المتخصصين لخدمتكم
      </p>
      <div className="flex  gap-4 overflow-x-auto pb-4">
        {doctors.map((doctor) => (
          <div
            key={doctor.id}
            className="min-w-[193px] flex flex-col items-center bg-linear-to-b from-[#F0F0F0] to-[#FFFFFF]  rounded-xl shadow-md p-4"
          >
            <img src={doctor.image} alt="image" className="self-center" />
            <p>{doctor.name}</p>
            <p className="text-[#6D6D6D] text-xs">{doctor.specialty}</p>

            <div className="flex gap-1 text-yellow-400">
              {[1, 2, 3, 4, 5].map((star) => {
                if (doctor.rating >= star) {
                  return <FaStar key={star} />;
                }

                if (doctor.rating >= star - 0.5) {
                  return <FaStarHalfAlt className="scale-x-[-1]" key={star} />;
                }

                return <FaRegStar key={star} />;
              })}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
