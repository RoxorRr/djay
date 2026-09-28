import React, { useRef, useState, useEffect } from 'react';
import { Disc, Zap } from 'lucide-react';
import { DeckId } from '../types';

interface JogWheelProps {
  deckId: DeckId;
  isPlaying: boolean;
  bpm: number;
  pitchOffset: number; // in percent (-8 to +8)
  currentTime: number;
  duration: number;
  onScratch: (direction: number) => void;
  onNudge: (direction: number) => void;
}

export const JogWheel: React.FC<JogWheelProps> = ({
  deckId,
  isPlaying,
  bpm,
  pitchOffset,
  currentTime,
  duration,
  onScratch,
  onNudge,
}) => {
  const [rotation, setRotation] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const lastAngleRef = useRef<number>(0);
  const centerRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const wheelRef = useRef<HTMLDivElement>(null);

  // Effective BPM calculated with pitch offset
  const effectiveBpm = bpm ? (bpm * (1 + pitchOffset / 100)).toFixed(1) : '128.0';

  // Rotation animation when playing
  useEffect(() => {
    let animId: number;
    let lastTime = performance.now();

    const loop = (now: number) => {
      const delta = (now - lastTime) / 1000;
      lastTime = now;

      if (isPlaying && !isDragging) {
        // 33.3 RPM = 200 degrees per second roughly
        const speed = (Number(effectiveBpm) / 120) * 180;
        setRotation((prev) => (prev + speed * delta) % 360);
      }
      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [isPlaying, isDragging, effectiveBpm]);

  // Touch & Drag Handling for Scratching & Pitch Bend
  const handlePointerDown = (e: React.PointerEvent) => {
    if (!wheelRef.current) return;
    const rect = wheelRef.current.getBoundingClientRect();
    centerRef.current = {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
    };

    const angle = Math.atan2(e.clientY - centerRef.current.y, e.clientX - centerRef.current.x);
    lastAngleRef.current = angle;
    setIsDragging(true);
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    const currentAngle = Math.atan2(e.clientY - centerRef.current.y, e.clientX - centerRef.current.x);
    let diff = currentAngle - lastAngleRef.current;

    // Handle wrap around -PI to PI
    if (diff > Math.PI) diff -= Math.PI * 2;
    if (diff < -Math.PI) diff += Math.PI * 2;

    lastAngleRef.current = currentAngle;
    const degDiff = (diff * 180) / Math.PI;

    setRotation((prev) => (prev + degDiff) % 360);

    // Trigger scratch/nudge if movement is significant
    if (Math.abs(diff) > 0.02) {
      onScratch(diff * 2.5);
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (isDragging) {
      setIsDragging(false);
      try {
        (e.target as HTMLElement).releasePointerCapture(e.pointerId);
      } catch {
        // ignore
      }
    }
  };

  const formatTime = (secs: number) => {
    if (isNaN(secs) || secs < 0) secs = 0;
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    const ms = Math.floor((secs % 1) * 10);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}.${ms}`;
  };

  const remaining = Math.max(0, duration - currentTime);

  return (
    <div className="relative flex flex-col items-center justify-center p-3 sm:p-5 select-none">
      {/* Outer Metal Chassis Bezel */}
      <div className="relative w-64 h-64 sm:w-72 sm:h-72 rounded-full p-2 bg-gradient-to-b from-neutral-800 via-neutral-900 to-black shadow-2xl border-2 border-neutral-700/80">
        
        {/* Pitch Bend Outer Strobe Ring */}
        <div
          ref={wheelRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          className="relative w-full h-full rounded-full cursor-grab active:cursor-grabbing touch-none flex items-center justify-center overflow-hidden"
          style={{
            background:
              'radial-gradient(circle, #171717 30%, #0a0a0a 70%, #000000 100%)',
          }}
        >
          {/* Vinyl Grooves Texture */}
          <div
            className="absolute inset-1 rounded-full border border-neutral-800 pointer-events-none transition-transform duration-75"
            style={{
              transform: `rotate(${rotation}deg)`,
              backgroundImage: `repeating-radial-gradient(
                circle at 50% 50%,
                rgba(255, 255, 255, 0.03) 0,
                rgba(255, 255, 255, 0.03) 2px,
                rgba(0, 0, 0, 0.6) 3px,
                rgba(0, 0, 0, 0.6) 5px
              )`,
            }}
          >
            {/* Vinyl White Marker Needle Stripe */}
            <div className="absolute top-1 left-1/2 -translate-x-1/2 w-1.5 h-7 bg-white rounded-full shadow-lg shadow-white/50" />
            
            {/* Subtle Grooves reflections */}
            <div className="absolute inset-0 rounded-full opacity-20 pointer-events-none bg-gradient-to-tr from-transparent via-white/10 to-transparent" />
          </div>

          {/* Strobe Tick Dots on Edge */}
          <div className="absolute inset-2 rounded-full pointer-events-none border border-neutral-800/80 flex items-center justify-center">
            <div className="absolute top-0 w-2 h-1 bg-cyan-400/80 rounded-full shadow-sm shadow-cyan-400" />
            <div className="absolute bottom-0 w-2 h-1 bg-cyan-400/80 rounded-full shadow-sm shadow-cyan-400" />
            <div className="absolute left-0 w-1 h-2 bg-cyan-400/80 rounded-full shadow-sm shadow-cyan-400" />
            <div className="absolute right-0 w-1 h-2 bg-cyan-400/80 rounded-full shadow-sm shadow-cyan-400" />
          </div>

          {/* Center Digital LCD Display Hub */}
          <div
            className="relative z-10 w-28 h-28 sm:w-32 sm:h-32 rounded-full bg-neutral-950 border-2 border-neutral-700/80 shadow-inner flex flex-col items-center justify-center p-2 text-center pointer-events-none"
            style={{
              boxShadow: 'inset 0 2px 10px rgba(0,0,0,0.9), 0 0 15px rgba(0,0,0,0.8)',
            }}
          >
            {/* Deck Identifier */}
            <div className="flex items-center gap-1">
              <span
                className={`text-[10px] font-mono font-bold tracking-widest ${
                  deckId === 'DECK A' ? 'text-cyan-400' : 'text-amber-400'
                }`}
              >
                {deckId}
              </span>
              {isDragging && <Zap className="w-3 h-3 text-red-400 animate-bounce" />}
            </div>

            {/* BPM Display */}
            <div className="font-['Chakra_Petch',sans-serif] font-bold text-white text-lg sm:text-xl tracking-tight leading-none mt-0.5">
              {effectiveBpm}
              <span className="text-[10px] text-neutral-400 ml-1 font-mono font-normal">BPM</span>
            </div>

            {/* Pitch Percentage */}
            <div className="text-[10px] font-mono text-neutral-400 leading-none mt-0.5">
              {pitchOffset >= 0 ? `+${pitchOffset.toFixed(1)}%` : `${pitchOffset.toFixed(1)}%`}
            </div>

            {/* Remaining Time LCD */}
            <div className="mt-1 px-1.5 py-0.5 rounded bg-neutral-900 border border-neutral-800 text-[11px] font-mono text-cyan-300 tracking-wider">
              -{formatTime(remaining)}
            </div>

            {/* Play Indicator status */}
            <div className="flex items-center gap-1 mt-1">
              <div
                className={`w-1.5 h-1.5 rounded-full ${
                  isPlaying ? 'bg-emerald-400 animate-ping' : 'bg-neutral-600'
                }`}
              />
              <span className="text-[9px] font-mono text-neutral-400 uppercase">
                {isPlaying ? 'PLAYING' : 'PAUSED'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Tactile Scratch & Jog Touch Guidance */}
      <div className="flex items-center justify-between w-full max-w-xs mt-2 px-2 text-[11px] font-mono text-neutral-400">
        <button
          onClick={() => onNudge(-1)}
          className="px-2.5 py-1 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300 border border-neutral-700 active:scale-95 transition-transform"
        >
          ◀ NUDGE -
        </button>
        <span className="flex items-center gap-1 text-[10px] text-neutral-500">
          <Disc className="w-3 h-3 text-cyan-400" />
          <span>DRAG TO SCRATCH</span>
        </span>
        <button
          onClick={() => onNudge(1)}
          className="px-2.5 py-1 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300 border border-neutral-700 active:scale-95 transition-transform"
        >
          + NUDGE ▶
        </button>
      </div>
    </div>
  );
};
