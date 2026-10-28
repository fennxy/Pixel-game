import React, { useState } from 'react';
import { CRAFTING_RECIPES, ITEMS, CraftingRecipe } from '../utils/constants';
import { InventorySlot } from '../types/game';
import { X, Hammer, Shield, Home, Sprout } from 'lucide-react';
import { sound } from '../utils/audio';

interface CraftingModalProps {
  isOpen: boolean;
  onClose: () => void;
  inventory: InventorySlot[];
  onCraftRecipe: (recipe: CraftingRecipe) => void;
  nearForge: boolean;
}

export const CraftingModal: React.FC<CraftingModalProps> = ({
  isOpen,
  onClose,
  inventory,
  onCraftRecipe,
  nearForge,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<
    'survival' | 'weapons' | 'housing' | 'farming'
  >('survival');
  const [selectedRecipe, setSelectedRecipe] = useState<CraftingRecipe>(
    CRAFTING_RECIPES[0]
  );

  if (!isOpen) return null;

  // Helper to count item quantity in inventory
  const getItemCount = (itemId: string) => {
    const slot = inventory.find((s) => s.item.id === itemId);
    return slot ? slot.count : 0;
  };

  const filteredRecipes = CRAFTING_RECIPES.filter(
    (r) => r.category === selectedCategory
  );

  const canCraft = (recipe: CraftingRecipe) => {
    return recipe.ingredients.every(
      (ing) => getItemCount(ing.itemId) >= ing.count
    );
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 animate-fade-in">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-slate-950/50">
          <div className="flex items-center gap-2">
            <Hammer className="w-5 h-5 text-emerald-400" />
            <h2 className="font-bold text-slate-100 text-sm">Meja Kerajinan & Tempa</h2>
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

        {/* Category Tabs */}
        <div className="grid grid-cols-4 border-b border-slate-800 bg-slate-950/40 text-xs">
          <button
            onClick={() => setSelectedCategory('survival')}
            className={`py-2.5 flex items-center justify-center gap-1 font-medium transition-colors ${
              selectedCategory === 'survival'
                ? 'border-b-2 border-emerald-400 text-emerald-300 bg-slate-900'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Hammer className="w-3.5 h-3.5" />
            <span>Alat</span>
          </button>
          <button
            onClick={() => setSelectedCategory('weapons')}
            className={`py-2.5 flex items-center justify-center gap-1 font-medium transition-colors ${
              selectedCategory === 'weapons'
                ? 'border-b-2 border-rose-400 text-rose-300 bg-slate-900'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Senjata</span>
          </button>
          <button
            onClick={() => setSelectedCategory('housing')}
            className={`py-2.5 flex items-center justify-center gap-1 font-medium transition-colors ${
              selectedCategory === 'housing'
                ? 'border-b-2 border-blue-400 text-blue-300 bg-slate-900'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Home className="w-3.5 h-3.5" />
            <span>Rumah</span>
          </button>
          <button
            onClick={() => setSelectedCategory('farming')}
            className={`py-2.5 flex items-center justify-center gap-1 font-medium transition-colors ${
              selectedCategory === 'farming'
                ? 'border-b-2 border-amber-400 text-amber-300 bg-slate-900'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sprout className="w-3.5 h-3.5" />
            <span>Tani</span>
          </button>
        </div>

        {/* Recipe Grid & Details */}
        <div className="p-4 overflow-y-auto flex-1 flex flex-col gap-3">
          <div className="grid grid-cols-4 gap-2">
            {filteredRecipes.map((recipe) => {
              const resItem = ITEMS[recipe.resultId];
              if (!resItem) return null;
              const craftable = canCraft(recipe);
              const isSelected = selectedRecipe.id === recipe.id;

              return (
                <button
                  key={recipe.id}
                  onClick={() => {
                    sound.playTone(400, 350, 'sine', 0.05);
                    setSelectedRecipe(recipe);
                  }}
                  className={`p-2 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all ${
                    isSelected
                      ? 'border-emerald-400 bg-emerald-950/40 ring-2 ring-emerald-400/20'
                      : 'border-slate-800 bg-slate-800/80 hover:border-slate-600'
                  } ${!craftable ? 'opacity-50' : 'opacity-100'}`}
                >
                  <span className="text-2xl">{resItem.icon}</span>
                  <span className="text-[10px] text-slate-200 font-medium truncate max-w-full text-center">
                    {resItem.nameId}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Selected Recipe Requirements */}
          {selectedRecipe && (
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3 flex flex-col gap-3 mt-auto">
              {(() => {
                const target = ITEMS[selectedRecipe.resultId];
                if (!target) return null;
                const craftable = canCraft(selectedRecipe);

                return (
                  <>
                    <div className="flex items-center gap-2.5">
                      <span className="text-3xl">{target.icon}</span>
                      <div>
                        <h4 className="font-bold text-sm text-slate-100">
                          {target.nameId} (x{selectedRecipe.resultCount})
                        </h4>
                        <p className="text-xs text-slate-400">{target.descriptionId}</p>
                      </div>
                    </div>

                    {/* Bahan yang dibutuhkan */}
                    <div>
                      <span className="text-[11px] font-semibold text-slate-400 block mb-1">
                        Bahan Baku Diperlukan:
                      </span>
                      <div className="grid grid-cols-2 gap-1.5">
                        {selectedRecipe.ingredients.map((ing) => {
                          const item = ITEMS[ing.itemId];
                          const have = getItemCount(ing.itemId);
                          const sufficient = have >= ing.count;

                          return (
                            <div
                              key={ing.itemId}
                              className={`flex items-center justify-between px-2.5 py-1 rounded-lg border text-xs ${
                                sufficient
                                  ? 'bg-slate-800/80 border-slate-700 text-slate-200'
                                  : 'bg-rose-950/30 border-rose-800 text-rose-300'
                              }`}
                            >
                              <span className="flex items-center gap-1.5">
                                <span>{item?.icon}</span>
                                <span>{item?.nameId}</span>
                              </span>
                              <span className="font-mono font-bold">
                                {have}/{ing.count}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Tombol Buat */}
                    <button
                      disabled={!craftable}
                      onClick={() => {
                        onCraftRecipe(selectedRecipe);
                        sound.playCraft();
                      }}
                      className={`w-full py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 active:scale-95 transition-all shadow-md ${
                        craftable
                          ? 'bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer'
                          : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                      }`}
                    >
                      <Hammer className="w-4 h-4" />
                      <span>{craftable ? 'Buat Sekarang' : 'Bahan Tidak Cukup'}</span>
                    </button>
                  </>
                );
              })()}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
