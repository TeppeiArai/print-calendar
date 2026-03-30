export interface ExtractedEvent {
  title: string | null;
  date: string | null;
  start_time: string | null;
  end_time: string | null;
  location: string | null;
  notes: string | null;
}

export interface AnalyzeResponse {
  success: boolean;
  data?: ExtractedEvent;
  error?: string;
}

export interface RegisterRequest {
  title: string;
  date: string;
  start_time?: string | null;
  end_time?: string | null;
  location?: string | null;
  notes?: string | null;
}

export interface RegisterResponse {
  success: boolean;
  eventId?: string;
  eventUrl?: string;
  error?: string;
}
