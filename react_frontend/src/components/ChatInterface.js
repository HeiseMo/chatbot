import React, { useState } from 'react';
import queryIndex from '../apis/queryIndex';

function ChatInterface() {
    const [message, setMessage] = useState('');
    const [chatHistory, setChatHistory] = useState([]);
    const [typing, setTyping] = useState(false);
    const [responseText, setResponseText] = useState('');

    const sendMessage = (e) => {
        setTyping(true);
        queryIndex(message, chatHistory).then((response) => {
            const newExchange = { message: message, response: response.text };
            setChatHistory([...chatHistory, newExchange]);
            setMessage('');
            setResponseText(response.text);
            setTyping(false);
        });
    };

    return (
        <div className="chat-container">
            <div className="chat-history">
                {chatHistory.map((item, index) => (
                    <div key={index}>
                        <p className="chat-message user-message">You: {item.message}</p>
                        <p className="chat-message bot-message">3B Bot: {item.response}</p>
                    </div>
                ))}
                {typing && <div className="typing-indicator"><div></div><div></div><div></div></div>}
            </div>
            <div className="chat-input">
                <input className="input-field" value={message} onChange={e => setMessage(e.target.value)} />
                <button className="send-button" onClick={sendMessage}>Send</button>
            </div>
        </div>
    );
}

export default ChatInterface;
