import { redirect } from "next/navigation";

export default function ConversationRedirect({ params }: { params: { conversationId: string } }) {
  redirect(`/messages?conversationId=${params.conversationId}`);
}
