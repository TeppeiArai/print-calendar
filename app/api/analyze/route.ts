import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { GoogleGenerativeAI } from "@google/generative-ai";
import type { ExtractedEvent, AnalyzeResponse } from "@/types";

export const maxDuration = 30;

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ success: false, error: "未認証です" }, { status: 401 });
  }

  try {
    const { imageBase64 } = await req.json();
    if (!imageBase64) {
      return NextResponse.json({ success: false, error: "画像データがありません" }, { status: 400 });
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, "");
    const mimeMatch = imageBase64.match(/^data:(image\/\w+);base64,/);
    const mimeType = mimeMatch ? mimeMatch[1] : "image/jpeg";

    const prompt = `あなたは日本の小学校のプリントから情報を抽出するアシスタントです。
以下の画像は学校から配られたプリントです。
次のJSON形式で情報を抽出してください。
不明・読み取れない場合はnullにしてください。
日付はYYYY-MM-DD形式、時間はHH:MM形式で返してください。

{
  "title": "イベント名（例：運動会、遠足、個人懇談）",
  "date": "YYYY-MM-DD または null",
  "start_time": "HH:MM または null",
  "end_time": "HH:MM または null",
  "location": "場所・会場名 または null",
  "notes": "持ち物・備考・その他重要事項をまとめた文章 または null"
}

JSONのみを返してください。説明文は不要です。`;

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: base64Data,
          mimeType,
        },
      },
    ]);

    const text = result.response.text();
    let data: ExtractedEvent;

    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      data = jsonMatch ? JSON.parse(jsonMatch[0]) : {
        title: null, date: null, start_time: null,
        end_time: null, location: null, notes: null,
      };
    } catch {
      data = {
        title: null, date: null, start_time: null,
        end_time: null, location: null, notes: null,
      };
    }

    const response: AnalyzeResponse = { success: true, data };
    return NextResponse.json(response);
  } catch (error) {
    console.error("Analyze API error:", error);
    const message = error instanceof Error ? error.message : "解析中にエラーが発生しました";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
