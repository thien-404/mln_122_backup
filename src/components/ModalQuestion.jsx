import React, { useState, useEffect } from "react";

export default function ModalQuestion({ open, question, onSubmit }) {
  const [answer, setAnswer] = useState("");
  const [status, setStatus] = useState(""); // "", "correct", "wrong"
  const [shake, setShake] = useState(false);
  const [showResult, setShowResult] = useState(false); // hiển thị feedback đúng/sai cho trắc nghiệm

  useEffect(() => {
    if (open) {
      setAnswer("");
      setStatus("");
      setShake(false);
      setShowResult(false);
    }
  }, [open]);

  if (!open || !question) return null;

  const handleSubmit = (e) => {
    e.preventDefault();

    const type = question.type || "text";
    const normalize = (v) =>
      String(v ?? "")
        .trim()
        .toLowerCase()
        .replace(/\s+/g, " "); // bỏ khoảng trắng thừa

    const correctAnswer = normalize(question.a);
    const userAnswer = normalize(answer);
    const correct = userAnswer === correctAnswer;

    if (type === "choice") {
      // hiển thị màu trong danh sách đáp án
      setShowResult(true);
    }

    if (correct) {
      setStatus("correct");
      setTimeout(() => onSubmit(answer), 1000);
    } else {
      setStatus("wrong");
      setShake(true);
      setTimeout(() => {
        setShake(false);
        onSubmit(answer);
      }, 1200);
    }
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

          // Khi hiển thị kết quả
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
                disabled={showResult}
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
        <h3 className="text-lg font-semibold">Câu hỏi</h3>
        <p className="mt-2 text-slate-600 whitespace-pre-line">{question.q}</p>

        <form onSubmit={handleSubmit} className="mt-4 space-y-3">
          {/* Hiển thị giao diện theo loại */}
          {question.type === "choice" && Array.isArray(question.options)
            ? renderChoice()
            : (
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
              />
            )}

          <div className="flex justify-end gap-2">
            <button
              type="submit"
              className="rounded-lg bg-black px-4 py-2 text-white hover:opacity-90"
              disabled={!answer || showResult}
            >
              Trả lời
            </button>
          </div>
        </form>
      </div>

      {/* Hiệu ứng shake */}
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
