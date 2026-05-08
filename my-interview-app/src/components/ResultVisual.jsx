import RadarChartInterviewScore from "./RadarChart";

const ResultVisual = ({score, feedback, title}) => {
    return (
        <section className="resultComponent">
            <div className="result_top_area">
                <h1>{!title ? "結果": title}</h1>
                <div className="radarChart">
                    <RadarChartInterviewScore score={score.filter(item => item.subject !== '総評')}></RadarChartInterviewScore>
                </div>
            </div>
            <div className="result_bottom_area">
                <ul>
                    {feedback.map((comment) => <li key={comment.subject}>
                        <h2>{comment.subject}</h2>
                        {comment.contents}
                    </li>)}
                </ul>
            </div>
        </section>
    )
}

export default ResultVisual;