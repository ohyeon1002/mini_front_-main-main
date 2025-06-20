// src/components/Header.tsx
import { useNavigate } from "react-router-dom";

export default function Header() {
  const navigate = useNavigate();
  const isLoggedIn = !!localStorage.getItem("userId");

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    alert("로그아웃 되었습니다.");
    navigate("/login");
  };

  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm border-b px-6 py-4 flex justify-between items-center">
      <div
        className="text-xl font-bold text-blue-600 cursor-pointer tracking-wide"
        onClick={() => navigate("/")}
      >
        📰 News Pocket
      </div>

      <div className="flex gap-3">
        {isLoggedIn ? (
          <>
            <button
              onClick={() => navigate("/scrap")}
              className="text-sm px-4 py-2 bg-pink-500 text-white rounded hover:bg-pink-600 transition"
            >
              스크랩
            </button>

            <button
              onClick={handleLogout}
              className="text-sm px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition"
            >
              로그아웃
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => navigate("/login")}
              className="text-sm px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
            >
              로그인
            </button>
            <button
              onClick={() => navigate("/signup")}
              className="text-sm px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition"
            >
              회원가입
            </button>
          </>
        )}
      </div>
    </header>
  );
}