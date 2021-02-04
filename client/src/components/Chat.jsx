import React, { useState , useEffect} from 'react';
import { socket } from '../index';
import ChatMessage from './ChatMessage';
import './Chat.css';
import TextBox from './TextBox';
import Button from '../components/Button';
import Ajax from '../lib/ajax';

function Chat({gameCode, name}) {
    const [message, setMessages] = useState([]);

    //send message
   socket.emit('new message', gameCode, name, message); 

   //listen to message
   socket.on('new message', (message) =>
    console.log(message),
    setMessages([message])
   );

     useEffect(() => {
        socket.on("new message", message=> {
            setMessages(message);
        });
    }, []);


    return (
        <div className="panel chat">
            <button className="panel-toggle">Hide Chat</button>
            <div className="chat-messages">
                {message.map(ChatMessage)}
            </div>
            <TextBox id = "chat-message" placeholder="Type a message" />
        
            <Button onClick={() => socket.emit(document.getElementById("chat-message").value = message) }>Send</Button>

            
        </div>
    );
}

export default Chat;
