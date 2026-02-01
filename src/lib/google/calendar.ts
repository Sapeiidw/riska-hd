import { google } from "googleapis";

const SCOPES = ["https://www.googleapis.com/auth/calendar.events"];

export function getOAuth2Client() {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI || `${process.env.NEXT_PUBLIC_APP_URL}/api/google/callback`;

  if (!clientId || !clientSecret) {
    throw new Error("Google OAuth credentials not configured");
  }

  return new google.auth.OAuth2(clientId, clientSecret, redirectUri);
}

export function getAuthUrl(state?: string) {
  const oauth2Client = getOAuth2Client();

  return oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: SCOPES,
    prompt: "consent",
    state,
  });
}

export async function getTokensFromCode(code: string) {
  const oauth2Client = getOAuth2Client();
  const { tokens } = await oauth2Client.getToken(code);
  return tokens;
}

export function getCalendarClient(accessToken: string, refreshToken?: string) {
  const oauth2Client = getOAuth2Client();
  oauth2Client.setCredentials({
    access_token: accessToken,
    refresh_token: refreshToken,
  });

  return google.calendar({ version: "v3", auth: oauth2Client });
}

export interface CalendarEvent {
  id?: string;
  summary: string;
  description?: string;
  start: {
    dateTime: string;
    timeZone: string;
  };
  end: {
    dateTime: string;
    timeZone: string;
  };
  colorId?: string;
  extendedProperties?: {
    private?: Record<string, string>;
  };
}

export async function createCalendarEvent(
  accessToken: string,
  refreshToken: string | undefined,
  event: CalendarEvent,
  calendarId = "primary"
) {
  const calendar = getCalendarClient(accessToken, refreshToken);

  const response = await calendar.events.insert({
    calendarId,
    requestBody: event,
  });

  return response.data;
}

export async function updateCalendarEvent(
  accessToken: string,
  refreshToken: string | undefined,
  eventId: string,
  event: Partial<CalendarEvent>,
  calendarId = "primary"
) {
  const calendar = getCalendarClient(accessToken, refreshToken);

  const response = await calendar.events.patch({
    calendarId,
    eventId,
    requestBody: event,
  });

  return response.data;
}

export async function deleteCalendarEvent(
  accessToken: string,
  refreshToken: string | undefined,
  eventId: string,
  calendarId = "primary"
) {
  const calendar = getCalendarClient(accessToken, refreshToken);

  await calendar.events.delete({
    calendarId,
    eventId,
  });
}

export async function listCalendarEvents(
  accessToken: string,
  refreshToken: string | undefined,
  timeMin: string,
  timeMax: string,
  calendarId = "primary"
) {
  const calendar = getCalendarClient(accessToken, refreshToken);

  const response = await calendar.events.list({
    calendarId,
    timeMin,
    timeMax,
    singleEvents: true,
    orderBy: "startTime",
  });

  return response.data.items || [];
}

// Color IDs for Google Calendar
export const CALENDAR_COLORS = {
  scheduled: "1", // Lavender
  present: "10", // Green
  absent: "11", // Red
  leave: "3", // Purple
  confirmed: "9", // Blue
  in_progress: "5", // Yellow
  completed: "10", // Green
  cancelled: "8", // Gray
  no_show: "11", // Red
};

export function formatScheduleToCalendarEvent(
  schedule: {
    id: string;
    scheduleDate: string;
    shiftStartTime: string;
    shiftEndTime: string;
    status: string;
    notes?: string | null;
  },
  title: string,
  description: string,
  type: "nurse" | "patient"
): CalendarEvent {
  const date = schedule.scheduleDate.split("T")[0];
  const timeZone = "Asia/Jakarta";

  return {
    summary: title,
    description,
    start: {
      dateTime: `${date}T${schedule.shiftStartTime}:00`,
      timeZone,
    },
    end: {
      dateTime: `${date}T${schedule.shiftEndTime}:00`,
      timeZone,
    },
    colorId: CALENDAR_COLORS[schedule.status as keyof typeof CALENDAR_COLORS] || "1",
    extendedProperties: {
      private: {
        riskaCareId: schedule.id,
        riskaCareType: type,
      },
    },
  };
}
