import { useState, useEffect } from "react";
import { GameState, PowerState } from "./types";
import { GameCanvas } from "./components/GameCanvas";
import { StartScreen } from "./components/StartScreen";
import { GameControls } from "./components/GameControls";
import { audio } from "./utils/audio";
import { LEVELS } from "./utils/levels";
import { Trophy, HelpCircle, Gamepad2, Volume2, VolumeX, Sparkles, AlertTriangle, RefreshCw, Maximize2, Minimize2 } from "lucide-react";

export default function App() {
  const [gameState, setGameState] = useState<GameState>(GameState.START_SCREEN);
  const [currentLevelId, setCurrentLevelId] = useState<number>(1);
  const [coins, setCoins] = useState<number>(0);
  const [lives, setLives] = useState<number>(3);
  const [progress, setProgress] = useState<number>(0);
  const [power, setPower] = useState<PowerState>(PowerState.NORMAL);
  const [score, setScore] = useState<number>(0);

  // Fullscreen state with support for standard change events
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((err) => {
        console.warn("Fullscreen permission or support error:", err);
      });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  // Device Selection Preference (PC or Mobile with virtual controls)
  const [isMobileDevice, setIsMobileDevice] = useState<boolean>(() => {
    if (typeof window !== "undefined" && window.navigator) {
      const ua = window.navigator.userAgent.toLowerCase();
      return /iphone|ipad|ipod|android|blackberry|mini|windows\sphone|mobile/i.test(ua);
    }
    return false;
  });
  
  // Game Stats for modals
  const [highScore, setHighScore] = useState<number>(() => {
    const saved = localStorage.getItem("supermayc_highscore");
    return saved ? parseInt(saved, 10) : 5000;
  });
  
  const [victoryStats, setVictoryStats] = useState<{
    coins: number;
    score: number;
    lives: number;
    levelName: string;
  } | null>(null);

  const [gameOverStats, setGameOverStats] = useState<{
    coins: number;
    levelName: string;
  } | null>(null);

  // Trigger re-creation of level
  const [resetTrigger, setResetTrigger] = useState<number>(0);

  // Sync highscore to local storage
  useEffect(() => {
    if (score > highScore) {
      setHighScore(score);
      localStorage.setItem("supermayc_highscore", score.toString());
    }
  }, [score, highScore]);

  // Handle beginning of a level
  const handleStartGame = (levelId: number) => {
    // Attempt auto-fullscreen on start for mobile devices
    if (isMobileDevice && !document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((err) => {
        console.warn("Auto-fullscreen failed or blocked by sandbox:", err);
      });
    }
    setCurrentLevelId(levelId);
    setCoins(0);
    setLives(3);
    setScore(0);
    setProgress(0);
    setPower(PowerState.NORMAL);
    setVictoryStats(null);
    setGameOverStats(null);
    setGameState(GameState.PLAYING);
    setResetTrigger((prev) => prev + 1);
  };

  const handleCoinCalculated = (newCoins: number) => {
    setCoins(newCoins);
    setScore((prev) => prev + 200); // 200pts per coin
  };

  const handleGameOverTrigger = (stats: { coins: number; levelName: string }) => {
    setGameOverStats(stats);
    setGameState(GameState.GAME_OVER);
    audio.stopMusic();
  };

  const handleLevelCompletedTrigger = (stats: {
    coins: number;
    score: number;
    lives: number;
    levelName: string;
  }) => {
    setVictoryStats(stats);
    setGameState(GameState.VICTORY);
    audio.stopMusic();
  };

  const handleRetrySameLevel = () => {
    audio.playCoin();
    if (gameOverStats) {
      // Keep level intact
      handleStartGame(currentLevelId);
    } else if (victoryStats) {
      // Advance to next level if exists
      const nextId = currentLevelId < 3 ? currentLevelId + 1 : 1;
      handleStartGame(nextId);
    } else {
      handleStartGame(1);
    }
  };

  const returnToMenu = () => {
    audio.playCoin();
    audio.stopMusic();
    setGameState(GameState.START_SCREEN);
  };

  return (
    <div className={`min-h-screen w-full bg-[#000000] text-white flex flex-col justify-between ${isMobileDevice ? "p-1.5" : "p-4 md:p-8"} antialiased selection:bg-rose-500 selection:text-white relative overflow-hidden font-sans`}>
      {/* Immersive Atmospheric Space-Adventure Glow Background Layers */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#1e3a8a]/25 via-[#3b82f6]/10 to-[#60a5fa]/5 pointer-events-none z-0"></div>
      <div className="absolute top-24 left-12 w-48 h-48 bg-white/5 blur-[90px] rounded-full pointer-events-none z-0"></div>
      <div className="absolute top-[40%] right-12 w-80 h-80 bg-yellow-400/[0.03] blur-[120px] rounded-full pointer-events-none z-0"></div>

      {/* HEADER SECTION: HIGH-TECH IMMERSIVE HUD */}
      {(!isMobileDevice || gameState === GameState.START_SCREEN) && (
        <header className={`relative z-10 w-full max-w-6xl mx-auto flex ${isMobileDevice ? "flex-row justify-between p-3 px-4 rounded-2xl mb-2 gap-2 text-xs" : "flex-col md:flex-row justify-between p-6 px-10 rounded-3xl mb-6 gap-6"} items-center bg-black/45 backdrop-blur-md border border-white/10 select-none shadow-[2px_10px_30px_rgba(0,0,0,0.5)]`}>
          <div className={`space-y-1 ${isMobileDevice ? "text-left flex items-center gap-2 space-y-0" : "text-center md:text-left"}`}>
            {!isMobileDevice && <p className="text-[10px] uppercase tracking-[0.3em] text-blue-200 font-bold opacity-75">Jogador</p>}
            <h1 className={`${isMobileDevice ? "text-sm" : "text-3xl md:text-4xl"} font-black font-display tracking-tight text-white drop-shadow-lg leading-none`}>
              {isMobileDevice ? "S.MAYC" : "SUPERMAYC"}{" "}
              <span className="text-yellow-400 font-mono tracking-tight font-black">
                {score.toString().padStart(isMobileDevice ? 5 : 6, "0")}
              </span>
            </h1>
          </div>

          {/* Global Stats in top-right HUD styles */}
          <div className={`flex items-center justify-center ${isMobileDevice ? "gap-4 text-xs" : "flex-wrap gap-8 md:gap-14"}`}>
            <div className="text-center font-display flex items-center gap-1">
              {isMobileDevice ? (
                <span className="text-yellow-400 font-bold">🪙 × {coins.toString().padStart(2, "0")}</span>
              ) : (
                <>
                  <p className="text-[10px] uppercase tracking-[0.3em] text-blue-200 font-bold opacity-75">Moedas</p>
                  <div className="flex items-center justify-center gap-2 mt-1">
                    <div className="w-4 h-6 bg-yellow-400 rounded-full border-2 border-yellow-250 shadow-[0_0_15px_rgba(250,204,21,0.55)] animate-pulse"></div>
                    <p className="text-2xl md:text-3xl font-black italic tracking-tighter">× {coins.toString().padStart(2, "0")}</p>
                  </div>
                </>
              )}
            </div>
            
            <div className="text-center font-display flex items-center gap-1">
              {isMobileDevice ? (
                <span className="text-blue-300 font-bold font-mono">🗺️ {currentLevelId}</span>
              ) : (
                <>
                  <p className="text-[10px] uppercase tracking-[0.3em] text-blue-200 font-bold opacity-75">Mundo</p>
                  <p className="text-2xl md:text-3xl font-black mt-1 italic tracking-tighter text-blue-300">1 - {currentLevelId}</p>
                </>
              )}
            </div>

            {!isMobileDevice && (
              <div className="text-center font-display">
                <p className="text-[10px] uppercase tracking-[0.3em] text-blue-200 font-bold opacity-75">Recorde</p>
                <div className="flex items-center gap-1.5 justify-center mt-1">
                  <Trophy className="w-5 h-5 text-amber-400 fill-amber-400 animate-pulse" />
                  <p className="text-2xl md:text-3xl font-black italic tracking-tighter text-emerald-400">{highScore.toLocaleString()}</p>
                </div>
              </div>
            )}

            {/* Fullscreen Toggle Button - Perfect visual addition */}
            <button
              onClick={toggleFullscreen}
              className={`flex items-center gap-1.5 justify-center ${
                isMobileDevice ? "p-1 px-2.5 bg-blue-500/15 text-blue-400 text-[10px]" : "p-2 px-3.5 bg-white/10 text-white text-xs"
              } hover:bg-white/20 active:scale-95 transition-all rounded-lg border border-white/10 font-bold cursor-pointer font-sans`}
              title="Alternar Tela Cheia"
            >
              {isFullscreen ? (
                <>
                  <Minimize2 className={`${isMobileDevice ? "w-3 h-3" : "w-4 h-4"}`} />
                  <span>Janela</span>
                </>
              ) : (
                <>
                  <Maximize2 className={`${isMobileDevice ? "w-3 h-3" : "w-4 h-4"}`} />
                  <span>Tela Cheia</span>
                </>
              )}
            </button>
          </div>
        </header>
      )}

      {/* CORE DISPLAY GAMEPORT VIEWPORTS */}
      <main className="relative z-10 w-full max-w-6xl mx-auto flex-1 flex flex-col items-center justify-center">
        
        {gameState === GameState.START_SCREEN ? (
          <StartScreen
            onStartGame={handleStartGame}
            isMobileDevice={isMobileDevice}
            setIsMobileDevice={setIsMobileDevice}
          />
        ) : (
          <div className={`w-full bg-[#000000] ${
            isMobileDevice 
              ? (isFullscreen ? "rounded-none border-0" : "rounded-2xl border-2") 
              : "rounded-3xl border-4 md:border-8"
          } border-white/5 shadow-[0_20px_50px_rgba(0,0,0,0.8)] relative flex flex-col overflow-hidden ring-1 ring-white/10 animate-fade-in`}>
            
            {/* RENDER CANVAS CONTAINER */}
            <GameCanvas
              currentLevelId={currentLevelId}
              gameState={gameState}
              onCoinCollected={handleCoinCalculated}
              onLivesChanged={setLives}
              onPowerChanged={setPower}
              onProgressChanged={setProgress}
              onVictory={handleLevelCompletedTrigger}
              onGameOver={handleGameOverTrigger}
              resetTrigger={resetTrigger}
              isMobileDevice={isMobileDevice}
            />

            {/* IMMERSIVE BOTTOM STATUS BAR */}
            <div className={`relative z-20 ${isMobileDevice ? "p-2 px-4 gap-2 flex-row justify-between" : "min-h-20 p-6 py-4 gap-4 flex-col sm:flex-row"} bg-black/75 backdrop-blur-md border-t border-white/10 flex items-center justify-between select-none`}>
              <div className={`flex items-center justify-center ${isMobileDevice ? "gap-3 text-xs w-full justify-start" : "flex-wrap gap-6 md:gap-10"}`}>
                <div className="flex items-center gap-1.5">
                  <span className={`${isMobileDevice ? "w-6 h-6 text-xs" : "w-9 h-9 text-sm"} rounded-full border border-white/20 flex items-center justify-center bg-red-950/40 shadow-[0_0_12px_rgba(239,68,68,0.2)]`}>
                    ❤️
                  </span>
                  <div className="text-left font-sans">
                    {!isMobileDevice && <p className="opacity-50 text-[10px] uppercase tracking-widest text-blue-200 font-bold leading-none">Vidas</p>}
                    <p className={`font-extrabold ${isMobileDevice ? "text-xs" : "text-lg"} leading-none font-display text-white`}>{lives.toString().padStart(2, "0")}</p>
                  </div>
                </div>

                <div className={`h-6 w-px bg-white/10 ${isMobileDevice ? "block" : "hidden sm:block"}`}></div>

                <div className="flex items-center gap-1.5">
                  <span className={`${isMobileDevice ? "w-6 h-6 text-xs" : "w-9 h-9 text-sm"} rounded-full border border-amber-400/30 flex items-center justify-center bg-yellow-500/10 shadow-[0_0_15px_rgba(245,158,11,0.15)]`}>
                    ⚡
                  </span>
                  <div className="text-left font-sans">
                    {!isMobileDevice && <p className="opacity-50 text-[10px] uppercase tracking-widest text-blue-200 font-bold leading-none">Poder</p>}
                    <p className={`font-extrabold ${isMobileDevice ? "text-xs" : "text-lg"} leading-none font-display text-yellow-400 uppercase tracking-tight`}>{power}</p>
                  </div>
                </div>

                <div className={`h-6 w-px bg-white/10 ${isMobileDevice ? "block" : "hidden sm:block"}`}></div>

                <div className="flex items-center gap-1.5">
                  <span className={`${isMobileDevice ? "w-6 h-6 text-xs" : "w-9 h-9 text-sm"} rounded-full border border-sky-400/30 flex items-center justify-center`}>
                    📍
                  </span>
                  <div className="text-left font-sans">
                    {!isMobileDevice && <p className="opacity-50 text-[10px] uppercase tracking-widest text-blue-200 font-bold leading-none">Progresso</p>}
                    <p className={`font-extrabold ${isMobileDevice ? "text-xs" : "text-lg"} leading-none font-display text-sky-400`}>{progress}%</p>
                  </div>
                </div>

                {isMobileDevice && (
                  <>
                    <div className="h-6 w-px bg-white/10"></div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-6 h-6 rounded-full border border-yellow-400/30 flex items-center justify-center text-[11px] bg-yellow-500/15 shadow-[0_0_10px_rgba(250,204,21,0.3)]">
                        🪙
                      </span>
                      <div className="text-left font-sans">
                        <p className="font-extrabold text-xs leading-none font-display text-yellow-400">×{coins.toString().padStart(2, "0")}</p>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Action buttons mirroring Pause (Esc) & Inventory (I) layout style */}
              <div className="flex items-center gap-2 font-display shrink-0">
                <button
                  onClick={returnToMenu}
                  className={`${isMobileDevice ? "px-3 py-1.5 text-[10px]" : "px-6 py-2 text-xs"} bg-white text-black font-extrabold rounded-full tracking-wider uppercase shadow-[0_0_15px_rgba(255,255,255,0.45)] hover:bg-slate-100 active:scale-95 transition-all cursor-pointer`}
                >
                  SAIR
                </button>
                {!isMobileDevice && (
                  <div className="px-6 py-2 border border-white/20 text-white font-extrabold text-xs rounded-full tracking-wider uppercase cursor-default select-none bg-white/5 font-mono">
                    MUNDO {currentLevelId}-1
                  </div>
                )}
              </div>
            </div>

            {/* MOBILE TOUCH INTERACTIVE CONTROL SCREEN OVERLAY */}
            {isMobileDevice && <GameControls />}
          </div>
        )}
      </main>

      {/* FOOTER MANIFEST RULES AND CREDIT RAIL */}
      <footer className="relative z-10 w-full text-center py-6 text-[11px] font-mono text-slate-500 mt-6 select-none border-t border-white/5">
        <p>SUPERMAYC Platforms Inc - 100% Melhorado e Inspirado pelo Clássico Super Mario Bros.</p>
        <p className="mt-1 opacity-75">Sabor Imersivo | TypeScript, Web Audio real-time Synthesizer & Canvas Engine de Alta Performance</p>
      </footer>

      {/* --- LITE-MODAL A: VICTORY SUCCESS OVERLAY --- */}
      {gameState === GameState.VICTORY && victoryStats && (
        <div className="fixed inset-0 bg-slate-950/90 z-50 flex items-center justify-center p-4 backdrop-blur-xs animate-fade-in">
          <div className="bg-linear-to-b from-indigo-900 to-indigo-950 border-4 border-amber-400 p-8 rounded-3xl w-full max-w-md text-center shadow-2xl relative flex flex-col items-center">
            
            {/* Sparkle icons */}
            <div className="absolute -top-12 bg-amber-400 p-4 rounded-full border-4 border-indigo-900 shadow-lg">
              <Sparkles className="w-10 h-10 text-slate-950 animate-spin" />
            </div>

            <h1 className="text-3xl font-black text-amber-400 font-sans uppercase mt-6 mb-2 tracking-tight">
              🎉 Vitória Régia!
            </h1>
            <p className="text-slate-300 font-bold mb-6 font-mono text-sm">
              Você conquistou o {victoryStats.levelName}!
            </p>

            {/* Custom Score logs */}
            <div className="w-full bg-slate-950/80 rounded-2xl p-4 font-mono text-xs flex flex-col gap-3 text-slate-300 mb-8 border border-indigo-800">
              <div className="flex justify-between border-b border-indigo-950 pb-2">
                <span>Moedas Coletadas:</span>
                <span className="text-amber-400 font-bold">{victoryStats.coins} 🪙</span>
              </div>
              <div className="flex justify-between border-b border-indigo-950 pb-2">
                <span>Vidas Restantes:</span>
                <span className="text-rose-400 font-bold">{victoryStats.lives} ❤️</span>
              </div>
              <div className="flex justify-between">
                <span>Pontuação Total:</span>
                <span className="text-white font-black text-sm">{score.toLocaleString()} PTS</span>
              </div>
            </div>

            {/* Modal Buttons panel */}
            <div className="flex flex-col gap-3 w-full">
              <button
                onClick={handleRetrySameLevel}
                className="w-full py-3 bg-amber-400 hover:bg-amber-300 active:scale-98 transition-all rounded-xl text-slate-950 font-black cursor-pointer shadow-lg shadow-amber-400/20"
              >
                {currentLevelId < 3 ? "PRÓXIMO MUNDO ►" : "JOGAR NOVAMENTE ↻"}
              </button>
              <button
                onClick={returnToMenu}
                className="w-full py-3 bg-slate-800 hover:bg-slate-700 active:scale-98 transition-all rounded-xl text-slate-300 font-bold cursor-pointer"
              >
                MENU PRINCIPAL
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- LITE-MODAL B: GAME OVER DEFEAT OVERLAY --- */}
      {gameState === GameState.GAME_OVER && gameOverStats && (
        <div className="fixed inset-0 bg-slate-950/90 z-50 flex items-center justify-center p-4 backdrop-blur-xs animate-fade-in">
          <div className="bg-linear-to-b from-rose-950 to-slate-950 border-4 border-red-600 p-8 rounded-3xl w-full max-w-md text-center shadow-2xl relative flex flex-col items-center">
            
            {/* Warning icon */}
            <div className="absolute -top-12 bg-red-600 p-4 rounded-full border-4 border-rose-950 shadow-lg">
              <AlertTriangle className="w-10 h-10 text-white animate-pulse" />
            </div>

            <h1 className="text-3xl font-black text-red-500 font-sans uppercase mt-6 mb-2 tracking-tight">
              💀 GAME OVER
            </h1>
            <p className="text-slate-300 font-bold mb-6 font-mono text-sm">
              Infelizmente suas vidas se esgotaram...
            </p>

            {/* Custom Defeat Score logs */}
            <div className="w-full bg-slate-950/80 rounded-2xl p-4 font-mono text-xs flex flex-col gap-2 text-slate-300 mb-8 border border-red-950">
              <div className="flex justify-between">
                <span>Parou no Mundo:</span>
                <span className="text-cyan-400 font-bold">{gameOverStats.levelName}</span>
              </div>
              <div className="flex justify-between border-t border-red-950 pt-2">
                <span>Moedas salvas:</span>
                <span className="text-amber-400 font-bold">{gameOverStats.coins} 🪙</span>
              </div>
            </div>

            {/* Defeat retry panel */}
            <div className="flex flex-col gap-3 w-full">
              <button
                onClick={handleRetrySameLevel}
                className="w-full py-3 bg-red-600 hover:bg-red-500 active:scale-98 transition-all rounded-xl text-white font-black cursor-pointer shadow-lg shadow-red-600/30 flex items-center justify-center gap-1.5"
              >
                <RefreshCw className="w-4 h-4" />
                REENTRAR NA FASE
              </button>
              <button
                onClick={returnToMenu}
                className="w-full py-3 bg-slate-800 hover:bg-slate-700 active:scale-98 transition-all rounded-xl text-slate-300 font-bold cursor-pointer"
              >
                VOLTAR AO MENU
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
