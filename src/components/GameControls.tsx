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
    <div className="w-full bg-black/95 backdrop-blur-md border-t border-white/10 p-4 px-6 flex flex-row justify-between items-center select-none">
      
      {/* Direction Pad (Left Cluster) */}
      <div className="flex items-center gap-2.5">
        {/* Left Arrow */}
        <button
          onMouseDown={() => handleTouchStart("ArrowLeft")}
          onMouseUp={() => handleTouchEnd("ArrowLeft")}
          onMouseLeave={() => handleTouchEnd("ArrowLeft")}
          onTouchStart={(e) => { e.preventDefault(); handleTouchStart("ArrowLeft"); }}
          onTouchEnd={(e) => { e.preventDefault(); handleTouchEnd("ArrowLeft"); }}
          className="w-16 h-16 bg-slate-900 border border-white/20 active:bg-blue-600 active:border-blue-450 rounded-2xl text-white flex justify-center items-center shadow-lg active:scale-90 transition-all duration-75 text-xl select-none touch-none cursor-pointer"
        >
          <ArrowLeft className="w-6 h-6 text-slate-100" />
        </button>

        {/* Down Arrow (Crouch - Settle down onto pipes or shrink size) */}
        <button
          onMouseDown={() => handleTouchStart("ArrowDown")}
          onMouseUp={() => handleTouchEnd("ArrowDown")}
          onMouseLeave={() => handleTouchEnd("ArrowDown")}
          onTouchStart={(e) => { e.preventDefault(); handleTouchStart("ArrowDown"); }}
          onTouchEnd={(e) => { e.preventDefault(); handleTouchEnd("ArrowDown"); }}
          className="w-16 h-16 bg-slate-900 border border-white/20 active:bg-blue-600 active:border-blue-450 rounded-2xl text-white flex justify-center items-center shadow-lg active:scale-90 transition-all duration-75 text-xl select-none touch-none cursor-pointer"
          title="Abaixar / Agachar"
        >
          <ArrowDown className="w-6 h-6 text-slate-100" />
        </button>

        {/* Right Arrow */}
        <button
          onMouseDown={() => handleTouchStart("ArrowRight")}
          onMouseUp={() => handleTouchEnd("ArrowRight")}
          onMouseLeave={() => handleTouchEnd("ArrowRight")}
          onTouchStart={(e) => { e.preventDefault(); handleTouchStart("ArrowRight"); }}
          onTouchEnd={(e) => { e.preventDefault(); handleTouchEnd("ArrowRight"); }}
          className="w-16 h-16 bg-slate-900 border border-white/20 active:bg-blue-600 active:border-blue-450 rounded-2xl text-white flex justify-center items-center shadow-lg active:scale-90 transition-all duration-75 text-xl select-none touch-none cursor-pointer"
        >
          <ArrowRight className="w-6 h-6 text-slate-100" />
        </button>
      </div>

      {/* Action Buttons (Right Cluster) */}
      <div className="flex items-center gap-3">
        {/* Attack Fire projectile (KeyE) */}
        <button
          onMouseDown={() => handleTouchStart("KeyE")}
          onMouseUp={() => handleTouchEnd("KeyE")}
          onMouseLeave={() => handleTouchEnd("KeyE")}
          onTouchStart={(e) => { e.preventDefault(); handleTouchStart("KeyE"); }}
          onTouchEnd={(e) => { e.preventDefault(); handleTouchEnd("KeyE"); }}
          className="w-20 h-16 bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-black border-2 border-amber-450 rounded-2xl font-black text-xs uppercase tracking-wider shadow-[0_0_15px_rgba(245,158,11,0.35)] active:scale-90 transition-all duration-75 flex flex-col justify-center items-center gap-1 select-none touch-none cursor-pointer"
          title="Atacar com Fogo"
        >
          <Flame className="w-5 h-5 fill-black" />
          <span className="text-[10px] font-black tracking-normal">FOGO</span>
        </button>

        {/* Jump Button (Space) */}
        <button
          onMouseDown={() => handleTouchStart("Space")}
          onMouseUp={() => handleTouchEnd("Space")}
          onMouseLeave={() => handleTouchEnd("Space")}
          onTouchStart={(e) => { e.preventDefault(); handleTouchStart("Space"); }}
          onTouchEnd={(e) => { e.preventDefault(); handleTouchEnd("Space"); }}
          className="w-24 h-16 bg-white hover:bg-slate-100 active:bg-blue-100 border-2 border-white rounded-2xl font-black text-xs uppercase tracking-wider text-black shadow-[0_0_15px_rgba(255,255,255,0.45)] active:scale-90 transition-all duration-75 flex flex-col justify-center items-center gap-1 select-none touch-none cursor-pointer"
        >
          <ArrowUp className="w-5 h-5 text-black" />
          <span className="text-[10px] font-black tracking-normal">PULAR</span>
        </button>
      </div>
    </div>
  );
};
