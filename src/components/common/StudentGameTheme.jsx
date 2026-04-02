import { useEffect, useRef, useState } from "react";
import { useUser } from "../../context/UserContext";

// ── Floating particle (leaf / bubble / star) ─────────────────────────────────
const PARTICLES = ["🍃", "🌿", "✨", "🌱", "⭐", "🦋", "🌸", "💚", "🍀", "🌼"];

function FloatingParticle({ id, onDone }) {
  const style = {
    position: "fixed",
    left: `${Math.random() * 100}vw`,
    top: "-60px",
    fontSize: `${14 + Math.random() * 18}px`,
    opacity: 0.7 + Math.random() * 0.3,
    animation: `particle-fall ${6 + Math.random() * 8}s linear forwards`,
    animationDelay: `${Math.random() * 2}s`,
    pointerEvents: "none",
    zIndex: 0,
    userSelect: "none",
  };
  useEffect(() => {
    const t = setTimeout(onDone, (parseFloat(style.animationDelay) + parseFloat(style.animation)) * 1000 + 200);
    return () => clearTimeout(t);
  }, []);
  return <div style={style}>{PARTICLES[Math.floor(Math.random() * PARTICLES.length)]}</div>;
}

// ── Cursor sparkles on click ─────────────────────────────────────────────────
function CursorSparkle({ x, y, id, onDone }) {
  const emojis = ["✨", "⭐", "💚", "🌟", "🍀"];
  const count = 5;
  useEffect(() => {
    const t = setTimeout(onDone, 900);
    return () => clearTimeout(t);
  }, []);
  return (
    <>
      {Array.from({ length: count }).map((_, i) => {
        const angle = (i / count) * 360;
        const dist  = 28 + Math.random() * 20;
        return (
          <div
            key={i}
            style={{
              position: "fixed",
              left: x,
              top: y,
              fontSize: "14px",
              pointerEvents: "none",
              zIndex: 9999,
              transform: "translate(-50%,-50%)",
              animation: `sparkle-out 0.8s ease-out forwards`,
              "--dx": `${Math.cos((angle * Math.PI) / 180) * dist}px`,
              "--dy": `${Math.sin((angle * Math.PI) / 180) * dist}px`,
            }}
          >
            {emojis[i % emojis.length]}
          </div>
        );
      })}
    </>
  );
}

// ── XP popup when points change ───────────────────────────────────────────────
function XPPopup({ value, onDone }) {
  useEffect(() => {
    const t = setTimeout(onDone, 1800);
    return () => clearTimeout(t);
  }, []);
  return (
    <div style={{
      position: "fixed", top: "80px", right: "24px",
      background: "linear-gradient(135deg,#43A047,#1B5E20)",
      color: "#fff", borderRadius: "16px", padding: "10px 20px",
      fontFamily: "'Fredoka One', cursive", fontSize: "20px",
      boxShadow: "0 8px 24px rgba(46,125,50,0.4)",
      zIndex: 9998, animation: "xp-rise 1.8s ease-out forwards",
      pointerEvents: "none",
    }}>
      +{value} ⭐ XP!
    </div>
  );
}

// ── Streak badge ──────────────────────────────────────────────────────────────
function StreakBadge({ streak }) {
  if (!streak || streak < 2) return null;
  return (
    <div style={{
      position: "fixed", bottom: "24px", left: "50%",
      transform: "translateX(-50%)",
      background: "linear-gradient(135deg,#FF6F00,#FF8F00)",
      color: "#fff", borderRadius: "999px", padding: "8px 20px",
      fontFamily: "'Fredoka One', cursive", fontSize: "15px",
      boxShadow: "0 4px 16px rgba(255,111,0,0.4)",
      zIndex: 9997, display: "flex", alignItems: "center", gap: "6px",
      animation: "fade-in-up 0.5s ease-out",
      pointerEvents: "none",
    }}>
      🔥 {streak} day streak!
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
let particleCounter = 0;
let sparkleCounter  = 0;

export default function StudentGameTheme() {
  const { user, points } = useUser();
  const prevPoints = useRef(points);

  const [particles, setParticles]   = useState([]);
  const [sparkles,  setSparkles]    = useState([]);
  const [xpPopups,  setXpPopups]    = useState([]);
  const [cursorPos, setCursorPos]   = useState({ x: -100, y: -100 });
  const [cursorTrail, setCursorTrail] = useState([]);
  const trailRef = useRef([]);

  // Only render for students
  if (!user || user.role !== "student") return null;

  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(() => {
    // Spawn particles on interval
    const spawn = () => {
      const id = ++particleCounter;
      setParticles(p => [...p.slice(-12), { id }]);
    };
    spawn();
    const iv = setInterval(spawn, 2200);
    return () => clearInterval(iv);
  }, []);

  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(() => {
    if (points !== prevPoints.current && prevPoints.current !== undefined) {
      const diff = points - prevPoints.current;
      if (diff > 0) {
        const id = Date.now();
        setXpPopups(p => [...p, { id, value: diff }]);
      }
    }
    prevPoints.current = points;
  }, [points]);

  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(() => {
    const onMove = (e) => {
      const pos = { x: e.clientX, y: e.clientY };
      setCursorPos(pos);
      const now = Date.now();
      trailRef.current = [...trailRef.current, { ...pos, t: now }].slice(-8);
      setCursorTrail([...trailRef.current]);
    };
    const onClick = (e) => {
      const id = ++sparkleCounter;
      setSparkles(s => [...s, { id, x: e.clientX, y: e.clientY }]);
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("click", onClick);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("click", onClick);
    };
  }, []);

  return (
    <>
      {/* ── Injected keyframes ── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fredoka+One&family=Nunito:wght@400;600;700;800&display=swap');

        body.student-theme {
          cursor: none !important;
        }
        body.student-theme * {
          cursor: none !important;
        }

        @keyframes particle-fall {
          0%   { transform: translateY(0)    rotate(0deg)   scale(1);   opacity: 0.8; }
          20%  { opacity: 1; }
          80%  { opacity: 0.6; }
          100% { transform: translateY(105vh) rotate(540deg) scale(0.5); opacity: 0; }
        }
        @keyframes sparkle-out {
          0%   { transform: translate(-50%,-50%) translate(0,0) scale(1);   opacity: 1; }
          100% { transform: translate(-50%,-50%) translate(var(--dx),var(--dy)) scale(0); opacity: 0; }
        }
        @keyframes xp-rise {
          0%   { transform: translateY(0)    scale(0.8); opacity: 0; }
          15%  { transform: translateY(-4px) scale(1.1); opacity: 1; }
          70%  { transform: translateY(-12px) scale(1);  opacity: 1; }
          100% { transform: translateY(-30px) scale(0.9); opacity: 0; }
        }
        @keyframes fade-in-up {
          from { transform: translateX(-50%) translateY(20px); opacity: 0; }
          to   { transform: translateX(-50%) translateY(0);    opacity: 1; }
        }
        @keyframes cursor-pulse {
          0%,100% { transform: scale(1);   opacity: 1; }
          50%      { transform: scale(1.3); opacity: 0.7; }
        }
        @keyframes trail-fade {
          from { opacity: 0.5; transform: scale(1); }
          to   { opacity: 0;   transform: scale(0.3); }
        }

        /* Gamified card hover for student pages */
        body.student-theme .environment-card:hover {
          transform: translateY(-6px) scale(1.02);
          box-shadow: 0 16px 40px rgba(46,125,50,0.25), 0 0 0 2px #66BB6A;
        }

        /* Bouncy buttons */
        body.student-theme button:active,
        body.student-theme a:active {
          transform: scale(0.95);
        }

        /* Fredoka headings for student pages */
        body.student-theme h1,
        body.student-theme h2 {
          font-family: 'Fredoka One', cursive;
          letter-spacing: 0.02em;
        }

        /* Animated background for student pages */
        body.student-theme .animated-bg {
          background-image:
            radial-gradient(ellipse at 15% 30%, rgba(102,187,106,0.15) 0%, transparent 55%),
            radial-gradient(ellipse at 85% 70%, rgba(67,160,71,0.12) 0%, transparent 55%),
            radial-gradient(ellipse at 50% 10%, rgba(79,195,247,0.08) 0%, transparent 45%),
            url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%232E7D32' fill-opacity='0.04'%3E%3Cpath d='M40 0C18 0 0 18 0 40s18 40 40 40 40-18 40-40S62 0 40 0zm0 8c3 0 6 3 6 6s-3 6-6 6-6-3-6-6 3-6 6-6z'/%3E%3C/g%3E%3C/svg%3E");
          background-attachment: fixed;
        }

        /* Pill XP counter in sidebar */
        body.student-theme .xp-pill {
          background: linear-gradient(135deg, #FF8F00, #FF6F00);
          box-shadow: 0 4px 12px rgba(255,111,0,0.35);
          animation: cursor-pulse 2.5s ease-in-out infinite;
        }

        /* Progress bars → rainbow on student theme */
        body.student-theme .bg-primary-600 {
          background: linear-gradient(90deg, #66BB6A, #43A047, #26A69A) !important;
          background-size: 200% 100% !important;
          animation: shimmer 2.5s linear infinite !important;
        }
      `}</style>

      {/* ── Apply class to body ── */}
      {(() => {
        document.body.classList.add("student-theme");
        return null;
      })()}

      {/* ── Floating background particles ── */}
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0, overflow: "hidden" }}>
        {particles.map(p => (
          <FloatingParticle key={p.id} id={p.id} onDone={() =>
            setParticles(prev => prev.filter(x => x.id !== p.id))
          } />
        ))}
      </div>

      {/* ── Custom cursor dot ── */}
      <div style={{
        position: "fixed",
        left: cursorPos.x, top: cursorPos.y,
        width: 18, height: 18,
        background: "radial-gradient(circle,#A5D6A7,#43A047)",
        borderRadius: "50%",
        transform: "translate(-50%,-50%)",
        pointerEvents: "none", zIndex: 9999,
        boxShadow: "0 0 8px rgba(67,160,71,0.6)",
        animation: "cursor-pulse 1.5s ease-in-out infinite",
        transition: "left 0.05s, top 0.05s",
      }} />

      {/* ── Cursor emoji follower ── */}
      <div style={{
        position: "fixed",
        left: cursorPos.x + 10, top: cursorPos.y - 18,
        fontSize: "14px",
        pointerEvents: "none", zIndex: 9998,
        transition: "left 0.08s, top 0.08s",
        userSelect: "none",
      }}>🌿</div>

      {/* ── Cursor trail ── */}
      {cursorTrail.map((t, i) => (
        <div key={i} style={{
          position: "fixed",
          left: t.x, top: t.y,
          width: 6 + i, height: 6 + i,
          borderRadius: "50%",
          background: `rgba(102,187,106,${0.06 * i})`,
          transform: "translate(-50%,-50%)",
          pointerEvents: "none", zIndex: 9995,
          animation: "trail-fade 0.4s ease-out forwards",
        }} />
      ))}

      {/* ── Click sparkles ── */}
      {sparkles.map(s => (
        <CursorSparkle key={s.id} x={s.x} y={s.y} id={s.id}
          onDone={() => setSparkles(prev => prev.filter(x => x.id !== s.id))}
        />
      ))}

      {/* ── XP popups ── */}
      {xpPopups.map(p => (
        <XPPopup key={p.id} value={p.value}
          onDone={() => setXpPopups(prev => prev.filter(x => x.id !== p.id))}
        />
      ))}

      {/* ── Streak badge (hardcoded 3 for demo; hook to real data if available) ── */}
      {/* <StreakBadge streak={3} /> */}

      {/* ── Corner nature deco (bottom-right) ── */}
      <div style={{
        position: "fixed", bottom: 0, right: 0,
        fontSize: "clamp(60px,8vw,110px)",
        opacity: 0.07, pointerEvents: "none", zIndex: 0,
        lineHeight: 1, userSelect: "none",
        filter: "saturate(0.8)",
      }}>🌳</div>
      <div style={{
        position: "fixed", bottom: 0, left: 0,
        fontSize: "clamp(50px,6vw,90px)",
        opacity: 0.07, pointerEvents: "none", zIndex: 0,
        lineHeight: 1, userSelect: "none",
      }}>🌿</div>
    </>
  );
}