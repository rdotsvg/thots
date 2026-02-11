<script>
  import { onMount } from 'svelte';
  import { convex, getSession, clearSession, validateSession } from './lib/convex.js';
  import Post from './components/Post.svelte';
  import Auth from './components/Auth.svelte';
  import Composer from './components/Composer.svelte';
  
  let isAuthenticated = false;
  let isLoading = true;
  let posts = [];
  let user = null;
  
  async function loadFeed() {
    try {
      posts = await convex.query('latestFeed');
    } catch (e) {
      console.error('Failed to load feed:', e);
    }
  }
  
  async function checkSession() {
    const sessionId = getSession();
    
    if (!sessionId) {
      isAuthenticated = false;
      isLoading = false;
      return;
    }
    
    const result = await validateSession(sessionId);
    
    if (result.valid) {
      isAuthenticated = true;
      await loadFeed();
    } else {
      clearSession();
      isAuthenticated = false;
    }
    
    isLoading = false;
  }
  
  function handleAuth() {
    isAuthenticated = true;
    loadFeed();
  }
  
  async function handleSignOut() {
    const sessionId = getSession();
    if (sessionId) {
      try {
        await convex.mutation('signOut', { sessionId });
      } catch (e) {
        console.error('Sign out error:', e);
      }
    }
    clearSession();
    isAuthenticated = false;
  }
  
  onMount(() => {
    checkSession();
  });
</script>

{#if isLoading}
  <div class="loading">
    <p>loading...</p>
  </div>
{:else if !isAuthenticated}
  <Auth onAuth={handleAuth} />
{:else}
  <div class="feed-container">
    <header>
      <h1>thots</h1>
      <button class="signout" on:click={handleSignOut}>sign out</button>
    </header>
    
    <div class="feed">
      {#if posts.length === 0}
        <p class="empty">no thots yet. be the first!</p>
      {:else}
        {#each posts as post (post._id)}
          <Post 
            handle={post.handle} 
            createdAt={post.createdAt} 
            content={post.content} 
          />
        {/each}
      {/if}
    </div>
    
    <Composer onPostCreated={loadFeed} />
  </div>
{/if}

<style>
  :root {
    --black: #0a0a0a;
    --white: #ffffff;
  }
  
  .loading {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    font-size: 1.2rem;
  }
  
  .feed-container {
    max-width: 600px;
    margin: 0 auto;
    padding: 20px 20px 120px 20px;
    min-height: 100vh;
  }
  
  header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-bottom: 20px;
    border-bottom: 1px solid rgba(128, 128, 128, 0.3);
    margin-bottom: 20px;
  }
  
  h1 {
    font-size: 1.5rem;
  }
  
  .signout {
    background: none;
    border: none;
    color: var(--black);
    font-family: inherit;
    font-size: 14px;
    cursor: pointer;
    text-decoration: underline;
  }
  
  .signout:hover {
    opacity: 0.7;
  }
  
  .feed {
    display: flex;
    flex-direction: column;
  }
  
  .empty {
    text-align: center;
    color: #808080;
    padding: 40px 0;
    font-style: italic;
  }
  
  @media (prefers-color-scheme: dark) {
    .signout {
      color: var(--white);
    }
  }
</style>
