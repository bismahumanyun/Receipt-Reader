'use client'

import { useEffect, useState } from 'react'

import { DashboardStats } from '@/components/DashboardStats'
import { Header } from '@/components/Header'
import { ReceiptList } from '@/components/ReceiptList'
import { ReceiptUpload } from '@/components/ReceiptUpload'
import { redirect } from 'next/navigation'
import { useSession } from 'next-auth/react'

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const [activeTab, setActiveTab] = useState<'upload' | 'receipts'>('upload')

  useEffect(() => {
    if (status === 'unauthenticated') {
      redirect('/')
    }
  }, [status])

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {session?.user?.name || 'User'}!
          </h1>
          <p className="text-gray-600">
            Upload receipts and manage your expenses
          </p>
        </div>

        <DashboardStats />

        <div className="mt-8">
          <div className="flex space-x-1 bg-gray-200 p-1 rounded-lg mb-6">
            <button
              onClick={() => setActiveTab('upload')}
              className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
                activeTab === 'upload'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Upload Receipt
            </button>
            <button
              onClick={() => setActiveTab('receipts')}
              className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
                activeTab === 'receipts'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              My Receipts
            </button>
          </div>

          {activeTab === 'upload' && <ReceiptUpload />}
          {activeTab === 'receipts' && <ReceiptList />}
        </div>
      </div>
    </div>
  )
} 