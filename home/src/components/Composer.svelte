<script>
  import { convex, getSession } from '../lib/convex.js';
  
  export let onPostCreated = () => {};
  
  let content = '';
  let error = '';
  let loading = false;
  
  const MAX_CHARS = 100;
  
  $: remaining = MAX_CHARS - content.length;
  $: isOverLimit = remaining < 0;
  
  async function handleSubmit() {
    if (isOverLimit || !content.trim()) return;
    
    error = '';
    loading = true;
    
    const sessionId = getSession();
    if (!sessionId) {
      error = 'Not authenticated';
      loading = false;
      return;
    }
    
    try {
      await convex.mutation('createPost', {
        sessionId,
        content: content.trim()
      });
      content = '';
      onPostCreated();
    } catch (e) {
      error = e.message || 'Failed to create post';
    } finally {
      loading = false;
    }
  }
</script>

<div class="comp">
  {#if error}
    <div class="error">{error}</div>
  {/if}
  
  <form on:submit|preventDefault={handleSubmit}>
    <textarea
      bind:value={content}
      placeholder="What's on your mind?"
      rows="2"
      disabled={loading}
    ></textarea>
    
    <div class="composer-footer">
      <span class="char-count" class:over-limit={isOverLimit}>
        {remaining}
      </span>
      <button type="submit" disabled={loading || isOverLimit || !content.trim()}>
        {loading ? 'Posting...' : 'Post'}
      </button>
    </div>
  </form>
</div>

<style>
  :root {
    --black: #0a0a0a;
    --white: #ffffff;
  }
  
  .comp {
    border-radius: 10px;
    border: 1px solid var(--black);
    position: fixed;
    left: 50%;
    bottom: 10px;
    transform: translateX(-50%);
    width: 90%;
    max-width: 600px;
    padding: 15px;
    box-sizing: border-box;
    background-color: var(--white);
  }
  
  .error {
    color: #dc2626;
    margin-bottom: 0.5rem;
    font-size: 14px;
  }
  
  textarea {
    width: 100%;
    padding: 0.5rem;
    border: 1px solid #808080;
    border-radius: 5px;
    font-size: 16px;
    font-family: inherit;
    resize: none;
    background-color: var(--white);
    color: var(--black);
  }
  
  textarea:focus {
    outline: none;
    border-color: var(--black);
  }
  
  textarea:disabled {
    opacity: 0.6;
  }
  
  .composer-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 0.5rem;
  }
  
  .char-count {
    font-size: 14px;
    color: #808080;
  }
  
  .char-count.over-limit {
    color: #dc2626;
    font-weight: 600;
  }
  
  button {
    padding: 0.5rem 1rem;
    background-color: var(--black);
    color: var(--white);
    border: none;
    border-radius: 5px;
    font-size: 14px;
    font-family: inherit;
    cursor: pointer;
  }
  
  button:hover:not(:disabled) {
    opacity: 0.9;
  }
  
  button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  @media (prefers-color-scheme: dark) {
    .comp {
      border-color: var(--white);
      background-color: var(--black);
    }
    
    textarea {
      background-color: var(--black);
      color: var(--white);
      border-color: #808080;
    }
    
    textarea:focus {
      border-color: var(--white);
    }
    
    button {
      background-color: var(--white);
      color: var(--black);
    }
  }
</style>
