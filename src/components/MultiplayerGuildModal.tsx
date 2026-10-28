import React, { useState } from 'react';
import { Guild, PeerPlayer, InventorySlot, TradeOffer, Item } from '../types/game';
import { X, Users, Shield, ArrowLeftRight, Copy, Check, Plus, Coins, Trophy } from 'lucide-react';
import { sound } from '../utils/audio';

interface MultiplayerGuildModalProps {
  isOpen: boolean;
  onClose: () => void;
  onlinePlayers: PeerPlayer[];
  guild: Guild;
  roomCode: string;
  inventory: InventorySlot[];
  gold: number;
  tradeOffer: TradeOffer | null;
  onInitiateTrade: (partnerName: string) => void;
  onOfferItemInTrade: (item: Item, count: number) => void;
  onOfferGoldInTrade: (amount: number) => void;
  onConfirmTrade: () => void;
  onCancelTrade: () => void;
  onDonateToGuild: (amount: number) => void;
  onCreateOrUpdateGuild: (name: string, motto: string) => void;
}

export const MultiplayerGuildModal: React.FC<MultiplayerGuildModalProps> = ({
  isOpen,
  onClose,
  onlinePlayers,
  guild,
  roomCode,
  inventory,
  gold,
  tradeOffer,
  onInitiateTrade,
  onOfferItemInTrade,
  onOfferGoldInTrade,
  onConfirmTrade,
  onCancelTrade,
  onDonateToGuild,
  onCreateOrUpdateGuild,
}) => {
  const [tab, setTab] = useState<'multiplayer' | 'trade' | 'guild'>(
    tradeOffer?.active ? 'trade' : 'multiplayer'
  );
  const [copiedRoom, setCopiedRoom] = useState(false);
  const [donationInput, setDonationInput] = useState(50);
  const [newGuildName, setNewGuildName] = useState(guild.name);
  const [newGuildMotto, setNewGuildMotto] = useState(guild.motto);
  const [isEditingGuild, setIsEditingGuild] = useState(false);

  if (!isOpen) return null;

  const handleCopyRoom = () => {
    navigator.clipboard?.writeText(roomCode);
    setCopiedRoom(true);
    sound.playTone(600, 800, 'sine', 0.08);
    setTimeout(() => setCopiedRoom(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 animate-fade-in">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-slate-950/50">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-cyan-400" />
            <h2 className="font-bold text-slate-100 text-sm">Multiplayer, Dagang & Guild</h2>
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

        {/* Tab Headers */}
        <div className="grid grid-cols-3 border-b border-slate-800 bg-slate-950/40 text-xs">
          <button
            onClick={() => setTab('multiplayer')}
            className={`py-2.5 flex items-center justify-center gap-1 font-medium transition-colors ${
              tab === 'multiplayer'
                ? 'border-b-2 border-cyan-400 text-cyan-300 bg-slate-900'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Kamar Co-Op</span>
          </button>
          <button
            onClick={() => setTab('trade')}
            className={`py-2.5 flex items-center justify-center gap-1 font-medium transition-colors ${
              tab === 'trade'
                ? 'border-b-2 border-amber-400 text-amber-300 bg-slate-900'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <ArrowLeftRight className="w-3.5 h-3.5" />
            <span>Perdagangan</span>
          </button>
          <button
            onClick={() => setTab('guild')}
            className={`py-2.5 flex items-center justify-center gap-1 font-medium transition-colors ${
              tab === 'guild'
                ? 'border-b-2 border-indigo-400 text-indigo-300 bg-slate-900'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Guild</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-4 overflow-y-auto flex-1 flex flex-col gap-3">
          {tab === 'multiplayer' && (
            <div className="flex flex-col gap-3">
              {/* Room Connection Box */}
              <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3 flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-slate-400 block">Kode Kamar Petualangan:</span>
                  <div className="font-mono font-bold text-cyan-400 text-sm mt-0.5">
                    {roomCode}
                  </div>
                </div>
                <button
                  onClick={handleCopyRoom}
                  className="flex items-center gap-1 bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-lg text-xs font-semibold active:scale-95 transition-transform border border-slate-700"
                >
                  {copiedRoom ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Tersalin</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Salin Kode</span>
                    </>
                  )}
                </button>
              </div>

              {/* Online Friends / Co-op Companions */}
              <div>
                <h4 className="text-xs font-bold text-slate-300 mb-2">
                  Petualang Sekitar ({onlinePlayers.length + 1} Pemain):
                </h4>
                <div className="space-y-2">
                  {/* Local player entry */}
                  <div className="p-2.5 rounded-xl bg-cyan-950/20 border border-cyan-800/50 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-emerald-600/30 border border-emerald-500 flex items-center justify-center text-xs">
                        👑
                      </div>
                      <div>
                        <div className="font-bold text-xs text-slate-100 flex items-center gap-1.5">
                          <span>Kamu (Tuan Rumah)</span>
                          <span className="w-2 h-2 rounded-full bg-emerald-400" />
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono">Status: Bertualang</span>
                      </div>
                    </div>
                  </div>

                  {onlinePlayers.map((peer) => (
                    <div
                      key={peer.id}
                      className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-blue-600/30 border border-blue-500 flex items-center justify-center text-xs">
                          ⚔️
                        </div>
                        <div>
                          <div className="font-bold text-xs text-slate-100 flex items-center gap-1.5">
                            <span>{peer.name}</span>
                            <span className="w-2 h-2 rounded-full bg-emerald-400" />
                          </div>
                          <span className="text-[10px] text-slate-400">
                            HP: {peer.hp}/{peer.maxHp}
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          onInitiateTrade(peer.name);
                          setTab('trade');
                          sound.playTone(500, 650, 'sine', 0.08);
                        }}
                        className="flex items-center gap-1 bg-amber-600 hover:bg-amber-500 text-white px-2.5 py-1 rounded-lg text-xs font-semibold active:scale-95 transition-transform"
                      >
                        <ArrowLeftRight className="w-3.5 h-3.5" />
                        <span>Ajak Barter</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {tab === 'trade' && (
            <div className="flex flex-col gap-3">
              {tradeOffer && tradeOffer.active ? (
                <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3 flex flex-col gap-3">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <span className="text-xs font-bold text-amber-300">
                      Sesi Barter dengan: {tradeOffer.partnerName}
                    </span>
                    <button
                      onClick={onCancelTrade}
                      className="text-xs text-rose-400 hover:underline"
                    >
                      Batalkan Barter
                    </button>
                  </div>

                  {/* 2 Sides: Your Offer vs Partner Offer */}
                  <div className="grid grid-cols-2 gap-2">
                    {/* Your Offer */}
                    <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-700">
                      <span className="text-[11px] font-bold text-slate-200 block mb-1">
                        Barang Tawaranmu:
                      </span>
                      <div className="min-h-16 flex flex-wrap gap-1 mb-2">
                        {tradeOffer.playerOfferedItems.length === 0 ? (
                          <span className="text-[10px] text-slate-500 italic">Belum ada barang</span>
                        ) : (
                          tradeOffer.playerOfferedItems.map((slot, i) => (
                            <span
                              key={i}
                              className="text-xs bg-slate-800 px-1.5 py-0.5 rounded border border-slate-600"
                            >
                              {slot.item.icon} x{slot.count}
                            </span>
                          ))
                        )}
                      </div>
                      <div className="text-[11px] text-amber-300 font-mono">
                        🪙 Emas Ditawarkan: {tradeOffer.playerOfferedGold}
                      </div>
                    </div>

                    {/* Partner Offer */}
                    <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-700">
                      <span className="text-[11px] font-bold text-slate-200 block mb-1">
                        Tawaran {tradeOffer.partnerName}:
                      </span>
                      <div className="min-h-16 flex flex-wrap gap-1 mb-2">
                        {tradeOffer.partnerOfferedItems.length === 0 ? (
                          <span className="text-[10px] text-slate-500 italic">Menunggu tawaran...</span>
                        ) : (
                          tradeOffer.partnerOfferedItems.map((slot, i) => (
                            <span
                              key={i}
                              className="text-xs bg-slate-800 px-1.5 py-0.5 rounded border border-slate-600"
                            >
                              {slot.item.icon} x{slot.count}
                            </span>
                          ))
                        )}
                      </div>
                      <div className="text-[11px] text-amber-300 font-mono">
                        🪙 Emas: {tradeOffer.partnerOfferedGold}
                      </div>
                    </div>
                  </div>

                  {/* Pick item from inventory to offer */}
                  <div>
                    <span className="text-[11px] text-slate-400 block mb-1">
                      Klik barang dari tas untuk ditawarkan:
                    </span>
                    <div className="flex gap-1.5 overflow-x-auto pb-1">
                      {inventory.map((slot, i) => (
                        <button
                          key={i}
                          onClick={() => {
                            onOfferItemInTrade(slot.item, 1);
                            sound.playTone(400, 500, 'sine', 0.05);
                          }}
                          className="w-11 h-11 rounded-lg bg-slate-800 border border-slate-700 flex flex-col items-center justify-center shrink-0 hover:border-amber-400 active:scale-95"
                        >
                          <span className="text-base">{slot.item.icon}</span>
                          <span className="text-[9px] text-slate-400 font-mono">x{slot.count}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-1 border-t border-slate-800">
                    <button
                      onClick={() => onOfferGoldInTrade(20)}
                      className="px-2.5 py-1 bg-amber-900/60 border border-amber-600/70 text-amber-300 text-xs rounded-lg active:scale-95"
                    >
                      +20 Emas
                    </button>
                    <button
                      onClick={() => {
                        onConfirmTrade();
                        sound.playCoin();
                      }}
                      className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs active:scale-95 shadow-md"
                    >
                      {tradeOffer.playerAccepted ? 'Menunggu Partner...' : 'Kunci & Terima Barter'}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 bg-slate-950/40 border border-slate-800/80 rounded-xl text-xs text-slate-400">
                  Pilih salah satu teman petualang di tab Kamar Co-Op dan tekan <strong>Ajak Barter</strong> untuk memulai pertukaran item dan emas secara adil!
                </div>
              )}
            </div>
          )}

          {tab === 'guild' && (
            <div className="flex flex-col gap-3">
              {/* Guild Header Card */}
              <div className="p-3 rounded-xl bg-indigo-950/40 border border-indigo-800/60 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-indigo-600/30 border border-indigo-500 flex items-center justify-center text-2xl">
                    🛡️
                  </div>
                  <div>
                    {isEditingGuild ? (
                      <div className="space-y-1">
                        <input
                          type="text"
                          value={newGuildName}
                          onChange={(e) => setNewGuildName(e.target.value)}
                          className="bg-slate-800 border border-indigo-400 rounded px-2 py-0.5 text-xs text-white"
                        />
                        <input
                          type="text"
                          value={newGuildMotto}
                          onChange={(e) => setNewGuildMotto(e.target.value)}
                          className="bg-slate-800 border border-slate-600 rounded px-2 py-0.5 text-[10px] text-slate-300 block"
                        />
                        <button
                          onClick={() => {
                            onCreateOrUpdateGuild(newGuildName, newGuildMotto);
                            setIsEditingGuild(false);
                            sound.playLevelUp();
                          }}
                          className="bg-indigo-600 text-white text-[10px] px-2 py-0.5 rounded font-bold"
                        >
                          Simpan Guild
                        </button>
                      </div>
                    ) : (
                      <>
                        <h3 className="font-bold text-sm text-indigo-200 flex items-center gap-1.5">
                          {guild.name}
                          <span className="text-[10px] text-indigo-400 font-mono">
                            Lv.{guild.level}
                          </span>
                        </h3>
                        <p className="text-[11px] text-slate-400 italic">"{guild.motto}"</p>
                      </>
                    )}
                  </div>
                </div>

                {!isEditingGuild && (
                  <button
                    onClick={() => setIsEditingGuild(true)}
                    className="text-[10px] text-slate-400 hover:text-white underline"
                  >
                    Ubah
                  </button>
                )}
              </div>

              {/* Guild Perks */}
              <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3">
                <h4 className="text-xs font-bold text-slate-200 mb-2 flex items-center gap-1.5">
                  <Trophy className="w-3.5 h-3.5 text-amber-400" />
                  <span>Bonus Pasif Anggota Guild:</span>
                </h4>
                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                    <span className="text-[10px] text-slate-400 block">Bonus EXP</span>
                    <strong className="text-indigo-400 font-mono">+{guild.perks.expBonus}%</strong>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                    <span className="text-[10px] text-slate-400 block">Hasil Panen</span>
                    <strong className="text-emerald-400 font-mono">+{guild.perks.harvestBonus}%</strong>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                    <span className="text-[10px] text-slate-400 block">Serangan Tim</span>
                    <strong className="text-rose-400 font-mono">+{guild.perks.combatBonus}%</strong>
                  </div>
                </div>
              </div>

              {/* Kas Guild & Donasi */}
              <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3 flex items-center justify-between text-xs">
                <div>
                  <span className="text-slate-400 text-[11px] block">Kas Perbendaharaan Guild:</span>
                  <div className="font-mono font-bold text-amber-300 text-sm flex items-center gap-1">
                    <Coins className="w-4 h-4 text-amber-400" />
                    <span>{guild.treasury} Emas</span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    disabled={gold < 50}
                    onClick={() => {
                      onDonateToGuild(50);
                      sound.playCoin();
                    }}
                    className={`px-3 py-1.5 rounded-lg font-bold text-xs ${
                      gold >= 50
                        ? 'bg-amber-600 hover:bg-amber-500 text-white cursor-pointer active:scale-95'
                        : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                    }`}
                  >
                    Donasi +50 Emas
                  </button>
                </div>
              </div>

              {/* Members List */}
              <div>
                <h4 className="text-xs font-bold text-slate-300 mb-1.5">Daftar Anggota:</h4>
                <div className="space-y-1.5">
                  {guild.members.map((m, idx) => (
                    <div
                      key={idx}
                      className="text-xs p-2 rounded-lg bg-slate-950/60 border border-slate-800 flex items-center justify-between text-slate-300"
                    >
                      <span className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                        <strong className="text-slate-100">{m.name}</strong>
                        <span className="text-[10px] text-indigo-400">({m.role})</span>
                      </span>
                      <span className="font-mono text-slate-400 text-[11px]">Lv.{m.level}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
