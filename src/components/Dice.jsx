import React from "react";

export default function Dice({ value = 1, rolling = false }) {
  // value: 1..6 (hiển thị); rolling: true → lắc
  return (
    <div
      className={`w-12 h-12 rounded-xl bg-white border border-slate-300 shadow flex items-center justify-center text-xl font-bold select-none
        ${rolling ? "animate-dice-tilt" : ""}`}
      aria-label={`dice-${value}`}
      title={rolling ? "Đang quay..." : `Kết quả: ${value}`}
    >
      {value}
      <style>{`
        @keyframes dice-tilt {
          0% { transform: rotate(0deg) translateY(0); }
          25% { transform: rotate(10deg) translateY(-2px); }
          50% { transform: rotate(0deg) translateY(0); }
          75% { transform: rotate(-10deg) translateY(-2px); }
          100% { transform: rotate(0deg) translateY(0); }
        }
        .animate-dice-tilt {
          animation: dice-tilt 0.35s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
