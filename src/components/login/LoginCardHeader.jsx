import LoginBackButton from "@/components/login/LoginBackButton";

export default function LoginCardHeader({ navigate }) {
  return (
    <div className="mb-8 flex items-start justify-between gap-4">
      <div>
        <p className="mb-3 text-[10px] font-semibold tracking-[0.28em] text-sky-400/80 uppercase">
          Tizimga kirish
        </p>
        <h1 className="text-[26px] leading-tight font-semibold tracking-[-0.02em] text-white">
          Hisobingizga kiring!
        </h1>
        <p className="mt-3 text-sm leading-6 text-white/38">
          Email va parolingizni kiriting.
        </p>
      </div>
      <LoginBackButton
        onClick={() => navigate("/")}
        className="hidden xl:inline-flex items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.04] px-3 py-2 text-xs leading-none font-medium text-white/70 transition-colors hover:border-white/15 hover:text-white sm:rounded-xl sm:px-3 sm:py-2 sm:text-xs"
      />
    </div>
  );
}
