// src/pages/HistoryCard.tsx
import { useState } from "react";
import NewsFetcher from "../newsfetchingcomponents/NewsFetcher";
import SearchHistoryFetcher from "../newsfetchingcomponents/SearchHistoryFetcher";
import type { searchHistory } from "../newsfetchingcomponents/NewsFetcher";

export default function HistoryCard({ uriEncodedString }: { uriEncodedString: string }) {
  const [showHistory, setShowHistory] = useState(false);
  const [pages, setPages] = useState<searchHistory[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <div className="p-6 min-h-screen bg-gray-100">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">🔍 뉴스 검색 결과</h1>
        <button
          onClick={() => setShowHistory(!showHistory)}
          className="text-sm px-4 py-2 rounded bg-blue-500 text-white hover:bg-blue-600 transition"
        >
          {showHistory ? "히스토리 숨기기" : "히스토리 보기"}
        </button>
      </div>

      {!showHistory ? (
        <NewsFetcher uriEncodedString={uriEncodedString} pageSetter={setPages} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-5 rounded-xl shadow">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-700">📜 이전 검색 기록</h2>
              <div className="flex gap-2 items-center">
                <button
                  onClick={() => setActiveIndex((prev) => Math.max(prev - 1, 0))}
                  disabled={activeIndex === 0}
                  className="px-2 py-1 bg-gray-200 rounded disabled:opacity-50 hover:bg-gray-300"
                >
                  이전
                </button>
                <span className="text-sm text-gray-500">
                  {pages[activeIndex]?.timestamp || ""}
                </span>
                <button
                  onClick={() => setActiveIndex((prev) => Math.min(prev + 1, pages.length - 1))}
                  disabled={activeIndex >= pages.length - 1}
                  className="px-2 py-1 bg-gray-200 rounded disabled:opacity-50 hover:bg-gray-300"
                >
                  다음
                </button>
              </div>
            </div>
            <SearchHistoryFetcher
                pages={pages} activeIndex={0} setActiveIndex={function (index: number): void {
                  throw new Error("Function not implemented.");
                } }             
            />
          </div>

          <div className="bg-white p-5 rounded-xl shadow">
            <h2 className="text-lg font-semibold text-gray-700 mb-3">📌 현재 검색 결과</h2>
            <NewsFetcher uriEncodedString={uriEncodedString} pageSetter={setPages} />
          </div>
        </div>
      )}
    </div>
  );
}
