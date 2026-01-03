# Cloudinary Image Upload Setup

This application uses Cloudinary for image uploads and management. All vehicle images are uploaded to Cloudinary and stored securely.

## Setup Instructions

### 1. Create Cloudinary Account

1. Go to [https://cloudinary.com](https://cloudinary.com)
2. Sign up for a free account
3. Navigate to your Dashboard

### 2. Get Your Credentials

From the Cloudinary Dashboard, copy:
- **Cloud Name** (e.g., `your-cloud-name`)
- **API Key** (e.g., `123456789012345`)
- **API Secret** (e.g., `abcdefghijklmnopqrstuvwxyz123456`)

### 3. Configure Environment Variables

Add these to your `.env.local` file:

```env
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

### 4. Restart Development Server

After adding the credentials, restart your Next.js server:

```bash
npm run dev
```

## Features

### Image Upload Component

The `ImageUpload` component provides:
- ✅ Drag & drop file selection
- ✅ Image preview before upload
- ✅ Upload progress indicator
- ✅ File type validation (JPEG, PNG, WebP)
- ✅ File size validation (max 10MB)
- ✅ Maximum image limit (10 images per vehicle)
- ✅ Automatic image optimization
- ✅ Secure upload via API

### Upload API Endpoint

**Endpoint**: `POST /api/upload`

**Authentication**: Required (must be signed in)

**Request**:
- Content-Type: `multipart/form-data`
- Body: `file` (image file)

**Response**:
```json
{
  "url": "https://res.cloudinary.com/...",
  "publicId": "easy-car/vehicles/...",
  "width": 1200,
  "height": 800
}
```

## Usage in Forms

### Vehicle Forms

Both "Add Vehicle" and "Edit Vehicle" forms support:
1. **Cloudinary Upload**: Click "Upload Image" button to select and upload files
2. **Manual URL**: Enter image URL directly (for existing images)

### Image Management

- Upload multiple images (up to 10 per vehicle)
- Preview all uploaded images
- Remove images before saving
- Images are automatically optimized and resized

## Image Storage

- **Folder**: `easy-car/vehicles/`
- **Format**: Auto-optimized (WebP when supported)
- **Size**: Max 1200x800px (maintained aspect ratio)
- **Quality**: Auto-optimized for web

## Security

- ✅ Authentication required for uploads
- ✅ File type validation
- ✅ File size limits (10MB)
- ✅ Server-side validation
- ✅ Secure API endpoints

## Troubleshooting

### Upload Fails

1. **Check Environment Variables**
   ```bash
   # Verify credentials are set
   echo $CLOUDINARY_CLOUD_NAME
   ```

2. **Check File Size**
   - Maximum file size: 10MB
   - Compress large images before uploading

3. **Check File Type**
   - Supported: JPEG, JPG, PNG, WebP
   - Convert other formats before uploading

4. **Check Authentication**
   - Must be signed in to upload
   - Sign in as agency manager or client

### Images Not Displaying

1. Check Cloudinary URL is valid
2. Verify image exists in Cloudinary dashboard
3. Check network connectivity
4. Verify CORS settings in Cloudinary (if needed)

## API Reference

### Upload Image

```typescript
const formData = new FormData();
formData.append("file", file);

const response = await fetch("/api/upload", {
  method: "POST",
  body: formData,
});

const data = await response.json();
// { url: "...", publicId: "...", width: ..., height: ... }
```

### Error Responses

```json
// Unauthorized
{ "error": "Unauthorized" }

// Invalid file type
{ "error": "Invalid file type. Only JPEG, PNG, and WebP are allowed." }

// File too large
{ "error": "File size exceeds 10MB limit" }

// Upload failed
{ "error": "Upload failed", "details": "..." }
```

## Best Practices

1. **Optimize Before Upload**: Compress images to reduce upload time
2. **Use Appropriate Formats**: JPEG for photos, PNG for graphics with transparency
3. **Limit Image Count**: Maximum 10 images per vehicle for performance
4. **Descriptive Filenames**: Cloudinary preserves original filenames
5. **Monitor Usage**: Check Cloudinary dashboard for storage and bandwidth usage

## Free Tier Limits

Cloudinary Free Tier includes:
- 25 GB storage
- 25 GB monthly bandwidth
- 25 GB monthly net viewing bandwidth
- Unlimited transformations

For production, consider upgrading based on usage.

## Support

- [Cloudinary Documentation](https://cloudinary.com/documentation)
- [Cloudinary Support](https://support.cloudinary.com)
- [Next.js Image Optimization](https://nextjs.org/docs/app/api-reference/components/image)


