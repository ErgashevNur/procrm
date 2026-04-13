export default function LoginInfoGrid() {
  return (
    <div className="grid gap-3 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4 sm:grid-cols-2">
      <div>
        <p className="mb-1.5 text-[10px] font-semibold tracking-[0.2em] text-white/25 uppercase">
          Xavfsizlik
        </p>
        <p className="text-xs leading-5 text-white/35">
          Sessiya rol va token asosida saqlanadi.
        </p>
      </div>
      <div>
        <p className="mb-1.5 text-[10px] font-semibold tracking-[0.2em] text-white/25 uppercase">
          Yo&apos;naltirish
        </p>
        <p className="text-xs leading-5 text-white/35">
          Kirgandan keyin loyiha avtomatik tanlanadi.
        </p>
      </div>
    </div>
  );
}
