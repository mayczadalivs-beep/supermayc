import React from "react";
import { ArrowLeft, ArrowRight, ArrowDown, ArrowUp, Flame } from "lucide-react";

export const GameControls: React.FC = () => {
  // Dispatches synthetic event to integrate immediately with our global Canvas listeners
  const handleTouchStart = (code: string) => {
    window.dispatchEvent(new KeyboardEvent("keydown", { code }));
  };

  const handleTouchEnd = (code: string) => {
    window.dispatchEvent(new KeyboardEvent("keyup", { code }));
  };

  return (
    <div className="w-full bg-black/90 backdrop-blur-md border-t border-white/10 p-5 flex flex-col md:flex-row gap-4 justify-between items-center select-none">
      
      {/* Direction Pad */}
      <div className="flex items-center gap-2">
        <div className="text-[10px] font-mono font-bold text-blue-200/60 uppercase tracking-[0.2em] mr-2">
          Controle Digital:
        </div>
        
        {/* Left Arrow */}
        <button
          onMouseDown={() => handleTouchStart("ArrowLeft")}
          onMouseUp={() => handleTouchEnd("ArrowLeft")}
          onMouseLeave={() => handleTouchEnd("ArrowLeft")}
          onTouchStart={(e) => { e.preventDefault(); handleTouchStart("ArrowLeft"); }}
          onTouchEnd={(e) => { e.preventDefault(); handleTouchEnd("ArrowLeft"); }}
          className="w-14 h-14 bg-black border border-white/15 hover:border-white/25 rounded-2xl text-white flex justify-center items-center shadow-lg hover:shadow-[0_0_12px_rgba(255,255,255,0.15)] active:scale-95 transition-all duration-100 cursor-pointer touch-none"
        >
          <ArrowLeft className="w-5 h-5 text-slate-200" />
        </button>

        {/* Down Arrow (Crouch) */}
        <button
          onMouseDown={() => handleTouchStart("ArrowDown")}
          onMouseUp={() => handleTouchEnd("ArrowDown")}
          onMouseLeave={() => handleTouchEnd("ArrowDown")}
          onTouchStart={(e) => { e.preventDefault(); handleTouchStart("ArrowDown"); }}
          onTouchEnd={(e) => { e.preventDefault(); handleTouchEnd("ArrowDown"); }}
          className="w-14 h-14 bg-black border border-white/15 hover:border-white/25 rounded-2xl text-white flex justify-center items-center shadow-lg hover:shadow-[0_0_12px_rgba(255,255,255,0.15)] active:scale-95 transition-all duration-100 cursor-pointer touch-none"
          title="Abaixar / Agachar"
        >
          <ArrowDown className="w-5 h-5 text-slate-200" />
        </button>

        {/* Right Arrow */}
        <button
          onMouseDown={() => handleTouchStart("ArrowRight")}
          onMouseUp={() => handleTouchEnd("ArrowRight")}
          onMouseLeave={() => handleTouchEnd("ArrowRight")}
          onTouchStart={(e) => { e.preventDefault(); handleTouchStart("ArrowRight"); }}
          onTouchEnd={(e) => { e.preventDefault(); handleTouchEnd("ArrowRight"); }}
          className="w-14 h-14 bg-black border border-white/15 hover:border-white/25 rounded-2xl text-white flex justify-center items-center shadow-lg hover:shadow-[0_0_12px_rgba(255,255,255,0.15)] active:scale-95 transition-all duration-100 cursor-pointer touch-none"
        >
          <ArrowRight className="w-5 h-5 text-slate-200" />
        </button>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-4 font-display">
        
        {/* Jump Button (W) */}
        <button
          onMouseDown={() => handleTouchStart("Space")}
          onMouseUp={() => handleTouchEnd("Space")}
          onMouseLeave={() => handleTouchEnd("Space")}
          onTouchStart={(e) => { e.preventDefault(); handleTouchStart("Space"); }}
          onTouchEnd={(e) => { e.preventDefault(); handleTouchEnd("Space"); }}
          className="px-6 h-14 bg-white text-black hover:bg-slate-100 active:bg-slate-200 border-2 border-white rounded-2xl font-black text-xs tracking-wider shadow-[0_0_15px_rgba(255,255,255,0.45)] active:scale-95 transition-all duration-100 flex items-center gap-2 cursor-pointer touch-none"
        >
          <ArrowUp className="w-4 h-4 animate-bounce text-black" />
          <span>PULAR (Espaço)</span>
        </button>

        {/* Attack Fire projectile */}
        <button
          onMouseDown={() => handleTouchStart("KeyE")}
          onMouseUp={() => handleTouchEnd("KeyE")}
          onMouseLeave={() => handleTouchEnd("KeyE")}
          onTouchStart={(e) => { e.preventDefault(); handleTouchStart("KeyE"); }}
          onTouchEnd={(e) => { e.preventDefault(); handleTouchEnd("KeyE"); }}
          className="px-6 h-14 bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-black border-2 border-amber-450 rounded-2xl font-black text-xs tracking-wider shadow-[0_0_15px_rgba(245,158,11,0.35)] active:scale-95 transition-all duration-100 flex items-center gap-2 cursor-pointer touch-none"
          title="Atacar com Fogo"
        >
          <Flame className="w-4 h-4 fill-black" />
          <span>FOGO (Tecla E)</span>
        </button>
      </div>
    </div>
  );
};
