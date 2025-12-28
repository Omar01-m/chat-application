import { query, mutation } from './_generated/server'
import { v } from 'convex/values'

export const getForCurrentUser = query({
    args: {},
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity()
        if (identity === null) {
            throw new Error('Not authenticated')
        }

        // Find the current user by Clerk ID
        const clerkId = identity.subject
        const user = await ctx.db
            .query('users')
            .withIndex('by_clerkId', (q) => q.eq('clerkId', clerkId))
            .unique()

        if (!user) {
            return []
        }

        // Get messages sent by this user
        return await ctx.db
            .query('messages')
            .filter((q) => q.eq(q.field('senderId'), user._id))
            .collect()
    },
})

// Get all messages for a specific conversation
export const list = query({
    args: { conversationId: v.id('conversations') },
    handler: async (ctx, args) => {
        // Get messages for this conversation, ordered by creation time
        return await ctx.db
            .query('messages')
            .withIndex('by_conversation', (q) => q.eq('conversationId', args.conversationId))
            .order('asc')
            .collect()
    },
})

// Send a new message
export const send = mutation({
    args: {
        conversationId: v.id('conversations'),
        content: v.string(),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity()
        if (!identity) {
            throw new Error('Not authenticated')
        }

        // Find the current user
        const clerkId = identity.subject
        const user = await ctx.db
            .query('users')
            .withIndex('by_clerkId', (q) => q.eq('clerkId', clerkId))
            .unique()

        if (!user) {
            throw new Error('User not found')
        }

        // TODO: Verify user is a participant in this conversation
        // For now, we'll just create the message

        // Create the message
        const messageId = await ctx.db.insert('messages', {
            conversationId: args.conversationId,
            senderId: user._id,
            content: args.content,
            createdAt: Date.now(),
        })

        return messageId
    },
})