import React, { useState } from 'react';
import { COOKING_RECIPES, ITEMS } from '../utils/constants';
import { InventorySlot, Mob } from '../types/game';
import { X, Utensils, Sprout, Heart, Sparkles, Check } from 'lucide-react';
import { sound } from '../utils/audio';

interface CookingFarmingModalProps {
  isOpen: boolean;
  onClose: () => void;
  inventory: InventorySlot[];
  onCookRecipe: (recipeId: string) => void;
  mobs: Mob[];
  onTameOrFeedAnimal: (mobId: string) => void;
}

export const CookingFarmingModal: React.FC<CookingFarmingModalProps> = ({
  isOpen,
  onClose,
  inventory,
  onCookRecipe,
  mobs,
  onTameOrFeedAnimal,
}) => {
  const [tab, setTab] = useState<'cooking' | 'farming' | 'ranching'>('cooking');

  if (!isOpen) return null;

  const getItemCount = (itemId: string) => {
    const slot = inventory.find((s) => s.item.id === itemId);
    return slot ? slot.count : 0;
  };

  const farmAnimals = mobs.filter((m) => m.isAnimal);

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 animate-fade-in">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-slate-950/50">
          <div className="flex items-center gap-2">
            <Utensils className="w-5 h-5 text-orange-400" />
            <h2 className="font-bold text-slate-100 text-sm">Dapur, Pertanian & Peternakan</h2>
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

        {/* Tabs */}
        <div className="grid grid-cols-3 border-b border-slate-800 bg-slate-950/40 text-xs">
          <button
            onClick={() => setTab('cooking')}
            className={`py-2.5 flex items-center justify-center gap-1 font-medium transition-colors ${
              tab === 'cooking'
                ? 'border-b-2 border-orange-400 text-orange-300 bg-slate-900'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Utensils className="w-3.5 h-3.5" />
            <span>Memasak</span>
          </button>
          <button
            onClick={() => setTab('farming')}
            className={`py-2.5 flex items-center justify-center gap-1 font-medium transition-colors ${
              tab === 'farming'
                ? 'border-b-2 border-emerald-400 text-emerald-300 bg-slate-900'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sprout className="w-3.5 h-3.5" />
            <span>Bertani</span>
          </button>
          <button
            onClick={() => setTab('ranching')}
            className={`py-2.5 flex items-center justify-center gap-1 font-medium transition-colors ${
              tab === 'ranching'
                ? 'border-b-2 border-amber-400 text-amber-300 bg-slate-900'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Heart className="w-3.5 h-3.5" />
            <span>Beternak</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-4 overflow-y-auto flex-1 flex flex-col gap-3">
          {tab === 'cooking' && (
            <div className="flex flex-col gap-2.5">
              <p className="text-xs text-slate-400">
                Masak daging mentah dan hasil pancingan menjadi makanan lezat untuk mengisi rasa lapar, dahaga, dan memulihkan HP secara drastis!
              </p>
              {COOKING_RECIPES.map((recipe) => {
                const target = ITEMS[recipe.resultId];
                if (!target) return null;
                const canCook = recipe.ingredients.every(
                  (ing) => getItemCount(ing.itemId) >= ing.count
                );

                return (
                  <div
                    key={recipe.id}
                    className="bg-slate-950/70 border border-slate-800 rounded-xl p-3 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{target.icon}</span>
                      <div>
                        <h4 className="font-bold text-sm text-slate-100">{target.nameId}</h4>
                        <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                          {recipe.ingredients.map((ing) => {
                            const itm = ITEMS[ing.itemId];
                            return (
                              <span key={ing.itemId} className="font-mono">
                                {itm?.nameId}: {getItemCount(ing.itemId)}/{ing.count}
                              </span>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                    <button
                      disabled={!canCook}
                      onClick={() => {
                        onCookRecipe(recipe.id);
                        sound.playEat();
                      }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        canCook
                          ? 'bg-orange-600 hover:bg-orange-500 text-white cursor-pointer active:scale-95'
                          : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                      }`}
                    >
                      Masak
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {tab === 'farming' && (
            <div className="flex flex-col gap-3">
              <div className="bg-emerald-950/30 border border-emerald-800/60 rounded-xl p-3 text-xs text-emerald-300">
                <h4 className="font-bold mb-1 flex items-center gap-1.5 text-sm">
                  <Sprout className="w-4 h-4" /> Panduan Bertani Survival:
                </h4>
                <ol className="list-decimal pl-4 space-y-1 text-slate-300">
                  <li>Gunakan <strong>Cangkul Tani</strong> pada rumput untuk membuat lahan tanah gembur.</li>
                  <li>Tanam <strong>Bibit Gandum Emas</strong> atau wortel pada petak tanah.</li>
                  <li>Siram dengan air dari sungai/danau terdekat agar tanaman tumbuh subur.</li>
                  <li>Panen saat tanaman menguning untuk memperoleh gandum & bibit baru!</li>
                </ol>
              </div>

              <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3">
                <span className="text-xs font-bold text-slate-200 block mb-2">Bibit di Tas Kamu:</span>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="flex items-center justify-between p-2 rounded-lg bg-slate-800/80 border border-slate-700">
                    <span className="flex items-center gap-1.5">
                      <span>🌱</span>
                      <span>Bibit Gandum</span>
                    </span>
                    <span className="font-mono font-bold text-amber-300">{getItemCount('wheat_seed')}</span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-lg bg-slate-800/80 border border-slate-700">
                    <span className="flex items-center gap-1.5">
                      <span>🥕</span>
                      <span>Bibit Wortel</span>
                    </span>
                    <span className="font-mono font-bold text-orange-300">{getItemCount('carrot')}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {tab === 'ranching' && (
            <div className="flex flex-col gap-2.5">
              <p className="text-xs text-slate-400">
                Jinakkan hewan di alam menggunakan Gandum Panen (🌾). Hewan ternak jinak akan menghasilkan Telur, Susu Sapi Murni, dan Wol secara rutin!
              </p>

              {farmAnimals.map((animal) => (
                <div
                  key={animal.id}
                  className="bg-slate-950/70 border border-slate-800 rounded-xl p-3 flex items-center justify-between"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-2xl">
                      {animal.type === 'chicken' ? '🐔' : animal.type === 'cow' ? '🐮' : '🐑'}
                    </span>
                    <div>
                      <h4 className="font-bold text-xs text-slate-100 flex items-center gap-1">
                        {animal.nameId}
                        {animal.isTamed && (
                          <span className="text-[10px] text-pink-400 bg-pink-950/60 px-1.5 py-0.2 rounded-full border border-pink-700">
                            Jinak ❤️
                          </span>
                        )}
                      </h4>
                      <span className="text-[11px] text-slate-400">
                        {animal.type === 'cow' ? 'Penghasil Susu Segar' : animal.type === 'chicken' ? 'Penghasil Telur' : 'Penghasil Wol'}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      onTameOrFeedAnimal(animal.id);
                      sound.playTone(500, 750, 'sine', 0.1);
                    }}
                    className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-bold flex items-center gap-1 active:scale-95 transition-transform"
                  >
                    <Heart className="w-3.5 h-3.5" />
                    <span>{animal.isTamed ? 'Beri Pakan' : 'Jinakkan (1🌾)'}</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
