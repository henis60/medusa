import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pagină negăsită — The Hunter House",
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        gap: 16,
        minHeight: "100dvh",
        padding: "0 24px",
        background: "var(--dark)",
      }}
    >
      <h1
        style={{
          fontFamily: "var(--pd)",
          fontSize: 32,
          fontWeight: 400,
          lineHeight: 1,
          color: "var(--ivory)",
          margin: 0,
        }}
      >
        Pagină negăsită
      </h1>
      <p
        style={{
          fontFamily: "var(--rl)",
          fontSize: 14,
          lineHeight: 1.6,
          color: "rgba(245,240,232,0.6)",
          maxWidth: "24rem",
          margin: 0,
        }}
      >
        Se pare că te-ai rătăcit. Pagina căutată nu mai există sau și-a
        schimbat locul.
      </p>
      <a
        href="/"
        className="thm-btn-outline"
        style={{
          marginTop: 8,
          padding: "12px 24px",
          border: "1px solid var(--gold)",
          fontFamily: "var(--rl)",
          fontSize: 10,
          letterSpacing: "4px",
          textTransform: "uppercase",
          color: "var(--gold)",
          textDecoration: "none",
          transition: "background .3s, color .3s",
        }}
      >
        Înapoi la pagina principală
      </a>
    </div>
  );
}
