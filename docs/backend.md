# blueday Backend Documentation

## Overview

blueday uses Convex for its backend with session-based authentication and a simple post/feed system.

---

## Database Schema

### Tables

| Table | Description | Indexes |
|-------|-------------|---------|
| `users` | Registered users with handle + password | (handle) |
| `invites` | Valid invite codes for signup | (code) |
| `sessions` | Active sessions for auth | (sessionId) |
| `posts` | User posts | (createdAt), (userId) |

---

## Fields

### `users`
| Field | Type | Description |
|-------|------|-------------|
| `_id` | `string` | Unique user ID (Convex system) |
| `handle` | `string` | User handle with leading `@` (e.g., "@alice") |
| `passwordHash` | `string` | SHA-256 hashed password |
| `createdAt` | `number` | Unix timestamp of registration |
| `inviteCode` | `string` | The invite code used to sign up |

### `invites`
| Field | Type | Description |
|-------|------|-------------|
| `_id` | `string` | Unique invite ID (Convex system) |
| `code` | `string` | The invite code (e.g., "ABC123") |
| `used` | `boolean` | Whether this code has been used |
| `usedBy` | `string?` | User ID who used this code |
| `createdAt` | `number` | Unix timestamp |

### `sessions`
| Field | Type | Description |
|-------|------|-------------|
| `_id` | `string` | Unique session ID (Convex system) |
| `sessionId` | `string` | Public session token (64-char random) |
| `userId` | `string` | Reference to users._id |
| `expiresAt` | `number` | Unix timestamp (30 days from creation) |
| `createdAt` | `number` | Unix timestamp |

### `posts`
| Field | Type | Description |
|-------|------|-------------|
| `_id` | `string` | Unique post ID (Convex system) |
| `userId` | `string` | Reference to users._id |
| `handle` | `string` | User handle with leading `@` (denormalized) |
| `content` | `string` | Post content (max 100 characters) |
| `createdAt` | `number` | Unix timestamp |

---

## Mutations

### `signUp`
Create a new account using an invite code.

**Arguments:**
```typescript
{
  inviteCode: string,   // e.g., "ABC123"
  handle: string,        // e.g., "alice" or "@alice"
  password: string       // plaintext password
}
```

**Returns:**
```typescript
{
  userId: string,    // the new user's ID
  sessionId: string  // active session token (store in localStorage)
}
```

**Errors:** "Invalid invite code", "Invite code already used", "Handle must be 2-30 characters", "Handle already taken"

---

### `signIn`
Authenticate with handle and password.

**Arguments:**
```typescript
{
  handle: string,     // e.g., "alice" or "@alice"
  password: string    // plaintext password
}
```

**Returns:**
```typescript
{
  userId: string,    // the user's ID
  sessionId: string  // new session token (30-day expiry)
}
```

**Errors:** "Invalid handle or password"

---

### `createPost`
Create a new thot post.

**Arguments:**
```typescript
{
  sessionId: string,  // from signUp/signIn response
  content: string     // post content (will be truncated to 100 chars)
}
```

**Returns:**
```typescript
{
  postId: string  // the new post's ID
}
```

**Errors:** "Not authenticated", "Session expired", "Post cannot be empty"

---

## Queries

### `latestFeed`
Fetch the latest 100 posts (newest first).

**Arguments:** none

**Returns:**
```typescript
[
  {
    _id: string,
    userId: string,
    handle: string,      // e.g., "@alice"
    content: string,     // max 100 chars
    createdAt: number    // Unix timestamp
  },
  // ... up to 100 posts
]
```

---

### `validateSession`
Check if a session is valid and not expired.

**Arguments:**
```typescript
{
  sessionId: string  // session token to validate
}
```

**Returns:**
```typescript
{
  valid: boolean,
  userId?: string,      // present if valid
  expiresAt?: number    // present if valid
}
```

---

### `getUserPosts`
Fetch posts by a specific user.

**Arguments:**
```typescript
{
  userId: string  // the user's ID
}
```

**Returns:**
```typescript
[
  {
    _id: string,
    handle: string,
    content: string,
    createdAt: number
  },
  // ... up to 100 posts
]
```

---

## Internal Mutations (Dashboard)

### `createInvite`
Create a new invite code (for use via Convex dashboard).

**Arguments:** none

**Returns:** `string` - the new invite code

---

## Frontend Integration

### post.svelte ID Mapping

The `post.svelte` component uses specific IDs for rendering posts:

| ID | Element | Class | Content Type |
|----|---------|-------|--------------|
| `#user` | div.meta | `.meta` | User handle (string with @) |
| `#time` | div.meta | `.meta` | Unix timestamp (number) |
| `#post` | div.post | `.post` | Post content (string) |

**Example rendering:**
```html
<div>
  <div id="user" class="meta">@alice</div>
  <div id="time" class="meta">1704067200000</div>
  <div id="post" class="post">Hello world</div>
</div>
```

### Session Storage

Store the `sessionId` from signUp/signIn responses in `localStorage`:

```typescript
// After signUp or signIn:
localStorage.setItem("blueday_session", response.sessionId);

// Before API calls:
const sessionId = localStorage.getItem("blueday_session");
```

### Time Formatting

The `#time` field contains a Unix timestamp. Convert to relative time:

```typescript
function formatTime(timestamp: number): string {
  const diff = Date.now() - timestamp;
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(mins / 60);
  const days = Math.floor(hours / 24);
  
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m`;
  if (hours < 24) return `${hours}h`;
  if (days < 7) return `${days}d`;
  return new Date(timestamp).toLocaleDateString();
}
```

---

## Invite Code Setup

Invite codes must be created via the Convex dashboard:

1. Open Convex dashboard for the project
2. Navigate to "Functions" or use the dashboard console
3. Call `createInvite` mutation to generate codes
4. Share codes with users for signup

Example dashboard console:
```javascript
await mutation("createInvite")({});
```

---

## Security Notes

- Passwords are hashed with SHA-256 (production should use bcrypt)
- Session tokens are 64-character random strings
- Sessions expire after 30 days
- Post content is truncated to 100 characters
- Handles are normalized to always have a leading `@`

---

## Error Handling

All mutations may throw errors. Handle them gracefully:

```typescript
try {
  const result = await signUp({ inviteCode, handle, password });
  // Success - store sessionId
} catch (error) {
  // Handle specific errors
  if (error.message === "Invalid invite code") {
    // Show "Invalid invite code" message
  } else if (error.message === "Handle already taken") {
    // Show "Handle taken" message
  }
}
```
