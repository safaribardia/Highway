'use client'
import CallButton from "@/components/CallButton"
import PhoneInput from "@/components/PhoneInput"
import { createClient } from "@/utils/supabase/client"
import { useEffect, useState } from "react"

export default function Page() {
  const [todos, setTodos] = useState<any[]>([])
  const [phoneNumber, setPhoneNumber] = useState('')

  useEffect(() => {
    const supabase = createClient()
    supabase.from('todos').select('*').then((res) => {
      setTodos(res.data || [])
    })
  }, [])

  const handleCall = () => {
    // Here you would implement the actual call functionality
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
