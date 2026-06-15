export function validateEnv() {
  const requiredVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY',
    'NEXT_PUBLIC_BASE_URL'
  ];

  const missing = requiredVars.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    console.warn(`[Env Warning] Missing required environment variables: ${missing.join(', ')}`);
    // Not throwing error to prevent crash during Vercel build phase if vars aren't available yet
  }

  // Check AI providers
  if (!process.env.GEMINI_API_KEY && !process.env.OPENAI_API_KEY && !process.env.DEEPSEEK_API_KEY) {
    console.warn(`[Env Warning] No AI provider keys found. AI features will fallback gracefully or fail.`);
  }

  return {
    missing,
    hasAiProvider: !!(process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY || process.env.DEEPSEEK_API_KEY)
  };
}

// Call validation eagerly in development
if (process.env.NODE_ENV !== 'production') {
  validateEnv();
}
