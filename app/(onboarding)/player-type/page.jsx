'use client'
import useOnboardingStore from '@/stores/useOnboardingStore'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { getOnboardingOptions } from '@/lib/api'


export default function PlayerTypeSelection() {
  const router = useRouter()
  const { gameHabit, setGameHabit, setCurrentStep } = useOnboardingStore()

  const [gameHabitOptions, setGameHabitOptions] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    setCurrentStep(5)

    const fetchOptions = async () => {
      try {
        setIsLoading(true)
        const data = await getOnboardingOptions('dealy_game')
        if (data && Array.isArray(data.options)) {
          setGameHabitOptions(data.options)
        } else {
          setError('Could not parse player types.')
        }
      } catch (err) {
        setError('Could not load player types. Please try again.')
        console.error('Failed to fetch player types:', err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchOptions()
  }, [setCurrentStep])

  const handleSelectGameHabit = async (habitId) => {
    await setGameHabit(habitId)
    setTimeout(() => {
      router.push('/signup')
    }, 200)
  }

  return (
    <div className='relative w-screen h-screen bg-[#272052] overflow-hidden'>
      {/* Background blur effect */}
      <div className='absolute w-[300px] h-[300px] top-10 left-1/2 transform -translate-x-1/2 bg-[#af7de6] rounded-full blur-[150px] opacity-50' />

      {/* Main container with flex center alignment */}
      <div className='relative w-full max-w-[375px] h-full mx-auto flex flex-col items-center px-6 pt-20 pb-6'>
        <div className='w-full max-w-sm flex flex-col items-center space-y-2'>

          {/* Header section */}
          <div className='font-poppins ml-2'>
            <h1 className='text-white text-4xl font-light leading-tight mb-2'>
              Which of these sounds most like you?
            </h1>
            <p className='text-white/70 text-base mb-1 font-light'>
              Select one to help us match the right games & rewards.
            </p>
          </div>

          {/* Main content - player type options */}
          <div className='w-full space-y-4 flex flex-col  mt-1 items-center'>
            {isLoading && (
              <div className='flex items-center justify-center py-8'>
                <p className='text-white text-center font-poppins text-sm'>
                  Loading options...
                </p>
              </div>
            )}

            {error && (
              <div className='flex items-center justify-center py-8'>
                <p className='text-red-400 text-center font-poppins text-sm'>{error}</p>
              </div>
            )}

            {!isLoading &&
              !error &&
              gameHabitOptions.map((option) => {
                const isSelected = gameHabit === option.id
                return (
                  <button
                    key={option.id}
                    onClick={() => handleSelectGameHabit(option.id)}
                    className='relative w-full h-14 group focus:outline-none max-w-[300px]'
                  >
                    <div
                      className={`absolute inset-x-0 top-0 h-16 bg-[#D8D5E9] rounded-full transition-transform duration-300 ${isSelected ? 'scale-105' : ''}`}
                    />
                    <div
                      className={`absolute inset-0 h-14 px-5 rounded-full transition-all duration-300 flex items-center justify-center bg-white group-hover:translate-y-0.5 ${isSelected ? 'scale-105 shadow-lg shadow-[#AF7DE6]/50' : ''}`}
                    >
                      <span
                        className={`text-sm font-semibold font-poppins tracking-wide transition-colors duration-200 text-center ${isSelected ? 'text-[#272052]' : 'text-[#2D2D2D]'}`}
                      >
                        {option.label}
                      </span>
                    </div>
                  </button>
                )
              })}
          </div>
        </div>
      </div >
    </div >
  )
}