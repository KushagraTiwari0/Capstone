import { useState, useCallback } from "react";

const GRID_W = 8, GRID_H = 6;

// Added dedicated source/sink types so they function logically in the flood fill
const PIPE_TYPES = {
  empty:    { emoji: "⬜" },
  straight: { emoji: "━" },
  turn:     { emoji: "┗" },
  tee:      { emoji: "┳" },
  cross:    { emoji: "╋" },
  source:   { emoji: "💧" },
  sink:     { emoji: "🌱" }
};

const OPPOSITE = { left:"right", right:"left", top:"bottom", bottom:"top" };

const PIPE_ROTATIONS = {
  straight: [["left","right"], ["top","bottom"]],
  turn:     [["top","right"], ["right","bottom"], ["bottom","left"], ["left","top"]],
  tee:      [["left","right","bottom"], ["left","top","right"], ["top","right","bottom"], ["left","top","bottom"]],
  cross:    [["left","right","top","bottom"]],
  source:   [["right"]], // Source always pushes water to the right
  sink:     [["left","top","bottom","right"]] // Sink accepts water from any adjacent side
};

// Map logical rotations to Heavy Box Drawing characters
const PIPE_DISPLAY = {
  straight: (rot) => rot % 2 === 0 ? "━" : "┃",
  turn:     (rot) => ["┗","┏","┓","┛"][rot % 4],
  tee:      (rot) => ["┳","┻","┣","┫"][rot % 4],
  cross:    ()    => "╋",
  source:   ()    => "💧",
  sink:     ()    => "🌱"
};

function makeGrid() {
  // Weighted to have more branches, making random boards more connected/fun
  const weightedTypes = ["straight", "turn", "turn", "tee", "tee", "tee", "cross"];
  const grid = Array.from({ length: GRID_H }, () =>
    Array.from({ length: GRID_W }, () => ({
      type: weightedTypes[Math.floor(Math.random() * weightedTypes.length)],
      rotation: Math.floor(Math.random() * 4),
      water: false,
    }))
  );

  const SRC_R = Math.floor(GRID_H / 2), SRC_C = 0;
  const SNK_R = Math.floor(GRID_H / 2), SNK_C = GRID_W - 1;

  // LOGIC FIX: Carve a guaranteed solvable path using "tee" pipes.
  // Because a tee connects 3 out of 4 directions, it can always be rotated to connect ANY 2 sides.
  let r = SRC_R;
  for (let c = 1; c < GRID_W - 1; c++) {
    grid[r][c] = { type: "tee", rotation: Math.floor(Math.random() * 4) };
    
    // Randomly shift the guaranteed path up or down
    if (Math.random() > 0.5) {
      let nextR = r + (Math.random() > 0.5 ? 1 : -1);
      if (nextR > 0 && nextR < GRID_H - 1) { // Keep away from extreme edges
        grid[nextR][c] = { type: "tee", rotation: Math.floor(Math.random() * 4) };
        r = nextR;
      }
    }
  }
  // Ensure the final step connects cleanly
  grid[r][GRID_W - 2] = { type: "tee", rotation: Math.floor(Math.random() * 4) };

  // Set the structural Source and Sink
  grid[SRC_R][SRC_C] = { type: "source", rotation: 0 };
  grid[SNK_R][SNK_C] = { type: "sink", rotation: 0 };

  return grid;
}

function getConnects(cell) {
  if (!cell || cell.type === "empty") return [];
  const rots = PIPE_ROTATIONS[cell.type];
  return rots ? rots[cell.rotation % rots.length] : [];
}

function floodFill(grid, startR, startC) {
  const visited = Array.from({ length: GRID_H }, () => Array(GRID_W).fill(false));
  const queue = [[startR, startC]];
  visited[startR][startC] = true;
  
  while (queue.length) {
    const [r, c] = queue.shift();
    const cell = grid[r]?.[c];
    if (!cell) continue;
    
    const conns = getConnects(cell);
    const dirs = { left:[0,-1], right:[0,1], top:[-1,0], bottom:[1,0] };
    
    for (const dir of conns) {
      const [dr, dc] = dirs[dir];
      const nr = r + dr, nc = c + dc;
      if (nr < 0 || nr >= GRID_H || nc < 0 || nc >= GRID_W) continue;
      if (visited[nr][nc]) continue;
      
      const neighbor = grid[nr]?.[nc];
      if (!neighbor) continue;
      
      if (getConnects(neighbor).includes(OPPOSITE[dir])) {
        visited[nr][nc] = true;
        queue.push([nr, nc]);
      }
    }
  }
  return visited;
}

export default function WaterSaver({ onScore }) {
  const [grid, setGrid]       = useState(makeGrid);
  const [water, setWater]     = useState(Array.from({length:GRID_H},()=>Array(GRID_W).fill(false)));
  const [flowing, setFlowing] = useState(false);
  const [reached, setReached] = useState(false);
  const [moves, setMoves]     = useState(0);
  const [score, setScore]     = useState(0);

  const SRC_R = Math.floor(GRID_H / 2), SRC_C = 0;
  const SNK_R = Math.floor(GRID_H / 2), SNK_C = GRID_W - 1;

  const rotate = (r, c) => {
    if (flowing) return;
    setGrid(g => {
      const next = g.map(row => row.map(cell => ({...cell})));
      const cell = next[r][c];
      const rots = PIPE_ROTATIONS[cell.type];
      if (rots) cell.rotation = (cell.rotation + 1) % rots.length;
      return next;
    });
    setMoves(m => m + 1);
    setWater(Array.from({length:GRID_H},()=>Array(GRID_W).fill(false))); // Clear water on move
    setReached(false);
  };

  const flow = useCallback(() => {
    setFlowing(true);
    const visited = floodFill(grid, SRC_R, SRC_C);
    setWater(visited);
    const hasReached = visited[SNK_R][SNK_C];
    setReached(hasReached);
    setFlowing(false);
    
    if (hasReached) {
      const pts = Math.max(10, 150 - moves * 3);
      setScore(pts);
      onScore?.(pts);
    }
  }, [grid, moves, SRC_R, SRC_C, SNK_R, SNK_C, onScore]);

  const restart = () => {
    setGrid(makeGrid());
    setWater(Array.from({length:GRID_H},()=>Array(GRID_W).fill(false)));
    setFlowing(false);
    setReached(false);
    setMoves(0);
    setScore(0);
  };

  return (
    <div style={{ fontFamily:"'Nunito',sans-serif", background:"#020617", color:"#e2e8f0", padding:"24px", borderRadius:"20px", maxWidth:"500px", margin:"0 auto", border:"1px solid #1e293b", boxShadow:"0 10px 25px rgba(0,0,0,0.5)" }}>
      {/* Header */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"20px" }}>
        <div style={{ display:"flex", gap:"10px" }}>
          <div style={{ background:"rgba(59, 130, 246, 0.15)", border:"2px solid #3b82f6", borderRadius:"12px", padding:"6px 14px", fontWeight:"bold", color:"#93c5fd" }}>
            🔧 {moves}
          </div>
          {score > 0 && (
            <div style={{ background:"rgba(16, 185, 129, 0.15)", border:"2px solid #10b981", borderRadius:"12px", padding:"6px 14px", fontWeight:"bold", color:"#6ee7b7" }}>
              ⭐ {score} pts
            </div>
          )}
        </div>
        <div style={{ display:"flex", gap:"8px" }}>
          <button onClick={flow} disabled={flowing} style={{ background:"linear-gradient(135deg, #0ea5e9, #2563eb)", color:"#fff", border:"none", borderRadius:"10px", padding:"8px 16px", cursor:"pointer", fontWeight:"bold", fontSize:"0.9rem", boxShadow:"0 4px 10px rgba(14, 165, 233, 0.3)" }}>
            💧 Flow
          </button>
          <button onClick={restart} style={{ background:"#1e293b", border:"2px solid #334155", borderRadius:"10px", padding:"8px 12px", cursor:"pointer", color:"#94a3b8" }}>
            🔄
          </button>
        </div>
      </div>

      {/* Messages */}
      {reached && (
        <div style={{ background:"rgba(16, 185, 129, 0.15)", border:"2px solid #10b981", borderRadius:"14px", padding:"12px", textAlign:"center", marginBottom:"16px", fontWeight:"bold", color:"#6ee7b7", textShadow:"0 0 10px rgba(16,185,129,0.5)" }}>
          🎉 Connection Established! +{score} pts
        </div>
      )}
      {water[SNK_R]?.[SNK_C] === false && moves > 0 && !reached && water.some(row => row.some(v => v)) && (
        <div style={{ background:"rgba(245, 158, 11, 0.15)", border:"2px solid #f59e0b", borderRadius:"14px", padding:"10px", textAlign:"center", marginBottom:"16px", fontWeight:"bold", color:"#fcd34d" }}>
          ⚠️ Leak detected! Adjust pipes and try again.
        </div>
      )}

      {/* Grid Container */}
      <div style={{ overflowX:"auto", display:"flex", justifyContent:"center" }}>
        <div style={{ 
          display:"inline-grid", 
          gridTemplateColumns:`repeat(${GRID_W},1fr)`, 
          gap:"4px", 
          background:"#0f172a", 
          padding:"12px", 
          borderRadius:"16px", 
          border:"2px solid #1e293b",
          boxShadow: "inset 0 4px 6px rgba(0,0,0,0.5)" 
        }}>
          {grid.map((row, r) => row.map((cell, c) => {
            const isSrc = cell.type === "source";
            const isSnk = cell.type === "sink";
            const isWet = water[r]?.[c];
            const disp  = PIPE_DISPLAY[cell.type]?.(cell.rotation) ?? "?";
            
            return (
              <div
                key={`${r}-${c}`}
                onClick={() => !isSrc && !isSnk && rotate(r, c)}
                title={isSrc ? "Source" : isSnk ? "Plant" : "Click to rotate"}
                style={{
                  width:"46px", height:"46px",
                  background: isSrc ? "rgba(245, 158, 11, 0.1)" : isSnk ? "rgba(16, 185, 129, 0.1)" : "transparent",
                  border: `2px solid ${isSrc ? "#f59e0b" : isSnk ? "#10b981" : isWet ? "#0ea5e9" : "#334155"}`,
                  borderRadius:"8px",
                  display:"flex", alignItems:"center", justifyContent:"center",
                  cursor: isSrc || isSnk ? "default" : "pointer",
                  fontSize: isSrc || isSnk ? "1.4rem" : "2.2rem",
                  fontWeight:"900",
                  color: isWet ? "#38bdf8" : "#475569",
                  textShadow: isWet ? "0 0 12px #38bdf8, 0 0 20px #0ea5e9" : "none",
                  boxShadow: isWet ? "inset 0 0 10px rgba(14, 165, 233, 0.25)" : "none",
                  transition:"all 0.25s ease-in-out",
                  userSelect:"none",
                  lineHeight: 1
                }}
              >
                {disp}
              </div>
            );
          }))}
        </div>
      </div>

      {/* Legend */}
      <div style={{ display:"flex", justifyContent:"center", gap:"16px", marginTop:"16px", fontSize:"0.85rem", color:"#64748b" }}>
        <div style={{ display:"flex", alignItems:"center", gap:"6px" }}>
          <span style={{ border:"2px solid #f59e0b", padding:"2px 6px", borderRadius:"6px" }}>💧</span> Source
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:"6px" }}>
          <span style={{ border:"2px solid #10b981", padding:"2px 6px", borderRadius:"6px" }}>🌱</span> Plant
        </div>
      </div>
    </div>
  );
}