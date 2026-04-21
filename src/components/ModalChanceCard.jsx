import React from "react";

export default function ModalChanceCard({ open, card, message, onClose }) {
  if (!open || !card) return null;
  const cardTypeLabel = card.type === "POSITIVE" ? "Tích cực" : "Thử thách";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-xl">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-lg font-semibold">Thẻ sự kiện: {card.title}</h3>
          <span
            className={`rounded-full px-3 py-1 text-xs font-semibold ${
              card.type === "POSITIVE" ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"
            }`}
          >
            {cardTypeLabel}
          </span>
        </div>
        <p className="mt-2 text-slate-700">{message}</p>

        <div className="mt-5 flex justify-end">
          <button
            onClick={onClose}
            className="rounded-lg bg-emerald-600 px-4 py-2 text-white hover:bg-emerald-700"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}
