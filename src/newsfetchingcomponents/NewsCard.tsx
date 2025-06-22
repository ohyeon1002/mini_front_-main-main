import { useState, useEffect } from "react";
import { type newsInfo } from "./NewsFetcher";

interface dataProps {
  data: newsInfo;
  thumbnail?: string;
}
const apiurl = import.meta.env.VITE_API_URL;

export default function NewsCard({ data, thumbnail }: dataProps) {
  const [summary, setSummary] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [scraped, setScraped] = useState(false);
  const token = localStorage.getItem("token");

  const summarizeHandler = async () => {
    if (!data?.link) {
      setError("기사 링크가 없습니다.");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const res = await fetch("/api/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          link:data.link,
        }),
      });

      if (!res.ok) throw new Error("요약 요청 실패");
      const result = await res.json();
      setSummary(result.summary);
    } catch (err) {
      console.error("요약 에러:", err);
      setError("요약이 불가한 기사입니다. 원문으로 확인하실 수 있습니다.");
    } finally {
      setLoading(false);
    }
  };

  const scrapHandler = async () => {
    const userId = localStorage.getItem("userId");
    if (!userId || !token) {
      alert("로그인이 필요합니다.");
      return;
    }

    try {
      if (!scraped) {
        const summaryRes = await fetch("http://localhost:5000/summarize", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            url: data.link,
            length: "short",
            style: "neutral",
            use_ai: true,
          }),
        });

        if (!summaryRes.ok) throw new Error("요약 실패");
        const summaryData = await summaryRes.json();

        const res = await fetch(`${apiurl}/api/liked`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: token,
              "ngrok-skip-browser-warning": "true", },
          body: JSON.stringify({
            username: userId,
            title: data.title,
            link: data.link,
            originallink: data.originallink,
            pubDate: data.pubDate,
            summary: summaryData.summary || "요약 없음",
          }),
        });

        if (res.ok) {
          setScraped(true);
        } else {
          alert("스크랩 실패");
        }
      } else {
        const res = await fetch(
          `${apiurl}/api/liked?username=${userId}&link=${encodeURIComponent(data.link)}`,
          {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
              Authorization: token,
              "ngrok-skip-browser-warning": "true",
            },
          }
        );

        if (res.ok) {
          setScraped(false);
        } else {
          alert("스크랩 해제 실패");
        }
      }
    } catch (err) {
      console.error("스크랩 토글 오류:", err);
      alert("오류 발생");
    }
  };

  useEffect(() => {
    const userId = localStorage.getItem("userId");
    if (!userId || !token) return;

    const checkScrap = async () => {
      try {
        const res = await fetch(
          `${apiurl}/api/liked/check?username=${encodeURIComponent(
            userId
          )}&link=${encodeURIComponent(data.link)}`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: token,
              "ngrok-skip-browser-warning": "true",
            },
          }
        );
        if (!res.ok) throw new Error("스크랩 여부 확인 실패");

        const result = await res.json();
        setScraped(result.scraped);
      } catch (err) {
        console.error("스크랩 여부 확인 에러:", err);
      }
    };

    checkScrap();
  }, [data.link]);

 return (
  <div className="bg-white shadow-md rounded-lg p-4 m-2 flex flex-col justify-between h-full">
    {/* 상단 내용 영역 */}
    <div>
      <img src={thumbnail}/>
      <h2 className="text-lg font-semibold text-gray-800 mb-2">
        <a
          href={data.originallink || data.link}
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-blue-600 underline"
        >
          {data.title.replace(/<b>/g, "").replace(/<\/b>/g, "").replace(/&quot;/g, '"')}
        </a>
      </h2>
      <p className="text-sm text-gray-500 mb-2">{data.pubDate}</p>

      {/* 요약 결과 */}
      {loading && <p className="text-sm text-gray-500 mt-2">요약 중...</p>}
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
        <div className="mt-2 p-2 bg-gray-100 rounded text-sm text-gray-800 whitespace-pre-line">
          <strong>요약:</strong> {summary}
        </div>
      )}
    </div>

    {/* 하단 버튼 영역 */}
    <div className="mt-4 flex justify-between items-center">
      <div className="flex gap-2">
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
              setError(null);
            }}
            className="text-sm bg-gray-300 text-gray-800 px-3 py-1 rounded hover:bg-gray-400 transition"
          >
            요약 닫기
          </button>
        )}
      </div>

      {/* 하트 버튼 */}
      <button
        onClick={scrapHandler}
        className="text-xl hover:scale-110 transition"
        title={scraped ? "스크랩 해제" : "스크랩"}
      >
        {scraped ? "❤️" : "🤍"}
      </button>
    </div>
  </div>
);
}
