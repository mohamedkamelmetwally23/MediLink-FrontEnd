import img8 from "../assets/landingPage/8.png"
import img9 from "../assets/landingPage/9.png"
import img10 from "../assets/landingPage/10.png"
import img11 from "../assets/landingPage/11.png"
import rowdown from "../assets/landingPage/rowdown.png"
import rowup from "../assets/landingPage/rowdup.png"

export default function Features() {
  return (
    <section className="py-5 px-6 lg:px-12">
      <h2 className="text-center text-4xl font-bold mb-12">
        لماذا <span className="text-[#05ADE8]"> ميدلينك؟</span>
      </h2>

      <div className="grid grid-cols-1 md:flex  gap-6 md:h-[350px]">
        <div>
            <div className="flex justify-between items-center md:flex-col md:justify-center md:items-center">
                <img src={img8} alt="image" />
                <div>
                    <p className="font-bold md:text-center">أطباء متخصصون</p>
                    <p className="text-[#636363] md:text-center">فريق من الأطباء والاستشاريين في مختلف التخصصات الطبية لتقديم رعاية صحية موثوقة.</p>
                </div>
            </div>
        </div>

        <div className="hidden md:flex md:self-center h-1/2 w-100">
            <img src={rowdown} alt="image" />
        </div>

        <div className="md:self-end">
            <div className="flex justify-between items-center md:flex-col">
                <img src={img9} alt="image" />
                <div>
                    <p className="font-bold md:text-center">حجز مواعيد بسهولة</p>
                    <p className="text-[#636363] md:text-center">احجز موعدك في دقائق قليلة من خلال منصة سهلة الاستخدام دون الحاجة إلى الاتصالات الهاتفية.</p>
                </div>
            </div>
        </div>

         <div className="hidden md:flex md:self-center h-1/2 w-100">
            <img src={rowup} alt="image" />
        </div>

        <div>
            <div className="flex justify-between items-center md:flex-col">
                <img src={img10} alt="image" />
                <div>
                    <p className="font-bold md:text-center">مساعد مدعوم بالذكاء الاصطناعي</p>
                   <p className="text-[#636363] md:text-center">يساعدك في الوصول إلى التخصص المناسب بسرعة من خلال اقتراحات ذكية مبنية على الأعراض والاحتياجات الطبية.</p>
                </div>
            </div>
        </div>

         <div className="hidden md:flex md:self-center h-1/2 w-100">
            <img src={rowdown} alt="image" />
        </div>

        <div className="md:self-end">
            <div className="flex justify-between items-center md:flex-col">
                <img src={img11} alt="image" />
                <div>
                    <p className="font-bold nd:text-center">تجربة آمنة ومريحة</p>
                    <p className="text-[#636363] md:text-center">نحافظ على خصوصية بيانات المرضى ونوفر تجربة رقمية سلسة وآمنة على جميع الأجهزة.</p>
                  
                </div>
            </div>
        </div>
        
      </div>
    </section>
  );
}
