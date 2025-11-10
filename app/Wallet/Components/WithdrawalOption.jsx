import React, { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import ServiceCard from './ServiceCard';
import { MoneyTransfer } from './MoneyTransfer';
import { Charity } from './Charity';
import { DebitTransfer } from './DebitTransfer';
import { Card } from './Card';
import { getTremendousMethods, getTremendousFundingSources } from '../../../lib/api';

const SCALE_CONFIG = [
    { minWidth: 0, scaleClass: "scale-90" },
    { minWidth: 320, scaleClass: "scale-90" },
    { minWidth: 375, scaleClass: "scale-100" },
    { minWidth: 480, scaleClass: "scale-125" },
    { minWidth: 640, scaleClass: "scale-120" },
    { minWidth: 768, scaleClass: "scale-150" },
    { minWidth: 1024, scaleClass: "scale-175" },
    { minWidth: 1280, scaleClass: "scale-200" },
    { minWidth: 1536, scaleClass: "scale-225" },
];

const SERVICE_CARDS = [
    {
        id: 1,
        innerBgColor: "bg-[#B9780E4D]",
        image: "/moeny1.png",
        title: "Money Transfer",
        description: null,
        hasDescription: true,
    },
    {
        id: 3,
        innerBgColor: "bg-gradient-to-br from-[#34a8533d] to-[#34a85324]",
        image: "/moeny2.png",
        title: "Donation and Charity",
        description: null,
        hasDescription: false,
    },
    {
        id: 4,
        innerBgColor: "bg-gradient-to-br from-[#1b47f73d] to-[#1b4ef724]",
        image: "/Money4.png",
        title: "Virtual\nDebit Card",
        description: null,
        hasDescription: false,
    },
    {
        id: 5,
        innerBgColor: "bg-gradient-to-br from-[#2666a796] to-[#581fd424]",
        image: "/moeny5.png",
        title: "Gift Card",
        description: null,
        hasDescription: false,
    },
];

export const WithdrawalOption = () => {
    // Modal state
    const [currentScaleClass, setCurrentScaleClass] = useState("scale-100");
    const [isMoneyTransferModalOpen, setIsMoneyTransferModalOpen] = useState(false);
    const [isCharityModalOpen, setIsCharityModalOpen] = useState(false);
    const [isDebitTransferModalOpen, setIsDebitTransferModalOpen] = useState(false);
    const [isCardModalOpen, setIsCardModalOpen] = useState(false);
    const [isInsufficientBalanceModalOpen, setIsInsufficientBalanceModalOpen] = useState(false);


    const [allPayoutMethods, setAllPayoutMethods] = useState([]);
    const [allFundingSources, setAllFundingSources] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [token, setToken] = useState(null);

    // Redux state
    const walletScreen = useSelector((state) => state?.walletTransactions?.walletScreen || {}, (left, right) => {
        return JSON.stringify(left) === JSON.stringify(right);
    });

    // Constants - Use coins directly without USD conversion
    const coinBalance = walletScreen?.wallet?.balance || 0;
    const MINIMUM_WITHDRAWAL_COINS = 20; // 20 coins = $2 USD (10:1 ratio)

    const getScaleClass = useCallback((width) => {
        for (let i = SCALE_CONFIG.length - 1; i >= 0; i--) {
            if (width >= SCALE_CONFIG[i].minWidth) {
                return SCALE_CONFIG[i].scaleClass;
            }
        }
        return "scale-100";
    }, []);

    useEffect(() => {
        const updateScale = () => {
            setCurrentScaleClass(getScaleClass(window.innerWidth));
        };
        updateScale();

        window.addEventListener('resize', updateScale);
        return () => window.removeEventListener('resize', updateScale);
    }, [getScaleClass]);

    // Load authentication token
    useEffect(() => {
        const authToken = localStorage.getItem('authToken');
        const fallbackToken = localStorage.getItem('token');
        const validToken = authToken || fallbackToken;

        if (validToken && validToken.length > 10) {
            setToken(validToken);

            // Preload withdrawal data immediately when token is available
            console.log("🚀 [WithdrawalOption] Preloading withdrawal data");
        } else {
            setError("Invalid authentication token. Please log in again.");
            setLoading(false);
        }
    }, []);

    // Load payout methods and funding sources with instant UI
    useEffect(() => {
        const loadPayoutData = async () => {
            if (!token) {
                setLoading(false);
                setError("Authentication required. Please log in.");
                return;
            }

            // Don't show loading state - show UI immediately
            setLoading(false);
            setError(null);

            try {
                // Load data in background without blocking UI
                const [methodsResult, fundingResult] = await Promise.all([
                    getTremendousMethods(token),
                    getTremendousFundingSources(token)
                ]);

                if (methodsResult.success && methodsResult.data?.methods) {
                    setAllPayoutMethods(methodsResult.data.methods);
                }

                if (fundingResult.success && fundingResult.data?.funding_sources) {
                    setAllFundingSources(fundingResult.data.funding_sources);
                }

            } catch (err) {
                // Only show error if both requests fail
                console.warn("Withdrawal data loading failed:", err);
                // Don't show error to user - let them try withdrawal options
            }
        };

        loadPayoutData();
    }, [token]);

    const handleWithdrawOption = (option) => {
        if (coinBalance < MINIMUM_WITHDRAWAL_COINS) {
            setIsInsufficientBalanceModalOpen(true);
            return;
        }

        switch (option.id) {
            case 1:
                setIsMoneyTransferModalOpen(true);
                break;
            case 3:
                setIsCharityModalOpen(true);
                break;
            case 4:
                setIsDebitTransferModalOpen(true);
                break;
            case 5:
                setIsCardModalOpen(true);
                break;
            default:
                break;
        }
    };

    const handleCloseMoneyTransferModal = () => {
        setIsMoneyTransferModalOpen(false);
    };

    const handleCloseCharityModal = () => {
        setIsCharityModalOpen(false);
    };

    const handleCloseDebitTransferModal = () => {
        setIsDebitTransferModalOpen(false);
    };

    const handleCloseCardModal = () => {
        setIsCardModalOpen(false);
    };

    const handlePlayToEarnMore = () => {
        setIsInsufficientBalanceModalOpen(false);
        // TODO: Navigate to games or earning section
    };

    const handleCloseInsufficientBalanceModal = () => {
        setIsInsufficientBalanceModalOpen(false);
    };

    // Filter methods for each category (US only)
    const getMethodsForCategory = (category) => {
        if (!allPayoutMethods.length) return [];

        return allPayoutMethods.filter(method => {
            // Check if it's a US method
            const isUSMethod = method.currency === 'USD' &&
                (method.countries?.includes('US') ||
                    method.countries?.includes('USA') ||
                    method.country === 'US' ||
                    method.country === 'USA' ||
                    !method.countries);

            if (!isUSMethod) return false;

            // Check category match
            switch (category) {
                case 'cash':
                    return ['paypal', 'ach', 'venmo', 'cash_app'].includes(method.category);
                case 'charity':
                    return method.category === 'charity';
                case 'prepaid_cards':
                    return method.category === 'visa_card';
                case 'gift_cards':
                    return method.category === 'merchant_card';
                default:
                    return false;
            }
        });
    };

    return (
        <div className="flex w-full justify-center items-center ">
            <div className="w-full p-4 ">
                <div className="flex flex-col items-center justify-start">
                    <h3 className="font-semibold text-[#f4f3fc] text-[16px] mb-2 w-full max-w-[335px] text-left">Withdrawal Options</h3>
                    <div className="w-full max-w-[335px] h-[53px] mb-4">
                        <div
                            className="relative w-full h-[53px] rounded-[8px] p-[1px]"
                        >
                            <div className="relative w-full h-full rounded-[8px] opacity-[100%] bg-[#1F1F1F] border border-[#3C3C3C] flex items-center px-4">
                                <div className="flex items-center gap-1 flex-1">
                                    <span className="[font-family:'Poppins',Helvetica] font-normal text-[#A4A4A4] text-[13px] tracking-[0] leading-[normal]">
                                        Withdrawal can be done 20
                                    </span>
                                    <img
                                        className="w-[23px] h-6 aspect-[0.97]"
                                        alt="Dollar icon"
                                        src="/dollor.png"
                                    />
                                    <span className="[font-family:'Poppins',Helvetica] font-normal text-neutral-400 text-[13px] tracking-[0] leading-[normal]">
                                        above only
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div
                    className={`
                    flex 
                    overflow-x-auto 
                    snap-x snap-mandatory
                    gap-3
                    pb-2
                    ${currentScaleClass} 
                    transition-transform duration-200 ease-in-out 
                    scrollbar-hide
                    scroll-smooth
                    px-4
                `}
                    style={{
                        scrollbarWidth: 'none',
                        msOverflowStyle: 'none',
                        WebkitOverflowScrolling: 'touch',
                        scrollBehavior: 'smooth'
                    }}
                >
                    {error ? (
                        <div className="flex flex-col items-center justify-center w-full h-20 text-red-400 text-sm px-4">
                            <p className="text-center">{error}</p>
                            <button
                                onClick={() => window.location.reload()}
                                className="mt-2 px-3 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700 transition-colors"
                            >
                                Retry
                            </button>
                        </div>
                    ) : (
                        SERVICE_CARDS.map((card) => (
                            <div
                                key={card.id}
                                onClick={() => handleWithdrawOption(card)}
                                className="flex-shrink-0 cursor-pointer hover:opacity-80 transition-opacity duration-200 snap-center focus:outline-none focus:ring-2 focus:ring-[#8B5CF6] focus:ring-opacity-50 rounded-lg"
                                style={{ minWidth: '90px', maxWidth: '90px' }}
                                role="button"
                                tabIndex={0}
                                aria-label={`Select ${card.title} withdrawal option`}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' || e.key === ' ') {
                                        e.preventDefault();
                                        handleWithdrawOption(card);
                                    }
                                }}
                            >
                                <ServiceCard card={card} />
                            </div>
                        ))
                    )}
                </div>

                {/* Money Transfer Modal */}
                {token && (
                    <MoneyTransfer
                        isOpen={isMoneyTransferModalOpen}
                        onClose={handleCloseMoneyTransferModal}
                        methods={getMethodsForCategory('cash')}
                        fundingSources={allFundingSources}
                        token={token}
                    />
                )}

                {/* Charity Modal */}
                {token && (
                    <Charity
                        isOpen={isCharityModalOpen}
                        onClose={handleCloseCharityModal}
                        methods={getMethodsForCategory('charity')}
                        fundingSources={allFundingSources}
                        token={token}
                    />
                )}

                {/* Debit Transfer Modal */}
                {token && (
                    <DebitTransfer
                        isOpen={isDebitTransferModalOpen}
                        onClose={handleCloseDebitTransferModal}
                        methods={getMethodsForCategory('prepaid_cards')}
                        fundingSources={allFundingSources}
                        token={token}
                    />
                )}

                {/* Card Modal */}
                {token && (
                    <Card
                        isOpen={isCardModalOpen}
                        onClose={handleCloseCardModal}
                        methods={getMethodsForCategory('gift_cards')}
                        fundingSources={allFundingSources}
                        token={token}
                    />
                )}

                {isInsufficientBalanceModalOpen && (
                    <div
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-md transition-all duration-300"
                        style={{ backdropFilter: 'blur(12px)' }}
                    >
                        <div className="bg-black border border-[#4A4A4A] rounded-[16px] p-6 mx-4 max-w-sm w-full shadow-2xl shadow-purple-500/20 transition-all duration-300">
                            <div className="flex flex-col items-center ">
                                {/* Image at the top, 3x original size */}
                                <img
                                    src="/bodtdollor.png"
                                    alt=""
                                    width={240}
                                    height={240}
                                    className="mx-auto"
                                    style={{ objectFit: "contain", width: "240px", height: "200px" }}
                                />
                                {/* Text immediately below the image, with no gap */}
                                <p className="text-[#A4A4A4] text-sm mt-0 mb-4 text-center">
                                    Withdrawal can be done $20 above only
                                </p>
                                <div className="flex w-full">
                                    <button
                                        onClick={handlePlayToEarnMore}
                                        className="w-full px-4 py-2 bg-gradient-to-r from-[#8B5CF6] to-[#A855F7] text-white rounded-lg text-sm font-medium hover:opacity-90 transition-opacity shadow-lg hover:shadow-xl hover:shadow-purple-500/30"
                                    >
                                        Okay Got it
                                    </button>
                                </div>

                            </div>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
};