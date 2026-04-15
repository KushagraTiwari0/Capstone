import React, { useState, useEffect } from 'react';
// 🌟 Import the stories from your new data file!
import { STORY_LIBRARY } from '../../../data/storyLibrary';

export default function EcoStoryQuest({ onScore }) {
  const [gameState, setGameState] = useState('menu'); // menu, intro, playing, gameover, won
  const [activeStory, setActiveStory] = useState(null);
  const [currentNode, setCurrentNode] = useState(null);
  
  const [score, setScore] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  
  // Typing Effect State
  const [displayedText, setDisplayedText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [typingIndex, setTypingIndex] = useState(0);

  // --- GAME INITIALIZATION ---
  const selectStory = (story) => {
    setActiveStory(story);
    setGameState('intro');
  };

  const startGame = () => {
    setScore(0);
    setMistakes(0);
    setGameState('playing');
    loadNode('start');
  };

  const loadNode = (nodeId) => {
    const node = activeStory.nodes[nodeId];
    setCurrentNode(node);
    
    setDisplayedText("");
    setTypingIndex(0);
    setIsTyping(true);

    if (node.isGameOver) {
      setGameState('gameover');
      setMistakes(prev => prev + 1);
    } else if (node.isWin) {
      setGameState('won');
      const bonus = mistakes === 0 ? 20 : 0;
      setScore(prev => prev + bonus);
    }
  };

  // --- TYPING EFFECT LOGIC ---
  useEffect(() => {
    if (!currentNode || !isTyping) return;

    const fullText = currentNode.characterMsg;
    
    if (typingIndex < fullText.length) {
      const timeout = setTimeout(() => {
        setDisplayedText(prev => prev + fullText[typingIndex]);
        setTypingIndex(prev => prev + 1);
      }, 30); 
      return () => clearTimeout(timeout);
    } else {
      setIsTyping(false);
      if (currentNode.isGameOver || currentNode.isWin) {
        setTimeout(() => {
           onScore(score + (currentNode.isWin && mistakes === 0 ? 20 : 0));
        }, 1000);
      }
    }
  }, [typingIndex, isTyping, currentNode, score, mistakes, onScore]);

  // --- INTERACTION ---
  const handleChoice = (choice) => {
    if (isTyping) {
      setDisplayedText(currentNode.characterMsg);
      setIsTyping(false);
      return;
    }
    if (choice.isCorrect) setScore(prev => prev + 10);
    loadNode(choice.next);
  };

  const getCharacterFace = (mood) => {
    switch(mood) {
      case 'happy': return '😄';
      case 'sad': return '😟';
      case 'concerned': return '😧';
      case 'thinking': return '🤔';
      case 'celebrate': return '🥳';
      default: return '🙂';
    }
  };

  return (
    <div className="relative w-full h-[600px] bg-gray-900 rounded-2xl overflow-hidden border-4 border-white shadow-inner flex flex-col font-nunito transition-colors duration-700">
      
      {/* CSS Animations */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes float-idle { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-10px); } }
        @keyframes bounce-talk { 0%, 100% { transform: translateY(0px) scale(1); } 50% { transform: translateY(-15px) scale(1.05); } }
        @keyframes shake-sad { 0%, 100% { transform: translateX(0); } 25% { transform: translateX(-5px) rotate(-5deg); } 75% { transform: translateX(5px) rotate(5deg); } }
        .char-idle { animation: float-idle 3s ease-in-out infinite; }
        .char-talk { animation: bounce-talk 0.5s ease-in-out infinite; }
        .char-sad { animation: shake-sad 1s ease-in-out infinite; }
      `}} />

      {/* --- STATE 1: MENU SELECTION --- */}
      {gameState === 'menu' && (
        <div className="absolute inset-0 flex flex-col items-center justify-start bg-gradient-to-br from-green-50 to-emerald-100 z-30 p-8 overflow-y-auto">
          <h1 className="font-fredoka text-4xl text-emerald-800 mb-2">Choose Your Story</h1>
          <p className="text-gray-600 mb-8 font-medium">Select a quest and guide our hero to make the right choices!</p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-3xl">
            {STORY_LIBRARY.map((story) => (
              <button 
                key={story.id}
                onClick={() => selectStory(story)}
                className="bg-white p-6 rounded-2xl shadow-md border-2 border-transparent hover:border-emerald-400 hover:shadow-xl transition-all transform hover:-translate-y-1 text-left flex flex-col gap-3 group"
              >
                <div className="text-5xl bg-emerald-50 w-16 h-16 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  {story.icon}
                </div>
                <h2 className="font-fredoka text-xl text-gray-800">{story.title}</h2>
                <p className="text-gray-500 text-sm">{story.summary}</p>
                <div className="mt-auto pt-4 text-emerald-600 font-bold text-sm flex justify-between items-center">
                  <span>Start Quest</span>
                  <span className="opacity-0 group-hover:opacity-100 transition-opacity">➔</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* --- STATE 2: STORY INTRO --- */}
      {gameState === 'intro' && activeStory && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-green-500 to-emerald-700 z-20 text-white">
          <div className="text-8xl mb-6 char-idle">🧚‍♀️</div>
          <h1 className="font-fredoka text-5xl mb-4 drop-shadow-md text-center">{activeStory.title}</h1>
          <p className="text-green-50 mb-8 max-w-md text-center font-medium text-lg px-4">
            {activeStory.summary}
          </p>
          <div className="flex gap-4">
            <button onClick={startGame} className="bg-white text-green-700 font-fredoka text-2xl px-8 py-3 rounded-full shadow-lg hover:scale-105 transition-transform">
              Begin 📖
            </button>
            <button onClick={() => setGameState('menu')} className="bg-green-800 text-white font-fredoka text-xl px-6 py-3 rounded-full shadow-lg hover:bg-green-900 transition-colors">
              Back
            </button>
          </div>
        </div>
      )}

      {/* --- STATE 3: MAIN GAMEPLAY AREA --- */}
      {(gameState === 'playing' || gameState === 'gameover' || gameState === 'won') && currentNode && (
        <div className={`absolute inset-0 flex flex-col transition-all duration-1000 ${currentNode.bg}`}>
          
          <div className="bg-white/30 backdrop-blur-sm px-6 py-3 flex justify-between items-center shadow-sm">
            <button onClick={() => setGameState('menu')} className="font-fredoka text-white text-sm bg-black/20 px-3 py-1 rounded-full hover:bg-black/30 transition-colors">
              ← Menu
            </button>
            <div className="font-fredoka text-white text-lg tracking-wide drop-shadow-sm hidden sm:block">
              {activeStory.title}
            </div>
            <div className="bg-white text-gray-800 px-4 py-1 rounded-full font-bold font-fredoka text-sm shadow-sm">
              {score} pts
            </div>
          </div>

          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
            <div className="text-8xl mb-6 drop-shadow-xl animate-fade-in transition-all duration-500">
              {currentNode.emoji}
            </div>
            <div className="bg-white/90 backdrop-blur-md p-6 rounded-2xl shadow-lg max-w-lg w-full border border-white/50 animate-slide-up">
              <p className="text-gray-800 text-lg font-medium leading-relaxed">
                {currentNode.text}
              </p>
            </div>
          </div>

          <div className="px-6 pb-32 flex flex-col gap-3 max-w-2xl mx-auto w-full">
            {gameState === 'playing' && !isTyping && currentNode.choices?.map((choice, idx) => (
              <button
                key={idx}
                onClick={() => handleChoice(choice)}
                className="bg-white hover:bg-gray-50 text-gray-800 font-bold py-4 px-6 rounded-xl shadow-md border-2 border-transparent hover:border-primary-400 transition-all transform hover:-translate-y-1 text-left flex items-center justify-between group"
              >
                <span>{choice.text}</span>
                <span className="opacity-0 group-hover:opacity-100 transition-opacity text-primary-500">➔</span>
              </button>
            ))}

            {!isTyping && (gameState === 'gameover' || gameState === 'won') && (
               <div className="flex justify-center gap-4 mt-4 animate-fade-in">
                  <button onClick={startGame} className="bg-white text-gray-800 font-bold py-3 px-8 rounded-full shadow-lg hover:bg-gray-100 transition-transform hover:scale-105 border-2 border-gray-200">
                    🔄 Retry Story
                  </button>
                  <button onClick={() => setGameState('menu')} className="bg-primary-600 text-white font-bold py-3 px-8 rounded-full shadow-lg hover:bg-primary-700 transition-transform hover:scale-105">
                    📚 Pick Another
                  </button>
               </div>
            )}
          </div>

          {/* --- THE GUIDE CHARACTER --- */}
          <div className="absolute bottom-4 left-4 right-4 flex items-end gap-4 pointer-events-none">
            <div className={`text-6xl drop-shadow-xl bg-white rounded-full w-20 h-20 flex items-center justify-center shadow-lg border-4 border-white shrink-0
              ${isTyping ? 'char-talk' : currentNode.charMood === 'sad' ? 'char-sad' : 'char-idle'}
            `}>
              {getCharacterFace(currentNode.charMood)}
            </div>

            <div className="flex-1 bg-white p-4 rounded-2xl rounded-bl-none shadow-xl border-2 border-gray-100 relative max-w-xl">
              {isTyping && displayedText === "" ? (
                 <div className="flex gap-1 h-6 items-center px-2">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0ms'}}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '150ms'}}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '300ms'}}></div>
                 </div>
              ) : (
                <p className="text-gray-800 font-medium text-base sm:text-lg min-h-[48px]">
                  {displayedText}
                </p>
              )}
              {isTyping && displayedText.length > 5 && (
                <span className="absolute bottom-2 right-3 text-[10px] text-gray-400 uppercase tracking-widest">
                  Click to skip ⏭️
                </span>
              )}
            </div>
          </div>

        </div>
      )}
    </div>
  );
}