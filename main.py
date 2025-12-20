import os
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Optional
import requests
import json
import torch
from diffusers import StableDiffusionImg2ImgPipeline
from diffusers import StableDiffusionPipeline
import base64
import io
from PIL import Image, ImageDraw, ImageFont
import time
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi import UploadFile, File, Form
from PIL import Image, ImageFilter
from dotenv import load_dotenv

# Load environment variables
load_dotenv()



app = FastAPI(title="AutoMark - DeepSeek + Stable Diffusion Ad Generator")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---- Request Models ----
class TextAdRequest(BaseModel):
    product_name: str
    description: str
      
class VisualAdRequest(BaseModel):
    product_name: str
    description: str
    ad_text: str

def overlay_text(image: Image.Image, text: str) -> Image.Image:
    draw = ImageDraw.Draw(image)
    width, height = image.size

    # Dynamic font sizing
    base_font_size = int(height * 0.045)  
    try:
        font = ImageFont.truetype("arial.ttf", size=base_font_size)
    except:
        font = ImageFont.load_default()

    # Text wrapping
    max_width = width * 0.85
    words = text.split()
    lines = []
    line = ""

    for w in words:
        test_line = (line + " " + w).strip()
        test_width = draw.textbbox((0, 0), test_line, font=font)[2]

        if test_width <= max_width:
            line = test_line
        else:
            lines.append(line)
            line = w

    lines.append(line)

    # Line height + padding
    line_height = draw.textbbox((0, 0), "A", font=font)[3] + 10
    total_text_height = len(lines) * line_height

    # Add bigger rectangle for safer padding
    padding = 40
    rect_y0 = height - total_text_height - padding
    rect_y1 = height

    # Semi-transparent rectangle
    draw.rectangle(
        [(0, rect_y0), (width, rect_y1)],
        fill=(0, 0, 0, 180)
    )

    # Draw text with top padding
    y = rect_y0 + 20
    for l in lines:
        line_width = draw.textbbox((0, 0), l, font=font)[2]
        x = (width - line_width) // 2
        draw.text((x, y), l, font=font, fill="white")
        y += line_height

    return image


# ---- DeepSeek Ad Generation ----
def generate_ad_with_deepseek(product_name: str, description: str):
    try:
        payload = {
            "model": "deepseek-r1:7b",
            "prompt": f"Write a catchy, one line marketing ad for '{product_name}'. "
                      f"Product details: {description}",
            "stream": False
        }

        res = requests.post("http://127.0.0.1:11434/api/generate", json=payload)
        res.raise_for_status()

        text = res.text.strip()
        if text.count('\n') > 0:
            text = text.split('\n')[-1]

        result = json.loads(text)
        return result.get("response", "No response generated")

    except Exception as e:
        print("❌ Error generating ad:", e)
        raise HTTPException(status_code=500, detail=str(e))


# ---- Stable Diffusion Image Generation ----
def generate_visual_ad(product_name: str, description: str, ad_text: str):
    try:
        device = "cuda" if torch.cuda.is_available() else "cpu"

        # Load model (cached after first load)
        model_id = "runwayml/stable-diffusion-v1-5"
        pipe = StableDiffusionPipeline.from_pretrained(model_id, torch_dtype=torch.float16 if device == "cuda" else torch.float32)
        pipe = pipe.to(device)

        prompt = (
            f"A modern, realistic, professional marketing banner for {product_name}. "
            f"Theme: {description}. Include readable overlay text: '{ad_text}'. "
            f"Bright lighting, high quality, commercial photography."
        )

        image = pipe(prompt).images[0]
        # Overlay ad text
        image = overlay_text(image, ad_text)

        
        os.makedirs("generated_ads", exist_ok=True)

        filename = f"{product_name.lower().replace(' ','_')}_{int(time.time())}.png"

        save_path = f"generated_ads/{filename}"
        image.save(save_path)

        return save_path

    except Exception as e:
        print("❌ Error generating image:", e)
        raise HTTPException(status_code=500, detail=str(e))
    
# ---- Serve generated images ----
app.mount("/generated_ads", StaticFiles(directory="generated_ads"), name="generated_ads")

from diffusers import StableDiffusionPipeline
import torch

# load pipeline globally
txt2img_pipe = StableDiffusionPipeline.from_pretrained(
    "runwayml/stable-diffusion-v1-5",  # or another SD model
    torch_dtype=torch.float16,          # optional, reduces memory
)
txt2img_pipe = txt2img_pipe.to("cuda")  # or "cpu" if no GPU
txt2img_pipe.enable_attention_slicing()  # optional for low VRAM

sr_model = None

def process_product_image(uploaded_file, ad_text: str, description: str = "") -> str:
    """
    Read uploaded_file (FastAPI UploadFile), remove background if possible,
    generate or fallback a background, composite the product centered,
    optionally upscale if `sr_model` exists, overlay ad_text and save.
    Returns saved file path (relative).
    """
    try:
        # --- 0) ensure output dir
        GENERATED_DIR = "generated_ads"
        os.makedirs(GENERATED_DIR, exist_ok=True)

        # --- 1) read bytes from UploadFile safely (use file handle, not await)
        try:
            uploaded_file.file.seek(0)
        except Exception:
            pass
        data = uploaded_file.file.read()
        if not data:
            raise ValueError("Uploaded file is empty")

        # --- 2) open product image, convert to RGBA
        product = Image.open(io.BytesIO(data)).convert("RGBA")

        # --- 3) resize to safe dimensions (max side 1024) and make dims divisible by 8
        max_side = 1024
        w0, h0 = product.width, product.height
        scale = min(1.0, max_side / max(w0, h0))
        new_w = max(8, int(w0 * scale))
        new_h = max(8, int(h0 * scale))

        # make divisible by 8 (diffusers requirement)
        def _div8(x): return x - (x % 8) if x % 8 == 0 else (x + (8 - (x % 8)))
        new_w = _div8(new_w)
        new_h = _div8(new_h)

        product = product.resize((new_w, new_h), Image.LANCZOS)

        # --- 4) attempt background removal using rembg (best-effort)
        fg = None
        try:
            from rembg import remove
            no_bg = remove(data)  # returns bytes or PIL-like
            if isinstance(no_bg, (bytes, bytearray)):
                fg = Image.open(io.BytesIO(no_bg)).convert("RGBA")
            else:
                # rembg may return PIL image in some versions
                fg = no_bg.convert("RGBA")
            # ensure same size as product
            fg = fg.resize((new_w, new_h), Image.LANCZOS)
        except Exception as e:
            # fallback: use the resized product as foreground (no alpha)
            fg = product

        # --- 5) generate background via global txt2img_pipe if available, else programmatic studio bg
        bg = None
        try:
            prompt = f"Advertising background for product: {description or ad_text}. soft studio lighting, subtle vignette, minimal, professional, realistic, high quality"
            # use global pipeline if available and loaded (StableDiffusionPipeline)
            if "txt2img_pipe" in globals() and txt2img_pipe is not None:
                # ensure height/width divisible by 8 (already done)
                out = txt2img_pipe(prompt, height=new_h, width=new_w, guidance_scale=7.5, num_inference_steps=20)
                bg = out.images[0].convert("RGBA")
            else:
                raise RuntimeError("txt2img_pipe not available")
        except Exception:
            # programmatic studio background (safe fallback)
            def make_studio_background(size=(new_w, new_h)):
                w, h = size
                base = Image.new("RGB", (w, h), "#f5f6f8")
                # simple vertical gradient
                top = Image.new("RGB", (w, h), "#ffffff")
                bottom = Image.new("RGB", (w, h), "#e9eef2")
                mask = Image.new("L", (w, h))
                for y in range(h):
                    val = int(255 * (y / h))
                    for x in range(w):
                        mask.putpixel((x, y), val)
                grad = Image.composite(top, bottom, mask)
                grad = grad.filter(ImageFilter.GaussianBlur(radius=6))
                # subtle vignette
                vign = Image.new("L", (w, h), 0)
                for y in range(h):
                    for x in range(w):
                        dx = (x - w / 2) / (w / 2)
                        dy = (y - h / 2) / (h / 2)
                        d = (dx * dx + dy * dy) ** 0.5
                        vign.putpixel((x, y), int(255 * max(0, 1 - d * 0.8)))
                vign = vign.filter(ImageFilter.GaussianBlur(radius=20))
                bg = Image.composite(grad, Image.new("RGB", (w, h), "#ffffff"), vign)
                return bg
            bg = make_studio_background((new_w, new_h)).convert("RGBA")

        # --- 6) composite foreground centered on background (handle alpha)
        composed = Image.new("RGBA", (new_w, new_h))
        composed.paste(bg, (0, 0))
        # If fg has alpha channel, use alpha_composite; otherwise paste centered
        if fg.mode == "RGBA":
            # ensure fg size equals canvas
            if fg.size != composed.size:
                fg = fg.resize(composed.size, Image.LANCZOS)
            composed = Image.alpha_composite(composed, fg)
        else:
            # fg has no alpha -> paste centered
            fw, fh = fg.size
            x = (new_w - fw) // 2
            y = (new_h - fh) // 2
            composed.paste(fg.convert("RGBA"), (x, y))

        # --- 7) optional upscaling if sr_model present (best-effort)
        final_rgb = composed.convert("RGB")
        try:
            if "sr_model" in globals() and sr_model is not None:
                # sr_model.predict may require specific input; wrap in try/except
                up = sr_model.predict(final_rgb)
                if isinstance(up, Image.Image):
                    final_rgb = up.convert("RGB")
        except Exception:
            # ignore upscaling failures
            pass

        # --- 8) overlay ad text (assumes overlay_text(image, text) exists)
        final_with_text = overlay_text(final_rgb, ad_text)

        # --- 9) save
        filename = f"product_enhanced_{int(time.time())}.jpg"
        save_path = os.path.join(GENERATED_DIR, filename)
        final_with_text.save(save_path, quality=92)

        return save_path

    except Exception as e:
        # propagate as HTTPException for FastAPI endpoints
        print("❌ process_product_image error:", e)
        raise HTTPException(status_code=500, detail=str(e))


# app.mount("/uploaded_images", StaticFiles(directory="uploaded_images"), name="uploaded_images")

# ---- Routes ----
@app.post("/generate-ad/")
async def generate_text_ad(request: TextAdRequest):
    ad_text = generate_ad_with_deepseek(request.product_name, request.description)
    return {"ad_text": ad_text}

@app.post("/generate-visual-ad/")
async def generate_visual_ad_endpoint(request: TextAdRequest):
    # Automatically generate ad text
    ad_text = generate_ad_with_deepseek(request.product_name, request.description)
    
    # Generate image with overlay
    image_path = generate_visual_ad(request.product_name, request.description, ad_text)
    os.makedirs("uploaded_images", exist_ok=True)
  
    return {
        "image_name": os.path.basename(image_path),
        "ad_text": ad_text
    }

@app.get("/")
async def root():
    return {"message": "AutoMark Backend (DeepSeek + Stable Diffusion) is running 🚀"}

@app.post("/process_image_enhancement/")
async def process_image_enhancement_endpoint(
    product_name: str = Form(...),
    description: str = Form(...),
    file: UploadFile = File(...)
):
    # Step 1: Generate ad text
    ad_text = generate_ad_with_deepseek(product_name, description)

    # Step 2: Enhance image + overlay text (one function handles everything)
    final_image_path = process_product_image(file, ad_text)

    return {
        "image_url": f"http://localhost:8000/{final_image_path}",
        "ad_text": ad_text
    }

# ---- Instagram Integration Routes ----
from app.services.instagram_service import InstagramService
from app.services.instagram_storage import (
    get_user_connection, save_user_connection, delete_user_connection, save_instagram_post
)
from app.services.caption_generator import generate_instagram_caption
from fastapi.responses import RedirectResponse

class InstagramConnectRequest(BaseModel):
    user_id: str = "default_user"  # In production, get from auth

class InstagramPostRequest(BaseModel):
    user_id: str = "default_user"
    image_url: str
    ad_text: str
    product_name: str
    description: str
    post_type: str = "feed"  # "feed" or "story"
    caption: Optional[str] = None

@app.get("/api/instagram/config-status")
async def get_instagram_config_status():
    """Check Instagram configuration status"""
    from app.services.instagram_service import INSTAGRAM_APP_ID, INSTAGRAM_APP_SECRET
    
    return {
        "app_id_configured": bool(INSTAGRAM_APP_ID),
        "app_secret_configured": bool(INSTAGRAM_APP_SECRET),
        "redirect_uri": os.getenv("INSTAGRAM_REDIRECT_URI", "http://localhost:8000/api/instagram/callback"),
        "message": "Instagram App ID and Secret are required. Please set INSTAGRAM_APP_ID and INSTAGRAM_APP_SECRET in your .env file." if not INSTAGRAM_APP_ID or not INSTAGRAM_APP_SECRET else "Configuration looks good!"
    }

@app.get("/api/instagram/auth-url")
async def get_instagram_auth_url():
    """Get Instagram OAuth authorization URL"""
    try:
        auth_url = InstagramService.get_auth_url()
        return {"auth_url": auth_url}
    except ValueError as e:
        # Configuration error - provide helpful message
        raise HTTPException(
            status_code=400,
            detail={
                "error": str(e),
                "message": "Instagram credentials not configured. Please set INSTAGRAM_APP_ID and INSTAGRAM_APP_SECRET in your .env file. See INSTAGRAM_SETUP.md for setup instructions."
            }
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/instagram/callback")
async def instagram_callback(code: str, user_id: str = "default_user"):
    """Handle Instagram OAuth callback"""
    try:
        # Exchange code for token
        token_data = InstagramService.exchange_code_for_token(code)
        access_token = token_data.get("access_token")
        
        # Get long-lived token
        long_token_data = InstagramService.get_long_lived_token(access_token)
        long_token = long_token_data.get("access_token")
        expires_in = long_token_data.get("expires_in", 5184000)  # 60 days default
        
        # Get user info
        user_info = InstagramService.get_user_info(long_token)
        
        # Get Facebook pages
        pages = InstagramService.get_facebook_pages(long_token)
        
        # Find Instagram Business Account
        ig_user_id = None
        page_access_token = None
        for page in pages:
            page_token = page.get("access_token")
            ig_account_id = InstagramService.get_instagram_business_account(
                page.get("id"), page_token
            )
            if ig_account_id:
                ig_user_id = ig_account_id
                page_access_token = page_token
                break
        
        # Encrypt and save connection
        encrypted_token = InstagramService.encrypt_token(page_access_token or long_token)
        
        connection_data = {
            "instagram_user_id": user_info.get("id"),
            "instagram_username": user_info.get("username"),
            "ig_business_account_id": ig_user_id,
            "encrypted_token": encrypted_token,
            "account_type": user_info.get("account_type", "PERSONAL"),
            "expires_in": expires_in,
            "connected_at": time.time()
        }
        
        save_user_connection(user_id, connection_data)
        
        # Redirect to frontend with success
        return RedirectResponse(url=f"http://localhost:5173/instagram-settings?connected=true")
    except Exception as e:
        print(f"❌ Instagram callback error: {e}")
        return RedirectResponse(url=f"http://localhost:5173/instagram-settings?error={str(e)}")

@app.get("/api/instagram/status")
async def get_instagram_status(user_id: str = "default_user"):
    """Get Instagram connection status"""
    connection = get_user_connection(user_id)
    if not connection:
        return {"connected": False}
    
    return {
        "connected": True,
        "username": connection.get("instagram_username"),
        "account_type": connection.get("account_type"),
        "connected_at": connection.get("connected_at")
    }

@app.post("/api/instagram/disconnect")
async def disconnect_instagram(request: InstagramConnectRequest):
    """Disconnect Instagram account"""
    try:
        delete_user_connection(request.user_id)
        return {"success": True, "message": "Instagram disconnected successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/instagram/post")
async def post_to_instagram(request: InstagramPostRequest):
    """Post image to Instagram"""
    try:
        # Get user connection
        connection = get_user_connection(request.user_id)
        if not connection:
            raise HTTPException(status_code=400, detail="Instagram not connected")
        
        # Decrypt token
        encrypted_token = connection.get("encrypted_token")
        access_token = InstagramService.decrypt_token(encrypted_token)
        ig_user_id = connection.get("ig_business_account_id")
        
        if not ig_user_id:
            raise HTTPException(status_code=400, detail="Instagram Business Account not found. Please connect a Business/Creator account.")
        
        # Generate caption if not provided
        caption = request.caption
        if not caption:
            caption = generate_instagram_caption(
                request.ad_text,
                request.product_name,
                request.description
            )
        
        # Post to Instagram
        result = InstagramService.post_to_instagram(
            ig_user_id=ig_user_id,
            image_url=request.image_url,
            caption=caption if request.post_type == "feed" else "",  # Stories don't support captions
            access_token=access_token,
            post_type=request.post_type
        )
        
        # Save post data
        save_instagram_post(request.user_id, {
            "post_id": result.get("id"),
            "image_url": request.image_url,
            "caption": caption,
            "post_type": request.post_type,
            "posted_at": time.time(),
            "product_name": request.product_name
        })
        
        return {
            "success": True,
            "post_id": result.get("id"),
            "message": f"Successfully posted to Instagram {request.post_type}!"
        }
    except Exception as e:
        print(f"❌ Instagram post error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/instagram/generate-caption")
async def generate_caption_for_instagram(
    ad_text: str = Form(...),
    product_name: str = Form(...),
    description: str = Form(...)
):
    """Generate Instagram-optimized caption"""
    try:
        caption = generate_instagram_caption(ad_text, product_name, description)
        return {"caption": caption}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

