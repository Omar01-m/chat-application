// components/chat/chat-sidebar.tsx

"use client"; // This is a client component because we use state and Convex hooks

import { useQuery, useMutation } from "convex/react"; // Hooks to read/write data
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {Id} from "../../../convex/_generated/dataModel";
import {api} from "../../../convex/_generated/api";

// We will use this to share the selected conversation across components
// We'll pass it down from the parent page
type ChatSidebarProps = {
    onSelectConversation: (conversationId: Id<"conversations">) => void;
};

export default function ChatSidebar({ onSelectConversation }: ChatSidebarProps) {
    // Get current logged-in user
    const currentUser = useQuery(api.users.currentUser);

    // Get all conversations for this user (real-time: updates automatically!)
    const conversations = useQuery(api.conversations.list);

    // Search state - later we'll use this to find users
    const [search, setSearch] = useState("");

    // Show loading if user not loaded yet
    if (currentUser === undefined) return <div className="p-4">Loading...</div>;

    // If no conversations yet
    if (!conversations || conversations.length === 0) {
        return (
            <div className="flex flex-col h-full">
                <div className="p-4">
                    <Input placeholder="Search users..." disabled />
                </div>
                <div className="flex-1 flex items-center justify-center text-gray-500">
                    No conversations yet. Search for someone to start chatting!
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full">
            {/* Search input - we'll make it functional soon */}
            <div className="p-4">
                <Input
                    placeholder="Search users to chat..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>

            {/* Scrollable list of conversations */}
            <ScrollArea className="flex-1">
                <div className="p-2">
                    {conversations.map((conv) => {
                        // conv.otherUser is populated in our backend list() function
                        const otherUser = conv.otherUser;

                        return (
                            <div
                                key={conv._id}
                                onClick={() => onSelectConversation(conv._id)} // Select this chat
                                className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 cursor-pointer transition"
                            >
                                <Avatar>
                                    <AvatarImage src={otherUser?.imageUrl} />
                                    <AvatarFallback>{otherUser?.name?.[0] || "U"}</AvatarFallback>
                                </Avatar>
                                <div className="flex-1 min-w-0"> {/* min-w-0 prevents flex overflow */}
                                    <p className="font-medium truncate">{otherUser?.name || otherUser?.email}</p>
                                    <p className="text-sm text-gray-500 truncate">
                                        {/* We could show last message here later */}
                                        Tap to chat
                                    </p>
                                </div>
                                {/* Optional: show timestamp of last message */}
                                {/* <span className="text-xs text-gray-400">2h</span> */}
                            </div>
                        );
                    })}
                </div>
            </ScrollArea>
        </div>
    );
}