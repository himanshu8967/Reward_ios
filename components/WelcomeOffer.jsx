import React, { useState, useRef, useEffect } from "react";

export const WelcomeOffer = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const tooltipRef = useRef(null)

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

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div
      className={`relative w-full max-w-[375px] rounded-[20px] overflow-hidden bg-[linear-gradient(103deg,rgba(121,32,207,1)_0%,rgba(205,73,153,1)_80%)] transition-all duration-300 ${isExpanded ? 'h-[330px]' : 'h-[245px]'
        }`}
      data-model-id="4001:7472"
    >
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
            className={`relative w-5 h-5 transition-transform duration-300 ${isExpanded ? 'rotate-90' : ''
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

      <div className="absolute w-[122px] h-[37px] top-[166px] left-36 rounded-[10px] overflow-hidden bg-[linear-gradient(107deg,rgba(200,117,251,1)_0%,rgba(16,4,147,1)_100%)]">
        <div className="absolute top-1.5 left-[15px] [font-family:'Poppins',Helvetica] font-medium text-white text-base tracking-[0] leading-[normal]">
          22h:30 mins
        </div>
      </div>

      {/* Expanded content */}
      {isExpanded && (
        <div className="absolute w-full top-[245px] left-0 bg-[#982fbb] -mt-2 rounded-[0px_0px_20px_20px] px-6 pt-4 pb-6 animate-fade-in">
          <div className="font-normal [font-family:'Poppins',Helvetica] text-white text-sm leading-6 break-words">
            Please start downloading your first game from below suggestions to claim your Welcome Bonus.
          </div>
        </div>
      )}

      {/* Tooltip */}
      {showTooltip && (
        <div
          ref={tooltipRef}
          className="absolute top-[45px] right-[-4px] z-50 w-[320px] bg-black/95 backdrop-blur-sm rounded-[12px] px-4 py-3 shadow-2xl"
        >
          <div className="text-white font-medium text-sm [font-family:'Poppins',Helvetica] leading-normal">
            <div className="text-[#ffe664] font-semibold mb-1 text-center">Welcome Offer</div>
            <div className="text-center">Please start downloading your first game from below suggestions to claim your Welcome Bonus.</div>
          </div>
          {/* Arrow pointing up to the info icon */}
          <div className="absolute top-[-8px] right-[25px] w-4 h-4 bg-black/95 transform rotate-45"></div>
        </div>
      )}
    </div>
  );
};