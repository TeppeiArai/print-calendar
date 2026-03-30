"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import LoadingSpinner from "@/components/LoadingSpinner";

export default function AnalyzePage() {
  const router = useRouter();
  const { status } = useSession();
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/");
      return;
    }

    const imageBase64 = sessionStorage.getItem("printImage");
    if (!imageBase64) {
      router.replace("/home");
      return;
    }

    setImagePreview(imageBase64);

    const analyze = async () => {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 60000);

        const res = await fetch("/api/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ imageBase64 }),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);
        const data = await res.json();

        if (data.success && data.data) {
          sessionStorage.setItem("extractedData", JSON.stringify(data.data));
          router.push("/confirm");
        } else {
          sessionStorage.setItem("analyzeError", data.error || "解析に失敗しました");
          router.push("/home");
        }
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") {
          sessionStorage.setItem("analyzeError", "通信がタイムアウトしました。電波の良い場所で再度お試しください。");
        } else {
          sessionStorage.setItem("analyzeError", "通信エラーが発生しました。ネットワーク接続を確認してください。");
        }
        router.push("/home");
      }
    };

    analyze();
  }, [router, status]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6">
      {imagePreview && (
        <div className="w-full max-h-[40vh] mb-8 flex justify-center">
          <img
            src={imagePreview}
            alt="撮影したプリント"
            className="max-h-[40vh] object-contain rounded-xl"
          />
        </div>
      )}
      <LoadingSpinner />
      <p className="mt-6 text-lg font-medium text-gray-700">
        プリントを読み取っています...
      </p>
      <p className="mt-2 text-sm text-gray-400">
        少々お待ちください（約5〜10秒）
      </p>
    </div>
  );
}
