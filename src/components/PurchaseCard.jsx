import React from "react";

export default function PurchaseCard({ player, tile, onBuy, onSkip }) {
  if (!player || !tile) return null;
  const canAfford = player.money >= tile.price;

  return (
    <div className="rounded-2xl bg-white p-4 shadow-md border border-slate-200">
      <div className="font-semibold">Mua bất động sản?</div>
      <div className="mt-1 text-sm text-slate-600">
        <b>{player.name}</b> đang ở <b>{tile.name}</b> — giá <b>${tile.price}</b>.
      </div>
      <div className="mt-3 flex gap-2">
        <button
          onClick={onBuy}
          disabled={!canAfford}
          className={`px-3 py-2 rounded-lg text-white ${canAfford ? "bg-emerald-600 hover:bg-emerald-700" : "bg-slate-400 cursor-not-allowed"}`}
          title={!canAfford ? "Không đủ tiền" : "Mua ô này"}
        >
          Mua
        </button>
        <button
          onClick={onSkip}
          className="px-3 py-2 rounded-lg border border-slate-300 hover:bg-slate-50"
        >
          Bỏ qua
        </button>
      </div>
    </div>
  );
}
