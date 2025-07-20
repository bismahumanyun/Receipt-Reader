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

    return NextResponse.json(user.receipts)
  } catch (error) {
    console.error('Error fetching receipts:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession()
    console.log('SESSION:', session)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })
    console.log('USER:', user)

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const body = await request.json()
    const { filename, filePath, fileType, fileHash, vendorName, purchaseDate, totalAmount, taxAmount, confidence, needsReview, lineItems } = body

    // Check for duplicate fileHash for this user
    const existing = await prisma.receipt.findFirst({
      where: {
        userId: user.id,
        fileHash: fileHash,
      }
    })
    if (existing) {
      return NextResponse.json({ error: 'Duplicate receipt: this file has already been uploaded.' }, { status: 409 })
    }

    // Validate purchaseDate
    let parsedPurchaseDate: Date | null = null
    if (purchaseDate) {
      const d = new Date(purchaseDate)
      if (!isNaN(d.getTime())) {
        parsedPurchaseDate = d
      }
    }

    const receipt = await prisma.receipt.create({
      data: {
        userId: user.id,
        filename,
        filePath,
        fileType,
        fileHash,
        vendorName,
        purchaseDate: parsedPurchaseDate,
        totalAmount,
        taxAmount,
        confidence,
        needsReview,
        lineItems: {
          create: lineItems?.map((item: any) => ({
            description: item.description,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            totalPrice: item.totalPrice
          })) || []
        }
      },
      include: {
        lineItems: true
      }
    })

    return NextResponse.json(receipt)
  } catch (error) {
    console.error('Error creating receipt:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 