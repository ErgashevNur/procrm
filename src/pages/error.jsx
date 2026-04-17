import { useRouteError, isRouteErrorResponse } from "react-router-dom";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import { AlertTriangle, RefreshCcw } from "lucide-react";

export default function AppErrorFallback() {
  const error = useRouteError();
  const routeError = isRouteErrorResponse(error)
    ? `${error.status} ${error.statusText}`
    : (error?.message ?? "Noma'lum xatolik");

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#071828] p-6">
      <div className="w-full max-w-3xl rounded-2xl border border-white/10 bg-[#0b1e31] p-6 shadow-2xl shadow-black/30 md:p-8">
        <div className="grid gap-6 md:grid-cols-[280px_1fr] md:items-center">
          <div className="mx-auto">
            <DotLottieReact
              src="/tasks.json"
              loop
              autoplay
              style={{ width: 240, height: 240 }}
            />
          </div>

          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-red-500/30 bg-red-500/10 px-3 py-1 text-xs text-red-300">
              <AlertTriangle size={14} />
              Noma'lum xatolik
            </div>

            <h1 className="text-2xl font-bold text-white">Xatolik yuz berdi</h1>
            <p className="mt-2 text-sm text-slate-300">
              Iltimos, sahifani yangilang. Muammo davom etsa Operatorlar bilan
              bog'laning:
            </p>

            <p className="mt-2 text-sm text-slate-200">
              Tel raqam:{" "}
              <a
                href="tel:+998908444770"
                target="_blank"
                rel="noreferrer"
                className="font-semibold text-sky-300 underline underline-offset-2"
              >
                +998 90 844 47 70
              </a>
            </p>

            <p className="text-sm text-slate-200">
              Tel raqam:{" "}
              <a
                href="tel:+998777775137"
                target="_blank"
                rel="noreferrer"
                className="font-semibold text-sky-300 underline underline-offset-2"
              >
                +998 77 777 51 37
              </a>
            </p>

            <p className="text-sm text-slate-200">
              Telegram:{" "}
              <a
                href="https://t.me/codenur"
                target="_blank"
                rel="noreferrer"
                className="font-semibold text-sky-300 underline underline-offset-2"
              >
                @codenur
              </a>
            </p>

            <p className="mt-4 rounded-lg border border-white/10 bg-[#10263a] p-3 text-xs text-slate-400">
              Xatolik: {routeError}
            </p>

            <div className="mt-4 flex flex-wrap items-center gap-2">
              <button
                onClick={() => window.location.reload()}
                className="inline-flex items-center gap-2 rounded-lg bg-sky-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-sky-500"
              >
                <RefreshCcw size={14} />
                Qayta yuklash
              </button>

              <button
                onClick={() => window.history.back()}
                className="rounded-lg border border-white/20 px-4 py-2 text-sm text-slate-200 transition-colors hover:bg-white/10"
              >
                Orqaga
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
