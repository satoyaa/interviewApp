const InterviewTrainingQuestion = ({setQuestionAnswerState, currentQuestion}) => {
    return (
        <>
        <p>{currentQuestion}</p>
        <button onClick={() => setQuestionAnswerState("answer")}>質問を確認しました．</button>
        </>
    )
}

export default InterviewTrainingQuestion;