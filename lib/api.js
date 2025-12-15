import { getUserFromLocalStorage } from "./utils";

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
// const BASE_URL = "http://localhost:4001";

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
      "/api/profile/notifications",
      "/api/biometric",
      "/api/non-game-offers",
      "/api/daily-rewards",
      "/api/daily-challenge",
      "/api/xp-tier",
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
export const login = (emailOrMobile, password, turnstileToken = null) => {
  const body = { emailOrMobile, password };
  if (turnstileToken) {
    body.turnstileToken = turnstileToken;
  }
  return apiRequest("/api/auth/login", "POST", body);
};

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
export const toggleBiometric = (token) =>
  apiRequest("/api/biometric/toggle", "PUT", { enabled: true }, token);

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
// --- Notification Endpoints ---
export const getUserNotifications = (token) =>
  apiRequest("/api/profile/notifications", "GET", null, token);
export const dismissNotification = (notificationId, token) =>
  apiRequest(
    `/api/profile/notifications/${notificationId}/dismiss`,
    "POST",
    null,
    token
  );
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
// Base URL for Besitos API - HARDCODED FOR TESTING ONLY
const BESITOS_BASE_URL = "http://localhost:4001";

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
 * @param {string} token - User authentication token
 * @returns {Promise} User data object with games categorized by status
 */
export const getUserData = (userId, token) => {
  // Use the production API endpoint with live base URL
  let endpoint = `/api/besitos/user-data/${userId}`;
  const params = new URLSearchParams();

  if (token) {
    params.append("token", token);
  }

  if (params.toString()) {
    endpoint += `?${params.toString()}`;
  }

  console.log("[API] getUserData (LIVE ENDPOINT) called with:", {
    userId,
    token,
    endpoint,
    fullUrl: `${BASE_URL}${endpoint}`,
  });
  // Use main apiRequest function to use production BASE_URL
  return apiRequest(endpoint, "GET", null, token);
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
 * @param {string} ageGroup - Age group (e.g., "18-24", "25-34") - will be overridden by user.age or user.ageRange if user is provided
 * @param {string} gender - Gender (e.g., "male", "female") - will be overridden by user.gender if user is provided
 * @param {number} page - Page number (default: 1)
 * @param {number} limit - Number of games per page (default: 20)
 * @param {string} token - User authentication token
 * @param {Object} user - User object with age/ageRange and gender properties - if provided, will be used instead of ageGroup and gender parameters
 * @returns {Promise} Array of games for the specified UI section
 */
export const getGamesBySection = async ({
  uiSection = "Swipe",
  ageGroup = "18-24",
  gender = "male",
  page = 1,
  limit = 20,
  token = null,
  user = null,
} = {}) => {
  // Extract age group and gender from user object if provided
  let finalAgeGroup = ageGroup;
  let finalGender = gender;

  // Validate user object - don't use error objects or invalid responses
  const isErrorObject =
    user && typeof user === "object" && (user.success === false || user.error);
  const isValidUserObject =
    user &&
    typeof user === "object" &&
    !Array.isArray(user) &&
    !isErrorObject && // Don't use error responses
    (user.age !== undefined ||
      user.ageRange !== undefined ||
      user.gender !== undefined ||
      user._id !== undefined); // Must have at least one user property

  // If user object is invalid, try to get from localStorage as fallback
  let userToUse = isValidUserObject ? user : null;
  if (!userToUse) {
    console.log(
      "🔍 [API] User object invalid, trying localStorage fallback..."
    );
    userToUse = getUserFromLocalStorage();
    if (userToUse) {
      console.log("🔍 [API] ✓ Found user in localStorage, using as fallback");
    }
  } else {
    // Even if Redux user is valid, check if it has age/gender
    // If not, try to get from localStorage and merge
    const hasAgeOrGender =
      userToUse.age || userToUse.ageRange || userToUse.gender;
    if (!hasAgeOrGender) {
      console.log(
        "🔍 [API] Redux user exists but missing age/gender, checking localStorage..."
      );
      const localStorageUser = getUserFromLocalStorage();
      if (
        localStorageUser &&
        (localStorageUser.age ||
          localStorageUser.ageRange ||
          localStorageUser.gender)
      ) {
        // Merge localStorage data with Redux user (localStorage has priority for age/gender)
        userToUse = {
          ...userToUse,
          age: localStorageUser.age || userToUse.age,
          ageRange: localStorageUser.ageRange || userToUse.ageRange,
          gender: localStorageUser.gender || userToUse.gender,
        };
        console.log("🔍 [API] ✓ Merged age/gender from localStorage:", {
          age: userToUse.age,
          ageRange: userToUse.ageRange,
          gender: userToUse.gender,
        });
      }
    }
  }

  if (userToUse) {
    // Debug: Log the user object structure
    console.log("🔍 [API] User object received - Full Debug:", {
      source: isValidUserObject ? "Redux" : "LocalStorage",
      hasUser: !!userToUse,
      userType: typeof userToUse,
      userIsNull: userToUse === null,
      userIsUndefined: userToUse === undefined,
      userIsArray: Array.isArray(userToUse),
      userConstructor: userToUse?.constructor?.name,
      userKeys: userToUse ? Object.keys(userToUse) : [],
      userKeysLength: userToUse ? Object.keys(userToUse).length : 0,
      userAge: userToUse?.age,
      userAgeType: typeof userToUse?.age,
      userAgeValue: userToUse?.age,
      userAgeRange: userToUse?.ageRange,
      userAgeRangeType: typeof userToUse?.ageRange,
      userGender: userToUse?.gender,
      userGenderType: typeof userToUse?.gender,
      userGenderValue: userToUse?.gender,
      userStringified: JSON.stringify(userToUse).substring(0, 500), // First 500 chars for debugging
      userFullObject: userToUse,
    });

    // Extract age group from user object
    // Check both top-level and nested properties
    // Priority: ageRange > age (if age is string like "25-34") > age (if age is number, convert to age group)
    const userAge =
      userToUse.age || userToUse.profile?.age || userToUse.details?.age;
    const userAgeRange =
      userToUse.ageRange ||
      userToUse.profile?.ageRange ||
      userToUse.details?.ageRange;

    console.log("🔍 [API] Starting age extraction - Checking properties:", {
      hasAgeRange: !!userAgeRange,
      hasAge: !!userAge,
      ageRangeValue: userAgeRange,
      ageRangeType: typeof userAgeRange,
      ageValue: userAge,
      ageType: typeof userAge,
      checkedPaths: {
        topLevel: { age: userToUse.age, ageRange: userToUse.ageRange },
        profile: {
          age: userToUse.profile?.age,
          ageRange: userToUse.profile?.ageRange,
        },
        details: {
          age: userToUse.details?.age,
          ageRange: userToUse.details?.ageRange,
        },
      },
    });

    if (userAgeRange && typeof userAgeRange === "string") {
      finalAgeGroup = userAgeRange;
      console.log("🔍 [API] ✓✓✓ Using ageRange from user:", finalAgeGroup);
    } else if (userAge !== undefined && userAge !== null) {
      // Check if age is already in age group format (string like "25-34")
      if (typeof userAge === "string" && userAge.includes("-")) {
        finalAgeGroup = userAge;
        console.log(
          "🔍 [API] ✓✓✓ Using age string as ageGroup:",
          finalAgeGroup
        );
      } else if (typeof userAge === "number") {
        // Convert numeric age to age group
        const age = userAge;
        if (age < 18) finalAgeGroup = "18-24";
        else if (age >= 18 && age <= 24) finalAgeGroup = "18-24";
        else if (age >= 25 && age <= 34) finalAgeGroup = "25-34";
        else if (age >= 35 && age <= 44) finalAgeGroup = "35-44";
        else if (age >= 45 && age <= 54) finalAgeGroup = "45-54";
        else if (age >= 55 && age <= 64) finalAgeGroup = "55-64";
        else if (age >= 65) finalAgeGroup = "65+";
        console.log(
          "🔍 [API] ✓✓✓ Converted numeric age to ageGroup:",
          age,
          "->",
          finalAgeGroup
        );
      } else {
        console.log(
          "🔍 [API] ✗✗✗ Age value is not in expected format:",
          typeof userAge,
          userAge,
          "Value:",
          userAge
        );
      }
    } else {
      // Try localStorage as last resort before using defaults
      console.log(
        "🔍 [API] ✗✗✗ No age or ageRange found in user object, trying localStorage..."
      );
      const localStorageUser = getUserFromLocalStorage();
      if (localStorageUser) {
        const localAge = localStorageUser.age || localStorageUser.ageRange;
        if (localAge) {
          if (typeof localAge === "string" && localAge.includes("-")) {
            finalAgeGroup = localAge;
            console.log(
              "🔍 [API] ✓✓✓ Using age from localStorage:",
              finalAgeGroup
            );
          } else if (typeof localAge === "number") {
            const age = localAge;
            if (age < 18) finalAgeGroup = "18-24";
            else if (age >= 18 && age <= 24) finalAgeGroup = "18-24";
            else if (age >= 25 && age <= 34) finalAgeGroup = "25-34";
            else if (age >= 35 && age <= 44) finalAgeGroup = "35-44";
            else if (age >= 45 && age <= 54) finalAgeGroup = "45-54";
            else if (age >= 55 && age <= 64) finalAgeGroup = "55-64";
            else if (age >= 65) finalAgeGroup = "65+";
            console.log(
              "🔍 [API] ✓✓✓ Using age from localStorage (converted):",
              age,
              "->",
              finalAgeGroup
            );
          }
        }
      }

      if (finalAgeGroup === ageGroup) {
        console.log(
          "🔍 [API] ✗✗✗ No age found anywhere, using default:",
          finalAgeGroup
        );
      }
    }

    // Extract gender from user object - check nested properties too
    const userGender =
      userToUse.gender ||
      userToUse.profile?.gender ||
      userToUse.details?.gender;

    console.log("🔍 [API] Starting gender extraction - Checking properties:", {
      hasGender: !!userGender,
      genderValue: userGender,
      genderType: typeof userGender,
      checkedPaths: {
        topLevel: userToUse.gender,
        profile: userToUse.profile?.gender,
        details: userToUse.details?.gender,
      },
    });

    if (userGender && typeof userGender === "string") {
      finalGender = userGender.toLowerCase().trim();
      console.log("🔍 [API] ✓✓✓ Using gender from user:", finalGender);
    } else {
      // Try localStorage as last resort before using defaults
      console.log(
        "🔍 [API] ✗✗✗ No gender found in user object, trying localStorage..."
      );
      const localStorageUser = getUserFromLocalStorage();
      if (localStorageUser && localStorageUser.gender) {
        finalGender = localStorageUser.gender.toLowerCase().trim();
        console.log(
          "🔍 [API] ✓✓✓ Using gender from localStorage:",
          finalGender
        );
      } else {
        console.log(
          "🔍 [API] ✗✗✗ No gender found anywhere, using default:",
          finalGender
        );
      }
    }
  } else {
    // Check if user is an error object
    const isErrorObject =
      user &&
      typeof user === "object" &&
      (user.success === false || user.error);

    console.log("🔍 [API] ✗✗✗ No valid user object provided, using defaults:", {
      finalAgeGroup,
      finalGender,
      userProvided: !!user,
      userType: typeof user,
      isErrorObject,
      userValue: isErrorObject
        ? `ERROR: ${user.error || "Failed to fetch"}`
        : user,
      reason: isErrorObject
        ? "User object is an error response from failed profile fetch"
        : user
        ? "User object missing required properties (age/ageRange/gender/_id)"
        : "No user object provided",
    });
  }

  const params = new URLSearchParams();

  if (uiSection) params.append("uiSection", uiSection);
  if (finalAgeGroup) params.append("ageGroup", finalAgeGroup);
  if (finalGender) params.append("gender", finalGender);
  if (page) params.append("page", page);
  if (limit) params.append("limit", limit);

  const endpoint = `/api/game/discover?${params.toString()}`;

  console.log("🔍 [API] getGamesBySection - Final Summary:", {
    uiSection,
    finalAgeGroup,
    finalGender,
    page,
    limit,
    endpoint,
    hasToken: !!token,
    hasUser: !!user,
    extractedFromUser: userToUse
      ? {
          userAge: userToUse?.age,
          userAgeRange: userToUse?.ageRange,
          userGender: userToUse?.gender,
          source: isValidUserObject ? "Redux" : "LocalStorage",
        }
      : null,
    usingDefaults: {
      ageGroupUsedDefault: finalAgeGroup === ageGroup,
      genderUsedDefault: finalGender === gender,
    },
  });

  const response = await apiRequest(endpoint, "GET", null, token);

  console.log("[API] getGamesBySection response:", {
    status: response?.status,
    dataLength: response?.data?.length,
    fullResponse: response,
  });

  // Add xpRewardConfig to the response
  const enhancedResponse = {
    ...response,
    xpRewardConfig: {
      baseXP: 1,
      multiplier: 1.8,
    },
  };

  // If response has data array, ensure each game also has access to xpRewardConfig
  if (enhancedResponse.data && Array.isArray(enhancedResponse.data)) {
    // Optionally add xpRewardConfig to each game object for convenience
    // enhancedResponse.data = enhancedResponse.data.map(game => ({
    //   ...game,
    //   xpRewardConfig: enhancedResponse.xpRewardConfig
    // }));
  }

  console.log(
    "[API] getGamesBySection enhanced response with xpRewardConfig:",
    {
      hasXpRewardConfig: !!enhancedResponse.xpRewardConfig,
      xpRewardConfig: enhancedResponse.xpRewardConfig,
    }
  );

  return enhancedResponse;
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
  console.log("📅 [DAILY CHALLENGE API] getDailyChallengeCalendar called:", {
    year,
    month,
    hasToken: !!token,
    timestamp: new Date().toISOString(),
  });

  const params = new URLSearchParams();
  if (year) params.append("year", year);
  if (month !== undefined) params.append("month", month);

  const endpoint = `/api/daily-challenge/calendar?${params.toString()}`;
  console.log("📅 [DAILY CHALLENGE API] Calendar request endpoint:", endpoint);

  return apiRequest(endpoint, "GET", null, token)
    .then((response) => {
      console.log(
        "📅 [DAILY CHALLENGE API] getDailyChallengeCalendar response:",
        {
          success: response?.success,
          hasData: !!response?.data,
          calendarDays: response?.data?.calendarDays?.length || 0,
          streak: response?.data?.streak,
          fullResponse: response,
        }
      );
      return response;
    })
    .catch((error) => {
      console.error(
        "📅 [DAILY CHALLENGE API] getDailyChallengeCalendar error:",
        {
          error: error.message,
          stack: error.stack,
          year,
          month,
        }
      );
      throw error;
    });
};

/**
 * Get today's challenge with countdown timer and details
 * @param {string} token - User authentication token
 * @returns {Promise} Today's challenge data
 */
export const getTodaysChallenge = (token) => {
  console.log("🎯 [DAILY CHALLENGE API] getTodaysChallenge called:", {
    hasToken: !!token,
    tokenLength: token?.length || 0,
    timestamp: new Date().toISOString(),
  });

  return apiRequest("/api/daily-challenge/today", "GET", null, token)
    .then((response) => {
      console.log("🎯 [DAILY CHALLENGE API] getTodaysChallenge response:", {
        success: response?.success,
        hasChallenge: response?.data?.hasChallenge,
        challengeId: response?.data?.challenge?.id,
        challengeType: response?.data?.challenge?.type,
        progressStatus: response?.data?.progress?.status,
        countdown: response?.data?.countdown,
        actions: response?.data?.actions,
        fullResponse: response,
      });
      return response;
    })
    .catch((error) => {
      console.error("🎯 [DAILY CHALLENGE API] getTodaysChallenge error:", {
        error: error.message,
        stack: error.stack,
      });
      throw error;
    });
};

/**
 * Select a game for today's challenge
 * @param {string} gameId - Game ID to select
 * @param {string} token - User authentication token
 * @returns {Promise} Selection confirmation
 */
export const selectChallengeGame = (gameId, token) => {
  console.log("🎮 [DAILY CHALLENGE API] selectChallengeGame called:", {
    gameId,
    hasToken: !!token,
    timestamp: new Date().toISOString(),
  });

  return apiRequest(
    "/api/daily-challenge/select-game",
    "POST",
    { gameId },
    token
  )
    .then((response) => {
      console.log("🎮 [DAILY CHALLENGE API] selectChallengeGame response:", {
        success: response?.success,
        selectedGame: response?.data?.selectedGame,
        canPlayNow: response?.data?.canPlayNow,
        fullResponse: response,
      });
      return response;
    })
    .catch((error) => {
      console.error("🎮 [DAILY CHALLENGE API] selectChallengeGame error:", {
        error: error.message,
        stack: error.stack,
        gameId,
      });
      throw error;
    });
};

/**
 * Start today's challenge
 * @param {string} token - User authentication token
 * @returns {Promise} Challenge start confirmation with game deep link
 */
export const startChallenge = (token) => {
  console.log("🚀 [DAILY CHALLENGE API] startChallenge called:", {
    hasToken: !!token,
    timestamp: new Date().toISOString(),
  });

  return apiRequest("/api/daily-challenge/start", "POST", null, token)
    .then((response) => {
      console.log("🚀 [DAILY CHALLENGE API] startChallenge response:", {
        success: response?.success,
        deepLink: response?.data?.deepLink,
        gameId: response?.data?.gameId,
        challengeId: response?.data?.challengeId,
        progress: response?.data?.progress,
        fullResponse: response,
      });
      return response;
    })
    .catch((error) => {
      console.error("🚀 [DAILY CHALLENGE API] startChallenge error:", {
        error: error.message,
        stack: error.stack,
      });
      throw error;
    });
};

/**
 * Spin for daily challenge (bypasses eligibility, creates spin log)
 * @param {string} token - User authentication token
 * @returns {Promise} Spin result with spin log
 */
export const spinForChallenge = (token) => {
  console.log("🎰 [DAILY CHALLENGE API] spinForChallenge called:", {
    hasToken: !!token,
    timestamp: new Date().toISOString(),
  });

  return apiRequest("/api/daily-challenge/spin", "POST", null, token)
    .then((response) => {
      console.log("🎰 [DAILY CHALLENGE API] spinForChallenge response:", {
        success: response?.success,
        data: response?.data,
        fullResponse: response,
      });
      return response;
    })
    .catch((error) => {
      console.error("🎰 [DAILY CHALLENGE API] spinForChallenge error:", {
        error: error.message,
        stack: error.stack,
      });
      throw error;
    });
};

/**
 * Complete today's challenge and claim rewards
 * @param {string} conversionId - Optional Besitos conversion ID
 * @param {string} token - User authentication token
 * @returns {Promise} Completion confirmation with rewards
 */
export const completeChallenge = (conversionId, token) => {
  console.log("✅ [DAILY CHALLENGE API] completeChallenge called:", {
    conversionId,
    hasToken: !!token,
    timestamp: new Date().toISOString(),
  });

  return apiRequest(
    "/api/daily-challenge/complete",
    "POST",
    { conversionId },
    token
  )
    .then((response) => {
      console.log("✅ [DAILY CHALLENGE API] completeChallenge response:", {
        success: response?.success,
        rewards: response?.data?.rewards,
        coins: response?.data?.rewards?.coins,
        xp: response?.data?.rewards?.xp,
        bonusCoins: response?.data?.rewards?.bonusCoins,
        bonusXP: response?.data?.rewards?.bonusXP,
        streak: response?.data?.streak,
        transactionId: response?.data?.transactionId,
        fullResponse: response,
      });
      return response;
    })
    .catch((error) => {
      console.error("✅ [DAILY CHALLENGE API] completeChallenge error:", {
        error: error.message,
        stack: error.stack,
        conversionId,
      });
      throw error;
    });
};

/**
 * Get bonus days for the authenticated user
 * @param {string} token - User authentication token
 * @returns {Promise} Bonus days data with rewards and status
 */
export const getBonusDays = (token) => {
  console.log("🎁 [BONUS DAYS API] getBonusDays called:", {
    hasToken: !!token,
    tokenLength: token?.length || 0,
    timestamp: new Date().toISOString(),
  });

  return apiRequest("/api/streak/bonus-days", "GET", null, token)
    .then((response) => {
      console.log("🎁 [BONUS DAYS API] getBonusDays response:", {
        success: response?.success,
        hasData: !!response?.data,
        bonusDaysCount: response?.data?.bonusDays?.length || 0,
        currentStreak: response?.data?.currentStreak,
        totalBonusDays: response?.data?.totalBonusDays,
        reachedBonusDays: response?.data?.reachedBonusDays,
        upcomingBonusDays: response?.data?.upcomingBonusDays,
        fullResponse: response,
      });
      return response;
    })
    .catch((error) => {
      console.error("🎁 [BONUS DAYS API] getBonusDays error:", {
        error: error.message,
        stack: error.stack,
      });
      throw error;
    });
};

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

// --- DAILY REWARDS API ENDPOINTS ---
/**
 * Get daily rewards week data
 * @param {string} date - Optional date string (YYYY-MM-DD format)
 * @param {string} token - User authentication token
 * @returns {Promise} Week data with daily rewards
 */
export const getDailyRewardsWeek = (date = null, token = null) => {
  const endpoint = date
    ? `/api/daily-rewards/week?date=${date}`
    : `/api/daily-rewards/week`;

  console.log("[API] getDailyRewardsWeek called with:", {
    date,
    endpoint,
    hasToken: !!token,
  });

  return apiRequest(endpoint, "GET", null, token);
};

/**
 * Claim daily reward for a specific day
 * @param {number} dayNumber - Day number (1-7)
 * @param {string} token - User authentication token
 * @returns {Promise} Claim confirmation with rewards
 */
export const claimDailyReward = (dayNumber, token = null) => {
  const endpoint = `/api/daily-rewards/claim`;

  console.log("[API] claimDailyReward called with:", {
    dayNumber,
    endpoint,
    hasToken: !!token,
  });

  return apiRequest(endpoint, "POST", { dayNumber }, token);
};

/**
 * Recover missed daily reward day
 * @param {string} method - Recovery method
 * @param {string} token - User authentication token
 * @returns {Promise} Recovery confirmation
 */
export const recoverMissedDailyReward = (method, token = null) => {
  const endpoint = `/api/daily-rewards/recover`;

  console.log("[API] recoverMissedDailyReward called with:", {
    method,
    endpoint,
    hasToken: !!token,
  });

  return apiRequest(endpoint, "POST", { method }, token);
};

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

/**
 * Claim milestone reward for 7, 14, 21, or 30 day streak
 * @param {number} milestoneDay - Milestone day (7, 14, 21, or 30)
 * @param {Object} rewardAmount - Reward amounts: { coins: number, xp: number }
 * @param {string} token - User authentication token
 * @returns {Promise} Claim confirmation with rewards
 */
export const claimStreakMilestoneReward = (
  milestoneDay,
  rewardAmount,
  token
) => {
  console.log("[API] claimStreakMilestoneReward called with:", {
    milestoneDay,
    rewardAmount,
    endpoint: "/api/streak/claim-reward",
    hasToken: !!token,
  });

  return apiRequest(
    "/api/streak/claim-reward",
    "POST",
    {
      milestoneDay,
      rewardAmount,
    },
    token
  );
};

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

// ============================================================================
// BITLABS SURVEY APIs
// ============================================================================

/**
 * Fetch configured Bitlabs surveys for users
 * @param {Object} params - Query parameters
 * @param {string} params.category - Category filter (default: "all")
 * @param {number} params.page - Page number (default: 1)
 * @param {number} params.limit - Items per page (default: 20)
 * @param {string} params.useAdminConfig - Use admin-configured surveys (default: "true")
 * @param {string} token - User authentication token
 * @returns {Promise} Surveys data with pagination
 */
export const getBitlabsSurveys = (params = {}, token) => {
  const queryParams = new URLSearchParams();

  if (params.category) queryParams.append("category", params.category);
  if (params.page) queryParams.append("page", params.page);
  if (params.limit) queryParams.append("limit", params.limit);
  if (params.useAdminConfig !== undefined) {
    queryParams.append("useAdminConfig", params.useAdminConfig);
  } else {
    queryParams.append("useAdminConfig", "true");
  }

  const endpoint = `/api/non-game-offers/surveys?${queryParams.toString()}`;

  console.log("[API] getBitlabsSurveys called with:", {
    params,
    endpoint,
    hasToken: !!token,
  });

  return apiRequest(endpoint, "GET", null, token);
};

/**
 * Track survey click for analytics (optional but recommended)
 * @param {string} offerId - Survey offer ID
 * @param {string} token - User authentication token
 * @returns {Promise} Tracking response
 */
export const trackSurveyClick = (offerId, token) => {
  const endpoint = `/api/non-game-offers/click`;

  console.log("[API] trackSurveyClick called with:", {
    offerId,
    endpoint,
    hasToken: !!token,
  });

  return apiRequest(endpoint, "POST", { offerId, offerType: "survey" }, token);
};

// ============================================================================
// NON-GAME OFFERS APIs (Cashback, Shopping, Magic Receipts)
// ============================================================================

/**
 * Fetch all non-game offers (surveys, cashback, shopping, magic receipts)
 * @param {Object} params - Query parameters
 * @param {string} params.type - Filter by type: "all", "survey", "cashback", "shopping", "magic_receipt"
 * @param {string} params.category - Category filter (default: "all")
 * @param {number} params.page - Page number (default: 1)
 * @param {number} params.limit - Items per page (default: 20)
 * @param {string} params.useAdminConfig - Use admin-configured offers (default: "true")
 * @param {string} token - User authentication token
 * @returns {Promise} Offers data with pagination
 */
export const getAllNonGameOffers = (params = {}, token) => {
  const queryParams = new URLSearchParams();

  if (params.type) queryParams.append("type", params.type);
  if (params.category) queryParams.append("category", params.category);
  if (params.page) queryParams.append("page", params.page);
  if (params.limit) queryParams.append("limit", params.limit);
  if (params.useAdminConfig !== undefined) {
    queryParams.append("useAdminConfig", params.useAdminConfig);
  } else {
    queryParams.append("useAdminConfig", "true");
  }

  const endpoint = `/api/non-game-offers?${queryParams.toString()}`;

  console.log("[API] getAllNonGameOffers called with:", {
    params,
    endpoint,
    hasToken: !!token,
  });

  return apiRequest(endpoint, "GET", null, token);
};

/**
 * Fetch cashback offers only
 * @param {Object} params - Query parameters
 * @param {string} params.category - Category filter (default: "all")
 * @param {number} params.page - Page number (default: 1)
 * @param {number} params.limit - Items per page (default: 20)
 * @param {string} params.useAdminConfig - Use admin-configured offers (default: "true")
 * @param {string} token - User authentication token
 * @returns {Promise} Cashback offers data
 */
export const getCashbackOffers = (params = {}, token) => {
  return getAllNonGameOffers({ ...params, type: "cashback" }, token);
};

/**
 * Fetch shopping offers only
 * @param {Object} params - Query parameters
 * @param {string} params.category - Category filter (default: "all")
 * @param {number} params.page - Page number (default: 1)
 * @param {number} params.limit - Items per page (default: 20)
 * @param {string} params.useAdminConfig - Use admin-configured offers (default: "true")
 * @param {string} token - User authentication token
 * @returns {Promise} Shopping offers data
 */
export const getShoppingOffers = (params = {}, token) => {
  return getAllNonGameOffers({ ...params, type: "shopping" }, token);
};

/**
 * Fetch magic receipt offers only
 * @param {Object} params - Query parameters
 * @param {string} params.category - Category filter (default: "all")
 * @param {number} params.page - Page number (default: 1)
 * @param {number} params.limit - Items per page (default: 20)
 * @param {string} params.useAdminConfig - Use admin-configured offers (default: "true")
 * @param {string} token - User authentication token
 * @returns {Promise} Magic receipt offers data
 */
export const getMagicReceipts = (params = {}, token) => {
  const queryParams = new URLSearchParams();

  if (params.category) queryParams.append("category", params.category);
  if (params.page) queryParams.append("page", params.page);
  if (params.limit) queryParams.append("limit", params.limit);
  if (params.useAdminConfig !== undefined) {
    queryParams.append("useAdminConfig", params.useAdminConfig);
  } else {
    queryParams.append("useAdminConfig", "true");
  }

  const endpoint = `/api/non-game-offers/magic-receipts?${queryParams.toString()}`;

  console.log("[API] getMagicReceipts called with:", {
    params,
    endpoint,
    hasToken: !!token,
  });

  return apiRequest(endpoint, "GET", null, token);
};

// ============================================================================
// XP TIER PROGRESS BAR API
// ============================================================================

/**
 * Get XP tier progress bar data
 * @param {string} token - User authentication token
 * @returns {Promise} XP tier progress data with current tier, tiers list, and progress percentage
 */
export const getXPTierProgressBar = (token) =>
  apiRequest("/api/xp-tier/progress-bar", "GET", null, token);
