const InterviewTrainingLoading = () => {
    return (
        <>
            <style>
                {`
                @keyframes bounce {
                    0%, 80%, 100% { 
                        transform: translateY(0); 
                    }
                    40% { 
                        transform: translateY(-10px); 
                    }
                }
                .dot {
                    display: inline-block;
                    animation: bounce 1.4s infinite ease-in-out both;
                }
                .dot:nth-child(1) {
                    animation-delay: -0.32s;
                }
                .dot:nth-child(2) {
                    animation-delay: -0.16s;
                }
                `}
            </style>
            
            <h1>
                ロード中
                <span className="dot">.</span>
                <span className="dot">.</span>
                <span className="dot">.</span>
            </h1>
        </>
    );
}

export default InterviewTrainingLoading;