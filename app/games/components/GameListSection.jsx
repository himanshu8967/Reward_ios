"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import { useAuth } from "@/contexts/AuthContext";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000';

const nonGamingOffers = [
  {
    id: 1,
    name: "Albert- Mobile Banking",
    image: "https://c.animaapp.com/xCaMzUYh/img/image-3982@2x.png",
    bgImage: "https://c.animaapp.com/xCaMzUYh/img/rectangle-74@2x.png",
    bottomBg: "https://c.animaapp.com/xCaMzUYh/img/rectangle-76@2x.png",
    earnAmount: "Earn upto 100",
  },
  {
    id: 2,
    name: "Chime- Mobile Banking",
    image: "https://c.animaapp.com/xCaMzUYh/img/image-3980@2x.png",
    bgImage: "https://c.animaapp.com/xCaMzUYh/img/rectangle-73-1@2x.png",
    bottomBg: "https://c.animaapp.com/xCaMzUYh/img/rectangle-74-1@2x.png",
    earnAmount: "Earn upto 100",
  },
  {
    id: 3,
    name: "Albert- Mobile Banking",
    image: "https://c.animaapp.com/xCaMzUYh/img/image-3982@2x.png",
    bgImage: "https://c.animaapp.com/xCaMzUYh/img/rectangle-74@2x.png",
    bottomBg: "https://c.animaapp.com/xCaMzUYh/img/rectangle-76@2x.png",
    earnAmount: "Earn upto 100",
  },
];

export const GameListSection = ({ searchQuery = "", showSearch = false }) => {
  const { token } = useAuth();
  const [userGames, setUserGames] = useState([]);
  const [userStats, setUserStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const scrollTimeoutRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(1);
  const totalCards = nonGamingOffers.length;

  // --- CONFIGURATION CONSTANTS ---
  // The horizontal distance each side card is pushed from the center.
  // This value is tweaked to create the perfect overlap and "cut off" effect within the 335px container.
  const HORIZONTAL_SPREAD = 120;







  // API functions
  const fetchUserGames = async () => {
    if (!token) return;
    try {
      const response = await fetch(`${BASE_URL}/api/game`, {
        headers: {
          'x-auth-token': token,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setUserGames(data);
      }
    } catch (error) {
      console.error('Failed to fetch user games:', error);
    }
  };

  const fetchUserStats = async () => {
    if (!token) return;
    try {
      const response = await fetch(`${BASE_URL}/api/profile/stats`, {
        headers: {
          'x-auth-token': token,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setUserStats(data);
      }
    } catch (error) {
      console.error('Failed to fetch user stats:', error);
    }
  };

  const startNewGame = async (gameId) => {
    if (!token) return;
    try {
      const response = await fetch(`${BASE_URL}/api/game/start`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token,
        },
        body: JSON.stringify({ gameId }),
      });
      if (response.ok) {
        await fetchUserGames(); // Refresh games list
      }
    } catch (error) {
      console.error('Failed to start new game:', error);
    }
  };

  const updateGameScore = async (gameId, score) => {
    if (!token) return;
    try {
      const response = await fetch(`${BASE_URL}/api/game/score`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token,
        },
        body: JSON.stringify({ gameId, score }),
      });
      if (response.ok) {
        await fetchUserGames(); // Refresh games list
      }
    } catch (error) {
      console.error('Failed to update game score:', error);
    }
  };

  const completeGame = async (gameId) => {
    if (!token) return;
    try {
      const response = await fetch(`${BASE_URL}/api/game/complete`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token,
        },
        body: JSON.stringify({ gameId }),
      });
      if (response.ok) {
        await fetchUserGames(); // Refresh games list
      }
    } catch (error) {
      console.error('Failed to complete game:', error);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      if (!token) return;
      setLoading(true);
      await Promise.all([fetchUserGames(), fetchUserStats()]);
      setLoading(false);
    };
    loadData();
  }, [token]);

  // Downloaded games data (keeping static data as fallback)
  const downloadedGames = [
    {
      id: 1,
      name: "Fortnite",
      genre: "Action",
      subtitle: "Hey Jatin!",
      image:
        "https://c.animaapp.com/3mn7waJw/img/unsplash-bi91nrppe38-7@2x.png",
      overlayImage: "https://c.animaapp.com/3mn7waJw/img/image-4@2x.png",
      score: "100",
      bonus: "+500",
      coinIcon: "https://c.animaapp.com/3mn7waJw/img/image-3937-12@2x.png",
      picIcon: "https://c.animaapp.com/3mn7waJw/img/pic.svg",
      hasStatusDot: true,
    },
    {
      id: 2,
      name: "Sugar Rush",
      genre: "Puzzle",
      subtitle: "How to play game",
      image: null,
      overlayImage: "https://c.animaapp.com/3mn7waJw/img/image-217@2x.png",
      score: "90",
      bonus: "+400",
      coinIcon: "https://c.animaapp.com/3mn7waJw/img/image-3937-12@2x.png",
      picIcon: "https://c.animaapp.com/3mn7waJw/img/pic-1.svg",
      hasStatusDot: true,
      isGradientBg: true,
    },
    {
      id: 3,
      name: "Sweet Bonanza",
      genre: "Puzzle",
      subtitle: "Hey Jatin!",
      image:
        "https://c.animaapp.com/3mn7waJw/img/unsplash-bi91nrppe38-1@2x.png",
      overlayImage: "https://c.animaapp.com/3mn7waJw/img/image-3926@2x.png",
      score: "70",
      bonus: "+300",
      coinIcon: "https://c.animaapp.com/3mn7waJw/img/image-3937-12@2x.png",
      picIcon: "https://c.animaapp.com/3mn7waJw/img/pic-2.svg",
      hasStatusDot: false,
    },
    {
      id: 4,
      name: "Game of Olympus",
      genre: "Action",
      subtitle: "Hey Jatin!",
      image: null,
      overlayImage: "https://c.animaapp.com/3mn7waJw/img/image-3928@2x.png",
      score: "60",
      bonus: "+200",
      coinIcon: "https://c.animaapp.com/3mn7waJw/img/image-3937-12@2x.png",
      picIcon: "https://c.animaapp.com/3mn7waJw/img/pic-3.svg",
      hasStatusDot: false,
      backgroundImage: "https://c.animaapp.com/3mn7waJw/img/oval@2x.png",
    },
  ];

  // Other games data
  const otherGames = [
    {
      id: 5,
      name: "Orbit Fall",
      genre: "Action",
      subtitle: "Hey Jatin!",
      image:
        "https://c.animaapp.com/3mn7waJw/img/unsplash-bi91nrppe38-2@2x.png",
      overlayImage: "https://c.animaapp.com/3mn7waJw/img/image-3930@2x.png",
      score: "20",
      bonus: "+50",
      coinIcon: "https://c.animaapp.com/3mn7waJw/img/image-3937-12@2x.png",
      picIcon: "https://c.animaapp.com/3mn7waJw/img/pic-8.svg",
    },
    {
      id: 6,
      name: "Commando",
      genre: "Action",
      subtitle: "Hey Jatin!",
      image: null,
      overlayImage: "https://c.animaapp.com/V1uc3arn/img/rectangle-24@2x.png",
      score: "10.1",
      bonus: "+30",
      coinIcon: "https://c.animaapp.com/3mn7waJw/img/image-3937-12@2x.png",
      picIcon: "https://c.animaapp.com/3mn7waJw/img/pic-9.svg",
      backgroundImage:
        "https://c.animaapp.com/3mn7waJw/img/rectangle-24@2x.png",
      hasBlur: true,
    },
    {
      id: 7,
      name: "Robbery Bob",
      genre: "Action",
      subtitle: "Hey Jatin!",
      image: null,
      overlayImage: "https://c.animaapp.com/V1uc3arn/img/rectangle-25@2x.png",
      score: "9.2",
      bonus: "+10",
      coinIcon: "https://c.animaapp.com/3mn7waJw/img/image-3937-12@2x.png",
      picIcon: "https://c.animaapp.com/3mn7waJw/img/pic-10.svg",
      backgroundImage:
        "https://c.animaapp.com/3mn7waJw/img/rectangle-25@2x.png",
      hasBlur: true,
    },
    {
      id: 8,
      name: "Legends",
      genre: "Action",
      subtitle: "Hey Jatin!",
      image:
        "https://c.animaapp.com/3mn7waJw/img/unsplash-bi91nrppe38-3@2x.png",
      overlayImage:
        "https://c.animaapp.com/3mn7waJw/img/png-transparent-mobile-legends-bang-bang-desktop-mobile-phones-a@2x.png",
      score: "8",
      bonus: "+2",
      coinIcon: "https://c.animaapp.com/3mn7waJw/img/image-3937-8@2x.png",
      picIcon: "https://c.animaapp.com/3mn7waJw/img/pic-11.svg",
    },
  ];

  // Recent games data (all Fortnite with different scores)
  const recentGames = [
    {
      id: 9,
      name: "Fortnite",
      genre: "Action",
      subtitle: "Hey Jatin!",
      image:
        "https://c.animaapp.com/3mn7waJw/img/unsplash-bi91nrppe38-7@2x.png",
      overlayImage: "https://c.animaapp.com/3mn7waJw/img/image-4@2x.png",
      score: "2.4",
      bonus: "+15",
      coinIcon: "https://c.animaapp.com/3mn7waJw/img/image-3937-12@2x.png",
      picIcon: "https://c.animaapp.com/3mn7waJw/img/pic-12.svg",
      scoreWidth: "w-[70px]",
    },
    {
      id: 10,
      name: "Fortnite",
      genre: "Action",
      subtitle: "Hey Jatin!",
      image:
        "https://c.animaapp.com/3mn7waJw/img/unsplash-bi91nrppe38-7@2x.png",
      overlayImage: "https://c.animaapp.com/3mn7waJw/img/image-4@2x.png",
      score: "2.8",
      bonus: "+12",
      coinIcon: "https://c.animaapp.com/3mn7waJw/img/image-3937-12@2x.png",
      picIcon: "https://c.animaapp.com/3mn7waJw/img/pic-13.svg",
      scoreWidth: "w-[70px]",
    },
    {
      id: 11,
      name: "Fortnite",
      genre: "Action",
      subtitle: "Hey Jatin!",
      image:
        "https://c.animaapp.com/3mn7waJw/img/unsplash-bi91nrppe38-7@2x.png",
      overlayImage: "https://c.animaapp.com/3mn7waJw/img/image-4@2x.png",
      score: "1.2",
      bonus: "+5",
      coinIcon: "https://c.animaapp.com/3mn7waJw/img/image-3937-12@2x.png",
      picIcon: "https://c.animaapp.com/3mn7waJw/img/pic-14.svg",
      scoreWidth: "w-[70px]",
    },
    {
      id: 12,
      name: "Fortnite",
      genre: "Action",
      subtitle: "Hey Jatin!",
      image:
        "https://c.animaapp.com/3mn7waJw/img/unsplash-bi91nrppe38-7@2x.png",
      overlayImage: "https://c.animaapp.com/3mn7waJw/img/image-4@2x.png",
      score: "0.8",
      bonus: "+25",
      coinIcon: "https://c.animaapp.com/3mn7waJw/img/image-3937-12@2x.png",
      picIcon: "https://c.animaapp.com/3mn7waJw/img/pic-15.svg",
      scoreWidth: "w-[70px]",
    },
  ];

  // Search filtering function
  const filterGamesBySearch = (games, query) => {
    if (!query || query.trim() === "") return games;
    const searchTerm = query.toLowerCase().trim();
    return games.filter(game =>
      game.name.toLowerCase().includes(searchTerm) ||
      game.genre.toLowerCase().includes(searchTerm)
    );
  };

  // Apply search filter to all game lists
  const filteredDownloadedGames = filterGamesBySearch(downloadedGames, searchQuery);
  const filteredOtherGames = filterGamesBySearch(otherGames, searchQuery);
  const filteredRecentGames = filterGamesBySearch(recentGames, searchQuery);
  const filteredUserGames = userGames.filter(game => {
    if (!searchQuery || searchQuery.trim() === "") return true;
    const searchTerm = searchQuery.toLowerCase().trim();
    const gameName = game.gameId.replace('_', ' ').toLowerCase();
    return gameName.includes(searchTerm);
  });



  // Helper to format title with a line break before the last word
  const formatTitle = (title) => {
    const words = title.split(' ');
    if (words.length <= 1) return title;
    const lastWord = words.pop();
    return <>{words.join(' ')}<br />{lastWord}</>;
  };

  const renderGameItem = (game, showBorder = true) => (
    <div
      key={game.id}
      className={`flex items-center justify-between pt-0 pb-4 px-0 relative self-stretch w-full flex-[0_0_auto] ${showBorder ? "border-b [border-bottom-style:solid] border-[#4d4d4d]" : ""}`}
    >
      <div className="inline-flex items-center gap-2 relative flex-[0_0_auto]">
        {game.image ? (
          <Image
            className="relative w-[55px] h-[55px] object-cover"
            alt={game.name}
            src={game.image}
            width={55}
            height={55}
          />
        ) : game.backgroundImage ? (
          <div
            className={`${game.hasBlur ? "ml-[-0.56px] " : ""}bg-[url(${game.backgroundImage})] bg-${game.hasBlur ? "[100%_100%]" : "cover bg-[50%_50%]"} relative w-[55px] h-[55px]${game.isGradientBg ? " rounded-[27.5px] bg-[linear-gradient(180deg,rgba(141,173,248,1)_0%,rgba(240,136,249,1)_100%)]" : ""}`}
          >
            {game.hasBlur && (
              <div className="relative h-[55px] -left-px rounded-[27px] blur-[0.61px] bg-[linear-gradient(180deg,rgba(0,0,0,0.31)_0%,rgba(0,0,0,0.65)_88%)]" />
            )}
            {game.overlayImage && !game.hasBlur && (
              <Image
                className="absolute w-[55px] h-[52px] top-[3px] left-0"
                alt="Game overlay"
                src={game.overlayImage}
                width={55}
                height={52}
              />
            )}
            {game.overlayImage && game.hasBlur && (
              <Image
                className="absolute w-[55px] h-[55px] top-0 left-0 object-cover rounded-[27.5px] z-10"
                alt="Game icon"
                src={game.overlayImage}
                width={55}
                height={55}
              />
            )}
          </div>
        ) : (
          <div className="relative w-[55px] h-[55px] rounded-[27.5px] bg-[linear-gradient(180deg,rgba(141,173,248,1)_0%,rgba(240,136,249,1)_100%)]" />
        )}

        <div className="flex-col w-[139px] items-start flex relative">
          <div className="relative self-stretch mb-1 [font-family:'Poppins',Helvetica] font-bold text-[#FFFFFF] text-base tracking-[0] leading-tight">
            {game.name}
          </div>
          <div className="relative self-stretch mb-1 [font-family:'Poppins',Helvetica] font-normal text-white text-xs tracking-[0] leading-tight">
            ({game.genre})
          </div>
          <div className="relative self-stretch [font-family:'Poppins',Helvetica] font-normal text-[#bdbdbd] text-[13px] tracking-[0] leading-[normal]">
            {game.subtitle}
          </div>
        </div>

        {game.overlayImage && game.image && (
          <Image
            className="absolute w-[67px] h-[58px] -top-0.5 left-[-7px]"
            alt="Game overlay"
            src={game.overlayImage}
            width={67}
            height={58}
          />
        )}

        {game.overlayImage && game.isGradientBg && (
          <Image
            className="absolute w-9 h-[41px] top-[7px] left-2.5 object-cover"
            alt="Game overlay"
            src={game.overlayImage}
            width={36}
            height={41}
          />
        )}

        {game.overlayImage &&
          game.backgroundImage &&
          !game.hasBlur &&
          !game.image && (
            <Image
              className="absolute w-[54px] h-[42px] top-[13px] left-0 object-cover"
              alt="Game overlay"
              src={game.overlayImage}
              width={54}
              height={42}
            />
          )}

        {game.overlayImage && game.name === "Legends" && (
          <Image
            className="absolute w-[55px] h-[55px] top-0 left-0"
            alt="Game overlay"
            src={game.overlayImage}
            width={55}
            height={55}
          />
        )}
      </div>

      <div
        className={`relative ${game.scoreWidth || "w-[65px]"} h-[55px] rounded-[10px] overflow-hidden bg-[linear-gradient(180deg,rgba(158,173,247,0.6)_0%,rgba(113,106,231,0.6)_100%)]`}
      >
        <div className="flex items-center justify-center gap-1 mt-2 relative">
          <div className="top-2 left-[3px] text-base leading-5 [font-family:'Poppins',Helvetica] font-medium text-white tracking-[0] whitespace-nowrap">
            {game.score.includes(".") ? game.score : ` ${game.score}`}
          </div>
          <Image
            className=" w-[19px] h-[19px] top-[9px] left-[43px]"
            alt="Coin"
            src={game.coinIcon}
            width={19}
            height={19}
          />
        </div>
        <div className="flex items-center justify-center gap-1 mt-1 relative">

          <div className="top-[34px] left-[6px] text-[12px] leading-4  [font-family:'Poppins',Helvetica] font-medium text-[#FFFFFF] tracking-[0] whitespace-nowrap">
            {game.bonus}
          </div>
          <Image
            className=" w-[17px] h-[13px] top-[34px]  mr-[3x] left-[39px]"
            alt="Pic"
            src={game.picIcon}
            width={17}
            height={13}
          />
        </div>
      </div>

      {game.hasStatusDot && (
        <div className="absolute w-[8px] h-[8px] top-[30px] left-[248px] bg-[#8B92DF] rounded" />
      )}
    </div>
  );

  return (
    <div className={`flex flex-col max-w-[335px] w-full mx-auto items-start gap-8 relative ${showSearch ? 'top-[180px]' : 'top-[130px]'}`}>
      <div className="flex flex-col items-start gap-2.5 relative self-stretch w-full flex-[0_0_auto]">
        <div className="flex flex-col w-full items-start gap-[49px] relative flex-[0_0_auto]">
          <div className="inline-flex items-center gap-0.5 relative flex-[0_0_auto]">
            <Image
              className="relative w-5 h-5"
              alt="Badge check"
              src="https://c.animaapp.com/3mn7waJw/img/badgecheck.svg"
              width={20}
              height={20}
            />
            <div className="relative w-fit mt-[-1.00px] [font-family:'Poppins',Helvetica] font-medium text-[#4bba56] text-base tracking-[0] leading-[normal]">
              Downloaded
            </div>
          </div>
        </div>

        <div className="flex flex-col w-full items-start gap-2.5 px-0 py-2.5 relative flex-[0_0_auto] overflow-y-scroll">
          {filteredDownloadedGames.map((game, index) =>
            renderGameItem(game, index < filteredDownloadedGames.length - 1),
          )}
          {searchQuery && filteredDownloadedGames.length === 0 && (
            <div className="text-white text-center py-4">No downloaded games found for "{searchQuery}"</div>
          )}
        </div>
      </div>

      {/* User Games from API */}
      {(userGames.length > 0 || searchQuery) && (
        <div className="flex flex-col items-start gap-2.5 relative self-stretch w-full flex-[0_0_auto]">
          <div className="flex flex-col w-full items-start gap-[49px] relative flex-[0_0_auto]">
            <div className="inline-flex items-center gap-0.5 relative flex-[0_0_auto]">
              <Image
                className="relative w-5 h-5"
                alt="Badge check"
                src="https://c.animaapp.com/3mn7waJw/img/badgecheck.svg"
                width={20}
                height={20}
              />
              <div className="relative w-fit mt-[-1.00px] [font-family:'Poppins',Helvetica] font-medium text-[#4bba56] text-base tracking-[0] leading-[normal]">
                My Games Progress
              </div>
            </div>
          </div>

          <div className="flex flex-col w-full items-start gap-2.5 px-0 py-2.5 relative flex-[0_0_auto] overflow-y-scroll">
            {filteredUserGames.map((game, index) => (
              <div
                key={game._id}
                className={`flex items-center justify-between pt-0 pb-4 px-0 relative self-stretch w-full flex-[0_0_auto] ${index < filteredUserGames.length - 1 ? "border-b [border-bottom-style:solid] border-[#4d4d4d]" : ""}`}
              >
                <div className="inline-flex items-center gap-2 relative flex-[0_0_auto]">
                  <div className="relative w-[55px] h-[55px] rounded-[27.5px] bg-[linear-gradient(180deg,rgba(141,173,248,1)_0%,rgba(240,136,249,1)_100%)]" />

                  <div className="flex-col w-[139px] items-start flex relative">
                    <div className="relative self-stretch mb-1 [font-family:'Poppins',Helvetica] font-bold text-white text-base tracking-[0] leading-tight">
                      {game.gameId.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </div>
                    <div className="relative self-stretch mb-1 [font-family:'Poppins',Helvetica] font-normal text-white text-xs tracking-[0] leading-tight">
                      (Puzzle)
                    </div>
                    <div className="relative self-stretch [font-family:'Poppins',Helvetica] font-normal text-[#bdbdbd] text-[13px] tracking-[0] leading-[normal]">
                      {game.completed ? 'Completed' : 'In Progress'}
                    </div>
                  </div>
                </div>

                <div className="relative w-[70px] h-[55px] rounded-[10px] overflow-hidden bg-[linear-gradient(180deg,rgba(158,173,247,0.6)_0%,rgba(113,106,231,0.6)_100%)]">
                  <div className="top-2 left-[3px] text-base leading-5 absolute [font-family:'Poppins',Helvetica] font-medium text-white tracking-[0] whitespace-nowrap">
                    {game.score}
                  </div>
                  <Image
                    className="absolute w-[19px] h-[19px] top-[9px] left-[43px]"
                    alt="Coin"
                    src="https://c.animaapp.com/3mn7waJw/img/image-3937-12@2x.png"
                    width={19}
                    height={19}
                  />
                  <div className="top-[33px] left-1.5 text-xs leading-4 absolute [font-family:'Poppins',Helvetica] font-medium text-white tracking-[0] whitespace-nowrap">
                    +{Math.floor(game.score * 0.1)}
                  </div>
                  <Image
                    className="absolute w-[17px] h-[13px] top-[34px] left-[45px]"
                    alt="Pic"
                    src="https://c.animaapp.com/3mn7waJw/img/pic.svg"
                    width={17}
                    height={13}
                  />
                </div>

                {!game.completed && (
                  <div className="absolute w-2 h-2 top-[26px] left-[261px] bg-[#8b92de] rounded" />
                )}
              </div>
            ))}
            {searchQuery && filteredUserGames.length === 0 && userGames.length > 0 && (
              <div className="text-white text-center py-4">No user games found for "{searchQuery}"</div>
            )}
          </div>
        </div>
      )}



      <div className="flex flex-col w-[335px] max-h-[479px] items-start gap-[16px] relative ">
        <div className="flex flex-col items-start gap-2.5 self-stretch w-full relative">
          <div className="w-[334px] h-[479px] rounded-[20px] overflow-hidden bg-[linear-gradient(103deg,rgba(121,32,207,1)_0%,rgba(205,73,153,1)_80%)] relative overflow-x-scroll">
            <div className="relative w-[334px] h-[479px]">
              <div className="absolute w-[334px] h-[91px] top-0 left-0">
                <div className="top-8 left-20 font-bold text-xl leading-6 absolute [font-family:'Poppins',Helvetica] text-[#FFFFFF] tracking-[0] whitespace-nowrap">
                  My Account Overview
                </div>
                <Image
                  className="absolute w-[55px] h-[55px] top-4 left-4"
                  alt="Group"
                  src="https://c.animaapp.com/3mn7waJw/img/group-4@2x.png"
                  width={55}
                  height={55}
                />
              </div>

              <div className="absolute w-[334px] h-[356px] top-[123px] left-0 bg-[#982fbb] rounded-[0px_0px_20px_20px]" />

              <div className="absolute w-[304px] h-[99px] top-[138px] left-[15px] border-b [border-bottom-style:solid] border-[#cacaca80]">
                <div className="absolute w-[154px] top-1.5 left-[5px] [font-family:'Poppins',Helvetica] font-bold text-white text-base tracking-[0.02px] leading-[normal]">
                  {userStats ? `${userStats.gamesPlayed}/5 Games Played` : "3/5 Games Played"}
                </div>
                <div className="absolute w-[177px] h-[20px] top-[38px] border-[4px] border-[#FFFFFF33]  bg-transparent left-[5px] rounded-[10px]">
                  <div className="w-[60%] h-full bg-[linear-gradient(90deg,rgba(255,221,143,1)_0%,rgba(255,183,77,1)_100%)] rounded-[10px]"></div>
                  <div className="absolute bg-white w-7 h-7   rounded-full top-[-8px] border-[5px] border-[#FFB74D]" style={{ left: 'calc(60% - 12px)' }}></div>
                </div>
                <div className="relative w-[70px] h-[55px] left-[226px] top-4 rounded-[12px] overflow-hidden bg-[linear-gradient(331deg,rgba(237,131,0,1)_0%,rgba(237,166,0,1)_100%)] flex items-center justify-center">
                  {/* Main container for the two columns */}
                  <div className="flex items-center justify-center gap-x-1">

                    {/* Column 1: Values (Right-aligned) */}
                    <div className="flex flex-col items-end">
                      <div className="text-[16px] font-semibold text-white [font-family:'Poppins',Helvetica]">
                        100
                      </div>
                      <div className="text-[14px] font-semibold text-white [font-family:'Poppins',Helvetica]">
                        +50
                      </div>
                    </div>

                    {/* Column 2: Icons (Left-aligned) */}
                    <div className="flex flex-col items-start gap-y-[1.2px]">
                      {/* Icon Wrapper for consistent sizing */}
                      <div className="w-[18px] h-[19px] flex items-center justify-center">
                        <Image
                          alt="Coin"
                          src="https://c.animaapp.com/3mn7waJw/img/image-3937-12@2x.png"
                          width={18}
                          height={19}
                        />
                      </div>
                      {/* Icon Wrapper for consistent sizing */}
                      <div className="w-5 h-5 flex items-center justify-center">
                        <Image
                          alt="XP"
                          src="https://c.animaapp.com/3mn7waJw/img/pic-7.svg"
                          width={17}
                          height={14}
                        />
                      </div>
                    </div>

                  </div>
                </div>
              </div>

              <div className="top-[253px] border-b [border-bottom-style:solid] border-[#cacaca80] absolute w-[304px] h-[99px] left-[15px]">
                <div className="absolute w-[178px] top-1.5 left-[5px] [font-family:'Poppins',Helvetica] font-bold text-white text-base tracking-[0.02px] leading-[normal]">
                  {userStats ? `${userStats.balance}/900 Coins Earned (Daily)` : "100/900 Coins Earned (Daily)"}
                </div>
                <div className="absolute w-[177px] h-[20px] top-[68px] left-[5px] border-[4px] border-[#FFFFFF33]  bg-transparent rounded-[10px]">
                  <div className="w-[25%] h-full bg-[linear-gradient(90deg,rgba(255,221,143,1)_0%,rgba(255,183,77,1)_100%)] rounded-[10px]"></div>
                  <div className="absolute  bg-white w-7 h-7   rounded-full top-[-8px] border-[5px]  border-[#FFB74D]" style={{ left: 'calc(25% - 12px)' }}></div>
                </div>
                <div className="relative w-[70px] h-[55px] left-[226px] top-4 rounded-[12px] overflow-hidden bg-[linear-gradient(331deg,rgba(237,131,0,1)_0%,rgba(237,166,0,1)_100%)] flex items-center justify-center">
                  {/* Main container for the two columns */}
                  <div className="flex items-center justify-center gap-x-1">

                    {/* Column 1: Values (Right-aligned) */}
                    <div className="flex flex-col items-end">
                      <div className="text-[16px] font-semibold text-white [font-family:'Poppins',Helvetica]">
                        200
                      </div>
                      <div className="text-[14px] font-semibold text-white [font-family:'Poppins',Helvetica]">
                        +15
                      </div>
                    </div>

                    {/* Column 2: Icons (Left-aligned) */}
                    <div className="flex flex-col items-start gap-y-[1.2px]">
                      {/* Icon Wrapper for consistent sizing */}
                      <div className="w-[18px] h-[19px] flex items-center justify-center">
                        <Image
                          alt="Coin"
                          src="https://c.animaapp.com/3mn7waJw/img/image-3937-12@2x.png"
                          width={18}
                          height={19}
                        />
                      </div>
                      {/* Icon Wrapper for consistent sizing */}
                      <div className="w-5 h-5 flex items-center justify-center">
                        <Image
                          alt="XP"
                          src="https://c.animaapp.com/3mn7waJw/img/pic-7.svg"
                          width={17}
                          height={14}
                        />
                      </div>
                    </div>

                  </div>
                </div>
              </div>

              <div className="top-[368px] absolute w-[304px] h-[99px] left-[15px]">
                <div className="absolute w-[178px] top-1.5 left-[5px] [font-family:'Poppins',Helvetica] font-bold text-white text-base tracking-[0.02px] leading-[normal]">
                  {userStats ? `${userStats.surveysCompleted + userStats.racesCompleted}/3 Challenges Finished (Daily)` : "0/3 Challenges Finished (Daily)"}
                </div>
                <div className="absolute w-[177px] h-[20px] top-[68px] left-[5px] border-[4px] border-[#FFFFFF33]  bg-transparent rounded-[10px]">
                  <div className="w-[10%] h-full bg-[linear-gradient(90deg,rgba(255,221,143,1)_0%,rgba(255,183,77,1)_100%)] rounded-[10px]"></div>
                  <div className="absolute  bg-white w-7 h-7   rounded-full top-[-8px] border-[5px]  border-[#FFB74D]" style={{ left: 'calc(10% - 12px)' }}></div>
                </div>
                <div className="relative w-[70px] h-[55px] left-[226px] top-5 rounded-[12px] overflow-hidden bg-[linear-gradient(331deg,rgba(237,131,0,1)_0%,rgba(237,166,0,1)_100%)] flex items-center justify-center">
                  {/* Main container for the two columns */}
                  <div className="flex items-center justify-center gap-x-1">

                    {/* Column 1: Values (Right-aligned) */}
                    <div className="flex flex-col items-end">
                      <div className="text-[16px] font-semibold text-white [font-family:'Poppins',Helvetica]">
                        100
                      </div>
                      <div className="text-[14px] font-semibold text-white [font-family:'Poppins',Helvetica]">
                        +5
                      </div>
                    </div>

                    {/* Column 2: Icons (Left-aligned) */}
                    <div className="flex flex-col items-start gap-y-[1.2px]">
                      {/* Icon Wrapper for consistent sizing */}
                      <div className="w-[18px] h-[19px] flex items-center justify-center">
                        <Image
                          alt="Coin"
                          src="https://c.animaapp.com/3mn7waJw/img/image-3937-12@2x.png"
                          width={18}
                          height={19}
                        />
                      </div>
                      {/* Icon Wrapper for consistent sizing */}
                      <div className="w-5 h-5 flex items-center justify-center">
                        <Image
                          alt="XP"
                          src="https://c.animaapp.com/3mn7waJw/img/pic-7.svg"
                          width={17}
                          height={14}
                        />
                      </div>
                    </div>

                  </div>
                </div>
              </div>
              <div className="absolute w-[334px] h-12 top-[78px] left-0 bg-[#80279e]" />

              <div className="left-36 flex w-[87px] h-[30px] items-center gap-[169px] absolute top-[87px]">
                <div className="relative w-[87px] h-[30px]">
                  <div className="relative h-[29px] rounded-3xl bg-[linear-gradient(180deg,rgba(158,173,247,0.4)_0%,rgba(113,106,231,0.4)_100%)] flex items-center justify-center px-2">
                    <div className="flex items-center gap-1">
                      <div className="font-semibold text-[18px] leading-[normal] [font-family:'Poppins',Helvetica] text-[#FFFFFF] tracking-[0] top-2 left-10">
                        {userStats ? userStats.xp + userStats.balance : "1200"}
                      </div>
                      <Image
                        className="w-[23px] h-[23px] top-[5px] left-[48]"
                        alt="Coin"
                        src="https://c.animaapp.com/3mn7waJw/img/image-3937-4@2x.png"
                        width={20}
                        height={20}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="left-[236px] flex w-[87px] h-[30px] items-center gap-[169px] absolute top-[87px]">
                <div className="relative w-[87px] h-[30px]">
                  <div className="relative w-20 h-[29px] rounded-3xl bg-[linear-gradient(180deg,rgba(158,173,247,0.4)_0%,rgba(113,106,231,0.4)_100%)] flex items-center justify-center px-2">
                    <div className="flex items-center gap-1">
                      <div className="font-semibold text-[18px] leading-[normal] [font-family:'Poppins',Helvetica] text-[#FFFFFF] tracking-[0] top-2 left-10">
                        {userStats ? userStats.balance : "600"}
                      </div>
                      <Image
                        className="w-[23px] h-[18px] top-[5px] left-[48]"
                        alt="XP"
                        src="https://c.animaapp.com/3mn7waJw/img/pic-7.svg"
                        width={18}
                        height={18}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="absolute top-[89px] left-5 [font-family:'Poppins',Helvetica] font-normal text-[#FFFFFF] text-[16px] tracking-[0] leading-6 whitespace-nowrap">
                Total Earnings:
              </div>
            </div>
          </div>
        </div>
      </div>



      <div className="flex flex-col items-start gap-2.5 relative self-stretch w-full flex-[0_0_auto]">
        <div className="flex flex-col w-full items-start gap-2.5 px-0 py-2.5 relative flex-[0_0_auto] overflow-y-scroll">
          {filteredOtherGames.map((game, index) =>
            renderGameItem(game, index < filteredOtherGames.length - 1),
          )}
          {searchQuery && filteredOtherGames.length === 0 && otherGames.length > 0 && (
            <div className="text-white text-center py-4">No other games found for "{searchQuery}"</div>
          )}
        </div>
      </div>

      <div className="relative w-full max-w-[335px] mx-auto h-[100px] bg-[#360875] rounded-[10px] overflow-hidden">
        <div className="relative h-[99px] top-px bg-[url(https://c.animaapp.com/3mn7waJw/img/clip-path-group-3@2x.png)] bg-[100%_100%]">
          <div className="flex flex-col w-[205px] h-12 items-start absolute top-[25px] left-[116px]">
            <div className="flex flex-col items-start pt-0 pb-2 px-0 relative self-stretch w-full flex-[0_0_auto] mt-[2.4px]">
              <p className="relative w-fit mt-[-1.00px] [font-family:'Poppins',Helvetica] font-normal text-white text-sm tracking-[0] leading-4 whitespace-nowrap">
                Watch an ad to get a
              </p>
              <div className="flex items-center gap-1">
                <span className="relative w-fit ml-[-0.50px] [text-shadow:0px_4px_8px_#1a002f40] [-webkit-text-stroke:0.5px_transparent] [-webkit-background-clip:text] bg-[linear-gradient(180deg,rgba(255,255,255,1)_0%,rgba(245,245,245,1)_100%)] bg-clip-text [-webkit-text-fill-color:transparent] [text-fill-color:transparent] [font-family:'Poppins',Helvetica] font-semibold text-transparent text-[28px] tracking-[0] leading-8 whitespace-nowrap">
                  5
                </span>
                <Image
                  className="w-[34px] h-[30px] mb-[2px] object-contain"
                  alt="XP"
                  src="https://c.animaapp.com/3mn7waJw/img/pic-7.svg"
                  width={34}
                  height={30}
                />
              </div>
            </div>
          </div>
          <Image
            className="absolute w-[85px] h-[85px] top-[9px] left-[11px] object-cover"
            alt="Image"
            src="https://c.animaapp.com/3mn7waJw/img/image-3941@2x.png"
            width={85}
            height={85}
          />
        </div>
      </div>

      <div className="flex flex-col items-start gap-2.5 relative self-stretch w-full flex-[0_0_auto]">
        <div className="flex flex-col w-full items-start gap-2.5 px-0 py-2.5 relative flex-[0_0_auto] overflow-y-scroll">
          {filteredRecentGames.map((game, index) =>
            renderGameItem(game, index < filteredRecentGames.length - 1),
          )}
          {searchQuery && filteredRecentGames.length === 0 && recentGames.length > 0 && (
            <div className="text-white text-center py-4">No recent games found for "{searchQuery}"</div>
          )}
        </div>
      </div>

      <div className="w-full max-w-[335px] h-[255px] mx-auto flex flex-col items-center">
        <div className="w-full h-[24px] px-4 mb-2.5 mr-1">
          <h2 className="font-['Poppins',Helvetica] text-[16px]  mr-1 font-semibold leading-normal tracking-[0] text-[#FFFFFF]">
            Non- Gaming Offers
          </h2>
        </div>

        {/* 
        This is the card viewport. It is NOT scrollable.
        - `relative` is for positioning the absolute cards inside.
        - `overflow-hidden` clips the cards that move outside the bounds.
      */}
        <div className="relative w-full h-[220px] overflow-hidden">
          {nonGamingOffers.map((offer, index) => {
            const offset = index - activeIndex;

            const cardStyle = {
              transform: `translateX(calc(-50% + ${offset * HORIZONTAL_SPREAD}px)) scale(${offset === 0 ? 1 : 0.75})`,
              zIndex: totalCards - Math.abs(offset),
              opacity: offset === 0 ? 1 : 0.7,
              transition: 'all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1)',
            };

            return (
              <div
                key={offer.id}
                // The ONLY way to change the active card is by clicking.
                onClick={() => setActiveIndex(index)}
                className="absolute top-0 left-1/2 cursor-pointer"
                style={cardStyle}
              >
                {/* Card content - using your provided styles */}
                <div className="relative h-[220px] w-[165px]">
                  <img className="absolute inset-0 h-full w-full" alt="" src={offer.bgImage} />
                  <img className="absolute bottom-0 h-[57px] w-full object-cover" alt="" src={offer.bottomBg} />
                  <div className="absolute bottom-2 left-0 right-0 text-center font-['Poppins',Helvetica] text-base font-semibold leading-5 tracking-[0] text-white">
                    {formatTitle(offer.name)}
                  </div>
                  <img className="absolute top-20px left-1/2 h-[153px] w-[164px] -translate-x-1/2 object-full rounded-[10px]" alt={`${offer.name} app preview`} src={offer.image} />
                  <div className="absolute top-[127px] left-1/2 flex h-[29px] w-[120px] -translate-x-1/2 items-center justify-center rounded-[10px] bg-gradient-to-b from-[#9EADF7] to-[#716AE7]">
                    <span className="font-['Poppins',Helvetica] text-[13px] font-medium leading-normal tracking-[0] text-white">
                      {offer.earnAmount}
                    </span>
                    <img className="ml-1.5 h-[15px] w-[15px]" alt="$" src="https://c.animaapp.com/xCaMzUYh/img/image-3937-2@2x.png" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Extra spacing to ensure content isn't hidden behind navigation */}
      <div className="h-[6px]"></div>
    </div>
  );
};