"use client";

const PIECES = [
  { left: "5%",  delay: "0s",    duration: "6s",  color: "#F06060", shape: "rect",    size: 10 },
  { left: "10%", delay: "0.5s",  duration: "7s",  color: "#9B91BE", shape: "circle",  size: 8  },
  { left: "18%", delay: "1s",    duration: "5.5s", color: "#FFD166", shape: "rect",   size: 12 },
  { left: "25%", delay: "1.5s",  duration: "8s",  color: "#06D6A0", shape: "circle",  size: 7  },
  { left: "33%", delay: "0.3s",  duration: "6.5s", color: "#F06060", shape: "ribbon", size: 9  },
  { left: "40%", delay: "2s",    duration: "7s",  color: "#9B91BE", shape: "rect",    size: 11 },
  { left: "48%", delay: "0.8s",  duration: "5s",  color: "#FFD166", shape: "circle",  size: 8  },
  { left: "55%", delay: "1.2s",  duration: "8.5s", color: "#06D6A0", shape: "rect",   size: 10 },
  { left: "63%", delay: "0.1s",  duration: "6s",  color: "#F06060", shape: "circle",  size: 9  },
  { left: "70%", delay: "1.8s",  duration: "7.5s", color: "#FFD166", shape: "ribbon", size: 8  },
  { left: "78%", delay: "0.6s",  duration: "6s",  color: "#9B91BE", shape: "rect",    size: 12 },
  { left: "85%", delay: "1.4s",  duration: "5.5s", color: "#06D6A0", shape: "circle", size: 7  },
  { left: "92%", delay: "0.9s",  duration: "7s",  color: "#F06060", shape: "rect",    size: 10 },
  { left: "15%", delay: "3s",    duration: "6.5s", color: "#FFD166", shape: "circle", size: 8  },
  { left: "58%", delay: "2.5s",  duration: "7s",  color: "#9B91BE", shape: "ribbon",  size: 9  },
  { left: "88%", delay: "3.5s",  duration: "5.5s", color: "#06D6A0", shape: "rect",   size: 11 },
];

const BALLOONS = [
  { left: "8%",  delay: "0s",   duration: "12s", color: "#F06060" },
  { left: "22%", delay: "2s",   duration: "15s", color: "#9B91BE" },
  { left: "75%", delay: "1s",   duration: "13s", color: "#FFD166" },
  { left: "90%", delay: "3s",   duration: "14s", color: "#06D6A0" },
];

export default function Confetti() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      <style>{`
        @keyframes confetti-fall {
          0%   { transform: translateY(-20px) rotate(0deg);   opacity: 1; }
          100% { transform: translateY(110vh) rotate(720deg); opacity: 0.3; }
        }
        @keyframes balloon-rise {
          0%   { transform: translateY(110%) rotate(-5deg); opacity: 0; }
          10%  { opacity: 0.7; }
          90%  { opacity: 0.5; }
          100% { transform: translateY(-20%) rotate(5deg);  opacity: 0; }
        }
        @keyframes balloon-sway {
          0%, 100% { transform: translateX(0px)  rotate(-5deg); }
          50%       { transform: translateX(12px) rotate(5deg);  }
        }
        .confetti-piece { position: absolute; top: -20px; animation: confetti-fall linear infinite; }
        .balloon        { position: absolute; bottom: -80px; animation: balloon-rise ease-in-out infinite; }
        .balloon-body   { animation: balloon-sway 3s ease-in-out infinite; }
      `}</style>

      {PIECES.map((p, i) => (
        <div
          key={i}
          className="confetti-piece"
          style={{ left: p.left, animationDelay: p.delay, animationDuration: p.duration }}
        >
          {p.shape === "circle" && (
            <div style={{ width: p.size, height: p.size, borderRadius: "50%", background: p.color, opacity: 0.85 }} />
          )}
          {p.shape === "rect" && (
            <div style={{ width: p.size, height: p.size * 0.6, background: p.color, opacity: 0.85 }} />
          )}
          {p.shape === "ribbon" && (
            <div style={{ width: p.size * 0.4, height: p.size * 1.5, background: p.color, borderRadius: 2, opacity: 0.85 }} />
          )}
        </div>
      ))}

      {BALLOONS.map((b, i) => (
        <div
          key={i}
          className="balloon"
          style={{ left: b.left, animationDelay: b.delay, animationDuration: b.duration }}
        >
          <div className="balloon-body" style={{ animationDelay: b.delay }}>
            <svg width="36" height="48" viewBox="0 0 36 48" fill="none">
              <ellipse cx="18" cy="20" rx="16" ry="18" fill={b.color} opacity="0.75" />
              <path d="M18 38 Q20 43 18 48" stroke={b.color} strokeWidth="1.5" fill="none" opacity="0.6" />
            </svg>
          </div>
        </div>
      ))}
    </div>
  );
}
