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
    <div className="absolute bottom-14 sm:bottom-16 left-0 right-0 z-30 bg-transparent px-4 sm:px-6 py-2 flex flex-row justify-between items-end select-none pointer-events-none md:hidden w-full">
      
      {/* Left Pad - Movement Cluster (Thumb Left) */}
      <div className="flex items-center gap-2 pointer-events-auto bg-black/30 p-2 rounded-3xl backdrop-blur-xs border border-white/10 shadow-lg">
        {/* Left Arrow */}
        <button
          onMouseDown={() => handleTouchStart("ArrowLeft")}
          onMouseUp={() => handleTouchEnd("ArrowLeft")}
          onMouseLeave={() => handleTouchEnd("ArrowLeft")}
          onTouchStart={(e) => { e.preventDefault(); handleTouchStart("ArrowLeft"); }}
          onTouchEnd={(e) => { e.preventDefault(); handleTouchEnd("ArrowLeft"); }}
          className="w-14 h-14 bg-slate-950/60 active:bg-blue-600/80 active:scale-90 border border-white/20 rounded-full text-white flex justify-center items-center shadow-md transition-all duration-75 select-none touch-none cursor-pointer"
          title="Mover de esquerda"
        >
          <ArrowLeft className="w-5 h-5 text-slate-100" />
        </button>

        {/* Down Arrow (Crouch / Enter Pipes) */}
        <button
          onMouseDown={() => handleTouchStart("ArrowDown")}
          onMouseUp={() => handleTouchEnd("ArrowDown")}
          onMouseLeave={() => handleTouchEnd("ArrowDown")}
          onTouchStart={(e) => { e.preventDefault(); handleTouchStart("ArrowDown"); }}
          onTouchEnd={(e) => { e.preventDefault(); handleTouchEnd("ArrowDown"); }}
          className="w-12 h-12 bg-slate-950/40 active:bg-blue-600/60 active:scale-90 border border-white/10 rounded-full text-white flex justify-center items-center shadow-sm transition-all duration-75 select-none touch-none cursor-pointer"
          title="Agachar"
        >
          <ArrowDown className="w-4 h-4 text-slate-300" />
        </button>

        {/* Right Arrow */}
        <button
          onMouseDown={() => handleTouchStart("ArrowRight")}
          onMouseUp={() => handleTouchEnd("ArrowRight")}
          onMouseLeave={() => handleTouchEnd("ArrowRight")}
          onTouchStart={(e) => { e.preventDefault(); handleTouchStart("ArrowRight"); }}
          onTouchEnd={(e) => { e.preventDefault(); handleTouchEnd("ArrowRight"); }}
          className="w-14 h-14 bg-slate-950/60 active:bg-blue-600/80 active:scale-90 border border-white/20 rounded-full text-white flex justify-center items-center shadow-md transition-all duration-75 select-none touch-none cursor-pointer"
          title="Mover de direita"
        >
          <ArrowRight className="w-5 h-5 text-slate-100" />
        </button>
      </div>

      {/* Right Pad - Action Cluster (Thumb Right) */}
      <div className="flex items-center gap-3 pointer-events-auto bg-black/30 p-2 rounded-3xl backdrop-blur-xs border border-white/10 shadow-lg">
        {/* Fire Attack */}
        <button
          onMouseDown={() => handleTouchStart("KeyE")}
          onMouseUp={() => handleTouchEnd("KeyE")}
          onMouseLeave={() => handleTouchEnd("KeyE")}
          onTouchStart={(e) => { e.preventDefault(); handleTouchStart("KeyE"); }}
          onTouchEnd={(e) => { e.preventDefault(); handleTouchEnd("KeyE"); }}
          className="w-14 h-14 bg-amber-500/30 active:bg-amber-600/80 border border-amber-400/40 rounded-full flex flex-col justify-center items-center text-amber-200 shadow-md active:scale-90 transition-all duration-75 select-none touch-none cursor-pointer"
          title="Lançar Fogo"
        >
          <Flame className="w-5 h-5 fill-amber-300 text-amber-300" />
          <span className="text-[8px] font-black tracking-normal">FOGO</span>
        </button>

        {/* Jump Button (Primary and Largest) */}
        <button
          onMouseDown={() => handleTouchStart("Space")}
          onMouseUp={() => handleTouchEnd("Space")}
          onMouseLeave={() => handleTouchEnd("Space")}
          onTouchStart={(e) => { e.preventDefault(); handleTouchStart("Space"); }}
          onTouchEnd={(e) => { e.preventDefault(); handleTouchEnd("Space"); }}
          className="w-16 h-16 bg-white/20 active:bg-blue-500/80 border-2 border-white/40 rounded-full flex flex-col justify-center items-center text-white shadow-lg active:scale-90 transition-all duration-75 select-none touch-none cursor-pointer"
          title="Pular"
        >
          <ArrowUp className="w-6 h-6 text-white" />
          <span className="text-[9px] font-extrabold tracking-normal">PULAR</span>
        </button>
      </div>
    </div>
  );
};

