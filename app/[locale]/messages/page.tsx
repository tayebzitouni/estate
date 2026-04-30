import { redirect } from "next/navigation";
import { MessageCircle } from "lucide-react";

import { MessageComposer } from "@/components/messages/message-composer";
import { getCurrentSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function MessagesPage({
  params,
  searchParams
}: {
  params: { locale: string };
  searchParams: { listingId?: string; participantBId?: string; conversationId?: string };
}) {
  const session = getCurrentSession();
  if (!session) redirect(`/${params.locale}/login`);

  const conversations = await prisma.conversation.findMany({
    where: { OR: [{ participantAId: session.userId }, { participantBId: session.userId }] },
    include: {
      messages: { include: { sender: { include: { profile: true } } }, orderBy: { createdAt: "asc" } },
      listing: true,
      participantA: { include: { profile: true } },
      participantB: { include: { profile: true } }
    },
    orderBy: { updatedAt: "desc" }
  });

  const activeConversation =
    conversations.find((conversation) => conversation.id === searchParams.conversationId) ?? conversations[0] ?? null;

  const activeOther = activeConversation
    ? activeConversation.participantAId === session.userId
      ? activeConversation.participantB
      : activeConversation.participantA
    : null;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="mb-6 flex items-center gap-3">
        <MessageCircle className="h-7 w-7 text-brand-emerald" />
        <div>
          <h1 className="text-3xl font-semibold text-brand-navy">Messages</h1>
          <p className="mt-1 text-sm text-slate-500">Private conversations between clients and proprietors.</p>
        </div>
      </div>

      <div className="grid min-h-[640px] overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-panel lg:grid-cols-[360px_1fr]">
        <aside className="border-b border-slate-200 bg-slate-50 lg:border-b-0 lg:border-e">
          <div className="border-b border-slate-200 p-4">
            <div className="text-sm font-semibold uppercase tracking-wide text-slate-400">Conversations</div>
          </div>
          <div className="max-h-[580px] overflow-y-auto">
            {conversations.map((conversation) => {
              const other = conversation.participantAId === session.userId ? conversation.participantB : conversation.participantA;
              const lastMessage = conversation.messages.at(-1);
              const isActive = conversation.id === activeConversation?.id;

              return (
                <a
                  key={conversation.id}
                  href={`/${params.locale}/messages?conversationId=${conversation.id}`}
                  className={`block border-b border-slate-200 p-4 transition-colors ${
                    isActive ? "bg-white" : "hover:bg-white"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-brand-navy font-semibold text-white">
                      {(other.profile?.fullName ?? other.email).slice(0, 1).toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="truncate font-semibold text-brand-navy">{other.profile?.fullName ?? other.email}</div>
                      <div className="truncate text-xs text-slate-500">{conversation.listing?.title ?? "General conversation"}</div>
                    </div>
                  </div>
                  <div className="mt-3 truncate text-sm text-slate-500">{lastMessage?.content ?? "No messages yet."}</div>
                </a>
              );
            })}
            {conversations.length === 0 ? (
              <div className="p-6 text-sm text-slate-500">No conversations yet.</div>
            ) : null}
          </div>
        </aside>

        <section className="flex min-h-[640px] flex-col">
          {activeConversation && activeOther ? (
            <>
              <div className="border-b border-slate-200 bg-white p-5">
                <div className="font-semibold text-brand-navy">{activeOther.profile?.fullName ?? activeOther.email}</div>
                <div className="mt-1 text-sm text-slate-500">{activeConversation.listing?.title ?? "General conversation"}</div>
              </div>
              <div className="flex-1 space-y-4 overflow-y-auto bg-gradient-to-b from-slate-50 to-white p-5">
                {activeConversation.messages.map((message) => {
                  const mine = message.senderId === session.userId;
                  return (
                    <div key={message.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                      <div
                        className={`max-w-[78%] rounded-3xl px-4 py-3 text-sm shadow-sm ${
                          mine ? "rounded-br-md bg-brand-navy text-white" : "rounded-bl-md bg-white text-slate-700"
                        }`}
                      >
                        <div>{message.content}</div>
                        <div className={`mt-2 text-[11px] ${mine ? "text-white/60" : "text-slate-400"}`}>
                          {message.createdAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              <MessageComposer conversationId={activeConversation.id} />
            </>
          ) : searchParams.listingId || searchParams.participantBId ? (
            <div className="flex flex-1 flex-col justify-end">
              <div className="flex flex-1 items-center justify-center p-8 text-center text-slate-500">
                Start the conversation.
              </div>
              <MessageComposer listingId={searchParams.listingId} participantBId={searchParams.participantBId} />
            </div>
          ) : (
            <div className="flex flex-1 items-center justify-center p-8 text-center text-slate-500">
              Select a conversation to start messaging.
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
