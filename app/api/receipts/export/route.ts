import * as XLSX from 'xlsx'

import { NextRequest, NextResponse } from 'next/server'

import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession()
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        receipts: {
          include: {
            lineItems: true
          },
          orderBy: {
            createdAt: 'desc'
          }
        }
      }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Prepare data for Excel
    const excelData = user.receipts.map(receipt => ({
      'Receipt ID': receipt.id,
      'Filename': receipt.filename,
      'Vendor': receipt.vendorName || '',
      'Date': receipt.purchaseDate ? receipt.purchaseDate.toISOString().split('T')[0] : '',
      'Total Amount': receipt.totalAmount || 0,
      'Tax Amount': receipt.taxAmount || 0,
      'Confidence': `${(receipt.confidence * 100).toFixed(1)}%`,
      'Status': receipt.needsReview ? 'Needs Review' : receipt.status,
      'Upload Date': receipt.createdAt.toISOString().split('T')[0],
      'Line Items Count': receipt.lineItems.length
    }))

    // Create workbook and worksheet
    const workbook = XLSX.utils.book_new()
    const worksheet = XLSX.utils.json_to_sheet(excelData)

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Receipts')

    // Generate Excel file
    const excelBuffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' })

    // Create response with Excel file
    const response = new NextResponse(excelBuffer)
    response.headers.set('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
    response.headers.set('Content-Disposition', `attachment; filename="receipts-${user.email}-${new Date().toISOString().split('T')[0]}.xlsx"`)

    return response
  } catch (error) {
    console.error('Error exporting receipts:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 