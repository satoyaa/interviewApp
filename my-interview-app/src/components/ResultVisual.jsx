import RadarChartInterviewScore from "./RadarChart";
import ResultVisualStarBar from "./ResultVisualStarBar";
import ResultConversationHistory from "./ResultConversationHistory"
import './ResultVisual.css'

const ResultVisual = ({score, feedback, title, chatData}) => {
    // compute overall score: try to find explicit overall, otherwise average
    const overallEntry = score && score.find(s => s.subject === '総合' || s.subject === '総合スコア' || s.subject === '総評')
    let overall = overallEntry && typeof overallEntry.average === 'number' ? overallEntry.average : null
    if (overall == null && Array.isArray(score)){
        const nums = score.map(s => (typeof s.average === 'number' ? s.average : NaN)).filter(n => !isNaN(n))
        overall = nums.length ? Math.round(nums.reduce((a,b)=>a+b,0)/nums.length) : 0
    }

    return (
        <section className="resultComponent">
            <div className="result_top_area">
                <div className="result_left">
                    <div className="overallScore">
                        <div className="scoreValue">{overall}</div>
                        <div className="scoreMax">/4</div>
                    </div>
                    <div className="radarChart">
                        <RadarChartInterviewScore score={score.filter(item => item.subject !== '総評')}></RadarChartInterviewScore>
                    </div>
                </div>

                {/*<div className="result_right">
                    <ResultVisualStarBar scores={score.filter(item => item.subject !== '総評')} maxLevel={4} />
                </div>*/}
            </div>

            <div className="result_bottom_area">
                <ul>
                    {feedback.map((comment) => <li key={comment.subject}>
                        <h2>{comment.subject}</h2>
                        <p>{comment.contents}</p>
                    </li>)}
                </ul>
            </div>
            <div className="result_chat_history">
                {chatData ? <ResultConversationHistory chatData={chatData}/> : <></>}
            </div>
        </section>
    )
}

export default ResultVisual;