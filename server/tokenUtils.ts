// Import crypto module - built into Node.js, no installation needed
// crypto provides cryptographically strong random values for security
import crypto from "crypto";

/**
 * Generates a secure random token for password reset
 * 
 * PURPOSE: Create an unpredictable token that's impossible to guess
 * SECURITY: Uses cryptographically secure random number generator
 * 
 * HOW IT WORKS:
 * 1. crypto.randomBytes(32) generates 32 random bytes
 * 2. .toString("hex") converts bytes to hexadecimal string
 * 3. Result: 64-character random string (32 bytes = 64 hex chars)
 * 
 * EXAMPLE OUTPUT: "a3f5d8c2e1b4f7a9d2c6e8b1f4a7d9c2e5b8f1a4d7c9e2b5f8a1d4c7e9b2f5a8"
 * 
 * WHY 32 BYTES?
 * - Industry standard for secure tokens
 * - Provides 256 bits of entropy (2^256 possible combinations)
 * - Virtually impossible to brute force
 */
export function generatePasswordResetToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

/**
 * Calculates when a token should expire (10 minutes from now)
 * 
 * PURPOSE: Tokens must have limited lifetime for security
 * SECURITY: Short expiry window reduces risk if token is intercepted
 * 
 * HOW IT WORKS:
 * 1. Date.now() gets current time in milliseconds since Jan 1, 1970 (Unix epoch)
 *    Example: 1731340800000
 * 2. Calculate 10 minutes in milliseconds:
 *    10 minutes × 60 seconds × 1000 milliseconds = 600,000 milliseconds
 * 3. Add them together to get future time
 * 4. new Date() converts milliseconds to JavaScript Date object
 * 
 * EXAMPLE:
 * - Current time: 2:00 PM (1731340800000 ms)
 * - Add 10 minutes: 600000 ms
 * - Result: Date object for 2:10 PM
 * 
 * WHY 10 MINUTES?
 * - Long enough: User has time to check email and click link
 * - Short enough: Reduces window for token theft/misuse
 * - Security best practice: OWASP recommends 10-15 minutes
 */
export function getTokenExpiry(): Date {
  const tenMinutesInMilliseconds = 10 * 60 * 1000; // 10 * 60 * 1000 = 600,000
  return new Date(Date.now() + tenMinutesInMilliseconds);
}

/**
 * Checks if a token has expired
 * 
 * PURPOSE: Reject expired tokens for security
 * 
 * @param expiresAt - The expiration date from database
 * @returns true if token is expired, false if still valid
 * 
 * HOW IT WORKS:
 * 1. new Date() gets current time as Date object
 * 2. Compare current time with expiration time using > operator
 * 3. If current time is AFTER (greater than) expiration time, token is expired
 * 
 * EXAMPLE:
 * - Token expires at: 2:10 PM
 * - Current time: 2:15 PM
 * - 2:15 PM > 2:10 PM = true → Token is expired
 * 
 * JAVASCRIPT DATE COMPARISON:
 * - Comparing dates with > converts them to milliseconds
 * - Then compares the numbers
 */
export function isTokenExpired(expiresAt: Date): boolean {
  return new Date() > expiresAt;
}
