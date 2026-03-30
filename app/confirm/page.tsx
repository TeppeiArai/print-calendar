"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import type { ExtractedEvent } from "@/types";
import ErrorBanner from "@/components/ErrorBanner";

export default function ConfirmPage() {
  const router = useRouter();
  const { status } = useSession();
  const [original, setOriginal] = useState<ExtractedEvent | null>(null);
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [location, setLocation] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/");
      return;
    }

    const raw = sessionStorage.getItem("extractedData");
    if (!raw) {
      router.replace("/home");
      return;
    }

    const data: ExtractedEvent = JSON.parse(raw);
    setOriginal(data);
    setTitle(data.title || "");
    setDate(data.date || "");
    setStartTime(data.start_time || "");
    setEndTime(data.end_time || "");
    setLocation(data.location || "");
    setNotes(data.notes || "");
  }, [router, status]);

  const handleRegister = async () => {
    if (!title.trim()) {
      setError("イベント名を入力してください");
      return;
    }
    if (!date) {
      setError("日付を入力してください");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          date,
          start_time: startTime || null,
          end_time: endTime || null,
          location: location.trim() || null,
          notes: notes.trim() || null,
        }),
      });

      const data = await res.json();

      if (data.success) {
        sessionStorage.setItem(
          "registeredEvent",
          JSON.stringify({ title: title.trim(), date })
        );
        sessionStorage.removeItem("printImage");
        sessionStorage.removeItem("extractedData");
        router.push("/complete");
      } else {
        setError(data.error || "登録に失敗しました");
      }
    } catch {
      setError("通信エラーが発生しました");
    } finally {
      setLoading(false);
    }
  };

  const handleRetake = () => {
    sessionStorage.removeItem("printImage");
    sessionStorage.removeItem("extractedData");
    router.push("/home");
  };

  if (!original) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin" />
      </div>
    );
  }

  const aiLabel = (value: string | null) =>
    value ? `AI読み取り：${value}` : "読み取れませんでした";

  return (
    <div className="min-h-screen px-6 py-8">
      {error && <ErrorBanner message={error} onClose={() => setError("")} />}

      <h1 className="text-xl font-bold text-gray-900 mb-6">
        内容を確認してください
      </h1>

      <div className="space-y-4 mb-8">
        <div className="bg-gray-50 rounded-xl p-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            イベント名 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-3 border border-gray-300 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="例：運動会"
          />
          <p className="mt-1 text-xs text-gray-400">{aiLabel(original.title)}</p>
        </div>

        <div className="bg-gray-50 rounded-xl p-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            日付 <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full px-3 py-3 border border-gray-300 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p className="mt-1 text-xs text-gray-400">{aiLabel(original.date)}</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-50 rounded-xl p-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              開始時間
            </label>
            <input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="w-full px-3 py-3 border border-gray-300 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="mt-1 text-xs text-gray-400">
              {aiLabel(original.start_time)}
            </p>
          </div>
          <div className="bg-gray-50 rounded-xl p-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              終了時間
            </label>
            <input
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="w-full px-3 py-3 border border-gray-300 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="mt-1 text-xs text-gray-400">
              {aiLabel(original.end_time)}
            </p>
          </div>
        </div>

        <div className="bg-gray-50 rounded-xl p-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            場所
          </label>
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="w-full px-3 py-3 border border-gray-300 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="例：学校グラウンド"
          />
          <p className="mt-1 text-xs text-gray-400">
            {aiLabel(original.location)}
          </p>
        </div>

        <div className="bg-gray-50 rounded-xl p-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            メモ
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            className="w-full px-3 py-3 border border-gray-300 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            placeholder="持ち物・備考など"
          />
          <p className="mt-1 text-xs text-gray-400">
            {aiLabel(original.notes)}
          </p>
        </div>
      </div>

      <div className="flex gap-3">
        <button
          onClick={handleRetake}
          disabled={loading}
          className="flex-1 py-3 border-2 border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50"
        >
          ← 撮り直す
        </button>
        <button
          onClick={handleRegister}
          disabled={loading}
          className="flex-[2] py-3 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            "カレンダーに登録する →"
          )}
        </button>
      </div>
    </div>
  );
}
