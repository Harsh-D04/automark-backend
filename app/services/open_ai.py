import os, json, openai
from dotenv import load_dotenv

load_dotenv()
openai.api_key = os.getenv("OPENAI_API_KEY")

def generate_posts(brand_name: str, tone: str, industry: str, n: int = 5):
    prompt = f"""
You are a professional social media marketer.
Generate {n} social media posts for a brand.

Brand name: {brand_name}
Tone: {tone}
Industry: {industry}

Return ONLY a JSON array of posts like:
[{{"caption": "...", "hashtags": ["#...","#...","#..."]}}, ...]
"""
    res = openai.ChatCompletion.create(
        model="deepseek-r1:7b",
        messages=[{"role": "user", "content": prompt}],
        max_tokens=700,
        temperature=0.7
    )
    text = res["choices"][0]["message"]["content"]
    try:
        return json.loads(text)
    except Exception:
        return {"raw": text}
