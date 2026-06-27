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
    <div className="absolute bottom-2 left-0 right-0 z-30 bg-transparent px-4 py-1.5 flex flex-row justify-between items-end select-none pointer-events-none md:hidden w-full">
      
      {/* Left Pad - Movement Cluster (Thumb Left) - Ultra Transparent & Sleek */}
      <div className="flex items-center gap-1.5 pointer-events-auto bg-transparent">
        {/* Left Arrow */}
        <button
          onMouseDown={() => handleTouchStart("ArrowLeft")}
          onMouseUp={() => handleTouchEnd("ArrowLeft")}
          onMouseLeave={() => handleTouchEnd("ArrowLeft")}
          onTouchStart={(e) => { e.preventDefault(); handleTouchStart("ArrowLeft"); }}
          onTouchEnd={(e) => { e.preventDefault(); handleTouchEnd("ArrowLeft"); }}
          className="w-12 h-12 bg-black/25 active:bg-blue-600/80 active:scale-90 border border-white/10 rounded-full text-white/60 active:text-white flex justify-center items-center shadow-md transition-all duration-75 select-none touch-none cursor-pointer"
          title="Mover para esquerda"
        >
          <ArrowLeft className="w-5 h-5 text-slate-200" />
        </button>
 
        {/* Down Arrow (Crouch / Enter Pipes) */}
        <button
          onMouseDown={() => handleTouchStart("ArrowDown")}
          onMouseUp={() => handleTouchEnd("ArrowDown")}
          onMouseLeave={() => handleTouchEnd("ArrowDown")}
          onTouchStart={(e) => { e.preventDefault(); handleTouchStart("ArrowDown"); }}
          onTouchEnd={(e) => { e.preventDefault(); handleTouchEnd("ArrowDown"); }}
          className="w-10 h-10 bg-black/20 active:bg-blue-600/70 active:scale-90 border border-white/10 rounded-full text-white/50 active:text-white flex justify-center items-center shadow-sm transition-all duration-75 select-none touch-none cursor-pointer"
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
          className="w-12 h-12 bg-black/25 active:bg-blue-600/80 active:scale-90 border border-white/10 rounded-full text-white/60 active:text-white flex justify-center items-center shadow-md transition-all duration-75 select-none touch-none cursor-pointer"
          title="Mover para direita"
        >
          <ArrowRight className="w-5 h-5 text-slate-200" />
        </button>
      </div>
 
      {/* Right Pad - Action Cluster (Thumb Right) - Ultra Transparent & Sleek */}
      <div className="flex items-center gap-2 pointer-events-auto bg-transparent">
        {/* Fire Attack */}
        <button
          onMouseDown={() => handleTouchStart("KeyE")}
          onMouseUp={() => handleTouchEnd("KeyE")}
          onMouseLeave={() => handleTouchEnd("KeyE")}
          onTouchStart={(e) => { e.preventDefault(); handleTouchStart("KeyE"); }}
          onTouchEnd={(e) => { e.preventDefault(); handleTouchEnd("KeyE"); }}
          className="w-11 h-11 bg-amber-500/15 active:bg-amber-600/80 border border-amber-400/20 rounded-full flex flex-col justify-center items-center text-amber-200/60 active:text-amber-100 active:scale-95 transition-all duration-75 select-none touch-none cursor-pointer"
          title="Lançar Fogo"
        >
          <Flame className="w-3.5 h-3.5 fill-amber-300/40 text-amber-300/60 active:fill-amber-300 active:text-amber-300" />
          <span className="text-[6.5px] font-black tracking-normal mt-0.5">FOGO</span>
        </button>
 
        {/* Jump Button (Primary and Largest) */}
        <button
          onMouseDown={() => handleTouchStart("Space")}
          onMouseUp={() => handleTouchEnd("Space")}
          onMouseLeave={() => handleTouchEnd("Space")}
          onTouchStart={(e) => { e.preventDefault(); handleTouchStart("Space"); }}
          onTouchEnd={(e) => { e.preventDefault(); handleTouchEnd("Space"); }}
          className="w-13 h-13 bg-white/10 active:bg-blue-500/80 border border-white/25 rounded-full flex flex-col justify-center items-center text-white/65 active:text-white active:scale-90 transition-all duration-75 select-none touch-none cursor-pointer shadow-sm"
          title="Pular"
        >
          <ArrowUp className="w-5 h-5 text-slate-200" />
          <span className="text-[7.5px] font-black tracking-normal mt-0.5">PULAR</span>
        </button>
      </div>
    </div>
  );
};

