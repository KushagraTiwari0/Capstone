import { useState, useRef } from "react";

const BINS = [
  { id: "plastic", label: "Plastic", emoji: "🗑️", color: "#fbbf24", bg: "#fef3c7", border: "#f59e0b" },
  { id: "paper",   label: "Paper",   emoji: "📄", color: "#60a5fa", bg: "#dbeafe", border: "#3b82f6" },
  { id: "glass",   label: "Glass",   emoji: "🫙", color: "#34d399", bg: "#d1fae5", border: "#10b981" },
  { id: "organic", label: "Organic", emoji: "🌿", color: "#a78bfa", bg: "#ede9fe", border: "#8b5cf6" },
  { id: "ewaste",  label: "E-Waste", emoji: "🔌", color: "#f87171", bg: "#fee2e2", border: "#ef4444" },
];

const ITEMS = [
  { id:1,  label:"Water Bottle",    emoji:"🍶", bin:"plastic" },
  { id:2,  label:"Newspaper",       emoji:"📰", bin:"paper"   },
  { id:3,  label:"Glass Jar",       emoji:"🫙", bin:"glass"   },
  { id:4,  label:"Apple Core",      emoji:"🍎", bin:"organic" },
  { id:5,  label:"Old Phone",       emoji:"📱", bin:"ewaste"  },
  { id:6,  label:"Plastic Bag",     emoji:"🛍️", bin:"plastic" },
  { id:7,  label:"Cardboard Box",   emoji:"📦", bin:"paper"   },
  { id:8,  label:"Wine Bottle",     emoji:"🍾", bin:"glass"   },
  { id:9,  label:"Banana Peel",     emoji:"🍌", bin:"organic" },
  { id:10, label:"Old Battery",     emoji:"🔋", bin:"ewaste"  },
  { id:11, label:"Yogurt Cup",      emoji:"🥛", bin:"plastic" },
  { id:12, label:"Egg Carton",      emoji:"🥚", bin:"paper"   },
];

function shuffle(arr) {
  return [...arr].sort(() => Math.random() - 0.5);
}

export default function RecycleSorter({ onScore }) {
  const [items, setItems]         = useState(() => shuffle(ITEMS));
  const [current, setCurrent]     = useState(0);
  const [score, setScore]         = useState(0);
  const [feedback, setFeedback]   = useState(null); // "correct"|"wrong"
  const [done, setDone]           = useState(false);
  const [dragging, setDragging]   = useState(false);
  const [hoveredBin, setHoveredBin] = useState(null);
  const dragItem = useRef(null);

  const item = items[current];

  const attempt = (binId) => {
    if (feedback) return;
    const correct = binId === item.bin;
    const newScore = correct ? score + 10 : score;
    setFeedback(correct ? "correct" : "wrong");
    if (correct) setScore(newScore);
    setTimeout(() => {
      setFeedback(null);
      setHoveredBin(null);
      if (current + 1 >= items.length) {
        setDone(true);
        onScore?.(newScore);
      } else {
        setCurrent(c => c + 1);
      }
    }, 900);
  };

  const restart = () => {
    setItems(shuffle(ITEMS));
    setCurrent(0);
    setScore(0);
    setFeedback(null);
    setDone(false);
  };

  // Drag handlers
  const onDragStart = (e) => { dragItem.current = item; setDragging(true); e.dataTransfer.effectAllowed = "move"; };
  const onDragEnd   = ()  => { setDragging(false); dragItem.current = null; };
  const onDragOver  = (e, binId) => { e.preventDefault(); setHoveredBin(binId); };
  const onDrop      = (e, binId) => { e.preventDefault(); setDragging(false); attempt(binId); };

  if (done) return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="text-6xl mb-4">🎉</div>
      <h3 style={{ fontFamily:"'Fredoka One',cursive", fontSize:"2rem", color:"#1b5e20" }}>
        You scored {score}/{items.length * 10}!
      </h3>
      <p className="text-gray-500 mt-2 mb-6">
        {score === items.length * 10 ? "Perfect recycler! 🌍" : score >= items.length * 6 ? "Great job! Keep sorting! ♻️" : "Keep practising! 💪"}
      </p>
      <button onClick={restart} style={{ background:"linear-gradient(135deg,#43a047,#2e7d32)", color:"#fff", border:"none", borderRadius:"16px", padding:"12px 32px", fontFamily:"'Fredoka One',cursive", fontSize:"1.1rem", cursor:"pointer" }}>
        Play Again 🔄
      </button>
    </div>
  );

  return (
    <div style={{ fontFamily:"'Nunito',sans-serif" }}>
      {/* Header */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"16px" }}>
        <div>
          <span style={{ fontSize:"0.85rem", color:"#6b7280" }}>Item {current + 1} of {items.length}</span>
          <div style={{ width:"180px", height:"8px", background:"#e5e7eb", borderRadius:"4px", marginTop:"4px" }}>
            <div style={{ width:`${((current)/items.length)*100}%`, height:"100%", background:"linear-gradient(90deg,#43a047,#66bb6a)", borderRadius:"4px", transition:"width 0.4s" }} />
          </div>
        </div>
        <div style={{ background:"#fef3c7", border:"2px solid #f59e0b", borderRadius:"12px", padding:"6px 16px", fontFamily:"'Fredoka One',cursive", color:"#92400e", fontSize:"1.1rem" }}>
          ⭐ {score} pts
        </div>
      </div>

      {/* Draggable item */}
      <div style={{ display:"flex", justifyContent:"center", marginBottom:"28px" }}>
        <div
          draggable
          onDragStart={onDragStart}
          onDragEnd={onDragEnd}
          style={{
            background: feedback === "correct" ? "#d1fae5" : feedback === "wrong" ? "#fee2e2" : "#fff",
            border: `3px solid ${feedback === "correct" ? "#10b981" : feedback === "wrong" ? "#ef4444" : "#e5e7eb"}`,
            borderRadius:"20px", padding:"24px 40px", textAlign:"center",
            cursor: dragging ? "grabbing" : "grab",
            transform: dragging ? "scale(1.06) rotate(-2deg)" : "scale(1)",
            transition: "all 0.2s",
            boxShadow: dragging ? "0 12px 32px rgba(0,0,0,0.18)" : "0 4px 12px rgba(0,0,0,0.08)",
            userSelect:"none",
          }}
        >
          <div style={{ fontSize:"3.5rem", marginBottom:"8px" }}>{item?.emoji}</div>
          <div style={{ fontFamily:"'Fredoka One',cursive", fontSize:"1.2rem", color:"#1f2937" }}>{item?.label}</div>
          <div style={{ fontSize:"0.75rem", color:"#9ca3af", marginTop:"4px" }}>
            {dragging ? "Drop into the right bin!" : "Drag me or tap a bin ↓"}
          </div>
        </div>
      </div>

      {/* Feedback */}
      {feedback && (
        <div style={{ textAlign:"center", marginBottom:"12px", fontSize:"1.2rem", fontFamily:"'Fredoka One',cursive", color: feedback==="correct"?"#065f46":"#991b1b", animation:"fadeIn 0.3s ease" }}>
          {feedback === "correct" ? "✅ Correct! +10 pts" : "❌ Oops! Try the next one"}
        </div>
      )}

      {/* Bins */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(110px,1fr))", gap:"10px" }}>
        {BINS.map(bin => (
          <div
            key={bin.id}
            onClick={() => attempt(bin.id)}
            onDragOver={e => onDragOver(e, bin.id)}
            onDragLeave={() => setHoveredBin(null)}
            onDrop={e => onDrop(e, bin.id)}
            style={{
              background: hoveredBin === bin.id ? bin.bg : "#f9fafb",
              border: `2.5px solid ${hoveredBin === bin.id ? bin.border : "#e5e7eb"}`,
              borderRadius:"16px", padding:"16px 8px", textAlign:"center",
              cursor:"pointer", transition:"all 0.2s",
              transform: hoveredBin === bin.id ? "scale(1.06) translateY(-4px)" : "scale(1)",
              boxShadow: hoveredBin === bin.id ? `0 8px 20px ${bin.color}44` : "none",
            }}
          >
            <div style={{ fontSize:"2rem" }}>{bin.emoji}</div>
            <div style={{ fontFamily:"'Fredoka One',cursive", fontSize:"0.85rem", color:"#374151", marginTop:"4px" }}>{bin.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}