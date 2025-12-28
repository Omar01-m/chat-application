// convex/schema.ts

import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

// This defines the structure of our database tables
export default defineSchema({
    // Table to store user profiles (synced from Clerk)
    users: defineTable({
        clerkId: v.string(),              // Unique ID from Clerk (e.g., "user_123abc")
        email: v.string(),                // User's email
        name: v.optional(v.string()),     // Optional name
        imageUrl: v.optional(v.string()), // Optional profile picture URL
    })
        .index("by_clerkId", ["clerkId"])   // Fast lookup by Clerk ID
        .index("by_email", ["email"]),      // Optional: fast lookup by email

    // Table for 1-on-1 conversations (we'll expand to groups later if needed)
    conversations: defineTable({
        participant1Id: v.id("users"),     // Reference to one user
        participant2Id: v.id("users"),     // Reference to the other user
        createdAt: v.number(),             // Timestamp when created
        updatedAt: v.number(),             // Timestamp of last message
    })
        // Index to quickly find a conversation between two specific users
        .index("by_participants", ["participant1Id", "participant2Id"])
        // Index to find conversations where user is participant2
        .index("by_participant2", ["participant2Id"]),

    // Table for individual messages
    messages: defineTable({
        conversationId: v.id("conversations"), // Which conversation this belongs to
        senderId: v.id("users"),               // Who sent it
        content: v.string(),                   // Text content
        createdAt: v.number(),                 // Timestamp
        // We can add image support later: type: v.union("text", "image"), mediaUrl: v.optional(v.string())
    })
        // Index to quickly load all messages for a conversation, sorted by time
        .index("by_conversation", ["conversationId"])
        .index("by_conversation_time", ["conversationId", "createdAt"]),
});