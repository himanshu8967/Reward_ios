"use client";
import React from "react";

/**
 * PrivacyPolicy Component
 * 
 * Reusable component for displaying privacy policy content:
 * - Scrollable legal content
 * - Mobile-optimized layout
 * - Configurable display options
 * 
 * @param {function} onBack - Handler for back button
 * @param {boolean} showHeader - Whether to show header section
 * @param {boolean} showHomeIndicator - Whether to show home indicator
 * @param {string} title - Custom title for the policy
 * @param {Array} sections - Custom policy sections
 */
export const PrivacyPolicy = ({
    onBack,
    showHeader = true,
    showHomeIndicator = true,
    title = "Privacy Policy",
    sections = null
}) => {
    // Default policy content
    const defaultSections = [
        {
            number: 1,
            content: "By using this software/platform, you agree to the following terms and conditions. This agreement governs your use of our services and establishes the legal framework for your interaction with our platform."
        },
        {
            number: 2,
            content: "You are responsible for maintaining the confidentiality of your account credentials. You must not share your password or allow unauthorized access to your account. Any activities that occur under your account are your responsibility."
        },
        {
            number: 3,
            content: "You agree not to use the platform for any unauthorized or illegal activities. This includes but is not limited to: attempting to gain unauthorized access to other accounts, distributing malicious software, or violating any applicable laws or regulations."
        },
        {
            number: 4,
            content: "You may not:",
            subsections: [
                "Transfer, sell, or sublicense your rights to use this software to any third party",
                "Modify, adapt, or create derivative works based on the software without explicit permission",
                "Reverse engineer, decompile, or disassemble the software",
                "Remove or alter any proprietary notices or labels on the software",
                "Use the software in any way that could damage, disable, or impair the platform",
                "Attempt to gain unauthorized access to any part of the platform or its related systems"
            ]
        },
        {
            number: 5,
            content: "We reserve the right to modify these terms at any time. Continued use of the platform after changes constitutes acceptance of the new terms. We will notify users of significant changes through appropriate channels."
        },
        {
            number: 6,
            content: "The platform is provided \"as is\" without warranties of any kind. We do not guarantee uninterrupted access or error-free operation. Users acknowledge that they use the platform at their own risk."
        },
        {
            number: 7,
            content: "We collect and process personal information in accordance with applicable privacy laws. By using our services, you consent to the collection and use of your information as described in our Privacy Policy."
        },
        {
            number: 8,
            content: "Violation of these terms may result in immediate termination of your account and access to the platform. We reserve the right to take appropriate legal action to protect our rights and interests."
        },
        {
            number: 9,
            content: "These terms are governed by the laws of the jurisdiction in which our company is incorporated. Any disputes arising from these terms will be resolved through binding arbitration."
        },
        {
            number: 10,
            content: "If any provision of these terms is found to be unenforceable, the remaining provisions will continue to be valid and enforceable. This agreement constitutes the entire agreement between you and our company."
        }
    ];

    const policySections = sections || defaultSections;

    return (
        <div className="relative w-full min-h-screen bg-black">
            {/* Header */}
            {showHeader && (
                <header className="absolute top-0 left-0 w-full h-11 bg-[url(https://c.animaapp.com/A0aDsc87/img/iphone-x--11-pro---black.svg)] bg-[100%_100%]" />
            )}

            {/* Navigation */}
            {showHeader && (
                <nav className="flex flex-col w-full items-start gap-2 px-5 py-3 absolute top-[54px] left-0">
                    <div className="flex items-center gap-4 relative self-stretch w-full flex-[0_0_auto] rounded-[32px]">
                        {onBack && (
                            <button
                                onClick={onBack}
                                className="relative w-6 h-6 cursor-pointer hover:opacity-80 transition-opacity duration-200"
                                aria-label="Go back"
                                type="button"
                            >
                                <img
                                    className="w-full h-full"
                                    alt=""
                                    src="https://c.animaapp.com/A0aDsc87/img/arrow-back-ios-new@2x.png"
                                />
                            </button>
                        )}

                        <h1 className="relative w-[271px] [font-family:'Poppins',Helvetica] font-semibold text-white text-xl tracking-[0] leading-5">
                            {title}
                        </h1>
                    </div>
                </nav>
            )}

            {/* App Version */}
            {showHeader && (
                <div className="absolute top-[38px] left-5 [font-family:'Poppins',Helvetica] font-normal text-[#A4A4A4] text-[10px] tracking-[0] leading-3 whitespace-nowrap">
                    App Version: {process.env.NEXT_PUBLIC_APP_VERSION || "V0.0.1"}
                </div>
            )}

            {/* Main Content - Scrollable */}
            <main className={`absolute ${showHeader ? 'top-[122px]' : 'top-0'} left-5 right-5 bottom-0 overflow-y-auto scrollbar-hide`}>
                <div className="w-full max-w-[335px] mx-auto">
                    <div className="[font-family:'Poppins',Helvetica] font-normal text-white text-sm tracking-[0] leading-6 space-y-4">
                        {policySections.map((section, index) => (
                            <div key={index}>
                                <p className="mb-4">
                                    {section.number}. {section.content}
                                </p>
                                {section.subsections && (
                                    <div className="ml-4 space-y-2">
                                        {section.subsections.map((subsection, subIndex) => (
                                            <p key={subIndex} className="mb-2">
                                                {String.fromCharCode(97 + subIndex)}) {subsection}
                                            </p>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}

                        {/* Contact Information */}
                        <div className="mt-8 pt-4 border-t border-gray-600">
                            <p className="text-gray-400 text-xs">
                                For questions about this Privacy Policy, please contact us at:
                                <span className="text-white"> privacy@company.com</span>
                            </p>
                            <p className="text-gray-400 text-xs mt-2">
                                Last updated: {new Date().toLocaleDateString()}
                            </p>
                        </div>
                    </div>
                </div>
            </main>

            {/* Home Indicator */}
            {showHomeIndicator && (
                <div className="fixed left-0 bottom-[9px] w-full h-[27px]">
                    <div className="absolute top-px left-0 w-full h-[26px] bg-black" />
                    <div className="absolute top-[calc(50.00%_+_2px)] left-[calc(50.00%_-_68px)] w-[135px] h-[5px] bg-white rounded-[100px]" />
                </div>
            )}

            <style jsx>{`
                .scrollbar-hide {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
                .scrollbar-hide::-webkit-scrollbar {
                    display: none;
                }
            `}</style>
        </div>
    );
};
