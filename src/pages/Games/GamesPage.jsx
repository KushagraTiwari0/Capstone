import { useState, useEffect } from "react";
import { useUser } from "../../context/UserContext";
import Sidebar from "../../components/common/Sidebar";
import RecycleSorter  from "./games/RecycleSorter";
import EcoPuzzle      from "./games/EcoPuzzle";
import WaterSaver     from "./games/WaterSaver";
import EcoMatchPairs  from "./games/EcoMatchPairs";

const GAMES = [
  { id: "recycle", title: "Recycle Sorter", desc: "Drag & drop waste into the correct recycling bin before time runs out!", icon: "♻️", color: "from-green-400 to-emerald-600", tag: "Drag & Drop", difficulty: "Easy", component: RecycleSorter },
  { id: "puzzle", title: "Eco Sliding Puzzle", desc: "Slide eco-themed tiles to solve the puzzle and reveal the picture!", icon: "🧩", color: "from-blue-400 to-indigo-500", tag: "Puzzle", difficulty: "Hard", component: EcoPuzzle },
  { id: "water", title: "Water Pipe Puzzle", desc: "Rotate pipes to connect the water source to the thirsty plant!", icon: "💧", color: "from-sky-400 to-blue-600", tag: "Logic", difficulty: "Medium", component: WaterSaver },
  { id: "match", title: "Eco Memory Match", desc: "Flip cards to find matching eco pairs. Train your memory and learn!", icon: "🌿", color: "from-teal-400 to-green-600", tag: "Memory", difficulty: "Easy", component: EcoMatchPairs },
];

const DIFF_COLOR = {
  Easy: "bg-green-100 text-green-700",
  Medium: "bg-yellow-100 text-yellow-700",
  Hard: "bg-red-100 text-red-700",
};

export default function GamesPage() {
  const { loadUserProgress } = useUser();
  const [active, setActive]   = useState(null);
  const [scores, setScores]   = useState({});
  const [stats, setStats]     = useState({}); 
  const [postGame, setPostGame] = useState(null); // 🌟 THIS CONTROLS THE UI BLOCK 🌟
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchScores = async () => {
      try {
        const token = localStorage.getItem('geep_token');
        if (!token) {
          setLoading(false);
          return;
        }

        const res = await fetch('/api/games/stats', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (!res.ok) throw new Error(`HTTP Error`);
        
        const json = await res.json();
        
        if (json.success) {
          setStats(json.data.stats || {}); 
          const loadedScores = {};
          Object.keys(json.data.stats).forEach(gameId => {
            loadedScores[gameId] = json.data.stats[gameId].bestScore || 0;
          });
          setScores(loadedScores);
        }
      } catch (error) {
        console.error("Failed to load scores");
      } finally {
        setLoading(false);
      }
    };
    fetchScores();
  }, []);

  const handleScore = async (gameId, pts) => {
    try {
      const token = localStorage.getItem('geep_token');
      if (!token) return;

      const res = await fetch('/api/games/play', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ gameId, pointsEarned: pts })
      });

      if (!res.ok) throw new Error(`HTTP Error`);
      const json = await res.json();
      
      if (json.success) {
        const data = json.data;
        
        setScores(prev => ({ ...prev, [gameId]: data.bestScore }));
        setStats(prev => ({
          ...prev,
          [gameId]: { ...prev[gameId], lastPlayedAt: new Date().toISOString() }
        }));
        
        // 🌟 THIS TRIGGERS THE UI RESULTS BLOCK 🌟
        setPostGame({
          lastScore: data.lastScore,
          bestScore: data.bestScore,
          convertedExp: data.gameConvertedExp,
          beatHighScore: data.beatHighScore
        });

        if (data.beatHighScore) {
          loadUserProgress();
        }
      }
    } catch (error) {
      console.error("Failed to send score");
    }
  };

  const activeGame = GAMES.find(g => g.id === active);
  const GameComponent = activeGame?.component;
  const totalBest = Object.values(scores).reduce((s, v) => s + v, 0);

  const todayString = new Date().toDateString();
  const gamesPlayedToday = Object.values(stats).filter(
    gameStat => gameStat.lastPlayedAt && new Date(gameStat.lastPlayedAt).toDateString() === todayString
  ).length;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background:"linear-gradient(160deg,#e8f5e9 0%,#f0fdf4 50%,#e0f2f1 100%)" }}>
        <div style={{ fontFamily:"'Fredoka One',cursive", color:"#2e7d32", fontSize:"1.5rem" }}>Loading your eco-stats... 🌍</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background:"linear-gradient(160deg,#e8f5e9 0%,#f0fdf4 50%,#e0f2f1 100%)", fontFamily:"'Nunito',sans-serif" }}>
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 pt-16 lg:pt-8">
          <div style={{ maxWidth:"900px", margin:"0 auto" }}>

            <div className="mb-6">
              <h1 style={{ fontFamily:"'Fredoka One',cursive", fontSize:"clamp(1.8rem,4vw,2.8rem)", background:"linear-gradient(135deg,#2e7d32,#43a047,#26a69a)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", marginBottom:"4px" }}>
                🎮 Eco Games
              </h1>
              <p style={{ color:"#6b7280", fontSize:"0.95rem" }}>Play, learn, and save the planet — one game at a time!</p>
            </div>

            <div className="flex flex-wrap gap-3 mb-6">
              {[
                { icon:"🎯", label:"Played Today", value:`${gamesPlayedToday}/${GAMES.length}` },
                { icon:"⭐", label:"Total Best Score", value:`${totalBest} pts` },
              ].map(({ icon, label, value }) => (
                <div key={label} style={{ background:"rgba(255,255,255,0.8)", backdropFilter:"blur(8px)", border:"1.5px solid #bbf7d0", borderRadius:"14px", padding:"8px 16px", display:"flex", alignItems:"center", gap:"8px" }}>
                  <span style={{ fontSize:"1.2rem" }}>{icon}</span>
                  <div>
                    <div style={{ fontSize:"0.7rem", color:"#9ca3af" }}>{label}</div>
                    <div style={{ fontFamily:"'Fredoka One',cursive", color:"#1b5e20", fontSize:"1rem" }}>{value}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* 🌟 THE GAME RESULTS UI BLOCK 🌟 */}
            {postGame && (
              <div style={{ background:"#ffffff", border:"2px solid #bbf7d0", borderRadius:"16px", padding:"20px", marginBottom:"20px", boxShadow:"0 10px 25px rgba(46,125,50,0.1)" }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
                  <div>
                    <h3 style={{ fontFamily:"'Fredoka One',cursive", fontSize:"1.5rem", color:"#1b5e20", margin:"0 0 4px 0" }}>
                      Game Complete! 🏁
                    </h3>
                    <p style={{ color:"#6b7280", fontSize:"0.9rem", margin:"0 0 16px 0" }}>
                      {postGame.beatHighScore 
                        ? "Amazing! You set a new High Score!" 
                        : "Good try! Beat your Best Score to earn more EXP. 💪"}
                    </p>
                    
                    <div style={{ display:"flex", gap:"12px", flexWrap:"wrap" }}>
                      <div style={{ background:"#f3f4f6", padding:"8px 16px", borderRadius:"10px", border:"1px solid #e5e7eb" }}>
                        <div style={{ fontSize:"0.75rem", color:"#6b7280", textTransform:"uppercase", fontWeight:"bold" }}>Last Score</div>
                        <div style={{ fontSize:"1.2rem", fontWeight:"900", color:"#374151" }}>{postGame.lastScore}</div>
                      </div>
                      <div style={{ background:"#fef3c7", padding:"8px 16px", borderRadius:"10px", border:"1px solid #fde68a" }}>
                        <div style={{ fontSize:"0.75rem", color:"#92400e", textTransform:"uppercase", fontWeight:"bold" }}>Best Score</div>
                        <div style={{ fontSize:"1.2rem", fontWeight:"900", color:"#d97706" }}>{postGame.bestScore}</div>
                      </div>
                      <div style={{ background:"#dcfce7", padding:"8px 16px", borderRadius:"10px", border:"1px solid #bbf7d0" }}>
                        <div style={{ fontSize:"0.75rem", color:"#166534", textTransform:"uppercase", fontWeight:"bold" }}>Converted EXP</div>
                        <div style={{ fontSize:"1.2rem", fontWeight:"900", color:"#15803d" }}>{postGame.convertedExp} EXP</div>
                      </div>
                    </div>
                  </div>
                  <button onClick={() => setPostGame(null)} style={{ background:"#f3f4f6", border:"none", borderRadius:"50%", width:"32px", height:"32px", cursor:"pointer", color:"#9ca3af", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"1.1rem" }}>✕</button>
                </div>
              </div>
            )}

            {activeGame && GameComponent ? (
              <div style={{ background:"rgba(255,255,255,0.95)", backdropFilter:"blur(12px)", borderRadius:"24px", border:"2px solid #bbf7d0", boxShadow:"0 20px 60px rgba(46,125,50,0.15)", overflow:"hidden" }}>
                <div className={`bg-gradient-to-r ${activeGame.color} p-4 flex items-center justify-between`}>
                  <div className="flex items-center gap-3">
                    <span style={{ fontSize:"2rem" }}>{activeGame.icon}</span>
                    <div>
                      <h2 style={{ fontFamily:"'Fredoka One',cursive", fontSize:"1.4rem", color:"#fff", margin:0 }}>{activeGame.title}</h2>
                      <span style={{ fontSize:"0.75rem", background:"rgba(255,255,255,0.25)", color:"#fff", padding:"2px 8px", borderRadius:"20px" }}>{activeGame.tag}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {scores[activeGame.id] > 0 && (
                      <div style={{ background:"rgba(255,255,255,0.2)", color:"#fff", borderRadius:"10px", padding:"4px 12px", fontFamily:"'Fredoka One',cursive", fontSize:"0.9rem" }}>
                        Best: ⭐{scores[activeGame.id]}
                      </div>
                    )}
                    <button onClick={() => { setActive(null); setPostGame(null); }}
                      style={{ background:"rgba(255,255,255,0.2)", border:"none", borderRadius:"10px", padding:"6px 14px", color:"#fff", cursor:"pointer", fontFamily:"'Fredoka One',cursive", fontSize:"0.9rem" }}>
                      ← Back
                    </button>
                  </div>
                </div>
                <div style={{ padding:"20px" }}>
                  <GameComponent onScore={(pts) => handleScore(activeGame.id, pts)} />
                </div>
              </div>
            ) : (
              <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(260px,1fr))", gap:"16px" }}>
                {GAMES.map(game => (
                  <div
                    key={game.id}
                    style={{ background:"rgba(255,255,255,0.9)", borderRadius:"20px", border:"2px solid #e5e7eb", overflow:"hidden", transition:"all 0.25s", cursor:"pointer", boxShadow:"0 4px 16px rgba(46,125,50,0.08)" }}
                    onMouseEnter={e => { e.currentTarget.style.transform="translateY(-6px)"; e.currentTarget.style.boxShadow="0 12px 32px rgba(46,125,50,0.2)"; e.currentTarget.style.borderColor="#86efac"; }}
                    onMouseLeave={e => { e.currentTarget.style.transform="translateY(0)"; e.currentTarget.style.boxShadow="0 4px 16px rgba(46,125,50,0.08)"; e.currentTarget.style.borderColor="#e5e7eb"; }}
                  >
                    <div className={`bg-gradient-to-r ${game.color} p-5 flex items-center justify-between`}>
                      <span style={{ fontSize:"3rem" }}>{game.icon}</span>
                      <div style={{ textAlign:"right" }}>
                        <div style={{ fontSize:"0.75rem", background:"rgba(255,255,255,0.25)", color:"#fff", padding:"2px 8px", borderRadius:"20px", marginBottom:"4px" }}>{game.tag}</div>
                        {scores[game.id] > 0 && (
                          <div style={{ fontSize:"0.75rem", color:"rgba(255,255,255,0.9)" }}>Best: ⭐{scores[game.id]}</div>
                        )}
                      </div>
                    </div>
                    <div style={{ padding:"16px" }}>
                      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"start", marginBottom:"8px" }}>
                        <h3 style={{ fontFamily:"'Fredoka One',cursive", fontSize:"1.15rem", color:"#1f2937", margin:0 }}>{game.title}</h3>
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${DIFF_COLOR[game.difficulty]}`} style={{ marginLeft:"8px", whiteSpace:"nowrap" }}>
                          {game.difficulty}
                        </span>
                      </div>
                      <p style={{ fontSize:"0.85rem", color:"#6b7280", marginBottom:"14px", lineHeight:"1.5" }}>{game.desc}</p>
                      <button
                        onClick={() => { setActive(game.id); setPostGame(null); }}
                        style={{
                          width:"100%", padding:"10px", borderRadius:"12px", border:"none", cursor:"pointer",
                          background: scores[game.id] ? "linear-gradient(135deg,#43a047,#2e7d32)" : "linear-gradient(135deg,#66bb6a,#43a047)",
                          color:"#fff", fontFamily:"'Fredoka One',cursive", fontSize:"1rem",
                          boxShadow:"0 4px 12px rgba(67,160,71,0.3)", transition:"all 0.2s",
                        }}
                        onMouseEnter={e => e.currentTarget.style.transform="scale(1.02)"}
                        onMouseLeave={e => e.currentTarget.style.transform="scale(1)"}
                      >
                        {scores[game.id] ? "▶ Play Again" : "🚀 Play Now"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}