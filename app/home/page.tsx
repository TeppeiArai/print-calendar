"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

const MAX_IMAGE_WIDTH = 1600;
const JPEG_QUALITY = 0.8;

function compressImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      let { width, height } = img;
      if (width > MAX_IMAGE_WIDTH) {
        height = Math.round(height * (MAX_IMAGE_WIDTH / width));
        width = MAX_IMAGE_WIDTH;
      }
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Canvas not supported"));
        return;
      }
      ctx.drawImage(img, 0, 0, width, height);
      const base64 = canvas.toDataURL("image/jpeg", JPEG_QUALITY);
      resolve(base64);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("画像の読み込みに失敗しました"));
    };
    img.src = url;
  });
}

export default function HomePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const libraryInputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [compressing, setCompressing] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/");
    }
    const savedError = sessionStorage.getItem("analyzeError");
    if (savedError) {
      setError(savedError);
      sessionStorage.removeItem("analyzeError");
    }
  }, [status, router]);

  const handleImageSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    setCompressing(true);

    try {
      const base64 = await compressImage(file);
      sessionStorage.setItem("printImage", base64);
      router.push("/analyze");
    } catch {
      setError("画像の処理に失敗しました。別の画像をお試しください。");
      setCompressing(false);
    }
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col px-6 py-8">
      <div className="flex items-center justify-between mb-8">
        <p className="text-sm text-gray-500">{session?.user?.name}</p>
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="text-sm text-gray-400 hover:text-gray-600"
        >
          ログアウト
        </button>
      </div>

      {error && (
        <div className="max-w-sm mx-auto mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
          {error}
        </div>
      )}

      {compressing && (
        <div className="fixed inset-0 bg-white/80 flex flex-col items-center justify-center z-50">
          <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin" />
          <p className="mt-4 text-gray-600">画像を準備しています...</p>
        </div>
      )}

      <div className="flex-1 flex flex-col items-center justify-center gap-4">
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleImageSelected}
          className="hidden"
        />
        <button
          onClick={() => cameraInputRef.current?.click()}
          className="w-full max-w-sm py-4 bg-blue-500 hover:bg-blue-600 text-white font-bold text-lg rounded-xl transition-colors"
        >
          📷 写真を撮る
        </button>

        <input
          ref={libraryInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageSelected}
          className="hidden"
        />
        <button
          onClick={() => libraryInputRef.current?.click()}
          className="w-full max-w-sm py-3 bg-white border-2 border-gray-300 hover:border-gray-400 text-gray-700 font-medium text-base rounded-xl transition-colors"
        >
          🖼️ ライブラリから選ぶ
        </button>
      </div>

      <div className="mt-8 mb-4">
        <div className="flex flex-col gap-4 max-w-sm mx-auto">
          <div className="flex items-center gap-3 text-gray-400 text-sm">
            <span className="text-lg">①</span>
            <span>プリントを撮影</span>
          </div>
          <div className="flex items-center gap-3 text-gray-400 text-sm">
            <span className="text-lg">②</span>
            <span>内容を確認</span>
          </div>
          <div className="flex items-center gap-3 text-gray-400 text-sm">
            <span className="text-lg">③</span>
            <span>カレンダーに登録</span>
          </div>
        </div>
      </div>
    </div>
  );
}
