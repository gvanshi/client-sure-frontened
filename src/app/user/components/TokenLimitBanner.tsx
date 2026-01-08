"use client"

import { AlertCircle, Zap } from "lucide-react"
import Link from "next/link"

interface TokenLimitBannerProps {
  effectiveTokens: number
  dailyLimit: number
  dailyUsed: number
}

export default function TokenLimitBanner({ effectiveTokens, dailyLimit, dailyUsed }: TokenLimitBannerProps) {
  // Only show banner when user has used 30 or more tokens
  if (dailyUsed < 30) {
    return null
  }

  // Determine severity level based on tokens USED
  const isWarning = dailyUsed >= 30 && dailyUsed < 70
  const isCritical = dailyUsed >= 70

  return (
    <div 
      className={`w-full ${
        isCritical 
          ? 'bg-red-50 border-red-200' 
          : 'bg-yellow-50 border-yellow-200'
      } border-b`}
    >
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div className={`flex-shrink-0 ${
              isCritical ? 'text-red-600' : 'text-yellow-600'
            }`}>
              <AlertCircle className="w-5 h-5" />
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`text-sm font-semibold ${
                isCritical ? 'text-red-900' : 'text-yellow-900'
              }`}>
                {isCritical ? 'Critical: ' : 'Warning: '}
                Token Usage Alert
              </span>
              <span className={`text-sm ${
                isCritical ? 'text-red-700' : 'text-yellow-700'
              }`}>
                You've used <span className="font-bold">{dailyUsed}</span> tokens. <span className="font-bold">{effectiveTokens}</span> remaining of <span className="font-bold">{dailyLimit}</span> daily limit
              </span>
            </div>
          </div>
          
          <Link
            href="/user/profile/tokens"
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              isCritical
                ? 'bg-red-600 hover:bg-red-700 text-white'
                : 'bg-yellow-600 hover:bg-yellow-700 text-white'
            }`}
          >
            <Zap className="w-4 h-4" />
            Recharge Now
          </Link>
        </div>
      </div>
    </div>
  )
}
