


const SelfAnalysisHeader = ({HandleRequestSelfAnalysis, isLoading}) => {
    return (
        <div className="selfAnalysisHeader">
            これはヘッダーです．
            <button onClick={()=>HandleRequestSelfAnalysis()}>自己分析開始</button>
        </div>
    )
}

export default SelfAnalysisHeader;