"use client";
import React, { useMemo, useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { getProfile, getProfileStats, getVipStatus, updateProfile } from "@/lib/api";


export default function MyProfile() {
  const router = useRouter();
  const { user, token, signOut } = useAuth();
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState(null);
  const [vipStatus, setVipStatus] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // ---- Static data (images as in your Figma handoff) ----
  const achievements = [
    {
      id: 1,
      title: "Your First Win",
      description: "Won your first match in\nSweet Bonanza",
      points: 150,
      bonus: 100,
      image: "https://c.animaapp.com/V1uc3arn/img/image-3926@2x.png",
      bgImage: "https://c.animaapp.com/V1uc3arn/img/oval@2x.png",
    },
    {
      id: 2,
      title: "Level 4 Reached",
      description: "Won your first match in\nGame of Olympus",
      points: 150,
      bonus: 100,
      image: "https://c.animaapp.com/V1uc3arn/img/image-3928@2x.png",
      bgImage: "https://c.animaapp.com/V1uc3arn/img/oval-1@2x.png",
    },
  ];

  const leadershipGames = [
    {
      id: 1,
      title: "Commando",
      level: "Level 11",
      category: "Action",
      views: "5.6 K",
      image: "https://c.animaapp.com/V1uc3arn/img/rectangle-24@2x.png",
    },
    {
      id: 2,
      title: "Robbery Bob",
      level: "Level 19",
      category: "Action",
      views: "8.1 K",
      image: "https://c.animaapp.com/V1uc3arn/img/rectangle-25@2x.png",
    },
  ];

  // ---- Derived UI state ----
  // JACK_59: Make Theme label reflect the *actual* active theme, even if the
  // backend value is inconsistent or a different casing.
  const themeLabel = useMemo(() => {
    return "Dark Mode";
  }, [profile?.profile?.theme]);

  // JACK_59: compute notifications toggle safely
  const notificationsEnabled =
    (profile?.profile?.notifications ?? false) === true;

  // ---- Navigation handlers ----
  const handleEditProfile = () => router.push("/edit-profile");
  const handleVipUpgrade = () => router.push("/vip-plans");

  // ---- Data fetch ----
  useEffect(() => {
    if (!token) return;
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [profileData, statsData, vipData] = await Promise.all([
          getProfile(token),
          getProfileStats(token),
          getVipStatus(token),
        ]);
        setProfile(profileData);
        setStats(statsData);
        setVipStatus(vipData);
      } catch (err) {
        setError(err?.message || "Failed to fetch profile data.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [token]);

  // ---- Actions ----
  const handleToggleNotifications = async () => {
    if (!profile || !token) return;
    const original = profile.profile?.notifications ?? false;
    const next = !original;

    // optimistic
    setProfile((prev) =>
      prev
        ? {
          ...prev,
          profile: { ...(prev.profile || {}), notifications: next },
        }
        : prev
    );

    try {
      await updateProfile({ notifications: next }, token);
    } catch {
      alert("Failed to update notification settings. Please try again.");
      // revert
      setProfile((prev) =>
        prev
          ? {
            ...prev,
            profile: { ...(prev.profile || {}), notifications: original },
          }
          : prev
      );
    }
  };

  // ---- Loading / Error ----
  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex justify-center items-center text-white text-xl">
        Loading Profile...
      </div>
    );
  }
  if (error) {
    return (
      <div className="min-h-screen bg-black flex justify-center items-center text-red-500 text-xl">
        Error: {error}
      </div>
    );
  }

  // ---- Render ----
  return (
    <div className="min-h-screen overflow-x-hidden bg-black flex justify-center">
      <div className="relative w-full max-w-md min-h-screen bg-black pb-8">
        {/* App version */}
        <div className="absolute top-[12px] left-4 sm:left-5 font-normal text-white text-[10px] leading-3">
          App Version: V0.0.1
        </div>

        {/* Header */}
        <header className="flex flex-col w-full items-start gap-2 px-4 sm:px-5 py-3 absolute top-[54px] left-0">
          <div className="flex items-center gap-4 w-full">
            <button
              className="relative w-6 h-6 flex-shrink-0"
              aria-label="Go back"
              onClick={() => router.back()}
            >
              <Image
                width={24}
                height={24}
                className="w-6 h-6"
                alt="Back"
                src="https://c.animaapp.com/V1uc3arn/img/arrow-back-ios-new@2x.png"
              />
            </button>

            <h1 className="font-semibold text-white text-xl leading-5">
              My Profile
            </h1>
          </div>
        </header>

        <main className="flex flex-col w-full items-center gap-6 absolute top-[110px] left-0 px-1 sm:px-2">
          {/* ---------------- Profile Section ---------------- */}
          <section className="flex flex-col w-full max-w-[335px] items-center">
            {/* Avatar + Edit holder */}
            <div className="relative">
              {/* Avatar */}
              <img
                width={132}
                height={132}
                className="w-[132px] h-[132px] object-cover rounded-full"
                alt="Profile avatar"
                src={profile?.profile?.avatar || "https://c.animaapp.com/xCaMzUYh/img/group-4-1@2x.png"}
                crossOrigin="anonymous"
                onError={(e) => {
                  console.log("Avatar failed to load, falling back to default");
                  e.target.src = "https://c.animaapp.com/xCaMzUYh/img/group-4-1@2x.png";
                }}
              />

              {/* JACK_51: Edit badge in its own holder (no overlap/clipping) */}
              <button
                onClick={handleEditProfile}
                aria-label="Edit profile"
                className="
                  absolute
                  -right-4 bottom-2
                  flex items-center justify-center
                  w-[44px] h-[44px]
                  rounded-full
                  bg-[#1F1F1F]
                  border-4 border-[#2C2C2C]
                  shadow-[0_4px_14px_rgba(0,0,0,0.5)]
                "
              /* holder sits outside avatar circle */
              >
                <Image
                  width={20}
                  height={20}
                  alt="Edit"
                  src="https://c.animaapp.com/V1uc3arn/img/line-design-edit-line.svg"
                />
              </button>
            </div>

            {/* JACK_52: Clean vertical stack — Name, VIP badge/level */}
            <h2 className="font-semibold text-[#FEFEFE] text-[22px] mt-2 text-center truncate max-w-[300px] ">
              {((profile?.firstName || "Player") + " " + (profile?.lastName || "")).trim()}
            </h2>

            <div className="flex  items-center  mt-1">
              <img
                src="/badge.png"
                alt="Badge"
                className="w-14 h-14  flex-shrink-0 object-contain"
              />
              <span className="text-[#FEFEFE] pb-5  text-lg pr-2  font-normal">
                {vipStatus?.level ? vipStatus.level.charAt(0).toUpperCase() + vipStatus.level.slice(1).toLowerCase() : "Bronze"} Badge
              </span>
            </div>

            {/* Contact section with improved spacing */}
            <div className="flex flex-col items-center gap-2 -mt-3 ">
              <div className="flex items-center justify-center gap-2 text-[#FEFEFE] text-sm leading-5 w-full">
                <Image
                  width={5}
                  height={5}
                  alt="Mail"
                  src="https://c.animaapp.com/V1uc3arn/img/image-3958@2x.png"
                  className="w-[22px] h-[17px] flex-shrink-0"
                />
                <span className="text-[#FEFEFE] text-lg font-normal text-center truncate max-w-[120px]">
                  {profile?.email || "youremail@domain.com"}
                </span>
                <span className="opacity-60 text-[#FEFEFE] text-lg font-normal mx-1 flex-shrink-0">|</span>
                <span className="text-[#FEFEFE] text-lg font-normal text-center flex-shrink-0">{profile?.mobile || "+01 234 567 89"}</span>
              </div>

              <div className="flex items-center gap-1  text-gray-300 text-sm leading-5">
                <Image
                  width={32}
                  height={32}
                  className="w-[34px] h-[22px] object-cover flex-shrink-0"
                  alt="Flag"
                  src="https://c.animaapp.com/V1uc3arn/img/image-3956@2x.png"
                />
                <span className="tracking-wide font-normal text-lg text-[#FEFEFE]">{profile?.socialTag || "GamePro"}</span>
              </div>
            </div>
          </section>

          {/* ---------------- Earnings ---------------- */}
          <section className="flex flex-col items-center gap-2.5 w-full">
            <div className="flex justify-center w-full">
              <div className="relative w-[335px]">
                <div
                  className="relative h-[134px] rounded-[12px] pt-30 overflow-hidden"
                  style={{
                    backgroundImage:
                      "url(https://c.animaapp.com/V1uc3arn/img/blank-button03@2x.png)",
                    backgroundSize: "cover",
                  }}
                >
                  <div className="absolute top-[10px] mt-3 ml-5">
                    <div className="text-[#FFFFFF] text-[14px]">My Earnings</div>
                    <div className="flex items-center  gap-2 ml-5">
                      <div className="font-semibold text-white text-2xl">
                        {stats?.balance ?? 0}
                      </div>
                      <Image
                        width={23}
                        height={24}
                        alt="Coin"
                        src="https://c.animaapp.com/V1uc3arn/img/image-3937@2x.png"
                      />
                    </div>
                  </div>

                  <div className="absolute top-[39px]  mt-1 left-[103px] flex items-center ml-3 gap-2">
                    <div className="font-semibold text-white text-2xl">
                      {stats?.xp ?? 0}
                    </div>
                    <Image
                      width={26}
                      height={21}
                      alt="Trophy icon"
                      src="https://c.animaapp.com/V1uc3arn/img/pic.svg"
                    />
                  </div>

                  <div className="absolute w-[205px] h-[37px] top-[73px] left-4">
                    <div className="relative w-[178px] h-[37px]">
                      <div
                        className="absolute w-[178px] h-[37px] top-0 left-0"
                        style={{
                          backgroundImage:
                            "url(https://c.animaapp.com/V1uc3arn/img/group-289352@2x.png)",
                          backgroundSize: "cover",
                        }}
                      >
                        <Image
                          width={29}
                          height={30}
                          className="absolute top-1 left-[3px]"
                          alt="Level badge"
                          src="https://c.animaapp.com/V1uc3arn/img/ellipse-35.svg"
                        />
                        <div className="absolute top-[6px] left-[14px] font-semibold text-[#815c23] text-[14.9px]">
                          2
                        </div>
                      </div>
                    </div>

                    <p className="absolute top-[9px] left-[60px] font-semibold text-xs">
                      <span className="text-[#685512]">
                        {stats?.gamesPlayed ?? 0}
                      </span>
                      <span className="text-[#8d741b80]">/6000</span>
                    </p>

                    <div className="absolute top-1 left-[141px] opacity-50">
                      <div className="relative w-[30px] h-[30px]">
                        <div className="absolute w-[30px] h-[30px] top-0 left-0">
                          <div
                            className="h-[30px]"
                            style={{
                              backgroundImage:
                                "url(https://c.animaapp.com/V1uc3arn/img/ellipse-35-1.svg)",
                              backgroundSize: "cover",
                            }}
                          />
                        </div>
                        <div className="absolute top-[4px] left-[10px] font-semibold text-[#815c23] text-[14.9px]">
                          3
                        </div>
                      </div>
                    </div>

                    <Image
                      width={12}
                      height={11}
                      className="absolute top-3 left-[41px]"
                      alt="Vector"
                      src="https://c.animaapp.com/V1uc3arn/img/vector.svg"
                    />
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ---------------- Achievements ---------------- */}
          <section className="flex flex-col w-full max-w-[335px] items-start gap-2.5 mx-auto">
            <div className="flex w-full items-center justify-between">
              <div className="inline-flex items-center gap-2">
                <Image
                  width={43}
                  height={44}
                  alt="Trophy"
                  src="https://c.animaapp.com/V1uc3arn/img/trophy@2x.png"
                />
                <h3 className="font-semibold text-white text-base">
                  Achievements
                </h3>
              </div>
              <button className="font-medium text-[#8b92de] text-base">
                See All
              </button>
            </div>

            {achievements.map((a) => (
              <article
                key={a.id}
                className="relative w-full max-w-[335px] h-[92px] bg-black rounded-[10px] shadow-[2.48px_2.48px_18.58px_#a6aabc4c,-1.24px_-1.24px_16.1px_#f9faff1a]"
              >
                <div
                  className="absolute w-16 h-16 top-3.5 left-4 bg-cover bg-center"
                  style={{ backgroundImage: `url(${a.bgImage})` }}
                >
                  <Image
                    width={63}
                    height={49}
                    className="absolute top-[15px] left-0"
                    alt={a.title}
                    src={a.image}
                  />
                </div>

                <h4 className="absolute top-[13px] left-[92px] font-bold text-[#d9d9d9] text-base">
                  {a.title}
                </h4>

                <p className="absolute top-10 left-[92px] font-light text-[#d9d9d9] text-[13px] leading-4 whitespace-pre-line">
                  {a.description}
                </p>

                <div className="absolute w-[60px] h-[58px] top-4 left-[261px]">
                  <div className="absolute -top-px left-0 font-semibold text-white text-xl text-right">
                    {a.points}
                  </div>
                  <Image
                    width={21}
                    height={22}
                    className="absolute top-1 left-[38px]"
                    alt="Coin"
                    src="https://c.animaapp.com/V1uc3arn/img/image-3937-2@2x.png"
                  />
                  <div className="absolute w-[59px] h-6 top-[33px] left-0 bg-[#201f58] rounded">
                    <div className="relative w-[49px] h-[15px] top-[5px] left-[5px] flex items-center">
                      <div className="font-medium text-white text-[13px] leading-[13px]">
                        +{a.bonus}
                      </div>
                      <Image
                        width={16}
                        height={15}
                        className="ml-1"
                        alt="Trophy"
                        src={`https://c.animaapp.com/V1uc3arn/img/pic-${a.id}.svg`}
                      />
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </section>

          {/* ---------------- VIP ---------------- */}
          {vipStatus?.level === "BRONZE" ? (
            <section className="relative w-full max-w-[335px] h-[127px] mx-auto">
              <Image
                width={334}
                height={127}
                className="w-full h-[140px]"
                alt="VIP background"
                src="https://c.animaapp.com/V1uc3arn/img/race.svg"
              />
              <Image
                width={215}
                height={119}
                className="absolute w-[215px] h-[119px] top-2 left-0"
                alt="VIP decoration"
                src="https://c.animaapp.com/V1uc3arn/img/clip-path-group@2x.png"
              />
              <div className="flex flex-col w-[198px] absolute top-[21px] left-[25px]">
                <div className="flex flex-col pb-2">
                  <div className="font-bold text-white text-sm">Become a</div>
                  <h3 className="font-semibold text-white text-[32px] leading-8">
                    VIP Member
                  </h3>
                </div>
                <button
                  onClick={handleVipUpgrade}
                  className="w-fit px-4 py-2 bg-[#ffdd8f] rounded-xl hover:opacity-90 transition-transform active:scale-95 [font-family:'Poppins',Helvetica] font-semibold text-[#736de8] text-[13px] tracking-[0] leading-[normal]"
                >
                  Check Plans
                </button>
              </div>
            </section>
          ) : (
            <section className="w-full max-w-[335px] h-[127px] p-6 rounded-lg bg-gradient-to-br from-purple-700 to-indigo-900 flex flex-col justify-center mx-auto">
              <div className="font-bold text-yellow-300 text-sm">You are a</div>
              <h3 className="font-semibold text-white text-3xl">
                {vipStatus?.level} Member
              </h3>
              {vipStatus?.expires && (
                <p className="mt-2 text-xs text-white/80">
                  Expires on:{" "}
                  {new Date(vipStatus.expires).toLocaleDateString()}
                </p>
              )}
            </section>
          )}

          {/* ---------------- Invite Friends ----------------
              JACK_57: ensure the card is fully visible (no cropping).
              - Remove overflow clipping from parent
              - Use fixed height container that matches artwork, but *no* negative margins
          */}
          <section className="w-full flex justify-center">
            <div className="flex justify-center w-full">
              <div className="relative w-[335px]">
                <div
                  className="relative h-[134px] rounded-[12px] overflow-hidden"
                  style={{
                    backgroundImage:
                      "url(https://c.animaapp.com/V1uc3arn/img/blank-button03-1@2x.png)",
                    backgroundSize: "cover",
                  }}
                >
                  <h4 className="absolute top-[19px] left-4 text-white text-lg">
                    Invite Friends
                  </h4>
                  <div className="absolute top-[46px] left-4 font-bold text-white text-lg">
                    Get a Premium Badge
                  </div>

                  <div className="absolute w-[67px] h-[67px] top-[27px] right-4 shadow-[0px_37.16px_55.74px_#eab02066]">
                    <div className="relative w-[67px] h-[67px]">
                      <div
                        className="absolute inset-0 bg-cover"
                        style={{
                          backgroundImage:
                            "url(https://c.animaapp.com/V1uc3arn/img/star-6-1.svg)",
                        }}
                      >
                        <div
                          className="relative w-full h-full bg-cover"
                          style={{
                            backgroundImage:
                              "url(https://c.animaapp.com/V1uc3arn/img/star-7-1.svg)",
                          }}
                        >
                          <Image
                            width={46}
                            height={47}
                            className="absolute top-[11px] left-2.5"
                            alt="Premium badge"
                            src="https://c.animaapp.com/V1uc3arn/img/rectangle-1485-1.svg"
                          />
                        </div>
                      </div>

                      <Image
                        width={22}
                        height={16}
                        className="absolute top-[25px] left-[23px]"
                        alt="Check icon"
                        src="https://c.animaapp.com/V1uc3arn/img/icon-navigation-check-24px-1.svg"
                      />
                      <Image
                        width={47}
                        height={47}
                        className="absolute top-[11px] left-2.5"
                        alt="Badge circle"
                        src="https://c.animaapp.com/V1uc3arn/img/ellipse-10-1.svg"
                      />
                    </div>
                  </div>

                  <button className="inline-flex px-3.5 py-2 absolute top-[76px] left-4 bg-[#ffdd8f] rounded-xl">
                    <span className="font-semibold text-[#736de8] text-[13px]">
                      Know More
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* ---------------- Leadership ---------------- */}
          <section className="flex flex-col w-full max-w-[335px] items-start gap-2.5 mx-auto">
            {/* JACK_58: Ensure heading is present and styled */}
            <h3 className="font-semibold text-white text-base">Leadership</h3>

            <div className="flex items-center gap-[15px] w-full">
              {leadershipGames.map((game) => (
                <article key={game.id} className="relative w-40 h-[281px]">
                  <div
                    className="absolute w-40 h-[180px] top-0 left-0 bg-cover bg-center rounded-[20px]"
                    style={{
                      backgroundImage: `linear-gradient(180deg, rgba(0,0,0,0.31) 0%, rgba(0,0,0,0.65) 88%), url(${game.image})`,
                    }}
                  >
                    <div className="relative w-[68px] h-[25px] top-3 left-[82px]">
                      <div className="relative w-[66px] h-[25px] bg-[#ffffff4f] rounded-[5.32px] backdrop-blur-[2.66px]">
                        <Image
                          width={13}
                          height={10}
                          className="absolute top-2 left-[7px]"
                          alt="Views icon"
                          src="https://c.animaapp.com/V1uc3arn/img/vector-2.svg"
                        />
                        <div className="absolute top-[3px] left-[25px] font-bold text-white text-[13px]">
                          {game.views}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col w-[154px] gap-2 absolute top-[196px] left-0">
                    <div className="flex flex-col gap-1">
                      <h4 className="font-semibold text-white text-base">
                        {game.title}
                      </h4>

                      <div className="w-[120px] h-[37px] rounded-[10px] overflow-hidden bg-[linear-gradient(180deg,rgba(158,173,247,0.6)_0%,rgba(113,106,231,0.6)_100%)] flex items-center pl-2">
                        <div className="font-medium text-white text-base">
                          {game.level}
                        </div>
                      </div>

                      <div className="text-white text-[13px]">{game.category}</div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>

          {/* ---------------- Spin & Win ---------------- */}
          <section className="w-full flex justify-center">
            <div className="relative w-full max-w-[335px] h-[103px] rounded-[10px] overflow-hidden bg-[linear-gradient(107deg,rgba(200,117,251,1)_0%,rgba(16,4,147,1)_100%)]">
              <div className="inline-flex flex-col items-start pl-4 pr-8 py-4">
                <h4 className="font-bold text-[#e5bfff] text-sm">Spin &amp; Win</h4>
                <div className="relative">
                  <div className="font-bold text-white text-[32px] leading-8">
                    50
                  </div>
                  <Image
                    width={23}
                    height={24}
                    className="absolute top-[2px] left-[46px]"
                    alt="Coin"
                    src="https://c.animaapp.com/V1uc3arn/img/image-3937-3@2x.png"
                  />
                </div>
                <p className="font-medium text-white text-xs">
                  Click to spin the wheel
                </p>
              </div>

              <Image
                width={102}
                height={62}
                className="absolute top-[18px] left-[195px]"
                alt="Spin wheel"
                src="https://c.animaapp.com/V1uc3arn/img/spin-icon@2x.png"
              />

              {/* decorative assets kept as-is */}
              <Image
                width={42}
                height={39}
                className="absolute top-[22px] left-[145px]"
                alt=""
                src="https://c.animaapp.com/V1uc3arn/img/-----6@2x.png"
              />
              <Image
                width={30}
                height={31}
                className="absolute top-[63px] left-[175px]"
                alt=""
                src="https://c.animaapp.com/V1uc3arn/img/-----9@2x.png"
              />
              <Image
                width={44}
                height={46}
                className="absolute top-14 left-[275px]"
                alt=""
                src="https://c.animaapp.com/V1uc3arn/img/-----5@2x.png"
              />
              <Image
                width={44}
                height={46}
                className="absolute top-[3px] left-[291px]"
                alt=""
                src="https://c.animaapp.com/V1uc3arn/img/-----10@2x.png"
              />
              <Image
                width={8}
                height={8}
                className="absolute top-1.5 left-48"
                alt=""
                src="https://c.animaapp.com/V1uc3arn/img/vector-3.svg"
              />
              <Image
                width={8}
                height={8}
                className="absolute top-[19px] left-[129px]"
                alt=""
                src="https://c.animaapp.com/V1uc3arn/img/vector-4.svg"
              />
              <Image
                width={5}
                height={5}
                className="absolute top-[46px] left-48"
                alt=""
                src="https://c.animaapp.com/V1uc3arn/img/vector-5.svg"
              />
              <Image
                width={5}
                height={5}
                className="absolute top-11 left-[302px]"
                alt=""
                src="https://c.animaapp.com/V1uc3arn/img/vector-6.svg"
              />
              <Image
                width={8}
                height={8}
                className="absolute top-[70px] left-[164px]"
                alt=""
                src="https://c.animaapp.com/V1uc3arn/img/vector-8.svg"
              />
              <Image
                width={8}
                height={8}
                className="absolute top-[13px] left-[270px]"
                alt=""
                src="https://c.animaapp.com/V1uc3arn/img/vector-8.svg"
              />
              <Image
                width={26}
                height={24}
                className="absolute top-[73px] left-[250px]"
                alt=""
                src="https://c.animaapp.com/V1uc3arn/img/-----8@2x.png"
              />
            </div>
          </section>

          {/* ---------------- Settings ---------------- */}
          <section className="flex flex-col w-full max-w-[335px] items-start gap-2.5 mx-auto">
            <h3 className="font-semibold text-white text-base">Settings</h3>

            {/* group 1 */}
            <div className="w-full bg-[#141414] rounded-lg border border-[#494949] shadow p-4">
              {/* Notifications */}
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-4">
                  <Image
                    width={24}
                    height={24}
                    alt="Notifications"
                    src="https://c.animaapp.com/V1uc3arn/img/line-media-notification-3-line.svg"
                    className="w-6 h-6"
                  />
                  <span className="text-white text-base">Notifications</span>
                </div>
                <button
                  className={`w-[42px] h-[22px] rounded-[10px] relative transition-all ${notificationsEnabled ? "bg-[#8b92de]" : "bg-gray-500"
                    }`}
                  onClick={handleToggleNotifications}
                  aria-label="Toggle Notifications"
                >
                  <span
                    className={`absolute top-[3px] w-4 h-4 bg-white rounded-full transition-all ${notificationsEnabled ? "left-[22px]" : "left-[3px]"
                      }`}
                  />
                </button>
              </div>

              {/* Language */}
              <div className="flex items-center justify-between w-full mt-6">
                <div className="flex items-center gap-4">
                  <Image
                    width={24}
                    height={24}
                    alt="Language"
                    src="https://c.animaapp.com/V1uc3arn/img/line-editor-translate-2.svg"
                    className="w-6 h-6"
                  />
                  <span className="text-white text-base">Language</span>
                </div>
                <span className="text-[#8b92de] text-sm">English</span>
              </div>
            </div>

            {/* group 2 */}
            <div className="w-full bg-[#141414] rounded-lg border border-[#494949] shadow p-4">
              {/* Security */}
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-4">
                  <Image
                    width={24}
                    height={24}
                    alt="Security"
                    src="https://c.animaapp.com/V1uc3arn/img/line-business-projector-2-line.svg"
                    className="w-6 h-6"
                  />
                  <span className="text-white text-base">Security</span>
                </div>
              </div>

              {/* Theme (JACK_59 fixed) */}
              <div className="flex items-center justify-between w-full mt-6">
                <div className="flex items-center gap-4">
                  <Image
                    width={24}
                    height={24}
                    alt="Theme"
                    src="https://c.animaapp.com/V1uc3arn/img/line-health-mental-health-line.svg"
                    className="w-6 h-6"
                  />
                  <span className="text-white text-base">Theme</span>
                </div>
                <span className="text-[#8b92de] text-sm">{themeLabel}</span>
              </div>
            </div>

            {/* group 3 */}
            <div className="w-full mb-8 bg-[#141414] rounded-lg border border-[#494949] shadow p-4">
              {/* Tickets / Complaints */}
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-4">
                  <Image
                    width={24}
                    height={24}
                    alt="Tickets / Complaints"
                    src="https://c.animaapp.com/V1uc3arn/img/line-user-contacts-line.svg"
                    className="w-6 h-6"
                  />
                  <span className="text-white text-base">
                    Tickets / Complaints
                  </span>
                </div>
                <button
                  className="w-6 h-6"
                  aria-label="Go to Tickets / Complaints"
                >
                  <Image
                    width={24}
                    height={24}
                    alt="Arrow"
                    src="https://c.animaapp.com/V1uc3arn/img/arrow-back-ios-new-3@2x.png"
                    className="w-6 h-6"
                  />
                </button>
              </div>

              {/* Contact us */}
              <div className="flex items-center justify-between w-full mt-6">
                <div className="flex items-center gap-4">
                  <Image
                    width={24}
                    height={24}
                    alt="Contact us"
                    src="https://c.animaapp.com/V1uc3arn/img/line-communication-chat-quote-line.svg"
                    className="w-6 h-6"
                  />
                  <span className="text-white text-base">Contact us</span>
                </div>
                <button className="w-6 h-6" aria-label="Go to Contact us">
                  <Image
                    width={24}
                    height={24}
                    alt="Arrow"
                    src="https://c.animaapp.com/V1uc3arn/img/arrow-back-ios-new-3@2x.png"
                    className="w-6 h-6"
                  />
                </button>
              </div>

              {/* Privacy policy */}
              <div className="flex items-center justify-between w-full mt-6">
                <div className="flex items-center gap-4">
                  <Image
                    width={24}
                    height={24}
                    alt="Privacy policy"
                    src="https://c.animaapp.com/V1uc3arn/img/line-system-lock-2-line.svg"
                    className="w-6 h-6"
                  />
                  <span className="text-white text-base">Privacy policy</span>
                </div>
                <button className="w-6 h-6" aria-label="Go to Privacy policy">
                  <Image
                    width={24}
                    height={24}
                    alt="Arrow"
                    src="https://c.animaapp.com/V1uc3arn/img/arrow-back-ios-new-3@2x.png"
                    className="w-6 h-6"
                  />
                </button>
              </div>
              <div className="flex items-center justify-between w-full mt-6">
                <div className="flex items-center gap-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-6 h-6 text-white"
                    onClick={signOut}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75"
                    />
                  </svg>
                  <span onClick={signOut} className="text-white text-base">Log out</span>
                </div>
                <button
                  className="w-6 h-6"
                  aria-label="Log out of your account"
                  onClick={signOut}
                >
                  {/* Using a forward arrow for UI consistency with other items in the block */}
                  <Image
                    width={24}
                    height={24}
                    alt="Perform action"
                    src="https://c.animaapp.com/V1uc3arn/img/arrow-back-ios-new-3@2x.png"
                    className="w-6 h-6"
                  />
                </button>
              </div>

            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
