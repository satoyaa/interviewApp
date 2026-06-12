import os
import json
from dotenv import load_dotenv
from fastapi import HTTPException
from pydantic import BaseModel, Field
import asyncio
import random

load_dotenv()

api_key = os.environ.get("GEMINI_API_KEY")
if not api_key:
    print("Warning: GEMINI_API_KEY is not set.")

try:
    from google import genai
    client = genai.Client(api_key=api_key)
except Exception:
    client = None
    
class SelfAnalysisSchema(BaseModel):
    episode_summary: str = Field(description="600文字程度のエピソード概要．活動の背景，課題，動機など．")
    think_list: list[str] = Field(description="200文字以内で何を考えたか（複数可）")
    gain_list: list[str] = Field(description="200文字以内で何を得たか（複数可）")
    learn_list: list[str] = Field(description="200文字以内で何を学んだか（複数可）")
    why_list: list[str] = Field(description="200文字以内でなぜそれをやったのか（複数可）")
    appeal_list: list[str] = Field(description="200文字以内でどんな能力がアピールできるか（複数可）")
    contribution_list: list[str] = Field(description="200文字以内でどう活かせるか（複数可）")


async def call_llm_api(prompt: str) -> str:
    if client is None:
        raise HTTPException(status_code=500, detail="LLM client is not available.")

    max_attempts = 6
    base_delay = 0.5

    for attempt in range(1, max_attempts + 1):
        try:
            # APIの呼び出し
            response = await client.aio.models.generate_content(
                model='gemini-2.5-flash',
                contents=prompt
            )

            # 成功時の処理
            if not getattr(response, "text", None):
                return "AIからの応答が空でした．"

            return response.text

        except Exception as e:
            error_msg = str(e)
            print(f"Gemini API Error (attempt {attempt}): {error_msg}")

            # リトライ対象のエラー（503 Unavailable, 429 Too Many Requests等）か判定
            # ※必要に応じて条件を追加・変更してください
            is_retriable = any(code in error_msg for code in ["503", "429", "UNAVAILABLE"])

            if not is_retriable:
                # 認証エラー(401)やリクエスト不正(400)などは即座に終了する
                raise HTTPException(status_code=500, detail="AIの応答取得に失敗しました．")

            if attempt == max_attempts:
                # 最大試行回数に達した場合はエラーを投げる
                raise HTTPException(status_code=500, detail="AIサーバーが混雑しています．時間をおいて再度お試しください．")

            # エクスポネンシャルバックオフ + ジッターによる待機
            jitter = random.uniform(0.001, 1.0)
            delay = base_delay * (2 ** (attempt - 1)) + jitter
            print(f"Retrying in {delay:.3f}s...")
            await asyncio.sleep(delay)


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
                {{ "subject": "総評", "contents": "...", "average": 4 }},
                {{ "subject": "質問の意図との合致", "contents": "...", "average": 4 }},
                {{ "subject": "回答の長さの適切さ", "contents": "...", "average": 3 }},
                {{ "subject": "回答内容（具体性と論理性）", "contents": "...", "average": 4 }},
                {{ "subject": "言葉選びの適切さ", "contents": "...", "average": 4 }},
                {{ "subject": "文法の破綻のなさ", "contents": "...", "average": 4 }},
                {{ "subject": "客観的なビジネス適性", "contents": "...", "average": 4 }}
            ]
        }}
        各指標の評価基準は次の通りです．
        1．質問の意図との合致（結論ファースト）
        ・レベル1：意図を全く理解しておらず，的を射ない回答をしている．
        具体例：強みを聞かれたのに志望動機を話し始めるなど，会話のキャッチボールが成立していない．
        ・レベル2：一般的な回答としては成立しているが，質問の意図からズレており，結論が後回しになっている．
        具体例：状況説明から入り，面接官が最後まで聞かないと「結局何が言いたいのか」が分からない．
        ・レベル3：質問の意図を正しく理解し，聞かれたことに対して結論から端的に答えている．
        具体例：「私の強みは〇〇です．具体的には〜」と，質問に対する直接的な答えから話し始めている．
        ・レベル4：質問の背景や面接官の意図まで深く汲み取り，期待以上の付加価値をつけて回答している．
        具体例：単に結論を答えるだけでなく，その強みや経験が「今後の業務にどう活きるか」まで簡潔に添えて提示できている．

        2．回答の長さの適切さ
        ・レベル1：極端に短すぎる，または長すぎて対話が成立しない．
        具体例：詳しい話を聞きたい質問に対して一言のみで終わる，一言で終わる質問を長く話す．または3分以上一方的に話し続けて面接官が口を挟めない．
        ・レベル2：やや冗長である，または情報不足で追加の質問を多く要する．
        具体例：本題に入る前の前提条件（サークルの規模や仕組みなど）ばかりを長く語りすぎる．
        ・レベル3：面接官が理解しやすい適切な情報量と長さ（目安：1分前後）でまとまっている．
        具体例：要点を絞り，会話のリズムを崩さない適切な長さで回答を終えられている．
        ・レベル4：情報量と時間のバランスが絶妙であり，相手の反応を見ながら柔軟に調整できている．
        具体例：面接官がうなずきや興味を示した部分を察知し，そこを厚く語るなど，対話としての質が高い．

        3．回答内容（具体性と論理性）
        ・レベル1：抽象的な主張のみで，裏付けとなる具体例や理由がない．
        具体例：「とにかく頑張りました」「色々な経験を通して成長しました」のみで事実の詳細がない．
        ・レベル2：エピソードはあるが事実の羅列になっており，思考プロセスや課題解決のロジックが浅い．
        具体例：「〇〇という問題があり，先輩に言われた通りに対処したら直りました」という受動的な内容に留まる．
        ・レベル3：状況・課題・行動・結果が具体的に整理されており，自分なりの論理的思考が示せている．
        具体例：「ミスを減らすため，原因を〇〇と分析し，自ら××という仕組みを導入しました」と根拠を持って語れている．
        ・レベル4：多角的な視点から課題を捉え，独自の発想や高度な論理性で解決に導いており，他業務への高い再現性が感じられる．
        具体例：目前の課題解決だけでなく，組織全体や長期的な影響まで見越した行動をとったことが言語化できている．

        4．言葉選びの適切さ
        ・レベル1：ビジネスシーンに著しく不適切な言葉遣いである．
        具体例：タメ口や若者言葉が混ざる，または面接官に対して不快感を与える表現を用いている．
        ・レベル2：意味は通じるが，不適切な言葉や「えっと」「あの」などのノイズが多く，プロフェッショナルさに欠ける．
        具体例：相手の知識レベルを考慮せず，専門用語を噛み砕かずに多用してしまう．
        ・レベル3：ビジネスシーンにふさわしい適切な言葉遣いができている．
        具体例：正しい敬語（尊敬語・謙譲語・丁寧語）を違和感なく使い分けられている．
        ・レベル4：洗練された言葉選びで説得力があり，面接官を惹きつける魅力的な表現ができている．
        具体例：複雑な事象を，分かりやすい比喩や的確なビジネス用語を用いて鮮やかに表現できている．

        5．文法の破綻のなさ（構文と論理展開）
        ・レベル1：主語と述語がねじれており，文の意味が理解できない．
        具体例：「私が頑張ったことはアルバイトで，それは売上を上げるためでした」のように構文が崩壊している．
        ・レベル2：意味は推測できるが，接続詞の使い方が不自然で，話の前後関係が分かりにくい．
        具体例：「〜ですが，〜なので，〜ですが」と，意味なく逆接を繰り返して文を繋げてしまう．
        ・レベル3：主語と述語の関係が明確で，正しい文法と適切な接続詞を用いて話ができている．
        具体例：「理由は2つあります．1つ目は〜．2つ目は〜」と，頭の中に論理構造を描きながら話せている．
        ・レベル4：複雑な状況説明であっても，修飾語句や接続詞を巧みに使いこなし，淀みなくクリアな文脈を構成できている．
        具体例：前提となる条件や例外的な事項を話す際にも，文が迷子にならず，聴き手がストレスなく情景をイメージできる．

        6．客観的なビジネス適性（主体性・価値観の一貫性）
        ・レベル1：働く目的や責任感が欠如しており，組織で働く上で懸念が大きい．
        具体例：過去の失敗に対して「環境のせいだ」といった他責思考が強い発言が目立つ．
        ・レベル2：個人の活動については語れるが，他者と協働する姿勢や主体性のアピールが弱い．
        具体例：与えられたタスクをこなす話に終始しており，自分から仕事を生み出す姿勢や明確な就労観が見えない．
        ・レベル3：自身の価値観が言語化されており，チームでの協調性や主体性など，基礎的な適性を示せている．
        具体例：「私の軸は〇〇であり，チームではこのように立ち回って貢献できます」と一貫性を持って語れている．
        ・レベル4：自己認知が非常に深く，自身の価値観と社会が求める役割の接点を客観的かつ魅力的に語れる．
        具体例：リーダーシップやフォロワーシップを発揮した高度な経験があり，どのような環境・企業でも柔軟に適応し成果を出せる再現性を提示できている．
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

import json
# import openai # 実際のプロジェクト環境に合わせてLLMクライアントをインポートしてください

async def analyze_interview_history(entries: list) -> dict:
    """
    面接の対話履歴から自己分析データを抽出する関数
    """
    # 対話履歴を一つのテキストにまとめる
    history_text = "\n".join(
        [f"ユーザー: {entry.answer_text}\n面接官(LLM): {entry.question_text}" for entry in entries]
    )
    
    prompt = f"""
    以下の面接の対話履歴を分析し，自己PRに繋がるエピソードを一つ取り上げ自己分析マップを作成するためのデータを抽出してください．
    出力は必ず以下のJSONスキーマに従ってください．

    【対話履歴】
    {history_text}
    """

    # ここにLLMへのAPIリクエスト処理を実装します
    
    response = await client.aio.models.generate_content(
        model='gemini-2.5-flash',
        contents=prompt,
        config={'response_mime_type': 'application/json',
                'response_schema': SelfAnalysisSchema,
                'temperature': 0.7
                }
    )
    return json.loads(response.text)