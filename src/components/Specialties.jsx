import img12 from "../assets/landingPage/lets-icons_tooth-light.png"
import img13 from "../assets/landingPage/healthicons_stomach-outline.png"
import img14 from "../assets/landingPage/hugeicons_kid.png"
import img15 from "../assets/landingPage/streamline-ultimate_hair-skin.png"
import img16 from "../assets/landingPage/healthicons_nose-outline.png"
import img17 from "../assets/landingPage/Vector.png"
import img18 from "../assets/landingPage/vaadin_eye.png"

const images = [img12, img13, img14, img15, img16, img17, img18]

const specialties = [
  "الفم والأسنان",
  "الباطنة",
  "الأطفال",
  "الجلدية والتجميل",
  "أنف وأذن",
  "المخ والأعصاب",
  "العيون",
];

export default function Specialties() {
  return (
    <section className="py-16 px-6 lg:px-12">
      <h2 className="text-center text-4xl font-bold mb-10">التخصصات</h2>

      <div className="grid grid-cols-2 md:grid-cols-7 cursor-pointer gap-4">
        {specialties.map((item, index) => (
          <div key={item} className="card bg-base shadow-md flex flex-col justify-center items-center">
            <img src={images[index]} className="w-[50px] h-[50px]" alt="" />
            <div className="card-body items-center text-center">{item}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
