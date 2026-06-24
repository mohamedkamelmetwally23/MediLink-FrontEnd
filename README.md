<div align="center">

<img src="src/assets/branding/logo.png" alt="MediLink Logo" width="120" />

# MediLink

**نظام إدارة العيادات الطبية الذكي**

[![React](https://img.shields.io/badge/React-19.2-61DAFB?style=for-the-badge&logo=react&logoColor=white)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-8.0-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-4.3-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![MongoDB](https://img.shields.io/badge/MongoDB-7.3-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://mongodb.com)
[![OpenAI](https://img.shields.io/badge/OpenAI-GPT-412991?style=for-the-badge&logo=openai&logoColor=white)](https://openai.com)
[![Vercel](https://img.shields.io/badge/Vercel-Deploy-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://vercel.com)

</div>

---

## نظرة عامة

**MediLink** منصة متكاملة لإدارة العيادات الطبية، مبنية بالكامل باللغة العربية وتدعم الواجهات من اليمين لليسار (RTL). تجمع بين إدارة المواعيد والمرضى والأطباء مع ميزات ذكاء اصطناعي متقدمة لتحسين تجربة الرعاية الصحية.

---

## المميزات الرئيسية

### لوحات تحكم متعددة الأدوار

| الدور | الصلاحيات |
|---|---|
| **المدير** | إدارة كاملة للمستخدمين والأطباء والتخصصات والمواعيد والعيادة |
| **الطبيب** | عرض المواعيد وملفات المرضى وتسجيل الملاحظات الطبية |
| **الاستقبال** | حجز المواعيد وإدارة المرضى والجدول اليومي |
| **المريض** | حجز مواعيد وتصفح الأطباء وإدارة الملف الشخصي |

### الذكاء الاصطناعي

- **مساعد طبي ذكي** — محادثة AI لتوجيه المرضى وتحديد التخصص المناسب
- **نظام فرز الأعراض** — تحليل الأعراض واقتراح التخصص الطبي تلقائيًا
- **توليد الملاحظات الطبية** — إنشاء تقارير سريرية من نص أو صوت الطبيب
- **خدمة التفريغ الصوتي** — تحويل الصوت إلى نص للاستشارات

### واجهة المستخدم

- دعم كامل للغة العربية واتجاه RTL
- وضع مظلم / فاتح
- تصميم متجاوب للجوال والديسكتوب
- جداول قابلة للبحث والفلترة والترقيم
- إشعارات فورية (Toast)
- مخططات ورسوم بيانية للإحصائيات

---

## التقنيات المستخدمة

```
Frontend       →  React 19, Vite 8, Tailwind CSS 4, DaisyUI 5
Routing        →  React Router 7
Charts         →  Recharts 3
Icons          →  Lucide React, React Icons
Backend        →  Vercel Serverless Functions (Node.js)
Database       →  MongoDB 7
AI             →  OpenAI GPT (Chat, Triage, Notes, Transcription)
Auth           →  JWT Token-based + Role-Based Access Control
```

---

## هيكل المشروع

```
MediLink/
├── src/
│   ├── pages/
│   │   ├── admin/              # لوحة المدير
│   │   ├── doctor/             # بوابة الطبيب
│   │   ├── receptionist/       # بوابة الاستقبال
│   │   ├── patient/            # بوابة المريض
│   │   └── Auth/               # صفحات تسجيل الدخول
│   ├── components/             # مكونات مشتركة
│   ├── services/               # خدمات API
│   ├── hooks/                  # React Hooks مخصصة
│   ├── context/                # Global State
│   └── utils/                  # دوال مساعدة
├── api/                        # Serverless Functions
│   ├── chat-proxy-core.js      # محرك المساعد الذكي
│   ├── triage.js               # فرز الأعراض
│   ├── medical-note.js         # توليد الملاحظات
│   ├── transcribe.js           # التفريغ الصوتي
│   └── db.js                   # اتصال MongoDB
└── public/                     # ملفات ثابتة
```

---

## تشغيل المشروع

### المتطلبات

- Node.js 18+
- حساب MongoDB Atlas
- مفتاح OpenAI API

### الخطوات

**1. نسخ المشروع**

```bash
git clone https://github.com/mohamedkamelmetwally23/MediLink.git
cd MediLink
```

**2. تثبيت الحزم**

```bash
npm install
```

**3. إعداد متغيرات البيئة**

أنشئ ملف `.env.local` وأضف:

```env
OPENAI_API_KEY=your_openai_api_key
OPENAI_MODEL=gpt-4o-mini
MONGODB_URI=your_mongodb_connection_string
MONGODB_DB=medilink
```

**4. تشغيل بيئة التطوير**

```bash
npm run dev
```

التطبيق سيعمل على `http://localhost:5173`

---

## الأوامر المتاحة

| الأمر | الوظيفة |
|---|---|
| `npm run dev` | تشغيل سيرفر التطوير مع HMR |
| `npm run build` | بناء نسخة الإنتاج |
| `npm run preview` | معاينة نسخة الإنتاج محليًا |
| `npm run lint` | فحص جودة الكود |

---

## النشر على Vercel

المشروع جاهز للنشر على Vercel مباشرة. تأكد من إضافة متغيرات البيئة في إعدادات Vercel:

```
OPENAI_API_KEY
OPENAI_MODEL
MONGODB_URI
MONGODB_DB
```

---

## الصفحات والمسارات

<details>
<summary>عرض جميع المسارات</summary>

**عام**
- `/` — الصفحة الرئيسية
- `/login` — تسجيل الدخول
- `/register` — إنشاء حساب
- `/forgot-password` — استعادة كلمة المرور

**المدير** `/admin/*`
- `/admin/dashboard` — الإحصائيات والمخططات
- `/admin/users` — إدارة المستخدمين
- `/admin/doctors` — إدارة الأطباء
- `/admin/receptionists` — إدارة الاستقبال
- `/admin/specialties` — التخصصات الطبية
- `/admin/appointments` — المواعيد
- `/admin/clinic` — إعدادات العيادة
- `/admin/activity` — سجل النشاط

**الطبيب** `/doctor/*`
- `/doctor/dashboard` — نظرة عامة
- `/doctor/appointments` — المواعيد
- `/doctor/patients` — قائمة المرضى

**الاستقبال** `/receptionist/*`
- `/receptionist/dashboard` — نظرة عامة
- `/receptionist/appointments` — تفاصيل الحجوزات
- `/receptionist/patients` — إدارة المرضى
- `/receptionist/doctors` — دليل الأطباء
- `/receptionist/book` — حجز موعد جديد
- `/receptionist/schedule` — الجدول اليومي

**المريض** `/patient/*`
- `/patient/:id/home` — الصفحة الرئيسية
- `/patient/:id/profile` — الملف الشخصي
- `/patient/doctors` — تصفح الأطباء
- `/patient/doctors/:id` — ملف الطبيب
- `/patient/doctors/:id/book` — حجز موعد

</details>

---

## ملاحظات

- قبل تسليم أي تعديل شغل `npm run lint` و `npm run build`.
- الحفاظ على اتجاه `rtl` عند إضافة صفحات جديدة.
- صور ملفات المستخدمين توضع داخل `src/assets/profiles/`.

---

<div align="center">

صُنع بـ ❤️ لتحسين تجربة الرعاية الصحية

</div>
