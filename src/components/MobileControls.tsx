import React, { useRef } from 'react';
import {
  Sword,
  Hand,
  Sparkles,
  Utensils,
  Backpack,
  Hammer,
  Store,
  Compass,
  Mic,
  Shield,
  Zap,
  RotateCcw,
  SlidersHorizontal,
} from 'lucide-react';

interface MobileControlsProps {
  onMoveChange: (dx: number, dy: number) => void;
  onAttack: () => void;
  onInteract: () => void;
  onDash: () => void;
  onQuickEat: () => void;
  onCycleTool: () => void;
  onOpenModal: (
    modal:
      | 'inventory'
      | 'crafting'
      | 'cooking'
      | 'housing'
      | 'shop'
      | 'skills'
      | 'guild'
      | 'voice'
      | 'quest'
      | 'mods'
      | 'character'
  ) => void;
  isRightHanded: boolean;
  onToggleHandedness: () => void;
  equippedToolName?: string;
}

export const MobileControls: React.FC<MobileControlsProps> = ({
  onMoveChange,
  onAttack,
  onInteract,
  onDash,
  onQuickEat,
  onCycleTool,
  onOpenModal,
  isRightHanded,
  onToggleHandedness,
  equippedToolName,
}) => {
  const dpadActiveDir = useRef<{ dx: number; dy: number }>({ dx: 0, dy: 0 });

  const handleDpadStart = (dx: number, dy: number) => {
    dpadActiveDir.current = { dx, dy };
    onMoveChange(dx, dy);
  };

  const handleDpadEnd = () => {
    dpadActiveDir.current = { dx: 0, dy: 0 };
    onMoveChange(0, 0);
  };

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-2 select-none z-20">
      {/* Top Quick Bar (Minimal & Compact) */}
      <div className="flex items-center justify-between pointer-events-auto">
        <div className="flex items-center gap-1.5 bg-slate-900/85 backdrop-blur-sm border border-slate-700/80 rounded-xl px-2.5 py-1 text-xs shadow-md">
          <button
            onClick={onToggleHandedness}
            className="flex items-center gap-1 text-slate-300 hover:text-white px-1 py-0.5"
            title="Ubah posisi jempol satu tangan"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-[11px] font-medium">{isRightHanded ? 'Kanan' : 'Kiri'}</span>
          </button>
        </div>

        {/* Top-Right Quick Menu Triggers */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => onOpenModal('quest')}
            className="pointer-events-auto bg-amber-950/80 border border-amber-600/70 text-amber-300 rounded-xl px-2.5 py-1 text-xs font-medium flex items-center gap-1 shadow-md active:scale-95 transition-transform"
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Misi</span>
          </button>
          <button
            onClick={() => onOpenModal('voice')}
            className="pointer-events-auto bg-blue-950/80 border border-blue-500/70 text-blue-300 rounded-xl px-2.5 py-1 text-xs font-medium flex items-center gap-1 shadow-md active:scale-95 transition-transform"
          >
            <Mic className="w-3.5 h-3.5" />
            <span>Voice & Chat</span>
          </button>
        </div>
      </div>

      {/* Middle Spacer - Leaves 85%+ screen playfield clear */}
      <div className="flex-1" />

      {/* Bottom Area: Controls Layout Optimized for One-Handed Thumb Reach */}
      <div
        className={`flex items-end justify-between gap-3 pointer-events-auto pb-1.5 ${
          !isRightHanded ? 'flex-row-reverse' : ''
        }`}
      >
        {/* D-PAD / Movement Thumb Cluster */}
        <div className="relative w-36 h-36 bg-slate-950/70 backdrop-blur-md rounded-full border border-slate-700/80 p-2 shadow-2xl flex items-center justify-center">
          {/* UP Button */}
          <button
            onPointerDown={(e) => {
              e.currentTarget.setPointerCapture(e.pointerId);
              handleDpadStart(0, -1);
            }}
            onPointerUp={handleDpadEnd}
            onPointerCancel={handleDpadEnd}
            className="absolute top-1 left-12 w-12 h-11 bg-slate-800 active:bg-amber-600 text-slate-200 active:text-white rounded-t-xl flex items-center justify-center text-sm font-bold border-t border-x border-slate-600 active:scale-95 transition-all shadow-md"
          >
            ▲
          </button>

          {/* DOWN Button */}
          <button
            onPointerDown={(e) => {
              e.currentTarget.setPointerCapture(e.pointerId);
              handleDpadStart(0, 1);
            }}
            onPointerUp={handleDpadEnd}
            onPointerCancel={handleDpadEnd}
            className="absolute bottom-1 left-12 w-12 h-11 bg-slate-800 active:bg-amber-600 text-slate-200 active:text-white rounded-b-xl flex items-center justify-center text-sm font-bold border-b border-x border-slate-600 active:scale-95 transition-all shadow-md"
          >
            ▼
          </button>

          {/* LEFT Button */}
          <button
            onPointerDown={(e) => {
              e.currentTarget.setPointerCapture(e.pointerId);
              handleDpadStart(-1, 0);
            }}
            onPointerUp={handleDpadEnd}
            onPointerCancel={handleDpadEnd}
            className="absolute left-1 top-12 w-11 h-12 bg-slate-800 active:bg-amber-600 text-slate-200 active:text-white rounded-l-xl flex items-center justify-center text-sm font-bold border-l border-y border-slate-600 active:scale-95 transition-all shadow-md"
          >
            ◀
          </button>

          {/* RIGHT Button */}
          <button
            onPointerDown={(e) => {
              e.currentTarget.setPointerCapture(e.pointerId);
              handleDpadStart(1, 0);
            }}
            onPointerUp={handleDpadEnd}
            onPointerCancel={handleDpadEnd}
            className="absolute right-1 top-12 w-11 h-12 bg-slate-800 active:bg-amber-600 text-slate-200 active:text-white rounded-r-xl flex items-center justify-center text-sm font-bold border-r border-y border-slate-600 active:scale-95 transition-all shadow-md"
          >
            ▶
          </button>

          {/* Center Hub */}
          <div className="w-10 h-10 bg-slate-900 border border-slate-700 rounded-full flex items-center justify-center text-[9px] text-slate-400 font-mono">
            PAD
          </div>
        </div>

        {/* Center Dock: Quick Thumb Drawer (Scrollable or Clean Row) */}
        <div className="flex-1 max-w-[210px] bg-slate-950/80 backdrop-blur-md border border-slate-800/90 rounded-2xl p-1.5 shadow-xl">
          <div className="grid grid-cols-5 gap-1.5 text-center">
            <button
              onClick={() => onOpenModal('inventory')}
              className="flex flex-col items-center justify-center py-1 bg-slate-800/90 hover:bg-slate-700 text-amber-300 rounded-lg active:scale-95 transition-all"
              title="Tas Inventori"
            >
              <Backpack className="w-4 h-4" />
              <span className="text-[9px] mt-0.5">Tas</span>
            </button>
            <button
              onClick={() => onOpenModal('crafting')}
              className="flex flex-col items-center justify-center py-1 bg-slate-800/90 hover:bg-slate-700 text-emerald-300 rounded-lg active:scale-95 transition-all"
              title="Crafting Survival"
            >
              <Hammer className="w-4 h-4" />
              <span className="text-[9px] mt-0.5">Craft</span>
            </button>
            <button
              onClick={() => onOpenModal('cooking')}
              className="flex flex-col items-center justify-center py-1 bg-slate-800/90 hover:bg-slate-700 text-orange-300 rounded-lg active:scale-95 transition-all"
              title="Masak & Tani"
            >
              <Utensils className="w-4 h-4" />
              <span className="text-[9px] mt-0.5">Masak</span>
            </button>
            <button
              onClick={() => onOpenModal('housing')}
              className="flex flex-col items-center justify-center py-1 bg-slate-800/90 hover:bg-slate-700 text-blue-300 rounded-lg active:scale-95 transition-all"
              title="Membangun Rumah"
            >
              <Store className="w-4 h-4" />
              <span className="text-[9px] mt-0.5">Rumah</span>
            </button>
            <button
              onClick={() => onOpenModal('shop')}
              className="flex flex-col items-center justify-center py-1 bg-slate-800/90 hover:bg-slate-700 text-yellow-300 rounded-lg active:scale-95 transition-all"
              title="Warung / Toko Pemain"
            >
              <Store className="w-4 h-4" />
              <span className="text-[9px] mt-0.5">Toko</span>
            </button>
          </div>

          <div className="grid grid-cols-5 gap-1.5 text-center mt-1">
            <button
              onClick={() => onOpenModal('skills')}
              className="flex flex-col items-center justify-center py-1 bg-slate-800/90 hover:bg-slate-700 text-purple-300 rounded-lg active:scale-95 transition-all"
              title="Skill Tree"
            >
              <Sparkles className="w-4 h-4" />
              <span className="text-[9px] mt-0.5">Skill</span>
            </button>
            <button
              onClick={() => onOpenModal('guild')}
              className="flex flex-col items-center justify-center py-1 bg-slate-800/90 hover:bg-slate-700 text-cyan-300 rounded-lg active:scale-95 transition-all"
              title="Guild & Multiplayer"
            >
              <Shield className="w-4 h-4" />
              <span className="text-[9px] mt-0.5">Guild</span>
            </button>
            <button
              onClick={() => onOpenModal('mods')}
              className="flex flex-col items-center justify-center py-1 bg-slate-800/90 hover:bg-slate-700 text-rose-300 rounded-lg active:scale-95 transition-all"
              title="Mod Manager"
            >
              <Zap className="w-4 h-4" />
              <span className="text-[9px] mt-0.5">Mod</span>
            </button>
            <button
              onClick={() => onOpenModal('character')}
              className="flex flex-col items-center justify-center py-1 bg-slate-800/90 hover:bg-slate-700 text-pink-300 rounded-lg active:scale-95 transition-all"
              title="Kustom Karakter"
            >
              <span className="text-xs">👤</span>
              <span className="text-[9px] mt-0.5">Hero</span>
            </button>
            <button
              onClick={onCycleTool}
              className="flex flex-col items-center justify-center py-1 bg-amber-900/60 border border-amber-600/60 hover:bg-amber-800 text-amber-200 rounded-lg active:scale-95 transition-all"
              title="Ganti Alat / Senjata"
            >
              <RotateCcw className="w-4 h-4" />
              <span className="text-[9px] mt-0.5 truncate max-w-[34px]">Tukar</span>
            </button>
          </div>
        </div>

        {/* TACTILE ACTION BUTTON CLUSTER (Primary Thumb Zone) */}
        <div className="relative w-36 h-36 flex items-center justify-center">
          {/* Button A: Main Attack / Action (Oversized Primary Button) */}
          <button
            onClick={onAttack}
            className="absolute bottom-1 right-2 w-16 h-16 rounded-full bg-gradient-to-br from-red-500 to-rose-700 text-white font-bold flex flex-col items-center justify-center shadow-lg shadow-rose-900/50 active:scale-90 active:from-red-600 active:to-rose-800 transition-transform border-2 border-rose-300"
            title="Serang / Tebas (Spasi / Klik)"
          >
            <Sword className="w-6 h-6 drop-shadow" />
            <span className="text-[10px] uppercase font-bold tracking-wider">Aksi</span>
          </button>

          {/* Button B: Harvest / Interact / Fish / Talk */}
          <button
            onClick={onInteract}
            className="absolute top-1 right-6 w-13 h-13 rounded-full bg-gradient-to-br from-emerald-500 to-teal-700 text-white font-bold flex flex-col items-center justify-center shadow-md active:scale-90 border-2 border-emerald-300 transition-transform"
            title="Interaksi / Panen / Mancing (E)"
          >
            <Hand className="w-5 h-5 drop-shadow" />
            <span className="text-[9px] uppercase font-bold">Ambil</span>
          </button>

          {/* Button C: Dash / Roll */}
          <button
            onClick={onDash}
            className="absolute bottom-5 left-1 w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-700 text-white font-bold flex flex-col items-center justify-center shadow-md active:scale-90 border-2 border-blue-300 transition-transform"
            title="Dash / Hindar (Shift)"
          >
            <Zap className="w-5 h-5 drop-shadow" />
            <span className="text-[9px] uppercase font-bold">Dash</span>
          </button>

          {/* Button D: Quick Eat / Heal */}
          <button
            onClick={onQuickEat}
            className="absolute top-1 left-4 w-11 h-11 rounded-full bg-gradient-to-br from-amber-500 to-orange-700 text-white font-bold flex flex-col items-center justify-center shadow-md active:scale-90 border-2 border-amber-300 transition-transform"
            title="Makan Cepat (F)"
          >
            <Utensils className="w-4 h-4 drop-shadow" />
            <span className="text-[8px] uppercase font-bold">Makan</span>
          </button>
        </div>
      </div>
    </div>
  );
};
