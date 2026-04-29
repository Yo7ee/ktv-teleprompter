import { MagnifyingGlassIcon } from '@heroicons/react/24/outline'
import { useRef } from 'react'

interface SearchBarProps {
  value: string
  onChange: (v: string) => void
  onSubmit?: () => void
  placeholder?: string
  label: string
  autoFocus?: boolean
}

export function SearchBar({
  value,
  onChange,
  onSubmit,
  placeholder = '搜尋…',
  label,
  autoFocus = false,
}: SearchBarProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  return (
    <div
      role="search"
      className="flex items-center gap-2 bg-app-elev rounded-xl px-3 py-2"
    >
      <MagnifyingGlassIcon className="w-4 h-4 text-app-muted shrink-0" aria-hidden="true" />
      <input
        ref={inputRef}
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && onSubmit?.()}
        placeholder={placeholder}
        aria-label={label}
        autoFocus={autoFocus}
        className="flex-1 bg-transparent border-none outline-none text-app-text text-sm placeholder:text-app-faint font-[inherit]"
      />
    </div>
  )
}
