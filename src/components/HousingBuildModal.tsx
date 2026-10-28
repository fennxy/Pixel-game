import React, { useState } from 'react';
import { StructureType, InventorySlot } from '../types/game';
import { X, Home, Hammer, Shield, Flame, Bed, Box, Wrench, Store } from 'lucide-react';
import { sound } from '../utils/audio';

interface HousingBuildModalProps {
  isOpen: boolean;
  onClose: () => void;
  inventory: InventorySlot[];
  onSelectStructureToPlace: (type: StructureType) => void;
  activePlacingType: StructureType | null;
}

interface StructureOption {
  type: StructureType;
  name: string;
  icon: string;
  description: string;
  costDesc: string;
  neededItemId: string;
}

const BUILD_OPTIONS: StructureOption[] = [
  {
    type: 'wall_wood',
    name: 'Dinding Kayu',
    icon: '🪵',
    description: 'Dinding kayu pertahanan dasar untuk rumah.',
    costDesc: '1 Item Dinding Kayu',
    neededItemId: 'wall_wood',
  },
  {
    type: 'wall_stone',
    name: 'Dinding Batu',
    icon: '🧱',
    description: 'Dinding batu kokoh tahan ledakan dan monster.',
    costDesc: '1 Item Dinding Batu',
    neededItemId: 'wall_stone',
  },
  {
    type: 'campfire',
    name: 'Api Unggun',
    icon: '🔥',
    description: 'Sumber cahaya malam dan tempat memanggang daging.',
    costDesc: '1 Item Api Unggun',
    neededItemId: 'campfire',
  },
  {
    type: 'bed',
    name: 'Tempat Tidur',
    icon: '🛏️',
    description: 'Tidur untuk memulihkan seluruh HP dan melewati malam.',
    costDesc: '1 Item Tempat Tidur',
    neededItemId: 'bed',
  },
  {
    type: 'forge',
    name: 'Meja Tempa (Anvil)',
    icon: '🔨',
    description: 'Fasilitas pandai besi untuk memperkuat senjata +1..+5.',
    costDesc: '1 Item Meja Tempa',
    neededItemId: 'forge',
  },
  {
    type: 'shop_stall',
    name: 'Warung Lapak Pemain',
    icon: '🏪',
    description: 'Dirikan lapak toko pribadimu untuk berdagang dengan NPC.',
    costDesc: '1 Item Lapak Pemain',
    neededItemId: 'shop_stall',
  },
  {
    type: 'fence',
    name: 'Pagar Kandang Ternak',
    icon: '🌾',
    description: 'Mengurung hewan ternak agar tidak kabur dan aman dari monster.',
    costDesc: '1 Item Pagar',
    neededItemId: 'fence',
  },
];

export const HousingBuildModal: React.FC<HousingBuildModalProps> = ({
  isOpen,
  onClose,
  inventory,
  onSelectStructureToPlace,
  activePlacingType,
}) => {
  if (!isOpen) return null;

  const getItemCount = (itemId: string) => {
    const slot = inventory.find((s) => s.item.id === itemId);
    return slot ? slot.count : 0;
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 animate-fade-in">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-slate-950/50">
          <div className="flex items-center gap-2">
            <Home className="w-5 h-5 text-blue-400" />
            <h2 className="font-bold text-slate-100 text-sm">Mode Arsitektur & Housing</h2>
          </div>
          <button
            onClick={() => {
              sound.playTone(300, 150, 'sine', 0.08);
              onClose();
            }}
            className="text-slate-400 hover:text-white p-1 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto flex-1 flex flex-col gap-2.5">
          <p className="text-xs text-slate-400">
            Pilih struktur bangunan yang ingin didirikan di sekitar karaktermu. Pastikan kamu sudah membuat strukturnya di meja Crafting terlebih dahulu!
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-1">
            {BUILD_OPTIONS.map((opt) => {
              const count = getItemCount(opt.neededItemId);
              const isSelected = activePlacingType === opt.type;

              return (
                <div
                  key={opt.type}
                  className={`p-3 rounded-xl border flex flex-col justify-between gap-2 transition-all ${
                    isSelected
                      ? 'border-blue-400 bg-blue-950/40 ring-2 ring-blue-400/20'
                      : 'border-slate-800 bg-slate-950/70'
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    <span className="text-3xl">{opt.icon}</span>
                    <div>
                      <h4 className="font-bold text-xs text-slate-100">{opt.name}</h4>
                      <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                        {opt.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-slate-800/80">
                    <span className="text-[11px] font-mono text-slate-400">
                      Tersedia: <strong className={count > 0 ? 'text-emerald-400' : 'text-rose-400'}>{count}</strong>
                    </span>

                    <button
                      disabled={count <= 0}
                      onClick={() => {
                        onSelectStructureToPlace(opt.type);
                        sound.playBuild();
                        onClose();
                      }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        count > 0
                          ? 'bg-blue-600 hover:bg-blue-500 text-white cursor-pointer active:scale-95'
                          : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                      }`}
                    >
                      {isSelected ? 'Sedang Dipilih' : 'Pasang Bangunan'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
