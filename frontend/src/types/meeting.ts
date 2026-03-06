export interface TimeSlot {
  start: string;
  end: string;
}

export interface Meeting {
  id: string;
  user_id?: string;
  title: string;
  start_time: string;
  end_time: string;
  attendees: string[];
  description: string;
  location: string;
  source: string;
  providers?: string[];
  google_event_id?: string | null;
  outlook_event_id?: string | null;
  created_at?: string;
}

export interface MeetingCreateRequest {
  title: string;
  start_time: string;
  end_time: string;
  attendees?: string[];
  description?: string;
  location?: string;
}

export interface MeetingUpdateRequest {
  title?: string;
  start_time?: string;
  end_time?: string;
  attendees?: string[];
  description?: string;
  location?: string;
}

export interface MeetingSuggestRequest {
  duration_minutes: number;
  attendees?: string[];
  preferred_range?: TimeSlot;
}
