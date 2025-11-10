"use client";
import React from "react";
import { useRouter } from "next/navigation";

export default function PrivacyPolicyPage() {
    const router = useRouter();

    const handleBackClick = () => {
        router.back();
    };

    return (
        <div className="w-full min-h-screen bg-black">
            <div className="w-full max-w-[335px] mx-auto mt-2 ">
                <div className="[font-family:'Poppins',Helvetica] ml-3 font-normal text-[#A4A4A4] text-[10px] tracking-[0] leading-3">
                    App Version: {process.env.NEXT_PUBLIC_APP_VERSION || "V0.0.1"}
                </div>
            </div>
            {/* Header Section */}
            <div className="px-5 py-4 bg-black mt-3">
                <div className="flex items-center gap-5 w-full max-w-[335px] mx-auto">
                    <button
                        onClick={handleBackClick}
                        className="relative w-6 h-6  cursor-pointer hover:opacity-80 transition-opacity duration-200"
                        aria-label="Go back"
                        type="button"
                    >
                        <img
                            className="w-full h-full mt-[1px]"
                            alt=""
                            src="https://c.animaapp.com/A0aDsc87/img/arrow-back-ios-new@2x.png"
                        />
                    </button>

                    <h1 className="[font-family:'Poppins',Helvetica] font-semibold text-white text-xl tracking-[0] leading-5">
                        Privacy Policy
                    </h1>

                    <div className="w-6 h-6"></div> {/* Spacer for centering */}
                </div>


            </div>

            {/* Main Content - Scrollable */}
            <main className="px-5 py-6 pb-20">
                <div className="w-full max-w-[335px] mx-auto">
                    <div className="[font-family:'Poppins',Helvetica] font-normal text-white text-sm tracking-[0] leading-6 space-y-4">
                        {/* Section 1 */}
                        <div>
                            <p className="mb-4">
                                1. By using this software/platform, you agree to the following terms and conditions.
                                This agreement governs your use of our services and establishes the legal framework
                                for your interaction with our platform.
                            </p>
                        </div>

                        {/* Section 2 */}
                        <div>
                            <p className="mb-4">
                                2. You are responsible for maintaining the confidentiality of your account credentials.
                                You must not share your password or allow unauthorized access to your account.
                                Any activities that occur under your account are your responsibility.
                            </p>
                        </div>

                        {/* Section 3 */}
                        <div>
                            <p className="mb-4">
                                3. You agree not to use the platform for any unauthorized or illegal activities.
                                This includes but is not limited to: attempting to gain unauthorized access to
                                other accounts, distributing malicious software, or violating any applicable laws
                                or regulations.
                            </p>
                        </div>

                        {/* Section 4 */}
                        <div>
                            <p className="mb-4">
                                4. You may not:
                            </p>
                            <div className="ml-4 space-y-2">
                                <p className="mb-2">
                                    a) Transfer, sell, or sublicense your rights to use this software to any third party
                                </p>
                                <p className="mb-2">
                                    b) Modify, adapt, or create derivative works based on the software without explicit permission
                                </p>
                                <p className="mb-2">
                                    c) Reverse engineer, decompile, or disassemble the software
                                </p>
                                <p className="mb-2">
                                    d) Remove or alter any proprietary notices or labels on the software
                                </p>
                                <p className="mb-2">
                                    e) Use the software in any way that could damage, disable, or impair the platform
                                </p>
                                <p className="mb-2">
                                    f) Attempt to gain unauthorized access to any part of the platform or its related systems
                                </p>
                            </div>
                        </div>

                        {/* Additional Sections */}
                        <div>
                            <p className="mb-4">
                                5. We reserve the right to modify these terms at any time. Continued use of the
                                platform after changes constitutes acceptance of the new terms. We will notify
                                users of significant changes through appropriate channels.
                            </p>
                        </div>

                        <div>
                            <p className="mb-4">
                                6. The platform is provided "as is" without warranties of any kind. We do not
                                guarantee uninterrupted access or error-free operation. Users acknowledge that
                                they use the platform at their own risk.
                            </p>
                        </div>

                        <div>
                            <p className="mb-4">
                                7. We collect and process personal information in accordance with applicable
                                privacy laws. By using our services, you consent to the collection and use of
                                your information as described in our Privacy Policy.
                            </p>
                        </div>

                        <div>
                            <p className="mb-4">
                                8. Violation of these terms may result in immediate termination of your account
                                and access to the platform. We reserve the right to take appropriate legal
                                action to protect our rights and interests.
                            </p>
                        </div>

                        <div>
                            <p className="mb-4">
                                9. These terms are governed by the laws of the jurisdiction in which our company
                                is incorporated. Any disputes arising from these terms will be resolved through
                                binding arbitration.
                            </p>
                        </div>

                        <div>
                            <p className="mb-4">
                                10. If any provision of these terms is found to be unenforceable, the remaining
                                provisions will continue to be valid and enforceable. This agreement constitutes
                                the entire agreement between you and our company.
                            </p>
                        </div>

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

        </div>
    );
}
