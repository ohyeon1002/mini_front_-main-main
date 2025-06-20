// src/pages/MainPage.tsx
import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const features = [
  {
    title: "뉴스 검색",
    emoji: "🔎",
    color: "bg-blue-100",
    desc: "실시간으로 뉴스를 검색하고, 관련 기사를 빠르게 모아볼 수 있어요.",
    img: "/previews/search.png",
  },
  {
    title: "AI 요약",
    emoji: "🧠",
    color: "bg-green-100",
    desc: "긴 뉴스 기사도 AI가 핵심 내용을 요약해줘요.",
    img: "/previews/summary.png",
  },
  {
    title: "검색 히스토리",
    emoji: "🗂️",
    color: "bg-yellow-100",
    desc: "이전 검색 기록을 다시 확인할 수 있어요.",
    img: "/previews/history.png",
  },
  {
    title: "뉴스 스크랩",
    emoji: "📌",
    color: "bg-purple-100",
    desc: "중요한 뉴스는 따로 저장해두고, 다시 읽을 수 있어요.",
    img: "/previews/scrap.png",
  },
];

export default function MainPage() {
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const query = inputRef.current?.value.trim();
    if (query) {
      navigate(`/news?query=${encodeURIComponent(query)}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b w-full from-gray-200 to-white py-20 px-4 flex flex-col items-center">
      <motion.h1
  initial={{ opacity: 0, y: -30 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.6 }}
  className="text-3xl font-bold text-gray-800 mb-6"
>
  🔍 뉴스 검색어를 입력하세요
</motion.h1>

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

      {/* 설명 카드들 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl w-full mb-10">
        {features.map((item, idx) => (
          <motion.div
            key={idx}
            whileHover={{ scale: 1.05 }}
            onMouseEnter={() => setHoveredIndex(idx)}
            onMouseLeave={() => setHoveredIndex(null)}
            className={`${item.color} rounded-2xl shadow p-6 transition cursor-default`}
          >
            <h3 className="text-xl font-semibold mb-2">{item.emoji} {item.title}</h3>
            <p className="text-gray-700 text-sm leading-relaxed">{item.desc}</p>
          </motion.div>
        ))}
      </div>

      {/* 아래 캡처 이미지 영역 */}
      <div className="w-full flex justify-center items-center min-h-[280px]">
  {hoveredIndex !== null && (
    <motion.img
      key={hoveredIndex}
      src={features[hoveredIndex].img}
      alt={`${features[hoveredIndex].title} 미리보기`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="rounded-xl shadow-xl max-h-[480px] w-auto object-contain border border-gray-300"
    />
  )}
</div>
    </div>
  );
}

/*
<div className="w-full flex justify-center items-center min-h-[280px]">
  {hoveredIndex !== null && (
    <motion.img
      key={hoveredIndex}
      src={features[hoveredIndex].img}
      alt={`${features[hoveredIndex].title} 미리보기`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="rounded-xl shadow-xl max-h-[480px] w-auto object-contain border border-gray-300"
    />
  )}
</div>

*/