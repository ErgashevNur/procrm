import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { getDefaultRouteByRole } from "@/lib/rbac";
import { extractAuthPayloadFromUrl, persistAuthSession } from "@/lib/auth";
import { API as API_BASE } from "@/lib/api";

async function parseJsonSafe(response) {
  const text = await response.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return { message: text };
  }
}

export default function GoogleAuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    let active = true;

    const finishGoogleLogin = async () => {
      const payloadFromUrl = extractAuthPayloadFromUrl();

      if (payloadFromUrl) {
        const session = await persistAuthSession(payloadFromUrl, API_BASE);
        if (!active) return;
        toast.success("Google orqali kirish muvaffaqiyatli yakunlandi");
        navigate(getDefaultRouteByRole(session.user.role), { replace: true });
        return;
      }

      const currentUrl = new URL(window.location.href);
      const error =
        currentUrl.searchParams.get("error") ||
        currentUrl.searchParams.get("message") ||
        new URLSearchParams(currentUrl.hash.replace(/^#/, "")).get("error");
      if (error) {
        throw new Error(decodeURIComponent(error));
      }

      const code = currentUrl.searchParams.get("code");
      if (code && API_BASE) {
        const response = await fetch(
          `${API_BASE}/auth/google/callback${currentUrl.search}`,
          { credentials: "include" },
        );
        const payload = await parseJsonSafe(response);
        if (!response.ok) {
          throw new Error(payload?.message || "Google avtorizatsiyasi yakunlanmadi");
        }
        const session = await persistAuthSession(payload, API_BASE);
        if (!active) return;
        toast.success("Google orqali kirish muvaffaqiyatli yakunlandi");
        navigate(getDefaultRouteByRole(session.user.role), { replace: true });
        return;
      }

      throw new Error("Google login javobida token topilmadi");
    };

    finishGoogleLogin().catch((error) => {
      if (!active) return;
      toast.error(error?.message || "Google orqali kirishda xatolik");
      navigate("/register", { replace: true });
    });

    return () => {
      active = false;
    };
  }, [navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#070b12] px-6 text-center">
      <div className="rounded-[28px] border border-white/[0.08] bg-white/[0.03] px-8 py-10 backdrop-blur-sm">
        <p className="text-[11px] font-semibold tracking-[0.28em] text-sky-400/80 uppercase">
          Google Login
        </p>
        <h1 className="mt-3 text-2xl font-semibold text-white">
          Kirish yakunlanmoqda...
        </h1>
        <p className="mt-3 text-sm leading-6 text-white/45">
          Sessiya tekshirilmoqda va profilingiz yuklanmoqda.
        </p>
      </div>
    </div>
  );
}
