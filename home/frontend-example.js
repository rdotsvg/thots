/**
 * Frontend Integration Example for blueday
 * 
 * This file shows how to integrate the Convex backend with the post.svelte component
 * and the existing HTML/CSS structure.
 * 
 * To use this example:
 * 1. Install Convex client: npm install convex
 * 2. Initialize Convex: npx convex dev
 * 3. Include this script in your HTML
 */

// Example frontend integration (placeholder - would need full Convex setup)
const BLUEDAY_FRONTEND_EXAMPLE = `
<!DOCTYPE html>
<html>
<head>
    <link rel="stylesheet" href="/home/styles.css">
    <title>blueday - Home</title>
</head>
<body>
    <!-- Auth Section -->
    <div id="auth-section">
        <div id="signup-form" style="display: none;">
            <input type="text" id="invite-code" placeholder="Invite code">
            <input type="text" id="handle" placeholder="Handle (e.g., alice)">
            <input type="password" id="password" placeholder="Password">
            <button onclick="handleSignUp()">Sign Up</button>
        </div>
        
        <div id="signin-form" style="display: none;">
            <input type="text" id="login-handle" placeholder="Handle (e.g., alice)">
            <input type="password" id="login-password" placeholder="Password">
            <button onclick="handleSignIn()">Sign In</button>
        </div>
        
        <div id="user-info" style="display: none;">
            <span id="current-user"></span>
            <button onclick="handleSignOut()">Sign Out</button>
        </div>
    </div>

    <!-- Post Creation Section -->
    <div id="post-section" style="display: none;">
        <textarea id="post-content" maxlength="100" placeholder="What's on your mind? (max 100 chars)"></textarea>
        <button onclick="handleCreatePost()">Post</button>
        <span id="char-count">0/100</span>
    </div>

    <!-- Feed Section -->
    <div id="feed-section">
        <div id="posts-container"></div>
    </div>

    <script>
        // Convex client setup (pseudo-code - requires actual Convex initialization)
        // const convex = new ConvexClient('your-convex-url');
        
        // Session management
        function getSessionId() {
            return localStorage.getItem('blueday_session');
        }
        
        function setSessionId(sessionId) {
            localStorage.setItem('blueday_session', sessionId);
        }
        
        // Authentication functions
        async function handleSignUp() {
            try {
                const inviteCode = document.getElementById('invite-code').value;
                const handle = document.getElementById('handle').value;
                const password = document.getElementById('password').value;
                
                // const result = await convex.mutation('signUp', { inviteCode, handle, password });
                // setSessionId(result.sessionId);
                
                showUserSection();
            } catch (error) {
                alert('Sign up failed: ' + error.message);
            }
        }
        
        async function handleSignIn() {
            try {
                const handle = document.getElementById('login-handle').value;
                const password = document.getElementById('login-password').value;
                
                // const result = await convex.mutation('signIn', { handle, password });
                // setSessionId(result.sessionId);
                
                showUserSection();
            } catch (error) {
                alert('Sign in failed: ' + error.message);
            }
        }
        
        async function handleSignOut() {
            try {
                const sessionId = getSessionId();
                // await convex.mutation('signOut', { sessionId });
                localStorage.removeItem('blueday_session');
                
                showAuthSection();
            } catch (error) {
                console.error('Sign out failed:', error);
            }
        }
        
        // Post creation
        async function handleCreatePost() {
            try {
                const sessionId = getSessionId();
                const content = document.getElementById('post-content').value;
                
                // await convex.mutation('createPost', { sessionId, content });
                document.getElementById('post-content').value = '';
                updateCharCount();
                
                // Refresh feed
                loadFeed();
            } catch (error) {
                alert('Post failed: ' + error.message);
            }
        }
        
        // Feed loading
        async function loadFeed() {
            try {
                // const posts = await convex.query('latestFeed');
                const posts = []; // Placeholder
                
                renderPosts(posts);
            } catch (error) {
                console.error('Failed to load feed:', error);
            }
        }
        
        // Render posts using post.svelte ID mapping
        function renderPosts(posts) {
            const container = document.getElementById('posts-container');
            container.innerHTML = '';
            
            posts.forEach(post => {
                const postElement = createPostElement(post);
                container.appendChild(postElement);
            });
        }
        
        // Create post element matching post.svelte IDs
        function createPostElement(post) {
            const div = document.createElement('div');
            div.innerHTML = \`
                <div>
                    <div id="user" class="meta"></div>
                    <div id="time" class="meta"></div>
                    <div id="post" class="post"></div>
                </div>
            \`;
            
            // Map post data to post.svelte IDs
            div.querySelector('#user').textContent = post.handle;      // @alice
            div.querySelector('#time').textContent = formatTime(post.createdAt);  // "2h"
            div.querySelector('#post').textContent = post.content;      // "Hello world"
            
            return div;
        }
        
        // Time formatting helper
        function formatTime(timestamp) {
            const now = Date.now();
            const diff = now - timestamp;
            const mins = Math.floor(diff / 60000);
            const hours = Math.floor(mins / 60);
            const days = Math.floor(hours / 24);
            
            if (mins < 1) return 'just now';
            if (mins < 60) return mins + 'm';
            if (hours < 24) return hours + 'h';
            if (days < 7) return days + 'd';
            return new Date(timestamp).toLocaleDateString();
        }
        
        // Character counter for posts
        function updateCharCount() {
            const content = document.getElementById('post-content').value;
            const count = content.length;
            document.getElementById('char-count').textContent = count + '/100';
        }
        
        // UI state management
        function showAuthSection() {
            document.getElementById('auth-section').style.display = 'block';
            document.getElementById('post-section').style.display = 'none';
            document.getElementById('signup-form').style.display = 'block';
            document.getElementById('signin-form').style.display = 'block';
            document.getElementById('user-info').style.display = 'none';
        }
        
        function showUserSection() {
            document.getElementById('auth-section').style.display = 'block';
            document.getElementById('post-section').style.display = 'block';
            document.getElementById('signup-form').style.display = 'none';
            document.getElementById('signin-form').style.display = 'none';
            document.getElementById('user-info').style.display = 'block';
            
            // Load initial feed
            loadFeed();
        }
        
        // Initialize app
        document.addEventListener('DOMContentLoaded', function() {
            // Character counter
            document.getElementById('post-content').addEventListener('input', updateCharCount);
            
            // Check existing session
            const sessionId = getSessionId();
            if (sessionId) {
                // Optionally validate session
                // const valid = await convex.query('validateSession', { sessionId });
                showUserSection();
            } else {
                showAuthSection();
            }
        });
    </script>
</body>
</html>
`;

// Export for use in actual implementation
export { BLUEDAY_FRONTEND_EXAMPLE };

// Utility functions that can be used independently
export const bluedayUtils = {
  /**
   * Format a timestamp for display (relative time)
   */
  formatTime(timestamp: number): string {
    const now = Date.now();
    const diff = now - timestamp;
    const mins = Math.floor(diff / 60000);
    const hours = Math.floor(mins / 60);
    const days = Math.floor(hours / 24);
    
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m`;
    if (hours < 24) return `${hours}h`;
    if (days < 7) return `${days}d`;
    return new Date(timestamp).toLocaleDateString();
  },

  /**
   * Create a post element matching post.svelte ID structure
   */
  createPostElement(post: any): HTMLElement {
    const div = document.createElement('div');
    div.innerHTML = `
        <div>
            <div id="user" class="meta"></div>
            <div id="time" class="meta"></div>
            <div id="post" class="post"></div>
        </div>
    `;
    
    div.querySelector('#user')!.textContent = post.handle;
    div.querySelector('#time')!.textContent = this.formatTime(post.createdAt);
    div.querySelector('#post')!.textContent = post.content;
    
    return div;
  },

  /**
   * Validate handle format
   */
  validateHandle(handle: string): { valid: boolean; error?: string } {
    const trimmed = handle.trim();
    if (trimmed.length < 2 || trimmed.length > 30) {
      return { valid: false, error: 'Handle must be 2-30 characters' };
    }
    return { valid: true };
  },

  /**
   * Truncate content to 100 chars
   */
  truncateContent(content: string, maxLength = 100): string {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength);
  }
};