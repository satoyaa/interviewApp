import os
import json
from dotenv import load_dotenv
from fastapi import HTTPException

load_dotenv()

api_key = os.environ.get("GEMINI_API_KEY")
if not api_key:
    print("Warning: GEMINI_API_KEY is not set.")

try:
    from google import genai
    client = genai.Client(api_key=api_key)
except Exception:
    client = None


async def call_llm_api(prompt: str) -> str:
    if client is None:
        raise HTTPException(status_code=500, detail="LLM client is not available.")

    try:
        response = await client.aio.models.generate_content(
            model='gemini-2.5-flash',
            contents=prompt
        )

        if not getattr(response, "text", None):
            return "AIからの応答が空でした．"

        return response.text

    except Exception as e:
        print(f"Gemini API Error: {e}")
        raise HTTPException(status_code=500, detail="AIの応答取得に失敗しました．")


async def call_llm_api_for_analyze(interview_content: str) -> dict:
    if client is None:
        return {"title": "分析エラー", "feedback": [{"subject": "エラー", "contents": "LLMクライアントが未設定です．", "average": 0}]}

    try:
        prompt = f"""
        あなたはプロのキャリアアドバイザーです．
        以下の面接やり取り（履歴）を詳細に分析し，フィードバックを行ってください．

        【面接履歴】
        {interview_content}

        【出力形式】
        必ず以下のJSON形式のみで回答してください．
        {{
            "title": "企業名 - 対策カテゴリ (例: 〇〇株式会社 - 志望動機)",
            "feedback": [
                {{ "subject": "総評", "contents": "...", "average": 5 }},
                {{ "subject": "質問の意図に沿っているか", "contents": "...", "average": 4 }},
                {{ "subject": "回答の長さは適切か", "contents": "...", "average": 3 }},
                {{ "subject": "回答内容は適切か", "contents": "...", "average": 4 }},
                {{ "subject": "言葉選びは適切か", "contents": "...", "average": 5 }},
                {{ "subject": "文法に破綻はないか", "contents": "...", "average": 4 }},
                {{ "subject": "企業にふさわしいか", "contents": "...", "average": 4 }}
            ]
        }}
        """

        response = await client.aio.models.generate_content(
            model='gemini-2.5-flash',
            contents=prompt,
            config={'response_mime_type': 'application/json'}
        )

        return json.loads(response.text)

    except Exception as e:
        print(f"Analysis Error: {e}")
        return {"title": "分析エラー", "feedback": [{"subject": "エラー", "contents": "分析に失敗しました．", "average": 0}]}
