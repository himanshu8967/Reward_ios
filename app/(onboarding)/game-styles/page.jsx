'use client'
import useOnboardingStore from '@/stores/useOnboardingStore'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux';

export default function GameStyleSelection() {
  const router = useRouter()
  const { gameStyle, setGameStyle, setCurrentStep } = useOnboardingStore()
  const { gameStyleOptions, status: onboardingStatus, error } = useSelector((state) => state.onboarding);


  useEffect(() => {
    setCurrentStep(4)
  }, [setCurrentStep])

  const handleSelectGameStyle = async (styleId) => {
    await setGameStyle(styleId)
    setTimeout(() => {
      router.push('/player-type')
    }, 200)
  }

  return (
    <div className='relative w-full h-screen bg-[#272052] overflow-hidden flex flex-col'>
      <div className='absolute w-[542px] h-[542px] top-0 left-0 bg-[#af7de6] rounded-full blur-[250px]' />

      <div className='relative z-10 px-4 sm:px-6 pt-16 sm:pt-20 pb-4 font-poppins'>
        <h1 className='text-white text-3xl sm:text-4xl font-light leading-tight mb-3 sm:mb-4'>
          What kind of games do you prefer?
        </h1>

        <p className='text-white/70 text-sm sm:text-base font-light'>
          Choose the pace and reward style you like.
        </p>
      </div>

      <div className='relative z-10 flex-1 flex flex-col items-center justify-center px-4 sm:px-6 pb-6 sm:pb-8 space-y-4 sm:space-y-6'>
        {onboardingStatus === 'loading' && (
          <p className='text-white text-center font-poppins'>Loading styles...</p>
        )}
        {onboardingStatus === 'failed' && (
          <p className='text-red-400 text-center font-poppins'>{error}</p>
        )}

        {onboardingStatus === 'succeeded' &&
          gameStyleOptions.map((option) => {
            const isSelected = gameStyle === option.id
            return (
              <button
                key={option.id}
                onClick={() => handleSelectGameStyle(option.id)}
                className='relative w-full max-w-[335px] h-16 group focus:outline-none'
              >
                <div
                  className={`absolute inset-x-0 top-0 h-18 bg-[#D8D5E9] rounded-full transition-transform duration-300 ${isSelected ? 'scale-105' : ''
                    }`}
                />
                <div
                  className={`absolute inset-x-0 top-0 h-16 rounded-full transition-all duration-300 flex flex-col items-center justify-center bg-white group-hover:translate-y-0.5 ${isSelected ? 'scale-105 shadow-lg shadow-[#AF7DE6]/50' : ''
                    }`}
                >
                  <span
                    className={`text-sm sm:text-base font-semibold font-poppins tracking-wide transition-colors duration-200 ${isSelected ? 'text-[#272052]' : 'text-[#2D2D2D]'
                      }`}
                  >
                    {option.label}
                  </span>
                  <p
                    className={`text-xs font-normal font-poppins mt-1 transition-colors duration-200 ${isSelected ? 'text-[#272052]/70' : 'text-[#2D2D2D]/70'
                      }`}
                  >
                    {option.description}
                  </p>
                </div>
              </button>
            )
          })}
      </div>
    </div>
  )
}