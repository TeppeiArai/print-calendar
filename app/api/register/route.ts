import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import type { RegisterRequest, RegisterResponse } from "@/types";

const CALENDAR_API = "https://www.googleapis.com/calendar/v3/calendars/primary/events";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.accessToken) {
    return NextResponse.json({ success: false, error: "未認証です" }, { status: 401 });
  }

  try {
    const body: RegisterRequest = await req.json();

    if (!body.title || !body.date) {
      return NextResponse.json(
        { success: false, error: "イベント名と日付は必須です" },
        { status: 400 }
      );
    }

    const hasTime = body.start_time && body.start_time.trim() !== "";

    interface CalendarEvent {
      summary: string;
      location?: string;
      description?: string;
      start: { date?: string; dateTime?: string; timeZone?: string };
      end: { date?: string; dateTime?: string; timeZone?: string };
    }

    let event: CalendarEvent;
    if (hasTime) {
      const startDateTime = `${body.date}T${body.start_time}:00`;
      const endTime = body.end_time && body.end_time.trim() !== ""
        ? body.end_time
        : body.start_time;
      const endDateTime = `${body.date}T${endTime}:00`;

      event = {
        summary: body.title,
        location: body.location || undefined,
        description: body.notes || undefined,
        start: { dateTime: startDateTime, timeZone: "Asia/Tokyo" },
        end: { dateTime: endDateTime, timeZone: "Asia/Tokyo" },
      };
    } else {
      event = {
        summary: body.title,
        location: body.location || undefined,
        description: body.notes || undefined,
        start: { date: body.date },
        end: { date: body.date },
      };
    }

    const result = await fetch(CALENDAR_API, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(event),
    });

    if (!result.ok) {
      const errorData = await result.json().catch(() => null);
      const errorMsg = errorData?.error?.message || `Calendar API error: ${result.status}`;
      return NextResponse.json({ success: false, error: errorMsg }, { status: 500 });
    }

    const data = await result.json();
    const response: RegisterResponse = {
      success: true,
      eventId: data.id || undefined,
      eventUrl: data.htmlLink || undefined,
    };

    return NextResponse.json(response);
  } catch (error) {
    const message = error instanceof Error ? error.message : "登録中にエラーが発生しました";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
