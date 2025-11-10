"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";

export default function ContactUsPage() {
    const router = useRouter();
    const [copyMessage, setCopyMessage] = useState("");

    const contactInfo = {
        address: "2972 Westheimer Rd. Santa Ana, Illinois 85486",
        email: "contact@company.com",
        phone: "(406) 555-0120",
    };

    const handleBackClick = () => {
        router.back();
    };

    const handleEmailClick = async () => {
        try {
            window.location.href = `mailto:${contactInfo.email}`;
            setTimeout(() => {
            }, 1000);
        } catch (error) {
            await copyToClipboard(contactInfo.email, "Email");
        }
    };

    const handlePhoneClick = async () => {
        try {
            const phoneNumber = contactInfo.phone.replace(/\D/g, "");
            window.location.href = `tel:${phoneNumber}`;
            setTimeout(() => {
            }, 1000);
        } catch (error) {
            await copyToClipboard(contactInfo.phone, "Phone number");
        }
    };

    const copyToClipboard = async (text, type) => {
        try {
            if (navigator.clipboard && navigator.clipboard.writeText) {
                await navigator.clipboard.writeText(text);
                showCopyMessage(`${type} copied to clipboard!`);
            } else {
                const textArea = document.createElement("textarea");
                textArea.value = text;
                textArea.style.position = "fixed";
                textArea.style.left = "-999999px";
                document.body.appendChild(textArea);
                textArea.focus();
                textArea.select();

                try {
                    document.execCommand('copy');
                    showCopyMessage(`${type} copied to clipboard!`);
                } catch (err) {
                    showCopyMessage(`Failed to copy ${type.toLowerCase()}`);
                }

                document.body.removeChild(textArea);
            }
        } catch (err) {
            showCopyMessage(`Failed to copy ${type.toLowerCase()}`);
            console.error('Copy to clipboard failed:', err);
        }
    };

    const showCopyMessage = (message) => {
        setCopyMessage(message);
        setTimeout(() => {
            setCopyMessage("");
        }, 3000);
    };

    return (
        <div className="flex flex-col w-full min-h-screen bg-black">
            {/* Header with Status Bar */}
            <header className="flex flex-col w-full bg-black">
                {/* Status Bar Space */}
                <div className="w-full h-2 bg-black" />

                {/* App Version */}
                <div className="px-5 py-1 [font-family:'Poppins',Helvetica] font-normal text-[#A4A4A4] text-[10px] tracking-[0] leading-3">
                    App Version: {process.env.NEXT_PUBLIC_APP_VERSION || "V0.0.1"}
                </div>

                {/* Navigation */}
                <nav className="flex items-center gap-4 px-5 py-3">
                    <button
                        onClick={handleBackClick}
                        className="w-6 h-6 cursor-pointer hover:opacity-80 transition-opacity duration-200"
                        aria-label="Go back"
                        type="button"
                    >
                        <img
                            className="w-full h-full"
                            alt=""
                            src="https://c.animaapp.com/A0aDsc87/img/arrow-back-ios-new@2x.png"
                        />
                    </button>

                    <h1 className="flex-1 [font-family:'Poppins',Helvetica] font-semibold text-white text-xl tracking-[0] leading-5">
                        Contact Us
                    </h1>
                </nav>
            </header>

            {/* Scrollable Content */}
            <main className="flex flex-col flex-1 w-full items-center px-5 pb-10 overflow-y-auto">
                {/* Map Display */}
                <img
                    className="w-full max-w-[335px] h-[184px] object-cover rounded-lg mt-6"
                    alt="Map showing location at 2972 Westheimer Rd. Santa Ana, Illinois"
                    src="https://c.animaapp.com/A0aDsc87/img/image-4031@2x.png"
                />

                {/* Content Container */}
                <div className="flex flex-col w-full max-w-[335px] gap-6 mt-6">
                    {/* Visit Us Section */}
                    <section className="flex flex-col gap-4 w-full">
                        <h2 className="[font-family:'Poppins',Helvetica] font-bold text-[#8b92de] text-2xl tracking-[0] leading-[normal]">
                            Visit us
                        </h2>

                        <address className="[font-family:'Poppins',Helvetica] font-normal text-white text-base tracking-[0] leading-6 not-italic">
                            {contactInfo.address}
                        </address>
                    </section>

                    {/* Contact Section */}
                    <section className="flex flex-col gap-4 w-full">
                        <h2 className="[font-family:'Poppins',Helvetica] font-bold text-[#9eadf7] text-2xl tracking-[0] leading-[normal]">
                            Contact
                        </h2>

                        <div className="flex flex-col gap-3 w-full">
                            {/* Email Row */}
                            <div className="flex items-center justify-between w-full gap-2">
                                <button
                                    onClick={handleEmailClick}
                                    className="[font-family:'Inter',Helvetica] font-normal text-white text-base tracking-[0] leading-6 hover:underline cursor-pointer transition-all duration-200 hover:text-blue-400 flex-1 text-left"
                                >
                                    {contactInfo.email}
                                </button>
                                <button
                                    onClick={() => copyToClipboard(contactInfo.email, "Email")}
                                    className="flex items-center justify-center w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 transition-all duration-200 flex-shrink-0"
                                    aria-label="Copy email"
                                >
                                    <svg
                                        className="w-4 h-4 text-white"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                                        />
                                    </svg>
                                </button>
                            </div>

                            {/* Phone Row */}
                            <div className="flex items-center justify-between w-full gap-2">
                                <button
                                    onClick={handlePhoneClick}
                                    className="[font-family:'Inter',Helvetica] font-normal text-white text-base tracking-[0] leading-6 hover:underline cursor-pointer transition-all duration-200 hover:text-green-400 flex-1 text-left"
                                >
                                    {contactInfo.phone}
                                </button>
                                <button
                                    onClick={() => copyToClipboard(contactInfo.phone, "Phone number")}
                                    className="flex items-center justify-center w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 transition-all duration-200 flex-shrink-0"
                                    aria-label="Copy phone number"
                                >
                                    <svg
                                        className="w-4 h-4 text-white"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                                        />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </section>
                </div>
            </main>

            {/* Copy Message Toast */}
            {copyMessage && (
                <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 animate-fade-in">
                    <div className="bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg font-medium">
                        {copyMessage}
                    </div>
                </div>
            )}


        </div>
    );
}
