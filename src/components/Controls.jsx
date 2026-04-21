import React from "react";
import PlayerToken from "./PlayerToken";
import Dice from "./Dice";

export default function Controls({
  currentPlayer,
  onRoll,
  disabled = false,
  rolling = false,
  diceValue = 1,
  gameTimerEnabled = false,
  gameTimerLabel = "00:00",
}) {
  const noPlayer = !currentPlayer;
  const locked = disabled || rolling || noPlayer;

  return (
    <div
      style={{
        background: "#fff",
        borderRadius: 16,
        padding: 12,
        boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
          marginBottom: 8,
        }}
      >
        <h2 style={{ fontWeight: 700, fontSize: 16 }}>Lượt chơi</h2>
        <div
          style={{
            fontSize: 11,
            fontWeight: 700,
            color: gameTimerEnabled ? "#991b1b" : "#475569",
            background: gameTimerEnabled ? "#fee2e2" : "#e2e8f0",
            borderRadius: 999,
            padding: "4px 10px",
          }}
        >
          {gameTimerEnabled ? `Thời gian trận: ${gameTimerLabel}` : "Thời gian trận: Tắt"}
        </div>
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          justifyContent: "space-between",
          marginBottom: 8,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {currentPlayer ? (
            <>
              <PlayerToken color={currentPlayer.color} label={currentPlayer.id} />
              <div style={{ fontSize: 13, color: "#475569" }}>{currentPlayer.name}</div>
            </>
          ) : (
            <div style={{ fontSize: 13, color: "#475569" }}>—</div>
          )}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Dice value={diceValue} rolling={rolling} />
          <div style={{ fontSize: 12, color: "#111827", fontWeight: 600 }}>
            {currentPlayer ? <>{currentPlayer.money} đồng • ❤️ {currentPlayer.lives}</> : "—"}
          </div>
        </div>
      </div>

      <button
        onClick={() => !locked && onRoll()}
        disabled={locked}
        style={{
          width: "100%",
          borderRadius: 12,
          background: locked ? "#94a3b8" : "#111827",
          color: "#fff",
          padding: "10px 12px",
          border: "none",
          cursor: locked ? "not-allowed" : "pointer",
        }}
      >
        {rolling ? "Đang quay..." : "Đổ xúc xắc và di chuyển"}
      </button>
    </div>
  );
}
