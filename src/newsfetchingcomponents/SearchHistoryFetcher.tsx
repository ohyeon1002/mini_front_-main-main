// src/newsfetchingcomponents/SearchHistoryFetcher.tsx
import { useEffect, useRef, useState } from "react";
import NewsCard from "./NewsCard";
import AliceCarousel from "react-alice-carousel";
import "react-alice-carousel/lib/alice-carousel.css";
import { useNavigate } from "react-router-dom";
import type { searchHistory } from "./NewsFetcher";

interface HistoryItem {
  title: string;
  originallink: string;
  link: string;
  description: string;
  pubDate: string;
}

interface Props {
  pages: searchHistory[];
  activeIndex: number;
  setActiveIndex: (index: number) => void;
}

export default function SearchHistoryFetcher({ pages, activeIndex, setActiveIndex }: Props) {
  const navigate = useNavigate();
  const userId = localStorage.getItem("userId");
  const token = localStorage.getItem("token");
  const [dataCache, setDataCache] = useState<{ [pageId: string]: HistoryItem[] }>({});
  const [isLoading, setIsLoading] = useState(false);
  const carouselRef = useRef<AliceCarousel>(null);

  // fetch 데이터 when index changes
  useEffect(() => {
    if (!token || pages.length === 0) return;
    const currentPage = pages[activeIndex];
    if (!currentPage || dataCache[currentPage.id]) return;

    const fetchHistory = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`http://10.125.121.190:8080/api/history?id=${currentPage.id}`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: token,
          },
        });

        if (!res.ok) throw new Error("히스토리 요청 실패");
        const data: HistoryItem[] = await res.json();

        setDataCache((prev) => ({
          ...prev,
          [currentPage.id]: data,
        }));
      } catch (err) {
        console.error("히스토리 요청 실패:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchHistory();
  }, [activeIndex, pages, token]);

  useEffect(() => {
    carouselRef.current?.slideTo(activeIndex);
  }, [activeIndex]);

  const onSlideChanged = (e: { item: number }) => {
    if (e.item !== activeIndex) {
      setActiveIndex(e.item);
    }
  };

  if (!userId) {
    return (
      <div className="p-4 bg-yellow-50 border rounded shadow text-center">
        <p className="text-gray-800 font-semibold mb-3">
          로그인하시면 이전 검색 기록을 확인하실 수 있습니다.
        </p>
        <button
          onClick={() => navigate("/login")}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
        >
          로그인 하러가기
        </button>
      </div>
    );
  }

  if (pages.length === 0) {
    return <div className="text-center text-gray-500">검색 기록이 없습니다.</div>;
  }

  const carouselItems = pages.map((page, idx) => {
    const pageData = dataCache[page.id] || [];

    return (
      <div key={page.id} className="w-full p-2">
        {isLoading && idx === activeIndex ? (
          <div className="text-center text-gray-400 italic">불러오는 중...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {pageData.map((item) => (
              <NewsCard key={item.link} data={item} />
            ))}
          </div>
        )}
      </div>
    );
  });

  return (
    <AliceCarousel
      items={carouselItems}
      activeIndex={activeIndex}
      ref={carouselRef}
      mouseTracking
      disableDotsControls
      disableButtonsControls
      animationDuration={400}
      infinite={false}
      onSlideChanged={onSlideChanged}
    />
  );
}
