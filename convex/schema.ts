import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

// Schema definition for blueday application
export default defineSchema({
  // Users table - stores user information
  users: defineTable({
    handle: v.string(), // Stored with leading '@'
    passwordHash: v.string(),
    createdAt: v.number(),
    inviteCode: v.string(), // The invite code used to sign up
  }),

  // Invite codes table - stores valid invite codes
  invites: defineTable({
    code: v.string(),
    used: v.boolean(),
    usedBy: v.optional(v.string()), // userId of who used it
    createdAt: v.number(),
  }),

  // Sessions table - for session-based authentication
  sessions: defineTable({
    sessionId: v.string(),
    userId: v.string(),
    expiresAt: v.number(), // timestamp for 30-day expiry
    createdAt: v.number(),
  }),

  // Posts table - stores posts
  posts: defineTable({
    userId: v.string(), // reference to users table
    handle: v.string(), // denormalized for faster queries
    content: v.string(), // content capped at 100 chars
    createdAt: v.number(),
  }).index("by_created_at", ["createdAt"])
    .index("by_user", ["userId"]),
});