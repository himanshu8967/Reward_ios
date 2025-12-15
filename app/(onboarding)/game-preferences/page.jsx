'use client'
import useOnboardingStore from '@/stores/useOnboardingStore'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux';

export default function GamePreferencesSelection() {
  const router = useRouter()
  const { gamePreferences, setGamePreferences, setCurrentStep } =
    useOnboardingStore()
  const { gamePreferencesOptions, status: onboardingStatus, error } = useSelector((state) => state.onboarding);
  const [maxSelection, setMaxSelection] = useState(3)

  const gamePreferencesSafe = Array.isArray(gamePreferences)
    ? gamePreferences
    : []

  useEffect(() => {
    setCurrentStep(3)
  }, [setCurrentStep])

  const handlePreferenceSelect = async (optionId) => {
    const current = [...gamePreferencesSafe]

    let updated
    if (current.includes(optionId)) {
      updated = current.filter((item) => item !== optionId)
    } else {
      if (current.length < maxSelection) {
        updated = [...current, optionId]
      } else {
        return
      }
    }

    await setGamePreferences(updated)

    if (updated.length === maxSelection) {
      setTimeout(() => {
        router.push('/game-styles')
      }, 300)
    }
  }

  return (
    <div className='relative w-full h-screen bg-[#272052] overflow-hidden flex flex-col'>
      <div className='absolute w-[542px] h-[542px] top-0 left-0 bg-[#af7de6] rounded-full blur-[250px]' />

      {/* Fixed Header Section */}
      <div className='relative z-10 px-4 sm:px-6 pt-16 sm:pt-20 pb-4 font-poppins flex-shrink-0'>
        <h1 className='text-white text-2xl sm:text-3xl font-normal leading-tight mb-2 sm:mb-3'>
          What types of games do you enjoy playing?
        </h1>
        <p className='text-white/70 text-sm sm:text-base font-light mb-1'>Select up to 3</p>
      </div>

      {/* Scrollable Options Section */}
      <div className='relative z-10 flex-1 overflow-y-auto overflow-x-hidden px-4 sm:px-6 pb-6 sm:pb-8 scrollbar-hide'>
        <div className='w-full max-w-[335px] mx-auto py-4 space-y-4 sm:space-y-6'>
          {onboardingStatus === 'loading' && (
            <div className='flex items-center justify-center py-8'>
              <p className='text-white text-center font-poppins'>
                Loading game options...
              </p>
            </div>
          )}
          {onboardingStatus === 'failed' && (
            <div className='flex items-center justify-center py-8'>
              <p className='text-red-400 text-center font-poppins'>{error}</p>
            </div>
          )}

          {onboardingStatus === 'succeeded' && gamePreferencesOptions.map((option) => {
            const isSelected = gamePreferencesSafe.includes(option.id)
            return (
              <button
                key={option.id}
                onClick={() => handlePreferenceSelect(option.id)}
                className='relative w-full h-12 group focus:outline-none'
              >
                <div className='absolute inset-x-0 top-0 h-14 bg-[#D8D5E9] rounded-full' />
                <div
                  className={`absolute inset-x-0 top-0 h-12 rounded-full transition-all duration-300 flex items-center justify-start px-6 sm:px-8 gap-3 bg-white group-hover:translate-y-0.5 ${isSelected ? 'scale-105 shadow-lg shadow-[#AF7DE6]/50' : ''}`}
                >
                  {isSelected ? (
                    <div className='w-4 h-4 bg-[#7e22ce] rounded-md flex items-center justify-center flex-shrink-0'>
                      <svg
                        xmlns='http://www.w3.org/2000/svg'
                        className='w-2.5 h-2.5 text-white'
                        fill='none'
                        viewBox='0 0 24 24'
                        stroke='currentColor'
                        strokeWidth={3}
                      >
                        <path
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          d='M5 13l4 4L19 7'
                        />
                      </svg>
                    </div>
                  ) : (
                    <div className='w-4 h-4 border-2 border-gray-300 rounded flex-shrink-0' />
                  )}

                  <span
                    className={`text-sm font-semibold font-poppins tracking-wide transition-colors duration-200 ${isSelected ? 'text-[#272052]' : 'text-[#2D2D2D]'}`}
                  >
                    {option.label}
                  </span>
                </div>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}