import img1 from "../assets/landingPage/13(1).png";
import img2 from "../assets/landingPage/13 (2).png";
import img3 from "../assets/landingPage/13 (3).png";

export default function BenefitsOfWeb() {
  return (
    <>
      <h1 className="text-3xl text-center">ماذا يمكنك أن تسأل؟</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 md:mt-5 gap-2 py-5 mx-5">
        <div className="shadow-md md:shadow-lg flex flex-col gap-3 items-center py-2">
          <img src={img3} alt="image" />
          <p className="text-2xl">احجز موعدك</p>
          <p className="text-[#636363]">احجز موعدك بسهولة مع الطبيب المناسب</p>
        </div>

        <div className="shadow-md md:shadow-lg flex flex-col gap-3 items-center py-2">
          <img src={img2} alt="image" />
          <p className="text-2xl">اعرف التخصص المناسب</p>
          <p className="text-[#636363]">
            اخبرني عن أعراضك وسأوجهك للتخصص المناسب
          </p>
        </div>

        <div className="shadow-md md:shadow-lg flex flex-col gap-3 items-center py-2">
          <img src={img1} alt="image" />
          <p className="text-2xl">ابحث عن طبيب</p>
          <p className="text-[#636363]">
            ابحث عن أفضل الأطباء والمواعيد المتاحة المناسبة لك.
          </p>
        </div>
      </div>
    </>
  );
}
