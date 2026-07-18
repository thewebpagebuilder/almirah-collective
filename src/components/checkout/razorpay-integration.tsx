'use client'

import { useEffect } from 'react'

interface RazorpayIntegrationProps {
  amount: number
  email: string
  phone: string
  name?: string
  orderId?: string
  onSuccess: () => void
  onClose: () => void
}

export function RazorpayIntegration({
  amount,
  email,
  phone,
  name = 'Customer',
  orderId,
  onSuccess,
  onClose,
}: RazorpayIntegrationProps) {
  useEffect(() => {
    let scriptLoaded = false

    const loadRazorpay = async () => {
      // 1. Fetch Razorpay Order from Backend
      try {
        const res = await fetch('/api/razorpay', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ amount, receipt: orderId }),
        })
        const data = await res.json()

        if (!res.ok) throw new Error(data.error)

        // 2. Load Razorpay script
        const script = document.createElement('script')
        script.src = 'https://checkout.razorpay.com/v1/checkout.js'
        script.async = true
        script.onload = () => {
          scriptLoaded = true
          // 3. Initialize Razorpay Checkout
          const options = {
            key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'dummy_key_id',
            amount: data.amount,
            currency: data.currency,
            name: 'Almirah Collective',
            description: 'Order Payment',
            order_id: data.id,
            handler: function (response: any) {
              console.log('Payment success', response)
              onSuccess()
            },
            prefill: {
              name,
              email,
              contact: phone,
            },
            theme: {
              color: '#0d0d0d', // obsidian
            },
            modal: {
              ondismiss: function () {
                onClose()
              },
            },
          }
          
          const rzp = new (window as any).Razorpay(options)
          rzp.on('payment.failed', function (response: any) {
            console.error('Payment failed', response.error)
            onClose()
          })
          rzp.open()
        }
        document.body.appendChild(script)
      } catch (err) {
        console.error('Failed to initialize Razorpay', err)
        onClose()
      }
    }

    loadRazorpay()

    return () => {
      if (scriptLoaded) {
        const script = document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]')
        if (script) document.body.removeChild(script)
      }
    }
  }, [amount, email, phone, name, orderId, onSuccess, onClose])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-obsidian/40 backdrop-blur-sm">
      <div className="flex flex-col items-center bg-white p-8 shadow-xl">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-obsidian border-t-transparent" />
        <p className="mt-4 text-sm font-medium">Initializing secure checkout...</p>
      </div>
    </div>
  )
}
