import React, { useState, useRef, useEffect } from "react";
import { useRealTimeCountdown } from "../hooks/useRealTimeCountdown";

// The SVG for the "Welcome Offer" label, converted to a reusable JSX component.
const WelcomeOfferLabel = () => (
  <svg
    width="104"
    height="24"
    viewBox="0 0 104 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M0 0L104 0V20C104 22.2091 102.209 24 100 24L4 24C1.79086 24 0 22.2091 0 20L0 0Z"
      fill="url(#paint0_linear_2472_7795)"
      fillOpacity="0.3"
    />
    <path
      d="M103.5 0.5V20C103.5 21.933 101.933 23.5 100 23.5L4 23.5C2.06701 23.5 0.500001 21.933 0.5 20L0.5 0.5L103.5 0.5Z"
      stroke="white"
      strokeOpacity="0.2"
    />
    <path
      d="M18.024 7.624L15.684 16H13.704L12.132 10.036L10.488 16L8.52 16.012L6.264 7.624H8.064L9.54 14.128L11.244 7.624H13.116L14.724 14.092L16.212 7.624H18.024ZM25.301 12.532C25.301 12.772 25.285 12.988 25.253 13.18H20.393C20.433 13.66 20.601 14.036 20.897 14.308C21.193 14.58 21.557 14.716 21.989 14.716C22.613 14.716 23.057 14.448 23.321 13.912H25.133C24.941 14.552 24.573 15.08 24.029 15.496C23.485 15.904 22.817 16.108 22.025 16.108C21.385 16.108 20.809 15.968 20.297 15.688C19.793 15.4 19.397 14.996 19.109 14.476C18.829 13.956 18.689 13.356 18.689 12.676C18.689 11.988 18.829 11.384 19.109 10.864C19.389 10.344 19.781 9.944 20.285 9.664C20.789 9.384 21.369 9.244 22.025 9.244C22.657 9.244 23.221 9.38 23.717 9.652C24.221 9.924 24.609 10.312 24.881 10.816C25.161 11.312 25.301 11.884 25.301 12.532ZM23.561 12.052C23.553 11.62 23.397 11.276 23.093 11.02C22.789 10.756 22.417 10.624 21.977 10.624C21.561 10.624 21.209 10.752 20.921 11.008C20.641 11.256 20.469 11.604 20.405 12.052H23.561ZM28.2072 7.12V16H26.5272V7.12H28.2072ZM29.4351 12.676C29.4351 11.988 29.5751 11.388 29.8551 10.876C30.1351 10.356 30.5231 9.956 31.0191 9.676C31.5151 9.388 32.0831 9.244 32.7231 9.244C33.5471 9.244 34.2271 9.452 34.7631 9.868C35.3071 10.276 35.6711 10.852 35.8551 11.596H34.0431C33.9471 11.308 33.7831 11.084 33.5511 10.924C33.3271 10.756 33.0471 10.672 32.7111 10.672C32.2311 10.672 31.8511 10.848 31.5711 11.2C31.2911 11.544 31.1511 12.036 31.1511 12.676C31.1511 13.308 31.2911 13.8 31.5711 14.152C31.8511 14.496 32.2311 14.668 32.7111 14.668C33.3911 14.668 33.8351 14.364 34.0431 13.756H35.8551C35.6711 14.476 35.3071 15.048 34.7631 15.472C34.2191 15.896 33.5391 16.108 32.7231 16.108C32.0831 16.108 31.5151 15.968 31.0191 15.688C30.5231 15.4 30.1351 15 29.8551 14.488C29.5751 13.968 29.4351 13.364 29.4351 12.676ZM40.0378 16.108C39.3978 16.108 38.8218 15.968 38.3098 15.688C37.7978 15.4 37.3938 14.996 37.0978 14.476C36.8098 13.956 36.6658 13.356 36.6658 12.676C36.6658 11.996 36.8138 11.396 37.1098 10.876C37.4138 10.356 37.8258 9.956 38.3458 9.676C38.8658 9.388 39.4458 9.244 40.0858 9.244C40.7258 9.244 41.3058 9.388 41.8258 9.676C42.3458 9.956 42.7538 10.356 43.0498 10.876C43.3538 11.396 43.5058 11.996 43.5058 12.676C43.5058 13.356 43.3498 13.956 43.0378 14.476C42.7338 14.996 42.3178 15.4 41.7898 15.688C41.2698 15.968 40.6858 16.108 40.0378 16.108ZM40.0378 14.644C40.3418 14.644 40.6258 14.572 40.8898 14.428C41.1618 14.276 41.3778 14.052 41.5378 13.756C41.6978 13.46 41.7778 13.1 41.7778 12.676C41.7778 12.044 41.6098 11.56 41.2738 11.224C40.9458 10.88 40.5418 10.708 40.0618 10.708C39.5818 10.708 39.1778 10.88 38.8498 11.224C38.5298 11.56 38.3698 12.044 38.3698 12.676C38.3698 13.308 38.5258 13.796 38.8378 14.14C39.1578 14.476 39.5578 14.644 40.0378 14.644ZM52.9942 9.256C53.8102 9.256 54.4662 9.508 54.9622 10.012C55.4662 10.508 55.7182 11.204 55.7182 12.1V16H54.0382V12.328C54.0382 11.808 53.9062 11.412 53.6422 11.14C53.3782 10.86 53.0182 10.72 52.5622 10.72C52.1062 10.72 51.7422 10.86 51.4702 11.14C51.2062 11.412 51.0742 11.808 51.0742 12.328V16H49.3942V12.328C49.3942 11.808 49.2622 11.412 48.9982 11.14C48.7342 10.86 48.3742 10.72 47.9182 10.72C47.4542 10.72 47.0862 10.86 46.8142 11.14C46.5502 11.412 46.4182 11.808 46.4182 12.328V16H44.7382V9.352H46.4182V10.156C46.6342 9.876 46.9102 9.656 47.2462 9.496C47.5902 9.336 47.9662 9.256 48.3742 9.256C48.8942 9.256 49.3582 9.368 49.7662 9.592C50.1742 9.808 50.4902 10.12 50.7142 10.528C50.9302 10.144 51.2422 9.836 51.6502 9.604C52.0662 9.372 52.5142 9.256 52.9942 9.256ZM63.4924 12.532C63.4924 12.772 63.4764 12.988 63.4444 13.18H58.5844C58.6244 13.66 58.7924 14.036 59.0884 14.308C59.3844 14.58 59.7484 14.716 60.1804 14.716C60.8044 14.716 61.2484 14.448 61.5124 13.912H63.3244C63.1324 14.552 62.7644 15.08 62.2204 15.496C61.6764 15.904 61.0084 16.108 60.2164 16.108C59.5764 16.108 59.0004 15.968 58.4884 15.688C57.9844 15.4 57.5884 14.996 57.3004 14.476C57.0204 13.956 56.8804 13.356 56.8804 12.676C56.8804 11.988 57.0204 11.384 57.3004 10.864C57.5804 10.344 57.9724 9.944 58.4764 9.664C58.9804 9.384 59.5604 9.244 60.2164 9.244C60.8484 9.244 61.4124 9.38 61.9084 9.652C62.4124 9.924 62.8004 10.312 63.0724 10.816C63.3524 11.312 63.4924 11.884 63.4924 12.532ZM61.7524 12.052C61.7444 11.62 61.5884 11.276 61.2844 11.02C60.9804 10.756 60.6084 10.624 60.1684 10.624C59.7524 10.624 59.4004 10.752 59.1124 11.008C58.8324 11.256 58.6604 11.604 58.5964 12.052H61.7524ZM71.466 16.084C70.682 16.084 69.962 15.9 69.306 15.532C68.65 15.164 68.13 14.656 67.746 14.008C67.362 13.352 67.17 12.612 67.17 11.788C67.17 10.972 67.362 10.24 67.746 9.592C68.13 8.936 68.65 8.424 69.306 8.056C69.962 7.688 70.682 7.504 71.466 7.504C72.258 7.504 72.978 7.688 73.626 8.056C74.282 8.424 74.798 8.936 75.174 9.592C75.558 10.24 75.75 10.972 75.75 11.788C75.75 12.612 75.558 13.352 75.174 14.008C74.798 14.656 74.282 15.164 73.626 15.532C72.97 15.9 72.25 16.084 71.466 16.084ZM71.466 14.584C71.97 14.584 72.414 14.472 72.798 14.248C73.182 14.016 73.482 13.688 73.698 13.264C73.914 12.84 74.022 12.348 74.022 11.788C74.022 11.228 73.914 10.74 73.698 10.324C73.482 9.9 73.182 9.576 72.798 9.352C72.414 9.128 71.97 9.016 71.466 9.016C70.962 9.016 70.514 9.128 70.122 9.352C69.738 9.576 69.438 9.9 69.222 10.324C69.006 10.74 68.898 11.228 68.898 11.788C68.898 12.348 69.006 12.84 69.222 13.264C69.438 13.688 69.738 14.016 70.122 14.248C70.514 14.472 70.962 14.584 71.466 14.584ZM80.0479 10.732H78.8839V16H77.1799V10.732H76.4239V9.352H77.1799V9.016C77.1799 8.2 77.4119 7.6 77.8759 7.216C78.3399 6.832 79.0399 6.652 79.9759 6.676V8.092C79.5679 8.084 79.2839 8.152 79.1239 8.296C78.9639 8.44 78.8839 8.7 78.8839 9.076V9.352H80.0479V10.732ZM84.1846 10.732H83.0206V16H81.3166V10.732H80.5606V9.352H81.3166V9.016C81.3166 8.2 81.5486 7.6 82.0126 7.216C82.4766 6.832 83.1766 6.652 84.1126 6.676V8.092C83.7046 8.084 83.4206 8.152 83.2606 8.296C83.1006 8.44 83.0206 8.7 83.0206 9.076V9.352H84.1846V10.732ZM91.4533 12.532C91.4533 12.772 91.4373 12.988 91.4053 13.18H86.5453C86.5853 13.66 86.7533 14.036 87.0493 14.308C87.3453 14.58 87.7093 14.716 88.1413 14.716C88.7653 14.716 89.2093 14.448 89.4733 13.912H91.2853C91.0933 14.552 90.7253 15.08 90.1813 15.496C89.6373 15.904 88.9693 16.108 88.1773 16.108C87.5373 16.108 86.9613 15.968 86.4493 15.688C85.9453 15.4 85.5493 14.996 85.2613 14.476C84.9813 13.956 84.8413 13.356 84.8413 12.676C84.8413 11.988 84.9813 11.384 85.2613 10.864C85.5413 10.344 85.9333 9.944 86.4373 9.664C86.9413 9.384 87.5213 9.244 88.1773 9.244C88.8093 9.244 89.3733 9.38 89.8693 9.652C90.3733 9.924 90.7613 10.312 91.0333 10.816C91.3133 11.312 91.4533 11.884 91.4533 12.532ZM89.7133 12.052C89.7053 11.62 89.5493 11.276 89.2453 11.02C88.9413 10.756 88.5693 10.624 88.1293 10.624C87.7133 10.624 87.3613 10.752 87.0733 11.008C86.7933 11.256 86.6213 11.604 86.5573 12.052H89.7133ZM94.3596 10.384C94.5756 10.032 94.8556 9.756 95.1996 9.556C95.5516 9.356 95.9516 9.256 96.3996 9.256V11.02H95.9556C95.4276 11.02 95.0276 11.144 94.7556 11.392C94.4916 11.64 94.3596 12.072 94.3596 12.688V16H92.6796V9.352H94.3596V10.384Z"
      fill="#FFBE6B"
    />
    <defs>
      <linearGradient
        id="paint0_linear_2472_7795"
        x1="50.7215"
        y1="35.1749"
        x2="41.5134"
        y2="-8.71253"
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor="#3A1371" />
        <stop offset="1" stopColor="#7F23CB" />
      </linearGradient>
    </defs>
  </svg>
);

export const WelcomeOffer = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const tooltipRef = useRef(null);

  // Use real-time countdown hook with 24-hour persistence
  const {
    formatTime,
    isExpired,
    isLoading,
    timeRemaining,
    resetTimer
  } = useRealTimeCountdown({
    defaultDuration: 24 * 60 * 60, // 24 hours in seconds
    persist: true,
    storageKey: 'welcomeOfferEndTime',
    autoReset: false // Don't auto reset when expired
  });

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  const toggleTooltip = () => {
    setShowTooltip(!showTooltip);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (tooltipRef.current && !tooltipRef.current.contains(event.target)) {
        setShowTooltip(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <>
      <div
        className={`relative w-full max-w-[375px] rounded-[20px] overflow-hidden bg-[linear-gradient(103deg,rgba(121,32,207,1)_0%,rgba(205,73,153,1)_80%)] transition-all duration-300 ${isExpanded ? "h-[330px]" : "h-[245px]"
          }`}
        data-model-id="4001:7472"
      >
        {/* --- ADDED THIS SECTION --- */}
        {/* This div positions the SVG label at the top-center of the component, as per the Figma design. */}
        <div className="absolute top-[-2px] left-1/2 -translate-x-1/2 z-10">
          <WelcomeOfferLabel />
        </div>
        {/* --- END OF ADDED SECTION --- */}

        <div className="absolute w-full h-[245px] top-0 left-0">
          <div className="absolute w-full h-[200px] top-0 left-0">
            <div className="absolute w-[196px] h-[85px] top-[61px] left-5">
              <div className="top-0 left-0 font-bold text-[#ffe664] text-[40px] leading-[48px] absolute [font-family:'Poppins',Helvetica] tracking-[0] whitespace-nowrap">
                Welcome
              </div>
              <div className="absolute w-[79px] h-[39px] top-[46px] left-0 rounded overflow-hidden bg-[linear-gradient(331deg,rgba(237,131,0,1)_0%,rgba(237,166,0,1)_100%)]">
                <div className="relative w-[70px] h-[39px]">
                  <img
                    className="absolute w-[61px] h-[39px] top-0 left-0"
                    alt="Clip path group"
                    src="https://c.animaapp.com/iuW6cMRd/img/clip-path-group@2x.png"
                  />

                  <div className="top-[7px] left-[7px] font-medium text-white text-xl leading-6 absolute [font-family:'Poppins',Helvetica] tracking-[0] whitespace-nowrap">
                    Bonus
                  </div>
                </div>
              </div>
            </div>

            <div className="top-[37px] left-5 font-medium text-white text-xl leading-6 absolute [font-family:'Poppins',Helvetica] tracking-[0] whitespace-nowrap">
              Claim your
            </div>
            <img
              className="absolute w-[109px] h-[109px] top-[45px] right-[15px] object-cover"
              alt="Png clipart buried"
              src="https://c.animaapp.com/iuW6cMRd/img/png-clipart-buried-treasure-treasure-miscellaneous-treasure-tran@2x.png"
            />

            {/* Removed big circular countdown timer per request */}

            <img
              className="absolute w-10 h-10 top-[-3px] right-[-1px] cursor-pointer hover:opacity-80 transition-opacity duration-200"
              alt="Information circle"
              src="https://c.animaapp.com/iuW6cMRd/img/informationcircle.svg"
              onClick={toggleTooltip}
            />
          </div>

          <div className="h-[73px] top-[172px] bg-[#982fbb] rounded-[0px_0px_20px_20px] absolute w-full left-0" />

          <div
            className="inline-flex items-center gap-1 absolute top-[214px] left-[100px] cursor-pointer"
            onClick={toggleExpanded}
          >
            <div className="relative w-fit mt-[-1.00px] font-medium [font-family:'Poppins',Helvetica] text-white text-base tracking-[0] leading-6 whitespace-nowrap">
              Check Details
            </div>

            <img
              className={`relative w-5 h-5 transition-transform duration-300 ${isExpanded ? "rotate-90" : ""
                }`}
              alt="Arrow"
              src="https://c.animaapp.com/iuW6cMRd/img/arrow.svg"
            />
          </div>

          <div className="h-12 top-[161px] bg-[#80279e] absolute w-full left-0" />

          <div className="absolute top-[172px] left-6 font-normal [font-family:'Poppins',Helvetica] text-white text-base tracking-[0] leading-6 whitespace-nowrap">
            Quest ends in:
          </div>
        </div>

        <div className={`absolute w-[122px] h-[37px] top-[166px] left-36 rounded-[10px] overflow-hidden flex items-center justify-center ${isExpired
          ? 'bg-[linear-gradient(107deg,rgba(255,0,0,0.8)_0%,rgba(139,0,0,1)_100%)]'
          : 'bg-[linear-gradient(107deg,rgba(200,117,251,1)_0%,rgba(16,4,147,1)_100%)]'
          }`}>
          <div className="[font-family:'Poppins',Helvetica] font-medium text-white text-base tracking-[0] leading-[normal] text-center">
            {isLoading ? 'Loading...' : (isExpired ? 'EXPIRED' : formatTime)}
          </div>
        </div>

        {/* Expanded content */}
        {isExpanded && (
          <div className="absolute w-full top-[245px] left-0 bg-[#982fbb] -mt-2 rounded-[0px_0px_20px_20px] px-6 pt-4 pb-6 animate-fade-in">
            <div className="font-normal [font-family:'Poppins',Helvetica] text-white text-sm leading-6 break-words">
              Please start downloading your first game from below suggestions to
              claim your Welcome Bonus.
            </div>
          </div>
        )}

        {/* Tooltip */}

      </div>
      {showTooltip && (
        <div
          ref={tooltipRef}
          className="absolute top-[35px] right-[-3px] z-50 w-[320px] bg-black/95 backdrop-blur-sm rounded-[12px] px-4 py-3 shadow-2xl"
        >
          <div className="text-white font-medium text-sm [font-family:'Poppins',Helvetica] leading-normal">
            <div className="text-[#ffe664] font-semibold mb-1 text-center">
              Welcome Offer
            </div>
            <div className="text-center">
              Please start downloading your first game from below suggestions
              to claim your Welcome Bonus.
            </div>
          </div>
          {/* Arrow pointing up to the info icon */}
          <div className="absolute top-[-8px] right-[25px] w-4 h-4 bg-black/95 transform rotate-45"></div>
        </div>
      )}
    </>
  );
};