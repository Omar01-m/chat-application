// convex/users.ts

import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Get the current logged-in user's profile
export const currentUser = query({
    args: {},
    handler: async (ctx) => {
        // This gets the authenticated user from Clerk (via our provider setup)
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return null;

        // Clerk's unique user ID (e.g., "user_123abc")
        const clerkId = identity.subject;

        // Find the user in our "users" table
        return await ctx.db
            .query("users")
            .withIndex("by_clerkId", (q) => q.eq("clerkId", clerkId))
            .unique();
    },
});

// Create or update a user when they sign in (we'll call this via webhook later)
export const upsertUser = mutation({
    args: {
        clerkId: v.string(),
        email: v.string(),
        name: v.optional(v.string()),
        imageUrl: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        // Check if user already exists
        const existing = await ctx.db
            .query("users")
            .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
            .unique();

        if (existing) {
            // Update existing record (e.g., name or picture changed)
            await ctx.db.patch(existing._id, {
                email: args.email,
                name: args.name,
                imageUrl: args.imageUrl,
            });
            return existing._id;
        } else {
            // Insert new user
            return await ctx.db.insert("users", {
                clerkId: args.clerkId,
                email: args.email,
                name: args.name,
                imageUrl: args.imageUrl,
            });
        }
    },
});