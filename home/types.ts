/**
 * Frontend TypeScript Types for thots
 * 
 * This file provides type definitions for Convex responses and
 * maps to the post.svelte component's HTML IDs.
 * 
 * === HTML IDs Mapping (from post.svelte) ===
 * 
 * #user  - User handle display (class: meta)
 * #time  - Timestamp display (class: meta) 
 * #post  - Post content display (class: post)
 * 
 * Usage in frontend:
 *   <div id="user" class="meta">{post.handle}</div>
 *   <div id="time" class="meta">{formatTime(post.createdAt)}</div>
 *   <div id="post" class="post">{post.content}</div>
 */

// Convex document types (mirrors schema.ts)
export interface User {
  _id: string;
  handle: string;        // Stored with leading '@'
  passwordHash: string;
  createdAt: number;
  inviteCode: string;
}

export interface Invite {
  _id: string;
  code: string;
  used: boolean;
  usedBy?: string;
  createdAt: number;
}

export interface Session {
  _id: string;
  sessionId: string;
  userId: string;
  expiresAt: number;
  createdAt: number;
}

export interface Post {
  _id: string;
  userId: string;
  handle: string;        // Stored with leading '@'
  content: string;      // Capped at 100 chars
  createdAt: number;
}

// API Response types for mutations
export interface SignUpResponse {
  userId: string;
  sessionId: string;
}

export interface SignInResponse {
  userId: string;
  sessionId: string;
}

export interface CreatePostResponse {
  postId: string;
}

export interface ValidateSessionResponse {
  valid: boolean;
  userId?: string;
  expiresAt?: number;
}

// Query response types
export type LatestFeedResponse = Post[];
export type GetUserPostsResponse = Post[];

// Frontend post rendering type (mapped to post.svelte IDs)
export interface FrontendPost {
  id: string;           // maps to data-id attribute
  user: string;         // maps to #user
  time: number;         // maps to #time (Unix timestamp)
  post: string;         // maps to #post
}

// Helper to convert Post to FrontendPost for rendering
export function toFrontendPost(post: Post): FrontendPost {
  return {
    id: post._id,
    user: post.handle,
    time: post.createdAt,
    post: post.content,
  };
}

// Utility functions
export function formatTime(timestamp: number): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSecs < 60) return "just now";
  if (diffMins < 60) return `${diffMins}m`;
  if (diffHours < 24) return `${diffHours}h`;
  if (diffDays < 7) return `${diffDays}d`;

  return date.toLocaleDateString();
}

export function formatHandle(handle: string): string {
  // Ensure handle has leading @
  return handle.startsWith("@") ? handle : "@" + handle;
}

export function truncateContent(content: string, maxLength: number = 100): string {
  if (content.length <= maxLength) return content;
  return content.substring(0, maxLength) + "...";
}
