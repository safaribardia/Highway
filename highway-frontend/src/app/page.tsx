'use client'
import CallButton from "@/components/CallButton"
import PhoneInput from "@/components/PhoneInput"
import { callCustomer } from "@/utils/api"
import { createClient } from "@/utils/supabase/client"
import { useEffect, useState } from "react"

export default function Page() {
  const [todos, setTodos] = useState<any[]>([])
  const [phoneNumber, setPhoneNumber] = useState('')
  const [isCallInProgress, setIsCallInProgress] = useState(false)

  useEffect(() => {
    const supabase = createClient()
    supabase.from('todos').select('*').then((res) => {
      setTodos(res.data || [])
    })
  }, [])

  const handleCall = () => {
    // Here you would implement the actual call functionality
    callCustomer(`+1${phoneNumber.replace(/[^\d]/g, '')}`)
    console.log(`Calling ${phoneNumber}`)
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="w-full max-w-xs flex flex-row gap-2">
        <PhoneInput value={phoneNumber} onChange={setPhoneNumber} />
        <CallButton onClick={handleCall} />
      </div>
    </div>
  )
}
