import React, { useRef, useEffect } from 'react';
import { audioEngine } from '../services/audioEngine';
import { CuePoint } from '../types';

interface WaveformDisplayProps {
  currentTime: number;
  duration: number;
  bpm: number;
  cuePoints: CuePoint[];
  isLooping: boolean;
  loopInTime: number;
  loopOutTime: number;
  onSeek: (seconds: number) => void;
}

export const WaveformDisplay: React.FC<WaveformDisplayProps> = ({
  currentTime,
  duration,
  bpm,
  cuePoints,
  isLooping,
  loopInTime,
  loopOutTime,
  onSeek,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Real-time canvas waveform and visualizer animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    const freqData = new Uint8Array(64);

    const render = () => {
      // Fetch live audio analyser frequency data
      audioEngine.getFrequencyData(freqData);

      const width = canvas.width;
      const height = canvas.height;

      ctx.clearRect(0, 0, width, height);

      // 1. Background grid lines
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
      ctx.lineWidth = 1;
      const beatDuration = bpm ? 60 / bpm : 0.5;
      const totalBeats = duration > 0 ? duration / beatDuration : 64;
      const beatWidth = width / Math.max(1, totalBeats);

      for (let i = 0; i < totalBeats; i += 4) {
        const x = i * beatWidth;
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }

      // 2. Waveform bars representation
      const numBars = 120;
      const barWidth = width / numBars;
      const progressRatio = duration > 0 ? currentTime / duration : 0;
      const playheadX = progressRatio * width;

      for (let i = 0; i < numBars; i++) {
        const x = i * barWidth;
        const freqIdx = i % freqData.length;
        const liveAmp = freqData[freqIdx] / 255;

        // Static pseudo-waveform shape modulated by live audio
        const baseAmp = Math.sin((i / numBars) * Math.PI) * 0.5 + 0.3;
        const barHeight = Math.max(4, (baseAmp * 0.6 + liveAmp * 0.4) * (height * 0.8));

        const isPast = x <= playheadX;

        // Gradient coloring: cyan/blue past playhead, muted slate ahead
        if (isPast) {
          ctx.fillStyle = i % 4 === 0 ? '#06b6d4' : '#0891b2';
        } else {
          ctx.fillStyle = '#334155';
        }

        const y = (height - barHeight) / 2;
        ctx.fillRect(x, y, barWidth - 1, barHeight);
      }

      // 3. Highlight Auto-Loop Region
      if (isLooping && duration > 0 && loopOutTime > loopInTime) {
        const loopStartX = (loopInTime / duration) * width;
        const loopEndX = (loopOutTime / duration) * width;
        const loopW = Math.max(2, loopEndX - loopStartX);

        ctx.fillStyle = 'rgba(245, 158, 11, 0.25)';
        ctx.fillRect(loopStartX, 0, loopW, height);

        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 2;
        ctx.strokeRect(loopStartX, 0, loopW, height);

        // Loop flags
        ctx.fillStyle = '#f59e0b';
        ctx.font = 'bold 10px monospace';
        ctx.fillText('LOOP', loopStartX + 4, 12);
      }

      // 4. Hot Cue Markers on waveform
      cuePoints.forEach((cue) => {
        if (duration > 0) {
          const cueX = (cue.time / duration) * width;
          ctx.fillStyle = cue.color || '#10b981';
          ctx.fillRect(cueX - 1, 0, 3, height);

          // Cue flag tag
          ctx.beginPath();
          ctx.moveTo(cueX, 0);
          ctx.lineTo(cueX + 10, 0);
          ctx.lineTo(cueX, 10);
          ctx.fill();

          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 9px monospace';
          ctx.fillText(String(cue.id), cueX + 2, 8);
        }
      });

      // 5. Playhead Needle
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(playheadX - 1, 0, 2, height);

      // Playhead Top triangle
      ctx.beginPath();
      ctx.moveTo(playheadX - 6, 0);
      ctx.lineTo(playheadX + 6, 0);
      ctx.lineTo(playheadX, 8);
      ctx.fill();

      // Playhead Bottom triangle
      ctx.beginPath();
      ctx.moveTo(playheadX - 6, height);
      ctx.lineTo(playheadX + 6, height);
      ctx.lineTo(playheadX, height - 8);
      ctx.fill();

      animId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, [currentTime, duration, bpm, cuePoints, isLooping, loopInTime, loopOutTime]);

  const handleTimelineClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current || duration <= 0) return;
    const rect = containerRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const ratio = Math.max(0, Math.min(1, clickX / rect.width));
    onSeek(ratio * duration);
  };

  const formatSeconds = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = Math.floor(s % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="w-full bg-neutral-900/90 rounded-xl p-3 border border-neutral-800 shadow-lg">
      <div className="flex items-center justify-between text-[11px] font-mono text-neutral-400 mb-1.5">
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-cyan-400" />
          <span className="text-neutral-300 font-semibold">{formatSeconds(currentTime)}</span>
          <span className="text-neutral-500">/</span>
          <span>{formatSeconds(duration)}</span>
        </span>
        <span className="text-neutral-400">
          BEATGRID <span className="text-cyan-400 font-semibold">{bpm || 128} BPM</span>
        </span>
      </div>

      {/* Clickable Scrubber Waveform Container */}
      <div
        ref={containerRef}
        onClick={handleTimelineClick}
        className="relative w-full h-16 sm:h-20 bg-neutral-950 rounded-lg overflow-hidden cursor-pointer border border-neutral-800/80 shadow-inner group"
      >
        <canvas
          ref={canvasRef}
          width={600}
          height={80}
          className="w-full h-full block"
        />

        {/* Hover scrub hint */}
        <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity bg-cyan-500/5 flex items-center justify-center">
          <span className="text-[10px] font-mono text-cyan-300 bg-neutral-900/80 px-2 py-0.5 rounded border border-cyan-500/30">
            TAP TO NEEDLE DROP
          </span>
        </div>
      </div>
    </div>
  );
};
