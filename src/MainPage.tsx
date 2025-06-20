// src/pages/MainPage.tsx
import { useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

export default function MainPage() {
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const query = inputRef.current?.value.trim();
    if (query) {
      navigate(`/news?query=${encodeURIComponent(query)}`);
    }
  };

  return (
    <div className=" w-full min-h-screen bg-gradient-to-b from-gray-200 to-white pt-28 pb-16 px-4 flex flex-col items-center">

      <motion.h1
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-3xl font-bold text-gray-800 mb-4"
      >
        🔍 뉴스 검색어를 입력하세요
      </motion.h1>
      <p className="text-gray-600 mb-6 text-center">
        최신 뉴스, 주식 정보, 환율 등 다양한 정보를 검색해보세요!
      </p>

      <form
        onSubmit={handleSearch}
        className="flex gap-3 items-center bg-white shadow-md rounded-xl px-6 py-4 mb-12 w-full max-w-xl"
      >
        <input
          ref={inputRef}
          type="text"
          placeholder="예: 테슬라, 코스피, 환율..."
          className="flex-grow border-none outline-none text-gray-700 placeholder-gray-400"
        />
        <button
          type="submit"
          className="bg-blue-600 text-white px-5 py-2 rounded hover:bg-blue-700 transition"
        >
          검색
        </button>
      </form>

      <motion.div
        initial="hidden"
        animate="visible"
        variants={{
          hidden: { opacity: 0, y: 20 },
          visible: { opacity: 1, y: 0, transition: { staggerChildren: 0.2 } },
        }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl"
      >
        {[
          {
            title: "뉴스 검색",
            emoji: "🔎",
            color: "bg-blue-100",
            desc: "실시간으로 뉴스를 검색하고, 관련 기사를 빠르게 모아볼 수 있어요.",
          },
          {
            title: "AI 요약",
            emoji: "🧠",
            color: "bg-green-100",
            desc: "긴 뉴스 기사도 AI가 핵심 내용을 요약해줘요. 시간절약을 도와드려요!",
          },
          {
            title: "검색 히스토리",
            emoji: "🗂️",
            color: "bg-yellow-100",
            desc: "로그인한 사용자라면 언제든지 이전 검색 기록을 다시 확인할 수 있어요.",
          },
          {
            title: "뉴스 스크랩",
            emoji: "📌",
            color: "bg-purple-100",
            desc: "중요한 뉴스는 따로 저장해두고, 나중에 다시 읽을 수 있어요.",
          },
        ].map((item, index) => (
          <motion.div
            key={index}
            whileHover={{ scale: 1.05 }}
            className={`${item.color} rounded-2xl shadow p-6 transition cursor-default`}
          >
            <h3 className="text-xl font-semibold mb-2">
              {item.emoji} {item.title}
            </h3>
            <p className="text-gray-700 text-sm leading-relaxed">{item.desc}</p>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
