# Quick Instagram Setup Fix

## The Error You're Seeing

"Failed to initiate Instagram connection. Please check your backend configuration."

This means your Instagram credentials are not configured.

## Quick Fix Steps

### 1. Create a `.env` file in your backend root directory

Create a file named `.env` in `C:\DataScience\AutoMark\automark-backend\`

### 2. Add these lines to the `.env` file:

```env
INSTAGRAM_APP_ID=your_app_id_here
INSTAGRAM_APP_SECRET=your_app_secret_here
INSTAGRAM_REDIRECT_URI=http://localhost:8000/api/instagram/callback
ENCRYPTION_KEY=your_encryption_key_here
```

### 3. Get Your Instagram Credentials

1. Go to https://developers.facebook.com/
2. Create an app (or use existing)
3. Add "Instagram Graph API" product
4. Get your App ID and App Secret from Settings → Basic

### 4. Generate Encryption Key

Run this in Python:
```python
from cryptography.fernet import Fernet
print(Fernet.generate_key().decode())
```

Copy the output to `ENCRYPTION_KEY` in your `.env` file.

### 5. Restart Your Backend Server

After creating the `.env` file, restart your FastAPI server:
```bash
# Stop the current server (Ctrl+C)
# Then restart:
uvicorn main:app --reload
```

### 6. Try Again

Go back to the Instagram Settings page and click "Connect Instagram" again.

## For Detailed Setup

See `INSTAGRAM_SETUP.md` for complete step-by-step instructions including:
- Creating Meta Developer account
- Setting up OAuth redirects
- App review process
- Troubleshooting

## Testing Without Instagram

If you just want to test the app without Instagram:
- The Instagram integration is completely optional
- You can use all other features (text ads, image generation, etc.)
- The "Post to Instagram" button will only appear when connected

