import './ResultConversationHistory.css'



const ResultConversationHistory = ({chatData}) => {
    return(
        <div className="chatArea">
        {chatData.map((value) => 
        <div key={value.answer} className='chatPair'>
            <div className="chatBox chatBox_answer">
                {value.answer}
            </div>
            <div className="chatBox chatBox_question">
                {value.question}
            </div>
        </div>
            )}
        </div>
    )
}

export default ResultConversationHistory;