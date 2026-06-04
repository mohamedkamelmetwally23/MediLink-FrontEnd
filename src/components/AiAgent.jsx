export default function AiAgent() {
  return (
    <div className="flex flex-col gap-3 justify-center items-center mt-10 mb-10 px-5 md:w-1/2 md:mx-auto">
      <h1 className="text-4xl text-center font-semiboldbold">
        <span className="text-[#05ADE8]"> مساعدك الذكي </span>للرعاية
        الصحية{" "}
      </h1>
      <p className="text-center text-[#6D6D6D] md:w-1/2">
        اسأل عن الأعراض, التخصصات, الأطباء أو احجز موعدك بسهولة.مساعد AI متاح
        على مدار الساعة لمساعدتك
      </p>
      <div className="w-full border-4 border-[#05ADE8] rounded-xl">
        <input
          type="text"
          placeholder="أكتب رسالتك هنا ..."
          className="input w-full focus:border-none focus:outline-none py-5"
        />
        <div className="flex justify-between">
          <div className="p-4 cursor-pointer">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="size-7"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 4.5v15m7.5-7.5h-15"
              />
            </svg>
          </div>

          <div className="flex gap-5 items-center px-5 ">
            <div className="relative cursor-pointer">
              <div className="bg-red-600 h-[35px] w-[35px] bg-linear-to-b from-[#05ADE8] to-[#6CCCC8] rounded-md"></div>
              <div className="absolute top-2 right-1.5">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="size-6 text-white"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5"
                  />
                </svg>
              </div>
            </div>
            <div>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="size-6 cursor-pointer"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 18.75a6 6 0 0 0 6-6v-1.5m-6 7.5a6 6 0 0 1-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 0 1-3-3V4.5a3 3 0 1 1 6 0v8.25a3 3 0 0 1-3 3Z"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
