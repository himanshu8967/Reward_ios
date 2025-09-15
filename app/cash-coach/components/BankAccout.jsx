import React from "react";

export const BankAccount = () => {
    const linkedAccounts = [
        {
            id: 1,
            name: "PayPal",
            icon: "https://c.animaapp.com/PJ6RS4Zo/img/logos-paypal.svg",
            bgColor: "#27346a3d",
            innerBgColor: "#27346a24",
            iconSize: "w-10 h-10",
        },
        {
            id: 2,
            name: "Google Pay",
            icon: "https://c.animaapp.com/PJ6RS4Zo/img/logos-paypal-1.svg",
            bgColor: "#34a8533d",
            innerBgColor: "#34a85324",
            iconSize: "w-[50px] h-10",
        },
        {
            id: 3,
            name: "Revolut",
            icon: "https://c.animaapp.com/PJ6RS4Zo/img/image-3955@2x.png",
            bgColor: "#01a6f933",
            innerBgColor: "#128fcd33",
            iconSize: "w-[34px] h-[34px]",
            isImage: true,
        },
    ];

    return (
        <section
            // Using max-w-sm for consistent centering and responsive width. Height is now automatic.
            className="flex flex-col  mb-24 w-full max-w-sm items-start p-4 gap-2.5"
            role="region"
            aria-labelledby="linked-accounts-heading"
        >
            <header className="flex w-full items-center justify-between">
                <h2
                    id="linked-accounts-heading"
                    className="[font-family:'Poppins',Helvetica] font-semibold text-[#f4f3fc] text-[16px] tracking-[0] leading-[normal]"
                >
                    Linked Accounts
                </h2>
                <button
                    className="[font-family:'Poppins',Helvetica] font-medium text-[#8b92df] text-[16px] tracking-[0] leading-[normal] hover:opacity-80"
                    aria-label="View all linked accounts"
                >
                    See All
                </button>
            </header>

            <p className="self-stretch [font-family:'Poppins',Helvetica] font-normal text-[#f4f3fc]  text-[13px] tracking-[0] leading-[normal]">
                Set your goals &amp; finish them the way you prefer.
            </p>

            {/* This container handles the horizontal scrolling */}
            <div
                className="flex w-full items-start gap-4 overflow-x-auto pb-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
                role="list"
                aria-label="Linked payment accounts"
            >
                {linkedAccounts.map((account) => (
                    // Card container: flex-shrink-0 prevents it from squishing
                    <div
                        key={account.id}
                        className="relative w-[83px] h-[88px] rounded-[8px] flex-shrink-0"
                        role="listitem"
                    >
                        {/* The background glow effect */}
                        <div className="absolute inset-0 rounded-[8px] blur-[14.5px]" style={{ backgroundColor: account.bgColor }}></div>

                        {/* The main content, now a flex container */}
                        <div
                            className="relative w-full h-full rounded-[8px] flex flex-col items-center justify-center gap-1 p-2"
                            style={{ backgroundColor: account.innerBgColor }}
                        >
                            <img
                                className={`${account.iconSize} object-contain ${account.isImage ? "mix-blend-luminosity" : ""}`}
                                alt={`${account.name} logo`}
                                src={account.icon}
                            />
                            <span className="[font-family:'Libre_Franklin',Helvetica] font-bold text-[#b6b6b6] text-xs tracking-[0] leading-[normal]">
                                {account.name}
                            </span>
                        </div>
                    </div>
                ))}

                {/* --- "Add New" Button Refactored with Flexbox --- */}
                <div className="relative w-[78px] h-[88px] rounded-[8px] flex-shrink-0">
                    {/* Background glow */}
                    <div className="absolute inset-0 rounded-[8px] blur-[14.5px] bg-[#27346a3d]"></div>

                    {/* Main button content */}
                    <button
                        className="relative w-full h-full bg-[#27346a24] rounded-[8pxS] flex flex-col items-center justify-center gap-1 p-2 hover:bg-[#27346a40] transition-colors"
                        aria-label="Add new payment account"
                    >
                        <img
                            className="w-5 h-5"
                            alt="Add icon"
                            src="https://c.animaapp.com/PJ6RS4Zo/img/plus.svg"
                        />
                        <span className="[font-family:'Libre_Franklin',Helvetica] font-bold text-[#b6b6b6] text-xs tracking-[0] leading-[normal]">
                            Add
                        </span>
                    </button>
                </div>
            </div>
        </section>
    );
};