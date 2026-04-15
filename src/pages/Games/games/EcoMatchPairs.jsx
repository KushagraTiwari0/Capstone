import { useState, useEffect } from "react";

const PAIRS = [
  { id:1,  emoji:"🌳", match:"🌿", label:"Tree",    matchLabel:"Leaf"      },
  { id:2,  emoji:"☀️", match:"⚡", label:"Sun",     matchLabel:"Solar"     },
  { id:3,  emoji:"💧", match:"🐟", label:"Water",   matchLabel:"Fish"      },
  { id:4,  emoji:"♻️", match:"🗑️", label:"Recycle", matchLabel:"Bin"       },
  { id:5,  emoji:"🌍", match:"🛡️", label:"Earth",   matchLabel:"Protect"   },
  { id:6,  emoji:"🌱", match:"🌻", label:"Seed",    matchLabel:"Flower"    },
  { id:7,  emoji:"🐝", match:"🍯", label:"Bee",     matchLabel:"Honey"     },
  { id:8,  emoji:"🌬️", match:"🏭", label:"Wind",    matchLabel:"Factory"   },
];

function buildCards(pairs) {
  const all = pairs.flatMap(p => [
    { id:`${p.id}a`, pairId:p.id, emoji:p.emoji,      label:p.label      },
    { id:`${p.id}b`, pairId:p.id, emoji:p.match,      label:p.matchLabel },
  ]);
  return all.sort(() => Math.random() - 0.5);
}

export default function EcoMatchPairs({ onScore }) {
  const [cards, setCards]       = useState(() => buildCards(PAIRS));
  const [flipped, setFlipped]   = useState([]);
  const [matched, setMatched]   = useState(new Set());
  const [moves, setMoves]       = useState(0);
  const [done, setDone]         = useState(false);
  const [wrong, setWrong]       = useState([]);

  useEffect(() => {
    if (flipped.length < 2) return;
    const [a, b] = flipped;
    const ca = cards.find(c => c.id === a);
    const cb = cards.find(c => c.id === b);
    if (ca.pairId === cb.pairId) {
      const nm = new Set([...matched, ca.pairId]);
      setMatched(nm);
      setFlipped([]);
      if (nm.size === PAIRS.length) {
        setDone(true);
        onScore?.(Math.max(20, 300 - moves * 5));
      }
    } else {
      setWrong([a, b]);
      setTimeout(() => { setFlipped([]); setWrong([]); }, 900);
    }
  }, [flipped]);

  const flip = (id) => {
    if (flipped.length >= 2) return;
    const card = cards.find(c => c.id === id);
    if (matched.has(card.pairId)) return;
    if (flipped.includes(id)) return;
    const nf = [...flipped, id];
    setFlipped(nf);
    if (nf.length === 2) setMoves(m => m + 1);
  };

  const restart = () => {
    setCards(buildCards(PAIRS));
    setFlipped([]);
    setMatched(new Set());
    setMoves(0);
    setDone(false);
    setWrong([]);
  };

  return (
    <div style={{ fontFamily:"'Nunito',sans-serif" }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"16px" }}>
        <div style={{ display:"flex", gap:"10px" }}>
          <div style={{ background:"#dbeafe", border:"2px solid #3b82f6", borderRadius:"12px", padding:"6px 14px", fontFamily:"'Fredoka One',cursive", color:"#1e40af" }}>
            🔄 {moves} pairs tried
          </div>
          <div style={{ background:"#d1fae5", border:"2px solid #10b981", borderRadius:"12px", padding:"6px 14px", fontFamily:"'Fredoka One',cursive", color:"#065f46" }}>
            ✅ {matched.size}/{PAIRS.length} matched
          </div>
        </div>
        <button onClick={restart} style={{ background:"#f9fafb", border:"2px solid #e5e7eb", borderRadius:"10px", padding:"6px 12px", cursor:"pointer", fontFamily:"'Fredoka One',cursive", color:"#374151" }}>
          🔄 Restart
        </button>
      </div>

      {done && (
        <div style={{ background:"#d1fae5", border:"2px solid #10b981", borderRadius:"16px", padding:"14px", textAlign:"center", marginBottom:"14px" }}>
          <div style={{ fontSize:"2rem" }}>🎉</div>
          <div style={{ fontFamily:"'Fredoka One',cursive", fontSize:"1.3rem", color:"#065f46" }}>
            All matched! Score: {Math.max(20, 300 - moves * 5)} pts
          </div>
          <button onClick={restart} style={{ marginTop:"10px", background:"linear-gradient(135deg,#43a047,#2e7d32)", color:"#fff", border:"none", borderRadius:"12px", padding:"10px 24px", fontFamily:"'Fredoka One',cursive", cursor:"pointer" }}>
            Play Again 🌱
          </button>
        </div>
      )}

      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:"8px" }}>
        {cards.map(card => {
          const isFlipped  = flipped.includes(card.id) || matched.has(card.pairId);
          const isMatched  = matched.has(card.pairId);
          const isWrong    = wrong.includes(card.id);
          return (
            <div
              key={card.id}
              onClick={() => !isFlipped && flip(card.id)}
              style={{
                aspectRatio:"1",
                borderRadius:"14px",
                border:`2.5px solid ${isMatched?"#10b981":isWrong?"#ef4444":isFlipped?"#60a5fa":"#e5e7eb"}`,
                background: isMatched?"linear-gradient(135deg,#d1fae5,#a7f3d0)":isWrong?"#fee2e2":isFlipped?"#dbeafe":"linear-gradient(135deg,#1b5e20,#2e7d32)",
                display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center",
                cursor: isFlipped ? "default" : "pointer",
                transition:"all 0.25s",
                transform: isFlipped ? "scale(1)" : "scale(1)",
                boxShadow: isMatched ? "0 4px 12px rgba(16,185,129,0.3)" : "0 2px 8px rgba(0,0,0,0.08)",
                userSelect:"none",
              }}
            >
              {isFlipped ? (
                <>
                  <span style={{ fontSize:"2rem" }}>{card.emoji}</span>
                  <span style={{ fontSize:"0.65rem", color:isMatched?"#065f46":"#374151", fontWeight:"700", marginTop:"2px" }}>{card.label}</span>
                </>
              ) : (
                <span style={{ fontSize:"1.8rem" }}>🌿</span>
              )}
            </div>
          );
        })}
      </div>
      <p style={{ textAlign:"center", marginTop:"10px", fontSize:"0.8rem", color:"#9ca3af" }}>
        Find matching eco pairs! Click cards to reveal them.
      </p>
    </div>
  );
}