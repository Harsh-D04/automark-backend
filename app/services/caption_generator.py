import requests
import json
from typing import Optional


def generate_instagram_caption(ad_text: str, product_name: str, description: str) -> str:
    """
    Generate an Instagram-optimized caption using DeepSeek
    Includes hashtags, emojis, and call-to-action
    """
    try:
        payload = {
            "model": "deepseek-r1:7b",
            "prompt": f"""Create an engaging Instagram caption for this product ad.

Product: {product_name}
Description: {description}
Ad Text: {ad_text}

Requirements:
- Start with an engaging hook (1-2 lines)
- Include the main ad message
- Add 5-10 relevant hashtags at the end
- Include appropriate emojis (2-3)
- Add a call-to-action
- Keep it under 2200 characters
- Make it authentic and engaging

Format:
[Hook with emoji]
[Main message]
[Call-to-action]
#hashtag1 #hashtag2 #hashtag3...

Return ONLY the caption text, no explanations.""",
            "stream": False
        }

        res = requests.post("http://127.0.0.1:11434/api/generate", json=payload)
        res.raise_for_status()

        text = res.text.strip()
        if text.count('\n') > 0:
            # Get the last line which usually contains the response
            lines = text.split('\n')
            for line in reversed(lines):
                try:
                    result = json.loads(line)
                    if "response" in result:
                        return result["response"].strip()
                except:
                    continue
            # Fallback: use the last line
            text = lines[-1]

        result = json.loads(text)
        caption = result.get("response", ad_text).strip()
        
        # Fallback: if AI generation fails, create a simple caption
        if not caption or len(caption) < 10:
            caption = f"{ad_text}\n\n✨ {product_name}\n\n#marketing #advertising #product"
        
        return caption

    except Exception as e:
        print(f"❌ Error generating Instagram caption: {e}")
        # Fallback caption
        hashtags = " ".join([f"#{tag}" for tag in product_name.lower().replace(" ", "").split()[:5]])
        return f"{ad_text}\n\n✨ {product_name}\n\n{hashtags} #marketing #advertising"

