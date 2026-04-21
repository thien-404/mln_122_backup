export default function PlayerList({ players, currentPlayerId }) {
  return (
    <div
      style={{
        background: "#fff",
        borderRadius: 16,
        padding: 12,
        boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
      }}
    >
      <h2 style={{ fontWeight: 700, marginBottom: 8, fontSize: 16 }}>Danh sách người chơi</h2>
      <ul style={{ display: "grid", gap: 8, padding: 0, margin: 0, listStyle: "none" }}>
        {players.map((p) => (
          <li
            key={p.id}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "6px 8px",
              borderRadius: 10,
              background: p.id === currentPlayerId ? "#eff6ff" : "transparent",
              border: p.id === currentPlayerId ? "1px solid #bfdbfe" : "1px solid transparent",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span
                style={{
                  width: 10,
                  height: 10,
                  background: p.color,
                  borderRadius: 999,
                  display: "inline-block",
                }}
                title={p.id}
              />
              <span style={{ fontSize: 13, fontWeight: p.id === currentPlayerId ? 700 : 500 }}>
                {p.name}
              </span>
            </div>
            <div style={{ fontSize: 11, color: "#111827", fontWeight: 600 }}>
              {p.money} đồng • ❤️ {p.lives} • Ô #{p.position + 1}
              {p.jailedTurns > 0 ? " • Đang bị giữ lượt" : ""}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
