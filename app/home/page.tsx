"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";

export default function HomePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const libraryInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/");
    }
  }, [status, router]);

  const handleImageSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      sessionStorage.setItem("printImage", base64);
      router.push("/analyze");
    };
    reader.readAsDataURL(file);
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
