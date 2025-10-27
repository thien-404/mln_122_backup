export default function PlayerToken({ color = "#94a3b8", label = "?" }) {
  const displayChar = label?.[0]?.toUpperCase() ?? "?";
  const textColor = "#fff";
  return (
    <div
      style={{
        background: color,
        color: textColor,
        width: 28,
        height: 28,
        borderRadius: "50%",
        fontSize: 13,
        fontWeight: 700,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: "0 1px 3px rgba(0,0,0,0.25)",
      }}
      title={label}
    >
      {displayChar}
    </div>
  );
}
