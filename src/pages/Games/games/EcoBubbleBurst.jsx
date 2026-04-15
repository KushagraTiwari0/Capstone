import React, { useState, useEffect, useRef } from 'react';

// --- GAME DATA & QUESTIONS ---
const LEVEL_DATA = [
  {
    level: 1,
    title: "Eco-Friendly Actions",
    instruction: "Burst the bubbles showing ECO-FRIENDLY actions!",
    speed: "slow", // Animation duration 8s - 12s
    timer: null,
    correct: ["Planting Trees", "Carpooling", "Using Solar Panels", "Composting", "Reusable Bags", "Turning off Lights"],
    wrong: ["Leaving Tap Running", "Burning Plastic", "Littering", "Single-Use Plastics", "Wasting Food"]
  },
  {
    level: 2,
    title: "Harmful Activities",
    instruction: "Burst the bubbles showing HARMFUL environmental activities!",
    speed: "medium", // Animation duration 6s - 9s
    timer: null,
    correct: ["Deforestation", "Oil Spills", "Fast Fashion", "Illegal Dumping", "Overfishing", "Burning Coal"],
    wrong: ["Recycling Paper", "Riding a Bicycle", "Wind Turbines", "Planting a Garden", "Using LED Bulbs"]
  },
  {
    level: 3,
    title: "Renewable Resources",
    instruction: "Burst ONLY the RENEWABLE energy sources!",
    speed: "fast", // Animation duration 4s - 7s
    timer: null,
    correct: ["Sunlight", "Wind Power", "Geothermal", "Biomass", "Hydropower", "Tidal Energy"],
    wrong: ["Coal", "Natural Gas", "Uranium", "Petroleum", "Diesel", "Propane"]
  },
  {
    level: 4,
    title: "Greenhouse Gases (Timed Mode!)",
    instruction: "Burst the GREENHOUSE GASES before time runs out!",
    speed: "very-fast", // Animation duration 3s - 5s
    timer: 30, // 30 seconds to complete
    correct: ["Carbon Dioxide", "Methane", "Nitrous Oxide", "Ozone", "Water Vapor", "CFCs"],
    wrong: ["Oxygen", "Nitrogen", "Argon", "Helium", "Hydrogen", "Neon"]
  }
];

export default function EcoBubbleBurst({ onScore }) {
  const [gameState, setGameState] = useState('start'); // start, playing, levelComplete, gameover, won
  const [level, setLevel] = useState(0);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [bubbles, setBubbles] = useState([]);
  const [timeLeft, setTimeLeft] = useState(null);
  const [fact, setFact] = useState("");
  const [mistakesInLevel, setMistakesInLevel] = useState(0);

  const containerRef = useRef(null);
  const timerRef = useRef(null);

  // --- 🌟 FIX: Updated Generator to accept the target level directly ---
  const generateBubbles = (targetLevel = level) => {
    const currentData = LEVEL_DATA[targetLevel];
    let newBubbles = [];
    
    let minSpeed, maxSpeed;
    switch(currentData.speed) {
      case 'slow': minSpeed = 8; maxSpeed = 12; break;
      case 'medium': minSpeed = 6; maxSpeed = 9; break;
      case 'fast': minSpeed = 4; maxSpeed = 7; break;
      case 'very-fast': minSpeed = 3; maxSpeed = 5; break;
      default: minSpeed = 8; maxSpeed = 12;
    }

    // Combine 5 correct and 5 wrong options randomly
    const shuffledCorrect = [...currentData.correct].sort(() => 0.5 - Math.random()).slice(0, 5);
    const shuffledWrong = [...currentData.wrong].sort(() => 0.5 - Math.random()).slice(0, 5);
    
    const combined = [...shuffledCorrect.map(text => ({ text, isCorrect: true })), 
                      ...shuffledWrong.map(text => ({ text, isCorrect: false }))]
                     .sort(() => 0.5 - Math.random());

    combined.forEach((item, index) => {
      newBubbles.push({
        id: `bubble-${Date.now()}-${index}`,
        text: item.text,
        isCorrect: item.isCorrect,
        x: Math.random() * 80 + 10, // Random X position (10% to 90%)
        duration: Math.random() * (maxSpeed - minSpeed) + minSpeed,
        delay: Math.random() * 2, // Stagger the starts
        status: 'floating', // floating, popped-correct, popped-wrong
        color: `hsl(${Math.random() * 360}, 80%, 70%)`
      });
    });

    setBubbles(newBubbles);
  };

  // --- GAME STATE CONTROLLERS ---
  const startGame = () => {
    setLevel(0);
    setScore(0);
    setLives(3);
    setGameState('playing');
    setMistakesInLevel(0);
    generateBubbles(0); // 🌟 Spawn level 0 bubbles
    setTimeLeft(LEVEL_DATA[0].timer);
  };

  const nextLevel = () => {
    const next = level + 1;
    if (next >= LEVEL_DATA.length) {
      endGame('won');
    } else {
      setLevel(next);
      setMistakesInLevel(0);
      setGameState('playing');
      generateBubbles(next); // 🌟 FIX: Explicitly spawn new bubbles for the next level!
      setTimeLeft(LEVEL_DATA[next].timer);
    }
  };

  const endGame = (status) => {
    setGameState(status);
    onScore(score); // Send final score to backend
  };

  // --- RELIABLE LEVEL COMPLETION CHECKER ---
  useEffect(() => {
    if (gameState === 'playing') {
      const correctTotal = bubbles.filter(b => b.isCorrect).length;
      const correctPopped = bubbles.filter(b => b.isCorrect && b.status === 'popped-correct').length;
      
      // If we have successfully popped ALL the correct bubbles in this level
      if (correctTotal > 0 && correctPopped === correctTotal) {
        let bonus = 0;
        let factMsg = "Great job clearing the level!";
        
        if (mistakesInLevel === 0) {
          bonus += 20; // Flawless bonus
          factMsg = "Flawless! Fun Fact: Recycling one glass bottle saves enough energy to power a computer for 25 minutes! 🌍";
        }
        if (LEVEL_DATA[level].timer && timeLeft > (LEVEL_DATA[level].timer / 2)) {
          bonus += 10; // Fast completion bonus
        }

        setScore(prev => prev + bonus);
        setFact(factMsg);
        setGameState('levelComplete');
      }
    }
  }, [bubbles, gameState, mistakesInLevel, level, timeLeft]);

  // --- RELIABLE GAME OVER CHECKER ---
  useEffect(() => {
    if (gameState === 'playing' && lives <= 0) {
      endGame('gameover');
    }
  }, [lives, gameState]);

  // --- TIMER LOGIC ---
  useEffect(() => {
    if (gameState === 'playing' && timeLeft !== null && timeLeft > 0) {
      timerRef.current = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
    } else if (timeLeft === 0 && gameState === 'playing') {
      endGame('gameover');
    }
    return () => clearTimeout(timerRef.current);
  }, [timeLeft, gameState]);

  // --- BUBBLE CLICK HANDLER ---
  const handleBubbleClick = (bubbleId, isCorrect) => {
    if (gameState !== 'playing') return;

    // Update the visual status of the bubble so it pops
    setBubbles(prev => prev.map(b => 
      b.id === bubbleId ? { ...b, status: isCorrect ? 'popped-correct' : 'popped-wrong' } : b
    ));

    // Update Scores and Lives
    if (isCorrect) {
      setScore(prev => prev + 10);
    } else {
      setScore(prev => Math.max(0, prev - 5));
      setLives(prev => prev - 1);
      setMistakesInLevel(prev => prev + 1);
    }
  };

  return (
    <div className="relative w-full h-[600px] bg-gradient-to-b from-sky-200 to-blue-50 rounded-2xl overflow-hidden border-4 border-white shadow-inner flex flex-col font-nunito">
      
      {/* --- SEPARATED CSS ANIMATIONS --- */}
      <style dangerouslySetInnerHTML={{__html: `
        /* Float uses TOP instead of Transform so it doesn't fight the Pop animation */
        @keyframes float-up {
          0% { top: 110%; opacity: 0; }
          10% { opacity: 0.9; }
          90% { opacity: 0.9; }
          100% { top: -20%; opacity: 0; }
        }
        @keyframes pop-c {
          0% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.4); opacity: 0.8; filter: brightness(1.5) hue-rotate(90deg); }
          100% { transform: scale(0); opacity: 0; }
        }
        @keyframes pop-w {
          0% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.2); opacity: 0.8; filter: grayscale(1) sepia(1) hue-rotate(-50deg) saturate(5); }
          100% { transform: scale(0); opacity: 0; }
        }
        .bubble-float { animation: float-up linear infinite; }
        .pop-c { animation: pop-c 0.3s ease-out forwards; }
        .pop-w { animation: pop-w 0.4s ease-out forwards; }
      `}} />

      {/* --- HEADER HUD --- */}
      <div className="bg-white/80 backdrop-blur px-6 py-3 flex justify-between items-center z-10 shadow-sm border-b border-white/50">
        <div className="flex gap-1 text-2xl">
          {[...Array(3)].map((_, i) => (
            <span key={i} className={i < lives ? "opacity-100 drop-shadow-md" : "opacity-20 grayscale"}>❤️</span>
          ))}
        </div>
        
        {gameState === 'playing' && (
          <div className="text-center absolute left-1/2 -translate-x-1/2 w-1/2">
            <h2 className="font-fredoka text-xl text-primary-800 tracking-wide">{LEVEL_DATA[level].instruction}</h2>
            {timeLeft !== null && (
              <div className={`font-bold ${timeLeft <= 10 ? 'text-red-500 animate-pulse' : 'text-blue-600'}`}>
                ⏳ {timeLeft}s
              </div>
            )}
          </div>
        )}

        <div className="bg-primary-100 text-primary-800 px-4 py-1.5 rounded-full font-bold font-fredoka text-lg border-2 border-primary-200 shadow-sm">
          {score} pts
        </div>
      </div>

      {/* --- PLAY AREA --- */}
      <div ref={containerRef} className="flex-1 relative overflow-hidden">
        
        {/* State: Start Screen */}
        {gameState === 'start' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/40 backdrop-blur-sm z-20">
            <div className="text-6xl mb-4 animate-bounce">🫧</div>
            <h1 className="font-fredoka text-5xl text-primary-700 mb-2 drop-shadow-sm text-center">Eco Bubble Burst</h1>
            <p className="text-gray-600 mb-8 max-w-md text-center font-medium">Pop the correct environmental terms to earn points. Watch out for the wrong ones, or you'll lose a life!</p>
            <button onClick={startGame} className="bg-gradient-to-r from-primary-500 to-primary-600 text-white font-fredoka text-2xl px-10 py-4 rounded-full shadow-lg hover:scale-105 hover:shadow-xl transition-all border-4 border-white/30">
              Start Game 🚀
            </button>
          </div>
        )}

        {/* State: Playing (Bubbles render here) */}
        {gameState === 'playing' && bubbles.map(bubble => (
          // OUTER WRAPPER: Handles the continuous floating
          <div
            key={bubble.id}
            className="absolute bubble-float"
            style={{
              left: `${bubble.x}%`,
              animationDuration: `${bubble.duration}s`,
              animationDelay: `${bubble.delay}s`,
              zIndex: bubble.status === 'floating' ? 5 : 1 // Drop behind other bubbles when popped
            }}
          >
            {/* INNER BUTTON: Handles the click and the burst animation */}
            <button
              onClick={() => handleBubbleClick(bubble.id, bubble.isCorrect)}
              disabled={bubble.status !== 'floating'}
              className={`flex items-center justify-center rounded-full text-white font-bold p-3 shadow-lg border-2 border-white/40 backdrop-blur-sm cursor-crosshair transition-transform hover:scale-110
                ${bubble.status === 'popped-correct' ? 'pop-c' : bubble.status === 'popped-wrong' ? 'pop-w' : ''}`}
              style={{
                width: '110px', height: '110px',
                background: `radial-gradient(circle at 30% 30%, rgba(255,255,255,0.8), ${bubble.color})`,
                fontSize: bubble.text.length > 10 ? '0.75rem' : '0.9rem',
                lineHeight: '1.2'
              }}
            >
              <span className="drop-shadow-md text-center pointer-events-none">{bubble.text}</span>
              <div className="absolute top-2 left-3 w-4 h-4 bg-white/60 rounded-full blur-[1px] pointer-events-none"></div>
            </button>
          </div>
        ))}

        {/* State: Level Complete */}
        {gameState === 'levelComplete' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 backdrop-blur-md z-20">
            <h2 className="font-fredoka text-4xl text-green-600 mb-2">Level Cleared! 🎉</h2>
            <p className="text-xl text-gray-700 mb-4 font-bold">Current Score: {score}</p>
            <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl mb-8 max-w-sm text-center shadow-sm">
              <span className="text-2xl block mb-2">💡</span>
              <p className="text-blue-800 text-sm font-medium">{fact}</p>
            </div>
            <button onClick={nextLevel} className="bg-primary-500 text-white font-fredoka text-xl px-8 py-3 rounded-full shadow-lg hover:scale-105 transition-transform">
              Next Level ➡️
            </button>
          </div>
        )}

        {/* State: Game Over / Won */}
        {(gameState === 'gameover' || gameState === 'won') && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/90 backdrop-blur-md z-30">
            <div className="text-7xl mb-4">{gameState === 'won' ? '🏆' : '💥'}</div>
            <h2 className={`font-fredoka text-5xl mb-2 ${gameState === 'won' ? 'text-yellow-500' : 'text-red-500'}`}>
              {gameState === 'won' ? 'You Win!' : 'Game Over'}
            </h2>
            <p className="text-gray-600 text-lg mb-6">
              {gameState === 'won' ? "You're an Eco-Expert! Your score is saved." : "Don't give up! Every mistake is a lesson learned."}
            </p>
            <div className="bg-gray-100 px-8 py-4 rounded-2xl border-2 border-gray-200 mb-8">
              <span className="text-gray-500 font-bold block text-center mb-1 text-sm uppercase tracking-wider">Final Score</span>
              <span className="font-fredoka text-4xl text-gray-800">{score}</span>
            </div>
            <button onClick={startGame} className="bg-gray-800 text-white font-fredoka text-xl px-8 py-3 rounded-full shadow-lg hover:bg-gray-700 transition-colors">
              🔄 Play Again
            </button>
          </div>
        )}

      </div>
    </div>
  );
}