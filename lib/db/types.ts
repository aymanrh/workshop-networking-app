export type Closeness = "close" | "warm" | "cooling";
export type TouchType = "meet" | "message" | "note";
export type EventStatus = "interested" | "going" | "attended";

export interface Person {
  id: string;
  name: string;
  role?: string;
  company?: string;
  tags: string[];
  notes?: string;
  closeness: Closeness;
  createdAt: number;
  lastContactAt?: number;
  followUpAt?: number;
  eventMetId?: string;
}

export interface AppEvent {
  id: string;
  name: string;
  date: number;
  location?: string;
  tags: string[];
  attendees: string[];
  status: EventStatus;
  createdAt: number;
}

export interface Touch {
  id: string;
  personId: string;
  eventId?: string;
  type: TouchType;
  timestamp: number;
  body: string;
}

export interface Meta {
  key: string;
  value: unknown;
}
