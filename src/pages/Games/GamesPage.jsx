import { useState, useEffect } from "react";
import { useUser } from "../../context/UserContext";
import Sidebar from "../../components/common/Sidebar";

// --- GAME IMPORTS ---
import RecycleSorter  from "./games/RecycleSorter";
import EcoPuzzle      from "./games/EcoPuzzle";
import WaterSaver     from "./games/WaterSaver";
import EcoMatchPairs  from "./games/EcoMatchPairs";
import EcoBubbleBurst from "./games/EcoBubbleBurst";
import EcoStoryQuest  from "./games/EcoStoryQuest";

// --- CONFIGURATION ---
// This ensures your frontend points to the correct backend URL in production
const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const GAMES = [
  { id: "recycle", title: "Recycle Sorter", desc: "Drag & drop waste into the correct recycling bin before time runs out!", icon: "♻️", color: "from-green-400 to-emerald-600", tag: "Drag & Drop", difficulty: "Easy", component: RecycleSorter },
  { id: "puzzle", title: "Eco Sliding Puzzle", desc: "Slide eco-themed tiles to solve the puzzle and reveal the picture!", icon: "🧩", color: "from-blue-400 to-indigo-500", tag: "Puzzle", difficulty: "Hard", component: EcoPuzzle },
  { id: "water", title: "Water Pipe Puzzle", desc: "Rotate pipes to connect the water source to the thirsty plant!", icon: "💧", color: "from-sky-400 to-blue-600", tag: "Logic", difficulty: "Medium", component: WaterSaver },
  { id: "match", title: "Eco Memory Match", desc: "Flip cards to find matching eco pairs. Train your memory and learn!", icon: "🌿", color: "from-teal-400 to-green-600", tag: "Memory", difficulty: "Easy", component: EcoMatchPairs },
  { id: "bubbles", title: "Eco Bubble Burst", desc: "Pop the correct eco-friendly words! Watch out for the wrong ones.", icon: "🫧", color: "from-cyan-400 to-blue-600", tag: "Action", difficulty: "Medium", component: EcoBubbleBurst },
  { id: "story", title: "Eco Story Quest", desc: "Guide our hero through an interactive story. Every decision impacts the environment!", icon: "📖", color: "from-green-500 to-emerald-700", tag: "Adventure", difficulty: "Medium", component: EcoStoryQuest },
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
  const [postGame, setPostGame] = useState(null); 
  const [loading, setLoading] = useState(true);

  // --- FETCH USER GAME STATS ---
  useEffect(() => {
    const fetchScores = async () => {
      try {
        const token = localStorage.getItem('geep_token');
        if (!token) {
          setLoading(false);
          return;
        }

        const res = await fetch(`${API_BASE}/games/stats`, {
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

  // --- HANDLE GAME COMPLETION ---
  const handleScore = async (gameId, pts) => {
    try {
      const token = localStorage.getItem('geep_token');
      if (!token) return;

      const res = await fetch(`${API_BASE}/games/play`, {
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
        
        // Show the results UI block
        setPostGame({
          lastScore: data.lastScore,
          bestScore: data.bestScore,
          convertedExp: data.gameConvertedExp,
          beatHighScore: data.beatHighScore
        });

        // 🌟 FIX: Always reload user progress to update Navbar/Profile points instantly
        if (loadUserProgress) {
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
      <div className="min-h-screen flex items-center justify-center bg-emerald-50">
        <div className="font-fredoka text-emerald-700 text-2xl animate-pulse">Loading eco-stats... 🌍</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 font-nunito">
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 pt-16 lg:pt-8">
          <div className="max-w-4xl mx-auto">

            {/* Header */}
            <div className="mb-6">
              <h1 className="font-fredoka text-4xl sm:text-5xl bg-gradient-to-r from-emerald-800 to-teal-600 bg-clip-text text-transparent mb-2">
                🎮 Eco Games
              </h1>
              <p className="text-gray-500 font-medium">Play, learn, and save the planet — one game at a time!</p>
            </div>

            {/* Dashboard Stats Panel */}
            <div className="flex flex-wrap gap-3 mb-6">
              {[
                { icon: "🎯", label: "Played Today", value: `${gamesPlayedToday}/${GAMES.length}` },
                { icon: "⭐", label: "Total Best Score", value: `${totalBest} pts` },
              ].map(({ icon, label, value }) => (
                <div key={label} className="bg-white/90 backdrop-blur shadow-sm border border-emerald-100 rounded-2xl p-3 px-5 flex items-center gap-3">
                  <span className="text-2xl">{icon}</span>
                  <div>
                    <div className="text-[10px] uppercase tracking-wider font-bold text-gray-400 leading-none mb-1">{label}</div>
                    <div className="font-fredoka text-emerald-900 text-lg leading-tight">{value}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Results UI Feedback Block */}
            {postGame && (
              <div className="bg-white border-2 border-emerald-200 rounded-2xl p-6 mb-8 shadow-xl shadow-emerald-900/5 animate-slide-up">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-fredoka text-2xl text-emerald-800 mb-1">Game Complete! 🏁</h3>
                    <p className="text-gray-500 text-sm mb-4">
                      {postGame.beatHighScore 
                        ? "Amazing! You set a new High Score! 🎉" 
                        : "Good try! Beat your Best Score to earn even more EXP. 💪"}
                    </p>
                    
                    <div className="flex flex-wrap gap-3">
                      <div className="bg-gray-50 p-3 px-4 rounded-xl border border-gray-100 text-center min-w-[100px]">
                        <div className="text-[10px] text-gray-400 font-bold uppercase">Last Score</div>
                        <div className="text-xl font-black text-gray-700">{postGame.lastScore}</div>
                      </div>
                      <div className="bg-amber-50 p-3 px-4 rounded-xl border border-amber-100 text-center min-w-[100px]">
                        <div className="text-[10px] text-amber-600 font-bold uppercase">Personal Best</div>
                        <div className="text-xl font-black text-amber-700 font-fredoka">{postGame.bestScore}</div>
                      </div>
                      <div className="bg-emerald-50 p-3 px-4 rounded-xl border border-emerald-100 text-center min-w-[100px]">
                        <div className="text-[10px] text-emerald-600 font-bold uppercase">Experience</div>
                        <div className="text-xl font-black text-emerald-700">+{postGame.convertedExp} EXP</div>
                      </div>
                    </div>
                  </div>
                  <button onClick={() => setPostGame(null)} className="p-2 hover:bg-gray-100 rounded-full text-gray-400 transition-colors">✕</button>
                </div>
              </div>
            )}

            {/* Game Interface or Selection Menu */}
            {activeGame && GameComponent ? (
              <div className="bg-white rounded-3xl border-2 border-emerald-100 shadow-2xl overflow-hidden animate-fade-in">
                <div className={`bg-gradient-to-r ${activeGame.color} p-5 flex items-center justify-between`}>
                  <div className="flex items-center gap-4 text-white">
                    <span className="text-4xl drop-shadow-md">{activeGame.icon}</span>
                    <div>
                      <h2 className="font-fredoka text-2xl leading-none mb-1">{activeGame.title}</h2>
                      <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">{activeGame.tag}</span>
                    </div>
                  </div>
                  <button 
                    onClick={() => { setActive(null); setPostGame(null); }}
                    className="bg-white/20 hover:bg-white/30 text-white font-fredoka px-5 py-2 rounded-xl transition-all"
                  >
                    ← Exit Game
                  </button>
                </div>
                <div className="p-4 sm:p-6 bg-gray-50/50">
                  <GameComponent onScore={(pts) => handleScore(activeGame.id, pts)} />
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-5">
                {GAMES.map(game => (
                  <div
                    key={game.id}
                    onClick={() => { setActive(game.id); setPostGame(null); }}
                    className="group bg-white rounded-3xl border-2 border-gray-100 overflow-hidden hover:border-emerald-300 hover:shadow-2xl hover:shadow-emerald-900/10 transition-all duration-300 cursor-pointer flex flex-col"
                  >
                    <div className={`bg-gradient-to-r ${game.color} p-6 flex justify-between items-center group-hover:scale-[1.02] transition-transform duration-500`}>
                      <span className="text-6xl drop-shadow-lg group-hover:rotate-12 transition-transform">{game.icon}</span>
                      <div className="text-right">
                        <span className="inline-block text-[10px] bg-white/25 text-white px-3 py-1 rounded-full font-bold uppercase tracking-tighter mb-2">{game.tag}</span>
                        {scores[game.id] > 0 && (
                          <div className="text-white/90 font-fredoka text-sm">Best: ⭐ {scores[game.id]}</div>
                        )}
                      </div>
                    </div>
                    
                    <div className="p-6 flex-1 flex flex-col">
                      <div className="flex justify-between items-center mb-2">
                        <h3 className="font-fredoka text-xl text-gray-800">{game.title}</h3>
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-md uppercase ${DIFF_COLOR[game.difficulty]}`}>
                          {game.difficulty}
                        </span>
                      </div>
                      <p className="text-gray-500 text-sm leading-relaxed mb-6 flex-1">{game.desc}</p>
                      
                      <button className="w-full py-3 rounded-2xl font-fredoka text-lg transition-all shadow-md group-hover:shadow-emerald-200
                        bg-gradient-to-r from-emerald-700 to-teal-600 text-white">
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