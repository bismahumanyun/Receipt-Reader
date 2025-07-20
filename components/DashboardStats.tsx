'use client'

import { AlertTriangle, Clock, DollarSign, Receipt } from 'lucide-react'
import { useEffect, useState } from 'react'

interface ReceiptData {
  id: string
  filename: string
  vendorName?: string
  purchaseDate?: string
  totalAmount?: number
  taxAmount?: number
  confidence: number
  needsReview: boolean
  status: string
  createdAt: string
}

export function DashboardStats() {
  const [stats, setStats] = useState({
    totalReceipts: 0,
    totalAmount: 0,
    pendingReview: 0,
    thisMonth: 0
  })

  useEffect(() => {
    async function fetchStats() {
      const res = await fetch('/api/receipts')
      if (!res.ok) return
      const receipts: ReceiptData[] = await res.json()
      const now = new Date()
      const thisMonth = receipts.filter(r => {
        if (!r.purchaseDate) return false
        const d = new Date(r.purchaseDate)
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
      })
      setStats({
        totalReceipts: receipts.length,
        totalAmount: receipts.reduce((sum, r) => sum + (r.totalAmount || 0), 0),
        pendingReview: receipts.filter(r => r.needsReview).length,
        thisMonth: thisMonth.length
      })
    }
    fetchStats()
  }, [])

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      <div className="card">
        <div className="flex items-center">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Receipt className="h-6 w-6 text-blue-600" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">Total Receipts</p>
            <p className="text-2xl font-semibold text-gray-900">{stats.totalReceipts}</p>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="flex items-center">
          <div className="p-2 bg-green-100 rounded-lg">
            <DollarSign className="h-6 w-6 text-green-600" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">Total Amount</p>
            <p className="text-2xl font-semibold text-gray-900">${stats.totalAmount.toFixed(2)}</p>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="flex items-center">
          <div className="p-2 bg-yellow-100 rounded-lg">
            <Clock className="h-6 w-6 text-yellow-600" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">This Month</p>
            <p className="text-2xl font-semibold text-gray-900">{stats.thisMonth}</p>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="flex items-center">
          <div className="p-2 bg-red-100 rounded-lg">
            <AlertTriangle className="h-6 w-6 text-red-600" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">Needs Review</p>
            <p className="text-2xl font-semibold text-gray-900">{stats.pendingReview}</p>
          </div>
        </div>
      </div>
    </div>
  )
} 