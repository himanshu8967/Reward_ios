"use client";
import React, { useState } from "react";
import Image from "next/image";
import { useAuth } from "../../contexts/AuthContext";
import { useRouter } from "next/navigation";
import LoadingOverlay from "@/components/LoadingOverlay";

import { Capacitor } from "@capacitor/core";
import { Browser } from "@capacitor/browser";

export default function LoginPage() {
  const [emailOrMobile, setEmailOrMobile] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { signIn } = useAuth();
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false)
  const [isRedirecting, setIsRedirecting] = useState(false);

  const handleSignIn = async (e) => {
    e.preventDefault();

    const clientErrors = {};
    if (!emailOrMobile.trim()) clientErrors.emailOrMobile = "Email or Mobile is required.";
    if (!password) clientErrors.password = "Password is required.";
    if (Object.keys(clientErrors).length > 0) {
      setError(clientErrors);
      return;
    }

    setError({});
    setIsSubmitting(true);

    try {
      const result = await signIn(emailOrMobile, password);

      if (result?.ok) {
        router.push("/homepage");
      }
      else {
        const backendError = result?.error;
        if (backendError && backendError.errors) {
          const newErrors = {};
          backendError.errors.forEach(err => {
            if (err.param) newErrors[err.param] = err.msg;
          });
          setError(newErrors);
        }
        else {
          const errorMessage = backendError?.error || backendError?.message || "An unknown error occurred. Please try again.";
          setError({ form: errorMessage });
        }
      }
    } catch (err) {
      console.error("Login component error:", err);
      setError({ form: "A client-side error occurred. Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleForgotPassword = () => {
    router.push("/forgot-password");

  };

  const handleSocialLogin = async (provider) => {
    setIsRedirecting(true);
    const backendUrl = "https://rewardsapi.hireagent.co";
    const authUrl = `${backendUrl}/api/auth/${provider}`;

    // Check if the app is running on a native mobile platform (iOS/Android)
    if (Capacitor.isNativePlatform()) {
      try {
        // Use the Capacitor Browser plugin to open the auth URL.
        // This displays a secure, temporary browser window over the app.
        await Browser.open({ url: authUrl });

        // Add a listener to hide the loading overlay if the user
        // manually closes the browser window without logging in.
        Browser.addListener('browserFinished', () => {
          setIsRedirecting(false);
        });

      } catch (error) {
        console.error("Failed to open browser", error);
        setIsRedirecting(false); // Hide overlay on error
      }
    } else {
      // If running in a standard web browser, perform a simple redirect.
      window.location.href = authUrl;
    }
  };



  const handleSignUp = () => {
    router.push("/welcome");
  };

  const handlePhoneLogin = () => {
    window.location.href = "/login/phone";
  };

  return (
    <div className="relative">
      {isRedirecting && <LoadingOverlay message="Redirecting to secure login..." />}

      <div
        className="bg-[#272052] flex h-screen flex-row justify-center w-full "
        data-model-id="363:24235"
      >
        <div className="bg-[#272052]  overflow-hidden  w-full pl-2 ">
          <div className="relative w-[904px] h-[1221px] -top-32 left-[-215px] ">
            <div className="absolute w-[358px] h-[358px] top-0 left-[229px] bg-[#af7de6] rounded-[179px] blur-[250px]" />

            <div className="absolute w-[904px] h-[1037px] top-[184px] left-0">
              <div className="relative h-[1037px]">
                <div className="absolute w-[397px] h-[397px] top-[640px] left-[430px] rounded-[198.5px] [background:radial-gradient(50%_50%_at_50%_50%,rgba(179,121,223,1)_0%,rgba(54,0,96,0)_100%)] opacity-[0.58]" />

                <div className="absolute w-[397px] h-[397px] top-[619px] left-0 rounded-[198.5px] [background:radial-gradient(50%_50%_at_50%_50%,rgba(196,86,71,1)_0%,rgba(210,90,99,0)_100%)] opacity-[0.58]" />

                <div className="absolute w-[440px] h-[803px] top-[68px] left-[208px] rounded-[59px] backdrop-blur-2xl backdrop-brightness-[100%] [-webkit-backdrop-filter:blur(40px)_brightness(100%)] [background:radial-gradient(50%_50%_at_68%_49%,rgba(179,121,223,0.2)_0%,rgba(204,88,84,0.02)_77%,rgba(179,121,223,0.2)_100%)]" />

                <div className="absolute w-[397px] h-[397px] top-0 left-[507px] rounded-[198.5px] [background:radial-gradient(50%_50%_at_50%_50%,rgba(179,121,223,1)_0%,rgba(54,0,96,0)_100%)] opacity-[0.58]" />
              </div>
            </div>

            <div className="absolute w-[470px] h-[197px] top-[358px] left-[201px]">
              <Image
                className="absolute w-[83px] h-[125px] -top-1.5 left-3.5"
                alt="Front shapes"
                src="https://c.animaapp.com/2Y7fJDnh/img/front-shapes@2x.png"
                width={83}
                height={125}
              />

              <div className="absolute w-[41px] h-[215px] top-[-9px] left-[348px]">
                <Image
                  className="absolute w-[41px] h-[106px] top-[58px] left-0"
                  alt="Front shapes"
                  src="https://c.animaapp.com/2Y7fJDnh/img/front-shapes-1@2x.png"
                  width={41}
                  height={106}
                />

                <Image
                  className="absolute w-[18px] h-[215px] top-0 left-[23px]"
                  alt="Saly"
                  src="https://c.animaapp.com/2Y7fJDnh/img/saly-16@2x.png"
                  width={18}
                  height={215}
                />
              </div>
            </div>

            {/* <button
            className="absolute w-[316px] h-[50px] top-[685px] left-[246px] cursor-pointer"
            onClick={handleSignIn}
            type="button"
            aria-label="Sign in"
          >
            <div className="relative w-[314px] h-[50px] rounded-[12.97px] bg-[linear-gradient(180deg,rgba(158,173,247,1)_0%,rgba(113,106,231,1)_100%)]">
              <div className="absolute top-[11px] left-[126px] [font-family:'Poppins',Helvetica] font-semibold text-white text-lg tracking-[0] leading-[normal]">
                Sign in
              </div>
            </div>
          </button> */}
            <button
              className="absolute w-[316px] h-[50px] top-[685px] left-[246px] cursor-pointer disabled:opacity-50"
              onClick={handleSignIn}
              disabled={isSubmitting} // Disable button while submitting
              type="button"
              aria-label="Sign in"
            >
              <div className="relative w-[314px] h-[50px] rounded-[12.97px] bg-[linear-gradient(180deg,rgba(158,173,247,1)_0%,rgba(113,106,231,1)_100%)]">
                <div className="absolute top-[11px] left-[126px] [font-family:'Poppins',Helvetica] font-semibold text-white text-lg tracking-[0] leading-[normal]">
                  {isSubmitting ? "Signing in..." : "Sign in"}
                </div>
              </div>
            </button>

            <div className="absolute w-[316px] top-[369px] left-[246px]  mt-5 flex flex-col ">
              <label className="[font-family:'Poppins',Helvetica] font-medium text-neutral-400 text-[14.3px] tracking-[0] mb-[1px] leading-[normal]">
                Email/ Phone Number
              </label>
              <div className="relative w-[314px] h-[55px] rounded-[12px] mb-1 bg-white/10 backdrop-blur-lg border border-white/20  focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 transition-colors">
                <Image
                  className="absolute w-[17px] h-[17px] top-5 left-5"
                  alt="Email icon"
                  src="https://c.animaapp.com/2Y7fJDnh/img/vector.svg"
                  width={17}
                  height={17}
                />
                <input
                  type="text"
                  value={emailOrMobile}
                  onChange={(e) => setEmailOrMobile(e.target.value)}
                  className="absolute top-[17px] left-[58px] [font-family:'Poppins',Helvetica] font-medium text-[#d3d3d3] text-[14.3px] tracking-[0] leading-[normal] bg-transparent border-none outline-none w-[240px]"
                  placeholder="Email or Mobile Number"
                  aria-label="Email or Mobile Number"
                />
              </div>
              {error.emailOrMobile && (
                <p className="text-red-400 text-xs  mb-1 ml-2 ">
                  {error.emailOrMobile}
                </p>
              )}
            </div>



            <div className="absolute w-[316px] top-[473px] left-[246px] flex flex-col mt-4">
              <div className="flex justify-between items-center">
                <label className="[font-family:'Poppins',Helvetica] font-medium mb-[1px] text-neutral-400 text-[14.3px] tracking-[0] leading-[normal]">
                  Password
                </label>
              </div>

              <div className="relative w-[314px] h-[55px] rounded-[12px] bg-white/10 backdrop-blur-lg border border-white/20  focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 transition-colors">
                <div className="absolute w-[17px] h-[17px] top-5 left-5">
                  <svg width="19" height="19" viewBox="0 0 19 19" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M17.3901 2.90445L18.0398 2.26388C18.2122 2.09156 18.309 1.85785 18.309 1.61416C18.309 1.37046 18.2122 1.13675 18.0398 0.964436C17.8675 0.792119 17.6338 0.695312 17.3901 0.695312C17.1464 0.695313 16.9127 0.792119 16.7404 0.964436L15.4593 2.25473L12.8695 4.84446L7.09524 10.6096C6.14907 9.98535 5.00485 9.73454 3.88431 9.90578C2.76377 10.077 1.74668 10.6581 1.03013 11.5365C0.313576 12.4148 -0.0514261 13.5279 0.0058485 14.66C0.0631231 15.7921 0.538597 16.8626 1.34014 17.6641C2.14168 18.4657 3.21222 18.9412 4.34432 18.9984C5.47642 19.0557 6.58948 18.6907 7.46783 17.9742C8.34617 17.2576 8.92726 16.2405 9.0985 15.12C9.26974 13.9994 9.01894 12.8552 8.39469 11.909L13.5101 6.78447L15.4501 8.73364C15.5354 8.81836 15.6366 8.88545 15.7479 8.93107C15.8591 8.97669 15.9783 8.99995 16.0985 8.99953C16.2187 8.9991 16.3377 8.975 16.4486 8.92859C16.5596 8.88218 16.6603 8.81439 16.745 8.72906C16.8297 8.64374 16.8968 8.54257 16.9424 8.43132C16.988 8.32007 17.0113 8.20092 17.0109 8.08068C17.0104 7.96044 16.9863 7.84146 16.9399 7.73054C16.8935 7.61962 16.8257 7.51892 16.7404 7.4342L14.8004 5.49418L16.0998 4.20389L16.7404 4.84446C16.8251 4.92978 16.9258 4.99758 17.0367 5.04399C17.1477 5.0904 17.2666 5.1145 17.3869 5.11493C17.5071 5.11535 17.6263 5.09209 17.7375 5.04647C17.8488 5.00085 17.9499 4.93376 18.0353 4.84904C18.1206 4.76432 18.1884 4.66362 18.2348 4.55269C18.2812 4.44177 18.3053 4.32279 18.3057 4.20255C18.3062 4.08231 18.2829 3.96317 18.2373 3.85192C18.1917 3.74067 18.1246 3.63949 18.0398 3.55417L17.3901 2.90445ZM4.57872 17.1709C4.03575 17.1709 3.50497 17.0099 3.05351 16.7082C2.60205 16.4065 2.25018 15.9778 2.04239 15.4761C1.83461 14.9745 1.78024 14.4225 1.88617 13.89C1.9921 13.3574 2.25356 12.8683 2.6375 12.4843C3.02143 12.1004 3.5106 11.8389 4.04314 11.733C4.57567 11.6271 5.12766 11.6814 5.6293 11.8892C6.13094 12.097 6.5597 12.4489 6.86135 12.9004C7.16301 13.3518 7.32402 13.8826 7.32402 14.4256C7.32402 15.1537 7.03478 15.8519 6.51994 16.3668C6.0051 16.8816 5.30682 17.1709 4.57872 17.1709Z" fill="#A4A4A4" />
                  </svg>

                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="absolute top-[17px] left-[58px] [font-family:'Poppins',Helvetica] font-medium text-[#d3d3d3] text-[14.3px] tracking-[0] leading-[normal] bg-transparent border-none outline-none w-[200px]"
                  placeholder="Enter your password"
                  aria-label="Password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute top-[17px] right-[20px] w-[17px] h-[17px] cursor-pointer"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <svg width="17" height="17" viewBox="0 0 17 17" fill="none">
                      <path d="M1 8.5C1 8.5 4 4.5 8.5 4.5C13 4.5 16 8.5 16 8.5C16 8.5 13 12.5 8.5 12.5C4 12.5 1 8.5 1 8.5Z" stroke="#d3d3d3" strokeWidth="1" fill="none" />
                      <circle cx="8.5" cy="8.5" r="3" stroke="#d3d3d3" strokeWidth="1" fill="none" />
                    </svg>
                  ) : (
                    <svg width="17" height="17" viewBox="0 0 17 17" fill="none">
                      <path d="M1 8.5C1 8.5 4 4.5 8.5 4.5C13 4.5 16 8.5 16 8.5" stroke="#d3d3d3" strokeWidth="1" fill="none" />
                      <path d="M16 8.5C16 8.5 13 12.5 8.5 12.5C4 12.5 1 8.5 1 8.5" stroke="#d3d3d3" strokeWidth="1" fill="none" />
                      <line x1="2" y1="2" x2="15" y2="15" stroke="#d3d3d3" strokeWidth="1" />
                    </svg>
                  )}
                </button>
              </div>

              <div className="flex justify-between items-center w-full mt-1">
                <div className="flex-1">
                  {error.password && (
                    <p className="text-red-400 text-xs   ml-2">
                      {error.password}
                    </p>
                  )}
                </div>
                <button
                  className="[font-family:'Poppins',Helvetica] font-medium text-neutral-400 text-[11.3px] tracking-[0] leading-[normal] ml-2 cursor-pointer hover:text-neutral-300 transition-colors"
                  onClick={handleForgotPassword}
                  type="button"
                >
                  Forgot Password?
                </button>
              </div>
            </div>
            {error.form && (
              <div className="absolute top-[360px] left-[246px] w-[316px] text-center text-red-400 text-xs [font-family:'Poppins',Helvetica]">
                {error.form}
              </div>
            )}

            <div className="absolute w-[216px] h-[65px] top-[289px] left-[302px]">
              <p className="absolute top-11 left-0 [font-family:'Poppins',Helvetica] font-medium text-neutral-400 text-sm tracking-[0] leading-[normal]">
                welcome back we missed you
              </p>


              <h1 className="absolute top-0 left-[11px] [font-family:'Poppins',Helvetica] font-semibold text-[#efefef] text-2xl tracking-[0] leading-[normal]">
                Welcome Back!
              </h1>
            </div>


            <Image
              className="absolute w-[52px] h-[43px] top-[315px] left-[519px]"
              alt="Gem"
              src="https://c.animaapp.com/2Y7fJDnh/img/gem-1.png"
              width={52}
              height={43}
            />

            <Image
              className="absolute w-28 h-[123px] top-[131px] left-[205px] object-cover"
              alt="Coins"
              src="/coinss.png"
              width={112}
              height={123}
            />

            <Image
              className="absolute w-[138px] h-24 top-36 left-[328px] object-cover"
              alt="Element"
              src="/greenjems.png"
              width={138}
              height={96}

            />

            <div className="flex flex-col w-[303px] items-start gap-[30px] absolute top-[755px] left-[252px]">
              <div className="flex flex-col items-center gap-[18px] relative self-stretch w-full flex-[0_0_auto]">
                <div className="relative w-[305px] h-[17px] mr-[-2.00px]">
                  <div className="absolute top-0 left-[116px] [font-family:'Poppins',Helvetica] font-medium text-[#b5b5b5] text-[11.2px] tracking-[0] leading-[normal]">
                    Or login with
                  </div>

                  <Image
                    className="absolute w-[98px] h-px top-2 left-0"
                    alt="Divider line"
                    src="https://c.animaapp.com/2Y7fJDnh/img/rectangle-3.svg"
                    width={98}
                    height={1}
                  />

                  <Image
                    className="absolute w-[98px] h-px top-2 left-[205px]"
                    alt="Divider line"
                    src="https://c.animaapp.com/2Y7fJDnh/img/rectangle-4.svg"
                    width={98}
                    height={1}
                  />
                </div>

                <div className="inline-flex items-center gap-5 relative flex-[0_0_auto]">
                  <button
                    className="relative w-[58.1px] h-11 rounded-[12px] border border-gray-600 bg-black/10 backdrop-blur-sm cursor-pointer flex items-center justify-center hover:bg-black/20 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    onClick={() => handleSocialLogin("google")}
                    type="button"
                    aria-label="Sign in with Google"
                  >
                    <div className="w-[20px] h-[20px] flex items-center justify-center">
                      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                        <path
                          d="M19.99 10.1871C19.99 9.36767 19.9246 8.76973 19.7839 8.14966H10.2041V11.848H15.8276C15.7201 12.7667 15.0977 14.1144 13.7747 15.0813L13.7539 15.2051L16.7747 17.4969L16.9913 17.5173C18.9478 15.7789 19.99 13.2211 19.99 10.1871Z"
                          fill="#4285F4"
                        />
                        <path
                          d="M10.2041 19.9313C12.9592 19.9313 15.2429 19.0454 16.9913 17.5173L13.7747 15.0813C12.8849 15.6682 11.7239 16.0779 10.2041 16.0779C7.50474 16.0779 5.24951 14.3395 4.39989 11.9366L4.27989 11.9465L1.13052 14.3273L1.08789 14.4391C2.82606 17.8945 6.25071 19.9313 10.2041 19.9313Z"
                          fill="#34A853"
                        />
                        <path
                          d="M4.39989 11.9366C4.19405 11.3165 4.07251 10.6521 4.07251 9.96565C4.07251 9.27909 4.19405 8.61473 4.38608 7.99463L4.38037 7.86244L1.19677 5.44366L1.08789 5.49214C0.397541 6.84305 0.000976562 8.36002 0.000976562 9.96565C0.000976562 11.5713 0.397541 13.0882 1.08789 14.4391L4.39989 11.9366Z"
                          fill="#FBBC04"
                        />
                        <path
                          d="M10.2041 3.85336C12.1276 3.85336 13.406 4.66168 14.1425 5.33718L17.0207 2.59107C15.2375 0.984447 12.9592 0 10.2041 0C6.25071 0 2.82606 2.03672 1.08789 5.49214L4.38608 7.99463C5.24951 5.59166 7.50474 3.85336 10.2041 3.85336Z"
                          fill="#EB4335"
                        />
                      </svg>
                    </div>
                  </button>

                  <button
                    className="relative w-[58.1px] h-11 rounded-[12px] border border-gray-600 bg-black/10 backdrop-blur-sm cursor-pointer flex items-center justify-center hover:bg-black/20 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    onClick={() => handleSocialLogin("apple")}
                    type="button"
                    aria-label="Sign in with Apple"
                  >
                    <Image
                      className="absolute w-7 h-[30px] top-[7px] left-4 object-cover"
                      alt="Apple logo"
                      src="https://c.animaapp.com/2Y7fJDnh/img/image-3961@2x.png"
                      width={28}
                      height={30}
                    />
                  </button>

                  <button
                    className="relative w-[58.1px] h-11 rounded-[12px] border border-gray-600 bg-black/10 backdrop-blur-sm cursor-pointer flex items-center justify-center hover:bg-black/20 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    onClick={() => handleSocialLogin("facebook")}
                    type="button"
                    aria-label="Sign in with Facebook"
                  >
                    <div className="w-[20px] h-[20px] flex items-center justify-center">
                      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                        <path d="M20 10C20 4.477 15.523 0 10 0S0 4.477 0 10c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V10h2.54V7.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V10h2.773l-.443 2.89h-2.33v6.988C16.343 19.128 20 14.991 20 10z" fill="#1877F2" />
                      </svg>
                    </div>
                  </button>
                </div>
              </div>

              <div className="flex flex-col items-center gap-4 relative self-stretch w-full flex-[0_0_auto]">
                <div className="relative w-[305px] h-[17px] mr-[-2.00px]">
                  <div className="absolute top-0 left-[145px] [font-family:'Poppins',Helvetica] font-medium text-[#b5b5b5] text-[11.2px] tracking-[0] leading-[normal]">
                    Or
                  </div>

                  <Image
                    className="absolute w-[137px] h-px top-2 left-0"
                    alt="Divider line"
                    src="https://c.animaapp.com/2Y7fJDnh/img/rectangle-3-1.svg"
                    width={137}
                    height={1}
                  />

                  <Image
                    className="absolute w-[139px] h-px top-2 left-[164px]"
                    alt="Divider line"
                    src="https://c.animaapp.com/2Y7fJDnh/img/rectangle-4-1.svg"
                    width={139}
                    height={1}
                  />
                </div>

                <p className="relative self-stretch [font-family:'Poppins',Helvetica] font-medium text-transparent text-sm text-center tracking-[0] leading-[normal]">
                  <span className="text-white">Want to create an account? </span>

                  <button
                    className="text-[#9098f2] cursor-pointer bg-transparent border-none underline"
                    onClick={handleSignUp}
                    type="button"
                  >
                    Sign Up
                  </button>
                </p>
              </div>
            </div>

            <Image
              className="absolute w-[312px] h-[70px] top-[602px] left-[247px]"
              alt="CAPTCHA verification"
              src="https://c.animaapp.com/2Y7fJDnh/img/image-4040@2x.png"
              width={312}
              height={70}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
