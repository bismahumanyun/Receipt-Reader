# Receipt Reader 📷

A modern web application for uploading and parsing receipts using OCR technology. Extract vendor names, dates, amounts, and line items from your receipts with 90%+ accuracy.

## Features

- Multi-Provider Authentication: Google, Facebook, GitHub, and Email/Password
- Receipt Upload: Support for JPG, PNG, and PDF files
- AI-Powered OCR: Tesseract.js for text extraction with confidence scoring
- Excel Export: Download all your receipt data in spreadsheet format
-️ Manual Review: Flag low-confidence receipts for manual correction
- Dashboard: Beautiful interface to manage all your receipts
- Zero Cost: Built with free and open-source tools only

##️ Tech Stack

-Frontend: Next.js 14 with React 18
-Styling: Tailwind CSS
-Authentication: NextAuth.js
-Database: Prisma with SQLite (dev) / PostgreSQL (prod)
-OCR: Tesseract.js (client-side)
-PDF Processing: PDF.js
-Excel Export: XLSX library
-Icons: Lucide React

## Quick Start

## Prerequisites

- Node.js 18+ 
- npm or yarn

## Installation

1.Clone the repository
   ```bash
   git clone <repository-url>
   cd receipt-reader
   ```

2.Install dependencies
   ```bash
   npm install
   ```

3.Set up environment variables
   ```bash
   cp env.example .env.local
   ```
   
   Edit `.env.local` and add your OAuth provider credentials:
   ```env
   DATABASE_URL="file:./dev.db"
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="your-secret-key-here"
   
   # OAuth Providers (optional)
   GOOGLE_CLIENT_ID=""
   GOOGLE_CLIENT_SECRET=""
   GITHUB_CLIENT_ID=""
   GITHUB_CLIENT_SECRET=""
   FACEBOOK_CLIENT_ID=""
   FACEBOOK_CLIENT_SECRET=""
   ```

4.Set up the database
   ```bash
   npx prisma generate
   npx prisma db push
   ```

5.Run the development server
   ```bash
   npm run dev
   ```

6.Open your browser
   Navigate to [http://localhost:3000](http://localhost:3000)

## Configuration

## OAuth Setup

## Google OAuth
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add `http://localhost:3000/api/auth/callback/google` to authorized redirect URIs
6. Copy Client ID and Client Secret to `.env.local`

## GitHub OAuth
1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Create a new OAuth App
3. Set Authorization callback URL to `http://localhost:3000/api/auth/callback/github`
4. Copy Client ID and Client Secret to `.env.local`

## Facebook OAuth
1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Create a new app
3. Add Facebook Login product
4. Set Valid OAuth Redirect URIs to `http://localhost:3000/api/auth/callback/facebook`
5. Copy App ID and App Secret to `.env.local`

## Project Structure

```
receipt-reader/
├── app/                   # Next.js 13+ app directory
│   ├── api/               # API routes
│   │   ├── auth/          # NextAuth.js routes
│   │   └── receipts/      # Receipt management API
│   ├── dashboard/         # Dashboard page
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Landing page
├── components/            # React components
│   ├── DashboardStats.tsx
│   ├── Header.tsx
│   ├── ReceiptList.tsx
│   └── ReceiptUpload.tsx
├── lib/                  # Utility libraries
│   ├── ocr.ts            # OCR processing logic
│   └── prisma.ts         # Database client
├── prisma/               # Database schema
│   └── schema.prisma
├── public/               # Static assets
└── package.json
```

## How It Works

## Receipt Processing Pipeline

1.Upload: User drags & drops or selects receipt files
2.Preprocessing: 
   - PDF files are converted to images using PDF.js
   - Images are optimized for OCR
3.OCR Processing: Tesseract.js extracts text with confidence scores
4.Data Extraction: Custom algorithms parse:
   - Vendor names (from top lines)
   - Dates (using regex patterns)
   - Total amounts (largest dollar amounts)
   - Tax amounts (labeled tax lines)
   - Line items (price-containing lines)
5.Quality Check: Receipts with <80% confidence or missing data are flagged for review
6.Storage: Data is saved to database with user association

## Accuracy Optimization

-Confidence Threshold: 80% minimum for auto-processing
-Pattern Matching: Regex for dates, amounts, and vendor names
-Fallback Logic: Multiple extraction strategies
-Manual Review: Low-confidence receipts can be corrected

##Production Database
For production, use PostgreSQL:
```env
DATABASE_URL="postgresql://user:password@host:port/database"
```

## Contributing
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request


## Known Issues
- PDF processing may be slow for large files
- OCR accuracy varies with receipt quality
- Some complex receipt layouts may require manual review

## Support

If you encounter any issues or have questions:
1. Check the [Issues](https://github.com/bismahumanyun/Receipt-Reader) page
2. Create a new issue with detailed information
3. Include receipt samples (if possible) for debugging

---
Built with ❤️ using free and open-source tools 