// convex/conversations.ts
// This file handles everything related to conversations (1-on-1 chats)

import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";

// ===============================================
// 1. LIST ALL CONVERSATIONS FOR THE CURRENT USER
// ===============================================
export const list = query({
    // No arguments needed — we get the current user from auth
    args: {},

    handler: async (ctx) => {
        // Get the logged-in user's identity from Clerk
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return []; // Not logged in → empty list

        // Find our own user record using Clerk ID
        const currentUser = await ctx.db
            .query("users")
            .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
            .unique();

        if (!currentUser) return [];

        const userId = currentUser._id;

        // Find conversations where we are participant1
        const asParticipant1 = await ctx.db
            .query("conversations")
            .withIndex("by_participants", (q) => q.eq("participant1Id", userId))
            .collect();

        // Find conversations where we are participant2
        const asParticipant2 = await ctx.db
            .query("conversations")
            .withIndex("by_participant2", (q) => q.eq("participant2Id", userId))
            .collect();

        // Combine both lists
        const allConversations = [...asParticipant1, ...asParticipant2];

        // Sort by most recent activity (updatedAt descending)
        allConversations.sort((a, b) => (b.updatedAt ?? 0) - (a.updatedAt ?? 0));

        // Enrich each conversation with the other participant's data
        const populatedConversations = await Promise.all(
            allConversations.map(async (conv) => {
                const otherUserId =
                    conv.participant1Id === userId ? conv.participant2Id : conv.participant1Id;

                const otherUser = await ctx.db.get(otherUserId);

                return {
                    ...conv,
                    otherUser, // adds name, email, imageUrl, etc. of the other person
                };
            })
        );

        return populatedConversations;
    },
});

// ===============================================
// 2. GET OR CREATE A CONVERSATION WITH ANOTHER USER
// ===============================================
export const getOrCreate = mutation({
    // The ID of the person we want to start a chat with
    args: {
        otherUserId: v.id("users"),
    },

    handler: async (ctx, { otherUserId }) => {
        // Ensure the caller is authenticated
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Unauthenticated");

        // Get current user's document
        const currentUser = await ctx.db
            .query("users")
            .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
            .unique();

        if (!currentUser) throw new Error("Current user not found");

        const currentId = currentUser._id;

        // Normalize order: always put the smaller ID as participant1
        // This way we only need one query and avoid duplicate conversations
        const [participant1Id, participant2Id] = [currentId, otherUserId].sort();

        // Try to find an existing conversation with normalized order
        let conversation = await ctx.db
            .query("conversations")
            .withIndex("by_participants", (q) =>
                q.eq("participant1Id", participant1Id).eq("participant2Id", participant2Id)
            )
            .unique();

        // If none exists → create a new one with normalized order
        if (!conversation) {
            const now = Date.now();
            const newConvId = await ctx.db.insert("conversations", {
                participant1Id,
                participant2Id,
                createdAt: now,
                updatedAt: now,
            });

            conversation = await ctx.db.get(newConvId);
            if (!conversation) throw new Error("Failed to create conversation");
        }

        return conversation;
    },
});