import React, { useState } from 'react';
import { InventorySlot, Item } from '../types/game';
import { X, Shield, Sword, Utensils, Sparkles, Trash2, ArrowUpCircle } from 'lucide-react';
import { sound } from '../utils/audio';

interface InventoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  inventory: InventorySlot[];
  gold: number;
  equippedWeapon: Item | null;
  equippedArmor: Item | null;
  equippedTool: Item | null;
  onEquipItem: (item: Item) => void;
  onUseItem: (item: Item) => void;
  onDropItem: (item: Item) => void;
  onReinforceItem: (item: Item) => void;
  nearForge: boolean;
}

export const InventoryModal: React.FC<InventoryModalProps> = ({
  isOpen,
  onClose,
  inventory,
  gold,
  equippedWeapon,
  equippedArmor,
  equippedTool,
  onEquipItem,
  onUseItem,
  onDropItem,
  onReinforceItem,
  nearForge,
}) => {
  const [selectedSlot, setSelectedSlot] = useState<InventorySlot | null>(
    inventory[0] || null
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 animate-fade-in">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-slate-950/50">
          <div className="flex items-center gap-2">
            <span className="text-xl">🎒</span>
            <h2 className="font-bold text-slate-100 text-sm">Tas & Perlengkapan</h2>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 bg-amber-950/60 border border-amber-600/60 px-2 py-0.5 rounded-lg text-amber-300 font-bold text-xs">
              <span>🪙</span>
              <span>{gold} Emas</span>
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
        </div>

        {/* Equipment bar */}
        <div className="px-4 py-2.5 bg-slate-950/40 border-b border-slate-800 flex items-center justify-around gap-2 text-xs">
          <div className="flex items-center gap-1.5 bg-slate-800/80 px-2.5 py-1.5 rounded-xl border border-slate-700">
            <Sword className="w-3.5 h-3.5 text-rose-400" />
            <span className="text-slate-400">Senjata:</span>
            <span className="font-semibold text-rose-300 truncate max-w-[90px]">
              {equippedWeapon ? `${equippedWeapon.nameId} (+${equippedWeapon.reinforceLevel || 0})` : 'Tangan Kosong'}
            </span>
          </div>
          <div className="flex items-center gap-1.5 bg-slate-800/80 px-2.5 py-1.5 rounded-xl border border-slate-700">
            <Shield className="w-3.5 h-3.5 text-blue-400" />
            <span className="text-slate-400">Armor:</span>
            <span className="font-semibold text-blue-300 truncate max-w-[90px]">
              {equippedArmor ? `${equippedArmor.nameId} (+${equippedArmor.reinforceLevel || 0})` : 'Tanpa Zirah'}
            </span>
          </div>
        </div>

        {/* Body content */}
        <div className="p-4 overflow-y-auto flex-1 flex flex-col gap-3">
          {/* Inventory Grid */}
          <div className="grid grid-cols-5 gap-2">
            {Array.from({ length: 25 }).map((_, idx) => {
              const slot = inventory[idx];
              const isSelected = selectedSlot?.item.id === slot?.item.id;

              return (
                <button
                  key={idx}
                  onClick={() => {
                    if (slot) {
                      sound.playTone(450, 400, 'sine', 0.05);
                      setSelectedSlot(slot);
                    }
                  }}
                  className={`aspect-square rounded-xl border flex flex-col items-center justify-center relative transition-all ${
                    isSelected
                      ? 'border-amber-400 bg-amber-950/40 shadow-md ring-2 ring-amber-400/30'
                      : slot
                      ? 'border-slate-700 bg-slate-800/90 hover:border-slate-500'
                      : 'border-slate-800/70 bg-slate-950/40 opacity-40'
                  }`}
                >
                  {slot && (
                    <>
                      <span className="text-2xl drop-shadow">{slot.item.icon}</span>
                      {slot.item.reinforceLevel && slot.item.reinforceLevel > 0 && (
                        <span className="absolute top-1 left-1 text-[9px] font-bold text-amber-400 bg-slate-950/80 px-1 rounded">
                          +{slot.item.reinforceLevel}
                        </span>
                      )}
                      {slot.count > 1 && (
                        <span className="absolute bottom-1 right-1 text-[10px] font-mono font-bold text-slate-200 bg-slate-950/80 px-1 rounded">
                          {slot.count}
                        </span>
                      )}
                    </>
                  )}
                </button>
              );
            })}
          </div>

          {/* Selected Item Details Card */}
          {selectedSlot ? (
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3 flex flex-col gap-2 mt-auto">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-3xl">{selectedSlot.item.icon}</span>
                  <div>
                    <h3 className="font-bold text-sm text-slate-100 flex items-center gap-1.5">
                      {selectedSlot.item.nameId}
                      {selectedSlot.item.reinforceLevel && selectedSlot.item.reinforceLevel > 0 && (
                        <span className="text-amber-400 text-xs">+{selectedSlot.item.reinforceLevel}</span>
                      )}
                    </h3>
                    <p className="text-xs text-slate-400">{selectedSlot.item.descriptionId}</p>
                  </div>
                </div>
                <span className="text-xs text-amber-300 font-mono">
                  {selectedSlot.item.sellPrice} Koin
                </span>
              </div>

              {/* Stats badges */}
              <div className="flex flex-wrap gap-2 text-[11px] text-slate-300">
                {selectedSlot.item.damage && (
                  <span className="text-rose-400">⚔️ Serangan: +{selectedSlot.item.damage}</span>
                )}
                {selectedSlot.item.defense && (
                  <span className="text-blue-400">🛡️ Pertahanan: +{selectedSlot.item.defense}</span>
                )}
                {selectedSlot.item.hungerRestore && (
                  <span className="text-emerald-400">🍖 Kenyang: +{selectedSlot.item.hungerRestore}%</span>
                )}
                {selectedSlot.item.healAmount && (
                  <span className="text-red-400">❤️ Pulih HP: +{selectedSlot.item.healAmount}</span>
                )}
              </div>

              {/* Action buttons */}
              <div className="grid grid-cols-3 gap-2 mt-1">
                {(selectedSlot.item.type === 'weapon' ||
                  selectedSlot.item.type === 'armor' ||
                  selectedSlot.item.type === 'tool') && (
                  <button
                    onClick={() => {
                      onEquipItem(selectedSlot.item);
                      sound.playTone(550, 700, 'sine', 0.08);
                    }}
                    className="py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1 active:scale-95 transition-transform"
                  >
                    <Sword className="w-3.5 h-3.5" />
                    <span>Pasang</span>
                  </button>
                )}

                {selectedSlot.item.type === 'food' && (
                  <button
                    onClick={() => {
                      onUseItem(selectedSlot.item);
                      sound.playEat();
                    }}
                    className="py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1 active:scale-95 transition-transform"
                  >
                    <Utensils className="w-3.5 h-3.5" />
                    <span>Makan</span>
                  </button>
                )}

                {/* Reinforcement / Upgrade at Blacksmith Forge */}
                {(selectedSlot.item.type === 'weapon' || selectedSlot.item.type === 'armor') && (
                  <button
                    onClick={() => onReinforceItem(selectedSlot.item)}
                    className="py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1 active:scale-95 transition-transform"
                    title="Perkuat senjata dengan Bijih Besi & Kristal"
                  >
                    <ArrowUpCircle className="w-3.5 h-3.5" />
                    <span>Perkuat (+1)</span>
                  </button>
                )}

                <button
                  onClick={() => {
                    onDropItem(selectedSlot.item);
                    sound.playTone(200, 100, 'square', 0.08);
                    setSelectedSlot(null);
                  }}
                  className="py-2 bg-slate-800 hover:bg-rose-950 text-slate-300 hover:text-rose-300 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 active:scale-95 transition-transform border border-slate-700"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Buang</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-4 text-xs text-slate-500">
              Pilih salah satu item di tas untuk melihat info & tindakan.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
