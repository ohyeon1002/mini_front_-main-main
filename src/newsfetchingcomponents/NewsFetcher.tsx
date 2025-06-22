// src/newsfetchingcomponents/NewsFetcher.tsx
import { useEffect, useState, type ReactNode } from "react";
import NewsCard from "./NewsCard";

export interface newsFetcherProps {
  uriEncodedString: string;
  pageSetter?: (pages: searchHistory[]) => void;
}
const apiurl = import.meta.env.VITE_API_URL;

export type newsInfo = {
  title: string;
  originallink: string;
  link: string;
  description: string;
  pubDate: string;
  id?: string;
};

export type searchHistory = {
  id: number;
  timestamp: string;
};

export default function NewsFetcher({ uriEncodedString, pageSetter }: newsFetcherProps) {
  const apikey: string = import.meta.env.VITE_APP_APIKEY;

  const myHeaders: Headers = new Headers();
  myHeaders.append("X-Naver-Client-Id", "qQ0rDJDLUQdGBC0U6Ndl");
  myHeaders.append("X-Naver-Client-Secret", apikey);

  const requestOptions = {
    method: "GET",
    headers: myHeaders,
  };

  const [news, setNews] = useState<newsInfo[] | undefined>();

  const fetchHandler = async () => {
    console.log("fetchHandler called");
    try {
      const resp: Response = await fetch(`/v1/search/news.json?query=${uriEncodedString}&display=12`, requestOptions);
      const jsn = await resp.json();

      const itemsWithId: newsInfo[] = jsn.items.map((item: any, idx: number) => ({
        ...item,
        id: `${item.title}_${item.pubDate}_${idx}`,
      }));

      setNews(itemsWithId);
      await saveHistory(itemsWithId);
    } catch (e) {
      console.error("뉴스 가져오기 실패:", e);
    }
  };

  useEffect(() => {
    if (!uriEncodedString) return;
    fetchHandler();
  }, [uriEncodedString]);

  const tags: ReactNode = news
    ? news.map((item: newsInfo) => <NewsCard data={item} key={item.id} />)
    : <div></div>;

  const saveHistory = async (items: newsInfo[]) => {
  const userId = localStorage.getItem("userId");
  const token = localStorage.getItem("token");

  if (!userId || !token) return;

  try {
    const response = await fetch(`${apiurl}/api/history`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: token,
              "ngrok-skip-browser-warning": "true",
      },
      body: JSON.stringify({
        username: userId,
        query: decodeURI(uriEncodedString),
        results: items.map(({ id, ...rest }) => rest),
      }),
    });

  const data: searchHistory[] = await response.json();
  console.log("백엔드 저장 성공:", data);
  // You can use the data or call pageSetter if needed
  if (pageSetter) pageSetter(data);
} catch (err) {
  console.error("백엔드 저장 실패:", err);
}
};



  return (
    <div className="w-full flex justify-center mt-6">
      <div className="w-full max-w-6xl grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 px-4">
        {tags}
      </div>
    </div>
  );
}
