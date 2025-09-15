import React from 'react'
import Link from "next/link";
import NextImage from "next/image";
export const Header = () => {
    return (
        <div className='w-[334px] h-full  flex-col justify-center items-center'>
            <div className=" font-normal  w-[334px]  text-[#A4A4A4]  mr-1 text-[10px] leading-3">
                App Version: V0.0.1
            </div>

            <header className="flex flex-col w-[334px] items-center justify-center gap-2 pt-7 pb-2">
                <div className="flex items-center justify-start gap-6 w-full">
                    <Link
                        className="relative w-6 h-6 flex-shrink-0"
                        aria-label="Go back"
                        href="/cash-coach"
                    >
                        <svg
                            className="w-6 h-6 mt-[2.5px]"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                d="M15 18L9 12L15 6"
                                stroke="white"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                        </svg>
                    </Link>
                    <h1 className="font-semibold text-[#FFFFFF] text-[20px] leading-5">
                        Achieve Your Goal
                    </h1>
                </div>
            </header>

        </div>
    )
}
