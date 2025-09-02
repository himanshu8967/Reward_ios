import React from "react";

export const XPPointsModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const decorativeStars = [
    { id: 1, top: "44px", left: "248px" },
    { id: 2, top: "125px", left: "12px" },
    { id: 3, top: "219px", left: "213px" },
    { id: 4, top: "54px", left: "16px" },
    { id: 5, top: "104px", left: "312px" },
    { id: 6, top: "33px", left: "79px" },
  ];

  const levelData = [
    {
      name: "Junior",
      reward: "Reward:",
      icon: "https://c.animaapp.com/rTwEmiCB/img/image-3937-3@2x.png",
      width: "98px",
    },
    {
      name: "Mid-level",
      reward: "1.2x",
      icon: "https://c.animaapp.com/rTwEmiCB/img/image-3937-4@2x.png",
      width: "61px",
    },
    {
      name: "Senior",
      reward: "1.5x",
      icon: "https://c.animaapp.com/rTwEmiCB/img/image-3937-5@2x.png",
      width: "66px",
    },
  ];

  const exampleData = [
    {
      name: "Junior",
      points: "5",
      icon: "https://c.animaapp.com/rTwEmiCB/img/image-3937-3@2x.png",
      width: "49px",
    },
    {
      name: "Mid-level",
      points: "8",
      icon: "https://c.animaapp.com/rTwEmiCB/img/image-3937-5@2x.png",
      width: "47px",
    },
    {
      name: "Senior",
      points: "10",
      icon: "https://c.animaapp.com/rTwEmiCB/img/image-3937-5@2x.png",
      width: "54px",
    },
  ];

  return (
    <div
      className="fixed inset-0 bg-black/80 flex justify-center px-4  pt-5 z-50 "
      onClick={onClose}
    >
      <div
        className="relative w-[335px] h-[595px] rounded-[20px] overflow-hidden border border-solid border-[#ffffff80] bg-[linear-gradient(0deg,rgba(0,0,0,1)_0%,rgba(0,0,0,1)_100%)]"
        data-model-id="2103:7095"
        role="dialog"
        aria-labelledby="xp-points-title"
        aria-describedby="xp-points-description"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Decorative Stars */}
        {decorativeStars.map((star) => (
          <img
            key={star.id}
            className="absolute w-[19px] h-[19px]"
            style={{ top: star.top, left: star.left }}
            alt=""
            src={
              star.id <= 3
                ? "https://c.animaapp.com/rTwEmiCB/img/vector-2.svg"
                : star.id === 4
                  ? "https://c.animaapp.com/rTwEmiCB/img/vector-5.svg"
                  : star.id === 5
                    ? "https://c.animaapp.com/rTwEmiCB/img/vector-7.svg"
                    : "https://c.animaapp.com/rTwEmiCB/img/vector-8.svg"
            }
            aria-hidden="true"
          />
        ))}

        {/* Additional decorative elements */}
        <img
          className="absolute w-3 h-[13px] top-[214px] left-[271px]"
          alt=""
          src="https://c.animaapp.com/rTwEmiCB/img/vector-4.svg"
          aria-hidden="true"
        />

        <img
          className="absolute w-3 h-[13px] top-[214px] left-[13px]"
          alt=""
          src="https://c.animaapp.com/rTwEmiCB/img/vector-5.svg"
          aria-hidden="true"
        />

        {/* Header Section */}
        <header className="absolute w-52 h-11 top-[141px] left-[68px]">
          <div className="flex flex-col w-[198px] items-center pt-0 pb-2 px-0 absolute top-0 left-0">
            <h1
              id="xp-points-title"
              className="relative w-fit mt-[-1.50px]  text-white [font-family:'Poppins',Helvetica] font-bold text-[32px] tracking-[0] leading-8 whitespace-nowrap px-4 py-2 rounded-lg"
            >
              XP Points
            </h1>
          </div>

          <img
            className="absolute w-[19px] h-[19px] top-[25px] left-[189px]"
            alt=""
            src="https://c.animaapp.com/rTwEmiCB/img/vector-8.svg"
            aria-hidden="true"
          />
        </header>

        {/* Main Logo */}
        <img
          className="absolute w-[125px] h-[108px] top-[27px] left-[99px]"
          alt="XP Points Logo"
          src="https://c.animaapp.com/rTwEmiCB/img/pic.svg"
        />

        {/* Close Button */}
        <button
          className="absolute w-[31px] h-[31px] top-6 left-[280px] cursor-pointer hover:opacity-80 transition-opacity"
          aria-label="Close dialog"
          type="button"
          onClick={onClose}
        >
          <img alt="Close" src="https://c.animaapp.com/rTwEmiCB/img/close.svg" />
        </button>

        {/* Description */}
        <div className="absolute w-[284px] h-[55px] top-[185px] left-[25px]">
          <p
            id="xp-points-description"
            className="absolute w-[284px] top-3 left-0 [font-family:'Poppins',Helvetica] font-light text-white text-sm text-center tracking-[0] leading-5"
          >
            Play more, level up, and multiply your rewards with XP Points.
          </p>
        </div>

        {/* Levels Section */}
        <section className="h-[99px] top-64 flex flex-col w-[294px] items-start gap-3 absolute left-5">
          <div className="flex items-center justify-around gap-2.5 pt-0 pb-3 px-0 relative self-stretch w-full flex-[0_0_auto] border-b [border-bottom-style:solid] border-[#383838]">
            <h2 className="relative flex-1 mt-[-1.00px] [font-family:'Poppins',Helvetica] font-semibold text-white text-sm text-center tracking-[0] leading-5">
              Levels
            </h2>
          </div>

          <div className="mb-[-0.52px] flex items-start justify-between relative self-stretch w-full flex-[0_0_auto]">
            {levelData.map((level, index) => (
              <div
                key={index}
                className="inline-flex flex-col items-start gap-1 relative flex-[0_0_auto]"
              >
                <div className="relative w-fit mt-[-1.00px] [font-family:'Poppins',Helvetica] font-semibold text-white text-[15px] tracking-[0] leading-[normal]">
                  {level.name}
                </div>

                <div className="flex items-center relative">
                  <div
                    className="h-[28.52px] mt-[-0.03px] rounded-[19.01px] bg-[linear-gradient(180deg,rgba(158,173,247,0.4)_0%,rgba(113,106,231,0.4)_100%)] relative flex items-center justify-between px-2"
                    style={{ width: level.width }}
                  >
                    <div className="[font-family:'Poppins',Helvetica] font-medium text-white text-[15.6px] tracking-[0] leading-[16.9px] whitespace-nowrap">
                      {level.reward}
                    </div>

                    <img
                      className="w-[18px] h-[19px] aspect-[0.97] flex-shrink-0"
                      alt=""
                      src={level.icon}
                      aria-hidden="true"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Example Section */}
        <section className="top-[383px] flex flex-col w-[294px] items-start gap-3 absolute left-5">
          <div className="flex items-center gap-2.5 pt-0 pb-3 px-0 relative self-stretch w-full flex-[0_0_auto] border-b [border-bottom-style:solid] border-[#383838]">
            <h2 className="relative flex-1 mt-[-1.00px] [font-family:'Poppins',Helvetica] font-semibold text-white text-sm text-center tracking-[0] leading-5">
              Example
            </h2>
          </div>

          <p className="relative self-stretch [font-family:'Poppins',Helvetica] font-light text-white text-sm text-center tracking-[0] leading-5">
            If you&apos;re playing game say &quot;Fortnite&quot; &amp; the task is
            complete 5 levels of the game. Here&apos;s how XP Points benefits you
          </p>

          <div className="flex items-start justify-between relative self-stretch w-full flex-[0_0_auto]">
            {exampleData.map((item, index) => (
              <div
                key={index}
                className="flex flex-col items-start gap-1 relative"
                style={{ width: item.width }}
              >
                <div className="relative w-fit mt-[-1.00px] [font-family:'Poppins',Helvetica] font-semibold text-white text-[15px] tracking-[0] leading-[normal]">
                  {item.name}
                </div>

                <div
                  className="w-[98px] h-7 gap-[131.29px] flex items-center relative"
                  style={{
                    marginRight:
                      index === 0 ? "-49px" : index === 2 ? "-7px" : "0",
                  }}
                >
                  <div
                    className="relative"
                    style={{
                      width: index === 0 ? "59.82px" : "61px",
                      height: "28px",
                    }}
                  >
                    <div
                      className={`relative h-7 rounded-[18.64px] bg-[linear-gradient(180deg,rgba(158,173,247,0.4)_0%,rgba(113,106,231,0.4)_100%)]`}
                      style={{ width: item.width }}
                    >
                      <div
                        className={`absolute top-1.5 [font-family:'Poppins',Helvetica] font-medium text-white text-[15.3px] tracking-[0] leading-[16.5px] whitespace-nowrap ${index === 0
                          ? "left-2.5"
                          : index === 1
                            ? "left-[7px]"
                            : "left-[9px]"
                          }`}
                      >
                        {item.points}
                      </div>

                      <img
                        className={`absolute w-[18px] h-[19px] top-[5px] aspect-[0.97] ${index === 0
                          ? "left-[22px]"
                          : index === 1
                            ? "left-[21px]"
                            : "left-[29px]"
                          }`}
                        alt=""
                        src={item.icon}
                        aria-hidden="true"
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div >
  );
};