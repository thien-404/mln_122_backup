import React from "react";
import PlayerToken from "./PlayerToken";
import Dice from "./Dice";

export default function Controls({
  currentPlayer,   // có thể null
  onRoll,
  disabled = false,
  rolling = false,
  diceValue = 1,
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
      <h2 style={{ fontWeight: 700, marginBottom: 8 }}>Lượt chơi</h2>

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
              <div style={{ fontSize: 14, color: "#475569" }}>{currentPlayer.name}</div>
            </>
          ) : (
            <div style={{ fontSize: 14, color: "#475569" }}>—</div>
          )}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Dice value={diceValue} rolling={rolling} />
          <div style={{ fontSize: 13, color: "#111827", fontWeight: 600 }}>
            {currentPlayer ? <>${currentPlayer.money} • ❤️ {currentPlayer.lives}</> : "—"}
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
        {rolling ? "Đang quay..." : "Roll Dice & Move"}
      </button>
    </div>
  );
}
