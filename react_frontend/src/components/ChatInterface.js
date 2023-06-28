import React, { useState } from 'react';
import queryIndex from '../apis/queryIndex';

function ChatInterface() {
    const [message, setMessage] = useState('');
    const [chatHistory, setChatHistory] = useState([]);

    const sendMessage = (e) => {
        // Add user's message to chat history immediately
        const newExchange = { message: message, response: 'Typing...' };
        setChatHistory(prevChatHistory => [...prevChatHistory, newExchange]);
        setMessage('');

        queryIndex(message, chatHistory).then((response) => {
            // Update the bot's response once it arrives
            setChatHistory(prevChatHistory => {
                const updatedChatHistory = [...prevChatHistory];
                updatedChatHistory[updatedChatHistory.length - 1].response = response.text;
                return updatedChatHistory;
            });
        });
    };

    return (
        <div className="chat-container">
            <div className="chat-history">
                {chatHistory.map((item, index) => (
                    <div key={index}>
                        <p className="chat-message user-message">You: {item.message}</p>
                        <p className="chat-message bot-message">3B-Bot:
                            {item.response === 'Typing...' 
                                ? <div className="typing"><span className="dot"></span><span className="dot"></span><span className="dot"></span></div> 
                                : item.response
                            }
                        </p>
                    </div>
                ))}
            </div>
            <div className="chat-input">
                <input className="input-field" value={message} onChange={e => setMessage(e.target.value)} />
                <button className="send-button" onClick={sendMessage}>Send</button>
            </div>
        </div>
    );
}

export default ChatInterface;
