import React, { useEffect, useRef, useState } from "react";

const formatQuestionTime = (seconds) => {
  const safe = Math.max(0, Number(seconds) || 0);
  const mm = String(Math.floor(safe / 60)).padStart(2, "0");
  const ss = String(safe % 60).padStart(2, "0");
  return `${mm}:${ss}`;
};

export default function ModalQuestion({
  open,
  question,
  onSubmit,
  remainingSeconds = 0,
  timerEnabled = false,
  disabled = false,
}) {
  const [answer, setAnswer] = useState("");
  const [status, setStatus] = useState("");
  const [shake, setShake] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const submitTimeoutRef = useRef(null);
  const shakeTimeoutRef = useRef(null);
  const submittingRef = useRef(false);

  useEffect(() => {
    if (open) {
      setAnswer("");
      setStatus("");
      setShake(false);
      setShowResult(false);
      submittingRef.current = false;
    }

    return () => {
      clearTimeout(submitTimeoutRef.current);
      clearTimeout(shakeTimeoutRef.current);
    };
  }, [open]);

  if (!open || !question) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (disabled || submittingRef.current) return;

    const type = question.type || "text";
    const normalize = (v) =>
      String(v ?? "")
        .trim()
        .toLowerCase()
        .replace(/\s+/g, " ");

    const correctAnswer = normalize(question.a);
    const userAnswer = normalize(answer);
    const correct = userAnswer === correctAnswer;
    submittingRef.current = true;

    if (type === "choice") {
      setShowResult(true);
    }

    if (correct) {
      setStatus("correct");
      submitTimeoutRef.current = setTimeout(() => onSubmit(answer), 1000);
      return;
    }

    setStatus("wrong");
    setShake(true);
    shakeTimeoutRef.current = setTimeout(() => {
      setShake(false);
      onSubmit(answer);
    }, 1200);
  };

  const renderChoice = () => {
    const options = question.options || [];
    const normalize = (v) =>
      String(v ?? "")
        .trim()
        .toLowerCase()
        .replace(/\s+/g, " ");

    const correctAnswer = normalize(question.a);

    return (
      <div className="space-y-2">
        {options.map((opt, idx) => {
          const normalizedOpt = normalize(opt);
          let borderColor = "border-slate-300";
          let bgColor = "bg-white";

          if (showResult) {
            if (normalizedOpt === correctAnswer) {
              borderColor = "border-green-500";
              bgColor = "bg-green-50";
            } else if (normalizedOpt === normalize(answer) && normalizedOpt !== correctAnswer) {
              borderColor = "border-red-500";
              bgColor = "bg-red-50";
            }
          } else if (answer === opt) {
            borderColor = "border-slate-700";
            bgColor = "bg-slate-100";
          }

          return (
            <label
              key={idx}
              className={`block border rounded-lg px-3 py-2 cursor-pointer transition-all ${borderColor} ${bgColor}`}
            >
              <input
                type="radio"
                name="choice"
                value={opt}
                className="mr-2"
                onChange={(e) => setAnswer(e.target.value)}
                checked={answer === opt}
                disabled={showResult || disabled}
              />
              {opt}
            </label>
          );
        })}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-xl">
        <div className="flex items-center justify-between gap-4">
          <h3 className="text-lg font-semibold">Câu hỏi</h3>
          {timerEnabled && (
            <div className="rounded-full bg-amber-100 px-3 py-1 text-sm font-semibold text-amber-800">
              {formatQuestionTime(remainingSeconds)}
            </div>
          )}
        </div>

        <p className="mt-2 text-slate-600 whitespace-pre-line">{question.q}</p>

        <form onSubmit={handleSubmit} className="mt-4 space-y-3">
          {question.type === "choice" && Array.isArray(question.options) ? renderChoice() : (
            <input
              className={`w-full rounded-lg border px-3 py-2 outline-none transition-all duration-300
                ${
                  status === "correct"
                    ? "border-green-500 bg-green-50"
                    : status === "wrong"
                    ? "border-red-500 bg-red-50"
                    : "border-slate-300 focus:ring-2 focus:ring-slate-500"
                }
                ${shake ? "animate-shake" : ""}`}
              placeholder="Nhập câu trả lời..."
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              autoFocus
              disabled={disabled}
            />
          )}

          <div className="flex items-center justify-between gap-2">
            <div className="text-xs text-slate-500">
              {timerEnabled ? "Hết giờ sẽ tự động tính sai." : "Không giới hạn thời gian câu hỏi."}
            </div>
            <button
              type="submit"
              className="rounded-lg bg-black px-4 py-2 text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={!answer || showResult || disabled}
            >
              Trả lời
            </button>
          </div>
        </form>
      </div>

      <style>
        {`
          @keyframes shake {
            0%, 100% { transform: translateX(0); }
            20%, 60% { transform: translateX(-6px); }
            40%, 80% { transform: translateX(6px); }
          }
          .animate-shake {
            animation: shake 0.4s ease-in-out;
          }
        `}
      </style>
    </div>
  );
}
