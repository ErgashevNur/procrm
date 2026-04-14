export default function FormPageHeader({ form }) {
  return (
    <div className="mb-6 overflow-hidden rounded-[28px] border border-[#1e3448] bg-[linear-gradient(180deg,rgba(15,34,49,0.94),rgba(9,22,34,0.96))] shadow-[0_24px_80px_rgba(0,0,0,0.28)]">
      {form.headerImage?.dataUrl && (
        <div className="relative aspect-[8/3] w-full overflow-hidden border-b border-white/10 bg-[#07111d]">
          <img
            src={form.headerImage.dataUrl}
            alt={form.title}
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(2,7,17,0.04),rgba(2,7,17,0.55))]" />
        </div>
      )}
      <div className="px-6 py-6 text-center">
        <p className="text-[11px] font-semibold tracking-[0.32em] text-[#7e9bb1] uppercase">
          Lead Form
        </p>
        <h1 className="mt-3 text-2xl font-bold text-white">{form.title}</h1>
        {form.description && (
          <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[#9ab8cc]">
            {form.description}
          </p>
        )}
      </div>
    </div>
  );
}
