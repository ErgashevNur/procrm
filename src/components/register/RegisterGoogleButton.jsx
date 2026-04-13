export default function RegisterGoogleButton({
  handleGoogleLogin,
  googleLoading,
  submitting,
}) {
  return (
    <button
      type="button"
      onClick={handleGoogleLogin}
      disabled={googleLoading || submitting}
      style={{
        height: 44,
        borderRadius: 12,
        border: "1px solid rgba(255,255,255,.08)",
        background: "#111927",
        color: "#fff",
        fontSize: 14,
        fontWeight: 600,
        cursor: googleLoading || submitting ? "not-allowed" : "pointer",
        opacity: googleLoading || submitting ? 0.7 : 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 10,
      }}
    >
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          width: 22,
          height: 22,
          borderRadius: 999,
          background: "#fff",
          border: "1px solid rgba(255,255,255,.12)",
          boxShadow: "0 2px 10px rgba(0,0,0,.18)",
        }}
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path
            d="M21.805 12.23c0-.79-.069-1.546-.198-2.272H12v4.302h5.498a4.701 4.701 0 0 1-2.04 3.084v2.56h3.305c1.935-1.782 3.042-4.408 3.042-7.674Z"
            fill="#4285F4"
          />
          <path
            d="M12 22c2.754 0 5.062-.913 6.75-2.477l-3.305-2.56c-.913.613-2.08.975-3.445.975-2.648 0-4.89-1.787-5.693-4.19H2.89v2.64A9.998 9.998 0 0 0 12 22Z"
            fill="#34A853"
          />
          <path
            d="M6.307 13.748A5.996 5.996 0 0 1 5.988 12c0-.607.11-1.196.319-1.748v-2.64H2.89A9.998 9.998 0 0 0 2 12c0 1.61.385 3.13 1.069 4.388l3.238-2.64Z"
            fill="#FBBC05"
          />
          <path
            d="M12 6.062c1.496 0 2.84.515 3.898 1.527l2.924-2.924C17.058 3.026 14.75 2 12 2A9.998 9.998 0 0 0 2.89 7.612l3.417 2.64c.803-2.403 3.045-4.19 5.693-4.19Z"
            fill="#EA4335"
          />
        </svg>
      </span>
      {googleLoading ? "Google ochilmoqda..." : "Google bilan kirish"}
    </button>
  );
}
