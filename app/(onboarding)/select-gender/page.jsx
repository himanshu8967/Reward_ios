'use client'
import useOnboardingStore from '@/stores/useOnboardingStore'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux';
export default function GenderSelection() {
  const router = useRouter()
  const { gender, setGender, setCurrentStep } = useOnboardingStore()
  const { genderOptions, status: onboardingStatus, error } = useSelector((state) => state.onboarding);



  useEffect(() => {
    setCurrentStep(2);
  }, [setCurrentStep]);



  const handleGenderSelect = async (selectedGender) => {
    await setGender(selectedGender);
    setTimeout(() => {
      router.push('/game-preferences');
    }, 200);
  };

  return (
    <div className='relative w-full h-screen bg-[#272052] overflow-hidden flex flex-col'>
      <div className='absolute w-[542px] h-[542px] top-0 left-0 bg-[#af7de6] rounded-full blur-[250px]' />

      <div className='relative z-10 px-4 sm:px-6 pt-16 sm:pt-20 pb-4 font-poppins'>
        <h1 className='text-white text-3xl sm:text-4xl font-light leading-tight mt-1 mb-3 sm:mb-4'>
          Select your gender
        </h1>
        <p className='text-white/70 text-sm sm:text-base font-light'>
          This will help to make your training plan more relevant
        </p>
      </div>

      <div className='relative z-10 flex-1 flex flex-col justify-center items-center px-4 sm:px-6 pb-6 sm:pb-8 space-y-4 sm:space-y-6'>

        {onboardingStatus === 'succeeded' && genderOptions.map((option) => {
          const isSelected = gender === option.id;
          return (
            <button
              key={option.id}
              onClick={() => handleGenderSelect(option.id)}
              className='relative w-full max-w-[335px] h-14 sm:h-16 group focus:outline-none'
            >
              <div
                className={`absolute inset-x-0 top-0 h-16 sm:h-18 bg-[#D8D5E9] rounded-full transition-transform duration-300 ${isSelected ? 'scale-105' : ''
                  }`}
              />
              <div
                className={`absolute inset-x-0 top-0 h-14 sm:h-16 rounded-full transition-all duration-300 flex items-center justify-center bg-white group-hover:translate-y-0.5 ${isSelected ? 'scale-105 shadow-lg shadow-[#AF7DE6]/50' : ''
                  }`}
              >
                <span
                  className={`text-sm sm:text-base font-semibold font-poppins tracking-wide transition-colors duration-200 ${isSelected ? 'text-[#272052]' : 'text-[#2D2D2D]'
                    }`}
                >
                  {option.label}
                </span>
              </div>
            </button>
          );
        })}
        {onboardingStatus === 'loading' && (
          <p className="text-white mb-4 text-center font-poppins">Loading options...</p>
        )}
        {onboardingStatus === 'failed' && (
          <p className="text-red-400 text-center font-poppins">{error}</p>
        )}
      </div>

    </div>
  );
}