import React from 'react'

interface CallButtonProps {
    onClick: () => void
    disabled?: boolean
}

const CallButton: React.FC<CallButtonProps> = ({ onClick, disabled = false }) => {
    return (
        <button
            className={`text-white h-inherit rounded-md px-6
                 focus:outline-none focus:ring-2 focus:ring-blue-500
                 transition-colors duration-200
                 ${disabled
                    ? 'bg-slate-400 cursor-not-allowed'
                    : 'bg-slate-800 hover:bg-slate-700'}`}
            onClick={onClick}
            disabled={disabled}
        >
            {disabled ? 'Calling...' : 'Call'}
        </button>
    )
}

export default CallButton
