'use client'

import { Star } from 'lucide-react'

type Props = {
  value: number
  onChange?: (v: number) => void
  readonly?: boolean
  size?: 'sm' | 'md' | 'lg'
}

const sizes = {
  sm: 'w-4 h-4',
  md: 'w-7 h-7',
  lg: 'w-9 h-9',
}

export default function StarRating({ value, onChange, readonly = false, size = 'md' }: Props) {
  const iconSize = sizes[size]

  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map(star => (
        <button
          key={star}
          type="button"
          onClick={() => !readonly && onChange?.(star)}
          disabled={readonly}
          className={`transition-all duration-100 ${readonly ? 'cursor-default' : 'cursor-pointer active:scale-125'}`}
          aria-label={`${star}点`}
        >
          <Star
            className={`${iconSize} ${
              star <= value
                ? 'fill-[#D4853A] text-[#D4853A]'
                : 'fill-transparent text-gray-600'
            } transition-colors duration-100`}
          />
        </button>
      ))}
    </div>
  )
}
