import { useState, useEffect, useRef } from "react";
const tokens = {
  colors: {
    bgPrimary: "var(--color-bg-primary)",
    bgCard: "var(--color-bg-card)",
    textPrimary: "var(--color-text-primary)",
    textSecondary: "var(--color-text-secondary)",
    textMuted: "var(--color-text-muted)",
    accentPrimary: "var(--color-accent-primary)",
    accentSuccess: "var(--color-accent-success)",
    borderSubtle: "var(--color-border-subtle)",
    borderAccent: "var(--color-border-accent)",
  },
  spacing: { xs: "4px", sm: "8px", md: "16px", lg: "32px", xl: "64px" },
  radius: { sm: "8px", card: "16px", lg: "24px", full: "9999px" },
  shadow: { card: "var(--shadow-card)", engine: "var(--shadow-engine)" },
};
const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800;900&family=JetBrains+Mono:wght@400;600;700&display=swap');
  :root {
    --color-bg-primary: #0a0a0f;
    --color-bg-card: rgba(255,255,255,0.04);
    --color-text-primary: #f0f0ff;
    --color-text-secondary: rgba(165,180,252,0.8);
    --color-text-muted: rgba(165,180,252,0.45);
    --color-accent-primary: #6366F1;
    --color-accent-success: #10B981;
    --color-border-subtle: rgba(255,255,255,0.07);
    --color-border-accent: rgba(99,102,241,0.3);
    --shadow-card: 0 4px 24px rgba(0,0,0,0.3),inset 0 1px 0 rgba(255,255,255,0.05);
    --shadow-engine: 0 0 60px rgba(99,102,241,0.35),0 20px 60px rgba(0,0,0,0.5);
    --font-display: 'Syne', sans-serif;
    --font-mono: 'JetBrains Mono', monospace;
  }
  *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
  html { scroll-behavior:smooth; }
  body { font-family:'Syne',sans-serif; background:#0a0a0f; color:#f0f0ff; -webkit-font-smoothing:antialiased; }
  :focus-visible { outline:2px solid #6366F1; outline-offset:3px; border-radius:4px; }
  @keyframes shimmer { 0%{left:-100%} 100%{left:200%} }
  @keyframes pulse-ring { 0%{transform:translate(-50%,-50%) scale(0.8);opacity:0.6} 100%{transform:translate(-50%,-50%) scale(1.5);opacity:0} }
  @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.3} }
  @keyframes skeleton-pulse { 0%,100%{opacity:0.4} 50%{opacity:0.9} }
  @keyframes float1 { 0%,100%{transform:translate(0,0) scale(1)} 33%{transform:translate(30px,-20px) scale(1.05)} 66%{transform:translate(-20px,15px) scale(0.95)} }
  @keyframes float2 { 0%,100%{transform:translate(0,0)} 50%{transform:translate(-20px,15px)} }
  @keyframes bounce { 0%,100%{transform:translateY(0);opacity:0.4} 50%{transform:translateY(8px);opacity:0.8} }
  @keyframes flow-dot { 0%{stroke-dashoffset:100} 100%{stroke-dashoffset:0} }
  @media (prefers-reduced-motion: reduce) {
    *,*::before,*::after { animation-duration:0.01ms!important; animation-iteration-count:1!important; transition-duration:0.01ms!important; }
  }
`;

// ─── HOOKS ───────────────────────────────────────────────────────────────────
function useIntersection(options = {}) {
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setIsVisible(true); observer.unobserve(el); } },
      { threshold: 0.1, ...options }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  return [ref, isVisible];
}

function useCloudData() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const cached = sessionStorage.getItem("cloud-resources");

    if (cached) {
      setData(JSON.parse(cached));
      setLoading(false);
      return;
    }

    async function fetchData() {
      try {
        const res = await fetch("https://dummyjson.com/products?limit=4");

        if (!res.ok) {
          throw new Error("API response not ok");
        }

        const json = await res.json();

        const mapped = json.products.slice(0,4).map((p, i) => ({
          id: p.id,
          key: ["CPU", "GPU", "RAM", "Network"][i],
          label: p.title,
          cost: `$${p.price}/hr`,
          efficiency: `${Math.round(p.rating * 20)}%`,
          effNum: Math.round(p.rating * 20),
          color: ["#3B82F6","#8B5CF6","#10B981","#F59E0B"][i],
        }));

        setData(mapped);
        sessionStorage.setItem("cloud-resources", JSON.stringify(mapped));
      } catch (err) {
        console.error("API ERROR:", err);
        setError("Failed to load cloud resource data");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  return { data, loading, error };
}
const PROVIDERS = [
  {
    name: "AWS", full: "Amazon Web Services", accent: "#FF9900",
    gradient: "linear-gradient(135deg,#FF990018,#FF990006)",
    border: "#FF990040",
    logo: (
      <svg viewBox="0 0 80 32" fill="none" style={{ width: 60, height: 24 }}>
        <path d="M22.9 13.6c0 .9.1 1.6.3 2.1.2.5.5.9.9 1.4.1.1.2.3.2.4 0 .2-.1.3-.4.5l-1.3.9c-.2.1-.3.2-.5.2-.2 0-.3-.1-.5-.2-.2-.2-.4-.5-.6-.7-.2-.3-.4-.6-.6-1-1.5 1.8-3.4 2.6-5.7 2.6-1.6 0-2.9-.5-3.8-1.4-.9-1-1.4-2.2-1.4-3.8 0-1.7.6-3 1.8-4 1.2-1 2.8-1.5 4.8-1.5.7 0 1.3.1 2 .2.7.1 1.4.3 2.2.5V9.8c0-1.5-.3-2.5-.9-3.1-.6-.6-1.6-.9-3.1-.9-.7 0-1.3.1-2 .3-.7.2-1.3.4-1.9.7-.3.1-.5.2-.6.3-.1.1-.2.1-.3.1-.3 0-.4-.2-.4-.6v-.9c0-.3.1-.5.2-.7.1-.2.3-.3.6-.5.7-.3 1.5-.6 2.4-.8 1-.2 2-.3 3.1-.3 2.3 0 4 .5 5.1 1.6 1.1 1.1 1.6 2.7 1.6 4.8v6.3h.3zm-7.9 3c.6 0 1.3-.1 2-.4.7-.3 1.3-.7 1.8-1.3.3-.4.5-.8.6-1.2.1-.4.2-.9.2-1.5v-.7c-.5-.1-1.1-.2-1.7-.3-.6-.1-1.2-.1-1.7-.1-1.2 0-2.1.2-2.7.7-.6.5-.9 1.2-.9 2.1 0 .9.2 1.5.7 2 .4.4 1 .7 1.7.7z" fill="#FF9900"/>
        <path d="M29.6 19.6c-.3 0-.5-.1-.7-.2-.2-.1-.3-.4-.4-.7L24 3.5c-.1-.3-.2-.6-.2-.8 0-.3.1-.5.4-.5h1.9c.3 0 .5.1.7.2.2.1.3.4.4.7l3.3 13 3-13c.1-.3.2-.5.4-.7.2-.2.4-.2.7-.2h1.5c.3 0 .5.1.7.2.2.1.3.4.4.7l3.1 13.2L43.4 3c.1-.3.2-.5.4-.7.2-.2.5-.2.7-.2h1.8c.3 0 .5.2.5.5 0 .1 0 .2-.1.4L41.9 19c-.1.3-.2.5-.4.7-.2.1-.5.2-.7.2h-1.6c-.3 0-.5-.1-.7-.2-.2-.1-.3-.4-.4-.7l-3-12.6-3 12.5c-.1.3-.2.5-.4.7-.2.2-.4.2-.7.2h-1.9z" fill="#FF9900"/>
        <path d="M51.7 20c-1 0-1.9-.1-2.8-.4-.9-.3-1.6-.6-2.1-.9-.3-.2-.5-.4-.6-.6-.1-.2-.1-.4-.1-.6v-1c0-.4.1-.6.4-.6.1 0 .2 0 .3.1.1.1.2.1.4.2.5.3 1.1.5 1.8.7.6.2 1.3.3 2 .3 1 0 1.8-.2 2.4-.5.6-.3.8-.8.8-1.4 0-.4-.1-.8-.4-1.1-.3-.3-.8-.5-1.6-.7l-2.4-.7c-1.2-.4-2.1-.9-2.6-1.7-.5-.7-.8-1.6-.8-2.5 0-.7.2-1.4.5-1.9.3-.5.7-1 1.3-1.4.5-.4 1.1-.6 1.8-.8.7-.2 1.4-.3 2.2-.3.4 0 .8 0 1.2.1.4.1.8.2 1.2.3.4.1.7.2 1 .3.3.1.5.3.7.4.2.1.3.3.4.5.1.2.1.4.1.6v.9c0 .4-.1.6-.4.6-.1 0-.3-.1-.6-.2-.9-.4-1.9-.6-3-.6-.9 0-1.6.1-2.1.4-.5.3-.8.7-.8 1.4 0 .4.1.8.5 1.1.3.3.9.5 1.8.8l2.3.7c1.2.4 2 .9 2.5 1.6.5.7.8 1.5.8 2.4 0 .7-.1 1.4-.4 2-.3.6-.7 1.1-1.3 1.5-.5.4-1.2.7-1.9.9-.9.2-1.8.3-2.7.3z" fill="#FF9900"/>
        <path d="M66 22.7c-7.3 5.4-17.9 8.2-27 8.2-12.8 0-24.3-4.7-33-12.5-.7-.6-.1-1.4.7-1 9.4 5.5 21 8.7 33 8.7 8.1 0 17-1.7 25.2-5.1 1.2-.6 2.3.8 1.1 1.7z" fill="#FF9900"/>
        <path d="M68.9 19.4c-.9-1.2-6.1-.6-8.5-.3-.7.1-.8-.5-.2-.9 4.2-2.9 11-2.1 11.8-1.1.8 1-.2 7.8-4.1 11-.6.5-1.2.2-1-.4.9-2.2 2.9-7.1 2-8.3z" fill="#FF9900"/>
      </svg>
    ),
  },
  {
    name: "Azure", full: "Microsoft Azure", accent: "#0089D6",
    gradient: "linear-gradient(135deg,#0089D618,#0089D606)",
    border: "#0089D640",
    logo: (
      <svg viewBox="0 0 56 44" fill="none" style={{ width: 44, height: 35 }}>
        <path d="M31 1.5L17.5 38.5l24.2-4.2L52 1.5H31z" fill="#0078D4"/>
        <path d="M21 1.5H5L1 43.5l17.5-7.5L21 1.5z" fill="#0078D4" opacity=".6"/>
        <path d="M17.5 38.5L41.7 34.3 52 44 17.5 38.5z" fill="#0078D4" opacity=".8"/>
      </svg>
    ),
  },
  {
    name: "GCP", full: "Google Cloud Platform", accent: "#4285F4",
    gradient: "linear-gradient(135deg,#4285F418,#4285F406)",
    border: "#4285F440",
    logo: (
      <svg viewBox="0 0 56 44" fill="none" style={{ width: 48, height: 38 }}>
        <path d="M35 12H36.2l3.4-3.4.2-1.5C33.1 2 25.2-.5 17.6 1.4 10 3.3 3.9 9.4 1.5 17.2c.2-.1.4-.1.7-.1.5 0 1.1.1 1.6.4l7-1.1s.4-.6.6-.6C14.4 12.6 19 11 23.5 11.4L35 12z" fill="#EA4335"/>
        <path d="M54.2 17.2c-1.1-4.1-3.5-7.7-6.8-10.2L40.7 13.8c1.7 1.4 2.7 3.4 2.7 5.6v.8c3 0 5.4 2.4 5.4 5.4s-2.4 5.4-5.4 5.4H27.8l-.8.8v7.7l.8.8H43.4c4.1 0 8-1.7 10.8-4.7 2.9-3 4.5-7 4.3-11.1-.1-2.4-.6-4.6-1.8-6.5l-2.5.8z" fill="#4285F4"/>
        <path d="M12.7 39.4h15.1v-9H12.7c-1.1 0-2.2-.3-3.2-.7l-3.3 1-3.4 3.4-.3.6C5.2 37.7 8.8 39.4 12.7 39.4z" fill="#34A853"/>
        <path d="M12.7 13.2C5.4 13.2 0 18.6 0 25.9c0 4.6 2.4 8.8 6 11.3l7.7-7.7c-2.7-1.1-4.5-3.8-4.5-6.9 0-4.1 3.3-7.4 7.4-7.4 3 0 5.6 1.8 6.8 4.5l7.7-7.7c-2.5-3-6.6-4.8-10.8-3.8l.4 5z" fill="#FBBC05"/>
      </svg>
    ),
  },
];
const RES_ICON = {
  CPU: (c) => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <rect x="6" y="6" width="12" height="12" rx="2" stroke={c} strokeWidth="1.5"/>
      <rect x="9" y="9" width="6" height="6" rx="1" fill={c} opacity=".5"/>
      {[9,12,15].map(x => <line key={x} x1={x} y1="3" x2={x} y2="6" stroke={c} strokeWidth="1.5"/>)}
      {[9,12,15].map(x => <line key={x} x1={x} y1="18" x2={x} y2="21" stroke={c} strokeWidth="1.5"/>)}
      {[9,12,15].map(y => <line key={y} x1="3" y1={y} x2="6" y2={y} stroke={c} strokeWidth="1.5"/>)}
      {[9,12,15].map(y => <line key={y} x1="18" y1={y} x2="21" y2={y} stroke={c} strokeWidth="1.5"/>)}
    </svg>
  ),
  GPU: (c) => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <rect x="2" y="6" width="18" height="12" rx="2" stroke={c} strokeWidth="1.5"/>
      <rect x="5" y="9" width="3" height="6" rx="1" fill={c} opacity=".6"/>
      <rect x="10" y="9" width="3" height="6" rx="1" fill={c} opacity=".6"/>
      {[9,12,15].map(y => <line key={y} x1="20" y1={y} x2="22" y2={y} stroke={c} strokeWidth="1.5"/>)}
      {[6,10,14].map(x => <line key={x} x1={x} y1="18" x2={x} y2="21" stroke={c} strokeWidth="1.5"/>)}
    </svg>
  ),
  RAM: (c) => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <rect x="2" y="8" width="20" height="8" rx="1.5" stroke={c} strokeWidth="1.5"/>
      {[5,9,13,17].map(x => <rect key={x} x={x} y="10" width="2" height="4" rx=".5" fill={c} opacity=".7"/>)}
      {[6,10,14,18].map(x => <line key={x} x1={x} y1="5" x2={x} y2="8" stroke={c} strokeWidth="1.5"/>)}
    </svg>
  ),
  Network: (c) => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="3" fill={c} opacity=".7"/>
      <circle cx="4" cy="6" r="2" stroke={c} strokeWidth="1.5"/>
      <circle cx="20" cy="6" r="2" stroke={c} strokeWidth="1.5"/>
      <circle cx="4" cy="18" r="2" stroke={c} strokeWidth="1.5"/>
      <circle cx="20" cy="18" r="2" stroke={c} strokeWidth="1.5"/>
      <line x1="6" y1="7" x2="9" y2="11" stroke={c} strokeWidth="1.2" opacity=".6"/>
      <line x1="18" y1="7" x2="15" y2="11" stroke={c} strokeWidth="1.2" opacity=".6"/>
      <line x1="6" y1="17" x2="9" y2="13" stroke={c} strokeWidth="1.2" opacity=".6"/>
      <line x1="18" y1="17" x2="15" y2="13" stroke={c} strokeWidth="1.2" opacity=".6"/>
    </svg>
  ),
};

function CloudProvider({ isVisible }) {
  return (
    <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
      {PROVIDERS.map((p, i) => (
        <div key={p.name} role="img" aria-label={p.full} style={{
          background: p.gradient,
          border: `1px solid ${p.border}`,
          borderRadius: tokens.radius.card,
          padding: "22px 26px",
          display: "flex", flexDirection: "column", alignItems: "center", gap: 10,
          minWidth: 150,
          boxShadow: tokens.shadow.card,
          position: "relative", overflow: "hidden",
          opacity: isVisible ? 1 : 0,
          transform: isVisible ? "translateY(0)" : "translateY(28px)",
          transition: `opacity 0.6s ease ${i * 0.15}s, transform 0.6s ease ${i * 0.15}s`,
        }}>
          <div style={{
            position: "absolute", top: 0, left: 0, right: 0, height: 2,
            background: `linear-gradient(90deg,transparent,${p.accent},transparent)`,
            opacity: isVisible ? 1 : 0,
            transition: `opacity 0.8s ease ${i * 0.15 + 0.4}s`,
          }} />
          {p.logo}
          <span style={{ fontSize: "0.82rem", fontWeight: 800, color: tokens.colors.textPrimary, letterSpacing: "0.06em", fontFamily: "var(--font-display)" }}>
            {p.name}
          </span>
          <span style={{ fontSize: "0.6rem", color: tokens.colors.textMuted, letterSpacing: "0.05em", textAlign: "center" }}>
            {p.full}
          </span>
        </div>
      ))}
    </div>
  );
}

function ConnectionLines({ isVisible, dir }) {
  const paths = dir === "down"
    ? [["M60,0 L200,60", "0.5s"], ["M200,0 L200,60", "0.65s"], ["M340,0 L200,60", "0.8s"]]
    : [["M200,0 L80,60", "1.0s"], ["M200,0 L200,60", "1.1s"], ["M200,0 L320,60", "1.2s"]];

  const gradColor = dir === "down" ? ["#6366F1", "#818CF8"] : ["#6366F1", "#10B981"];

  return (
    <div style={{ display: "flex", justifyContent: "center", height: 64, alignItems: "center" }}>
      <svg width="400" height="64" viewBox="0 0 400 64" fill="none" overflow="visible" aria-hidden="true">
        <defs>
          <linearGradient id={`lg-${dir}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={gradColor[0]} stopOpacity=".8"/>
            <stop offset="100%" stopColor={gradColor[1]} stopOpacity=".35"/>
          </linearGradient>
        </defs>
        {paths.map(([d, delay], i) => (
          <path key={i} d={d} stroke={`url(#lg-${dir})`} strokeWidth="1.5"
            strokeDasharray="6 4"
            style={{ opacity: isVisible ? 1 : 0, transition: `opacity 0.5s ease ${delay}` }}
          />
        ))}
        {isVisible && paths.map(([d, delay], i) => (
          <circle key={i} r="3" fill={dir === "down" ? "#818CF8" : "#34D399"}>
            <animateMotion dur="2.2s" repeatCount="indefinite" path={d} begin={delay}/>
          </circle>
        ))}
      </svg>
    </div>
  );
}

function OptimizationEngine({ isVisible }) {
  return (
    <div style={{ display: "flex", justifyContent: "center" }}>
      <div style={{
        background: "linear-gradient(135deg,#1e1b4b 0%,#312e81 50%,#1e1b4b 100%)",
        border: "1px solid rgba(99,102,241,0.5)",
        borderRadius: tokens.radius.lg,
        padding: "36px 48px", maxWidth: 460, width: "100%", textAlign: "center",
        position: "relative", overflow: "hidden",
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? "scale(1)" : "scale(0.9)",
        transition: "opacity 0.7s ease 0.7s, transform 0.7s cubic-bezier(0.34,1.56,0.64,1) 0.7s, box-shadow 0.7s ease 0.7s",
        boxShadow: isVisible ? "0 0 60px rgba(99,102,241,0.35),0 20px 60px rgba(0,0,0,0.5),inset 0 1px 0 rgba(255,255,255,0.1)" : "none",
      }} role="img" aria-label="Atomity Optimization Engine">
        <div style={{
          position: "absolute", top: 0, left: "-100%", width: "60%", height: "100%",
          background: "linear-gradient(90deg,transparent,rgba(255,255,255,0.04),transparent)",
          animation: isVisible ? "shimmer 3.5s ease 1.5s infinite" : "none",
        }} />
        <div style={{
          position: "absolute", top: "50%", left: "50%", width: 240, height: 240,
          borderRadius: "50%", border: "1px solid rgba(99,102,241,0.15)",
          transform: "translate(-50%,-50%)",
          animation: isVisible ? "pulse-ring 3s ease-out 1s infinite" : "none",
        }} />

        <div style={{
          width: 54, height: 54, background: "linear-gradient(135deg,#6366F1,#818CF8)",
          borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center",
          margin: "0 auto 14px", fontSize: 22,
          boxShadow: "0 8px 24px rgba(99,102,241,0.5)",
        }}>⚡</div>

        <div style={{
          display: "inline-flex", alignItems: "center", gap: 6,
          background: "rgba(99,102,241,0.15)", border: "1px solid rgba(99,102,241,0.35)",
          borderRadius: tokens.radius.full, padding: "4px 14px", marginBottom: 12,
        }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#34D399", boxShadow: "0 0 8px #34D399", animation: "blink 2s ease infinite", display: "inline-block" }} />
          <span style={{ fontSize: "0.62rem", letterSpacing: "0.12em", color: "#a5b4fc", fontFamily: "var(--font-mono)", fontWeight: 700 }}>ACTIVE</span>
        </div>

        <h3 style={{ fontSize: "clamp(1.05rem,2.5vw,1.35rem)", fontWeight: 900, color: "#f0f0ff", margin: "0 0 10px", letterSpacing: "-0.02em", fontFamily: "var(--font-display)" }}>
          Atomity Optimization Engine
        </h3>
        <p style={{ fontSize: "clamp(0.78rem,1.5vw,0.9rem)", color: "rgba(165,180,252,0.75)", lineHeight: 1.65, margin: 0 }}>
          Automatically balances workloads and resources across cloud providers.
        </p>

        <div style={{ display: "flex", gap: 1, marginTop: 22, borderTop: "1px solid rgba(99,102,241,0.18)", paddingTop: 18 }}>
          {[["3","Providers"],["99.9%","Uptime"],["<12ms","Latency"]].map(([val, lbl], i) => (
            <div key={lbl} style={{ flex: 1, textAlign: "center", borderRight: i < 2 ? "1px solid rgba(99,102,241,0.18)" : "none", padding: "0 6px" }}>
              <div style={{ fontSize: "1rem", fontWeight: 800, color: "#e0e7ff", fontFamily: "var(--font-mono)" }}>{val}</div>
              <div style={{ fontSize: "0.6rem", color: "rgba(165,180,252,0.55)", letterSpacing: "0.08em", marginTop: 2 }}>{lbl}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ResourceIcons({ isVisible }) {
  const { data, loading, error } = useCloudData();

  if (error) return (
    <div style={{ textAlign: "center", color: "#F87171", padding: 28, background: "rgba(239,68,68,0.08)", borderRadius: tokens.radius.card, border: "1px solid rgba(239,68,68,0.2)" }}>
      <div style={{ fontSize: 22, marginBottom: 8 }}>⚠️</div>
      <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.82rem" }}>{error}</div>
    </div>
  );

  if (loading) return (
    <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
      {[0,1,2,3].map(i => (
        <div key={i} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: tokens.radius.card, padding: "22px 18px", minWidth: 150, flex: 1, maxWidth: 190, animation: `skeleton-pulse 1.5s ease ${i*0.2}s infinite` }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: "rgba(255,255,255,0.06)", marginBottom: 12 }} />
          <div style={{ width: "70%", height: 10, borderRadius: 5, background: "rgba(255,255,255,0.06)", marginBottom: 8 }} />
          <div style={{ width: "50%", height: 9, borderRadius: 5, background: "rgba(255,255,255,0.04)" }} />
        </div>
      ))}
    </div>
  );

  return (
    <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
      {(data || []).map((r, i) => {
        const Icon = RES_ICON[r.key] || RES_ICON.CPU;
        return (
          <div key={r.id} style={{
            background: `linear-gradient(135deg,${r.color}14,${r.color}06)`,
            border: `1px solid ${r.color}30`,
            borderRadius: tokens.radius.card,
            padding: "22px 18px", minWidth: 150, flex: 1, maxWidth: 195,
            position: "relative", overflow: "hidden",
            opacity: isVisible ? 1 : 0,
            transform: isVisible ? "translateY(0)" : "translateY(20px)",
            transition: `opacity 0.5s ease ${1.2 + i * 0.13}s, transform 0.5s ease ${1.2 + i * 0.13}s`,
          }}>
            <div style={{ position: "absolute", bottom: -20, right: -20, width: 80, height: 80, borderRadius: "50%", background: `${r.color}12` }} />
            <div style={{ width: 42, height: 42, background: `${r.color}20`, border: `1px solid ${r.color}40`, borderRadius: 11, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 12 }}>
              {Icon(r.color)}
            </div>
            <div style={{ fontSize: "0.6rem", letterSpacing: "0.13em", color: r.color, fontFamily: "var(--font-mono)", fontWeight: 700, marginBottom: 4 }}>
              {r.key}
            </div>
            <div style={{ fontSize: "0.82rem", fontWeight: 700, color: tokens.colors.textPrimary, marginBottom: 12, lineHeight: 1.3, fontFamily: "var(--font-display)" }}>
              {r.label}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              {[["Cost", r.cost, tokens.colors.textSecondary], ["Efficiency", r.efficiency, r.color]].map(([lbl, val, col]) => (
                <div key={lbl} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: "0.6rem", color: tokens.colors.textMuted }}>{lbl}</span>
                  <span style={{ fontSize: "0.68rem", fontWeight: 700, color: col, fontFamily: "var(--font-mono)" }}>{val}</span>
                </div>
              ))}
              <div style={{ marginTop: 6, height: 3, background: "rgba(255,255,255,0.07)", borderRadius: 2, overflow: "hidden" }}>
                <div style={{ height: "100%", width: isVisible ? `${r.effNum}%` : "0%", background: `linear-gradient(90deg,${r.color}70,${r.color})`, borderRadius: 2, transition: `width 1s ease ${1.4 + i * 0.13}s` }} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function CloudSection() {
  const [ref, isVisible] = useIntersection({ threshold: 0.08 });
  return (
    <section ref={ref} aria-labelledby="cloud-title" style={{
      padding: "clamp(60px,8vw,120px) clamp(20px,5vw,80px)",
      background: tokens.colors.bgPrimary, position: "relative", overflow: "hidden",
    }}>
      <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(99,102,241,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(99,102,241,0.04) 1px,transparent 1px)", backgroundSize: "48px 48px", pointerEvents: "none" }} aria-hidden="true" />
      <div style={{ position: "absolute", top: 0, left: "50%", width: 700, height: 400, transform: "translate(-50%,-50%)", background: "radial-gradient(ellipse,rgba(99,102,241,0.09) 0%,transparent 70%)", pointerEvents: "none" }} aria-hidden="true" />

      <div style={{ maxWidth: 900, marginInline: "auto", position: "relative" }}>
        <header style={{ textAlign: "center", marginBottom: "clamp(40px,6vw,72px)" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.25)", borderRadius: tokens.radius.full, padding: "6px 16px", marginBottom: 18, opacity: isVisible ? 1 : 0, transition: "opacity 0.6s ease 0s" }}>
            <span style={{ fontSize: "0.62rem", letterSpacing: "0.15em", color: "#818CF8", fontFamily: "var(--font-mono)", fontWeight: 700 }}>MULTI-CLOUD INTELLIGENCE</span>
          </div>
          <h2 id="cloud-title" style={{
            fontSize: "clamp(1.8rem,4.5vw,3rem)", fontWeight: 900, color: tokens.colors.textPrimary,
            margin: "0 0 14px", letterSpacing: "-0.04em", lineHeight: 1.1, fontFamily: "var(--font-display)",
            opacity: isVisible ? 1 : 0, transform: isVisible ? "translateY(0)" : "translateY(16px)",
            transition: "opacity 0.6s ease 0.1s, transform 0.6s ease 0.1s",
          }}>
            Optimize Infrastructure<br/>
            <span style={{ background: "linear-gradient(135deg,#6366F1,#818CF8,#A78BFA)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
              Across All Clouds
            </span>
          </h2>
          <p style={{
            fontSize: "clamp(0.88rem,1.8vw,1.08rem)", color: tokens.colors.textSecondary,
            maxWidth: 500, marginInline: "auto", lineHeight: 1.7,
            opacity: isVisible ? 1 : 0, transform: isVisible ? "translateY(0)" : "translateY(12px)",
            transition: "opacity 0.6s ease 0.2s, transform 0.6s ease 0.2s",
          }}>
            Connect AWS, Azure, and Google Cloud into one intelligent optimization engine.
          </p>
        </header>

        <CloudProvider isVisible={isVisible} />
        <ConnectionLines isVisible={isVisible} dir="down" />
        <OptimizationEngine isVisible={isVisible} />
        <ConnectionLines isVisible={isVisible} dir="up" />
        <ResourceIcons isVisible={isVisible} />
      </div>
    </section>
  );
}

function HeroSection() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(180deg,#06060e 0%,#0a0a0f 100%)",
        textAlign: "center",
        padding: "40px 24px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          width: 500,
          height: 500,
          borderRadius: "50%",
          background:
            "radial-gradient(circle,rgba(99,102,241,0.12) 0%,transparent 70%)",
          top: "15%",
          left: "15%",
          animation: "float1 8s ease-in-out infinite",
        }}
        aria-hidden="true"
      />

      <div
        style={{
          position: "absolute",
          width: 350,
          height: 350,
          borderRadius: "50%",
          background:
            "radial-gradient(circle,rgba(16,185,129,0.07) 0%,transparent 70%)",
          bottom: "15%",
          right: "15%",
          animation: "float2 10s ease-in-out infinite",
        }}
        aria-hidden="true"
      />
      <div
        style={{
          width: "100%",
          maxWidth: "1000px",
          margin: "0 auto",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
        }}
      >
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            background: "rgba(99,102,241,0.1)",
            border: "1px solid rgba(99,102,241,0.25)",
            borderRadius: "9999px",
            padding: "6px 18px",
            marginBottom: 26,
          }}
        >
          <span
            style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: "#34D399",
              boxShadow: "0 0 8px #34D399",
              animation: "blink 2s ease infinite",
              display: "inline-block",
            }}
          />
          <span
            style={{
              fontSize: "0.68rem",
              letterSpacing: "0.15em",
              color: "#818CF8",
              fontFamily: "var(--font-mono)",
              fontWeight: 700,
            }}
          >
            NOW IN BETA — 2,400+ TEAMS
          </span>
        </div>

        <h1
          style={{
            fontSize: "clamp(2.4rem,7vw,5rem)",
            fontWeight: 900,
            color: "#f0f0ff",
            margin: "0 0 18px",
            letterSpacing: "-0.05em",
            lineHeight: 1.05,
            fontFamily: "var(--font-display)",
          }}
        >
          The Cloud OS
          <br />
          <span
            style={{
              background:
                "linear-gradient(135deg,#6366F1 0%,#818CF8 50%,#A78BFA 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            Built for Scale
          </span>
        </h1>

        <p
          style={{
            fontSize: "clamp(0.95rem,2vw,1.15rem)",
            color: "rgba(165,180,252,0.65)",
            maxWidth: 480,
            lineHeight: 1.7,
            marginBottom: 38,
          }}
        >
          One platform to manage, optimize, and orchestrate your entire cloud
          infrastructure.
        </p>

        <div
          style={{
            display: "flex",
            gap: 12,
            justifyContent: "center",
            flexWrap: "wrap",
          }}
        >
          <button
            style={{
              background:
                "linear-gradient(135deg,#6366F1,#818CF8)",
              color: "#fff",
              border: "none",
              borderRadius: "9999px",
              padding: "13px 30px",
              fontSize: "0.88rem",
              fontWeight: 700,
              cursor: "pointer",
              letterSpacing: "0.02em",
              fontFamily: "var(--font-display)",
              boxShadow: "0 8px 32px rgba(99,102,241,0.4)",
            }}
          >
            Start Free Trial
          </button>

          <button
            style={{
              background: "rgba(255,255,255,0.05)",
              color: "#e0e7ff",
              border: "1px solid rgba(255,255,255,0.12)",
              borderRadius: "9999px",
              padding: "13px 30px",
              fontSize: "0.88rem",
              fontWeight: 700,
              cursor: "pointer",
              letterSpacing: "0.02em",
              fontFamily: "var(--font-display)",
            }}
          >
            View Demo
          </button>
        </div>

        <p
          style={{
            marginTop: 48,
            fontSize: "0.78rem",
            color: "rgba(165,180,252,0.38)",
            letterSpacing: "0.06em",
            animation: "bounce 2.2s ease infinite",
          }}
        >
          ↓ scroll to explore
        </p>
      </div>
    </div>
  );
}
export default function App() {
  return (
    <>
      <style>{GLOBAL_CSS}</style>
      <main>
        <HeroSection />
        <CloudSection />
        <footer style={{ background: "#06060e", padding: "36px 24px", textAlign: "center", borderTop: "1px solid rgba(99,102,241,0.1)" }}>
          <p style={{ color: "rgba(165,180,252,0.28)", fontSize: "0.7rem", letterSpacing: "0.12em", fontFamily: "var(--font-mono)" }}>
            © 2026 ATOMITY — MULTI-CLOUD INTELLIGENCE PLATFORM
          </p>
        </footer>
      </main>
    </>
  );
}
