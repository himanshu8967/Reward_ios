'use client'
import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import useOnboardingStore from '@/stores/useOnboardingStore'
import { useSelector } from 'react-redux';


export default function AgeSelection() {
  const router = useRouter()
  const { ageRange, setAgeRange, setCurrentStep } = useOnboardingStore()
  const { ageOptions, status: onboardingStatus, error } = useSelector((state) => state.onboarding);
  const [selectedIndex, setSelectedIndex] = useState(0)
  const wheelRef = useRef(null)
  const itemHeight = 50


  useEffect(() => {
    setCurrentStep(1)
  }, [setCurrentStep])



  const handleSelectAge = async (ageOptionId) => {
    await setAgeRange(ageOptionId)
    setTimeout(() => {
      router.push('/select-gender')
    }, 200)
  }

  const handleScroll = (e) => {
    if (!ageOptions.length) return

    const scrollTop = e.target.scrollTop
    const index = Math.round(scrollTop / itemHeight)
    const clampedIndex = Math.max(0, Math.min(index, ageOptions.length - 1))

    if (clampedIndex !== selectedIndex) {
      setSelectedIndex(clampedIndex)
    }
  }

  const handleWheelClick = (index) => {
    setSelectedIndex(index)
    if (wheelRef.current) {
      wheelRef.current.scrollTop = index * itemHeight
    }
    if (ageOptions[index]) {
      handleSelectAge(ageOptions[index].id)
    }
  }


  return (
    <div className='relative w-full h-screen bg-[#272052] overflow-hidden flex flex-col'>
      <div className='absolute w-[542px] h-[542px] top-0 left-0 bg-[#af7de6] rounded-full blur-[250px]' />

      <div className='relative z-10 px-6 pt-20 font-poppins'>
        <h1 className='text-white text-4xl font-light leading-tight mt-1 mb-4'>
          Select your age <br /> range
        </h1>
        <p className='text-white/70 text-base font-light'>
          Helps with content filtering, COPPA <br /> compliance, and reward
          expectations
        </p>
      </div>

      <div className='relative z-10 flex-1 flex flex-col justify-center items-center px-6'>
        {onboardingStatus === 'loading' && (
          <p className="text-white text-center font-poppins">Loading options...</p>
        )}
        {onboardingStatus === 'failed' && (
          <p className="text-red-400 text-center font-poppins">{error}</p>
        )}
        {onboardingStatus === 'succeeded' && (
          <div className='relative h-[250px] sm:h-[280px] w-full max-w-[335px] rounded-xl bg-[rgba(255,255,255,0.1)] backdrop-blur-sm'>
            {/* Wheel picker container */}
            <div
              ref={wheelRef}
              className='h-full overflow-y-scroll scrollbar-hide'
              onScroll={handleScroll}
              style={{
                scrollSnapType: 'y mandatory',
                scrollBehavior: 'smooth'
              }}
            >
              <div style={{ height: `${itemHeight * 2}px` }} />

              {ageOptions.map((option, index) => (
                <div
                  key={option.id}
                  onClick={() => handleWheelClick(index)}
                  className={`flex items-center justify-center cursor-pointer transition-all duration-200 ${selectedIndex === index
                    ? 'bg-white rounded-lg shadow-lg'
                    : 'bg-transparent hover:bg-white/10'
                    }`}
                  style={{
                    height: `${itemHeight}px`,
                    scrollSnapAlign: 'center',
                    margin: '0 4px',
                    borderRadius: selectedIndex === index ? '8px' : '0'
                  }}
                >
                  <div
                    className={`[font-family:'Poppins',Helvetica] text-lg text-center tracking-[0] leading-6 transition-all duration-200 ${selectedIndex === index
                      ? 'text-[#6433aa] font-semibold'
                      : 'text-white font-normal opacity-60'
                      }`}
                  >
                    {option.label}
                  </div>
                </div>
              ))}

              <div style={{ height: `${itemHeight * 2}px` }} />
            </div>

            {/* Gradient overlay to fade items above and below selection */}
            <div className='pointer-events-none absolute inset-0 rounded-xl bg-gradient-to-b from-[rgba(39,32,82,0.8)] via-transparent to-[rgba(39,32,82,0.8)]' />
          </div>
        )}
      </div>

    </div>
  )
}