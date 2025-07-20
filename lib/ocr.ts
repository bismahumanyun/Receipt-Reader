import * as pdfjsLib from 'pdfjs-dist'

import Tesseract from 'tesseract.js'

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`

export interface ExtractedData {
  vendorName?: string
  purchaseDate?: string
  totalAmount?: number
  taxAmount?: number
  lineItems?: Array<{
    description: string
    quantity?: number
    unitPrice?: number
    totalPrice?: number
  }>
  confidence: number
  needsReview: boolean
}

export async function processReceipt(file: File): Promise<ExtractedData> {
  try {
    let imageData: string

    if (file.type === 'application/pdf') {
      imageData = await convertPdfToImage(file)
    } else {
      imageData = await fileToDataUrl(file)
    }

    // Perform OCR
    const result = await Tesseract.recognize(imageData, 'eng', {
      logger: m => console.log(m)
    })

    // Extract and parse data
    const extractedData = parseReceiptText(result.data.text, result.data.confidence)

    return extractedData
  } catch (error) {
    console.error('Error processing receipt:', error)
    throw new Error('Failed to process receipt')
  }
}

async function convertPdfToImage(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer()
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
  const page = await pdf.getPage(1)
  
  const viewport = page.getViewport({ scale: 2.0 })
  const canvas = document.createElement('canvas')
  const context = canvas.getContext('2d')
  
  canvas.height = viewport.height
  canvas.width = viewport.width
  
  await page.render({
    canvasContext: context!,
    viewport: viewport
  }).promise
  
  return canvas.toDataURL('image/png')
}

async function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

function parseReceiptText(text: string, confidence: number): ExtractedData {
  const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0)
  
  const extractedData: ExtractedData = {
    confidence: confidence / 100,
    needsReview: confidence < 80
  }

  // Extract vendor name (usually at the top)
  extractedData.vendorName = extractVendorName(lines)
  
  // Extract date
  extractedData.purchaseDate = extractDate(lines)
  
  // Extract amounts
  const amounts = extractAmounts(lines)
  extractedData.totalAmount = amounts.total
  extractedData.taxAmount = amounts.tax
  
  // Extract line items
  extractedData.lineItems = extractLineItems(lines)
  
  // Determine if review is needed
  if (!extractedData.vendorName || !extractedData.totalAmount || confidence < 80) {
    extractedData.needsReview = true
  }

  return extractedData
}

function extractVendorName(lines: string[]): string | undefined {
  // Look for vendor name in first few lines
  for (let i = 0; i < Math.min(5, lines.length); i++) {
    const line = lines[i].toUpperCase()
    
    // Skip lines that are likely not vendor names
    if (line.includes('RECEIPT') || line.includes('TOTAL') || line.includes('DATE') || 
        line.includes('CASH') || line.includes('CARD') || line.includes('CHANGE')) {
      continue
    }
    
    // If line looks like a vendor name (not too long, no numbers)
    if (line.length > 2 && line.length < 50 && !/\d/.test(line)) {
      return lines[i]
    }
  }
  
  return undefined
}

function extractDate(lines: string[]): string | undefined {
  const dateRegex = /(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})|(\d{4}[\/\-]\d{1,2}[\/\-]\d{1,2})/
  
  for (const line of lines) {
    const match = line.match(dateRegex)
    if (match) {
      return match[0]
    }
  }
  
  return undefined
}

function extractAmounts(lines: string[]): { total?: number; tax?: number } {
  const amounts: number[] = []
  const totalRegex = /(?:TOTAL|AMOUNT|BALANCE|DUE)[\s:]*\$?(\d+\.?\d*)/
  const taxRegex = /(?:TAX|SALES TAX)[\s:]*\$?(\d+\.?\d*)/
  
  let total: number | undefined
  let tax: number | undefined
  
  for (const line of lines) {
    const upperLine = line.toUpperCase()
    
    // Look for total
    const totalMatch = upperLine.match(totalRegex)
    if (totalMatch && !total) {
      total = parseFloat(totalMatch[1])
    }
    
    // Look for tax
    const taxMatch = upperLine.match(taxRegex)
    if (taxMatch && !tax) {
      tax = parseFloat(taxMatch[1])
    }
    
    // Extract all dollar amounts
    const dollarMatches = line.match(/\$(\d+\.?\d*)/g)
    if (dollarMatches) {
      dollarMatches.forEach(match => {
        const amount = parseFloat(match.replace('$', ''))
        if (amount > 0) {
          amounts.push(amount)
        }
      })
    }
  }
  
  // If we didn't find total/tax with regex, use the largest amounts
  if (!total && amounts.length > 0) {
    amounts.sort((a, b) => b - a)
    total = amounts[0]
    if (amounts.length > 1) {
      tax = amounts[1]
    }
  }
  
  return { total, tax }
}

function extractLineItems(lines: string[]): Array<{
  description: string
  quantity?: number
  unitPrice?: number
  totalPrice?: number
}> {
  const lineItems: Array<{
    description: string
    quantity?: number
    unitPrice?: number
    totalPrice?: number
  }> = []
  
  // Look for lines that might be line items
  for (const line of lines) {
    // Skip header/footer lines
    if (line.toUpperCase().includes('TOTAL') || 
        line.toUpperCase().includes('TAX') ||
        line.toUpperCase().includes('RECEIPT') ||
        line.toUpperCase().includes('THANK')) {
      continue
    }
    
    // Look for lines with prices
    const priceMatch = line.match(/\$(\d+\.?\d*)/)
    if (priceMatch && line.length > 3) {
      const description = line.replace(/\$\d+\.?\d*/, '').trim()
      if (description.length > 0) {
        lineItems.push({
          description,
          totalPrice: parseFloat(priceMatch[1])
        })
      }
    }
  }
  
  return lineItems.slice(0, 10) // Limit to first 10 items
} 