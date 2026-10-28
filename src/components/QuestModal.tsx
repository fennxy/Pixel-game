import React, { useState } from 'react';
import { Quest } from '../types/game';
import { X, Compass, Check, Trophy, Coins, Sparkles } from 'lucide-react';
import { sound } from '../utils/audio';

interface QuestModalProps {
  isOpen: boolean;
  onClose: () => void;
  quests: Quest[];
  onClaimReward: (questId: string) => void;
}

export const QuestModal: React.FC<QuestModalProps> = ({
  isOpen,
  onClose,
  quests,
  onClaimReward,
}) => {
  const [filter, setFilter] = useState<'all' | 'survival' | 'hunting' | 'boss'>('all');

  if (!isOpen) return null;

  const filtered = quests.filter((q) => (filter === 'all' ? true : q.category === filter));

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 animate-fade-in">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-slate-950/50">
          <div className="flex items-center gap-2">
            <Compass className="w-5 h-5 text-amber-400" />
            <h2 className="font-bold text-slate-100 text-sm">Papan Misi & Hadiah Petualang</h2>
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

        {/* Filter buttons */}
        <div className="grid grid-cols-4 border-b border-slate-800 bg-slate-950/40 text-xs">
          <button
            onClick={() => setFilter('all')}
            className={`py-2 font-medium transition-colors ${
              filter === 'all'
                ? 'border-b-2 border-amber-400 text-amber-300 bg-slate-900'
                : 'text-slate-400'
            }`}
          >
            Semua
          </button>
          <button
            onClick={() => setFilter('survival')}
            className={`py-2 font-medium transition-colors ${
              filter === 'survival'
                ? 'border-b-2 border-emerald-400 text-emerald-300 bg-slate-900'
                : 'text-slate-400'
            }`}
          >
            Survival
          </button>
          <button
            onClick={() => setFilter('hunting')}
            className={`py-2 font-medium transition-colors ${
              filter === 'hunting'
                ? 'border-b-2 border-rose-400 text-rose-300 bg-slate-900'
                : 'text-slate-400'
            }`}
          >
            Berburu
          </button>
          <button
            onClick={() => setFilter('boss')}
            className={`py-2 font-medium transition-colors ${
              filter === 'boss'
                ? 'border-b-2 border-purple-400 text-purple-300 bg-slate-900'
                : 'text-slate-400'
            }`}
          >
            Boss
          </button>
        </div>

        {/* Quest List */}
        <div className="p-4 overflow-y-auto flex-1 flex flex-col gap-2.5">
          {filtered.map((quest) => {
            const isFinished = quest.currentCount >= quest.requiredCount;

            return (
              <div
                key={quest.id}
                className={`p-3 rounded-xl border flex flex-col justify-between gap-2 transition-all ${
                  quest.claimed
                    ? 'border-slate-800/80 bg-slate-950/40 opacity-60'
                    : isFinished
                    ? 'border-emerald-500 bg-emerald-950/20 ring-1 ring-emerald-500/30'
                    : 'border-slate-800 bg-slate-950/70'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-bold text-xs text-slate-100 flex items-center gap-1.5">
                      <span>{quest.title}</span>
                      {quest.category === 'boss' && (
                        <span className="text-[9px] bg-purple-950 text-purple-300 border border-purple-700 px-1.5 rounded">
                          BOSS
                        </span>
                      )}
                    </h4>
                    <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                      {quest.description}
                    </p>
                  </div>

                  <span className="text-xs font-mono font-bold text-slate-300">
                    {quest.currentCount}/{quest.requiredCount}
                  </span>
                </div>

                {/* Progress bar */}
                <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-500 rounded-full"
                    style={{
                      width: `${Math.min(
                        100,
                        (quest.currentCount / quest.requiredCount) * 100
                      )}%`,
                    }}
                  />
                </div>

                {/* Rewards & Claim */}
                <div className="flex items-center justify-between pt-1 border-t border-slate-800/80 text-[11px]">
                  <div className="flex items-center gap-2.5">
                    <span className="flex items-center gap-1 text-amber-300 font-mono">
                      <Coins className="w-3.5 h-3.5 text-amber-400" />
                      +{quest.rewardGold}
                    </span>
                    <span className="flex items-center gap-1 text-purple-300 font-mono">
                      <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                      +{quest.rewardExp} EXP
                    </span>
                  </div>

                  {quest.claimed ? (
                    <span className="text-emerald-400 text-xs font-bold flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" />
                      Selesai
                    </span>
                  ) : (
                    <button
                      disabled={!isFinished}
                      onClick={() => {
                        onClaimReward(quest.id);
                        sound.playCoin();
                      }}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                        isFinished
                          ? 'bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer active:scale-95 shadow'
                          : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                      }`}
                    >
                      Klaim Hadiah
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
