import React, { useState } from "react";

export const RulesModal = ({ isVisible, onClose }) => {
    const handleConfirm = () => {
        onClose();
    };

    if (!isVisible) {
        return null;
    }

    return (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
            <div
                className="flex flex-col w-[335px] mb-60 h-[315px] items-start pt-5 pb-0 px-0 relative bg-black rounded-[20px] border-t [border-top-style:solid] border-r [border-right-style:solid] border-l [border-left-style:solid] border-[#595959] -mt-16"
                data-model-id="2549:6803"
                role="dialog"
                aria-labelledby="modal-title"
                aria-describedby="modal-description"
            >
                <header className="flex items-start justify-between pt-2 pb-0 px-4 relative self-stretch w-full flex-[0_0_auto] bg-black border-r [border-right-style:solid] border-l [border-left-style:solid] border-[#595959]">
                    <div className="relative w-[219px] h-6">
                        <h1
                            id="modal-title"
                            className="absolute top-0 left-0 [font-family:'Poppins',Helvetica] font-semibold text-white text-base tracking-[0] leading-[normal]"
                        >
                            Rules for claiming rewards
                        </h1>
                    </div>

                    <button
                        onClick={onClose}
                        className="relative flex-[0_0_auto] cursor-pointer hover:opacity-80 transition-opacity"
                        aria-label="Close dialog"
                    >
                        <img
                            alt="Close"
                            src="https://c.animaapp.com/2Z6cRMoo/img/close.svg"
                        />
                    </button>
                </header>

                <main className="flex flex-col h-64 items-start gap-6 px-4 py-5 relative self-stretch w-full bg-black rounded-[0px_0px_20px_20px] border-r [border-right-style:solid] border-b [border-bottom-style:solid] border-l [border-left-style:solid] border-[#595959]">
                    <div className="relative w-[305px] h-36 mr-[-2.00px]">
                        <p
                            id="modal-description"
                            className="absolute top-0 left-0 w-[303px] [font-family:'Poppins',Helvetica] font-normal text-white text-base tracking-[0] leading-6"
                        >
                            Once you reach this level, you&apos;ll be eligible to end this
                            session and transfer your collected coins and XP to your wallet.
                            After claiming, you won&apos;t be able to return to this game&apos;s
                            reward flow. Choose wisely
                        </p>
                    </div>

                    <button
                        onClick={handleConfirm}
                        className="relative self-stretch w-full h-10 rounded-lg overflow-hidden bg-[linear-gradient(180deg,rgba(158,173,247,1)_0%,rgba(113,106,231,1)_100%)] cursor-pointer hover:opacity-90 transition-opacity focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50"
                    >
                        <span className="absolute top-2.5 left-[107px] w-[91px] [font-family:'Poppins',Helvetica] font-semibold text-white text-sm text-center tracking-[0] leading-[normal] whitespace-nowrap">
                            Okay, Got It!
                        </span>
                    </button>
                </main>
            </div>
        </div>
    );
};
