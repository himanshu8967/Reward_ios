"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { forgotPassword } from "@/lib/api"; // <-- IMPORT THE NEW FUNCTION

export const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState(""); // For success/error feedback
  const [step, setStep] = useState("email"); // "email" or "success"
  const router = useRouter();

  const validateEmail = (email) => {
    if (!email.trim()) {
      return "Email is required";
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return "Enter a valid email";
    }
    return "";
  };

  const isEmailValid = email.trim() && validateEmail(email) === "";

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    const error = validateEmail(email);
    setEmailError(error);

    if (error) return;

    setIsLoading(true);
    setMessage("");

    try {
      // Call the backend API
      const response = await forgotPassword(email);
      setMessage(response.message || "Password reset link sent successfully!");
      setStep("success"); // Move to a success screen
    } catch (error) {
      setMessage(error.message || "Failed to send reset link. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailChange = (e) => {
    const value = e.target.value;
    setEmail(value);
    if (emailError) {
      setEmailError(validateEmail(value));
    }
  };

  const handleBackToLogin = () => {
    router.push("/login");
  };

  // SUCCESS VIEW after email is sent
  if (step === "success") {
    return (
      <div className="bg-[#272052] flex h-screen flex-row justify-center w-full relative overflow-hidden">
        <div className="bg-[#272052] overflow-hidden w-full max-w-[375px] relative">
          <div className="absolute w-[358px] h-[358px] top-0 left-[9px] bg-[#af7de6] rounded-[179px] blur-[250px]" />
          <div className="absolute inset-0 bg-[#20202033] backdrop-blur-[5px]" />
          <div className="absolute inset-0 flex flex-col items-center justify-center z-10 p-8 text-center">
            <div className="text-6xl mb-6">✅</div>
            <h1 className="[font-family:'Poppins',Helvetica] font-bold text-white text-2xl mb-4">
              Check Your Email
            </h1>
            <p className="[font-family:'Poppins',Helvetica] font-medium text-neutral-300 text-base mb-8">
              {message}
            </p>
            <p className="[font-family:'Poppins',Helvetica] font-light text-neutral-400 text-sm mb-8">
              If you don't see the email, please check your spam folder.
            </p>
            <button
              onClick={handleBackToLogin}
              className="w-[210px] h-[39px] rounded-lg bg-[linear-gradient(180deg,rgba(158,173,247,1)_0%,rgba(113,106,231,1)_100%)]"
            >
              <div className="[font-family:'Poppins',Helvetica] font-semibold text-white text-sm">
                Back to Login
              </div>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // EMAIL INPUT VIEW
  return (
    <div className="bg-[#272052] flex h-screen flex-row justify-center w-full relative overflow-hidden">
      <div className="bg-[#272052] overflow-hidden w-full max-w-[375px] relative">
        <div className="absolute w-[358px] h-[358px] top-0 left-[9px] bg-[#af7de6] rounded-[179px] blur-[250px]" />
        <div className="absolute inset-0 bg-[#20202033] backdrop-blur-[5px]" />
        <div className="absolute w-[271px] h-[481px] top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 rounded-[15px] overflow-hidden [background:radial-gradient(50%_50%_at_50%_50%,rgba(134,47,148,1)_0%,rgba(6,9,78,1)_100%)] z-10">
          <div className="absolute w-[168px] h-[81px] top-[16px] left-[51px]">
            <div className="absolute w-28 top-px left-[33px] [font-family:'Poppins',Helvetica] font-medium text-white text-[64px] text-center">
              🔐
            </div>

          </div>

          <h1 className="absolute top-[117px] left-[31px] [font-family:'Poppins',Helvetica] font-extrabold text-[#efefef] text-2xl">
            Forgot Password?
          </h1>

          <div className="absolute w-[240px] h-[140px] top-[164px] left-4">
            <p className="absolute w-[220px] top-0 left-[10px] [font-family:'Poppins',Helvetica] font-light text-[#efefef] text-[13px] text-center">
              Don&#39;t worry! Enter your email and we&#39;ll send you a link to
              reset your password.
            </p>

            <label className="absolute w-[134px] top-[75px] left-[10px] [font-family:'Poppins',Helvetica] font-medium text-neutral-400 text-[14.3px]">
              Email Address
            </label>

            <div className="absolute w-[220px] h-[45px] top-[95px] left-[10px]">
              <div className={`relative w-full h-full bg-[rgba(255,255,255,0.1)] rounded-lg border backdrop-blur-sm ${emailError ? 'border-red-400' : 'border-[rgba(255,255,255,0.2)]'}`}>
                <input
                  type="email"
                  value={email}
                  onChange={handleEmailChange}
                  className="w-full h-full px-4 bg-transparent border-none outline-none text-white [font-family:'Poppins',Helvetica] font-medium text-[14.3px] placeholder:text-[#d3d3d3]"
                  placeholder="Enter your email"
                  required
                />
              </div>
              {emailError && (
                <div className="absolute top-[50px] left-0 text-red-400 text-xs [font-family:'Poppins',Helvetica] font-medium">
                  {emailError}
                </div>
              )}
            </div>
          </div>

          {message && (
            <div className="absolute top-[280px] w-full px-8 text-center text-sm text-red-400 [font-family:'Poppins',Helvetica]">
              {message}
            </div>
          )}

          <button
            onClick={handleEmailSubmit}
            disabled={!isEmailValid || isLoading}
            className={`absolute w-[210px] h-[39px] top-[320px] left-[30px] rounded-lg mt-6 overflow-hidden transition-all duration-200 ${isEmailValid && !isLoading
              ? 'bg-[linear-gradient(180deg,rgba(158,173,247,1)_0%,rgba(113,106,231,1)_100%)] hover:opacity-90 cursor-pointer'
              : 'bg-gray-500 cursor-not-allowed opacity-50'
              }`}
          >
            <div className="flex items-center justify-center w-full h-full [font-family:'Poppins',Helvetica] font-semibold text-white text-sm text-center">
              {isLoading ? "Sending..." : "Send Reset Link"}
            </div>
          </button>

          <button
            onClick={handleBackToLogin}
            className="absolute top-[380px] left-[90px] text-center"
          >
            <div className="[font-family:'Poppins',Helvetica] font-normal mt-5 text-[#FEFEFE] text-[14px] cursor-pointer">
              Back to Login
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};