import { useState } from "react";
import { Link } from "react-router-dom";
import {
  FiMic,
  FiMoon,
  FiPaperclip,
  FiPlay,
  FiSend,
  FiSettings,
  FiSmile,
  FiThumbsDown,
  FiThumbsUp,
  FiUser,
  FiVolume2,
  FiX,
} from "react-icons/fi";
import { FaStar } from "react-icons/fa";
import { toast } from "react-toastify";
import { loginUser, saveAuthSession } from "../services/authApi";
import doctorImage1 from "../assets/landingPage/12 1.png";
import doctorImage2 from "../assets/landingPage/12 1 (1).png";
import doctorImage3 from "../assets/landingPage/12 1 (2).png";

const suggestedDoctors = [
  {
    id: 1,
    name: "د. عادل محمد",
    specialty: "استشاري باطنة",
    image: doctorImage2,
  },
  {
    id: 2,
    name: "د. ندى حسين",
    specialty: "أخصائية جلدية",
    image: doctorImage1,
  },
  {
    id: 3,
    name: "د. عبد الله محمود",
    specialty: "أخصائي عظام",
    image: doctorImage3,
  },
];

const initialMessages = [
  {
    id: "welcome",
    type: "assistant",
    text: "مرحبا، أنا مساعدك الذكي. يمكنك سؤالي عن الأعراض أو التخصص المناسب.",
  },
  {
    id: "audio",
    type: "audio",
  },
  {
    id: "recommendation",
    type: "assistant",
    text: "بناء على الأعراض التي ذكرتها، قد يناسبك حجز كشف مع طبيب باطنة، وهذه بعض الترشيحات المتاحة.",
  },
  {
    id: "doctors",
    type: "doctors",
  },
];

function AssistantAvatar() {
  return (
    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#DDF6FD] text-[10px] font-bold text-[#05ADE8]">
      SL
    </span>
  );
}

function UserAvatar() {
  return (
    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gray-200 text-gray-500 dark:bg-[#3A3A3A] dark:text-[#D2D2D2]">
      <FiUser className="h-4 w-4" />
    </span>
  );
}

function AudioBubble() {
  return (
    <div className="flex items-center gap-2 rounded-full bg-linear-to-r from-[#05ADE8] to-[#6CCCC8] px-3 py-2 text-white shadow-sm">
      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/25">
        <FiPlay className="h-3.5 w-3.5" />
      </span>
      <span className="flex h-5 items-center gap-0.5">
        {Array.from({ length: 18 }).map((_, index) => (
          <span
            key={index}
            className="w-0.5 rounded-full bg-white/90"
            style={{ height: `${6 + (index % 5) * 3}px` }}
          />
        ))}
      </span>
      <span className="text-[10px]">00:12</span>
    </div>
  );
}

function DoctorCards() {
  return (
    <div className="grid grid-cols-3 gap-2">
      {suggestedDoctors.map((doctor) => (
        <button
          key={doctor.id}
          type="button"
          onClick={() => toast.info(`سيتم فتح ملف ${doctor.name} قريبًا`)}
          className="rounded-lg border border-gray-100 bg-white p-2 text-center shadow-sm transition hover:border-[#05ADE8] dark:border-[#3A3A3A] dark:bg-[#303030]"
        >
          <img
            src={doctor.image}
            alt={doctor.name}
            className="mx-auto h-16 object-contain"
          />
          <p className="mt-1 line-clamp-1 text-[11px] font-semibold text-gray-900 dark:text-[#F0F0F0]">
            {doctor.name}
          </p>
          <p className="line-clamp-1 text-[10px] text-gray-500 dark:text-[#D2D2D2]">
            {doctor.specialty}
          </p>
          <div className="mt-1 flex justify-center gap-0.5 text-[10px] text-yellow-400">
            {[1, 2, 3, 4, 5].map((star) => (
              <FaStar key={star} />
            ))}
          </div>
        </button>
      ))}
    </div>
  );
}

function Message({ message }) {
  if (message.type === "user") {
    return (
      <div className="flex items-start justify-end gap-2">
        <div className="max-w-[78%] rounded-2xl rounded-tr-sm bg-[#EAF8FC] px-3 py-2 text-sm leading-6 text-gray-800 dark:bg-[#303030] dark:text-[#F0F0F0]">
          {message.text}
        </div>
        <UserAvatar />
      </div>
    );
  }

  return (
    <div className="flex items-start gap-2">
      <AssistantAvatar />
      <div className="max-w-[82%] space-y-2">
        {message.type === "assistant" && (
          <div className="rounded-2xl rounded-tr-sm border border-gray-100 bg-white px-3 py-2 text-sm leading-6 text-gray-700 shadow-sm dark:border-[#3A3A3A] dark:bg-[#303030] dark:text-[#F0F0F0]">
            {message.text}
          </div>
        )}

        {message.type === "audio" && <AudioBubble />}
        {message.type === "doctors" && <DoctorCards />}

        {message.type !== "audio" && (
          <div className="flex items-center gap-2 text-gray-400">
            <FiVolume2 className="h-3.5 w-3.5" />
            <FiThumbsUp className="h-3.5 w-3.5" />
            <FiThumbsDown className="h-3.5 w-3.5" />
          </div>
        )}
      </div>
    </div>
  );
}

function LoginCard({ isLoggingIn, loginData, setLoginData, onLogin }) {
  return (
    <div className="absolute inset-0 z-10 flex items-center justify-center bg-gray-900/25 px-5 backdrop-blur-[1px]">
      <form
        onSubmit={onLogin}
        className="w-full max-w-[300px] rounded-lg bg-white p-5 text-right shadow-2xl dark:bg-[#252525]"
      >
        <h3 className="text-center text-xl font-semibold text-gray-900 dark:text-[#F0F0F0]">
          تسجيل دخول
        </h3>
        <p className="mt-1 text-center text-xs text-gray-500 dark:text-[#D2D2D2]">
          سجل دخولك لاستخدام مساعدك الذكي
        </p>

        <label className="mt-4 block text-xs font-semibold text-gray-700 dark:text-[#F0F0F0]">
          رقم الهاتف
        </label>
        <input
          type="tel"
          value={loginData.phoneNumber}
          onChange={(event) =>
            setLoginData((prev) => ({
              ...prev,
              phoneNumber: event.target.value,
            }))
          }
          placeholder="01XXXXXXXXX"
          className="mt-1 h-9 w-full rounded-md border border-gray-200 bg-white px-3 text-right text-xs outline-none focus:ring-1 focus:ring-[#05ADE8] dark:border-[#3A3A3A] dark:bg-[#303030] dark:text-[#F0F0F0]"
        />

        <label className="mt-3 block text-xs font-semibold text-gray-700 dark:text-[#F0F0F0]">
          كلمة المرور
        </label>
        <input
          type="password"
          value={loginData.password}
          onChange={(event) =>
            setLoginData((prev) => ({ ...prev, password: event.target.value }))
          }
          placeholder="********"
          className="mt-1 h-9 w-full rounded-md border border-gray-200 bg-white px-3 text-right text-xs outline-none focus:ring-1 focus:ring-[#05ADE8] dark:border-[#3A3A3A] dark:bg-[#303030] dark:text-[#F0F0F0]"
        />

        <button
          type="submit"
          disabled={isLoggingIn}
          className="mt-4 h-9 w-full rounded-md border-none bg-linear-to-r from-[#05ADE8] to-[#6CCCC8] text-xs font-semibold text-white disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isLoggingIn ? "جاري تسجيل الدخول..." : "تسجيل دخول"}
        </button>

        <p className="mt-3 text-center text-[11px] text-gray-500 dark:text-[#D2D2D2]">
          ليس لديك حساب؟{" "}
          <Link to="/register" className="font-semibold text-[#05ADE8]">
            إنشاء حساب
          </Link>
        </p>
      </form>
    </div>
  );
}

export default function AiAgent({ onClose }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loginData, setLoginData] = useState({ phoneNumber: "", password: "" });
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState(initialMessages);

  const handleLogin = async (event) => {
    event.preventDefault();

    if (!loginData.phoneNumber.trim() || !loginData.password.trim()) {
      toast.warning("أدخل رقم الهاتف وكلمة المرور");
      return;
    }

    if (!/^01[0-9]{9}$/.test(loginData.phoneNumber.trim())) {
      toast.warning("رقم الهاتف غير صحيح");
      return;
    }

    setIsLoggingIn(true);
    try {
      const data = await loginUser({
        phone: loginData.phoneNumber.trim(),
        password: loginData.password,
      });

      saveAuthSession(data);
      setIsLoggedIn(true);
      toast.success("تم تسجيل الدخول");
    } catch (error) {
      toast.error(error.message || "تعذر تسجيل الدخول");
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleSend = () => {
    if (!isLoggedIn) {
      toast.warning("سجل دخولك لاستخدام المساعد الذكي");
      return;
    }

    if (!message.trim()) {
      toast.warning("اكتب رسالتك أولًا");
      return;
    }

    const userMessage = {
      id: `user-${Date.now()}`,
      type: "user",
      text: message.trim(),
    };
    const assistantMessage = {
      id: `assistant-${Date.now()}`,
      type: "assistant",
      text: "فهمت سؤالك. سأرشح لك التخصص المناسب وأقرب طبيب متاح بناء على التفاصيل التي كتبتها.",
    };

    setMessages((prev) => [...prev, userMessage, assistantMessage]);
    setMessage("");
  };

  return (
    <div
      className="flex h-full flex-col overflow-hidden bg-white text-right text-gray-900 dark:bg-[#252525] dark:text-[#F0F0F0]"
      dir="rtl"
    >
      <header className="flex h-14 shrink-0 items-center justify-between border-b border-gray-100 px-4 dark:border-[#3A3A3A]">
        <div className="flex items-center gap-1" dir="ltr">
          <button
            type="button"
            onClick={onClose}
            aria-label="إغلاق المساعد الذكي"
            className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-gray-200 text-gray-500 transition hover:border-[#05ADE8] hover:text-[#05ADE8] dark:border-[#3A3A3A] dark:text-[#D2D2D2]"
          >
            <FiX className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => toast.info("إعدادات المساعد ستكون متاحة قريبًا")}
            aria-label="إعدادات المساعد"
            className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-[#BFEAF8] text-[#05ADE8] transition hover:bg-[#EAF8FC]"
          >
            <FiSettings className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => toast.info("وضع المحادثة الليلي متاح من زر الثيم")}
            aria-label="وضع المحادثة"
            className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-gray-200 text-gray-400 transition hover:text-[#05ADE8] dark:border-[#3A3A3A]"
          >
            <FiMoon className="h-3.5 w-3.5" />
          </button>
        </div>

        <h2 className="text-base font-bold text-[#05ADE8]">ميديلينك</h2>
      </header>

      <main className="relative flex-1 overflow-y-auto bg-[#F5FBFD] px-4 py-4 dark:bg-[#1F1F1F]">
        <div className={!isLoggedIn ? "opacity-40" : ""}>
          <div className="space-y-4">
            {messages.map((chatMessage) => (
              <Message key={chatMessage.id} message={chatMessage} />
            ))}
          </div>
        </div>

        {!isLoggedIn && (
          <LoginCard
            isLoggingIn={isLoggingIn}
            loginData={loginData}
            setLoginData={setLoginData}
            onLogin={handleLogin}
          />
        )}
      </main>

      <footer className="shrink-0 border-t border-gray-100 bg-white p-3 dark:border-[#3A3A3A] dark:bg-[#252525]">
        <div className="rounded-2xl border border-gray-200 bg-white px-3 py-2 shadow-sm dark:border-[#3A3A3A] dark:bg-[#303030]">
          <input
            type="text"
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                handleSend();
              }
            }}
            placeholder="اكتب رسالتك هنا..."
            className="h-9 w-full bg-transparent text-right text-sm outline-none placeholder:text-gray-400 dark:text-[#F0F0F0]"
          />

          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-1 text-gray-400">
              <button
                type="button"
                onClick={() => toast.info("رفع الملفات سيكون متاحًا قريبًا")}
                aria-label="إضافة ملف"
                className="inline-flex h-7 w-7 items-center justify-center rounded-full transition hover:bg-[#EAF8FC] hover:text-[#05ADE8]"
              >
                <FiPaperclip className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => toast.info("الرموز التعبيرية ستكون متاحة قريبًا")}
                aria-label="رموز تعبيرية"
                className="inline-flex h-7 w-7 items-center justify-center rounded-full transition hover:bg-[#EAF8FC] hover:text-[#05ADE8]"
              >
                <FiSmile className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => toast.info("التسجيل الصوتي سيكون متاحًا قريبًا")}
                aria-label="تسجيل صوتي"
                className="inline-flex h-7 w-7 items-center justify-center rounded-full transition hover:bg-[#EAF8FC] hover:text-[#05ADE8]"
              >
                <FiMic className="h-4 w-4" />
              </button>
            </div>

            <button
              type="button"
              onClick={handleSend}
              className="inline-flex h-9 items-center gap-1 rounded-full bg-linear-to-r from-[#05ADE8] to-[#6CCCC8] px-4 text-xs font-semibold text-white shadow-sm transition hover:from-[#05ADE8] hover:to-[#6CCCC8]"
            >
              إرسال
              <FiSend className="h-3.5 w-3.5 rotate-180" />
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
