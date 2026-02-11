<script>
  export let handle = '';
  export let createdAt = 0;
  export let content = '';
  
  function formatTime(timestamp) {
    const diff = Date.now() - timestamp;
    const mins = Math.floor(diff / 60000);
    const hours = Math.floor(mins / 60);
    const days = Math.floor(hours / 24);
    
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m`;
    if (hours < 24) return `${hours}h`;
    if (days < 7) return `${days}d`;
    return new Date(timestamp).toLocaleDateString();
  }
</script>

<div class="post-wrapper">
  <div id="user" class="meta">{handle}</div>
  <div id="time" class="meta">{formatTime(createdAt)}</div>
  <div id="post" class="post">{content}</div>
</div>

<style>
  :root {
    --black: #0a0a0a;
    --white: #ffffff;
  }
  
  .post-wrapper {
    font-size: 16px;
    color: var(--black);
    padding: 12px 0;
    border-bottom: 1px solid rgba(128, 128, 128, 0.2);
  }
  
  .meta {
    color: #808080;
    font-size: 14px;
    display: inline-block;
    margin-right: 8px;
  }
  
  #user {
    font-weight: 600;
  }
  
  .post {
    color: var(--black);
    margin-top: 4px;
    line-height: 1.4;
  }
  
  @media (prefers-color-scheme: dark) {
    .post-wrapper {
      color: var(--white);
    }
    
    .meta {
      color: #808080;
    }
    
    .post {
      color: var(--white);
    }
  }
</style>
