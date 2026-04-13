export default function FormPageSuccess({
  form,
  redirectCountdown,
}) {
  const hasTelegram = Boolean(form?.telegramUrl);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#020711] px-4">
      <div className="w-full max-w-md rounded-2xl border border-[#1a4a2a] bg-[#0a2010] p-8 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#1a4a2a]">
          <svg
            className="h-7 w-7 text-[#4ade80]"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <h2 className="mb-2 text-xl font-bold text-white">
          Muvaffaqiyatli yuborildi!
        </h2>
        <p className="text-sm text-[#9ab8cc]">
          Arizangiz qabul qilindi. Tez orada siz bilan bog'lanamiz.
        </p>
        {hasTelegram && redirectCountdown !== null && (
          <div className="mt-5 flex flex-col items-center gap-3">
            <div className="flex items-center gap-2 rounded-xl border border-[#1a3a4a] bg-[#091827] px-4 py-3 text-sm text-[#9ab8cc]">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="shrink-0 text-[#229ED9]"
              >
                <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.247-1.97 9.289c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12L7.12 14.367l-2.95-.924c-.64-.204-.654-.64.136-.953l11.527-4.444c.533-.194 1.001.13.73.201z" />
              </svg>
              {redirectCountdown > 0
                ? `${redirectCountdown} soniyada Telegram kanaliga o'tasiz...`
                : "Yo'naltirilmoqda..."}
            </div>
            <button
              onClick={() => (window.location.href = form.telegramUrl)}
              className="text-xs text-[#229ED9] underline underline-offset-2 hover:no-underline"
            >
              Hozir o'tish
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
