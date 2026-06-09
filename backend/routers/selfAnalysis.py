from fastapi import APIRouter, Depends, HTTPException, Query, Request
from sqlalchemy.orm import Session
from database import get_db
from models import InterviewEntry, SelfAnalysis
from services.llm import analyze_interview_history
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
):
    """
    これまでのすべての面接から最新の〇件を取得し，LLMで分析して保存する
    """
    # 最新のid順（降順）で指定件数を取得
    entries = (
        db.query(InterviewEntry)
        .order_by(InterviewEntry.id.desc())
        .limit(limit)
        .all()
    )
    
    if not entries:
        raise HTTPException(status_code=404, detail="面接データが一件も存在しません．")

    # LLMに渡すために対話履歴を時系列順（古い順）に並び替える
    entries.reverse()

    # LLMで分析を実行
    analysis_data = await analyze_interview_history(entries)
    print(analysis_data)

    # 全体分析用のレコードを検索
    db_analysis = db.query(SelfAnalysis).filter(SelfAnalysis.session_id == GLOBAL_ANALYSIS_ID).first()
    
    if db_analysis:
        db_analysis.episode_summary = analysis_data["episode_summary"]
        db_analysis.think_list = analysis_data["think_list"]
        db_analysis.gain_list = analysis_data["gain_list"]
        db_analysis.learn_list = analysis_data["learn_list"]
        db_analysis.why_list = analysis_data["why_list"]
        db_analysis.appeal_list = analysis_data["appeal_list"]
        db_analysis.contribution_list = analysis_data["contribution_list"]
    else:
        db_analysis = SelfAnalysis(
            session_id=GLOBAL_ANALYSIS_ID, # 固定の識別子で保存
            episode_summary=analysis_data["episode_summary"],
            think_list=analysis_data["think_list"],
            gain_list=analysis_data["gain_list"],
            learn_list=analysis_data["learn_list"],
            why_list=analysis_data["why_list"],
            appeal_list=analysis_data["appeal_list"],
            contribution_list=analysis_data["contribution_list"]
        )
        db.add(db_analysis)
    
    db.commit()
    return {"message": f"最新の {len(entries)} 件の面接データを基に分析が完了しました．"}


@router.get("/graph-data")
@limiter.limit("10/minute")
def get_graph_data(request: Request, db: Session = Depends(get_db)):
    """
    全体分析の結果から rawNodes と dynamicEdges を生成して返す
    """
    # 固定の識別子でデータを取得
    analysis = db.query(SelfAnalysis).filter(SelfAnalysis.session_id == GLOBAL_ANALYSIS_ID).first()
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