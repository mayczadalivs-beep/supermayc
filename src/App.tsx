import { useState, useEffect } from "react";
import { GameState, PowerState } from "./types";
import { GameCanvas } from "./components/GameCanvas";
import { StartScreen } from "./components/StartScreen";
import { GameControls } from "./components/GameControls";
import { audio } from "./utils/audio";
import { LEVELS } from "./utils/levels";
import { Trophy, HelpCircle, Gamepad2, Volume2, VolumeX, Sparkles, AlertTriangle, RefreshCw, Maximize2, Minimize2, RotateCcw } from "lucide-react";
import { checkIsHighScore, saveHighScore } from "./utils/highscores";

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
      if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen().catch((err) => {
          console.warn("Fullscreen permission or support error:", err);
        });
      } else {
        console.warn("Fullscreen API not supported in this browser environment.");
      }
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

  // High score entry states
  const [playerName, setPlayerName] = useState<string>("Maycon Bieber");
  const [isHighScoreFormVisible, setIsHighScoreFormVisible] = useState<boolean>(false);
  const [hasSavedHighScore, setHasSavedHighScore] = useState<boolean>(false);
  const [selectedSkin, setSelectedSkin] = useState<string>("classic");

  // Trigger re-creation of level
  const [resetTrigger, setResetTrigger] = useState<number>(0);
  const [isMuted, setIsMuted] = useState<boolean>(() => audio.getMutedState());

  const handleToggleMute = () => {
    const nextMuted = audio.toggleMute();
    setIsMuted(nextMuted);
  };

  const handleLevelRestart = () => {
    setResetTrigger((prev) => prev + 1);
  };

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
      if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen().catch((err) => {
          console.warn("Auto-fullscreen failed or blocked by sandbox:", err);
        });
      }
    }
    setCurrentLevelId(levelId);
    setCoins(0);
    setLives(3);
    setScore(0);
    setProgress(0);
    setPower(PowerState.NORMAL);
    setVictoryStats(null);
    setGameOverStats(null);
    setIsHighScoreFormVisible(false);
    setHasSavedHighScore(false);
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
    
    if (checkIsHighScore(score)) {
      setIsHighScoreFormVisible(true);
      setHasSavedHighScore(false);
    }
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

    if (checkIsHighScore(score)) {
      setIsHighScoreFormVisible(true);
      setHasSavedHighScore(false);
    }
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
      {gameState === GameState.START_SCREEN && (
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
            selectedSkin={selectedSkin}
            setSelectedSkin={setSelectedSkin}
          />
        ) : (
          <div className={
            isMobileDevice 
              ? "simulate-mobile-landscape flex flex-col justify-center items-center overflow-hidden bg-[#0a0f1d] relative" 
              : "fixed inset-0 z-40 bg-[#0a0f1d] flex flex-col justify-center items-center overflow-hidden w-screen h-screen animate-fade-in"
          }>
            
            {/* RETRO ARCADE HUD OVERLAY (PC & MOBILE) */}
            <div className={`absolute top-4 left-4 right-4 z-30 flex justify-between items-center pointer-events-none select-none ${isMobileDevice ? "px-2" : "px-6"}`}>
              {/* Left Group: World, Lives & Progress */}
              <div className="flex items-center gap-3 bg-black/80 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 text-xs font-bold text-white shadow-2xl">
                <span className="text-sky-400 font-mono tracking-wider">🗺️ 1-{currentLevelId}</span>
                <span className="text-white/20">|</span>
                <span className="text-rose-500 flex items-center gap-1">
                  ❤️ <span className="font-mono text-sm font-extrabold">{lives}</span>
                </span>
                {!isMobileDevice && (
                  <>
                    <span className="text-white/20">|</span>
                    <span className="text-sky-400 flex items-center gap-1">
                      📍 <span className="font-mono text-sm font-extrabold">{progress}%</span>
                    </span>
                  </>
                )}
              </div>
              
              {/* Center Group: Score (Styled retro Mario) */}
              <div className="bg-black/80 backdrop-blur-md px-6 py-2 rounded-full border border-white/10 text-sm font-black font-mono text-yellow-400 tracking-widest shadow-2xl flex items-center gap-2">
                <span>MARIO</span>
                <span>{score.toString().padStart(6, "0")}</span>
              </div>

              {/* Right Group: Coins, Power, Controls */}
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-3 bg-black/80 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 text-xs font-bold text-white shadow-2xl mr-1">
                  <span className="text-amber-400 flex items-center gap-1">
                    🪙 <span className="font-mono text-sm font-extrabold">{coins.toString().padStart(2, "0")}</span>
                  </span>
                  <span className="text-white/20">|</span>
                  <span className="text-emerald-400 font-mono text-[10px] font-black uppercase tracking-wider">{power}</span>
                </div>

                {/* PC/Mobile Interactive Controls */}
                <div className="flex items-center gap-1.5 pointer-events-auto">
                  {/* Mute Control */}
                  <button
                    onClick={handleToggleMute}
                    className="p-1.5 bg-black/80 hover:bg-slate-800 active:scale-90 border border-white/10 rounded-full text-white shadow-2xl cursor-pointer transition-all flex items-center justify-center w-8 h-8"
                    title="Música On/Off"
                  >
                    {isMuted ? <VolumeX className="w-3.5 h-3.5 text-red-400" /> : <Volume2 className="w-3.5 h-3.5 text-emerald-400" />}
                  </button>

                  {/* Restart Control */}
                  <button
                    onClick={handleLevelRestart}
                    className="p-1.5 bg-black/80 hover:bg-slate-800 active:scale-90 border border-white/10 rounded-full text-white shadow-2xl cursor-pointer transition-all flex items-center justify-center w-8 h-8"
                    title="Reiniciar Fase"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-sky-400" />
                  </button>

                  {/* Sair Control */}
                  <button
                    onClick={returnToMenu}
                    className="bg-red-600 hover:bg-red-500 active:scale-95 border border-red-500/30 px-3.5 py-1.5 rounded-full text-[10px] font-black uppercase text-white tracking-wider shadow-2xl cursor-pointer transition-all h-8 flex items-center justify-center"
                  >
                    SAIR
                  </button>
                </div>
              </div>
            </div>

            {/* RENDER CANVAS CONTAINER */}
            <div className="relative w-full h-full flex flex-col justify-center items-center bg-[#0a0f1d]">
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
                selectedSkin={selectedSkin}
              />
            </div>

            {/* MOBILE TOUCH INTERACTIVE CONTROL SCREEN OVERLAY */}
            {isMobileDevice && <GameControls />}

            {/* --- LITE-MODAL A: VICTORY SUCCESS OVERLAY --- */}
            {gameState === GameState.VICTORY && victoryStats && (
              <div className="absolute inset-0 bg-slate-950/90 z-55 flex items-center justify-center p-2 backdrop-blur-xs animate-fade-in">
                <div className={`bg-linear-to-b from-indigo-900 to-indigo-950 border-4 border-amber-400 rounded-3xl text-center shadow-2xl relative flex flex-col items-center ${
                  isMobileDevice ? "p-4 py-3 max-w-sm w-11/12" : "p-8 max-w-md w-full"
                }`}>
                  {/* Sparkle icon */}
                  <div className={`absolute bg-amber-400 rounded-full border-4 border-indigo-900 shadow-lg ${
                    isMobileDevice ? "-top-8 p-2" : "-top-12 p-4"
                  }`}>
                    <Sparkles className={`${isMobileDevice ? "w-6 h-6" : "w-10 h-10"} text-slate-950 animate-spin`} />
                  </div>

                  <h1 className={`font-black text-amber-400 font-sans uppercase tracking-tight ${
                    isMobileDevice ? "text-xl mt-3 mb-1" : "text-3xl mt-6 mb-2"
                  }`}>
                    🎉 Vitória Régia!
                  </h1>
                  <p className={`text-slate-300 font-bold font-mono ${
                    isMobileDevice ? "text-[11px] mb-2" : "text-sm mb-6"
                  }`}>
                    Você conquistou o {victoryStats.levelName}!
                  </p>

                  {/* Custom Score logs */}
                  <div className={`w-full bg-slate-950/80 rounded-2xl font-mono text-xs flex flex-col text-slate-300 border border-indigo-800 ${
                    isMobileDevice ? "p-2.5 gap-1.5 mb-3 text-[10px]" : "p-4 gap-3 mb-6"
                  }`}>
                    <div className="flex justify-between border-b border-indigo-950 pb-1">
                       <span>Moedas Coletadas:</span>
                       <span className="text-amber-400 font-bold">{victoryStats.coins} 🪙</span>
                    </div>
                    <div className="flex justify-between border-b border-indigo-950 pb-1">
                       <span>Vidas Restantes:</span>
                       <span className="text-rose-400 font-bold">{victoryStats.lives} ❤️</span>
                    </div>
                    <div className="flex justify-between">
                       <span>Pontuação Total:</span>
                       <span className="text-white font-black">{score.toLocaleString()} PTS</span>
                    </div>
                  </div>

                  {/* High Score Form */}
                  {isHighScoreFormVisible && !hasSavedHighScore && (
                    <div className="w-full bg-slate-900/90 border border-amber-400 p-3.5 rounded-2xl mb-4 font-sans text-left">
                      <p className="text-[10px] uppercase font-black text-amber-400 flex items-center gap-1.5 mb-2">
                        <Trophy className="w-3.5 h-3.5 animate-bounce" />
                        Novo Recorde de Todos os Tempos!
                      </p>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={playerName}
                          onChange={(e) => setPlayerName(e.target.value)}
                          maxLength={15}
                          placeholder="Seu Nome"
                          className="flex-1 px-3 py-1.5 rounded-xl bg-black border border-white/20 text-white font-bold text-xs focus:outline-none focus:border-amber-400"
                        />
                        <button
                          onClick={() => {
                            saveHighScore(playerName, score, coins, victoryStats?.levelName || "Mundo");
                            setHasSavedHighScore(true);
                            setIsHighScoreFormVisible(false);
                          }}
                          className="px-4 py-1.5 bg-amber-400 hover:bg-amber-300 rounded-xl text-slate-950 font-black text-xs cursor-pointer shadow-md transition-all"
                        >
                          SALVAR
                        </button>
                      </div>
                    </div>
                  )}
                  {hasSavedHighScore && (
                    <div className="w-full bg-emerald-950/40 border border-emerald-500/30 p-2.5 rounded-xl mb-4 text-[10px] font-bold text-emerald-400 font-mono">
                      ✓ Recorde registrado com sucesso!
                    </div>
                  )}

                  {/* Modal Buttons panel */}
                  <div className={`flex w-full ${isMobileDevice ? "flex-row gap-2" : "flex-col gap-3"}`}>
                    <button
                      onClick={handleRetrySameLevel}
                      className="flex-1 py-2 bg-amber-400 hover:bg-amber-300 active:scale-98 transition-all rounded-xl text-slate-950 font-black cursor-pointer shadow-lg text-xs"
                    >
                      {currentLevelId < 3 ? "PRÓXIMO ►" : "JOGAR NOVAMENTE"}
                    </button>
                    <button
                      onClick={returnToMenu}
                      className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 active:scale-98 transition-all rounded-xl text-slate-300 font-bold cursor-pointer text-xs"
                    >
                      VOLTAR AO MENU
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* --- LITE-MODAL B: GAME OVER DEFEAT OVERLAY --- */}
            {gameState === GameState.GAME_OVER && gameOverStats && (
              <div className="absolute inset-0 bg-slate-950/90 z-55 flex items-center justify-center p-2 backdrop-blur-xs animate-fade-in">
                <div className={`bg-linear-to-b from-rose-950 to-slate-950 border-4 border-red-600 rounded-3xl text-center shadow-2xl relative flex flex-col items-center ${
                  isMobileDevice ? "p-4 py-3 max-w-sm w-11/12" : "p-8 max-w-md w-full"
                }`}>
                  {/* Warning icon */}
                  <div className={`absolute bg-red-600 rounded-full border-4 border-rose-950 shadow-lg ${
                    isMobileDevice ? "-top-8 p-2" : "-top-12 p-4"
                  }`}>
                    <AlertTriangle className={`${isMobileDevice ? "w-6 h-6 animate-pulse" : "w-10 h-10 animate-pulse"} text-white`} />
                  </div>

                  <h1 className={`font-black text-red-500 font-sans uppercase tracking-tight ${
                    isMobileDevice ? "text-xl mt-3 mb-1" : "text-3xl mt-6 mb-2"
                  }`}>
                    💀 GAME OVER
                  </h1>
                  <p className={`text-slate-300 font-bold font-mono ${
                    isMobileDevice ? "text-[11px] mb-2" : "text-sm mb-6"
                  }`}>
                    Infelizmente suas vidas se esgotaram...
                  </p>

                  {/* Custom Defeat Score logs */}
                  <div className={`w-full bg-slate-950/80 rounded-2xl font-mono text-xs flex flex-col text-slate-300 border border-red-950 ${
                    isMobileDevice ? "p-2.5 gap-1.5 mb-3 text-[10px]" : "p-4 gap-2 mb-6"
                  }`}>
                    <div className="flex justify-between">
                      <span>Parou no Mundo:</span>
                      <span className="text-cyan-400 font-bold">{gameOverStats.levelName}</span>
                    </div>
                    <div className="flex justify-between border-t border-red-950 pt-1.5">
                      <span>Moedas salvas:</span>
                      <span className="text-amber-400 font-bold">{gameOverStats.coins} 🪙</span>
                    </div>
                  </div>

                  {/* High Score Form */}
                  {isHighScoreFormVisible && !hasSavedHighScore && (
                    <div className="w-full bg-slate-900/90 border border-amber-400 p-3.5 rounded-2xl mb-4 font-sans text-left">
                      <p className="text-[10px] uppercase font-black text-amber-400 flex items-center gap-1.5 mb-2">
                        <Trophy className="w-3.5 h-3.5 animate-bounce" />
                        Novo Recorde de Todos os Tempos!
                      </p>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={playerName}
                          onChange={(e) => setPlayerName(e.target.value)}
                          maxLength={15}
                          placeholder="Seu Nome"
                          className="flex-1 px-3 py-1.5 rounded-xl bg-black border border-white/20 text-white font-bold text-xs focus:outline-none focus:border-amber-400"
                        />
                        <button
                          onClick={() => {
                            saveHighScore(playerName, score, coins, gameOverStats?.levelName || "Mundo");
                            setHasSavedHighScore(true);
                            setIsHighScoreFormVisible(false);
                          }}
                          className="px-4 py-1.5 bg-amber-400 hover:bg-amber-300 rounded-xl text-slate-950 font-black text-xs cursor-pointer shadow-md transition-all"
                        >
                          SALVAR
                        </button>
                      </div>
                    </div>
                  )}
                  {hasSavedHighScore && (
                    <div className="w-full bg-emerald-950/40 border border-emerald-500/30 p-2.5 rounded-xl mb-4 text-[10px] font-bold text-emerald-400 font-mono">
                      ✓ Recorde registrado com sucesso!
                    </div>
                  )}

                  {/* Defeat retry panel */}
                  <div className={`flex w-full ${isMobileDevice ? "flex-row gap-2" : "flex-col gap-3"}`}>
                    <button
                      onClick={handleRetrySameLevel}
                      className="flex-1 py-2 bg-red-600 hover:bg-red-500 active:scale-98 transition-all rounded-xl text-white font-black cursor-pointer shadow-lg flex items-center justify-center gap-1 text-xs"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      REENTRAR
                    </button>
                    <button
                      onClick={returnToMenu}
                      className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 active:scale-98 transition-all rounded-xl text-slate-300 font-bold cursor-pointer text-xs"
                    >
                      VOLTAR AO MENU
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </main>


    </div>
  );
}
