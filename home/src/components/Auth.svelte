<script>
  import { convex, setSession } from '../lib/convex.js';
  
  export let onAuth = () => {};
  
  let isSignUp = false;
  let inviteCode = '';
  let handle = '';
  let password = '';
  let error = '';
  let loading = false;
  
  function toggleMode() {
    isSignUp = !isSignUp;
    error = '';
  }
  
  async function handleSubmit() {
    error = '';
    loading = true;
    
    try {
      let result;
      
      if (isSignUp) {
        result = await convex.mutation('signUp', {
          inviteCode: inviteCode.trim(),
          handle: handle.trim(),
          password: password
        });
      } else {
        result = await convex.mutation('signIn', {
          handle: handle.trim(),
          password: password
        });
      }
      
      setSession(result.sessionId);
      onAuth();
    } catch (e) {
      error = e.message || 'Authentication failed';
    } finally {
      loading = false;
    }
  }
</script>

<div class="auth-container">
  <h1>blueday</h1>
  
  <div class="auth-box">
    <h2>{isSignUp ? 'Sign Up' : 'Sign In'}</h2>
    
    {#if error}
      <div class="error">{error}</div>
    {/if}
    
    <form on:submit|preventDefault={handleSubmit}>
      {#if isSignUp}
        <div class="field">
          <label for="inviteCode">Invite Code</label>
          <input 
            type="text" 
            id="inviteCode" 
            bind:value={inviteCode}
            placeholder="Enter invite code"
            required
          />
        </div>
      {/if}
      
      <div class="field">
        <label for="handle">Handle</label>
        <input 
          type="text" 
          id="handle" 
          bind:value={handle}
          placeholder="@username"
          required
        />
      </div>
      
      <div class="field">
        <label for="password">Password</label>
        <input 
          type="password" 
          id="password" 
          bind:value={password}
          placeholder="Enter password"
          required
        />
      </div>
      
      <button type="submit" disabled={loading}>
        {loading ? 'Loading...' : (isSignUp ? 'Sign Up' : 'Sign In')}
      </button>
    </form>
    
    <p class="toggle">
      {isSignUp ? 'Already have an account?' : "Don't have an account?"}
      <button class="link" on:click={toggleMode}>
        {isSignUp ? 'Sign In' : 'Sign Up'}
      </button>
    </p>
  </div>
</div>

<style>
  :root {
    --black: #0a0a0a;
    --white: #ffffff;
  }
  
  .auth-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    padding: 20px;
    background-color: var(--white);
    color: var(--black);
  }
  
  h1 {
    font-size: 2.5rem;
    margin-bottom: 2rem;
  }
  
  h2 {
    font-size: 1.5rem;
    margin-bottom: 1.5rem;
    text-align: center;
  }
  
  .auth-box {
    width: 100%;
    max-width: 400px;
    padding: 2rem;
    border: 1px solid var(--black);
    border-radius: 10px;
  }
  
  .error {
    color: #dc2626;
    margin-bottom: 1rem;
    padding: 0.5rem;
    background-color: rgba(220, 38, 38, 0.1);
    border-radius: 5px;
    font-size: 14px;
  }
  
  .field {
    margin-bottom: 1rem;
  }
  
  label {
    display: block;
    margin-bottom: 0.25rem;
    font-size: 14px;
  }
  
  input {
    width: 100%;
    padding: 0.5rem;
    border: 1px solid #808080;
    border-radius: 5px;
    font-size: 16px;
    font-family: inherit;
    background-color: var(--white);
    color: var(--black);
  }
  
  input:focus {
    outline: none;
    border-color: var(--black);
  }
  
  button[type="submit"] {
    width: 100%;
    padding: 0.75rem;
    background-color: var(--black);
    color: var(--white);
    border: none;
    border-radius: 5px;
    font-size: 16px;
    font-family: inherit;
    cursor: pointer;
    margin-top: 0.5rem;
  }
  
  button[type="submit"]:hover {
    opacity: 0.9;
  }
  
  button[type="submit"]:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
  
  .toggle {
    margin-top: 1.5rem;
    text-align: center;
    font-size: 14px;
  }
  
  .link {
    background: none;
    border: none;
    color: var(--black);
    text-decoration: underline;
    cursor: pointer;
    font-family: inherit;
    font-size: 14px;
    padding: 0;
    margin-left: 0.25rem;
  }
  
  .link:hover {
    opacity: 0.7;
  }
  
  @media (prefers-color-scheme: dark) {
    .auth-container {
      background-color: var(--black);
      color: var(--white);
    }
    
    .auth-box {
      border-color: var(--white);
    }
    
    input {
      background-color: var(--black);
      color: var(--white);
      border-color: #808080;
    }
    
    input:focus {
      border-color: var(--white);
    }
    
    button[type="submit"] {
      background-color: var(--white);
      color: var(--black);
    }
    
    .link {
      color: var(--white);
    }
  }
</style>
