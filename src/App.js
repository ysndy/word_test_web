// App.js
import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import html2canvas from "html2canvas";

export default function App() {
  const [wordList, setWordList] = useState([]);
  const [quizLoaded, setQuizLoaded] = useState(false); // 로딩 상태
  const [index, setIndex] = useState(0);
  const [input, setInput] = useState("");
  const [score, setScore] = useState(0);
  const [results, setResults] = useState([]);
  const [secondsLeft, setSecondsLeft] = useState(5);

  const inputRef = useRef(null);
  const inputValueRef = useRef("");
  const resultRef = useRef(null);
  const baseUrl = process.env.REACT_APP_API_BASE_URL;

  // ✅ 퀴즈 데이터 fetch
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const quizId = params.get("quiz_id");
    if (!quizId) return;

    fetch(`${baseUrl}/api/quiz?quiz_id=${quizId}`)
        .then((res) => res.json())
        .then((data) => {
          setWordList(data.questions); // [{ en, ko }]
          setQuizLoaded(true);
        })
        .catch((err) => {
          console.error("퀴즈 데이터를 불러오는 중 오류:", err);
        });
  }, []);

  const nextWord = useCallback((answered, userInput) => {
    const correct = wordList[index].ko === userInput.trim();
    setResults((prev) => [...prev, { correct, answer: userInput.trim() }]);
    if (answered && correct) setScore((prev) => prev + 1);
    setInput("");
    setIndex((prev) => prev + 1);
  }, [index, wordList]);

  useEffect(() => {
    if (!quizLoaded || index >= wordList.length) return;

    setSecondsLeft(5);
    const countdown = setInterval(() => setSecondsLeft((s) => s - 1), 1000);
    const timeout = setTimeout(() => {
      nextWord(false, inputValueRef.current);
    }, 5000);

    inputRef.current?.focus();
    return () => {
      clearTimeout(timeout);
      clearInterval(countdown);
    };
  }, [index, nextWord, quizLoaded]);

  const handleInputChange = (e) => {
    setInput(e.target.value);
    inputValueRef.current = e.target.value;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    nextWord(true, inputValueRef.current);
  };

  const handleDownloadImage = async () => {
    if (!resultRef.current) return;
    const canvas = await html2canvas(resultRef.current);
    const dataUrl = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.href = dataUrl;
    link.download = "quiz_result.png";
    link.click();
  };

  const handleShare = async () => {
    const summary = results.map((r, i) => {
      const word = wordList[i];
      return `${word.en} - 정답: ${word.ko}, 내 답: ${r.answer || "(미입력)"} → ${r.correct ? "정답" : "오답"}`;
    }).join("\n");

    const text = `퀴즈 결과 (${score} / ${wordList.length})\n\n${summary}`;

    if (navigator.share) {
      try {
        await navigator.share({ title: "영어 단어 퀴즈 결과", text });
      } catch (err) {
        alert("공유에 실패했습니다: " + err.message);
      }
    } else {
      await handleDownloadImage();
    }
  };

  // ✅ 로딩 중 처리
  if (!quizLoaded) {
    return <div className="text-center p-10 text-lg">퀴즈 데이터를 불러오는 중입니다...</div>;
  }

  if (index >= wordList.length) {
    return (
        <div className="text-center p-10">
          <div ref={resultRef}>
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
          </div>
          <div className="flex justify-center mt-6">
            <button
                onClick={handleShare}
                className="px-4 py-2 bg-blue-600 text-white rounded"
            >
              📤 결과 공유 또는 이미지 저장
            </button>
          </div>
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
