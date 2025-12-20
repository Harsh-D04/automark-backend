import os
import requests
import json
from typing import Optional, Dict
from cryptography.fernet import Fernet
import base64

# Instagram API Configuration
INSTAGRAM_APP_ID = os.getenv("INSTAGRAM_APP_ID", "")
INSTAGRAM_APP_SECRET = os.getenv("INSTAGRAM_APP_SECRET", "")
INSTAGRAM_REDIRECT_URI = os.getenv("INSTAGRAM_REDIRECT_URI", "http://localhost:8000/api/instagram/callback")
FACEBOOK_API_VERSION = "v18.0"

# Encryption key for tokens (in production, use a secure key from env)
ENCRYPTION_KEY = os.getenv("ENCRYPTION_KEY", Fernet.generate_key().decode())
cipher = Fernet(ENCRYPTION_KEY.encode() if isinstance(ENCRYPTION_KEY, str) else ENCRYPTION_KEY)


class InstagramService:
    """Service for Instagram API interactions"""
    
    @staticmethod
    def get_auth_url() -> str:
        """Generate Instagram OAuth authorization URL"""
        if not INSTAGRAM_APP_ID:
            raise ValueError("Instagram App ID not configured")
        
        scopes = [
            "instagram_basic",
            "pages_show_list",
            "instagram_content_publish",
            "pages_read_engagement"
        ]
        
        auth_url = (
            f"https://api.instagram.com/oauth/authorize"
            f"?client_id={INSTAGRAM_APP_ID}"
            f"&redirect_uri={INSTAGRAM_REDIRECT_URI}"
            f"&scope={','.join(scopes)}"
            f"&response_type=code"
        )
        return auth_url
    
    @staticmethod
    def exchange_code_for_token(code: str) -> Dict:
        """Exchange authorization code for access token"""
        if not INSTAGRAM_APP_SECRET:
            raise ValueError("Instagram App Secret not configured")
        
        token_url = "https://api.instagram.com/oauth/access_token"
        
        data = {
            "client_id": INSTAGRAM_APP_ID,
            "client_secret": INSTAGRAM_APP_SECRET,
            "grant_type": "authorization_code",
            "redirect_uri": INSTAGRAM_REDIRECT_URI,
            "code": code
        }
        
        response = requests.post(token_url, data=data)
        response.raise_for_status()
        return response.json()
    
    @staticmethod
    def get_long_lived_token(short_token: str) -> Dict:
        """Exchange short-lived token for long-lived token"""
        token_url = f"https://graph.instagram.com/access_token"
        
        params = {
            "grant_type": "ig_exchange_token",
            "client_secret": INSTAGRAM_APP_SECRET,
            "access_token": short_token
        }
        
        response = requests.get(token_url, params=params)
        response.raise_for_status()
        return response.json()
    
    @staticmethod
    def get_user_info(access_token: str) -> Dict:
        """Get Instagram user information"""
        url = f"https://graph.instagram.com/me"
        params = {
            "fields": "id,username,account_type",
            "access_token": access_token
        }
        
        response = requests.get(url, params=params)
        response.raise_for_status()
        return response.json()
    
    @staticmethod
    def get_facebook_pages(access_token: str) -> list:
        """Get Facebook pages connected to the user"""
        url = f"https://graph.facebook.com/{FACEBOOK_API_VERSION}/me/accounts"
        params = {
            "access_token": access_token,
            "fields": "id,name,instagram_business_account"
        }
        
        response = requests.get(url, params=params)
        response.raise_for_status()
        data = response.json()
        return data.get("data", [])
    
    @staticmethod
    def get_instagram_business_account(page_id: str, page_access_token: str) -> Optional[str]:
        """Get Instagram Business Account ID from Facebook Page"""
        url = f"https://graph.facebook.com/{FACEBOOK_API_VERSION}/{page_id}"
        params = {
            "fields": "instagram_business_account",
            "access_token": page_access_token
        }
        
        response = requests.get(url, params=params)
        response.raise_for_status()
        data = response.json()
        instagram_account = data.get("instagram_business_account")
        return instagram_account.get("id") if instagram_account else None
    
    @staticmethod
    def create_media_container(ig_user_id: str, image_url: str, caption: str, access_token: str) -> Dict:
        """Create a media container for posting to Instagram"""
        url = f"https://graph.facebook.com/{FACEBOOK_API_VERSION}/{ig_user_id}/media"
        
        params = {
            "image_url": image_url,
            "caption": caption,
            "access_token": access_token
        }
        
        response = requests.post(url, params=params)
        response.raise_for_status()
        return response.json()
    
    @staticmethod
    def publish_media(ig_user_id: str, creation_id: str, access_token: str) -> Dict:
        """Publish the media container to Instagram"""
        url = f"https://graph.facebook.com/{FACEBOOK_API_VERSION}/{ig_user_id}/media_publish"
        
        params = {
            "creation_id": creation_id,
            "access_token": access_token
        }
        
        response = requests.post(url, params=params)
        response.raise_for_status()
        return response.json()
    
    @staticmethod
    def create_story(ig_user_id: str, image_url: str, access_token: str) -> Dict:
        """Create an Instagram story"""
        url = f"https://graph.facebook.com/{FACEBOOK_API_VERSION}/{ig_user_id}/media"
        
        params = {
            "image_url": image_url,
            "media_type": "STORIES",
            "access_token": access_token
        }
        
        response = requests.post(url, params=params)
        response.raise_for_status()
        creation_id = response.json().get("id")
        
        # Publish the story
        return InstagramService.publish_media(ig_user_id, creation_id, access_token)
    
    @staticmethod
    def encrypt_token(token: str) -> str:
        """Encrypt access token for storage"""
        encrypted = cipher.encrypt(token.encode())
        return base64.b64encode(encrypted).decode()
    
    @staticmethod
    def decrypt_token(encrypted_token: str) -> str:
        """Decrypt access token from storage"""
        decoded = base64.b64decode(encrypted_token.encode())
        decrypted = cipher.decrypt(decoded)
        return decrypted.decode()
    
    @staticmethod
    def post_to_instagram(ig_user_id: str, image_url: str, caption: str, access_token: str, post_type: str = "feed") -> Dict:
        """Post image to Instagram (feed or story)"""
        if post_type == "story":
            return InstagramService.create_story(ig_user_id, image_url, access_token)
        else:
            # Create media container
            container = InstagramService.create_media_container(ig_user_id, image_url, caption, access_token)
            creation_id = container.get("id")
            
            # Publish the media
            return InstagramService.publish_media(ig_user_id, creation_id, access_token)

