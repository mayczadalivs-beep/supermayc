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
    <div className="absolute bottom-3 left-0 right-0 z-30 bg-transparent px-6 py-2 flex flex-row justify-between items-end select-none pointer-events-none md:hidden w-full">
      
      {/* Left Pad - Movement Cluster (Thumb Left) */}
      <div className="flex items-center gap-2.5 pointer-events-auto bg-black/40 p-2.5 rounded-full backdrop-blur-md border border-white/10 shadow-2xl">
        {/* Left Arrow */}
        <button
          onMouseDown={() => handleTouchStart("ArrowLeft")}
          onMouseUp={() => handleTouchEnd("ArrowLeft")}
          onMouseLeave={() => handleTouchEnd("ArrowLeft")}
          onTouchStart={(e) => { e.preventDefault(); handleTouchStart("ArrowLeft"); }}
          onTouchEnd={(e) => { e.preventDefault(); handleTouchEnd("ArrowLeft"); }}
          className="w-14 h-14 bg-slate-950/65 active:bg-blue-600/80 active:scale-90 border border-white/20 rounded-full text-white flex justify-center items-center shadow-lg transition-all duration-75 select-none touch-none cursor-pointer"
          title="Mover para esquerda"
        >
          <ArrowLeft className="w-6 h-6 text-slate-100" />
        </button>
 
        {/* Down Arrow (Crouch / Enter Pipes) */}
        <button
          onMouseDown={() => handleTouchStart("ArrowDown")}
          onMouseUp={() => handleTouchEnd("ArrowDown")}
          onMouseLeave={() => handleTouchEnd("ArrowDown")}
          onTouchStart={(e) => { e.preventDefault(); handleTouchStart("ArrowDown"); }}
          onTouchEnd={(e) => { e.preventDefault(); handleTouchEnd("ArrowDown"); }}
          className="w-11 h-11 bg-slate-950/45 active:bg-blue-600/60 active:scale-90 border border-white/10 rounded-full text-white flex justify-center items-center shadow-md transition-all duration-75 select-none touch-none cursor-pointer"
          title="Agachar"
        >
          <ArrowDown className="w-5 h-5 text-slate-300" />
        </button>
 
        {/* Right Arrow */}
        <button
          onMouseDown={() => handleTouchStart("ArrowRight")}
          onMouseUp={() => handleTouchEnd("ArrowRight")}
          onMouseLeave={() => handleTouchEnd("ArrowRight")}
          onTouchStart={(e) => { e.preventDefault(); handleTouchStart("ArrowRight"); }}
          onTouchEnd={(e) => { e.preventDefault(); handleTouchEnd("ArrowRight"); }}
          className="w-14 h-14 bg-slate-950/65 active:bg-blue-600/80 active:scale-90 border border-white/20 rounded-full text-white flex justify-center items-center shadow-lg transition-all duration-75 select-none touch-none cursor-pointer"
          title="Mover para direita"
        >
          <ArrowRight className="w-6 h-6 text-slate-100" />
        </button>
      </div>
 
      {/* Right Pad - Action Cluster (Thumb Right) */}
      <div className="flex items-center gap-3.5 pointer-events-auto bg-black/40 p-2.5 rounded-full backdrop-blur-md border border-white/10 shadow-2xl">
        {/* Fire Attack */}
        <button
          onMouseDown={() => handleTouchStart("KeyE")}
          onMouseUp={() => handleTouchEnd("KeyE")}
          onMouseLeave={() => handleTouchEnd("KeyE")}
          onTouchStart={(e) => { e.preventDefault(); handleTouchStart("KeyE"); }}
          onTouchEnd={(e) => { e.preventDefault(); handleTouchEnd("KeyE"); }}
          className="w-13 h-13 bg-amber-500/25 active:bg-amber-600/80 border border-amber-400/30 rounded-full flex flex-col justify-center items-center text-amber-200 shadow-md active:scale-95 transition-all duration-75 select-none touch-none cursor-pointer"
          title="Lançar Fogo"
        >
          <Flame className="w-4 h-4 fill-amber-300 text-amber-300" />
          <span className="text-[7px] font-black tracking-normal mt-0.5">FOGO</span>
        </button>
 
        {/* Jump Button (Primary and Largest) */}
        <button
          onMouseDown={() => handleTouchStart("Space")}
          onMouseUp={() => handleTouchEnd("Space")}
          onMouseLeave={() => handleTouchEnd("Space")}
          onTouchStart={(e) => { e.preventDefault(); handleTouchStart("Space"); }}
          onTouchEnd={(e) => { e.preventDefault(); handleTouchEnd("Space"); }}
          className="w-16 h-16 bg-white/15 active:bg-blue-500/85 border-2 border-white/35 rounded-full flex flex-col justify-center items-center text-white shadow-xl active:scale-90 transition-all duration-75 select-none touch-none cursor-pointer"
          title="Pular"
        >
          <ArrowUp className="w-7 h-7 text-white" />
          <span className="text-[8px] font-extrabold tracking-normal mt-0.5">PULAR</span>
        </button>
      </div>
    </div>
  );
};

