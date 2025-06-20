import { useState, useEffect, useCallback } from "react";
import { type newsInfo } from "./NewsFetcher";

interface dataProps {
  data: newsInfo;
}

export default function NewsCard({ data }: dataProps) {
  const [summary, setSummary] = useState<string | null>(null);
  // 수정 1) 로딩 상태 분리 
  const [loadingSummary, setLoadingSummary] = useState(false);  // '요약 중...' 표시
  const [loadingScrap, setLoadingScrap] = useState(false);      // '스크랩 중' 표시
  const [error, setError] = useState<string | null>(null);
  const [scraped, setScraped] = useState(false);
  const token = localStorage.getItem("token");

  const fetchSummary = useCallback(async (): Promise<string> => {
    if (summary) return summary; // 기존 요약이 있으면 재사용
    if (!data.link) throw new Error("링크 없음");

    setLoadingSummary(true);
    try {
      const res = await fetch("http://localhost:5000/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: data.link,
          length: "short",
          style: "neutral",
          use_ai: true,
        }),
      });
      if (!res.ok) throw new Error("요약 요청 실패");
      const { summary: newSummary } = await res.json();
      setSummary(newSummary);
      return newSummary;
    } finally {
      setLoadingSummary(false);
    }
  }, [data.link, summary]);

  const summarizeHandler = () => {
    fetchSummary().catch(err => {
      console.error(err);
      setError("요약이 불가한 기사입니다.");
    });
  };

  const scrapHandler = useCallback(async () => {
    const userId = localStorage.getItem("userId");
    if (!userId || !token) {
      alert("로그인이 필요합니다.");
      return;
    }

    // 수정 1) UI를 미리 업데이트 (Optimistic UI (?))
    setLoadingScrap(true);
    setScraped(prev => !prev);

    try {
      if (!scraped) {
        // 수정 2) 스크랩 시, 이미 불러온 summary 상태를 사용함. (없으면 빈 문자열? "요약 없음"?)
        // const summaryText = await fetchSummary();
        const res = await fetch("http://10.125.121.190:8080/api/liked", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: token,
          },
          body: JSON.stringify({
            username: userId,
            title: data.title,
            link: data.link,
            originallink: data.originallink,
            pubDate: data.pubDate,
            // summary: summaryText || "요약 없음",
            summary: summary || "요약 없음",
          }),
        });
        if (!res.ok) throw new Error("스크랩 실패");
      } else {
        // 스크랩 해제
        const res = await fetch(
          `http://10.125.121.190:8080/api/liked?username=${encodeURIComponent(
            userId
          )}&link=${encodeURIComponent(data.link)}`,
          {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
              Authorization: token,
            },
          }
        );
        if (!res.ok) throw new Error("스크랩 해제 실패");
        // const scrapHandler = useCallback(async () => {
        //   if (!res.ok) throw new Error("스크랩 해제 실패");
        // })
      }
    } catch (err) {
      console.error(err);
      // 실패 시 상태 롤백
      setScraped(prev => !prev);
      alert("오류 발생");
    } finally {
      setLoadingScrap(false);
    }
  }, [data, scraped, token]); // fetchSummary 제거, 불필요한 재렌더링 방지

  useEffect(() => {
    const userId = localStorage.getItem("userId");
    if (!userId || !token) return;

    (async () => {
      try {
        const res = await fetch(
          `http://10.125.121.190:8080/api/liked/check?username=${encodeURIComponent(
            userId
          )}&link=${encodeURIComponent(data.link)}`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: token,
            },
          }
        );
        if (!res.ok) throw new Error("스크랩 여부 확인 실패");
        const { scraped: isScraped } = await res.json();
        setScraped(isScraped);
      } catch (err) {
        console.error(err);
      }
    })();
  }, [data.link, token]);
  
  // 수정 4) 하트 버튼
  return (
    <div className="bg-white shadow-md rounded-lg p-4 m-2 hover:scale-105 transition-transform duration-200 relative">
      {/* ...제목, 날짜, 요약 보기 버튼 등은 동일... */}
      <h2 className="text-lg font-semibold text-gray-800 mb-2">
        <a
          href={data.originallink || data.link}
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-blue-600 underline"
        >
          {data.title
            .replace(/<b>/g, "")
            .replace(/<\/b>/g, "")
            .replace(/&quot;/g, '"')}
        </a>
      </h2>
      <p className="text-sm text-gray-500">{data.pubDate}</p>
      
      <div className="flex gap-2 mt-3">
        <button
          onClick={summarizeHandler}
          className="text-sm bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 transition"
        >
          요약 보기
        </button>
        {(summary || error) && (
          <button
            onClick={() => {
              setSummary(null);
              setError(null); // 에러도 같이 초기화
            }}
            className="text-sm bg-gray-300 text-gray-800 px-3 py-1 rounded hover:bg-gray-400 transition"
          >
            요약 닫기
          </button>
        )}
      </div>
      
      {loadingSummary && <p className="text-sm text-gray-500 mt-2">요약 중...</p>}
      {error && (
        <div className="mt-2 text-sm text-red-500">
          {error}
          <div className="mt-1">
            <a
              href={data.originallink || data.link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block text-blue-600 underline hover:text-blue-800"
            >
              원문 보기
            </a>
          </div>
        </div>
      )}
      
      {summary && (
        <div className="mt-2 p-2 bg-gray-100 rounded text-sm text-gray-800">
          <strong>요약:</strong> {summary}
        </div>
      )}
      
      <button
        onClick={scrapHandler}
        disabled={loadingScrap}
        className={`text-2xl absolute bottom-2 right-2 transition ${
          loadingScrap ? "opacity-50 cursor-wait" : "hover:scale-110"
        }`}
        title={scraped ? "스크랩 해제" : "스크랩"}
      >
        {scraped ? "❤️" : "🤍"}
      </button>
    </div>
  );
}
