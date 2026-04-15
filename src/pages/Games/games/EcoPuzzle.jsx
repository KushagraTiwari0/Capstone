import { useState, useEffect } from "react";

// 4x4 sliding puzzle with an eco image made of emojis
const SIZE = 4;
const SOLVED = Array.from({ length: SIZE * SIZE - 1 }, (_, i) => i + 1).concat(0);

const TILE_EMOJIS = {
  1:"🌳", 2:"🌿", 3:"🌍", 4:"☀️",
  5:"💧", 6:"🌱", 7:"🦋", 8:"🐝",
  9:"🌸", 10:"🍀", 11:"🌊", 12:"🦜",
  13:"🌻", 14:"🐢", 15:"🌈", 0:""
};

function isSolved(tiles) {
  return tiles.every((v, i) => v === SOLVED[i]);
}

function shuffle(arr) {
  const a = [...arr];
  // 1. Randomly shuffle the array
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }

  // 2. Count inversions (ignoring the blank space)
  const nonZero = a.filter(x => x !== 0);
  let inv = 0;
  for (let i = 0; i < nonZero.length; i++) {
    for (let j = i + 1; j < nonZero.length; j++) {
      if (nonZero[i] > nonZero[j]) inv++;
    }
  }

  // 3. Check if it is currently solvable
  const zeroRow = Math.floor(a.indexOf(0) / SIZE);
  // For even-sized grids (like 4x4), the sum of inversions and the row of the blank must be odd
  const solvable = SIZE % 2 === 0
    ? (inv + zeroRow) % 2 !== 0 
    : inv % 2 === 0;

  // 4. If it's unsolvable, swap two adjacent non-blank tiles to fix it
  if (!solvable) {
    if (a[0] !== 0 && a[1] !== 0) {
      [a[0], a[1]] = [a[1], a[0]];
    } else {
      [a[2], a[3]] = [a[3], a[2]];
    }
  }
  
  return a;
}

function getNeighbors(idx) {
  const row = Math.floor(idx / SIZE), col = idx % SIZE;
  const n = [];
  if (row > 0)        n.push(idx - SIZE);
  if (row < SIZE - 1) n.push(idx + SIZE);
  if (col > 0)        n.push(idx - 1);
  if (col < SIZE - 1) n.push(idx + 1);
  return n;
}

export default function EcoPuzzle({ onScore }) {
  const [tiles, setTiles]     = useState(() => shuffle(SOLVED));
  const [moves, setMoves]     = useState(0);
  const [solved, setSolved]   = useState(false);
  const [time, setTime]       = useState(0);
  const [running, setRunning] = useState(false);
  const [showHint, setShowHint] = useState(false);

  useEffect(() => {
    if (!running) return;
    const t = setInterval(() => setTime(s => s + 1), 1000);
    return () => clearInterval(t);
  }, [running]);

  const move = (idx) => {
    if (solved) return;
    const zeroIdx = tiles.indexOf(0);
    if (!getNeighbors(idx).includes(zeroIdx)) return;
    const next = [...tiles];
    [next[idx], next[zeroIdx]] = [next[zeroIdx], next[idx]];
    setTiles(next);
    const m = moves + 1;
    setMoves(m);
    if (!running) setRunning(true);
    if (isSolved(next)) {
      setSolved(true);
      setRunning(false);
      const pts = Math.max(10, 200 - m * 2 - Math.floor(time / 5));
      onScore?.(pts);
    }
  };

  const restart = () => {
    setTiles(shuffle(SOLVED));
    setMoves(0);
    setSolved(false);
    setTime(0);
    setRunning(false);
    setShowHint(false);
  };

  const fmt = (s) => `${String(Math.floor(s/60)).padStart(2,"0")}:${String(s%60).padStart(2,"0")}`;

  return (
    <div style={{ fontFamily:"'Nunito',sans-serif" }}>
      {/* Header */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"16px" }}>
        <div style={{ display:"flex", gap:"12px" }}>
          <div style={{ background:"#dbeafe", border:"2px solid #3b82f6", borderRadius:"12px", padding:"6px 14px", fontFamily:"'Fredoka One',cursive", color:"#1e40af" }}>
            🔢 {moves} moves
          </div>
          <div style={{ background:"#fef3c7", border:"2px solid #f59e0b", borderRadius:"12px", padding:"6px 14px", fontFamily:"'Fredoka One',cursive", color:"#92400e" }}>
            ⏱ {fmt(time)}
          </div>
        </div>
        <div style={{ display:"flex", gap:"8px" }}>
          <button onClick={() => setShowHint(h=>!h)} style={{ background:showHint?"#e0f2f1":"#f9fafb", border:"2px solid #10b981", borderRadius:"10px", padding:"6px 12px", cursor:"pointer", fontSize:"0.8rem", fontWeight:"700", color:"#065f46" }}>
            {showHint ? "🙈 Hide" : "💡 Hint"}
          </button>
          <button onClick={restart} style={{ background:"#f9fafb", border:"2px solid #e5e7eb", borderRadius:"10px", padding:"6px 12px", cursor:"pointer", fontSize:"0.8rem", fontWeight:"700", color:"#374151" }}>
            🔄 Restart
          </button>
        </div>
      </div>

      {solved && (
        <div style={{ textAlign:"center", background:"#d1fae5", border:"2px solid #10b981", borderRadius:"16px", padding:"16px", marginBottom:"16px" }}>
          <div style={{ fontSize:"2.5rem" }}>🎉</div>
          <div style={{ fontFamily:"'Fredoka One',cursive", fontSize:"1.4rem", color:"#065f46" }}>
            Puzzle Solved! {moves} moves · {fmt(time)}
          </div>
          <div style={{ color:"#6b7280", fontSize:"0.9rem", marginTop:"4px" }}>
            Score: {Math.max(10, 200 - moves * 2 - Math.floor(time/5))} pts
          </div>
        </div>
      )}

      {/* Hint */}
      {showHint && (
        <div style={{ background:"#fffbeb", border:"2px dashed #f59e0b", borderRadius:"12px", padding:"10px 16px", marginBottom:"12px", fontSize:"0.82rem", color:"#92400e" }}>
          💡 Move tiles adjacent to the blank space. Numbers go 1→15 left-to-right, top-to-bottom. Blank is bottom-right!
        </div>
      )}

      {/* Grid */}
      <div style={{ display:"grid", gridTemplateColumns:`repeat(${SIZE},1fr)`, gap:"6px", maxWidth:"320px", margin:"0 auto" }}>
        {tiles.map((val, idx) => (
          <div
            key={idx}
            onClick={() => move(idx)}
            style={{
              aspectRatio:"1",
              background: val === 0 ? "transparent" :
                isSolved(tiles) && val !== 0 ? "linear-gradient(135deg,#a7f3d0,#6ee7b7)" : "#fff",
              border: val === 0 ? "2px dashed #d1d5db" : "2px solid #e5e7eb",
              borderRadius:"12px",
              display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center",
              cursor: val === 0 ? "default" : getNeighbors(idx).includes(tiles.indexOf(0)) ? "pointer" : "default",
              transition:"all 0.15s",
              transform: getNeighbors(idx).includes(tiles.indexOf(0)) && val !== 0 ? "scale(1.03)" : "scale(1)",
              boxShadow: val === 0 ? "none" : "0 2px 8px rgba(0,0,0,0.07)",
              opacity: val === 0 ? 0 : 1,
            }}
          >
            {val !== 0 && (
              <>
                <span style={{ fontSize:"1.6rem", lineHeight:1 }}>{TILE_EMOJIS[val]}</span>
                <span style={{ fontSize:"0.65rem", color:"#9ca3af", fontWeight:"700", marginTop:"2px" }}>{val}</span>
              </>
            )}
          </div>
        ))}
      </div>

      <p style={{ textAlign:"center", marginTop:"12px", fontSize:"0.8rem", color:"#9ca3af" }}>
        Tap tiles next to the blank space to move them
      </p>
    </div>
  );
}