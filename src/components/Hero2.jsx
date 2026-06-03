import img4 from "../assets/landingPage/4.png"
import img5 from "../assets/landingPage/5.png"
import img6 from "../assets/landingPage/6.png"
import img7 from "../assets/landingPage/7.png"

export default function Hero2() {
  return (
    <div className="h-[178px] bg-linear-to-r from-[#05ADE8] to-[#6CCCC8] rounded-xl hidden md:flex justify-between px-10 mb-10 items-center">
        <div className="flex flex-col justify-center items-center text-white border-l-2 border-l-white w-1/4">
            <img src={img4} alt="" />
            <p>+ 20</p>
            <p>تخصص طبي</p>
        </div>

        <div className="flex flex-col justify-center items-center text-white border-l-2 border-l-white  w-1/4">
            <img src={img5} alt="" />
            <p>+ 30</p>
            <p>طبيب معتمد </p>
        </div>

        <div className="flex flex-col justify-center items-center text-white border-l-2 border-l-white  w-1/4">
            <img src={img6} alt="" />
            <p>+ 1200</p>
            <p>مريض</p>
        </div>
        <div className="flex flex-col justify-center items-center text-white   w-1/4">
            <img src={img7} alt="" />
            <p>+ 1000</p>
            <p>حجز من خلال الموقع</p>
        </div>
    </div>
  );
}
