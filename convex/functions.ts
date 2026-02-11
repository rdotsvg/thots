import { internalMutation, mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { Doc } from "./_generated/dataModel";

// Generate a secure random session ID
function generateSessionId(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < 64; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Hash password (simple hash for demo - use bcrypt in production)
async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

// Verify password
async function verifyPassword(password: string, hash: string): Promise<boolean> {
  const passwordHash = await hashPassword(password);
  return passwordHash === hash;
}

// 30 days in milliseconds
const SESSION_DURATION_MS = 30 * 24 * 60 * 60 * 1000;

// Internal mutation to create a new invite code (for Convex dashboard use)
export const createInvite = internalMutation({
  args: {},
  returns: v.string(),
  handler: async (ctx): Promise<string> => {
    const code = Math.random().toString(36).substring(2, 10).toUpperCase();
    await ctx.db.insert("invites", {
      code,
      used: false,
      createdAt: Date.now(),
    });
    return code;
  },
});

// Mutation: Sign up with invite code
export const signUp = mutation({
  args: {
    inviteCode: v.string(),
    handle: v.string(),
    password: v.string(),
  },
  returns: v.object({
    userId: v.string(),
    sessionId: v.string(),
  }),
  handler: async (ctx, args): Promise<{ userId: string; sessionId: string }> => {
    // Validate invite code
    const invite = await ctx.db
      .query("invites")
      .withIndex("by_code", (q) => q.eq("code", args.inviteCode))
      .first();

    if (!invite) {
      throw new Error("Invalid invite code");
    }

    if (invite.used) {
      throw new Error("Invite code already used");
    }

    // Validate handle
    let handle = args.handle.trim();
    if (handle.length < 2 || handle.length > 30) {
      throw new Error("Handle must be 2-30 characters");
    }

    // Normalize handle to always have leading @
    if (!handle.startsWith("@")) {
      handle = "@" + handle;
    }

    // Check handle is available
    const existing = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("handle"), handle))
      .first();

    if (existing) {
      throw new Error("Handle already taken");
    }

    // Hash password
    const passwordHash = await hashPassword(args.password);

    // Create user
    const userId = await ctx.db.insert("users", {
      handle,
      passwordHash,
      createdAt: Date.now(),
      inviteCode: args.inviteCode,
    });

    // Mark invite as used
    await ctx.db.patch(invite._id, {
      used: true,
      usedBy: userId,
    });

    // Create session
    const sessionId = generateSessionId();
    await ctx.db.insert("sessions", {
      sessionId,
      userId,
      expiresAt: Date.now() + SESSION_DURATION_MS,
      createdAt: Date.now(),
    });

    return { userId, sessionId };
  },
});

// Mutation: Sign in with handle and password
export const signIn = mutation({
  args: {
    handle: v.string(),
    password: v.string(),
  },
  returns: v.object({
    userId: v.string(),
    sessionId: v.string(),
  }),
  handler: async (ctx, args): Promise<{ userId: string; sessionId: string }> => {
    // Normalize handle
    let handle = args.handle.trim();
    if (!handle.startsWith("@")) {
      handle = "@" + handle;
    }

    // Find user
    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("handle"), handle))
      .first();

    if (!user) {
      throw new Error("Invalid handle or password");
    }

    // Verify password
    const isValid = await verifyPassword(args.password, user.passwordHash);
    if (!isValid) {
      throw new Error("Invalid handle or password");
    }

    // Create session
    const sessionId = generateSessionId();
    await ctx.db.insert("sessions", {
      sessionId,
      userId: user._id,
      expiresAt: Date.now() + SESSION_DURATION_MS,
      createdAt: Date.now(),
    });

    return { userId: user._id, sessionId };
  },
});

// Mutation: Sign out (invalidate session)
export const signOut = mutation({
  args: {
    sessionId: v.string(),
  },
  returns: v.boolean(),
  handler: async (ctx, args): Promise<boolean> => {
    const session = await ctx.db
      .query("sessions")
      .withIndex("by_session_id", (q) => q.eq("sessionId", args.sessionId))
      .first();

    if (session) {
      await ctx.db.delete(session._id);
    }

    return true;
  },
});

// Mutation: Create a new post
export const createPost = mutation({
  args: {
    sessionId: v.string(),
    content: v.string(),
  },
  returns: v.object({
    postId: v.string(),
  }),
  handler: async (ctx, args): Promise<{ postId: string }> => {
    // Validate session
    const session = await ctx.db
      .query("sessions")
      .withIndex("by_session_id", (q) => q.eq("sessionId", args.sessionId))
      .first();

    if (!session) {
      throw new Error("Not authenticated");
    }

    if (session.expiresAt < Date.now()) {
      throw new Error("Session expired");
    }

    // Get user
    const user = await ctx.db.get(session.userId as Doc<"users">["_id"]);
    if (!user) {
      throw new Error("User not found");
    }

    // Validate content (capped at 100 chars)
    let content = args.content.trim();
    if (content.length === 0) {
      throw new Error("Post cannot be empty");
    }

    if (content.length > 100) {
      content = content.substring(0, 100);
    }

    // Create post
    const postId = await ctx.db.insert("posts", {
      userId: session.userId as string,
      handle: user.handle,
      content,
      createdAt: Date.now(),
    });

    return { postId };
  },
});

// Query: Get latest feed (newest posts first)
export const latestFeed = query({
  args: {},
  returns: v.array(
    v.object({
      _id: v.string(),
      userId: v.string(),
      handle: v.string(),
      content: v.string(),
      createdAt: v.number(),
    })
  ),
  handler: async (ctx): Promise<
    Array<{
      _id: string;
      userId: string;
      handle: string;
      content: string;
      createdAt: number;
    }>
  > => {
    const posts = await ctx.db
      .query("posts")
      .withIndex("by_created_at")
      .order("desc")
      .take(100);

    return posts.map((post) => ({
      _id: post._id,
      userId: post.userId,
      handle: post.handle,
      content: post.content,
      createdAt: post.createdAt,
    }));
  },
});

// Query: Get posts by user
export const getUserPosts = query({
  args: {
    userId: v.string(),
  },
  returns: v.array(
    v.object({
      _id: v.string(),
      handle: v.string(),
      content: v.string(),
      createdAt: v.number(),
    })
  ),
  handler: async (ctx, args) => {
    const posts = await ctx.db
      .query("posts")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .order("desc")
      .take(100);

    return posts.map((post) => ({
      _id: post._id,
      handle: post.handle,
      content: post.content,
      createdAt: post.createdAt,
    }));
  },
});

// Query: Validate session
export const validateSession = query({
  args: {
    sessionId: v.string(),
  },
  returns: v.object({
    valid: v.boolean(),
    userId: v.optional(v.string()),
    expiresAt: v.optional(v.number()),
  }),
  handler: async (ctx, args) => {
    const session = await ctx.db
      .query("sessions")
      .withIndex("by_session_id", (q) => q.eq("sessionId", args.sessionId))
      .first();

    if (!session) {
      return { valid: false };
    }

    if (session.expiresAt < Date.now()) {
      return { valid: false };
    }

    return {
      valid: true,
      userId: session.userId,
      expiresAt: session.expiresAt,
    };
  },
});
