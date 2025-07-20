'use client'

import { AlertCircle, CheckCircle, FileText, Image, Upload } from 'lucide-react'
import { useCallback, useState } from 'react'

import { processReceipt } from '@/lib/ocr'
import { useDropzone } from 'react-dropzone'
import { useSession } from 'next-auth/react'

interface UploadedFile {
  id: string
  file: File
  status: 'uploading' | 'processing' | 'completed' | 'error'
  progress: number
  result?: any
  error?: string
}

// Utility to calculate SHA-256 hash of a file
async function getFileHash(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer()
  const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

export function ReceiptUpload() {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
  const { data: session } = useSession()

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const newFiles: UploadedFile[] = acceptedFiles.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
      status: 'uploading',
      progress: 0
    }))

    setUploadedFiles(prev => [...prev, ...newFiles])

    // Process each file
    for (const fileData of newFiles) {
      try {
        setUploadedFiles(prev => 
          prev.map(f => 
            f.id === fileData.id 
              ? { ...f, status: 'processing', progress: 50 }
              : f
          )
        )

        const result = await processReceipt(fileData.file)
        const fileHash = await getFileHash(fileData.file)

        // Save to backend
        const response = await fetch('/api/receipts', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            filename: fileData.file.name,
            filePath: '', // Not storing file path for now
            fileType: fileData.file.type.startsWith('image/') ? 'image' : 'pdf',
            fileHash,
            vendorName: result.vendorName,
            purchaseDate: result.purchaseDate,
            totalAmount: result.totalAmount,
            taxAmount: result.taxAmount,
            confidence: result.confidence,
            needsReview: result.needsReview,
            lineItems: result.lineItems || [],
          })
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Failed to save receipt to database')
        }

        setUploadedFiles(prev => 
          prev.map(f => 
            f.id === fileData.id 
              ? { ...f, status: 'completed', progress: 100, result }
              : f
          )
        )
      } catch (error) {
        setUploadedFiles(prev => 
          prev.map(f => 
            f.id === fileData.id 
              ? { ...f, status: 'error', progress: 0, error: (error instanceof Error ? error.message : 'Unknown error') }
              : f
          )
        )
      }
    }
  }, [session])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png'],
      'application/pdf': ['.pdf']
    },
    multiple: true
  })

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'uploading':
        return <Upload className="h-5 w-5 text-blue-500 animate-pulse" />
      case 'processing':
        return <FileText className="h-5 w-5 text-yellow-500 animate-spin" />
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-500" />
      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
          isDragActive
            ? 'border-primary-500 bg-primary-50'
            : 'border-gray-300 hover:border-gray-400'
        }`}
      >
        <input {...getInputProps()} />
        <div className="space-y-4">
          <div className="flex justify-center">
            <div className="p-3 bg-primary-100 rounded-full">
              <Upload className="h-8 w-8 text-primary-600" />
            </div>
          </div>
          <div>
            <p className="text-lg font-medium text-gray-900">
              {isDragActive ? 'Drop files here' : 'Upload Receipts'}
            </p>
            <p className="text-gray-600 mt-1">
              Drag and drop files here, or click to select files
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Supports JPG, PNG, and PDF files
            </p>
          </div>
        </div>
      </div>

      {uploadedFiles.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900">Uploaded Files</h3>
          <div className="space-y-3">
            {uploadedFiles.map((fileData) => (
              <div key={fileData.id} className="card">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {fileData.file.type.startsWith('image/') ? (
                      <Image className="h-5 w-5 text-gray-400" />
                    ) : (
                      <FileText className="h-5 w-5 text-gray-400" />
                    )}
                    <div>
                      <p className="font-medium text-gray-900">{fileData.file.name}</p>
                      <p className="text-sm text-gray-500">
                        {(fileData.file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(fileData.status)}
                    {fileData.status === 'uploading' && (
                      <div className="w-16 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${fileData.progress}%` }}
                        />
                      </div>
                    )}
                    {fileData.status === 'error' && (
                      <p className="text-sm text-red-600">{fileData.error}</p>
                    )}
                  </div>
                </div>
                
                {fileData.status === 'completed' && fileData.result && (
                  <div className="mt-4 p-4 bg-green-50 rounded-lg">
                    <h4 className="font-medium text-green-900 mb-2">Extracted Data:</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Vendor:</span> {fileData.result.vendorName || 'Not found'}
                      </div>
                      <div>
                        <span className="font-medium">Date:</span> {fileData.result.purchaseDate || 'Not found'}
                      </div>
                      <div>
                        <span className="font-medium">Total:</span> ${fileData.result.totalAmount || 'Not found'}
                      </div>
                      <div>
                        <span className="font-medium">Tax:</span> ${fileData.result.taxAmount || 'Not found'}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
} 