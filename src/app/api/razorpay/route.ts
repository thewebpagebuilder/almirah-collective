import { NextResponse } from 'next/server'
import Razorpay from 'razorpay'

// Initialize Razorpay instance
const razorpay = new Razorpay({
  key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'dummy_key_id',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'dummy_key_secret',
})

export async function POST(req: Request) {
  try {
    const { amount, receipt } = await req.json()

    if (!amount) {
      return NextResponse.json({ error: 'Amount is required' }, { status: 400 })
    }

    // Amount is in currency subunits. 
    // INR 100 = 10000 paise
    const options = {
      amount: Math.round(amount * 100), // convert to paise
      currency: 'INR',
      receipt: receipt || `receipt_${Date.now()}`,
    }

    const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID
    const keySecret = process.env.RAZORPAY_KEY_SECRET

    if (!keyId || keyId === 'your-razorpay-key-id' || !keySecret || keySecret === 'your-razorpay-secret') {
      return NextResponse.json(
        { error: 'Missing Razorpay API keys in .env.local. Please add NEXT_PUBLIC_RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET to test checkout.' },
        { status: 500 }
      )
    }

    const order = await razorpay.orders.create(options)
    return NextResponse.json(order)
  } catch (error: any) {
    console.error('Razorpay Error:', error)
    return NextResponse.json(
      { error: error?.error?.description || 'Failed to create Razorpay order' },
      { status: 500 }
    )
  }
}
