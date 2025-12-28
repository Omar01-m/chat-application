// components/chat/chat-window.tsx

"use client";

import { useQuery, useMutation } from "convex/react";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Send } from "lucide-react";
import {api} from "../../../convex/_generated/api";
import {Id} from "../../../convex/_generated/dataModel"; // Icon for send button

type ChatWindowProps = {
    conversationId: Id<"conversations"> | null;
};

export default function ChatWindow({ conversationId }: ChatWindowProps) {
    const [message, setMessage] = useState("");

    // Get current user
    const currentUser = useQuery(api.users.currentUser);

    // Get all messages for this conversation (real-time updates!)
    const messages = useQuery(api.messages.list,
        conversationId ? { conversationId } : "skip" // "skip" avoids error when no conv selected
    );

    // Mutation to send a message
    const sendMessage = useMutation(api.messages.send);

    // If no conversation selected
    if (!conversationId) {
        return (
            <div className="flex-1 flex items-center justify-center bg-gray-50">
                <p className="text-gray-500 text-lg">Select a conversation to start chatting</p>
            </div>
        );
    }

    // Loading state
    if (messages === undefined) {
        return (
            <div className="flex-1 flex items-center justify-center">
                <p>Loading messages...</p>
            </div>
        );
    }

    const handleSend = async () => {
        if (!message.trim() || !conversationId) return;

        // Optimistic update: clear input immediately
        setMessage("");

        // Send to backend
        await sendMessage({
            conversationId,
            content: message,
        });
    };

    return (
        <div className="flex flex-col h-full">
            {/* Header - we could show other user's name here later */}
            <div className="p-4 border-b bg-white">
                <p className="font-semibold">Chat</p>
            </div>

            {/* Messages list */}
            <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                    {messages.map((msg) => {
                        const isMe = msg.senderId === currentUser?._id;

                        return (
                            <div
                                key={msg._id}
                                className={`flex gap-3 ${isMe ? "justify-end" : "justify-start"}`}
                            >
                                {!isMe && (
                                    <Avatar className="w-8 h-8">
                                        {/* In real app: get sender's avatar */}
                                        <AvatarFallback>U</AvatarFallback>
                                    </Avatar>
                                )}

                                <div
                                    className={`max-w-xs px-4 py-2 rounded-2xl ${
                                        isMe
                                            ? "bg-blue-600 text-white"
                                            : "bg-gray-200 text-gray-900"
                                    }`}
                                >
                                    <p>{msg.content}</p>
                                    {/* Optional: timestamp */}
                                    {/* <p className="text-xs opacity-70 mt-1">
                    {new Date(msg.createdAt).toLocaleTimeString()}
                  </p> */}
                                </div>

                                {isMe && (
                                    <Avatar className="w-8 h-8">
                                        <AvatarImage src={currentUser?.imageUrl} />
                                        <AvatarFallback>Me</AvatarFallback>
                                    </Avatar>
                                )}
                            </div>
                        );
                    })}
                </div>
            </ScrollArea>

            {/* Input area */}
            <div className="p-4 bg-white border-t">
                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        handleSend();
                    }}
                    className="flex gap-2"
                >
                    <Input
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Type a message..."
                        className="flex-1"
                    />
                    <Button type="submit" disabled={!message.trim()}>
                        <Send className="w-5 h-5" />
                    </Button>
                </form>
            </div>
        </div>
    );
}