# blueday - Convex Backend Implementation

This is a Convex backend implementation for the thots application with invite-code signup, session-based authentication, and post creation functionality.

## Project Structure

```
/home/engine/project/
├── convex/
│   ├── schema.ts              # Database schema (users, invites, sessions, posts)
│   └── functions.ts           # Convex mutations and queries
├── docs/
│   └── backend.md             # Complete API documentation
├── home/
│   ├── index.html             # Home page with authentication & feed
│   ├── frontend-example.js    # Frontend integration utilities
│   └── types.ts               # TypeScript types for frontend
├── post.svelte               # Post component with ID mapping (#user, #time, #post)
└── index.html                # Landing page
```

## Quick Start

### 1. Set up Convex

1. **Install Convex CLI:**
   ```bash
   npm install -g convex
   ```

2. **Initialize Convex:**
   ```bash
   npx convex init
   ```

3. **Deploy to get your deployment URL:**
   ```bash
   npx convex dev --configure
   ```

4. **Update the deployment URL in home/index.html:**
   ```javascript
   const convex = new ConvexClient('https://your-deployment.convex.cloud');
   ```

### 2. Create Database Schema

1. **Upload the schema:**
   - Copy the contents of `convex/schema.ts` to your Convex dashboard
   - Deploy the schema using the dashboard

2. **Upload functions:**
   - Copy the contents of `convex/functions.ts` to your Convex dashboard
   - Deploy the functions

### 3. Create Invite Codes

1. **Open Convex Dashboard**
2. **Navigate to "Functions"**
3. **Run the createInvite mutation:**
   ```javascript
   await mutation("createInvite")({});
   ```
4. **Repeat to create more codes**

### 4. Test the Application

1. **Start the development server:**
   ```bash
   npx convex dev
   ```

2. **Visit the landing page:** http://localhost:3000

3. **Navigate to home page:** http://localhost:3000/home

4. **Use invite codes to sign up and test**

## Core Features

### ✅ Invite-Code Signup
- Users can only sign up with valid invite codes
- Codes are single-use and tracked in the database
- Invite codes are created via Convex dashboard

### ✅ Session-Based Authentication
- 30-day session expiry
- Secure session token generation
- Session validation and cleanup

### ✅ Post Creation
- 100-character content limit
- User handles stored with leading `@`
- Timestamp tracking

### ✅ Latest Feed
- Returns newest 100 posts
- Fast queries with proper indexing
- Includes user handle and timestamp

## Frontend Integration

### post.svelte ID Mapping

The `post.svelte` component uses specific IDs for rendering posts:

| ID | Purpose | CSS Class | Content |
|----|---------|-----------|---------|
| `#user` | User handle display | `.meta` | e.g., "@alice" |
| `#time` | Timestamp display | `.meta` | Unix timestamp |
| `#post` | Post content display | `.post` | Post text |

**Usage:**
```html
<div>
    <div id="user" class="meta">{{post.handle}}</div>
    <div id="time" class="meta">{{formatTime(post.createdAt)}}</div>
    <div id="post" class="post">{{post.content}}</div>
</div>
```

### Authentication Flow

1. **Sign Up:**
   ```javascript
   const result = await convex.mutation('signUp', {
     inviteCode: 'ABC123',
     handle: 'alice',
     password: 'password123'
   });
   
   localStorage.setItem('thots_session', result.sessionId);
   ```

2. **Sign In:**
   ```javascript
   const result = await convex.mutation('signIn', {
     handle: 'alice',
     password: 'password123'
   });
   
   localStorage.setItem('thots_session', result.sessionId);
   ```

3. **Create Post:**
   ```javascript
   const sessionId = localStorage.getItem('thots_session');
   await convex.mutation('createPost', {
     sessionId,
     content: 'Hello thots!'
   });
   ```

4. **Load Feed:**
   ```javascript
   const posts = await convex.query('latestFeed');
   ```

## API Reference

### Mutations

- `signUp({ inviteCode, handle, password })` - Register with invite code
- `signIn({ handle, password })` - Authenticate user
- `signOut({ sessionId })` - End session
- `createPost({ sessionId, content })` - Create new post
- `createInvite()` - Generate new invite code (dashboard use)

### Queries

- `latestFeed()` - Get latest 100 posts
- `validateSession({ sessionId })` - Check session validity
- `getUserPosts({ userId })` - Get posts by user

## Database Schema

### Tables

| Table | Purpose | Key Fields |
|-------|---------|------------|
| `users` | User accounts | handle, passwordHash, createdAt |
| `invites` | Invite codes | code, used, usedBy, createdAt |
| `sessions` | Auth sessions | sessionId, userId, expiresAt |
| `posts` | User posts | userId, handle, content, createdAt |

See `docs/backend.md` for complete schema documentation.

## Security Features

- **Password Hashing:** SHA-256 hashing (consider bcrypt for production)
- **Session Security:** 64-character random tokens
- **Session Expiry:** 30-day automatic expiration
- **Input Validation:** Handle length, content limits
- **Invite Tracking:** Single-use codes with usage tracking

## Development Notes

### Environment Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Environment variables** (if using production Convex):
   ```bash
   export CONVEX_DEPLOYMENT=your-deployment-name
   ```

### Testing

1. **Unit tests** (when implemented):
   ```bash
   npm test
   ```

2. **Integration tests:**
   - Test with multiple users
   - Verify session expiry
   - Test post limits

### Production Considerations

1. **Password Security:** Replace SHA-256 with bcrypt
2. **Rate Limiting:** Implement to prevent abuse
3. **Input Sanitization:** Add XSS protection
4. **Error Logging:** Implement proper logging
5. **Session Cleanup:** Add periodic session cleanup

## Troubleshooting

### Common Issues

1. **"Invalid invite code":**
   - Ensure invite code exists in `invites` table
   - Check that code hasn't been used

2. **"Session expired":**
   - Session is older than 30 days
   - User needs to sign in again

3. **"Handle already taken":**
   - Another user has that handle
   - Handles must be unique

4. **"Not authenticated":**
   - Missing or invalid sessionId
   - Check localStorage contains session

### Debug Commands

**Check invite codes:**
```javascript
await query("db", "invites").collect();
```

**Check sessions:**
```javascript
await query("db", "sessions").collect();
```

**Check posts:**
```javascript
await query("db", "posts").order("desc").collect();
```

## Contributing

1. Follow the existing code style
2. Add TypeScript types for new features
3. Update documentation for API changes
4. Test with real Convex deployment

## License

This implementation is part of the thots project. See LICENSE file for details.
