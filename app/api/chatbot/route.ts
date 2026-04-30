import { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

const answers = [
  {
    keywords: ["verify", "email", "account", "compte"],
    answer: "After registration, open the verification link from the local email outbox. In development the links are saved in .temp/email-outbox.log."
  },
  {
    keywords: ["review", "rating", "owner", "client"],
    answer: "Open a listing or user profile, then use the review form. Reviews are tied to your account, the listing, and/or the person you reviewed."
  },
  {
    keywords: ["ticket", "complaint", "admin", "support"],
    answer: "Use Support from the top navigation to open a ticket. Admin can review complaints, reply, and change ticket status."
  },
  {
    keywords: ["appointment", "calendar", "visit", "viewing"],
    answer: "Book a viewing from the listing page. The owner receives the request, then can accept or decline it from the Calendar page."
  },
  {
    keywords: ["submit", "property", "listing", "approval"],
    answer: "Owners submit properties from the dashboard. New listings stay pending until admin approves them, then clients can see them publicly."
  }
];

export async function POST(request: NextRequest) {
  const body = await request.json();
  const question = String(body.question ?? "").toLowerCase();
  const match = answers.find((item) => item.keywords.some((keyword) => question.includes(keyword)));

  return Response.json({
    answer:
      match?.answer ??
      "I can help with account verification, reviews, support tickets, appointments, property approval, favorites, and messaging. Try asking about one of those."
  });
}
