export default function FormPageError({ error }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#020711]">
      <div className="text-center">
        <p className="mb-2 text-lg font-semibold text-white">Xatolik</p>
        <p className="text-sm text-[#9ab8cc]">{error}</p>
      </div>
    </div>
  );
}
