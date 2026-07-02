import React, { useState } from "react";
import { GameState, LevelConfig } from "../types";
import { LEVELS } from "../utils/levels";
import { Play, Flame, Shield, HelpCircle, Gamepad2, Monitor, Smartphone, Trophy, User } from "lucide-react";
import { audio } from "../utils/audio";
import { getHighScores } from "../utils/highscores";
// @ts-ignore
import justinBieberImg from "../assets/images/justin_bieber_pixel_art_1782567123144.jpg";

interface StartScreenProps {
  onStartGame: (levelId: number) => void;
  isMobileDevice: boolean;
  setIsMobileDevice: (isMobile: boolean) => void;
  selectedSkin: string;
  setSelectedSkin: (skin: string) => void;
}

const MOTIVATIONAL_PHRASES = [
  "Never Say Never! Você consegue passar todas as fases! 🎤✨",
  "Believe em você mesmo! Se cair no buraco, levante e tente de novo! 🔥",
  "Não desista! Se eu cheguei ao topo da música, você zera esse jogo! 🚀🎵",
  "Baby, baby, baby, oh! Foca no tempo de pulo e derrota o chefão! 🌟",
  "Forte, focado e cheio de estilo. Bora salvar esse reino! 👑💪"
];

const SKINS = [
  { id: "classic", name: "Classic Mayc", desc: "Encanador Herói", ability: "Equilibrado ★", cap: "#dc2626", overalls: "#15803d", badge: "❤️" },
  { id: "bieber", name: "Mayc Bieber", desc: "Visual Astro Pop", ability: "Pulo Duplo & Ímã de Moeda 🎤", cap: "#fbbf24", overalls: "#7e22ce", badge: "🎤" },
  { id: "fire", name: "Fire Mayc", desc: "Poder Flamejante", ability: "Tiro Triplo Grátis 🔥", cap: "#ffffff", overalls: "#dc2626", badge: "🔥" },
  { id: "shadow", name: "Shadow Mayc", desc: "Ninja das Sombras", ability: "Veloz & Tiro Penetrante 👤⚡", cap: "#1e293b", overalls: "#22c55e", badge: "👤" },
];

export const StartScreen: React.FC<StartScreenProps> = ({
  onStartGame,
  isMobileDevice,
  setIsMobileDevice,
  selectedSkin,
  setSelectedSkin,
}) => {
  const [selectedLevelId, setSelectedLevelId] = useState<number>(1);
  const [activeTab, setActiveTab] = useState<"highscores" | "guide">("highscores");
  const [highScores, setHighScores] = useState(() => getHighScores());
  const [motivationalPhrase] = useState<string>(() => {
    const randomIndex = Math.floor(Math.random() * MOTIVATIONAL_PHRASES.length);
    return MOTIVATIONAL_PHRASES[randomIndex];
  });

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
    <div className="w-full max-w-4xl mx-auto bg-black text-white rounded-2xl border-2 border-white/5 p-4 md:p-5 shadow-[0_15px_40px_rgba(0,0,0,0.8)] flex flex-col items-center gap-4 relative overflow-hidden my-1 ring-1 ring-white/10 max-h-[96vh] select-none">
      {/* Immersive Atmospheric Space-Adventure Glow Background Layers */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#1e3a8a]/15 via-[#3b82f6]/5 to-[#60a5fa]/0 pointer-events-none z-0" />
      <div className="absolute top-20 left-10 w-24 h-24 bg-white/5 blur-[60px] rounded-full pointer-events-none z-0" />

      {/* Main Header with Justin Bieber */}
      <div className="w-full flex flex-row items-center justify-between gap-4 border-b border-white/5 pb-2.5 z-10">
        {/* Main Header Title */}
        <div className="text-left flex flex-col justify-center">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-black font-display tracking-tighter bg-gradient-to-r from-amber-400 via-rose-500 to-emerald-400 bg-clip-text text-transparent drop-shadow-2xl select-none leading-none">
            SUPER MAYC BROS
          </h1>
          <p className="text-blue-200 text-[9px] md:text-xs font-mono font-bold tracking-[0.25em] uppercase opacity-85 mt-1">
            ★ ADVENTURE QUEST 100% EDITION ★
          </p>
        </div>

        {/* Justin Bieber Widget (Where highlighted by the user) */}
        <div className="flex items-center gap-2.5 bg-slate-950/85 backdrop-blur-md px-2.5 py-1.5 rounded-xl border border-amber-400/60 shadow-[0_0_15px_rgba(250,204,21,0.15)] max-w-[200px] md:max-w-xs shrink-0">
          <div className="relative shrink-0">
            <img
              src={justinBieberImg}
              alt="Maycon Bieber 8-Bit"
              className="w-10 h-10 rounded-lg border border-white/20 object-cover"
              referrerPolicy="no-referrer"
            />
            <span className="absolute -top-1 -right-1 bg-amber-400 text-slate-950 text-[7px] font-black uppercase px-1 py-0.5 rounded-sm tracking-wider shadow-sm">
              MAYC 🎤
            </span>
          </div>
          <div className="text-left font-sans min-w-0">
            <p className="text-[9px] uppercase tracking-wider text-amber-400 font-black leading-none">Maycon Bieber</p>
            <p className="text-white text-[10px] leading-tight mt-1 italic font-mono truncate max-w-[120px] md:max-w-[180px]">
              "{motivationalPhrase}"
            </p>
          </div>
        </div>
      </div>

      {/* Grid: Character/Device & Level/Highscores */}
      <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4 items-stretch z-10 flex-1 min-h-0 overflow-y-auto">
        
        {/* PANEL A: CHOOSE YOUR HERO (SKINS) & DEVICE TYPE */}
        <div className="bg-black/45 backdrop-blur-md border border-white/5 p-4 rounded-xl flex flex-col justify-between gap-3.5 shadow-2xl">
          {/* SKIN SELECTION BLOCK */}
          <div>
            <h2 className="text-blue-200 font-bold font-display text-xs tracking-widest uppercase mb-2.5 flex items-center gap-1.5 border-b border-white/5 pb-2">
              <User className="w-4 h-4 text-amber-400" />
              ESCOLHA SEU PERSONAGEM (SKINS)
            </h2>
            <div className="grid grid-cols-2 gap-2">
              {SKINS.map((skin) => {
                const isSkinSelected = skin.id === selectedSkin;
                return (
                  <button
                    key={skin.id}
                    type="button"
                    onClick={() => {
                      audio.playCoin();
                      setSelectedSkin(skin.id);
                    }}
                    className={`p-2 rounded-xl border transition-all cursor-pointer flex items-center gap-2 text-left relative ${
                      isSkinSelected
                        ? "bg-white/10 border-amber-400 shadow-[0_0_12px_rgba(250,204,21,0.15)] scale-[1.02]"
                        : "bg-black/35 border-white/5 hover:border-white/10 hover:scale-[1.01]"
                    }`}
                  >
                    {/* Split Circle Preview */}
                    <div className="w-5.5 h-5.5 rounded-full border border-white/25 flex overflow-hidden shrink-0 relative">
                      <div className="w-1/2 h-full" style={{ backgroundColor: skin.cap }} />
                      <div className="w-1/2 h-full" style={{ backgroundColor: skin.overalls }} />
                      <span className="absolute inset-0 flex items-center justify-center text-[9px]">{skin.badge}</span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className={`text-[11px] font-black truncate leading-tight ${isSkinSelected ? "text-amber-400" : "text-slate-200"}`}>
                        {skin.name}
                      </div>
                      <div className="text-[8.5px] text-slate-400 leading-none truncate">{skin.desc}</div>
                      <div className="text-[7.5px] text-amber-300 font-bold leading-none mt-0.5 truncate">{skin.ability}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* DEVICE TYPE OPTIMIZATION OPTIONS */}
          <div>
            <h2 className="text-blue-200 font-bold font-display text-xs tracking-widest uppercase mb-2 flex items-center gap-1.5 border-b border-white/5 pb-2">
              <Gamepad2 className="w-4 h-4 text-amber-400" />
              SELECIONE SEU DISPOSITIVO
            </h2>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  audio.playCoin();
                  setIsMobileDevice(false);
                }}
                className={`py-2 px-2.5 rounded-xl border text-center transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  !isMobileDevice
                    ? "bg-white text-black font-black border-white shadow-[0_0_10px_rgba(255,255,255,0.15)] scale-[1.02]"
                    : "bg-black/35 border-white/5 text-slate-300 hover:border-white/10"
                }`}
              >
                <Monitor className="w-4 h-4 shrink-0" />
                <div className="text-[10px] font-black font-display uppercase">PC / TECLADO</div>
              </button>
              <button
                type="button"
                onClick={() => {
                  audio.playCoin();
                  setIsMobileDevice(true);
                }}
                className={`py-2 px-2.5 rounded-xl border text-center transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  isMobileDevice
                    ? "bg-white text-black font-black border-white shadow-[0_0_10px_rgba(255,255,255,0.15)] scale-[1.02]"
                    : "bg-black/35 border-white/5 text-slate-300 hover:border-white/10"
                }`}
              >
                <Smartphone className="w-4 h-4 shrink-0" />
                <div className="text-[10px] font-black font-display uppercase">CELULAR / TOUCH</div>
              </button>
            </div>
          </div>
        </div>

        {/* PANEL B: LEVEL SELECTION & TABS (HIGHSCORES / GUIDE) */}
        <div className="bg-black/45 backdrop-blur-md border border-white/5 p-4 rounded-xl flex flex-col gap-3 shadow-2xl justify-between">
          
          {/* LEVEL SELECTION */}
          <div>
            <h3 className="text-blue-200 font-bold font-display text-[10px] uppercase tracking-wider mb-2 flex items-center gap-1 border-b border-white/5 pb-1.5">
              <span>MUNDO SELECIONADO</span>
            </h3>
            <div className="grid grid-cols-3 gap-1.5">
              {LEVELS.map((lvl) => {
                const isSelected = lvl.id === selectedLevelId;
                return (
                  <button
                    key={lvl.id}
                    onClick={() => {
                      audio.playCoin();
                      setSelectedLevelId(lvl.id);
                    }}
                    className={`p-2 rounded-xl border transition-all duration-150 flex flex-col items-center justify-center cursor-pointer text-center ${
                      isSelected
                        ? "bg-white/15 border-amber-400 shadow-[0_0_12px_rgba(250,204,21,0.15)] scale-[1.02] font-black"
                        : "bg-black/35 border-white/5 hover:border-white/10 hover:scale-[1.01]"
                    }`}
                  >
                    <div className="text-[9px] text-amber-400 font-bold leading-none uppercase">Fase 0{lvl.id}</div>
                    <div className={`text-[10px] font-black tracking-tight mt-0.5 truncate max-w-full ${isSelected ? "text-white" : "text-slate-300"}`}>
                      {lvl.name.split(" ")[0]}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* TABS PANEL */}
          <div className="flex flex-col flex-1 min-h-0 justify-end gap-2.5">
            <div className="flex border-b border-white/5 pb-1 gap-1.5">
              <button
                type="button"
                onClick={() => setActiveTab("highscores")}
                className={`flex-1 py-1.5 rounded-lg font-bold font-display text-[9px] uppercase tracking-wider flex items-center justify-center gap-1 border transition-all cursor-pointer ${
                  activeTab === "highscores"
                    ? "bg-amber-400 text-slate-950 border-amber-400 shadow-[0_0_10px_rgba(250,204,21,0.2)] font-black"
                    : "bg-black/35 border-white/5 text-slate-400 hover:text-white"
                }`}
              >
                <Trophy className="w-3 h-3" />
                Recordes
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("guide")}
                className={`flex-1 py-1.5 rounded-lg font-bold font-display text-[9px] uppercase tracking-wider flex items-center justify-center gap-1 border transition-all cursor-pointer ${
                  activeTab === "guide"
                    ? "bg-white text-slate-950 border-white shadow-[0_0_10px_rgba(255,255,255,0.1)] font-black"
                    : "bg-black/35 border-white/5 text-slate-400 hover:text-white"
                }`}
              >
                <HelpCircle className="w-3 h-3" />
                Como Jogar
              </button>
            </div>

            {activeTab === "highscores" ? (
              <div className="flex flex-col gap-1.5 font-mono text-[9.5px] max-h-[110px] overflow-y-auto pr-0.5">
                {highScores.slice(0, 4).map((entry, index) => {
                  const isTop1 = index === 0;
                  return (
                    <div
                      key={entry.id}
                      className={`flex items-center justify-between p-1.5 rounded-lg border ${
                        isTop1
                          ? "bg-amber-950/20 border-amber-500/20"
                          : "bg-black/30 border-white/5"
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className={`w-4 h-4 flex items-center justify-center rounded-sm font-bold text-[8px] ${
                          isTop1 ? "bg-amber-400 text-slate-950" : "bg-slate-800 text-slate-300"
                        }`}>
                          {index + 1}
                        </span>
                        <div className="min-w-0">
                          <div className="font-sans font-black text-white text-[10px] flex items-center gap-1 truncate">
                            {entry.name}
                            {isTop1 && <Trophy className="w-3 h-3 text-amber-400 fill-amber-400 inline" />}
                          </div>
                        </div>
                      </div>
                      <div className="text-right flex items-center gap-2 shrink-0">
                        <span className="text-slate-400 text-[8px]">{entry.levelName.split(" ")[0]}</span>
                        <span className={`font-black font-mono text-[10px] ${isTop1 ? "text-amber-400" : "text-white"}`}>
                          {entry.score.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-1.5 font-mono text-[9px] max-h-[110px] overflow-y-auto pr-0.5">
                <div className="flex gap-1.5 bg-black/35 p-1.5 rounded-lg border border-white/5 items-center">
                  <span className="text-sm">🍄</span>
                  <div className="min-w-0">
                    <b className="text-rose-400 block font-display text-[9px] uppercase">Cogumelo</b>
                    Cresce de tamanho!
                  </div>
                </div>
                <div className="flex gap-1.5 bg-black/35 p-1.5 rounded-lg border border-white/5 items-center">
                  <span className="text-sm">🌹</span>
                  <div className="min-w-0">
                    <b className="text-rose-500 block font-display text-[9px] uppercase">Flor Fogo</b>
                    Lança bolas de fogo!
                  </div>
                </div>
                <div className="flex gap-1.5 bg-black/35 p-1.5 rounded-lg border border-white/5 items-center">
                  <span className="text-sm">⭐</span>
                  <div className="min-w-0">
                    <b className="text-amber-400 block font-display text-[9px] uppercase">Estrela</b>
                    Invencibilidade ativa!
                  </div>
                </div>
                <div className="flex gap-1.5 bg-black/35 p-1.5 rounded-lg border border-white/5 items-center">
                  <span className="text-sm">🪙</span>
                  <div className="min-w-0">
                    <b className="text-yellow-500 block font-display text-[9px] uppercase">Moedas</b>
                    Ataque consome 5!
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Play Button - Centered & Compact */}
      <button
        onClick={triggerStart}
        className="w-full max-w-md py-2.5 bg-gradient-to-r from-amber-400 via-rose-500 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 active:scale-98 transition-all duration-150 rounded-full text-sm font-black tracking-widest uppercase shadow-[0_0_20px_rgba(250,204,21,0.25)] cursor-pointer flex items-center justify-center gap-1.5 z-10"
      >
        <Play className="w-4 h-4 fill-slate-950 text-slate-950" />
        INICIAR AVENTURA!
      </button>
    </div>
  );
};
