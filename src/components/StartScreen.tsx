import React, { useState } from "react";
import { GameState, LevelConfig } from "../types";
import { LEVELS } from "../utils/levels";
import { Play, Flame, Shield, HelpCircle, Gamepad2, Monitor, Smartphone } from "lucide-react";
import { audio } from "../utils/audio";

interface StartScreenProps {
  onStartGame: (levelId: number) => void;
  isMobileDevice: boolean;
  setIsMobileDevice: (isMobile: boolean) => void;
}

export const StartScreen: React.FC<StartScreenProps> = ({
  onStartGame,
  isMobileDevice,
  setIsMobileDevice,
}) => {
  const [selectedLevelId, setSelectedLevelId] = useState<number>(1);

  const triggerStart = () => {
    // Resume context & start arpeggiated music!
    audio.startMusic(LEVELS.find((l) => l.id === selectedLevelId)?.theme || "grass");
    
    // Request fullscreen on mobile as direct response to click
    if (isMobileDevice) {
      if (!document.fullscreenElement && document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen().catch((err) => {
          console.warn("Fullscreen request failed inside click handler:", err);
        });
      }
    }
    
    onStartGame(selectedLevelId);
  };

  return (
    <div className="w-full max-w-5xl mx-auto bg-[#000000] text-white rounded-3xl border-4 border-white/5 p-8 shadow-[0_20px_50px_rgba(0,0,0,0.8)] flex flex-col items-center gap-8 relative overflow-hidden my-4 ring-1 ring-white/10">
      {/* Immersive Atmospheric Space-Adventure Glow Background Layers */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#1e3a8a]/20 via-[#3b82f6]/10 to-[#60a5fa]/5 pointer-events-none z-0" />
      <div className="absolute top-20 left-10 w-32 h-32 bg-white/5 blur-[80px] rounded-full pointer-events-none z-0" />
      <div className="absolute top-45 right-20 w-64 h-64 bg-yellow-400/[0.03] blur-[100px] rounded-full pointer-events-none z-0" />

      {/* Main Header Title */}
      <div className="text-center flex flex-col items-center gap-1 z-10">
        <h1 className="text-6xl md:text-8xl font-black font-display tracking-tighter bg-linear-to-r from-amber-400 via-rose-500 to-emerald-400 bg-clip-text text-transparent drop-shadow-2xl select-none animate-pulse">
          SUPERMAYC
        </h1>
        <p className="text-blue-200 text-xs md:text-sm font-mono font-bold tracking-[0.3em] uppercase opacity-85">
          ★ ADVENTURE QUEST 100% EDITION ★
        </p>
      </div>

      {/* Grid: Level Selection & Retro Manual */}
      <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch z-10">
        
        {/* PANEL A: CHOOSE YOUR LEVEL & DEVICE TYPE */}
        <div className="bg-black/60 backdrop-blur-md border border-white/10 p-6 rounded-2xl flex flex-col justify-between gap-6 shadow-2xl relative overflow-hidden">
          <div>
            <h2 className="text-blue-200 font-bold font-display text-base tracking-widest uppercase mb-4 flex items-center gap-2 border-b border-white/10 pb-3">
              <Gamepad2 className="w-5 h-5 text-amber-400" />
              SELECIONE O MUNDO
            </h2>
            <div className="flex flex-col gap-3">
              {LEVELS.map((lvl) => {
                const isSelected = lvl.id === selectedLevelId;
                return (
                  <button
                    key={lvl.id}
                    onClick={() => {
                      audio.playCoin();
                      setSelectedLevelId(lvl.id);
                    }}
                    className={`w-full text-left p-4 rounded-xl border transition-all duration-150 flex items-center justify-between cursor-pointer group ${
                      isSelected
                        ? "bg-white/10 border-amber-450 shadow-[0_0_15px_rgba(250,204,21,0.2)] scale-[1.02]"
                        : "bg-black/40 border-white/5 hover:border-white/15 hover:scale-[1.01]"
                    }`}
                  >
                    <div>
                      <div className="font-bold text-base flex items-center gap-2 font-display">
                        <span className="text-amber-400">#0{lvl.id}</span>
                        <span className={isSelected ? "text-white font-extrabold" : "text-slate-300"}>
                          {lvl.name}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono mt-1 uppercase tracking-wider">
                        Ritmo: {lvl.musicTempo} BPM | Tema: {lvl.theme}
                      </div>
                    </div>
                    {isSelected && (
                      <span className="bg-amber-400 text-slate-950 font-black text-[10px] uppercase px-2 py-1 rounded-full tracking-wider shadow-[0_0_12px_rgba(250,204,21,0.4)]">
                        Ativo
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* DEVICE TYPE OPTIMIZATION OPTIONS */}
            <div className="mt-5 border-t border-white/10 pt-4">
              <p className="text-blue-200 font-bold font-display text-[10px] uppercase tracking-[0.2em] mb-3">
                🎮 Selecione Seu Dispositivo
              </p>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => {
                    audio.playCoin();
                    setIsMobileDevice(false);
                  }}
                  className={`py-3 px-3 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-1 ${
                    !isMobileDevice
                      ? "bg-white text-black font-black border-white shadow-[0_0_15px_rgba(255,255,255,0.3)] scale-[1.02]"
                      : "bg-black/40 border-white/5 text-slate-300 hover:border-white/15 hover:bg-white/5"
                  }`}
                >
                  <Monitor className="w-5 h-5 mb-0.5" />
                  <div className="text-xs font-black font-display uppercase tracking-wide">PC / Emulador</div>
                  <span className="text-[9px] opacity-75 font-mono">Teclado WASD / Setas</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    audio.playCoin();
                    setIsMobileDevice(true);
                  }}
                  className={`py-3 px-3 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-1 ${
                    isMobileDevice
                      ? "bg-white text-black font-black border-white shadow-[0_0_15px_rgba(255,255,255,0.3)] scale-[1.02]"
                      : "bg-black/40 border-white/5 text-slate-300 hover:border-white/15 hover:bg-white/5"
                  }`}
                >
                  <Smartphone className="w-5 h-5 mb-0.5" />
                  <div className="text-xs font-black font-display uppercase tracking-wide">Celular / Touch</div>
                  <span className="text-[9px] opacity-75 font-mono">Controle na Tela</span>
                </button>
              </div>
            </div>
          </div>

          <button
            onClick={triggerStart}
            className="w-full py-4 bg-white text-black hover:bg-slate-100 active:scale-98 transition-all duration-150 rounded-full text-base font-black tracking-widest uppercase shadow-[0_0_20px_rgba(255,255,255,0.45)] cursor-pointer flex items-center justify-center gap-2 mt-4"
          >
            <Play className="w-5 h-5 fill-black" />
            INICIAR AVENTURA!
          </button>
        </div>

        {/* PANEL B: VINTAGE PLUMBER'S MANUAL */}
        <div className="bg-black/60 backdrop-blur-md border border-white/10 p-6 rounded-2xl flex flex-col gap-4 text-slate-300 text-sm leading-relaxed shadow-2xl">
          <h2 className="text-blue-200 font-bold font-display text-base tracking-widest uppercase flex items-center gap-2 border-b border-white/10 pb-3">
            <HelpCircle className="w-5 h-5 text-amber-500" />
            GUIA DE SOBREVIVÊNCIA
          </h2>

          <div className="flex flex-col gap-3 font-mono text-[11px]">
            {/* Mushroom */}
            <div className="flex gap-3 bg-black/45 p-2 rounded-xl border border-white/5 items-start">
              <span className="text-xl bg-red-950/40 p-1.5 rounded-lg border border-red-500/20">🍄</span>
              <div>
                <b className="text-white block font-display text-xs uppercase tracking-wide text-rose-400 mb-0.5">Cogumelo Super</b>
                Cresce o Mayc de tamanho, permitindo destruir blocos de tijolos comuns com a cabeça!
              </div>
            </div>

            {/* Fire flower */}
            <div className="flex gap-3 bg-black/45 p-2 rounded-xl border border-white/5 items-start">
              <span className="text-xl bg-rose-950/40 p-1.5 rounded-lg border border-rose-500/20">🌹</span>
              <div>
                <b className="text-white block font-display text-xs uppercase tracking-wide text-rose-500 mb-0.5">Flor de Fogo</b>
                Permite lançar bolas de fogo saltitantes para aniquilar monstros sem gastar moedas!
              </div>
            </div>

            {/* Star */}
            <div className="flex gap-3 bg-black/45 p-2 rounded-xl border border-white/5 items-start">
              <span className="text-xl bg-amber-950/40 p-1.5 rounded-lg border border-amber-500/20">⭐</span>
              <div>
                <b className="text-white block font-display text-xs uppercase tracking-wide text-amber-400 mb-0.5">Invencibilidade</b>
                Mayc brilha em arco-íris, corre 35% mais rápido e derrota qualquer monstro que encostar!
              </div>
            </div>

            {/* Shoot Tip */}
            <div className="flex gap-3 bg-black/45 p-2 rounded-xl border border-white/5 items-start">
              <span className="text-xl bg-slate-900/40 p-1.5 rounded-lg border border-slate-700/20">🪙</span>
              <div>
                <b className="text-white block font-display text-xs uppercase tracking-wide text-yellow-500 mb-0.5">Ataque de Moedas Especial</b>
                Se você não tiver uma Flor de Fogo, pressionar {isMobileDevice ? <span className="text-amber-400 font-bold bg-white/10 px-1.5 py-0.5 rounded">FOGO</span> : <kbd className="text-amber-400 font-bold bg-white/10 px-1.5 py-0.5 rounded">E</kbd>} ainda lança fogo consumindo 5 moedas!
              </div>
            </div>

            {/* Device-specific controls overview */}
            <div className="mt-2 p-3 bg-white/5 rounded-xl border border-white/10">
              <span className="text-xs uppercase font-black font-display text-blue-200 block mb-1">
                🎮 Seus Controles Ativos:
              </span>
              {isMobileDevice ? (
                <p className="text-emerald-400 font-bold">
                  Modo Celular Habilitado. Use os botões direcionais táteis virtuais exibidos na parte inferior da tela para correr, pular e atacar.
                </p>
              ) : (
                <p className="text-sky-450 font-bold">
                  Modo PC. Use as teclas <span className="text-white font-black bg-white/10 px-1 rounded font-mono">A/D</span> ou as <span className="text-white font-black bg-white/10 px-1 rounded font-mono">setas</span> para andar, <span className="text-white font-black bg-white/10 px-1 rounded font-mono">Espaço</span> ou <span className="text-white font-black bg-white/10 px-1 rounded font-mono">W</span> para Saltar, e tecla <span className="text-white font-black bg-white/10 px-1 rounded font-mono">E</span> ou <span className="text-white font-black bg-white/10 px-1 rounded font-mono">X</span> para lançar fogo.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
