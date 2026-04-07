export default function DashboardEmptyState({ error }) {
  return (
    <div className="crm-page p-6">
      <div className="mx-auto max-w-5xl space-y-4">
        {/* <Header /> */}
        <div className="crm-card crm-hairline p-8 text-center">
          <p className="text-lg font-semibold tracking-[-0.02em] text-white">
            Dashboard ma'lumotlari topilmadi
          </p>
          {error ? (
            <p className="mt-2 text-sm text-rose-300">{error}</p>
          ) : (
            <p className="mt-2 text-sm text-[color:var(--crm-muted)]">
              API dan javob kelmagan yoki noto'g'ri formatda.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
