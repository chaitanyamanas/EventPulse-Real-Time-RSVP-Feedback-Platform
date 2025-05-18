// Mock email service for development
export async function sendEmail(to: string, subject: string, body: string) {
  console.log(`[Email Mock] Sending email to ${to}`);
  console.log(`Subject: ${subject}`);
  console.log(`Body: ${body}`);
  return true;
}

export async function sendRSVPConfirmation(
  to: string,
  eventTitle: string,
  eventDate: Date,
  eventLocation: string
) {
  const subject = `You're confirmed for ${eventTitle}`;
  const body = `
    Hi there!

    You're all set for ${eventTitle}!

    Event Details:
    Date: ${eventDate.toLocaleDateString()}
    Time: ${eventDate.toLocaleTimeString()}
    Location: ${eventLocation}

    We'll send you a reminder when check-in opens.

    See you there!
    EventPulse Team
  `;

  return sendEmail(to, subject, body);
}

export async function sendCheckInReminder(
  to: string,
  eventTitle: string,
  eventDate: Date,
  eventLocation: string
) {
  const subject = `Check-in is now open for ${eventTitle}`;
  const body = `
    Hi there!

    Check-in is now open for ${eventTitle}!

    Event Details:
    Date: ${eventDate.toLocaleDateString()}
    Time: ${eventDate.toLocaleTimeString()}
    Location: ${eventLocation}

    Don't forget to check in when you arrive.

    See you soon!
    EventPulse Team
  `;

  return sendEmail(to, subject, body);
}

export async function sendPostEventSurvey(
  to: string,
  eventTitle: string,
  eventId: string
) {
  const subject = `Thanks for attending ${eventTitle}!`;
  const body = `
    Hi there!

    Thank you for attending ${eventTitle}!

    We'd love to hear your feedback. Please take a moment to share your thoughts:
    [Event Summary Link: http://localhost:3000/events/${eventId}/feedback]

    Your feedback helps us improve future events.

    Best regards,
    EventPulse Team
  `;

  return sendEmail(to, subject, body);
}

export async function sendWaitlistNotification(
  to: string,
  eventTitle: string,
  position: number
) {
  const subject = `You're on the waitlist for ${eventTitle}`;
  const body = `
    Hi there!

    You've been added to the waitlist for ${eventTitle}.
    Your current position: #${position}

    We'll notify you if a spot becomes available.

    Thanks for your interest!
    EventPulse Team
  `;

  return sendEmail(to, subject, body);
}

export async function sendSpotAvailableNotification(
  to: string,
  eventTitle: string,
  eventDate: Date,
  expiresAt: Date
) {
  const subject = `A spot is available for ${eventTitle}`;
  const body = `
    Hi there!

    Good news! A spot has opened up for ${eventTitle}.

    Event Details:
    Date: ${eventDate.toLocaleDateString()}
    Time: ${eventDate.toLocaleTimeString()}

    Please confirm your attendance within the next 24 hours (by ${expiresAt.toLocaleString()}).
    After that, the spot will be offered to the next person on the waitlist.

    [Confirm Attendance Link: http://localhost:3000/events/${eventTitle}/confirm]

    Best regards,
    EventPulse Team
  `;

  return sendEmail(to, subject, body);
} 