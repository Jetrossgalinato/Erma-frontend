/**
 * Session Timeout Utility
 * Manages user session timeout with warning alerts
 */

// Configuration
const TIMEOUT_DURATION = 30 * 60 * 1000; // 30 minutes in milliseconds
const WARNING_BEFORE_TIMEOUT = 5 * 60 * 1000; // 5 minutes warning before timeout

type TimeoutCallback = () => void;

class SessionTimeoutManager {
  private timeoutId: NodeJS.Timeout | null = null;
  private warningTimeoutId: NodeJS.Timeout | null = null;
  private onTimeout: TimeoutCallback | null = null;
  private onWarning: TimeoutCallback | null = null;
  private lastActivity: number = Date.now();

  constructor() {
    if (typeof window !== "undefined") {
      this.setupActivityListeners();
    }
  }

  /**
   * Initialize session timeout with callbacks
   */
  public initialize(onTimeout: TimeoutCallback, onWarning?: TimeoutCallback) {
    this.onTimeout = onTimeout;
    this.onWarning = onWarning || null;
    this.resetTimeout();
  }

  /**
   * Setup event listeners for user activity
   */
  private setupActivityListeners() {
    const events = [
      "mousedown",
      "mousemove",
      "keypress",
      "scroll",
      "touchstart",
      "click",
    ];

    events.forEach((event) => {
      document.addEventListener(event, () => this.handleActivity(), true);
    });
  }

  /**
   * Handle user activity
   */
  private handleActivity() {
    const now = Date.now();
    const timeSinceLastActivity = now - this.lastActivity;

    // Only reset if more than 1 second has passed (debounce)
    if (timeSinceLastActivity > 1000) {
      this.lastActivity = now;
      this.resetTimeout();
    }
  }

  /**
   * Reset the timeout counters
   */
  private resetTimeout() {
    // Clear existing timeouts
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }
    if (this.warningTimeoutId) {
      clearTimeout(this.warningTimeoutId);
    }

    // Set warning timeout (5 minutes before actual timeout)
    if (this.onWarning) {
      this.warningTimeoutId = setTimeout(() => {
        if (this.onWarning) {
          this.onWarning();
        }
      }, TIMEOUT_DURATION - WARNING_BEFORE_TIMEOUT);
    }

    // Set actual timeout (30 minutes)
    this.timeoutId = setTimeout(() => {
      if (this.onTimeout) {
        this.onTimeout();
      }
    }, TIMEOUT_DURATION);
  }

  /**
   * Manually trigger logout
   */
  public logout() {
    if (this.onTimeout) {
      this.onTimeout();
    }
  }

  /**
   * Stop the session timeout
   */
  public stop() {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
    if (this.warningTimeoutId) {
      clearTimeout(this.warningTimeoutId);
      this.warningTimeoutId = null;
    }
  }

  /**
   * Get remaining time until timeout (in milliseconds)
   */
  public getRemainingTime(): number {
    const elapsed = Date.now() - this.lastActivity;
    const remaining = TIMEOUT_DURATION - elapsed;
    return Math.max(0, remaining);
  }

  /**
   * Format remaining time as MM:SS
   */
  public getFormattedRemainingTime(): string {
    const remaining = this.getRemainingTime();
    const minutes = Math.floor(remaining / 60000);
    const seconds = Math.floor((remaining % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  }

  /**
   * Check if user is authenticated
   */
  public static isAuthenticated(): boolean {
    if (typeof window === "undefined") return false;
    const token = localStorage.getItem("authToken");
    return !!token;
  }

  /**
   * Perform logout actions
   */
  public static performLogout() {
    if (typeof window === "undefined") return;

    // Clear all auth data
    localStorage.removeItem("authToken");
    localStorage.removeItem("userId");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("userRole");

    // Redirect to login page
    window.location.href = "/login";
  }
}

// Create singleton instance
export const sessionTimeout = new SessionTimeoutManager();

// Export configuration for customization
export const SESSION_CONFIG = {
  TIMEOUT_DURATION,
  WARNING_BEFORE_TIMEOUT,
  TIMEOUT_MINUTES: TIMEOUT_DURATION / 60000,
  WARNING_MINUTES: WARNING_BEFORE_TIMEOUT / 60000,
};
