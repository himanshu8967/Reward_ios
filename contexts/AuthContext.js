"use client";
import { createContext, useContext, useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { login, signup, getProfile } from "@/lib/api";
import useOnboardingStore from "@/stores/useOnboardingStore";
import LoadingScreen from "@/components/LoadingScreen";
import { App } from "@capacitor/app";

const AuthContext = createContext({});

export function useAuth() {
  return useContext(AuthContext);
}

const PROTECTED_ROUTES = [
  "/homepage",
  "/myprofile",
  "/edit-profile",
  "/games",
  "/permissions",
  "/location",
];
const PUBLIC_ONLY_ROUTES = [
  "/login",
  "/signup",
  "/forgot-password",
  "/reset-password",
  "/select-age",
  "/onboarding/select-gender",
  "/onboarding/game-preferences",
  "/onboarding/game-styles",
  "/onboarding/player-type",
  "/welcome",
];

export function AuthProvider({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isNewUserFlow, setIsNewUserFlow] = useState(false);

  useEffect(() => {
    const listener = App.addListener("appUrlOpen", (event) => {
      // This logic now handles ANY deep link starting with your app's scheme.
      const urlString = event.url;
      const urlScheme = "com.jackson.app://";

      if (urlString.startsWith(urlScheme)) {
        // Create a full, parsable URL to easily get path and params
        const parsableUrl = new URL(
          urlString.replace(urlScheme, "http://app/")
        );

        const path = parsableUrl.pathname; // This will be "/reset-password" OR "/auth/callback"
        const token = parsableUrl.searchParams.get("token");

        // --- Case 1: Handle Password Reset ---
        if (path === "/reset-password" && token) {
          console.log("🔑 Handling password reset link...");
          router.push(`/reset-password?token=${token}`);
        }
        // --- Case 2: Handle Social Auth Callback ---
        else if (path === "/auth/callback" && token) {
          console.log("🔗 Handling social auth callback...");
          handleSocialAuthCallback(token).then((result) => {
            router.replace(result.ok ? "/homepage" : "/login");
          });
        }
      }
    });

    return () => {
      listener.remove();
    };
  }, [router]);

  useEffect(() => {
    try {
      const storedToken = localStorage.getItem("authToken");
      const storedUser = localStorage.getItem("user");
      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error("❌ Failed to load session from storage", error);
      localStorage.clear();
    } finally {
      setIsLoading(false);
    }
  }, []);

  // --- BUG FIX: Rewritten Gatekeeper Logic ---
  useEffect(() => {
    if (isLoading) {
      console.log("🛡️ [Gatekeeper] Waiting for session to load...");
      return;
    }
    if (pathname === "/") {
      console.log("🛡️ [Gatekeeper] On AppLoader page, deferring redirection.");
      return;
    }

    const isAuthenticated = !!user;
    console.log(
      `🛡️ [Gatekeeper] Check: auth=${isAuthenticated}, path=${pathname}, newUserFlow=${isNewUserFlow}`
    );

    const isProtectedRoute = PROTECTED_ROUTES.some((route) =>
      pathname.startsWith(route)
    );
    const isPublicOnlyRoute = PUBLIC_ONLY_ROUTES.some((route) =>
      pathname.startsWith(route)
    );
    const isWelcomeRoute = pathname === "/";

    if (isAuthenticated && (isPublicOnlyRoute || isWelcomeRoute)) {
      const destination = isNewUserFlow ? "/permissions" : "/homepage";
      console.log(
        `🛡️ [Gatekeeper] Authenticated on public page. Redirecting to ${destination}`
      );
      router.replace(destination);
      return; // Exit early to prevent other rules from firing in the same render.
    }

    if (!isAuthenticated && isProtectedRoute) {
      console.log(
        "🛡️ [Gatekeeper] Unauthenticated on protected page. Redirecting to /login"
      );
      router.replace("/login");
      return;
    }

    // Rule 3: Cleanup. If the new user flow was active but we are now on a
    // protected page (like /permissions), it's safe to reset the flag.
    if (isAuthenticated && isProtectedRoute && isNewUserFlow) {
      console.log("🛡️ [Gatekeeper] New user flow complete. Resetting flag.");
      setIsNewUserFlow(false);
    }
  }, [isLoading, user, pathname, router, isNewUserFlow]);

  const handleAuthSuccess = (data) => {
    console.log("🔑 handleAuthSuccess called with:", data);
    const { token, user } = data;
    if (!token || !user) {
      console.warn("⚠️ Missing token or user in response!", { token, user });
    }
    setUser(user);
    setToken(token);
    try {
      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("authToken", token);
      localStorage.setItem("onboardingComplete", "true");

      console.log("✅ User + Token + OnboardingFlag saved to localStorage");
    } catch (err) {
      console.error("❌ Failed to save to localStorage", err);
    }
    return { ok: true, user };
  };

  const signIn = async (emailOrMobile, password) => {
    console.log("🔐 signIn called with:", { emailOrMobile, password });
    try {
      const data = await login(emailOrMobile, password);
      console.log("📩 login API response:", data);
      return handleAuthSuccess(data);
    } catch (error) {
      console.error("❌ signIn failed:", error);
      return { ok: false, error: error.body || { error: error.message } };
    }
  };

  const signUpAndSignIn = async (signupData) => {
    console.log("🆕 signUpAndSignIn called with:", signupData);
    try {
      const data = await signup(signupData);
      console.log("📩 signup API response:", data);
      useOnboardingStore.getState().resetOnboarding();
      console.log("🔄 Onboarding store reset");
      setIsNewUserFlow(true);
      return handleAuthSuccess(data);
    } catch (error) {
      console.error("❌ signUpAndSignIn failed:", error);
      return { ok: false, error: error.body || { error: error.message } };
    }
  };

  // ... (signOut, handleSocialAuthCallback, updateUserInContext, and return statement are unchanged) ...
  const signOut = () => {
    console.log("🚪 signOut called. Clearing session...");
    setUser(null);
    setToken(null);
    try {
      localStorage.removeItem("user");
      localStorage.removeItem("authToken");
      localStorage.removeItem("onboarding-storage");
      console.log("🧹 Cleared user + token from localStorage");
    } catch (err) {
      console.error("❌ Failed to clear localStorage", err);
    }
    router.push("/login");
    console.log("➡️ Redirected to /login");
  };

  const handleSocialAuthCallback = async (token) => {
    setIsLoading(true);
    try {
      setToken(token);
      localStorage.setItem("authToken", token);
      const userProfile = await getProfile(token);
      console.log("📩 Fetched user profile:", userProfile);
      return handleAuthSuccess({ token, user: userProfile });
    } catch (error) {
      console.error("❌ handleSocialAuthCallback failed:", error);
      signOut();
      return { ok: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  };

  const updateUserInContext = (newUserData) => {
    setUser(newUserData);
    localStorage.setItem("user", JSON.stringify(newUserData));
  };

  if (isLoading) {
    return <LoadingScreen message="Loading App..." />;
  }

  const value = {
    user,
    token,
    isAuthenticated: !!user,
    isLoading,
    signIn,
    signUpAndSignIn,
    signOut,
    updateUserInContext,
    handleSocialAuthCallback,
  };

  console.log("📡 [AuthProvider] Context Value:", {
    ...value,
    user: value.user ? "..." : null,
  });

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
