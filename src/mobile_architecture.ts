/**
 * Pepfuels Mobile App Architecture (React Native + Expo)
 * 
 * Folder Structure:
 * /src
 *   /api             - Axios instance, API endpoints, interceptors
 *   /assets          - Images, fonts, icons
 *   /components      - Reusable UI components (Button, Input, Card, etc.)
 *   /constants       - Colors, Typography, Config
 *   /hooks           - Custom hooks (useAuth, useLocation, useOffline)
 *   /navigation      - Stack/Tab navigators
 *   /screens         - Screen components organized by flow
 *     /auth          - Login, OTP Verification
 *     /customer      - Dashboard, Add Asset, Raise Request
 *     /driver        - Order List, Delivery Flow, Inventory
 *   /store           - Zustand/Redux state management
 *   /services        - Background location, Push notifications, Offline Sync
 *   /utils           - Helpers, formatters, validation schemas
 * 
 * Offline Sync Strategy:
 * 1. Use NetInfo to track connectivity.
 * 2. When offline, store actions (e.g., submit order) in a local SQLite queue.
 * 3. Use a background task to monitor connectivity and sync the queue when online.
 * 4. Implement optimistic UI updates for better UX.
 * 
 * Security:
 * 1. Store JWT tokens in Expo SecureStore.
 * 2. SSL Pinning for API communication.
 * 3. Biometric auth for sensitive actions.
 * 4. Obfuscate sensitive data in logs.
 */

export const MOBILE_APP_CONFIG = {
  version: "1.0.0",
  apiBaseUrl: "https://api.pepfuels.com/v1",
  offlineQueueKey: "@pepfuels_offline_queue",
};
