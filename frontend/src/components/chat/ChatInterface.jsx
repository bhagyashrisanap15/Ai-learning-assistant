import React ,{useState,useEffect,useRef} from 'react';
import  {Send, MessageSquare,Sparkles} from 'lucide-react';
import { useParams } from 'react-router-dom';
import aiService from '../../services/aiService';
import {useAuth} from '../../context/AuthContext';
import  Spinner from '../common/Spinner';
import MarkdownRenderer from '../common/MarkdownRenderer';

const ChatInterface = () => {

    const {id:documentId} =useParams();
    const {user} = useAuth();
    const [history,setHistory] = useState([]);
    const [message,setMessage] = useState('');
    const [loading,setLoading] = useState(false);
    const [initialLoading,setInitialLoading] = useState(true);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView ({behavior:"smooth"});
    };

    useEffect(() => {
        const fetchChatHistory = async () => {
            try{
                setInitialLoading(true);
                const response = await aiService.getChatHistory(documentId);
                setHistory(response.data);
            }catch (error) {
                console.error('Failed to fetch chat history:',error);
            }finally {
                setInitialLoading(false);
            }
        };
        fetchChatHistory();
    },[documentId]);

    useEffect(() => {
        scrollToBottom();
    },[history]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if(!message.trim()) return;

        const userMessage = {role:'user', content:message, timestamp: new Date()};
        setHistory(prev => [...prev,userMessage]);
        setMessage('');
        setLoading(true);

        try{
            const response = await aiService.chat(documentId,userMessage.content);
            const assistantMessage ={
                role:'assistant',
                content:response.data.answer,
                timestamp:new Date(),
                relevantChunks:response.data.relevantChunks
            };
            setHistory(prev => [...prev,assistantMessage]);
        } catch (error) {
            console.error('Chat error:',error);
            const errorMessage = {
                role:'assistant',
                content:'Sorry, I encountered an error. Please try again.',
                timestamp:new Date()
            };
            setHistory(prev => [...prev,errorMessage]);
        }finally {
            setLoading(false);
        }
    };

    const renderMessage = (msg,index) => {
        return "renderMessage"
    };

    if(true) {
        return (
            <div className=''>
                <div className=''>
                    <MessageSquare className='' strokeWidth={2}/>
                </div>
                <Spinner/>
                <p className=''>Loading chat history...</p>
            </div>
        );
    }

    return (
<div className=''>
    {/**message area */}
    <div className=''>
        {history.length === 0 ? (
            <div className=''>
                <div className=''>
                    <MessageSquare className='' strokeWidth={2}/>
                    </div>
                    <h3 className=''>Start a conversation</h3>
                    <p className=''>Ask me anything about the document!</p>
                    </div>
        ):(
            history.map(renderMessage)
        )}
        <div ref ={messagesEndRef}/>
        {loading && (
            <div className=''>
                <div className=''>
                    <Sparkles className='' strokeWidth={2}/>
                    </div>
                    <div className=''>
                        <div className=''>
                            <span className='' style={{animationDelay:'0ms'}}></span>
                                  <span className='' style={{animationDelay:'150ms'}}></span>
                                        <span className='' style={{animationDelay:'300ms'}}></span>
                        </div>
                        </div>
                        </div>
        )}
    </div>


{/**input area */}
    <div className=''>
        <form onSubmit={handleSendMessage} className=''>
            <input
            type ="text"
            value={message}
            onChange={(e)=> setMessage(e.target.value)}
            placeholder='Ask a follow-up question...'
            className=''
            disabled={loading}
            />
            <button
            type='submit'
            disabled={loading || !message.trim()}
            className=''>
                <Send className='' strokeWidth={2}/>
            </button>
        </form>
    </div>
</div>
    )
}

export default ChatInterface