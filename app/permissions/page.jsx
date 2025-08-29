"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from '@/contexts/AuthContext';

import { acceptDisclosure } from "@/lib/api";

export default function PermissionsPage() {
  const router = useRouter();
  const { token } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const permissionItems = [
    {
      title: "Access to Installed Apps",
      description:
        "You are granted a limited, non-exclusive, non-transferable license to access and use the Software/Platform solely for business purposes in object code form.",
    },
    {
      title: "Approximate Geolocation Data (Non-Continuous)",
      description:
        "You are granted a limited, non-exclusive, non-transferable license to access and use the Software/Platform solely for business purposes in object code form.",
    },
    {
      title: "Display Over Other Apps Permission",
      description:
        "You are granted a limited, non-exclusive, non-transferable license to access and use the Software/Platform solely for business purposes in object code form.",
    },
    {
      title: "Notifications",
      description:
        "You are granted a limited, non-exclusive, non-transferable license to access and use the Software/Platform solely for business purposes in object code form.",
    },
  ];

  const handleAgree = async () => {
    if (isSubmitting) return;

    if (!token) {
      console.error("No auth token found. User must be logged in.");
      setError("Authentication error. Please log in again.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await acceptDisclosure(token);
      router.push("/location");
    } catch (err) {
      console.error("Failed to accept disclosure:", err);
      setError(err.message || "An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#272052] flex items-center justify-center ">
      <div
        className="w-[315px] h-[720px] max-h-full bg-[radial-gradient(ellipse_at_center,_#862F94_0%,_#06094E_100%)] rounded-[15px] flex flex-col relative overflow-hidden"
        aria-labelledby="permissions-heading"
      >
        <header className="p-6 pb-4">
          <h1
            id="permissions-heading"
            className="[font-family:'Poppins',Helvetica] font-semibold text-[#EFEFEF] text-[18px] tracking-[0] leading-[normal]"
          >
            Prominent Disclosure
          </h1>
        </header>

        <div className="flex-1 px-6 pb-20 overflow-y-auto">
          <div className="relative">
            {/* Dotted Line from Figma Design */}
            <div className="space-y-6">
              {permissionItems.map((item, index) => (
                <article key={index} className="pl-3">
                  <h2 className="[font-family:'Poppins',Helvetica] font-normal text-[#FEFEFE] text-[14px] tracking-[0] leading-5 text-left">
                    {`${index + 1}. ${item.title}`}
                  </h2>
                  <p className="mt-2 [font-family:'Poppins',Helvetica] font-light text-[#FEFEFE] text-[12px] tracking-[0] leading-5 text-left">
                    {item.description}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </div>

        <div className="absolute bottom-6 left-6 right-6 z-10">
          {error && <p className="text-red-400 text-center text-sm mb-2">{error}</p>}
          <button
            onClick={handleAgree}
            disabled={isSubmitting}
            className="w-full h-12 rounded-xl bg-[linear-gradient(180deg,rgba(158,173,247,1)_0%,rgba(113,106,231,1)_100%)] hover:opacity-90 transition-opacity focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-transparent disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Agree to permissions"
          >
            <span className="[font-family:'Poppins',Helvetica] font-semibold text-white text-base tracking-[0] leading-[normal]">
              {isSubmitting ? 'Agreeing...' : 'Agree'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}