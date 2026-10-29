/**
 * Helper to map Supabase auth errors to friendly user-facing messages.
 */
export function mapAuthError(error: any): string {
  if (!error) return "Something went wrong. Please try again.";

  const rawMessage = (typeof error === 'string' ? error : error.message || '').toLowerCase();
  const status = error.status;

  // Invalid login credentials
  if (
    rawMessage.includes('invalid login credentials') ||
    rawMessage.includes('invalid_grant') ||
    rawMessage.includes('invalid credentials')
  ) {
    return "Email or password is incorrect.";
  }

  // Email not confirmed
  if (
    rawMessage.includes('email not confirmed') ||
    rawMessage.includes('email_not_confirmed')
  ) {
    return "Please confirm your email first, or contact support.";
  }

  // Signup with existing email
  if (
    rawMessage.includes('user already registered') ||
    rawMessage.includes('already exists') ||
    rawMessage.includes('email address already registered')
  ) {
    return "An account with this email already exists. Try logging in.";
  }

  // Password rules
  if (
    rawMessage.includes('password should be at least') ||
    rawMessage.includes('weak password') ||
    rawMessage.includes('password is too short')
  ) {
    return "Password must be at least 8 characters.";
  }

  // Rate limiting
  if (
    status === 429 ||
    rawMessage.includes('rate limit') ||
    rawMessage.includes('too many requests') ||
    rawMessage.includes('over_email_send_rate_limit')
  ) {
    return "Too many attempts. Please wait a minute and try again.";
  }

  // Network / fetch errors
  if (
    rawMessage.includes('failed to fetch') ||
    rawMessage.includes('network') ||
    rawMessage.includes('timeout')
  ) {
    return "Network error. Please check your internet connection and try again.";
  }

  return "Something went wrong. Please try again.";
}
