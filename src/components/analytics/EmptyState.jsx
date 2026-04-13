export default function EmptyState({ text }) {
  return (
    <div className="flex h-[280px] items-center justify-center rounded-[24px] border border-white/6 bg-white/[0.03] text-sm text-[color:var(--crm-muted)]">
      {text}
    </div>
  );
}
