// app/chat/page.tsx

"use client"; // Now client because we need state for selected conversation

import { SignedIn, UserButton } from "@clerk/nextjs";
import ChatWindow from "@/components/chat/chat-window";
import { useState } from "react";
import ChatSidebar from "@/components/chat/chat-side-bar";
import {Id} from "../../../../convex/_generated/dataModel";

export default function ChatPage() {
    // State to track which conversation is currently open
    const [selectedConversationId, setSelectedConversationId] = useState<
        Id<"conversations"> | null
    >(null);

    return (
        <SignedIn>
            <div className="flex h-screen bg-gray-100">
                {/* Sidebar */}
                <div className="w-full md:w-80 bg-white border-r border-gray-200 flex flex-col">
                    <div className="p-4 border-b flex justify-between items-center">
                        <h1 className="text-xl font-semibold">Chats</h1>
                        <UserButton afterSignOutUrl="/" />
                    </div>
                    <ChatSidebar onSelectConversation={setSelectedConversationId} />
                </div>

                {/* Chat Window */}
                <div className="flex-1">
                    <ChatWindow conversationId={selectedConversationId} />
                </div>
            </div>
        </SignedIn>
    );
}