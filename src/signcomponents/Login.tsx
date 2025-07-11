import { useState } from "react";
import { useNavigate } from "react-router-dom";

const apiurl = import.meta.env.VITE_API_URL;

export default function LoginForm() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const loginHandler = async (e: React.FormEvent) => {
  e.preventDefault();

  try {
    const res = await fetch(`${apiurl}/api/public/signin`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    console.log(" 응답 상태코드:", res.status); // 

    if (res.ok) {
      const data = await res.json();
      localStorage.setItem("token", data.token);
      localStorage.setItem("userId", data.userId);
      alert("로그인 성공");
      navigate("/");  // 
    } else {
      alert("로그인 실패: 아이디 또는 비밀번호를 확인하세요.");
    }
  } catch (err) {
    console.error("로그인 에러:", err);
    alert("로그인 중 오류 발생");
  }
};

//src\components

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form
        onSubmit={loginHandler}
        className="bg-white shadow-lg rounded-xl px-8 py-10 w-full max-w-sm"
      >
        <h2 className="text-2xl font-bold mb-6 text-center text-blue-600">로그인</h2>
        <input
          type="text"
          placeholder="아이디"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full border p-2 rounded mb-4"
        />
        <input
          type="password"
          placeholder="비밀번호"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border p-2 rounded mb-4"
        />
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
        >
          로그인
        </button>
        <p className="text-sm mt-4 text-center">
          뉴스포켓의 다양한 기능을 만나보세요!
        </p>
      </form>
    </div>
  );
}