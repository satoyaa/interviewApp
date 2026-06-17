from fastapi import APIRouter, Depends, HTTPException, Query, Request
from sqlalchemy.orm import Session
from datetime import datetime, timezone, timedelta
from zoneinfo import ZoneInfo
from db.database import get_db
from db.models import InterviewEntry, SelfAnalysis, InterviewSession, User
from services.llm import analyze_interview_history
from core.auth import get_current_user
from core.limiter import limiter

router = APIRouter(
    prefix="/self-analysis",
    tags=["SelfAnalysis"]
)

# 全体分析の固定識別子
GLOBAL_ANALYSIS_ID = "all_latest"

@router.post("/analyze")
@limiter.limit("5/minute")
async def generate_self_analysis(
    request: Request,
    limit: int = Query(default=10, description="分析対象とする最新の面接件数"), 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    これまでのすべての面接から最新の〇件を取得し，LLMで分析して保存する
    """
    request.state.user = current_user.auth_provider_id

    # 最新のid順（降順）で指定件数を取得
    # Multi-tenancy: filter by user_id
    entries = (
        db.query(InterviewEntry)
        .filter(InterviewEntry.user_id == current_user.id)
        .order_by(InterviewEntry.id.desc())
        .limit(limit)
        .all()
    )
    
    if not entries:
        raise HTTPException(status_code=404, detail="面接データが一件も存在しません．")

    # LLMに渡すために対話履歴を時系列順（古い順）に並び替える
    entries.reverse()

    # API request count check and increment
    if current_user.api_requests >= 12:
        raise HTTPException(status_code=429, detail="本日のAPI呼び出し上限（12回）に達しました。")

    # 自己分析クールタイムチェック (3日間)
    if current_user.self_analysis_cooltime == 1 and current_user.self_analysis_date:
        next_available = current_user.self_analysis_date + timedelta(days=3)
        if datetime.now(timezone.utc) < next_available.astimezone(timezone.utc):
            # 日本時間で表示
            next_jst = next_available.astimezone(ZoneInfo("Asia/Tokyo"))
            raise HTTPException(
                status_code=429, 
                detail=f"自己分析は3日間に1回のみ実行可能です。次に実行できるのは {next_jst.strftime('%Y/%m/%d %H:%M')} 以降です。"
            )
    
    current_user.api_requests += 1
    db.commit()

    # LLMで分析を実行
    analysis_data = await analyze_interview_history(entries)
    print(analysis_data)

    # ... (既存のコード)
    
    # 成功時にクールタイムを設定
    current_user.self_analysis_cooltime = 1
    current_user.self_analysis_date = datetime.now(timezone.utc)
    db.commit()

    return {"message": f"最新の {len(entries)} 件の面接データを基に分析が完了しました．"}


@router.get("/graph-data")
@limiter.limit("10/minute")
def get_graph_data(
    request: Request, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    全体分析の結果から rawNodes と dynamicEdges を生成して返す
    """
    request.state.user = current_user.auth_provider_id

    # 固定の識別子とユーザーIDでデータを取得
    analysis = db.query(SelfAnalysis).filter(
        SelfAnalysis.session_id == GLOBAL_ANALYSIS_ID,
        SelfAnalysis.user_id == current_user.id
    ).first()
    if not analysis:
        raise HTTPException(status_code=404, detail="分析データが見つかりません．先に分析を実行してください．")

    # 親ノードの設定
    raw_nodes = [
        {
            "id": "center",
            "data": { "label_title": "全体エピソード概要", "label_content": analysis.episode_summary },
            "type": "parent"
        }
    ]
    
    # 子ノードの定義（固定）
    categories = [
        {"id": "think", "title": "何を考えたか", "list": analysis.think_list},
        {"id": "gain", "title": "何を得たか", "list": analysis.gain_list},
        {"id": "learn", "title": "何を学んだか", "list": analysis.learn_list},
        {"id": "why", "title": "なぜそれをやったのか", "list": analysis.why_list},
        {"id": "appeal", "title": "どんな能力がアピールできるか", "list": analysis.appeal_list},
        {"id": "contribution", "title": "どう活かせるか", "list": analysis.contribution_list},
    ]

    for cat in categories:
        raw_nodes.append({
            "id": cat["id"],
            "data": { "label": cat["title"] },
            "type": "child"
        })

    dynamic_edges = []
    
    # 孫ノードと動的エッジの生成
    for cat in categories:
        for idx, item_text in enumerate(cat["list"]):
            grandchild_id = f"{cat['id']}-{idx + 1}"
            
            raw_nodes.append({
                "id": grandchild_id,
                "data": { "label": item_text },
                "type": "grandchild"
            })
            
            dynamic_edges.append({
                "id": f"e-{cat['id']}-{idx + 1}",
                "source": cat['id'],
                "target": grandchild_id
            })

    return {
        "rawNodes": raw_nodes,
        "dynamicEdges": dynamic_edges
    }
