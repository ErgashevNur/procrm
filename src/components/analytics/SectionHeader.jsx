export default function SectionHeader({ kicker, title, description }) {
  return (
    <div className="mb-5">
      <p className="crm-kicker">{kicker}</p>
      <h2 className="mt-2 text-xl font-semibold tracking-[-0.03em] text-white">
        {title}
      </h2>
      {description ? (
        <p className="mt-1.5 text-sm text-[color:var(--crm-muted)]">
          {description}
        </p>
      ) : null}
    </div>
  );
}
