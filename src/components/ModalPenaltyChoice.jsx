import React from "react";

export default function ModalPenaltyChoice({ open, tile, owner, rent, onPickMoney, onPickLife, player }) {
  if (!open || !tile || !owner || !player) return null;

  const canAfford = player.money >= rent;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-xl">
        <h3 className="text-lg font-semibold">Bạn đã vào tài sản của người khác</h3>
        <p className="mt-2 text-slate-600">
          Ô: <b>{tile.name}</b> • Chủ sở hữu:{" "}
          <b style={{ color: owner.color }}>{owner.name}</b>
        </p>

        <p className="mt-1 text-slate-600">
          Hình phạt: 
          {canAfford ? (
            <>
              {" "}chọn <b>trả tiền thuê</b> (chuyển cho chủ) hoặc <b>mất 1 máu</b> (chủ sở hữu được <b>+1 máu</b>).
            </>
          ) : (
            <>
              {" "}bạn không đủ tiền (${player.money} / ${rent}) nên phải <b>mất 1 máu</b>. Chủ sở hữu được <b>+1 máu</b>.
            </>
          )}
        </p>

        <div className="mt-4 flex justify-end gap-3">
          {canAfford ? (
            <>
              <button
                onClick={onPickMoney}
                className="rounded-lg bg-amber-600 hover:bg-amber-700 text-white px-4 py-2"
              >
                Trả ${rent}
              </button>
              <button
                onClick={onPickLife}
                className="rounded-lg border border-slate-300 hover:bg-slate-50 px-4 py-2"
              >
                Mất 1 máu
              </button>
            </>
          ) : (
            <button
              onClick={onPickLife}
              className="rounded-lg bg-red-600 hover:bg-red-700 text-white px-4 py-2"
            >
              Mất 1 máu
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
