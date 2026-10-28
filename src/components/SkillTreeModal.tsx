import React from 'react';
import { SkillNode } from '../types/game';
import { X, Sparkles, Check, Lock, Award } from 'lucide-react';
import { sound } from '../utils/audio';

interface SkillTreeModalProps {
  isOpen: boolean;
  onClose: () => void;
  skillNodes: SkillNode[];
  skillPoints: number;
  playerLevel: number;
  playerExp: number;
  playerMaxExp: number;
  onUnlockSkill: (skillId: string) => void;
}

export const SkillTreeModal: React.FC<SkillTreeModalProps> = ({
  isOpen,
  onClose,
  skillNodes,
  skillPoints,
  playerLevel,
  playerExp,
  playerMaxExp,
  onUnlockSkill,
}) => {
  if (!isOpen) return null;

  const trees: { id: SkillNode['tree']; name: string; icon: string }[] = [
    { id: 'combat', name: 'Pertarungan', icon: '⚔️' },
    { id: 'mining', name: 'Penambangan', icon: '⛏️' },
    { id: 'farming', name: 'Pertanian & Ternak', icon: '🌱' },
    { id: 'hunting', name: 'Perburuan & Mancing', icon: '🏹' },
    { id: 'crafting', name: 'Kerajinan', icon: '🔨' },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 animate-fade-in">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-slate-950/50">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-400" />
            <h2 className="font-bold text-slate-100 text-sm">Pohon Keahlian (Skill Tree)</h2>
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

        {/* Level & Skill Points Banner */}
        <div className="px-4 py-3 bg-purple-950/30 border-b border-purple-900/40 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-purple-600/30 border border-purple-500 flex items-center justify-center text-purple-300 font-bold text-sm">
              Lv.{playerLevel}
            </div>
            <div>
              <div className="text-xs font-semibold text-slate-200">
                EXP: {playerExp} / {playerMaxExp}
              </div>
              <div className="w-32 h-1.5 bg-slate-800 rounded-full mt-1 overflow-hidden">
                <div
                  className="h-full bg-purple-500 rounded-full"
                  style={{ width: `${Math.min(100, (playerExp / playerMaxExp) * 100)}%` }}
                />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 bg-purple-900/60 border border-purple-500/80 px-3 py-1.5 rounded-xl text-purple-200 text-xs font-bold shadow">
            <Award className="w-4 h-4 text-purple-300" />
            <span>Poin Keahlian: {skillPoints}</span>
          </div>
        </div>

        {/* Skill Branches */}
        <div className="p-4 overflow-y-auto flex-1 space-y-4">
          {trees.map((tree) => {
            const nodesInTree = skillNodes.filter((n) => n.tree === tree.id);

            return (
              <div key={tree.id} className="bg-slate-950/70 border border-slate-800 rounded-xl p-3">
                <div className="flex items-center gap-2 mb-2 pb-1.5 border-b border-slate-800/80">
                  <span className="text-lg">{tree.icon}</span>
                  <h3 className="font-bold text-xs text-slate-200 uppercase tracking-wide">
                    Cabang {tree.name}
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {nodesInTree.map((node) => {
                    const canAfford = skillPoints >= node.cost;

                    return (
                      <div
                        key={node.id}
                        className={`p-2.5 rounded-xl border flex flex-col justify-between gap-2 transition-all ${
                          node.unlocked
                            ? 'border-purple-500/80 bg-purple-950/30 ring-1 ring-purple-500/30'
                            : 'border-slate-800 bg-slate-900/60'
                        }`}
                      >
                        <div className="flex items-start gap-2">
                          <span className="text-2xl">{node.icon}</span>
                          <div>
                            <div className="font-bold text-xs text-slate-100 flex items-center gap-1">
                              {node.nameId}
                              {node.unlocked && (
                                <Check className="w-3.5 h-3.5 text-emerald-400" />
                              )}
                            </div>
                            <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                              {node.descriptionId}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-1 border-t border-slate-800/70">
                          <span className="text-[10px] text-purple-300 font-mono">
                            Biaya: {node.cost} Poin
                          </span>

                          {node.unlocked ? (
                            <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/50 px-2 py-0.5 rounded border border-emerald-800">
                              Aktif
                            </span>
                          ) : (
                            <button
                              disabled={!canAfford}
                              onClick={() => {
                                onUnlockSkill(node.id);
                                sound.playLevelUp();
                              }}
                              className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1 transition-all ${
                                canAfford
                                  ? 'bg-purple-600 hover:bg-purple-500 text-white cursor-pointer active:scale-95'
                                  : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                              }`}
                            >
                              <Lock className="w-3 h-3" />
                              <span>Buka</span>
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
