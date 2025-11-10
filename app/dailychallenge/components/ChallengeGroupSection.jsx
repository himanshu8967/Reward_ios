import React from "react";

export const ChallengeGroupSection = ({ streak }) => {
    // Generate milestones dynamically from streak data
    const generateMilestones = () => {
        if (!streak?.milestones) return [];

        const positions = ["7.35%", "31.76%", "56.17%", "80.58%"];
        return streak.milestones.map((milestone, index) => ({
            value: milestone,
            leftPosition: positions[index] || `${(index + 1) * 20}%`,
        }));
    };

    const milestones = generateMilestones();

    const currentStreak = streak?.current || 0;
    const nextMilestone = streak?.nextMilestone || 5;

    return (
        <section
            className="absolute w-[336px] h-[30px] top-[150px] left-[19px] flex"
            role="region"
            aria-label="Challenge progress milestones"
        >
            <div className="flex-1 w-[340px] relative">
                {/* Progress bar background - using RewardProgress design */}
                <div className="absolute w-full h-[25px] top-0 left-0">
                    <div className="relative w-full h-[25px]">
                        {/* Progress bar background - lighter colors */}
                        <div className="absolute w-full h-full rounded-full overflow-hidden ring-1 ring-[#a68b4a] bg-gradient-to-r from-[#6b5424] to-[#8b7332] shadow-[inset_0_1px_0_rgba(255,255,255,0.08),inset_0_-1px_0_rgba(0,0,0,0.25)]"></div>

                        {/* Progress bar fill */}
                        <div
                            className="absolute h-full rounded-full bg-gradient-to-r from-[#ffd700] via-[#ffed4e] to-[#f4d03f] shadow-[inset_0_1px_0_rgba(255,255,255,0.35)]"
                            style={{
                                width: `${Math.min((currentStreak / (nextMilestone || 5)) * 100, 100)}%`,
                            }}
                        ></div>

                        {/* Milestone indicators with treasure chests */}
                        {milestones.map((milestone, index) => {
                            const isCompleted = currentStreak >= milestone.value;
                            const isCurrent = milestone.value === nextMilestone;
                            const position = parseFloat(milestone.leftPosition) / 100 * 336; // Convert percentage to pixels

                            // Treasure chest images for 3 chests
                            const chestImages = [
                                "https://c.animaapp.com/b23YVSTi/img/2211-w030-n003-510b-p1-510--converted--02-2@2x.png", // Small chest
                                "https://c.animaapp.com/b23YVSTi/img/2211-w030-n003-510b-p1-510--converted--02-3@2x.png", // Medium chest
                                "https://c.animaapp.com/b23YVSTi/img/2211-w030-n003-510b-p1-510--converted--02-4@2x.png", // Large chest
                            ];

                            const chestSizes = [
                                { width: "31px", height: "35px" },
                                { width: "37px", height: "47px" },
                                { width: "55px", height: "58px" },
                            ];

                            return (
                                <React.Fragment key={index}>
                                    {/* Treasure chest above milestone - only show first 3 */}
                                    {index < 3 && (
                                        <img
                                            className="absolute"
                                            style={{
                                                top: index === 0 ? "-40px" : index === 1 ? "-54px" : index === 2 ? "-64px" : "-56px",
                                                left: `${position - 12}px`,
                                                width: chestSizes[index]?.width || "31px",
                                                height: chestSizes[index]?.height || "35px",
                                                zIndex: 10, // Ensure chests are above other elements
                                            }}
                                            alt={`Treasure chest ${index + 1} - Milestone ${milestone.value}`}
                                            src={chestImages[index] || chestImages[0]}
                                        />
                                    )}

                                    {/* Milestone indicator circle - bigger like Figma */}
                                    <div
                                        className="absolute w-[30px] h-[30px] top-[-3px] rounded-full border-2 flex items-center justify-center"
                                        style={{
                                            left: `${position - 15}px`, // Better centering to match chest positioning
                                            backgroundColor: isCompleted ? '#ffd700' : '#6b5424',
                                            borderColor: isCompleted ? '#b8860b' : '#a68b4a', // Match progress bar track border color
                                            zIndex: 5, // Ensure indicators are above progress bar
                                        }}
                                    >
                                        <div className="[font-family:'Poppins',Helvetica] font-semibold text-[14px] tracking-[0.02px] leading-[normal]"
                                            style={{
                                                color: isCompleted ? '#815c23' : '#ffffff'
                                            }}>
                                            {milestone.value}
                                        </div>
                                    </div>
                                </React.Fragment>
                            );
                        })}
                    </div>
                </div>
            </div>
        </section>
    );
};
