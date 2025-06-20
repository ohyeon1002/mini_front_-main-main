// src/pages/SearchResultPage.tsx
import { useState } from "react";
import NewsFetcher from "../newsfetchingcomponents/NewsFetcher";
import SearchHistoryFetcher from "../newsfetchingcomponents/SearchHistoryFetcher";
import type { searchHistory } from "../newsfetchingcomponents/NewsFetcher";

export default function SearchResultPage({ uriEncodedString }: { uriEncodedString: string }) {
  const [showHistory, setShowHistory] = useState(false);
  const [pages, setPages] = useState<searchHistory[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);

  const toggleHistory = () => setShowHistory((prev) => !prev);
  const handlePrev = () => setActiveIndex((prev) => Math.max(prev - 1, 0));
  const handleNext = () => setActiveIndex((prev) => Math.min(prev + 1, pages.length - 1));

  return (
    <div className="min-h-screen bg-pink-50 p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">🔍 뉴스 검색 결과</h1>
        <button
          onClick={toggleHistory}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
        >
          {showHistory ? "히스토리 숨기기" : "히스토리 보기"}
        </button>
      </div>

      {!showHistory ? (
        <NewsFetcher uriEncodedString={uriEncodedString} pageSetter={setPages} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 📜 이전 검색 기록 */}
          <div className="bg-white p-5 rounded-xl shadow-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-700">📜 이전 검색 기록</h2>
              <div className="flex gap-2 items-center">
                <button
                  onClick={handlePrev}
                  disabled={activeIndex === 0}
                  className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
                >
                  이전
                </button>
                <span className="text-sm text-gray-500">
                  {pages[activeIndex]?.timestamp || ""}
                </span>
                <button
                  onClick={handleNext}
                  disabled={activeIndex >= pages.length - 1}
                  className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
                >
                  다음
                </button>
              </div>
            </div>
            <SearchHistoryFetcher
                pages={pages} activeIndex={0} setActiveIndex={function (index: number): void {
                  throw new Error("Function not implemented.");
                } }              //activeIndex={activeIndex}
              //setActiveIndex={setActiveIndex}
            />
          </div>

          {/* 📌 현재 검색 결과 */}
          <div className="bg-white p-5 rounded-xl shadow-md">
            <h2 className="text-xl font-semibold text-gray-700 mb-3">📌 현재 검색 결과</h2>
            <NewsFetcher uriEncodedString={uriEncodedString} pageSetter={setPages} />
          </div>
        </div>
      )}
    </div>
  );
}
