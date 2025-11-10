// A custom error class to hold structured API error data
class ApiError extends Error {
  constructor(message, status, body) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.body = body;
  }
}

const BASE_URL = "https://rewardsapi.hireagent.co" || "http://localhost:5000";

const handleResponse = async (response) => {
  const contentType = response.headers.get("content-type");
  let responseData;

  if (response.status === 204) {
    return { success: true, data: null };
  }

  if (contentType && contentType.includes("application/json")) {
    responseData = await response.json();
  } else {
    responseData = { message: await response.text() };
  }

  if (!response.ok) {
    const errorMessage =
      responseData.error ||
      (responseData.errors && responseData.errors[0]?.msg) ||
      responseData.message ||
      `HTTP error! status: ${response.status}`;
    throw new ApiError(errorMessage, response.status, responseData);
  }

  return responseData;
};

const apiRequest = async (
  endpoint,
  method = "GET",
  body = null,
  token = null,
  isFormData = false,
  options = {}
) => {
  const headers = {};

  // Only set Content-Type for non-FormData requests
  if (!isFormData) {
    headers["Content-Type"] = "application/json";
  }

  if (token) {
    // Endpoints that require Bearer token
    const needsBearer = [
      "/api/cash-coach",
      "/api/vip",
      "/api/payment",
      "/api/game",
    ].some((p) => endpoint.startsWith(p));
    if (needsBearer) {
      headers["Authorization"] = `Bearer ${token}`;
    } else {
      // Payout endpoints use x-auth-token (protect middleware)
      headers["x-auth-token"] = token;
    }
  }

  const config = { method, headers };
  if (body) {
    if (isFormData) {
      config.body = body; // Use FormData directly
    } else {
      config.body = JSON.stringify(body);
    }
  }

  console.log(`[FRONTEND] Preparing to send request:`, {
    endpoint: endpoint,
    method: config.method,
    headers: config.headers,
    body: isFormData
      ? `FormData with ${
          body.entries ? Array.from(body.entries()).length : 0
        } entries`
      : config.body,
  });

  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, config);

    console.log(`[API] Response received for ${method} ${endpoint}:`, {
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries()),
    });
    return handleResponse(response);
  } catch (error) {
    console.error(`API request failed: ${method} ${endpoint}`, {
      error: error.message,
      stack: error.stack,
      name: error.name,
      endpoint,
      method,
      config,
    });
    if (error instanceof ApiError) {
      // Re-throw structured error to be caught in components
      // Return a standard error format for consistency
      return {
        success: false,
        error: error.message,
        status: error.status,
        body: error.body,
      };
    } else {
      // Handle network errors
      return {
        success: false,
        error: error.message || "A network error occurred. Please try again.",
      };
    }
  }
};

// --- Authentication Endpoints ---
export const sendOtp = (mobile) =>
  apiRequest("/api/auth/send-otp", "POST", { mobile });
export const verifyOtp = (mobile, otp) =>
  apiRequest("/api/auth/verify-otp", "POST", { mobile, otp });
export const signup = (userData) =>
  apiRequest("/api/auth/signup", "POST", userData);
export const login = (emailOrMobile, password) =>
  apiRequest("/api/auth/login", "POST", { emailOrMobile, password });

// --- Onboarding Endpoints ---
export const getOnboardingOptions = (screenName) =>
  apiRequest(`/api/onboarding/options/${screenName}`);
export const updateOnboardingData = (field, value, mobile) => {
  const fieldMapping = {
    ageRange: { endpoint: "/api/onboarding/age-range", key: "ageRange" },
    gender: { endpoint: "/api/onboarding/gender", key: "gender" },
    improvementArea: {
      endpoint: "/api/onboarding/improvement-area",
      key: "area",
    },
    dailyEarningGoal: {
      endpoint: "/api/onboarding/daily-earning-goal",
      key: "goal",
    },
  };
  const mapping = fieldMapping[field];
  if (!mapping) {
    console.warn(
      `No API mapping for individual save on field: ${field}. It will be saved at final signup.`
    );
    return Promise.resolve();
  }
  const body = { mobile, [mapping.key]: value };
  return apiRequest(mapping.endpoint, "PUT", body);
};

// --- Disclosure Endpoints ---
export const acceptDisclosure = (token) =>
  apiRequest("/api/disclosure/accept", "POST", null, token);

// --- Location Endpoints ---
export const updateLocation = (locationData, token) =>
  apiRequest("/api/location/report", "POST", locationData, token);
export const getLocationHistory = (token) =>
  apiRequest("/api/location/history", "GET", null, token);

// --- Biometric/Face Verification Endpoints ---
export const registerFace = (faceData, token) =>
  apiRequest("/api/biometric/setup", "POST", faceData, token);
export const verifyFace = (verificationData, token) =>
  apiRequest("/api/biometric/verify", "POST", verificationData, token);

// --- Achievements Endpoints ---
export const getUserAchievements = (
  token,
  category = "games",
  status = "completed"
) =>
  apiRequest(
    `/api/achievements/user?category=${category}&status=${status}`,
    "GET",
    null,
    token
  );

// --- Profile Endpoints ---
export const getProfile = (token) =>
  apiRequest("/api/profile", "GET", null, token);
export const getProfileStats = (token) =>
  apiRequest("/api/profile/stats", "GET", null, token);
export const updateProfile = (profileData, token) =>
  apiRequest("/api/profile", "PUT", profileData, token);
export const uploadAvatar = async (avatarFile, token) => {
  const formData = new FormData();
  formData.append("avatar", avatarFile);
  const headers = { "x-auth-token": token };
  try {
    const response = await fetch(`${BASE_URL}/api/profile/avatar`, {
      method: "POST",
      headers,
      body: formData,
    });
    return handleResponse(response);
  } catch (error) {
    console.error(`API request failed: POST /api/profile/avatar`, error);
    throw new Error(
      error.message || "A network error occurred. Please try again."
    );
  }
};

// --- VIP Endpoints ---
export const getVipStatus = (token) =>
  apiRequest("/api/vip/status", "GET", null, token);
export const getHomeDashboard = (token) =>
  apiRequest("/api/dashboard", "GET", null, token);

export const forgotPassword = (email) =>
  apiRequest("/api/auth/forgot-password", "POST", { identifier: email });
export const resetPassword = (token, newPassword) =>
  apiRequest("/api/auth/reset-password", "POST", { token, newPassword });
// --- NEW: Cash Coach Endpoints (Following the exact same pattern) ---
// ===================================================================
export const getFinancialGoals = (token) =>
  apiRequest("/api/cash-coach/financial-goals", "GET", null, token);

export const updateFinancialGoals = (goalsData, token) =>
  apiRequest("/api/cash-coach/financial-goals", "PUT", goalsData, token);

// --- VIP MEMBERSHIP & PAYMENT ENDPOINTS ---
// These functions align with your Postman collection and are called by the Redux slice.

/**
 * Fetches all available VIP tiers and their pricing for a given region.
 * This is a public endpoint and does not require a token.
 * Note: Your original file was calling `/api/vip/tiers` but your Postman collection has `/vip/tiers`. The BASE_URL includes `/api`.
 * So the endpoint should be `/vip/tiers`.
 * @param {string} region - The region code (e.g., "US").
 */
export const getVipTiers = (region = "US") =>
  apiRequest(`/api/vip/tiers?region=${region}`);

/**
 * Initiates the upgrade process by creating a 'pending' subscription record.
 * @param {object} data - The upgrade data: { tierId, plan, region }.
 * @param {string} token - The user's authentication token.
 */
export const initiateUpgrade = (data, token) =>
  apiRequest("/api/vip/upgrade", "POST", data, token);

/**
 * Initiates the payment with the payment provider (e.g., Stripe).
 * @param {object} data - The payment data: { subscriptionId, paymentMethod }.
 * @param {string} token - The user's authentication token.
 */

// --- OTHER API FUNCTIONS (UNCHANGED) ---
// ... (Your other functions like getVipStatus, login, signup, etc. would go here)
export const startPayment = (data, token) =>
  apiRequest("/api/payment/initiate", "POST", data, token);

/**
 * Confirms that the payment was successful, activating the subscription.
 * NOTE: In a modern payment flow with webhooks, this endpoint might not be called
 * from the client. The payment provider (e.g., Stripe) would notify the backend
 * directly via a webhook, which is more secure.
 * @param {object} data - The confirmation data: { paymentIntentId, subscriptionId }.
 * @param {string} token - The user's authentication token.
 */
export const confirmPayment = (data, token) => {
  console.log("🔷 [API] confirmPayment called with:", {
    data,
    hasToken: !!token,
    timestamp: new Date().toISOString(),
  });

  return apiRequest("/api/payment/confirm", "POST", data, token);
};

// --- WALLET TRANSACTIONS ENDPOINTS ---
export const getWalletTransactions = (token, limit = 5) =>
  apiRequest(`/api/wallet/transactions?limit=${limit}`, "GET", null, token);

export const getFullWalletTransactions = (
  token,
  page = 1,
  limit = 20,
  type = "all"
) =>
  apiRequest(
    `/api/wallet/transactions?page=${page}&limit=${limit}&type=${type}`,
    "GET",
    null,
    token
  );

export const getWalletScreen = (token) =>
  apiRequest("/api/wallet-screen", "GET", null, token);

// --- WITHDRAWAL/PAYOUT ENDPOINTS ---
export const getWithdrawalMethods = (token, queryParams = {}) => {
  const params = new URLSearchParams({
    currency_code: "USD",
    country: "US",
    ...queryParams,
  }).toString();
  return apiRequest(`/api/methods?${params}`, "GET", null, token);
};

export const getFundingSources = (token, queryParams = {}) => {
  const params = new URLSearchParams({
    currency_code: "USD",
    country: "US",
    ...queryParams,
  }).toString();
  return apiRequest(
    `/api/payout/funding-sources?${params}`,
    "GET",
    null,
    token
  );
};

export const createWithdrawal = (withdrawalData, token) =>
  apiRequest("/api/payout/create", "POST", withdrawalData, token);

export const getWithdrawalHistory = (token, page = 1, limit = 20) =>
  apiRequest(
    `/api/payout/history?page=${page}&limit=${limit}`,
    "GET",
    null,
    token
  );

export const getWithdrawalStatus = (orderId, token) =>
  apiRequest(`/api/payout/${orderId}/status`, "GET", null, token);

// --- TREMENDOUS API ENDPOINTS ---
export const getTremendousMethods = (token, queryParams = {}) => {
  const params = new URLSearchParams({
    currency: "USD",
    country: "US",
    ...queryParams,
  }).toString();
  return apiRequest(`/api/payouts/methods?${params}`, "GET", null, token);
};

export const getTremendousFundingSources = (token, queryParams = {}) => {
  const params = new URLSearchParams({
    currency: "USD",
    country: "US",
    ...queryParams,
  }).toString();
  return apiRequest(
    `/api/payouts/funding-sources?${params}`,
    "GET",
    null,
    token
  );
};

export const createTremendousPayout = (payoutData, token) =>
  apiRequest("/api/payouts/create", "POST", payoutData, token);

export const getTremendousOrderStatus = (orderId, token) =>
  apiRequest(`/api/payouts/${orderId}/status`, "GET", null, token);

// --- BESITOS GAME API ENDPOINTS ---
// Base URL for Besitos API
const BESITOS_BASE_URL = "https://rewardsapi.hireagent.co";

// Custom API request function for Besitos endpoints
const besitosApiRequest = async (endpoint, method = "GET", body = null) => {
  const headers = {
    "Content-Type": "application/json",
    Accept: "application/json",
    "User-Agent": "JacksonRewardsApp/1.0.0 (Android)",
    "X-Platform": "android",
    "X-App-Version": "1.0.0",
    // Add VPN-friendly headers
    "X-Forwarded-For": "auto-detect",
    "X-Real-IP": "auto-detect",
  };

  // Attach bearer token if available to avoid 401 on protected endpoints
  try {
    const authToken = localStorage.getItem("authToken");
    if (authToken) {
      headers.Authorization = `Bearer ${authToken}`;
    }
  } catch (_) {
    // ignore storage errors
  }

  const config = {
    method,
    headers,
  };

  if (body) {
    config.body = JSON.stringify(body);
  }

  console.log(`[BESITOS API] Preparing to send request:`, {
    endpoint: endpoint,
    method: config.method,
    headers: config.headers,
    body: config.body,
  });

  try {
    const response = await fetch(`${BESITOS_BASE_URL}${endpoint}`, config);

    // Log response for debugging
    console.log(`[BESITOS API] Response status:`, response.status);

    return handleResponse(response);
  } catch (error) {
    console.error(`Besitos API request failed: ${method} ${endpoint}`, error);

    // Handle specific error types for Android and VPN
    if (error.name === "AbortError") {
      // Check if user is using VPN and provide specific guidance
      const isVpnDetected =
        navigator.connection?.type === "cellular" &&
        navigator.connection?.effectiveType === "4g" &&
        window.location.protocol === "https:";

      if (isVpnDetected) {
        throw new Error(
          "Request timeout detected. VPN connection may be causing delays. Please try switching VPN servers or temporarily disabling VPN."
        );
      } else {
        throw new Error(
          "Request timeout. Please check your internet connection."
        );
      }
    } else if (error.name === "TypeError" && error.message.includes("fetch")) {
      throw new Error(
        "Network error. Please check your internet connection and VPN settings."
      );
    } else if (error instanceof ApiError) {
      throw error;
    } else {
      throw new Error(
        error.message || "A network error occurred. Please try again."
      );
    }
  }
};

/**
 * Fetch user data from Besitos API (User Data API)
 * This returns available, in_progress, and completed games for a specific user
 * @param {string} userId - User ID
 * @param {string} devicePlatform - Device platform (android/ios)
 * @param {string} deviceId - Device ID for offer suppression
 * @returns {Promise} User data object with games categorized by status
 */
export const getUserData = (userId, token) => {
  // Use the new required API endpoint with correct base URL
  let endpoint = `/api/besitos/user-data/${userId}`;
  const params = new URLSearchParams();

  if (token) {
    params.append("token", token);
  }

  if (params.toString()) {
    endpoint += `?${params.toString()}`;
  }

  console.log("[API] getUserData (NEW ENDPOINT) called with:", {
    userId,
    token,
    endpoint,
    fullUrl: `${BASE_URL}${endpoint}`,
  });
  return besitosApiRequest(endpoint);
};

/**
 * Fetch conversions from Besitos API
 * @returns {Promise} Array of conversions
 */
export const getConversions = () => besitosApiRequest("/conversions");

/**
 * Fetch surveys from Besitos API
 * @param {string} userId - User ID
 * @param {string} device - Device type (default: "mobile")
 * @param {string} userIp - User IP address
 * @returns {Promise} Array of surveys
 */
export const getSurveys = (userId, device = "mobile", userIp) =>
  besitosApiRequest(`/surveys/${userId}?device=${device}&user_ip=${userIp}`);

/**
 * Fetch user profiling data from Besitos API
 * @param {string} userId - User ID
 * @returns {Promise} User profiling data
 */
export const getUserProfiling = (userId) =>
  besitosApiRequest(`/user-profiling/${userId}`);

/**
 * Fetch messenger data from Besitos API
 * @param {string} userId - User ID
 * @returns {Promise} Messenger data
 */
export const getMessenger = (userId) =>
  besitosApiRequest(`/messenger/${userId}`);

/**
 * Fetch offers/games from Besitos API
 * @param {Object} params - Parameters object
 * @param {number} params.per_page - Number of records per page (default: 5)
 * @param {string} params.device_platform - Device platform (android/ios)
 * @param {number} params.page - Page number (default: 1)
 * @returns {Promise} Array of offers/games
 */
export const getOffers = ({
  per_page = 5,
  device_platform = "android",
  page = 1,
} = {}) => {
  const params = new URLSearchParams();

  if (per_page) params.append("per_page", per_page);
  if (device_platform) params.append("device_platform", device_platform);
  if (page) params.append("page", page);

  const endpoint = `/offers?${params.toString()}`;

  console.log("[API] getOffers called with:", {
    per_page,
    device_platform,
    page,
    endpoint,
  });

  return besitosApiRequest(endpoint);
};

// --- NEW GAME DISCOVERY API ENDPOINTS ---
/**
 * Get games by UI section (replaces old offers API)
 * @param {string} uiSection - UI section name (e.g., "Swipe", "Most Played", "Cash Coach Recommendation")
 * @param {string} ageGroup - Age group (e.g., "18-24", "25-34")
 * @param {string} gender - Gender (e.g., "male", "female")
 * @param {number} page - Page number (default: 1)
 * @param {number} limit - Number of games per page (default: 20)
 * @param {string} token - User authentication token
 * @returns {Promise} Array of games for the specified UI section
 */
export const getGamesBySection = async ({
  uiSection = "Swipe",
  ageGroup = "18-24",
  gender = "male",
  page = 1,
  limit = 20,
  token = null,
} = {}) => {
  const params = new URLSearchParams();

  if (uiSection) params.append("uiSection", uiSection);
  if (ageGroup) params.append("ageGroup", ageGroup);
  if (gender) params.append("gender", gender);
  if (page) params.append("page", page);
  if (limit) params.append("limit", limit);

  const endpoint = `/api/game/discover?${params.toString()}`;

  console.log("[API] getGamesBySection called with:", {
    uiSection,
    ageGroup,
    gender,
    page,
    limit,
    endpoint,
    hasToken: !!token,
  });

  const response = await apiRequest(endpoint, "GET", null, token);

  console.log("[API] getGamesBySection response:", {
    status: response?.status,
    dataLength: response?.data?.length,
    fullResponse: response,
  });

  return response;
};

/**
 * Get game details by ID
 * @param {string} gameId - Game ID
 * @param {string} token - User authentication token
 * @returns {Promise} Game details with goals, rewards, and requirements
 */
export const getGameById = (gameId, token = null) => {
  const endpoint = `/api/game/get-game-by-id/${gameId}`;
  const fullUrl = `https://rewardsapi.hireagent.co${endpoint}`;

  console.log("[API] getGameById called with:", {
    gameId,
    endpoint,
    fullUrl,
    hasToken: !!token,
    tokenLength: token?.length || 0,
  });

  console.log("[API] Making request to:", fullUrl);

  return apiRequest(endpoint, "GET", null, token);
};

// --- DAILY CHALLENGE API ENDPOINTS ---
/**
 * Get calendar view of daily challenges for the month
 * @param {number} year - Year (default: current year)
 * @param {number} month - Month 0-11 (default: current month)
 * @param {string} token - User authentication token
 * @returns {Promise} Calendar data with challenge states
 */
export const getDailyChallengeCalendar = (year, month, token) => {
  const params = new URLSearchParams();
  if (year) params.append("year", year);
  if (month !== undefined) params.append("month", month);

  const endpoint = `/api/daily-challenge/calendar?${params.toString()}`;
  return apiRequest(endpoint, "GET", null, token);
};

/**
 * Get today's challenge with countdown timer and details
 * @param {string} token - User authentication token
 * @returns {Promise} Today's challenge data
 */
export const getTodaysChallenge = (token) =>
  apiRequest("/api/daily-challenge/today", "GET", null, token);

/**
 * Select a game for today's challenge
 * @param {string} gameId - Game ID to select
 * @param {string} token - User authentication token
 * @returns {Promise} Selection confirmation
 */
export const selectChallengeGame = (gameId, token) =>
  apiRequest("/api/daily-challenge/select-game", "POST", { gameId }, token);

/**
 * Start today's challenge
 * @param {string} token - User authentication token
 * @returns {Promise} Challenge start confirmation with game deep link
 */
export const startChallenge = (token) =>
  apiRequest("/api/daily-challenge/start", "POST", null, token);

/**
 * Complete today's challenge and claim rewards
 * @param {string} conversionId - Optional Besitos conversion ID
 * @param {string} token - User authentication token
 * @returns {Promise} Completion confirmation with rewards
 */
export const completeChallenge = (conversionId, token) =>
  apiRequest("/api/daily-challenge/complete", "POST", { conversionId }, token);

/**
 * Get user's challenge completion history
 * @param {number} limit - Number of records to return (default: 30)
 * @param {string} token - User authentication token
 * @returns {Promise} Challenge history data
 */
export const getChallengeHistory = (limit = 30, token) =>
  apiRequest(`/api/daily-challenge/history?limit=${limit}`, "GET", null, token);

/**
 * Get user's challenge statistics and completion rates
 * @param {string} token - User authentication token
 * @returns {Promise} User challenge statistics
 */
export const getChallengeStats = (token) =>
  apiRequest("/api/daily-challenge/stats", "GET", null, token);

/**
 * Get user's current streak status and milestone progress
 * @param {string} token - User authentication token
 * @returns {Promise} Streak status data
 */
export const getStreakStatus = (token) =>
  apiRequest("/api/streak/status", "GET", null, token);

/**
 * Get streak history for the last 30 days
 * @param {number} page - Page number (default: 1)
 * @param {number} limit - Number of records per page (default: 30)
 * @param {string} token - User authentication token
 * @returns {Promise} Streak history data
 */
export const getStreakHistory = (page = 1, limit = 30, token) =>
  apiRequest(
    `/api/streak/history?page=${page}&limit=${limit}`,
    "GET",
    null,
    token
  );

/**
 * Get top users by streak count
 * @param {number} limit - Number of top users to return (default: 10)
 * @param {string} token - User authentication token
 * @returns {Promise} Streak leaderboard data
 */
export const getStreakLeaderboard = (limit = 10, token) =>
  apiRequest(`/api/streak/leaderboard?limit=${limit}`, "GET", null, token);

// ============================================================================
// TICKET SYSTEM APIs
// ============================================================================

/**
 * Get user's games list for ticket form dropdown
 * @param {string} token - User authentication token
 * @returns {Promise} List of games user has played
 */
export const getUserGamesList = (token) =>
  apiRequest("/api/tickets/games/list", "GET", null, token);

/**
 * Raise a new support ticket
 * @param {Object} ticketData - Ticket data including gameId, description, category, images, deviceInfo
 * @param {string} token - User authentication token
 * @returns {Promise} Created ticket response
 */
export const raiseTicket = (ticketData, token) => {
  // Send JSON payload with new structure
  const payload = {
    subject: ticketData.subject || "Support Request",
    description: ticketData.description || "",
    priority: ticketData.priority || "Medium",
    category: ticketData.category || "Other",
    game: "68ece317d8b3c45c06dd3908",
    contact: ticketData.contact || {},
    tags: ticketData.tags || [],
    images: ticketData.images || [],
    metadata: ticketData.metadata || {},
  };

  return apiRequest("/api/tickets", "POST", payload, token, false);
};

/**
 * Get user's tickets with filters and pagination
 * @param {Object} filters - Filter options (status, category, page, limit)
 * @param {string} token - User authentication token
 * @returns {Promise} User's tickets list
 */
export const getUserTickets = (filters = {}, token) => {
  const params = new URLSearchParams();

  // Always add userOnly=true for user tickets
  params.append("userOnly", "true");

  if (filters.status) params.append("status", filters.status);
  if (filters.category) params.append("category", filters.category);
  if (filters.page) params.append("page", filters.page);
  if (filters.limit) params.append("limit", filters.limit);

  const queryString = params.toString();
  const endpoint = `/api/tickets?${queryString}`;

  return apiRequest(endpoint, "GET", null, token);
};

/**
 * Get detailed ticket information
 * @param {string} ticketId - Ticket ID
 * @param {string} token - User authentication token
 * @returns {Promise} Detailed ticket information
 */
export const getTicketDetails = (ticketId, token) =>
  apiRequest(`/api/tickets/${ticketId}`, "GET", null, token);

/**
 * Get user's ticket statistics
 * @param {string} token - User authentication token
 * @returns {Promise} Ticket statistics
 */
export const getTicketStats = (token) =>
  apiRequest("/api/tickets/stats", "GET", null, token);

/**
 * Delete/cancel a ticket
 * @param {string} ticketId - Ticket ID
 * @param {string} token - User authentication token
 * @returns {Promise} Deletion response
 */
export const deleteTicket = (ticketId, token) =>
  apiRequest(`/api/tickets/${ticketId}`, "DELETE", null, token);

// ============================================================================
// GAME EARNING APIs
// ============================================================================

/**
 * Transfer earned coins and XP from game session to user wallet
 * @param {Object} earningData - Earning data: { gameId, coins, xp, reason }
 * @param {string} token - User authentication token
 * @returns {Promise} Transfer confirmation with updated wallet balance
 */
export const transferGameEarnings = async (earningData, token) => {
  console.log("[API] transferGameEarnings called with:", {
    earningData,
    hasToken: !!token,
    timestamp: new Date().toISOString(),
  });

  // Use production API for game earning endpoint
  const GAME_EARNINGS_BASE_URL = "https://rewardsapi.hireagent.co";

  // Send only the specific payload with exact key names
  const payload = {
    gameId: earningData.gameId,
    coins: earningData.coins,
    xp: earningData.xp,
    reason: earningData.reason,
  };

  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };

  const config = {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
  };

  console.log(`[GAME EARNINGS API] Preparing to send request:`, {
    endpoint: "/api/game/earn",
    method: config.method,
    headers: config.headers,
    payload: payload,
    body: config.body,
    fullUrl: `${GAME_EARNINGS_BASE_URL}/api/game/earn`,
  });

  try {
    const response = await fetch(
      `${GAME_EARNINGS_BASE_URL}/api/game/earn`,
      config
    );
    console.log(
      `[GAME EARNINGS API] Response received for POST /api/game/earn:`,
      {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
      }
    );
    return handleResponse(response);
  } catch (error) {
    console.error(`Game earnings API request failed: POST /api/game/earn`, {
      error: error.message,
      stack: error.stack,
      name: error.name,
      endpoint: "/api/game/earn",
      method: "POST",
      config,
    });
    if (error instanceof ApiError) {
      return {
        success: false,
        error: error.message,
        status: error.status,
        body: error.body,
      };
    } else {
      return {
        success: false,
        error: error.message || "A network error occurred. Please try again.",
      };
    }
  }
};

// ============================================================================
// DAILY ACTIVITY STATS API
// ============================================================================

/**
 * Get user's daily activity statistics for streak tracking
 * @param {string} token - User authentication token
 * @returns {Promise} Daily activity stats including currentStreak, totalActiveDays, longestStreak, lastActiveDate, streakHistory, isActiveToday
 */
export const getDailyActivityStats = (token) =>
  apiRequest("/api/daily-activity/stats", "GET", null, token);

// ============================================================================
// SPIN WHEEL APIs
// ============================================================================

/**
 * Get spin wheel configuration and rewards
 * @param {string} token - User authentication token
 * @returns {Promise} Spin config with rewards, eligibility, and user tier
 */
export const getSpinConfig = (token) =>
  apiRequest("/api/spin/config", "GET", null, token);

/**
 * Get user's spin status (canSpin, remainingSpins, cooldown, etc.)
 * @param {string} token - User authentication token
 * @returns {Promise} Spin status with remaining spins, cooldown, VIP multiplier
 */
export const getSpinStatus = (token) =>
  apiRequest("/api/spin/status", "GET", null, token);

/**
 * Perform a spin
 * @param {string} token - User authentication token
 * @returns {Promise} Spin result with reward, spinId, status
 */
export const performSpin = (token) =>
  apiRequest("/api/spin/spin", "POST", {}, token);

/**
 * Redeem a spin reward
 * @param {string} spinId - Spin ID from spin result
 * @param {string} token - User authentication token
 * @returns {Promise} Redemption result with reward, new balance, XP earned
 */
export const redeemSpinReward = (spinId, token) =>
  apiRequest("/api/spin/redeem", "POST", { spinId }, token);
