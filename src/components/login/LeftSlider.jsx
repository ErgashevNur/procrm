import { useEffect, useState } from "react";
import Lottie from "lottie-react";
import LoginBrand from "@/components/login/LoginBrand";

const slides = [
  {
    animationPath: "/ai_agent.json",
    src: "/ai_agent.json",
    title: "AI yordamchi ish ritmini ushlab turadi",
    desc: "Takroriy jarayonlarni tezlashtirib, jamoaning kundalik ishini bir markazdan boshqarishga yordam beradi.",
    stat: "24/7 avtomatlashtirish",
  },
  {
    animationPath: "/login.json",
    src: "/login.json",
    title: "Leadlar yo'qolib ketmaydi",
    desc: "Har bir mijoz, status va keyingi qadam bitta pipeline ichida aniq ko'rinadi.",
    stat: "Leadlar nazorati",
  },
  {
    animationPath: "/analitic.json",
    src: "/analitic.json",
    title: "Raqamlar qarorni tezlashtiradi",
    desc: "Real vaqt analitikasi bilan savdo jarayonidagi o'sish nuqtalarini darhol ko'rasiz.",
    stat: "Jonli hisobotlar!.",
  },
];

export default function LeftSlider() {
  const [current, setCurrent] = useState(0);
  const [visible, setVisible] = useState(true);
  const [animationData, setAnimationData] = useState(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setVisible(false);
      const timeout = setTimeout(() => {
        setCurrent((prev) => (prev + 1) % slides.length);
        setVisible(true);
      }, 280);
      return () => clearTimeout(timeout);
    }, 4200);
    return () => clearInterval(interval);
  }, []);

  const slide = slides[current];

  useEffect(() => {
    let cancelled = false;

    const loadAnimation = async () => {
      try {
        const response = await fetch(slide.animationPath);
        const data = await response.json();
        if (!cancelled) setAnimationData(data);
      } catch {
        if (!cancelled) setAnimationData(null);
      }
    };

    loadAnimation();

    return () => {
      cancelled = true;
    };
  }, [slide.animationPath]);

  return (
    <aside className="relative hidden min-h-screen flex-col justify-between overflow-hidden border-r border-white/[0.06] bg-[#080c14] px-12 py-10 xl:flex">
      <div className="pointer-events-none absolute -top-40 -left-40 h-[480px] w-[480px] rounded-full bg-sky-500/[0.07] blur-[96px]" />

      <LoginBrand className="relative z-10 flex flex-col items-center gap-1 text-center" />

      <div
        className="relative z-10 flex flex-1 flex-col items-center justify-center text-center"
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? "translateY(0)" : "translateY(12px)",
          transition: "opacity 0.42s ease, transform 0.42s ease",
        }}
      >
        <div className="mb-8 inline-flex w-fit items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.04] px-3.5 py-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-sky-400" />
          <span className="text-[11px] font-medium tracking-[0.18em] text-sky-400/90 uppercase">
            {slide.stat}
          </span>
        </div>

        <div className="mb-10 flex w-full justify-center">
          <div className="rounded-[28px] border border-white/[0.07] bg-white/[0.03] p-5">
            {animationData ? (
              <Lottie
                key={current}
                animationData={animationData}
                loop
                autoplay
                style={{ width: 260, height: 260 }}
              />
            ) : (
              <div style={{ width: 260, height: 260 }} />
            )}
          </div>
        </div>

        <h3 className="mb-4 max-w-sm text-[28px] leading-[1.25] font-semibold tracking-[-0.02em] text-white">
          {slide.title}
        </h3>
        <p className="max-w-xs text-sm leading-7 text-white/38">{slide.desc}</p>
      </div>

      <div className="relative z-10 flex items-center justify-center gap-2">
        {slides.map((item, index) => (
          <button
            key={item.title}
            type="button"
            onClick={() => {
              setVisible(false);
              setTimeout(() => {
                setCurrent(index);
                setVisible(true);
              }, 280);
            }}
            className={`h-[3px] rounded-full transition-all duration-300 ${
              index === current
                ? "w-8 bg-sky-400"
                : "w-3 bg-white/15 hover:bg-white/30"
            }`}
            aria-label={`${index + 1}-slayd`}
          />
        ))}
      </div>
    </aside>
  );
}
