"use client";
import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { resetPassword } from "@/lib/api";

const ResetPasswordComponent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [token, setToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);

  const [showPassword1, setShowPassword1] = useState(false);
  const [showPassword2, setShowPassword2] = useState(false);

  useEffect(() => {
    const tokenFromUrl = searchParams.get("token");
    if (tokenFromUrl) {
      setToken(tokenFromUrl);
    } else {
      setMessage("Invalid or missing reset token. Please request a new link.");
      setIsError(true);
    }
  }, [searchParams]);

  // ✅ Validation function
  const validatePasswords = () => {
    const errs = {};

    if (!newPassword) errs.newPassword = "New password is required";
    if (!confirmPassword) errs.confirmPassword = "Confirm password is required";

    if (newPassword && newPassword.length < 8)
      errs.newPassword = "Password must be at least 8 characters";

    if (newPassword && !/[A-Z]/.test(newPassword))
      errs.newPassword = "Must include at least 1 uppercase letter";

    if (newPassword && !/[a-z]/.test(newPassword))
      errs.newPassword = "Must include at least 1 lowercase letter";

    if (newPassword && !/[0-9]/.test(newPassword))
      errs.newPassword = "Must include at least 1 number";

    if (newPassword && !/[!@#$%^&*(),.?\":{}|<>]/.test(newPassword))
      errs.newPassword = "Must include at least 1 special character";

    if (newPassword && confirmPassword && newPassword !== confirmPassword)
      errs.confirmPassword = "Passwords do not match";

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const isFormValid =
    newPassword && confirmPassword && Object.keys(errors).length === 0 && token;

  const handleResetPassword = async (e) => {
    e.preventDefault();

    if (!validatePasswords()) return;

    setIsLoading(true);
    setMessage("");
    setIsError(false);

    try {
      const data = await resetPassword(token, newPassword);
      setMessage(data.message || "Password reset successful!");
      setIsError(false);
      router.replace("/login");
    } catch (error) {
      setMessage(error.message || "Failed to reset password.");
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-[#272052] flex h-screen justify-center w-full relative overflow-hidden">
      <div className="bg-[#272052] w-full max-w-[375px] relative">
        <div className="absolute w-[358px] h-[358px] top-0 left-[9px] bg-[#af7de6] rounded-[179px] blur-[250px]" />
        <div className="absolute inset-0 bg-[#20202033] backdrop-blur-[5px]" />

        <div className="absolute w-[280px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-[15px] p-4 [background:radial-gradient(50%_50%_at_50%_50%,rgba(134,47,148,1)_0%,rgba(6,9,78,1)_100%)]">
          <div className="text-white text-[64px] flex justify-center mt-3">🔑</div>

          <h1 className="text-center text-[#efefef] text-2xl font-extrabold mt-3">
            Reset Password
          </h1>

          <form onSubmit={handleResetPassword} className="mt-4 px-2">
            <p className="text-white text-[13px] text-center mb-4">
              Enter your new password below to finish resetting.
            </p>

            {/* ✅ New Password */}
            <div className="mb-3">
              <label className="text-neutral-400 text-[14px]">New Password</label>

              <div className="relative w-full h-[45px] bg-white/10 rounded-lg border border-white/20 flex items-center">
                <input
                  type={showPassword1 ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => {
                    setNewPassword(e.target.value);
                    validatePasswords();
                  }}
                  className="w-full h-full px-4 bg-transparent text-white outline-none"
                  placeholder="Enter new password"
                />

                <span
                  className="absolute right-4 text-white cursor-pointer"
                  onClick={() => setShowPassword1(!showPassword1)}
                >
                  {showPassword1 ? "🙈" : "👁️"}
                </span>
              </div>

              {errors.newPassword && (
                <p className="text-red-400 text-xs mt-1">{errors.newPassword}</p>
              )}
            </div>

            {/* ✅ Confirm Password */}
            <div className="mb-3">
              <label className="text-neutral-400 text-[14px]">
                Confirm Password
              </label>

              <div className="relative w-full h-[45px] bg-white/10 rounded-lg border border-white/20 flex items-center">
                <input
                  type={showPassword2 ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    validatePasswords();
                  }}
                  className="w-full h-full px-4 bg-transparent text-white outline-none"
                  placeholder="Confirm password"
                />

                <span
                  className="absolute right-4 text-white cursor-pointer"
                  onClick={() => setShowPassword2(!showPassword2)}
                >
                  {showPassword2 ? "🙈" : "👁️"}
                </span>
              </div>

              {errors.confirmPassword && (
                <p className="text-red-400 text-xs mt-1">{errors.confirmPassword}</p>
              )}
            </div>

            {/* ✅ Message */}
            {message && (
              <p className={`text-center text-xs mt-2 ${isError ? "text-red-400" : "text-green-400"}`}>
                {message}
              </p>
            )}

            {/* ✅ Submit */}
            <button
              type="submit"
              disabled={!isFormValid || isLoading}
              className={`w-full h-[40px] mt-4 rounded-lg text-white font-semibold transition ${
                isFormValid && !isLoading
                  ? "bg-gradient-to-b from-[#9eadf7] to-[#716ae7] hover:opacity-90"
                  : "bg-gray-500 opacity-50 cursor-not-allowed"
              }`}
            >
              {isLoading ? "Resetting..." : "Reset Password"}
            </button>
          </form>

          <button
            onClick={() => router.push("/login")}
            className="text-neutral-400 text-center w-full mt-3"
          >
            Back to Login
          </button>
        </div>
      </div>
    </div>
  );
};

const ResetPassword = () => (
  <Suspense fallback={<div>Loading...</div>}>
    <ResetPasswordComponent />
  </Suspense>
);

export default ResetPassword;
