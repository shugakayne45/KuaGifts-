/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Gift } from 'lucide-react';

interface SplashScreenProps {
  onComplete: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete }) => {
  const [progress, setProgress] = useState<number>(0);
  const [showConfetti, setShowConfetti] = useState<boolean>(false);
  const [isDone, setIsDone] = useState<boolean>(false);

  useEffect(() => {
    // 0s to 1.6s: Progress fills up smoothly
    const startTime = Date.now();
    const duration = 1600; // 1.6s

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min(100, Math.floor((elapsed / duration) * 100));
      setProgress(pct);

      if (elapsed >= duration) {
        clearInterval(interval);
        setShowConfetti(true);
        // After confetti burst & 1.05x scale, slide transition out
        setTimeout(() => {
          setIsDone(true);
          setTimeout(() => {
            onComplete();
          }, 550);
        }, 750);
      }
    }, 25);

    return () => clearInterval(interval);
  }, [onComplete]);

  // Generate deterministic particles for gold & emerald foil confetti burst
  const particles = Array.from({ length: 42 }).map((_, i) => {
    const angle = (i / 42) * 360;
    const distance = 100 + (i % 6) * 32;
    const rad = (angle * Math.PI) / 180;
    const x = Math.cos(rad) * distance;
    const y = Math.sin(rad) * distance;
    const isGold = i % 3 === 0;
    const isEmerald = i % 3 === 1;
    const isSquare = i % 2 === 0;

    return { id: i, x, y, isGold, isEmerald, isSquare };
  });

  return (
    <AnimatePresence>
      {!isDone && (
        <motion.div
          id="kuagifts-splash-screen"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 0.98, y: -20 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-between py-12 px-6 bg-[#FFFFFF] text-[#0F1C13] select-none overflow-hidden"
        >
          {/* Subtle Festive Watermarks (Gift Boxes, Snowflakes, Floating Ambient Dots) */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden select-none">
            {/* Top-Right Large Gift Box Watermark */}
            <div className="absolute -top-6 -right-6 opacity-[0.07] rotate-12 text-[#006837]">
              <svg width="220" height="220" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
                <rect x="3" y="8" width="18" height="13" rx="2"/>
                <path d="M12 8v13"/>
                <path d="M19 8H5"/>
                <path d="M12 8a3 3 0 1 0-3-3c2 0 3 3 3 3z"/>
                <path d="M12 8a3 3 0 1 1 3-3c-2 0-3 3-3 3z"/>
              </svg>
            </div>

            {/* Top-Left Gift Box Watermark */}
            <div className="absolute top-16 -left-10 opacity-[0.06] -rotate-12 text-[#006837]">
              <svg width="180" height="180" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
                <rect x="3" y="8" width="18" height="13" rx="2"/>
                <path d="M12 8v13"/>
                <path d="M19 8H5"/>
                <path d="M12 8a3 3 0 1 0-3-3c2 0 3 3 3 3z"/>
                <path d="M12 8a3 3 0 1 1 3-3c-2 0-3 3-3 3z"/>
              </svg>
            </div>

            {/* Bottom-Right Large Gift Box */}
            <div className="absolute -bottom-8 -right-8 opacity-[0.08] -rotate-6 text-[#006837]">
              <svg width="240" height="240" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
                <rect x="3" y="8" width="18" height="13" rx="2"/>
                <path d="M12 8v13"/>
                <path d="M19 8H5"/>
                <path d="M12 8a3 3 0 1 0-3-3c2 0 3 3 3 3z"/>
                <path d="M12 8a3 3 0 1 1 3-3c-2 0-3 3-3 3z"/>
              </svg>
            </div>

            {/* Bottom-Left Gift Box */}
            <div className="absolute -bottom-10 -left-6 opacity-[0.07] rotate-15 text-[#006837]">
              <svg width="210" height="210" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
                <rect x="3" y="8" width="18" height="13" rx="2"/>
                <path d="M12 8v13"/>
                <path d="M19 8H5"/>
                <path d="M12 8a3 3 0 1 0-3-3c2 0 3 3 3 3z"/>
                <path d="M12 8a3 3 0 1 1 3-3c-2 0-3 3-3 3z"/>
              </svg>
            </div>

            {/* Scattered Snowflakes & Soft Dots */}
            <div className="absolute top-24 right-1/4 text-2xl opacity-15 text-[#006837] animate-pulse">❄</div>
            <div className="absolute top-1/3 left-10 text-3xl opacity-15 text-[#006837]">❄</div>
            <div className="absolute bottom-1/3 right-12 text-3xl opacity-15 text-[#006837] animate-pulse">❄</div>
            <div className="absolute bottom-28 left-1/4 text-2xl opacity-15 text-[#006837]">❄</div>

            <div className="absolute top-36 left-1/3 w-1.5 h-1.5 rounded-full bg-[#006837]/20" />
            <div className="absolute top-1/2 right-1/5 w-2 h-2 rounded-full bg-[#006837]/15" />
            <div className="absolute bottom-44 right-1/3 w-1.5 h-1.5 rounded-full bg-[#006837]/20" />
            <div className="absolute bottom-1/4 left-16 w-2 h-2 rounded-full bg-[#006837]/15" />
          </div>

          {/* Top Status Bar Placeholder (9:41, Cellular, Wifi, Battery) */}
          <div className="w-full max-w-sm flex items-center justify-between px-4 text-xs font-semibold text-[#0F1C13]/80 z-10">
            <span>9:41</span>
            <div className="flex items-center space-x-1.5 text-sm">
              <span className="text-[11px] font-mono font-bold tracking-tighter">5G</span>
              <span>📶</span>
              <span>🔋</span>
            </div>
          </div>

          {/* Central Logo & Confetti Burst Area */}
          <div className="relative flex flex-col items-center justify-center my-auto z-10">
            
            {/* Confetti Foil Particles Burst on 1.6s completion */}
            {showConfetti && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-30">
                {particles.map((p) => (
                  <motion.div
                    key={p.id}
                    initial={{ x: 0, y: 0, scale: 0, opacity: 1 }}
                    animate={{
                      x: p.x,
                      y: p.y,
                      scale: [0, 1.3, 0.7],
                      opacity: [1, 1, 0],
                      rotate: p.id * 55
                    }}
                    transition={{ duration: 0.9, ease: 'easeOut' }}
                    className={`absolute ${p.isSquare ? 'w-2.5 h-2.5 rounded-none' : 'w-2 h-2 rounded-full'} ${
                      p.isGold 
                        ? 'bg-[#D4AF37] shadow-[0_0_10px_#D4AF37]' 
                        : p.isEmerald 
                        ? 'bg-[#006837] shadow-[0_0_8px_#006837]'
                        : 'bg-[#C41E3A] shadow-[0_0_8px_#C41E3A]'
                    }`}
                  />
                ))}
              </div>
            )}

            {/* Circular Emerald Green Sphere Badge housing KuaGifts Logotype */}
            <motion.div
              animate={showConfetti ? { scale: 1.06 } : { scale: 1 }}
              transition={{ duration: 0.4, ease: 'backOut' }}
              className="relative w-56 h-56 sm:w-64 sm:h-64 rounded-full bg-gradient-to-b from-[#006837] via-[#05572f] to-[#043d21] shadow-[0_25px_60px_rgba(0,104,55,0.38)] flex flex-col items-center justify-center p-6 text-center border-2 border-white/20"
            >
              {/* Subtle inner sphere highlight */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-transparent via-white/5 to-white/20 pointer-events-none" />

              {/* Logo Composition: Stylized Gift Box Icon + kuagifts Wordmark */}
              <div className="flex items-center space-x-2.5 z-10">
                
                {/* Gift Box Icon with Gold Star Sparkle */}
                <div className="relative">
                  {/* Glowing 4-point gold star sparkle on ribbon bow */}
                  <motion.div 
                    animate={{ rotate: [0, 15, -15, 0], scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute -top-2.5 -right-1 z-20 text-[#FFD700] text-xs filter drop-shadow-[0_0_4px_#FFD700]"
                  >
                    ✦
                  </motion.div>

                  {/* Gift Box with Ribbon Bow */}
                  <div className="w-10 h-10 rounded-sm bg-transparent border-2 border-white flex flex-col items-center justify-center relative shadow-sm">
                    {/* Ribbon bow loop on top */}
                    <div className="absolute -top-2 inset-x-0 flex justify-center space-x-0.5">
                      <div className="w-3 h-2 rounded-full border border-white -rotate-30"></div>
                      <div className="w-3 h-2 rounded-full border border-white rotate-30"></div>
                    </div>
                    {/* Vertical Ribbon */}
                    <div className="absolute inset-y-0 w-1.5 bg-white/30"></div>
                    {/* Horizontal Ribbon */}
                    <div className="absolute inset-x-0 h-1.5 bg-white/30"></div>
                    
                    {/* Stylized '1' or ribbon knot */}
                    <span className="text-[11px] font-mono font-black text-white relative z-10">
                      1
                    </span>
                  </div>
                </div>

                {/* 'kua' (Crisp White) + 'gifts' (Vibrant Lime-Emerald) */}
                <div className="flex items-center text-3xl sm:text-4xl font-extrabold tracking-tight select-none">
                  <span className="text-white drop-shadow-sm">kua</span>
                  <span className="text-[#3CD070] drop-shadow-sm flex items-center">
                    g
                    {/* 'i' with custom leaf/heart dot */}
                    <span className="relative inline-block">
                      i
                      <span className="absolute -top-1 left-0 text-[8px] text-[#3CD070]">♥</span>
                    </span>
                    fts
                  </span>
                </div>

              </div>

              {/* Tagline / Rails Subtitle */}
              <div className="mt-3 flex items-center space-x-1.5 text-[9px] uppercase font-mono tracking-[0.25em] text-[#D4AF37] font-bold z-10">
                <span>Purpose-Locked Remittance</span>
              </div>
            </motion.div>

          </div>

          {/* Bottom Loading Progress Container (matching Image 2) */}
          <div className="relative flex flex-col items-center justify-center mb-6 z-10 space-y-3">
            
            {/* Circular Progress Element with Centered Gift Box Icon */}
            <div className="relative w-14 h-14 rounded-full flex items-center justify-center bg-white shadow-sm border border-emerald-100">
              
              {/* Dynamic SVG Circular Ring */}
              <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none" viewBox="0 0 100 100">
                {/* Light Track */}
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  stroke="#E2E8F0"
                  strokeWidth="5"
                  fill="none"
                />
                {/* Emerald & Gold Animated Progress Bar */}
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  stroke="#006837"
                  strokeWidth="5.5"
                  fill="none"
                  strokeDasharray="263.89"
                  strokeDashoffset={263.89 - (263.89 * progress) / 100}
                  strokeLinecap="round"
                  className="transition-all duration-75"
                />
              </svg>

              {/* Central Gift Box Icon */}
              <Gift className="w-5 h-5 text-[#006837]" />
            </div>

            {/* Status & Progress Info */}
            <div className="text-center space-y-0.5">
              <div className="flex items-center justify-center space-x-1.5 text-[11px] font-mono tracking-wider font-bold uppercase text-[#006837]">
                <Sparkles className="w-3 h-3 text-[#D4AF37] animate-spin" />
                <span>{showConfetti ? 'Escrow Vault Ready' : 'Securing Remittance Rails...'}</span>
              </div>
              <p className="text-[10px] text-[#0F1C13]/50 font-mono">
                {progress}% • West Africa Custodial Vault
              </p>
            </div>

          </div>

        </motion.div>
      )}
    </AnimatePresence>
  );
};

