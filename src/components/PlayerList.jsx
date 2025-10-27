export default function PlayerList({ players }) {
  return (
    <div
      style={{
        background: "#fff",
        borderRadius: 16,
        padding: 12,
        boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
      }}
    >
      <h2 style={{ fontWeight: 700, marginBottom: 8 }}>Người chơi</h2>
      <ul style={{ display: "grid", gap: 8, padding: 0, margin: 0, listStyle: "none" }}>
        {players.map((p) => (
          <li
            key={p.id}
            style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}
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
              <span style={{ fontSize: 14 }}>{p.name}</span>
            </div>
            <div style={{ fontSize: 12, color: "#111827", fontWeight: 600 }}>
              ${p.money} • ❤️ {p.lives} • Tile #{p.position}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
