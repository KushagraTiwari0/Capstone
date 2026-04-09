import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const GAMES = [
  {
    id: 'recycle-city',
    title: 'Recycle City',
    description: 'Explore a city and discover how residents reduce waste and recycle — an EPA-designed interactive experience.',
    difficulty: 'Easy',
    icon: '♻️',
    color: 'from-green-400 to-emerald-600',
    tag: 'Recycling',
    url: 'https://www3.epa.gov/recyclecity/',
  },
  {
    id: 'climate-kids-carbon',
    title: 'Carbon Calculator',
    description: 'Calculate your carbon footprint and discover practical ways to reduce your environmental impact.',
    difficulty: 'Easy',
    icon: '🌱',
    color: 'from-teal-400 to-cyan-600',
    tag: 'Carbon',
    url: 'https://climatekids.nasa.gov/carbon-counter/',
  },
  {
    id: 'nasa-eyes',
    title: 'NASA Climate Explorer',
    description: 'Use NASA data to explore how Earth\'s climate is changing — temperature, sea level, ice and more.',
    difficulty: 'Medium',
    icon: '🌍',
    color: 'from-blue-400 to-indigo-600',
    tag: 'Climate Science',
    url: 'https://climatekids.nasa.gov/',
  },
  {
    id: 'water-footprint',
    title: 'Water Footprint Calculator',
    description: 'Find out how much water your daily habits use and get tips to reduce your water footprint.',
    difficulty: 'Easy',
    icon: '💧',
    color: 'from-sky-400 to-blue-600',
    tag: 'Water',
    url: 'https://www.watercalculator.org/',
  },
  {
    id: 'bbc-climate',
    title: 'Climate Change Quiz',
    description: 'Test your knowledge of climate change facts and myths in this BBC interactive quiz.',
    difficulty: 'Medium',
    icon: '🧠',
    color: 'from-purple-400 to-violet-600',
    tag: 'Quiz',
    url: 'https://www.bbc.co.uk/cbbc/quizzes/blue-peter-climate-change-quiz',
  },
  {
    id: 'energy-kids',
    title: 'Energy Kids Games',
    description: 'Play energy-themed games from the U.S. Energy Information Administration and learn about energy sources.',
    difficulty: 'Easy',
    icon: '⚡',
    color: 'from-yellow-400 to-orange-500',
    tag: 'Energy',
    url: 'https://www.eia.gov/kids/games/',
  },
];

const DIFFICULTY_COLOR = {
  Easy:   'bg-green-100 text-green-700',
  Medium: 'bg-yellow-100 text-yellow-700',
  Hard:   'bg-red-100 text-red-700',
};

const getToken = () => localStorage.getItem('geep_token');

const trackGameStat = async (gameId, type) => {
  const token = getToken();
  if (!token) return;
  try {
    await fetch(`${API_BASE_URL}/games/${type}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ gameId }),
    });
  } catch (err) {
    console.error(`Track game ${type} error:`, err);
  }
};

const fetchGameStats = async () => {
  const token = getToken();
  if (!token) return {};
  try {
    const res = await fetch(`${API_BASE_URL}/games/stats`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    return data.success ? data.data.stats : {};
  } catch {
    return {};
  }
};

const GamesPage = () => {
  const { user } = useUser();
  const navigate = useNavigate();
  const [activeGame, setActiveGame]     = useState(null);
  const [iframeBlocked, setIframeBlocked] = useState(false);
  const [loadingGame, setLoadingGame]   = useState(false);
  const [stats, setStats]               = useState({});
  const iframeRef    = useRef(null);
  const loadTimeout  = useRef(null);

  useEffect(() => {
    if (user && user.role !== 'student') {
      navigate(user.role === 'teacher' ? '/teacher' : '/admin');
    }
  }, [user, navigate]);

  useEffect(() => {
    fetchGameStats().then(setStats);
  }, []);

  useEffect(() => () => { if (loadTimeout.current) clearTimeout(loadTimeout.current); }, []);

  const openGame = async (game) => {
    setActiveGame(game);
    setIframeBlocked(false);
    setLoadingGame(true);

    // After 6s with no load, assume blocked
    loadTimeout.current = setTimeout(() => {
      setIframeBlocked(true);
      setLoadingGame(false);
    }, 6000);

    await trackGameStat(game.id, 'open');
    setStats((prev) => ({
      ...prev,
      [game.id]: { ...prev[game.id], opens: (prev[game.id]?.opens || 0) + 1 },
    }));
  };

  const handleIframeLoad = async () => {
    clearTimeout(loadTimeout.current);
    setLoadingGame(false);
    setIframeBlocked(false);
    if (activeGame) {
      await trackGameStat(activeGame.id, 'play');
      setStats((prev) => ({
        ...prev,
        [activeGame.id]: {
          ...prev[activeGame.id],
          plays: (prev[activeGame.id]?.plays || 0) + 1,
          lastPlayedAt: new Date().toISOString(),
        },
      }));
    }
  };

  const openInNewTab = () => {
    if (!activeGame) return;
    window.open(activeGame.url, '_blank', 'noopener,noreferrer');
    trackGameStat(activeGame.id, 'play');
    setStats((prev) => ({
      ...prev,
      [activeGame.id]: {
        ...prev[activeGame.id],
        plays: (prev[activeGame.id]?.plays || 0) + 1,
        lastPlayedAt: new Date().toISOString(),
      },
    }));
  };

  const closeGame = () => {
    clearTimeout(loadTimeout.current);
    setActiveGame(null);
    setIframeBlocked(false);
    setLoadingGame(false);
  };

  const totalPlays  = Object.values(stats).reduce((sum, s) => sum + (s.plays || 0), 0);
  const gamesPlayed = Object.values(stats).filter((s) => s.plays > 0).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 p-4 sm:p-6 lg:p-8">

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-4xl">🎮</span>
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Eco Games</h1>
            <p className="text-gray-500 text-sm">Learn sustainability through play</p>
          </div>
        </div>
        <div className="flex gap-4 mt-4 flex-wrap">
          <div className="bg-white rounded-xl px-4 py-2 shadow-sm border border-green-100 flex items-center gap-2">
            <span className="text-green-500 text-lg">🎯</span>
            <span className="text-sm text-gray-600">
              <span className="font-bold text-gray-800">{gamesPlayed}</span> / {GAMES.length} games played
            </span>
          </div>
          <div className="bg-white rounded-xl px-4 py-2 shadow-sm border border-green-100 flex items-center gap-2">
            <span className="text-yellow-500 text-lg">⚡</span>
            <span className="text-sm text-gray-600">
              <span className="font-bold text-gray-800">{totalPlays}</span> total sessions
            </span>
          </div>
        </div>
      </div>

      {/* Notice banner */}
      <div className="mb-6 bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 flex items-start gap-3">
        <span className="text-blue-500 text-xl shrink-0">ℹ️</span>
        <p className="text-blue-700 text-sm">
          Some games open directly in your browser for the best experience. Your progress is always tracked!
        </p>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {GAMES.map((game) => {
          const gameStat  = stats[game.id] || {};
          const hasPlayed = (gameStat.plays || 0) > 0;

          return (
            <div
              key={game.id}
              className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 group"
            >
              <div className={`bg-gradient-to-r ${game.color} p-6 flex items-center justify-between`}>
                <span className="text-5xl">{game.icon}</span>
                <div className="text-right">
                  <span className="text-xs font-semibold px-2 py-1 rounded-full bg-white/30 text-white">
                    {game.tag}
                  </span>
                  {hasPlayed && (
                    <div className="mt-1 text-xs text-white/80">✓ Played {gameStat.plays}×</div>
                  )}
                </div>
              </div>

              <div className="p-5">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-lg font-bold text-gray-800 leading-snug group-hover:text-green-700 transition-colors">
                    {game.title}
                  </h3>
                  <span className={`text-xs font-semibold px-2 py-1 rounded-full ml-2 shrink-0 ${DIFFICULTY_COLOR[game.difficulty]}`}>
                    {game.difficulty}
                  </span>
                </div>

                <p className="text-gray-500 text-sm mb-4 leading-relaxed">{game.description}</p>

                <div className="flex items-center gap-3 text-xs text-gray-400 mb-4">
                  <span>👁️ {gameStat.opens || 0} opens</span>
                  <span>•</span>
                  <span>🎮 {gameStat.plays || 0} plays</span>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => openGame(game)}
                    className={`flex-1 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200
                      ${hasPlayed
                        ? 'bg-green-600 hover:bg-green-700 text-white'
                        : 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-md hover:shadow-lg'
                      }`}
                  >
                    {hasPlayed ? '▶ Play Again' : '🚀 Play Now'}
                  </button>
                  <button
                    onClick={() => { window.open(game.url, '_blank', 'noopener,noreferrer'); trackGameStat(game.id, 'play'); }}
                    className="px-3 py-2.5 rounded-xl border border-gray-200 hover:border-green-400 text-gray-500 hover:text-green-600 transition-all text-sm"
                    title="Open in new tab"
                  >
                    🔗
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal */}
      {activeGame && (
        <div className="fixed inset-0 z-50 bg-black/80 flex flex-col">

          {/* Modal header */}
          <div className="flex items-center justify-between px-4 py-3 bg-gray-900 text-white shrink-0">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{activeGame.icon}</span>
              <div>
                <h2 className="font-bold text-base leading-none">{activeGame.title}</h2>
                <span className={`text-xs px-2 py-0.5 rounded-full mt-0.5 inline-block ${DIFFICULTY_COLOR[activeGame.difficulty]}`}>
                  {activeGame.difficulty}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={openInNewTab}
                className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg transition-colors"
              >
                🔗 New Tab
              </button>
              <button onClick={closeGame} className="text-gray-400 hover:text-white text-2xl px-2 transition-colors">
                ✕
              </button>
            </div>
          </div>

          {/* Loading */}
          {loadingGame && !iframeBlocked && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-gray-900/90">
              <div className="text-center text-white">
                <div className="text-5xl mb-4 animate-bounce">{activeGame.icon}</div>
                <p className="text-lg font-semibold">Loading {activeGame.title}...</p>
                <p className="text-sm text-gray-400 mt-1">Checking if the game can be displayed here…</p>
              </div>
            </div>
          )}

          {/* Blocked fallback */}
          {iframeBlocked ? (
            <div className="flex-1 flex items-center justify-center bg-gray-800">
              <div className="text-center text-white max-w-sm px-6">
                <div className="text-6xl mb-4">{activeGame.icon}</div>
                <h3 className="text-xl font-bold mb-2">{activeGame.title}</h3>
                <p className="text-gray-400 text-sm mb-6">
                  This game's website doesn't allow embedding, but it works perfectly in a new tab!
                </p>
                <button
                  onClick={openInNewTab}
                  className="bg-green-500 hover:bg-green-600 text-white font-bold px-6 py-3 rounded-xl transition-colors shadow-lg w-full mb-3"
                >
                  🚀 Open Game in New Tab
                </button>
                <button
                  onClick={closeGame}
                  className="text-gray-500 hover:text-gray-300 text-sm transition-colors"
                >
                  ← Go back to games
                </button>
              </div>
            </div>
          ) : (
            <iframe
              ref={iframeRef}
              src={activeGame.url}
              title={activeGame.title}
              className="flex-1 w-full border-0 bg-white"
              onLoad={handleIframeLoad}
              onError={() => { clearTimeout(loadTimeout.current); setIframeBlocked(true); setLoadingGame(false); }}
              allow="fullscreen"
            />
          )}
        </div>
      )}
    </div>
  );
};

export default GamesPage;