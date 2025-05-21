// App.js
import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

const wordList = [
  { en: "apple", ko: "사과" },
  { en: "book", ko: "책" },
  { en: "computer", ko: "컴퓨터" },
  { en: "dog", ko: "개" },
  { en: "elephant", ko: "코끼리" },
  { en: "fish", ko: "물고기" },
  { en: "grape", ko: "포도" },
  { en: "hat", ko: "모자" },
  { en: "ice", ko: "얼음" },
  { en: "juice", ko: "주스" },
  { en: "key", ko: "열쇠" },
  { en: "lamp", ko: "램프" },
];

export default function App() {
  const [index, setIndex] = useState(0);
  const [input, setInput] = useState("");
  const [score, setScore] = useState(0);
  const [results, setResults] = useState([]); // [{correct: boolean, answer: string}]
  const [secondsLeft, setSecondsLeft] = useState(5);

  const inputRef = useRef(null);
  const inputValueRef = useRef("");

  const handleInputChange = (e) => {
    setInput(e.target.value);
    inputValueRef.current = e.target.value;
  };

  const nextWord = useCallback((answered, userInput) => {
    const correct = wordList[index].ko === userInput.trim();
    setResults((prev) => [...prev, { correct, answer: userInput.trim() }]);
    if (answered && correct) setScore((prev) => prev + 1);
    setInput("");
    setIndex((prev) => prev + 1);
  }, [index]);

  useEffect(() => {
    if (index >= wordList.length) return;
    setSecondsLeft(5);

    const countdown = setInterval(() => {
      setSecondsLeft((s) => s - 1);
    }, 1000);

    const timeout = setTimeout(() => {
      nextWord(false, inputValueRef.current);
    }, 5000);

    inputRef.current?.focus();

    return () => {
      clearTimeout(timeout);
      clearInterval(countdown);
    };
  }, [index, nextWord]);

  const handleSubmit = (e) => {
    e.preventDefault();
    nextWord(true, inputValueRef.current);
  };

  const handleShare = async () => {
    const summary = results.map((r, i) => {
      const word = wordList[i];
      return `${word.en} - 정답: ${word.ko}, 내 답: ${r.answer || "(미입력)"} → ${r.correct ? "정답" : "오답"}`;
    }).join("\n");

    const text = `퀴즈 결과 (${score} / ${wordList.length})\n\n${summary}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: "영어 단어 퀴즈 결과",
          text,
        });
      } catch (err) {
        alert("공유에 실패했습니다: " + err.message);
      }
    } else {
      try {
        await navigator.clipboard.writeText(text);
        alert("공유를 지원하지 않는 브라우저입니다. 결과가 클립보드에 복사되었습니다.");
      } catch (err) {
        alert("복사 실패: " + err.message);
      }
    }
  };

  if (index >= wordList.length) {
    return (
        <div className="text-center p-10">
          <h1 className="text-2xl font-bold">퀴즈 종료!</h1>
          <p className="text-lg">정답 개수: {score} / {wordList.length}</p>
          <ul className="mt-4 space-y-2">
            {wordList.map((w, i) => (
                <li key={i} className={results[i]?.correct ? "text-green-600" : "text-red-600"}>
                  <div><strong>{w.en}</strong> - 정답: {w.ko}</div>
                  <div>내 답: {results[i]?.answer || "(미입력)"}</div>
                  <div>{results[i]?.correct ? "✅ 정답" : "❌ 오답"}</div>
                </li>
            ))}
          </ul>
          <button
              onClick={handleShare}
              className="mt-6 px-4 py-2 bg-blue-600 text-white rounded"
          >
            📤 결과 공유하기
          </button>
        </div>
    );
  }

  return (
      <div className="flex flex-col items-center justify-center h-screen p-4">
        <h1 className="text-xl font-bold mb-2">영어 단어 뜻 맞히기</h1>
        <p className="text-sm text-gray-500 mb-4">
          남은 문제: {wordList.length - index} | 남은 시간: {secondsLeft}s
        </p>

        <div className="w-80 h-40 mb-4 relative">
          <AnimatePresence mode="wait">
            <motion.div
                key={index}
                initial={{ x: 300, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -300, opacity: 0 }}
                transition={{ duration: 0.4 }}
                className="absolute w-full h-full flex items-center justify-center text-3xl font-bold bg-white rounded-xl shadow-xl border"
            >
              {wordList[index].en}
            </motion.div>
          </AnimatePresence>
        </div>

        <form onSubmit={handleSubmit} className="flex">
          <input
              ref={inputRef}
              type="text"
              className="border p-2 text-lg"
              value={input}
              onChange={handleInputChange}
          />
          <button className="ml-2 px-4 py-2 bg-blue-500 text-white rounded" type="submit">
            확인
          </button>
        </form>
      </div>
  );
}