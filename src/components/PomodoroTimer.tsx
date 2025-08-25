'use client'

import { useState, useEffect, useRef } from 'react'

type TimerMode = 'work' | 'shortBreak' | 'longBreak'

interface TimerSettings {
  work: number
  shortBreak: number
  longBreak: number
}

export default function PomodoroTimer() {
  const [mode, setMode] = useState<TimerMode>('work')
  const [selectedDuration, setSelectedDuration] = useState(25)
  const [timeLeft, setTimeLeft] = useState(25 * 60) // 25 minutes in seconds
  const [isRunning, setIsRunning] = useState(false)
  const [pomodoroCount, setPomodoroCount] = useState(0)
  const [totalTime, setTotalTime] = useState(0) // 累積時間（分）
  const [isSettings, setIsSettings] = useState(false)
  const [settings, setSettings] = useState<TimerSettings>({
    work: 25,
    shortBreak: 5,
    longBreak: 15
  })
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const modeSettings = {
    work: { 
      duration: mode === 'work' ? selectedDuration * 60 : settings.work * 60, 
      label: '作業時間',
      color: 'bg-red-500',
      bgGradient: 'from-red-400 to-red-600'
    },
    shortBreak: { 
      duration: settings.shortBreak * 60, 
      label: '短い休憩',
      color: 'bg-green-500',
      bgGradient: 'from-green-400 to-green-600'
    },
    longBreak: { 
      duration: settings.longBreak * 60, 
      label: '長い休憩',
      color: 'bg-blue-500',
      bgGradient: 'from-blue-400 to-blue-600'
    }
  }

  useEffect(() => {
    setTimeLeft(modeSettings[mode].duration)
    setIsRunning(false)
  }, [mode, settings, selectedDuration])

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => prev - 1)
      }, 1000)
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }

    if (timeLeft === 0 && isRunning) {
      handleTimerComplete()
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isRunning, timeLeft])

  const handleTimerComplete = () => {
    setIsRunning(false)
    playNotificationSound()
    
    if (mode === 'work') {
      const newCount = pomodoroCount + 1
      setPomodoroCount(newCount)
      setTotalTime(prev => prev + selectedDuration)
      
      if (newCount % 4 === 0) {
        setMode('longBreak')
      } else {
        setMode('shortBreak')
      }
    } else {
      setMode('work')
    }
  }

  const playNotificationSound = () => {
    if (audioRef.current) {
      audioRef.current.play().catch(console.error)
    }
  }

  const toggleTimer = () => {
    setIsRunning(!isRunning)
  }

  const resetTimer = () => {
    setIsRunning(false)
    setTimeLeft(modeSettings[mode].duration)
  }

  const switchMode = (newMode: TimerMode) => {
    setMode(newMode)
    setIsRunning(false)
  }

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  const progress = ((modeSettings[mode].duration - timeLeft) / modeSettings[mode].duration) * 100

  if (isSettings) {
    return (
      <div className={`min-h-screen bg-gradient-to-br ${modeSettings[mode].bgGradient} flex items-center justify-center p-4`}>
        <div className="bg-white/20 backdrop-blur-md rounded-3xl p-8 w-full max-w-md shadow-2xl">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-white">設定</h2>
            <button
              onClick={() => setIsSettings(false)}
              className="text-white hover:bg-white/20 rounded-full p-2 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-white text-sm font-medium mb-2">
                作業時間 (分)
              </label>
              <input
                type="number"
                min="1"
                max="60"
                value={settings.work}
                onChange={(e) => setSettings(prev => ({ ...prev, work: parseInt(e.target.value) || 25 }))}
                className="w-full bg-white/20 text-white placeholder-white/60 border border-white/30 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-white/50"
              />
            </div>

            <div>
              <label className="block text-white text-sm font-medium mb-2">
                短い休憩 (分)
              </label>
              <input
                type="number"
                min="1"
                max="30"
                value={settings.shortBreak}
                onChange={(e) => setSettings(prev => ({ ...prev, shortBreak: parseInt(e.target.value) || 5 }))}
                className="w-full bg-white/20 text-white placeholder-white/60 border border-white/30 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-white/50"
              />
            </div>

            <div>
              <label className="block text-white text-sm font-medium mb-2">
                長い休憩 (分)
              </label>
              <input
                type="number"
                min="1"
                max="60"
                value={settings.longBreak}
                onChange={(e) => setSettings(prev => ({ ...prev, longBreak: parseInt(e.target.value) || 15 }))}
                className="w-full bg-white/20 text-white placeholder-white/60 border border-white/30 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-white/50"
              />
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`min-h-screen bg-gradient-to-br ${modeSettings[mode].bgGradient} flex items-center justify-center p-4`}>
      <div className="bg-white/20 backdrop-blur-md rounded-3xl p-8 w-full max-w-md shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-white">ポモドーロタイマー</h1>
          <button
            onClick={() => setIsSettings(true)}
            className="text-white hover:bg-white/20 rounded-full p-2 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
        </div>

        {/* Duration Selection (only show for work mode) */}
        {mode === 'work' && (
          <div className="mb-6">
            <div className="text-white/80 text-sm font-medium mb-3 text-center">作業時間を選択</div>
            <div className="flex justify-center space-x-3">
              {[10, 25, 50].map((duration) => (
                <button
                  key={duration}
                  onClick={() => setSelectedDuration(duration)}
                  className={`py-2 px-4 rounded-xl text-sm font-medium transition-all ${
                    selectedDuration === duration
                      ? 'bg-white text-gray-800 shadow-lg'
                      : 'bg-white/10 text-white/70 hover:text-white hover:bg-white/20'
                  }`}
                >
                  {duration}分
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Mode Tabs */}
        <div className="flex rounded-2xl bg-white/10 p-1 mb-8">
          {(Object.keys(modeSettings) as TimerMode[]).map((modeKey) => (
            <button
              key={modeKey}
              onClick={() => switchMode(modeKey)}
              className={`flex-1 py-2 px-4 rounded-xl text-sm font-medium transition-all ${
                mode === modeKey
                  ? 'bg-white text-gray-800 shadow-lg'
                  : 'text-white/70 hover:text-white'
              }`}
            >
              {modeSettings[modeKey].label}
            </button>
          ))}
        </div>

        {/* Timer Circle */}
        <div className="relative flex items-center justify-center mb-8">
          <div className="relative w-64 h-64">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="45"
                stroke="rgba(255, 255, 255, 0.2)"
                strokeWidth="2"
                fill="none"
              />
              <circle
                cx="50"
                cy="50"
                r="45"
                stroke="rgba(255, 255, 255, 0.8)"
                strokeWidth="2"
                fill="none"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 45}`}
                strokeDashoffset={`${2 * Math.PI * 45 * (1 - progress / 100)}`}
                className="transition-all duration-1000 ease-linear"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="text-5xl font-mono font-bold text-white mb-2">
                  {formatTime(timeLeft)}
                </div>
                <div className="text-white/80 text-sm">
                  {modeSettings[mode].label}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex justify-center space-x-4 mb-6">
          <button
            onClick={toggleTimer}
            className="bg-white/20 hover:bg-white/30 text-white font-semibold py-4 px-8 rounded-2xl transition-all duration-200 shadow-lg hover:shadow-xl backdrop-blur-sm"
          >
            {isRunning ? (
              <div className="flex items-center space-x-2">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <span>一時停止</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                </svg>
                <span>開始</span>
              </div>
            )}
          </button>

          <button
            onClick={resetTimer}
            className="bg-white/10 hover:bg-white/20 text-white font-semibold py-4 px-6 rounded-2xl transition-all duration-200 backdrop-blur-sm"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>

        {/* Stats */}
        <div className="text-center space-y-2">
          <div className="text-white/80 text-sm">
            完了したポモドーロ: <span className="font-bold text-white">{pomodoroCount}</span>
          </div>
          <div className="text-white/80 text-sm">
            累積時間: <span className="font-bold text-white">{totalTime}分</span>
          </div>
        </div>

        {/* Hidden Audio Element */}
        <audio
          ref={audioRef}
          preload="auto"
        >
          <source src="data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmMeAjWJ0/LThzkGH3K+8OOYPwcbZrru7aZSEAhHn9/uwmUcBz6L0fLPfjMGImtz/o7fMgUQJm/7xpY8DiOz+aT3wYApU1PaGCvLPhRTnBBxSkJLVrSVOF/0/nw3qKhPwztvhTAgf+Cew7tVcZBF+MrYllKZjWPrAnSGsqtNRv4lfk7QnHqrUZKSPiP3VnYWO8Ny3mWA9q+WPQ5fmqHqPa" type="audio/wav" />
        </audio>
      </div>
    </div>
  )
}