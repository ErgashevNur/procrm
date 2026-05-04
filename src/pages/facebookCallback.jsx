import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "@/lib/toast";
import { exchangeFacebookCode } from "@/services/facebookService";

export default function FacebookCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    let active = true;

    const handle = async () => {
      const params = new URLSearchParams(window.location.search);
      const code = params.get("code");
      const error = params.get("error");

      if (error) throw new Error(decodeURIComponent(error));

      // Agar backend code bilan redirect qilgan bo'lsa — exchange qilamiz
      if (code) {
        await exchangeFacebookCode(code);
      }

      if (!active) return;

      // Popup bo'lsa: parent'ga xabar berib yopamiz
      if (window.opener && !window.opener.closed) {
        window.opener.postMessage(
          { type: "FB_CONNECTED" },
          window.location.origin,
        );
        window.close();
        return;
      }

      // Normal sahifa: crm-market ga qaytamiz
      toast.success("Facebook muvaffaqiyatli ulandi");
      navigate("/crm-market", { replace: true });
    };

    handle().catch((err) => {
      if (!active) return;
      const msg = err?.message || "Facebook ulanishda xato";
      if (window.opener && !window.opener.closed) {
        window.opener.postMessage(
          { type: "FB_ERROR", message: msg },
          window.location.origin,
        );
        window.close();
        return;
      }
      toast.error(msg);
      navigate("/crm-market", { replace: true });
    });

    return () => {
      active = false;
    };
  }, [navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#070b12] px-6 text-center">
      <div className="rounded-[28px] border border-white/[0.08] bg-white/[0.03] px-8 py-10 backdrop-blur-sm">
        <p className="text-[11px] font-semibold tracking-[0.28em] text-blue-400/80 uppercase">
          Facebook Login
        </p>
        <h1 className="mt-3 text-2xl font-semibold text-white">
          Ulanmoqda...
        </h1>
        <p className="mt-3 text-sm leading-6 text-white/45">
          Facebook akkauntingiz tekshirilmoqda.
        </p>
      </div>
    </div>
  );
}
