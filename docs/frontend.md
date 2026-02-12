# blueday Frontend Documentation

## Overview

The blueday frontend is a Vite + Svelte application located in `/home` that provides authentication, a feed view, and post creation functionality.

---

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_CONVEX_URL` | Yes | Your Convex deployment URL (e.g., `https://your-deployment.convex.cloud`) |

### Setup

1. Copy the example environment file:
   ```bash
   cd home
   cp .env.example .env.local
   ```

2. Update `.env.local` with your Convex deployment URL from the Convex dashboard.

---

## Project Structure

```
/home/
├── .env.example           # Environment variable template
├── index.html             # Entry HTML file
├── package.json           # Dependencies
├── vite.config.js         # Vite configuration
├── public/
│   └── styles.css         # Public styles (optional)
└── src/
    ├── main.js            # Application entry point
    ├── App.svelte         # Root component
    ├── app.css            # Global styles
    ├── lib/
    │   └── convex.js      # Convex client & session utilities
    └── components/
        ├── Auth.svelte    # Sign in/up component
        ├── Post.svelte    # Individual post component
        └── Composer.svelte # Post creation composer
```

---

## Component ID Mapping

The Post component (`Post.svelte`) follows the same ID structure as `post.svelte` for rendering:

| ID | Element | Class | Content |
|----|---------|-------|---------|
| `#user` | div | `.meta` | User handle (e.g., "@alice") |
| `#time` | div | `.meta` | Formatted timestamp (relative time) |
| `#post` | div | `.post` | Post content text |

### Usage Example

```svelte
<Post 
  handle="@alice" 
  createdAt={1704067200000} 
  content="Hello world" 
/>
```

Renders:
```html
<div class="post-wrapper">
  <div id="user" class="meta">@alice</div>
  <div id="time" class="meta">2h</div>
  <div id="post" class="post">Hello world</div>
</div>
```

---

## Session Storage

Sessions are stored in `localStorage` under the key `blueday_session`.

### Key Functions

```javascript
// Get current session
import { getSession } from './lib/convex.js';
const sessionId = getSession();

// Set session (after sign in/up)
import { setSession } from './lib/convex.js';
setSession(result.sessionId);

// Clear session (on sign out)
import { clearSession } from './lib/convex.js';
clearSession();

// Validate session
import { validateSession } from './lib/convex.js';
const { valid, userId } = await validateSession(sessionId);
```

---

## Authentication Flow

1. **On Load**: The app checks `localStorage` for a session
2. **Validate**: Calls `validateSession` to verify the session is still valid
3. **Authenticated**: Shows the feed view with composer
4. **Unauthenticated**: Shows the Auth view with sign in/up toggle

### Auth Component

- Toggle between Sign In and Sign Up modes
- Sign Up requires an invite code
- On successful auth, session is stored and feed loads

---

## Feed View

### Features

- Displays the latest 100 posts (newest first)
- Real-time updates after creating a post
- Responsive design with max-width 600px

### Post Component CSS Classes

| Class | Purpose |
|-------|---------|
| `.post-wrapper` | Container for each post |
| `.meta` | Metadata styling (handle, time) |
| `.post` | Post content styling |

---

## Composer Component

### Features

- Fixed bottom position using `.comp` class
- 100-character limit
- Character counter showing remaining chars
- Visual indication when over limit (red counter)

### CSS Classes

| Class | Purpose |
|-------|---------|
| `.comp` | Fixed bottom container styling |
| `.char-count` | Character counter display |
| `.over-limit` | Applied when over 100 chars |

---

## Getting Started

### 1. Install Dependencies

```bash
cd home
npm install
```

### 2. Set Environment Variables

```bash
cp .env.example .env.local
# Edit .env.local with your VITE_CONVEX_URL
```

### 3. Run Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### 4. Build for Production

```bash
npm run build
```

Output will be in `home/dist/`

---

## Styling

### CSS Variables

| Variable | Light Mode | Dark Mode |
|----------|-----------|-----------|
| `--black` | `#0a0a0a` | `#0a0a0a` |
| `--white` | `#ffffff` | `#ffffff` |

### Dark Mode Support

Uses `prefers-color-scheme: dark` media query for automatic dark mode.

---

## Integration with Convex

The frontend uses the Convex browser client to communicate with the backend:

```javascript
import { convex } from './lib/convex.js';

// Query
const posts = await convex.query('latestFeed');

// Mutation
await convex.mutation('createPost', { sessionId, content });
```

Make sure `VITE_CONVEX_URL` is set correctly to point to your Convex deployment.

---

## Routing

- **Landing page**: `/` (static HTML, preserved)
- **Home/Feed**: `/home/` (Vite + Svelte app)

---

## Error Handling

- Auth errors are displayed in the Auth component
- Post creation errors show in the Composer component
- Session validation failures redirect to auth view

---

## Security Notes

- Sessions are stored in `localStorage` (client-side only)
- Session validation happens server-side in Convex
- Passwords are never stored client-side
- All authenticated actions require a valid session ID
