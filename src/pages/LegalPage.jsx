import { Link } from "react-router-dom";

const legalContent = {
  terms: {
    title: "الشروط",
    subtitle: "الشروط الأساسية لاستخدام منصة MediLink وخدماتها.",
    sections: [
      "استخدام المنصة يكون للأغراض الطبية والإدارية المسموح بها فقط.",
      "يلتزم المستخدم بإدخال بيانات صحيحة ومحدثة عند إنشاء الحساب أو حجز المواعيد.",
      "لا يجوز إساءة استخدام النظام أو محاولة الوصول إلى بيانات غير مصرح بها.",
    ],
  },
  conditions: {
    title: "الأحكام",
    subtitle: "الأحكام العامة التي تنظم التعامل داخل منصة MediLink.",
    sections: [
      "قد يتم تحديث الأحكام من وقت لآخر بما يتوافق مع تطوير الخدمة.",
      "تخضع عمليات الحجز والإلغاء لسياسات العيادة أو المركز الطبي المسجل.",
      "تلتزم المنصة بحماية بيانات المستخدمين وفق ضوابط الخصوصية والأمان.",
    ],
  },
};

export default function LegalPage() {
  return (
    <main className="min-h-screen bg-white px-5 py-10 text-right text-gray-900 dark:bg-[#2E2E2E] dark:text-[#F0F0F0]">
      <section className="mx-auto max-w-3xl rounded-xl border border-gray-100 bg-white p-6 shadow-sm dark:border-[#3A3A3A] dark:bg-[#252525] sm:p-8">
        <Link
          to="/register"
          className="mb-8 inline-flex text-sm font-semibold text-[#05ADE8] underline underline-offset-4"
        >
          الرجوع للتسجيل
        </Link>

        <h1 className="text-3xl font-bold">الشروط والأحكام</h1>
        <p className="mt-3 leading-7 text-gray-600 dark:text-[#D2D2D2]">
          الشروط والأحكام الخاصة بمنصة MediLink مُجمعة في صفحة واحدة.
        </p>

        <div className="mt-8 space-y-8">
          {["terms", "conditions"].map((key) => {
            const content = legalContent[key];
            return (
              <div key={key}>
                <h2 className="mb-3 text-2xl font-bold text-[#05ADE8]">{content.title}</h2>
                <p className="mb-4 text-sm text-gray-600 dark:text-[#D2D2D2]">{content.subtitle}</p>

                <div className="space-y-4">
                  {content.sections.map((section, index) => (
                    <div
                      key={section}
                      className="rounded-lg bg-[#F5F7F8] p-4 leading-7 dark:bg-[#303030]"
                    >
                      <span className="ml-2 font-bold text-[#05ADE8]">{index + 1}.</span>
                      {section}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </main>
  );
}
