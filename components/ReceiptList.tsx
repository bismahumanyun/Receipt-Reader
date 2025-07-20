'use client'

import { AlertTriangle, Download, Edit, Eye, Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'

interface Receipt {
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

export function ReceiptList() {
  const [receipts, setReceipts] = useState<Receipt[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedReceipt, setSelectedReceipt] = useState<Receipt | null>(null)

  useEffect(() => {
    async function fetchReceipts() {
      const res = await fetch('/api/receipts')
      if (!res.ok) {
        setReceipts([])
        setLoading(false)
        return
      }
      const data = await res.json()
      setReceipts(data)
      setLoading(false)
    }
    fetchReceipts()
  }, [])

  const getStatusBadge = (status: string, needsReview: boolean) => {
    if (needsReview) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
          <AlertTriangle className="h-3 w-3 mr-1" />
          Needs Review
        </span>
      )
    }
    
    switch (status) {
      case 'processed':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            Processed
          </span>
        )
      case 'pending':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            Pending
          </span>
        )
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            {status}
          </span>
        )
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">My Receipts</h3>
        <button
          className="btn-primary"
          onClick={async () => {
            const res = await fetch('/api/receipts/export')
            if (!res.ok) return
            const blob = await res.blob()
            const url = window.URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = `receipts-export.xlsx`
            document.body.appendChild(a)
            a.click()
            a.remove()
            window.URL.revokeObjectURL(url)
          }}
        >
          <Download className="h-4 w-4 mr-2" />
          Export All
        </button>
      </div>

      {receipts.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No receipts yet</h3>
          <p className="text-gray-500">Upload your first receipt to get started</p>
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {receipts.map((receipt) => (
              <li key={receipt.id}>
                <div className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                          <span className="text-primary-600 font-medium">
                            {receipt.filename.split('.')[0].charAt(0).toUpperCase()}
                          </span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="flex items-center">
                          <p className="text-sm font-medium text-gray-900">{receipt.filename}</p>
                          {getStatusBadge(receipt.status, receipt.needsReview)}
                        </div>
                        <div className="mt-1 flex items-center text-sm text-gray-500">
                          <p>
                            {receipt.vendorName && `${receipt.vendorName} • `}
                            {receipt.purchaseDate && `${receipt.purchaseDate} • `}
                            {receipt.totalAmount && `$${receipt.totalAmount.toFixed(2)}`}
                          </p>
                        </div>
                        <div className="mt-1">
                          <p className="text-xs text-gray-400">
                            Confidence: {(receipt.confidence * 100).toFixed(1)}% • 
                            Uploaded: {new Date(receipt.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setSelectedReceipt(receipt)}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => {/* TODO: Edit receipt */}}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => {/* TODO: Delete receipt */}}
                        className="text-gray-400 hover:text-red-600 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Receipt Detail Modal */}
      {selectedReceipt && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Receipt Details
              </h3>
              <div className="space-y-3">
                <div>
                  <span className="font-medium">Filename:</span> {selectedReceipt.filename}
                </div>
                <div>
                  <span className="font-medium">Vendor:</span> {selectedReceipt.vendorName || 'Not found'}
                </div>
                <div>
                  <span className="font-medium">Date:</span> {selectedReceipt.purchaseDate || 'Not found'}
                </div>
                <div>
                  <span className="font-medium">Total:</span> ${selectedReceipt.totalAmount?.toFixed(2) || 'Not found'}
                </div>
                <div>
                  <span className="font-medium">Tax:</span> ${selectedReceipt.taxAmount?.toFixed(2) || 'Not found'}
                </div>
                <div>
                  <span className="font-medium">Confidence:</span> {(selectedReceipt.confidence * 100).toFixed(1)}%
                </div>
              </div>
              <div className="flex justify-end mt-6 space-x-3">
                <button
                  onClick={() => setSelectedReceipt(null)}
                  className="btn-secondary"
                >
                  Close
                </button>
                <button
                  onClick={() => {/* TODO: Edit receipt */}}
                  className="btn-primary"
                >
                  Edit
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 