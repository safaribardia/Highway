import React from 'react'

interface PhoneInputProps {
    value: string
    onChange: (value: string) => void
}

const PhoneInput: React.FC<PhoneInputProps> = ({ value, onChange }) => {
    const formatPhoneNumber = (input: string): string => {
        const digitsOnly = input.replace(/\D/g, '')
        let formatted = ''

        if (digitsOnly.length > 0) {
            formatted += '(' + digitsOnly.slice(0, 3)
            if (digitsOnly.length > 3) {
                formatted += ') ' + digitsOnly.slice(3, 6)
                if (digitsOnly.length > 6) {
                    formatted += '-' + digitsOnly.slice(6, 10)
                }
            }
        }

        return formatted
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const input = e.target.value
        const formatted = formatPhoneNumber(input)
        onChange(formatted)
    }

    return (
        <input
            type="tel"
            placeholder="(949) 910-6423"
            value={value}
            onChange={handleInputChange}
            className="w-full px-3 py-2 text-sm bg-background border border-input rounded-md 
                 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                 hover:border-gray-400 transition-colors duration-200"
            aria-label="Phone number input"
        />
    )
}

export default PhoneInput
