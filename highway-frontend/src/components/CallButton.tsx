import React from 'react'

interface CallButtonProps {
    onClick: () => void
}

const CallButton: React.FC<CallButtonProps> = ({ onClick }) => {
    return (
        <button
            className="bg-slate-800 text-white h-inherit rounded-md px-6
                 hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500
                 transition-colors duration-200"
            onClick={onClick}
        >
            Call
        </button>
    )
}

export default CallButton
