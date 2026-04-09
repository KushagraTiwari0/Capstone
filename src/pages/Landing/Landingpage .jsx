import { Link } from "react-router-dom";
import { useEffect, useState } from "react";

const PARTICLES = ["🍃","🌿","🌱","🍀","🌸","✨","🦋","💚","🌼","⭐"];

function Particle({ style, emoji }) {
  return <div style={style} className="pointer-events-none select-none fixed">{emoji}</div>;
}

const LandingPage = () => {
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    const items = Array.from({ length: 18 }, (_, i) => ({
      id: i,
      emoji: PARTICLES[i % PARTICLES.length],
      style: {
        left: `${(i * 5.5) % 100}vw`,
        top: "-40px",
        fontSize: `${14 + (i % 4) * 6}px`,
        opacity: 0.5 + (i % 3) * 0.15,
        animation: `particle-fall ${7 + (i % 5) * 2}s linear ${(i % 4) * 1.2}s infinite`,
        zIndex: 0,
      }
    }));
    setParticles(items);
  }, []);

  return (
    <div className="min-h-screen overflow-hidden relative"
      style={{ background: "linear-gradient(160deg,#e8f5e9 0%,#f1f8f4 40%,#e0f2f1 100%)" }}>

      {/* Particles */}
      {particles.map(p => <Particle key={p.id} style={p.style} emoji={p.emoji} />)}

      {/* Decorative blobs */}
      <div className="absolute top-0 right-0 w-96 h-96 rounded-full opacity-20 pointer-events-none"
        style={{ background: "radial-gradient(circle,#66bb6a,transparent)", transform: "translate(30%,-30%)" }} />
      <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full opacity-15 pointer-events-none"
        style={{ background: "radial-gradient(circle,#26a69a,transparent)", transform: "translate(-30%,30%)" }} />
      <div className="absolute top-1/2 left-1/4 w-64 h-64 rounded-full opacity-10 pointer-events-none"
        style={{ background: "radial-gradient(circle,#81c784,transparent)" }} />

      {/* Navbar */}
      <nav className="relative z-10 flex items-center justify-between px-6 sm:px-12 py-5">
        <div className="flex items-center gap-2">
          <span className="text-3xl" style={{ animation: "hero-float 3s ease-in-out infinite", display: "inline-block" }}>🌿</span>
          <span className="text-xl font-bold" style={{
            fontFamily: "'Fredoka One', cursive",
            background: "linear-gradient(135deg,#2e7d32,#43a047)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent"
          }}>GEEP Platform</span>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/login"
            className="px-5 py-2 text-sm font-semibold text-primary-700 border-2 border-primary-300 rounded-full hover:bg-primary-50 transition-all">
            Login
          </Link>
          <Link to="/register"
            className="px-5 py-2 text-sm font-semibold text-white rounded-full transition-all hover:-translate-y-0.5"
            style={{ background: "linear-gradient(135deg,#43a047,#2e7d32)", boxShadow: "0 4px 15px rgba(67,160,71,0.4)" }}>
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative z-10 flex flex-col items-center text-center px-6 pt-12 pb-16 sm:pt-20">
        <div className="mb-4 inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold text-green-800 border border-green-200"
          style={{ background: "rgba(255,255,255,0.7)", backdropFilter: "blur(8px)" }}>
          🌍 Environmental Education for Kids
        </div>

        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold text-gray-800 mb-6 leading-tight"
          style={{ fontFamily: "'Fredoka One', cursive", maxWidth: "800px" }}>
          Learn. Play.{" "}
          <span style={{
            background: "linear-gradient(135deg,#43a047,#26a69a,#66bb6a)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent"
          }}>
            Save the Planet!
          </span>
        </h1>

        <p className="text-lg sm:text-xl text-gray-600 mb-10 max-w-2xl leading-relaxed">
          A gamified learning platform where students earn points, collect eco badges,
          and complete real-world environmental challenges.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-4 mb-16">
          <Link to="/register"
            className="px-8 py-4 text-lg font-bold text-white rounded-2xl transition-all hover:-translate-y-1 hover:shadow-xl"
            style={{
              fontFamily: "'Fredoka One', cursive",
              background: "linear-gradient(135deg,#43a047,#2e7d32)",
              boxShadow: "0 8px 24px rgba(67,160,71,0.45)"
            }}>
            🚀 Start Your Eco Journey
          </Link>
          <Link to="/login"
            className="px-8 py-4 text-lg font-semibold text-green-700 bg-white rounded-2xl border-2 border-green-200 hover:border-green-400 transition-all hover:-translate-y-1"
            style={{ boxShadow: "0 4px 16px rgba(0,0,0,0.08)" }}>
            Already a member? Login →
          </Link>
        </div>

        {/* Floating stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-2xl w-full mb-16">
          {[
            { icon: "🏆", label: "Badges to Earn",  value: "13+" },
            { icon: "📚", label: "Lessons",          value: "Dynamic" },
            { icon: "✅", label: "Eco Tasks",         value: "Real World" },
            { icon: "⭐", label: "Points System",     value: "XP Based" },
          ].map(({ icon, label, value }) => (
            <div key={label}
              className="rounded-2xl p-4 text-center transition-all hover:-translate-y-1"
              style={{ background: "rgba(255,255,255,0.75)", backdropFilter: "blur(8px)", border: "1px solid rgba(102,187,106,0.25)", boxShadow: "0 4px 16px rgba(46,125,50,0.1)" }}>
              <div className="text-3xl mb-1">{icon}</div>
              <div className="text-lg font-bold text-gray-800" style={{ fontFamily: "'Fredoka One', cursive" }}>{value}</div>
              <div className="text-xs text-gray-500 font-medium">{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="relative z-10 px-6 sm:px-12 pb-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-center text-gray-800 mb-10"
          style={{ fontFamily: "'Fredoka One', cursive" }}>
          Why Kids Love GEEP 🌱
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {[
            { icon: "🎮", title: "Gamified Learning",    desc: "Earn XP, level up from Beginner to Expert, and unlock achievements as you learn about the environment.", color: "#e8f5e9", border: "#a5d6a7" },
            { icon: "🏅", title: "Collect Eco Badges",   desc: "Complete lessons and tasks to unlock 13+ unique badges — from First Steps to Eco Legend.", color: "#fff8e1", border: "#ffe082" },
            { icon: "🌍", title: "Real-World Tasks",     desc: "Go beyond the screen! Plant trees, save water, and document your real eco-actions for points.", color: "#e0f7fa", border: "#80deea" },
            { icon: "📊", title: "Track Progress",       desc: "See your rank on the leaderboard, watch your progress bars fill up, and celebrate milestones.", color: "#f3e5f5", border: "#ce93d8" },
            { icon: "🧑‍🏫", title: "Teacher Guided",    desc: "Teachers assign class-specific lessons and tasks, then approve student submissions with feedback.", color: "#fff3e0", border: "#ffcc02" },
            { icon: "🔬", title: "Interactive Quizzes",  desc: "Test your eco knowledge with built-in quizzes after each lesson. Retry to improve your score!", color: "#fce4ec", border: "#f48fb1" },
          ].map(({ icon, title, desc, color, border }) => (
            <div key={title}
              className="rounded-2xl p-6 transition-all hover:-translate-y-2 hover:shadow-lg"
              style={{ background: color, border: `1.5px solid ${border}`, boxShadow: "0 2px 12px rgba(46,125,50,0.08)" }}>
              <div className="text-4xl mb-3">{icon}</div>
              <h3 className="text-lg font-bold text-gray-800 mb-2" style={{ fontFamily: "'Fredoka One', cursive" }}>{title}</h3>
              <p className="text-sm text-gray-600 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="relative z-10 px-6 sm:px-12 py-16"
        style={{ background: "rgba(255,255,255,0.5)", backdropFilter: "blur(4px)" }}>
        <h2 className="text-3xl sm:text-4xl font-bold text-center text-gray-800 mb-12"
          style={{ fontFamily: "'Fredoka One', cursive" }}>
          How It Works 🚀
        </h2>
        <div className="flex flex-col sm:flex-row items-start justify-center gap-8 max-w-4xl mx-auto">
          {[
            { step: "1", icon: "📝", title: "Register",      desc: "Sign up as a student, pick your class level, and wait for teacher approval." },
            { step: "2", icon: "📚", title: "Learn",          desc: "Read lessons, watch videos, and take quizzes to earn points and level up." },
            { step: "3", icon: "✅", title: "Complete Tasks", desc: "Do real eco tasks like planting trees, submit proof, and get teacher approval." },
            { step: "4", icon: "🏆", title: "Earn Badges",   desc: "Unlock badges automatically as you hit milestones — climb the leaderboard!" },
          ].map(({ step, icon, title, desc }) => (
            <div key={step} className="flex flex-col items-center text-center flex-1">
              <div className="w-14 h-14 rounded-full flex items-center justify-center text-white text-xl font-bold mb-4 shadow-lg"
                style={{ background: "linear-gradient(135deg,#43a047,#2e7d32)", fontFamily: "'Fredoka One', cursive" }}>
                {step}
              </div>
              <div className="text-3xl mb-2">{icon}</div>
              <h3 className="text-base font-bold text-gray-800 mb-1" style={{ fontFamily: "'Fredoka One', cursive" }}>{title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="relative z-10 px-6 sm:px-12 py-16 text-center">
        <div className="max-w-2xl mx-auto rounded-3xl p-10"
          style={{
            background: "linear-gradient(135deg,#2e7d32,#43a047,#26a69a)",
            boxShadow: "0 20px 60px rgba(46,125,50,0.35)"
          }}>
          <div className="text-5xl mb-4" style={{ animation: "hero-float 3s ease-in-out infinite", display: "inline-block" }}>🌍</div>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4" style={{ fontFamily: "'Fredoka One', cursive" }}>
            Ready to be an Eco Hero?
          </h2>
          <p className="text-green-100 mb-8 text-lg">
            Join students making a real difference — one lesson, one task, one badge at a time.
          </p>
          <Link to="/register"
            className="inline-block px-10 py-4 text-lg font-bold text-green-800 bg-white rounded-2xl hover:-translate-y-1 transition-all"
            style={{ fontFamily: "'Fredoka One', cursive", boxShadow: "0 8px 24px rgba(0,0,0,0.2)" }}>
            🌱 Join GEEP Today — It's Free!
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 text-center py-8 text-sm text-gray-400 border-t border-green-100">
        <div className="flex items-center justify-center gap-2 mb-2">
          <span>🌿</span>
          <span className="font-semibold text-gray-600" style={{ fontFamily: "'Fredoka One', cursive" }}>GEEP Platform</span>
        </div>
        <p>Gamified Environmental Education Platform · Built for eco-conscious classrooms</p>
      </footer>
    </div>
  );
};

export default LandingPage;