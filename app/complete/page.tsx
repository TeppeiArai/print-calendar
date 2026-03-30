"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

export default function CompletePage() {
  const router = useRouter();
  const { status } = useSession();
  const [eventTitle, setEventTitle] = useState("");
  const [eventDate, setEventDate] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/");
      return;
    }

    const raw = sessionStorage.getItem("registeredEvent");
    if (!raw) {
      router.replace("/home");
      return;
    }

    const data = JSON.parse(raw);
    setEventTitle(data.title);
    setEventDate(data.date);
    sessionStorage.removeItem("registeredEvent");
  }, [router, status]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6">
      <div className="text-center mb-8">
        <div className="text-7xl mb-4">✅</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          カレンダーに登録しました！
        </h1>
        {eventTitle && (
          <p className="text-gray-500">
            {eventTitle}（{eventDate}）
          </p>
        )}
      </div>

      <div className="w-full max-w-sm space-y-3">
        <a
          href="https://calendar.google.com"
          target="_blank"
          rel="noopener noreferrer"
          className="block w-full py-3 text-center border-2 border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors"
        >
          Googleカレンダーを開く
        </a>
        <button
          onClick={() => router.push("/home")}
          className="w-full py-4 bg-blue-500 hover:bg-blue-600 text-white font-bold text-lg rounded-xl transition-colors"
        >
          次のプリントを登録する
        </button>
      </div>
    </div>
  );
}
