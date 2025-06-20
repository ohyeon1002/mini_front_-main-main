// src/pages/NewsPage.tsx
import { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import NewsFetcher from "../newsfetchingcomponents/NewsFetcher";
import SearchHistoryFetcher from "../newsfetchingcomponents/SearchHistoryFetcher";
import type { searchHistory } from "../newsfetchingcomponents/NewsFetcher";

export default function NewsPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const queryFromURL = params.get("query") || "";
  const [inputValue, setInputValue] = useState(queryFromURL);
  const [showHistory, setShowHistory] = useState(false);
  const [pages, setPages] = useState<searchHistory[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const userId = localStorage.getItem("userId");

  const onSubmitHandle = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = inputValue.trim();
    if (trimmed) {
      navigate(`/news?query=${encodeURIComponent(trimmed)}`);
    }
  };

  const slidePrev = () => {
    if (activeIndex > 0) setActiveIndex((prev) => prev - 1);
  };

  const slideNext = () => {
    if (activeIndex < pages.length - 1) setActiveIndex((prev) => prev + 1);
  };

  return (
    <div className="min-h-screen bg-gray-100flex flex-col">
      <main className="w-full flex flex-col items-center px-4 py-10">
        {/*  검색창 */}
        <section className="w-full max-w-lg mb-6">
          <form
            className="flex flex-col sm:flex-row gap-3 bg-white p-6 shadow-lg rounded-xl"
            onSubmit={onSubmitHandle}
          >
            <input
              type="text"
              className="flex-grow px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="🔍 뉴스 검색어를 입력하세요"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
            />
            <button
              type="submit"
              className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition"
            >
              검색
            </button>
          </form>
        </section>

        {/*  히스토리 토글 */}
        <div className="w-full max-w-screen-xl flex justify-end px-4 mb-6">
          {userId && queryFromURL && (
            <button
              onClick={() => setShowHistory((prev) => !prev)}
              className="text-sm px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded transition"
            >
              {showHistory ? "히스토리 닫기 🔽" : "히스토리 열기 🔼"}
            </button>
          )}
        </div>

        {/*  결과 섹션 */}
        {queryFromURL ? (
          <section className={`w-full ${showHistory ? "grid-cols-2" : "grid-cols-1"} grid gap-8 px-4 max-w-screen-2xl`}>
            {/*  현재 검색 결과 */}
            <div className="bg-white p-6 rounded-xl shadow-md">
              <h2 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2"> 현재 검색 결과</h2>
              <NewsFetcher uriEncodedString={encodeURIComponent(queryFromURL)} pageSetter={setPages} />
            </div>

            {/*  이전 검색 기록 */}
            {showHistory && userId && (
              <div className="bg-white p-6 rounded-xl shadow-md">
                <div className="flex items-center justify-between mb-4 border-b pb-2">
                  <h2 className="text-xl font-semibold text-gray-800"> 이전 검색 기록</h2>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={slidePrev}
                      className={`text-sm px-3 py-1 bg-gray-200 rounded transition ${activeIndex === 0 ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-300"
                        }`}
                      disabled={activeIndex === 0}
                    >
                      이전
                    </button>

                    <span className="text-sm text-gray-500">
                      {pages[activeIndex]?.timestamp ?? ""}
                    </span>


                    <button
                      onClick={slideNext}
                      className={`text-sm px-3 py-1 bg-gray-200 rounded transition ${activeIndex === pages.length - 1 ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-300"
                        }`}
                      disabled={activeIndex === pages.length - 1}
                    >
                      다음
                    </button>
                  </div>

                </div>


                <SearchHistoryFetcher
                  pages={pages}
                  activeIndex={activeIndex}
                  setActiveIndex={setActiveIndex}
                />

              </div>
            )}
          </section>
        ) : (
          <div className="text-center text-gray-500 mt-10">
            <p>검색어를 입력해주세요.</p>
          </div>
        )}
      </main>
    </div>
  );
}