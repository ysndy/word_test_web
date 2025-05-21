// app.jsx
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
  const [results, setResults] = useState([]);
  const [secondsLeft, setSecondsLeft] = useState(5);
  const inputRef = useRef(null);

  const nextWord = useCallback((answered, userInput) => {
    const correct = wordList[index].ko === userInput.trim();
    setResults((prev) => [...prev, answered && correct]);
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
      nextWord(false, input); // 여기에 input 넘김
    }, 5000);

    inputRef.current?.focus();

    return () => {
      clearTimeout(timeout);
      clearInterval(countdown);
    };
  }, [index, nextWord]); // 🔥 input은 제거됨

  const handleSubmit = (e) => {
    e.preventDefault();
    nextWord(true, input); // 🔥 여기도 input 직접 넘김
  };


  if (index >= wordList.length) {
    return (
        <div className="text-center p-10">
          <h1 className="text-2xl font-bold">퀴즈 종료!</h1>
          <p className="text-lg">정답 개수: {score} / {wordList.length}</p>
          <ul className="mt-4">
            {wordList.map((w, i) => (
                <li key={i} className={results[i] ? "text-green-600" : "text-red-600"}>
                  {w.en} - {w.ko} ({results[i] ? "정답" : "오답"})
                </li>
            ))}
          </ul>
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
              onChange={(e) => setInput(e.target.value)}
          />
          <button className="ml-2 px-4 py-2 bg-blue-500 text-white rounded" type="submit">
            확인
          </button>
        </form>
      </div>
  );
}