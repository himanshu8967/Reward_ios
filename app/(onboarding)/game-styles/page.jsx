'use client'
import useOnboardingStore from '@/stores/useOnboardingStore'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { getOnboardingOptions } from '@/lib/api'


export default function GameStyleSelection() {
  const router = useRouter()
  const { gameStyle, setGameStyle, setCurrentStep } = useOnboardingStore()

  const [gameStyleOptions, setGameStyleOptions] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    setCurrentStep(4)

    const fetchOptions = async () => {
      try {
        setIsLoading(true)
        const data = await getOnboardingOptions('game_style')
        if (data && Array.isArray(data.options)) {
          setGameStyleOptions(data.options)
        } else {
          setError('Could not parse game styles.')
        }
      } catch (err) {
        setError('Could not load game styles. Please try again.')
        console.error('Failed to fetch game styles:', err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchOptions()
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

      <div className='relative z-10 px-6 pt-20 font-poppins'>
        <h1 className='text-white text-4xl font-light leading-tight mb-4'>
          What kind of games do you prefer?
        </h1>

        <p className='text-white/70 text-base font-light'>
          Choose the pace and reward style you like.
        </p>
      </div>

      <div className='relative z-10 flex-1 flex flex-col items-center justify-center px-6 space-y-6 '>
        {isLoading && (
          <p className='text-white text-center font-poppins'>Loading styles...</p>
        )}
        {error && (
          <p className='text-red-400 text-center font-poppins'>{error}</p>
        )}

        {!isLoading &&
          !error &&
          gameStyleOptions.map((option) => {
            const isSelected = gameStyle === option.id // Use `option.id` from API
            return (
              <button
                key={option.id} // Use `option.id` as the key
                onClick={() => handleSelectGameStyle(option.id)} // Pass `option.id`
                className='relative w-full h-16 group focus:outline-none'
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
                    className={`text-base font-semibold font-poppins tracking-wide transition-colors duration-200 ${isSelected ? 'text-[#272052]' : 'text-[#2D2D2D]'
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