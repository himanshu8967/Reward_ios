'use client'
import useOnboardingStore from '@/stores/useOnboardingStore'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { getOnboardingOptions } from '@/lib/api'

export default function GenderSelection() {
  const router = useRouter()
  const { gender, setGender, setCurrentStep } = useOnboardingStore()

  const [genderOptions, setGenderOptions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setCurrentStep(2);

    const fetchOptions = async () => {
      try {
        setIsLoading(true);
        const data = await getOnboardingOptions('gender');
        if (data && Array.isArray(data.options)) {
          setGenderOptions(data.options);
        }
      } catch (err) {
        setError("Could not load gender options. Please try again.");
        console.error("Failed to fetch gender options:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOptions();
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

      <div className='relative  z-10 px-6 pt-20 font-poppins'>
        <h1 className='text-white text-4xl font-light leading-tight mt-1 mb-4'>
          Select your gender
        </h1>
        <p className='text-white/70 text-base font-light'>
          This will help to make your training plan more relevant
        </p>
      </div>

      <div className='relative z-10 flex-1 flex   flex-col justify-center items-center  px-6 space-y-6'>


        {!isLoading && !error && genderOptions.map((option) => {
          const isSelected = gender === option.id; // Use `option.id` from API
          return (
            <button
              key={option.id} // Use `option.id` as the key
              onClick={() => handleGenderSelect(option.id)} // Pass `option.id` as the value
              className='relative w-full h-16 group focus:outline-none'
            >
              <div
                className={`absolute inset-x-0 top-0 h-18 bg-[#D8D5E9] rounded-full transition-transform duration-300 ${isSelected ? 'scale-105' : ''
                  }`}
              />
              <div
                className={`absolute inset-x-0 top-0 h-16 rounded-full transition-all duration-300 flex items-center justify-center bg-white group-hover:translate-y-0.5 ${isSelected ? 'scale-105 shadow-lg shadow-[#AF7DE6]/50' : ''
                  }`}
              >
                <span
                  className={`text-base font-semibold font-poppins tracking-wide transition-colors duration-200 ${isSelected ? 'text-[#272052]' : 'text-[#2D2D2D]'
                    }`}
                >
                  {option.label} {/* Use `option.label` from API */}
                </span>
              </div>
            </button>
          );
        })}
        {isLoading && (
          <p className="text-white mb-190text-center font-poppins">Loading options...</p>
        )}
        {error && (
          <p className="text-red-400 text-center font-poppins">{error}</p>
        )}
      </div>

    </div>
  );
}