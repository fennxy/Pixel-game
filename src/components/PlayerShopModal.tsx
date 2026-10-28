import React, { useState } from 'react';
import { PlayerShop, InventorySlot, Item } from '../types/game';
import { X, Store, Plus, Coins, Clock, Check, Power } from 'lucide-react';
import { sound } from '../utils/audio';

interface PlayerShopModalProps {
  isOpen: boolean;
  onClose: () => void;
  shop: PlayerShop;
  inventory: InventorySlot[];
  onUpdateShopName: (name: string) => void;
  onToggleShopOpen: () => void;
  onAddItemToShop: (item: Item, count: number, price: number) => void;
  onRemoveItemFromShop: (shopItemId: string) => void;
  onCollectEarnings: () => void;
}

export const PlayerShopModal: React.FC<PlayerShopModalProps> = ({
  isOpen,
  onClose,
  shop,
  inventory,
  onUpdateShopName,
  onToggleShopOpen,
  onAddItemToShop,
  onRemoveItemFromShop,
  onCollectEarnings,
}) => {
  const [shopNameInput, setShopNameInput] = useState(shop.name);
  const [isEditingName, setIsEditingName] = useState(false);
  const [selectedInventorySlot, setSelectedInventorySlot] = useState<InventorySlot | null>(null);
  const [sellPriceInput, setSellPriceInput] = useState(20);
  const [sellCountInput, setSellCountInput] = useState(1);

  if (!isOpen) return null;

  const handleSaveShopName = () => {
    if (shopNameInput.trim()) {
      onUpdateShopName(shopNameInput.trim());
      setIsEditingName(false);
      sound.playTone(600, 800, 'sine', 0.1);
    }
  };

  const handleAddStock = () => {
    if (!selectedInventorySlot) return;
    onAddItemToShop(selectedInventorySlot.item, sellCountInput, sellPriceInput);
    setSelectedInventorySlot(null);
    sound.playTone(500, 650, 'sine', 0.08);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 animate-fade-in">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-slate-950/50">
          <div className="flex items-center gap-2">
            <Store className="w-5 h-5 text-amber-400" />
            <h2 className="font-bold text-slate-100 text-sm">Warung Dagang Pemain</h2>
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

        {/* Shop Name & Status Banner */}
        <div className="p-3 bg-slate-950/60 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2 flex-1 mr-2">
            {isEditingName ? (
              <div className="flex items-center gap-1.5 flex-1">
                <input
                  type="text"
                  value={shopNameInput}
                  onChange={(e) => setShopNameInput(e.target.value)}
                  className="bg-slate-800 border border-amber-500 rounded-lg px-2.5 py-1 text-xs text-white flex-1 focus:outline-none"
                  placeholder="Ketik nama tokomu..."
                  maxLength={30}
                />
                <button
                  onClick={handleSaveShopName}
                  className="bg-amber-600 hover:bg-amber-500 text-white px-2 py-1 rounded-lg text-xs font-bold"
                >
                  Simpan
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm text-amber-300">{shop.name}</h3>
                <button
                  onClick={() => setIsEditingName(true)}
                  className="text-[10px] text-slate-400 hover:text-white underline"
                >
                  Ubah Nama
                </button>
              </div>
            )}
          </div>

          <button
            onClick={() => {
              onToggleShopOpen();
              sound.playTone(shop.isOpen ? 300 : 700, 500, 'sine', 0.1);
            }}
            className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
              shop.isOpen
                ? 'bg-emerald-600/90 hover:bg-emerald-500 text-white'
                : 'bg-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Power className="w-3.5 h-3.5" />
            <span>{shop.isOpen ? 'Buka (Aktif)' : 'Tutup'}</span>
          </button>
        </div>

        {/* Total Earnings Bar */}
        <div className="px-4 py-2 bg-amber-950/30 border-b border-amber-900/40 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-amber-300">
            <Coins className="w-4 h-4 text-amber-400" />
            <span>Keuntungan Belum Diambil:</span>
            <strong className="font-mono text-sm">{shop.totalEarnings} Emas</strong>
          </div>
          <button
            disabled={shop.totalEarnings <= 0}
            onClick={() => {
              onCollectEarnings();
              sound.playCoin();
            }}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
              shop.totalEarnings > 0
                ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 cursor-pointer active:scale-95'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed'
            }`}
          >
            Tarik Emas
          </button>
        </div>

        {/* Main Content */}
        <div className="p-4 overflow-y-auto flex-1 flex flex-col gap-4">
          {/* Active Items for Sale */}
          <div>
            <h4 className="text-xs font-bold text-slate-300 mb-2 flex items-center justify-between">
              <span>Barang Yang Sedang Dijual:</span>
              <span className="text-slate-500 font-normal">{shop.items.length}/8 slot</span>
            </h4>

            {shop.items.length === 0 ? (
              <div className="text-center py-6 bg-slate-950/40 border border-slate-800/80 rounded-xl text-xs text-slate-500">
                Belum ada barang di etalase. Tambahkan barang dari tas kamu di bawah!
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                {shop.items.map((stallItem) => (
                  <div
                    key={stallItem.id}
                    className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{stallItem.item.icon}</span>
                      <div>
                        <div className="font-bold text-xs text-slate-200 truncate max-w-[90px]">
                          {stallItem.item.nameId}
                        </div>
                        <div className="text-[11px] text-amber-300 font-mono">
                          {stallItem.price} Emas (x{stallItem.count})
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        onRemoveItemFromShop(stallItem.id);
                        sound.playTone(300, 200, 'sine', 0.05);
                      }}
                      className="text-slate-400 hover:text-rose-400 p-1 text-xs"
                      title="Tarik kembali ke tas"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Add Item to Stall Section */}
          <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3 flex flex-col gap-2.5">
            <h4 className="text-xs font-bold text-slate-200">Tambah Barang Dari Tas:</h4>
            
            <div className="flex gap-2 overflow-x-auto pb-1">
              {inventory.map((slot, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setSelectedInventorySlot(slot);
                    setSellPriceInput(slot.item.sellPrice * 2);
                    setSellCountInput(1);
                  }}
                  className={`p-2 rounded-xl border flex flex-col items-center justify-center shrink-0 w-14 h-14 ${
                    selectedInventorySlot?.item.id === slot.item.id
                      ? 'border-amber-400 bg-amber-950/40'
                      : 'border-slate-700 bg-slate-800/70'
                  }`}
                >
                  <span className="text-xl">{slot.item.icon}</span>
                  <span className="text-[10px] text-slate-300 font-mono">x{slot.count}</span>
                </button>
              ))}
            </div>

            {selectedInventorySlot && (
              <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-800 text-xs">
                <div className="flex items-center gap-2">
                  <span className="text-slate-300">Harga:</span>
                  <input
                    type="number"
                    min="1"
                    max="999"
                    value={sellPriceInput}
                    onChange={(e) => setSellPriceInput(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-16 bg-slate-800 border border-slate-700 rounded px-2 py-1 font-mono text-amber-300 text-xs"
                  />
                  <span className="text-slate-400 text-[10px]">Koin</span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-slate-300">Jml:</span>
                  <input
                    type="number"
                    min="1"
                    max={selectedInventorySlot.count}
                    value={sellCountInput}
                    onChange={(e) =>
                      setSellCountInput(
                        Math.min(
                          selectedInventorySlot.count,
                          Math.max(1, parseInt(e.target.value) || 1)
                        )
                      )
                    }
                    className="w-12 bg-slate-800 border border-slate-700 rounded px-2 py-1 font-mono text-slate-200 text-xs"
                  />
                </div>

                <button
                  onClick={handleAddStock}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold active:scale-95 transition-transform"
                >
                  Pasang
                </button>
              </div>
            )}
          </div>

          {/* Customer History Log */}
          <div>
            <h4 className="text-xs font-bold text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>Riwayat Pembelian Pelanggan:</span>
            </h4>
            <div className="space-y-1.5 max-h-32 overflow-y-auto">
              {shop.customerLogs.length === 0 ? (
                <div className="text-xs text-slate-500 italic py-2">
                  Belum ada transaksi. Buka tokomu agar NPC dan pemain lain datang berbelanja!
                </div>
              ) : (
                shop.customerLogs.map((log) => (
                  <div
                    key={log.id}
                    className="text-[11px] p-2 rounded-lg bg-slate-950/60 border border-slate-800/80 flex items-center justify-between text-slate-300"
                  >
                    <span>
                      <strong className="text-amber-400">{log.buyerName}</strong> membeli {log.itemName}
                    </span>
                    <span className="font-mono text-emerald-400 font-bold">+{log.price} Emas</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
