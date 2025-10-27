import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

const defaultPalette = [
  "#0ea5e9", "#ef4444", "#10b981", "#f59e0b", "#8b5cf6",
  "#14b8a6", "#f43f5e", "#84cc16", "#6366f1", "#d946ef",
];

const defaultName = (i) => `Player ${i + 1}`;

export default function Setup() {
  const navigate = useNavigate();

  const [playerCount, setPlayerCount] = useState(3);
  const [colors, setColors] = useState(() => defaultPalette.slice(0, 3));
  const [names, setNames] = useState(() =>
    Array.from({ length: 3 }, (_, i) => defaultName(i))
  );

  const [startMoney, setStartMoney] = useState(500);
  const [startLives, setStartLives] = useState(3);
  const [maxLives, setMaxLives] = useState(5);

  // Đồng bộ mảng màu khi thay đổi số người
  useEffect(() => {
    setColors((prev) => {
      const next = [...prev];
      if (playerCount > next.length) {
        next.push(...defaultPalette.slice(next.length, playerCount));
      } else {
        next.length = playerCount;
      }
      return next;
    });
  }, [playerCount]);

  // Đồng bộ mảng tên khi thay đổi số người
  useEffect(() => {
    setNames((prev) => {
      const next = [...prev];
      if (playerCount > next.length) {
        for (let i = next.length; i < playerCount; i++) {
          next.push(defaultName(i));
        }
      } else {
        next.length = playerCount;
      }
      return next;
    });
  }, [playerCount]);

  const playersPreview = useMemo(
    () =>
      Array.from({ length: playerCount }, (_, i) => ({
        id: `P${i + 1}`,
        name: (names[i] && names[i].trim()) || defaultName(i),
        color: colors[i] || defaultPalette[i % defaultPalette.length],
        lives: Number(startLives),
        money: Number(startMoney),
        position: 0,
      })),
    [playerCount, colors, startLives, startMoney, names]
  );

  function handleStart(e) {
    e.preventDefault();

    // Bảo đảm không có tên rỗng
    const normalizedPlayers = playersPreview.map((p, i) => ({
      ...p,
      name: (names[i] && names[i].trim()) || defaultName(i),
    }));

    const payload = { players: normalizedPlayers, maxLives: Number(maxLives) };

    localStorage.setItem("monopolyRuntime", JSON.stringify(payload));
    navigate("/game", { state: payload, replace: false });
  }

  return (
    <div className="min-h-screen bg-slate-100">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow p-6">
          <h1 className="text-2xl font-bold">MonopolyEdu</h1>
          <p className="text-slate-600 mt-1">Thiết lập trò chơi trước khi bắt đầu.</p>

          <form onSubmit={handleStart} className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <label className="block text-sm font-medium text-slate-700">
                Số người chơi (2–10)
              </label>
              <input
                type="number"
                min={2}
                max={10}
                value={playerCount}
                onChange={(e) =>
                  setPlayerCount(Math.max(2, Math.min(10, Number(e.target.value) || 2)))
                }
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:ring-2 focus:ring-slate-500"
              />

              <label className="block text-sm font-medium text-slate-700 mt-4">
                Tiền ban đầu (mỗi người)
              </label>
              <input
                type="number"
                min={0}
                value={startMoney}
                onChange={(e) => setStartMoney(Number(e.target.value) || 0)}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:ring-2 focus:ring-slate-500"
              />

              <div className="grid grid-cols-2 gap-3 mt-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700">Mạng ban đầu</label>
                  <input
                    type="number"
                    min={1}
                    value={startLives}
                    onChange={(e) => setStartLives(Number(e.target.value) || 1)}
                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:ring-2 focus:ring-slate-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">Mạng tối đa</label>
                  <input
                    type="number"
                    min={1}
                    value={maxLives}
                    onChange={(e) => setMaxLives(Number(e.target.value) || 1)}
                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:ring-2 focus:ring-slate-500"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="text-sm font-medium text-slate-700">Tên & màu người chơi</div>
              <div className="space-y-2">
                {playersPreview.map((p, idx) => (
                  <div key={p.id} className="flex items-center gap-3">
                    {/* Tên */}
                    <input
                      type="text"
                      value={names[idx]}
                      onChange={(e) => {
                        const next = [...names];
                        next[idx] = e.target.value;
                        setNames(next);
                      }}
                      placeholder={`Tên người chơi ${idx + 1}`}
                      className="w-40 rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-500"
                    />

                    {/* Chọn màu */}
                    <input
                      type="color"
                      value={colors[idx]}
                      onChange={(e) => {
                        const next = [...colors];
                        next[idx] = e.target.value;
                        setColors(next);
                      }}
                      className="h-8 w-12 rounded border border-slate-300"
                    />

                    <div
                      className="h-6 w-6 rounded"
                      style={{ background: colors[idx], border: "1px solid #cbd5e1" }}
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="md:col-span-2">
              <div className="rounded-xl border border-slate-200 p-4 bg-slate-50">
                <div className="text-sm font-semibold mb-2">Xem nhanh</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {playersPreview.map((p) => (
                    <div key={p.id} className="rounded-lg bg-white border border-slate-200 p-3">
                      <div className="text-sm font-semibold" style={{ color: p.color }}>
                        {p.name}
                      </div>
                      <div className="text-xs text-slate-600 mt-1">
                        Tiền: ${p.money} • Mạng: {p.lives}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="md:col-span-2 flex justify-end">
              <button
                type="submit"
                className="rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2"
              >
                Next → Bắt đầu chơi
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
