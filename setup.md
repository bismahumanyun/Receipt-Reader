# Quick Setup Guide 🚀

## Prerequisites
- Node.js 18+ installed
- npm or yarn package manager

## Step-by-Step Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Set Environment Variables
Create a `.env.local` file in the root directory with:
```env
DATABASE_URL="file:./dev.db"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here-change-in-production"

# Optional: Add OAuth provider credentials
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
GITHUB_CLIENT_ID=""
GITHUB_CLIENT_SECRET=""
FACEBOOK_CLIENT_ID=""
FACEBOOK_CLIENT_SECRET=""
```

### 3. Set Up Database
```bash
npx prisma generate
npx prisma db push
```

### 4. Start Development Server
```bash
npm run dev
```

### 5. Open Your Browser
Navigate to [http://localhost:3000](http://localhost:3000)

## OAuth Setup (Optional)

### Google OAuth
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add `http://localhost:3000/api/auth/callback/google` to authorized redirect URIs
6. Copy Client ID and Client Secret to `.env.local`

### GitHub OAuth
1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Create a new OAuth App
3. Set Authorization callback URL to `http://localhost:3000/api/auth/callback/github`
4. Copy Client ID and Client Secret to `.env.local`

## Features Available

✅ **Authentication**: Google, GitHub, Facebook OAuth  
✅ **Receipt Upload**: Drag & drop JPG, PNG, PDF files  
✅ **OCR Processing**: Tesseract.js text extraction  
✅ **Data Extraction**: Vendor, date, amounts, line items  
✅ **Excel Export**: Download all receipt data  
✅ **Dashboard**: Manage and review receipts  
✅ **Manual Review**: Flag low-confidence receipts  

## Troubleshooting

### Database Issues
- Ensure `.env.local` file exists with `DATABASE_URL`
- Run `npx prisma db push` to sync schema

### Authentication Issues
- Check OAuth provider credentials in `.env.local`
- Ensure callback URLs are correctly configured

### OCR Issues
- Tesseract.js runs client-side, may be slow on first load
- Large PDF files may take time to process

## Next Steps

1. **Add OAuth Credentials**: Set up Google/GitHub OAuth for authentication
2. **Test Upload**: Try uploading a receipt image
3. **Review Data**: Check extracted information accuracy
4. **Export Data**: Download Excel file with all receipts
5. **Deploy**: Deploy to Vercel, Railway, or other platforms

## Support

If you encounter issues:
1. Check the console for error messages
2. Ensure all environment variables are set
3. Verify OAuth provider configurations
4. Check the README.md for detailed documentation 