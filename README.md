# thots - Convex Backend + Vite/Svelte Frontend

This is a thots application with a Convex backend and a Vite + Svelte frontend. Features include invite-code signup, session-based authentication, and post creation functionality.

## Project Structure

```
/home/engine/project/
├── convex/
│   ├── schema.ts              # Database schema (users, invites, sessions, posts)
│   └── functions.ts           # Convex mutations and queries
├── docs/
│   ├── backend.md             # Backend API documentation
│   └── frontend.md            # Frontend documentation
├── home/                      # Vite + Svelte frontend
│   ├── index.html             # Entry HTML
│   ├── package.json           # Frontend dependencies
│   ├── vite.config.js         # Vite configuration
│   ├── .env.example           # Environment variables template
│   └── src/
│       ├── main.js            # App entry point
│       ├── App.svelte         # Root component
│       ├── app.css            # Global styles
│       ├── lib/
│       │   └── convex.js      # Convex client & session utilities
│       └── components/
│           ├── Auth.svelte    # Sign in/up component
│           ├── Post.svelte    # Post display component
│           └── Composer.svelte # Post creation component
├── post.svelte               # Reference Post component (#user, #time, #post)
├── index.html                # Landing page (static)
└── landing.css               # Landing page styles
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

### 4. Set up Frontend Environment

1. **Navigate to the home directory:**
   ```bash
   cd home
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   ```bash
   cp .env.example .env.local
   ```
   
   Edit `.env.local` and set your `VITE_CONVEX_URL`:
   ```
   VITE_CONVEX_URL=https://your-deployment.convex.cloud
   ```

### 5. Run the Application

1. **Start the Convex dev server:**
   ```bash
   npx convex dev
   ```

2. **In a new terminal, start the frontend:**
   ```bash
   cd home
   npm run dev
   ```

3. **Visit the landing page:** http://localhost:3000 (or your Convex dev port)

4. **Navigate to home page:** http://localhost:5173

5. **Use invite codes to sign up and test**

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

## Environment Variables

The frontend requires the following environment variable:

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_CONVEX_URL` | Yes | Your Convex deployment URL (e.g., `https://lucky-moth-123.convex.cloud`) |

### Setting up Environment Variables

1. Navigate to the `home` directory
2. Copy `.env.example` to `.env.local`
3. Set your `VITE_CONVEX_URL` from the Convex dashboard

```bash
cd home
cp .env.example .env.local
# Edit .env.local with your Convex URL
```

---

## Frontend Integration

### post.svelte ID Mapping

Both the reference `post.svelte` and the frontend `Post.svelte` component use specific IDs for rendering posts:

| ID | Purpose | CSS Class | Content |
|----|---------|-----------|---------|
| `#user` | User handle display | `.meta` | e.g., "@alice" |
| `#time` | Timestamp display | `.meta` | Formatted relative time (e.g., "2h") |
| `#post` | Post content display | `.post` | Post text (max 100 chars) |

**Tags/Classes used:**
- `.meta` - Metadata styling (gray color for handle and time)
- `.post` - Post content styling
- `.post-wrapper` - Container for Post.svelte component

**Reference implementation (post.svelte):**
```html
<div>
    <div id="user" class="meta"></div>
    <div id="time" class="meta"></div>
    <div id="post" class="post"></div>
</div>
```

**Frontend implementation (home/src/components/Post.svelte):**
```svelte
<div class="post-wrapper">
    <div id="user" class="meta">{handle}</div>
    <div id="time" class="meta">{formatTime(createdAt)}</div>
    <div id="post" class="post">{content}</div>
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

### Composer Component

The composer uses the `.comp` class for fixed bottom positioning:

| Class | Purpose |
|-------|---------|
| `.comp` | Fixed bottom container, centered with border |

**Features:**
- Fixed at bottom of viewport
- 100-character limit for posts
- Character counter display
- 90% width, max 600px

### Session Storage

The session ID is stored in `localStorage`:

```javascript
// Key used
const SESSION_KEY = 'thots_session';

// Stored value
localStorage.setItem('thots_session', sessionId);
```

---

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