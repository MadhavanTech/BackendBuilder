import React, { useContext, useState } from 'react';
import { Bot, Send } from 'lucide-react';
import { askchatboat } from '../utils/maddyChatbot';
import { Appcontext } from '../context/Backend';
import '../style/MaddyChatbot.css';

const MaddyChatbot = ({ conversationKey = 'default' }) => {
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const { chatMessagesByScope, setChatMessagesByScope } = useContext(Appcontext);
  const chatMessages = chatMessagesByScope[conversationKey] || [];

  const addMessage = (message) => {
    setChatMessagesByScope((messagesByScope) => ({
      ...messagesByScope,
      [conversationKey]: [...(messagesByScope[conversationKey] || []), message],
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const askedQuestion = question.trim();

    if (!askedQuestion || loading) {
      return;
    }

    setLoading(true);
    addMessage({ role: 'user', text: askedQuestion });
    setQuestion('');

    try {
      const reply = await askchatboat(askedQuestion);
      addMessage({ role: 'assistant', text: reply });
    } catch (requestError) {
      addMessage({ role: 'error', text: requestError.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className='maddyChatbot'>
      <div className='maddyHeader'>
        <div className='maddyIcon'><Bot size={18} /></div>
        <div>
          <h4>Maddy</h4>
          <p>Backend assistant</p>
        </div>
      </div>

      <div className='maddyMessages' aria-live='polite'>
        {chatMessages.map((message, index) => (
          <p id='Request' key={`${message.role}-${index}`} className={`maddyMessage maddy${message.role[0].toUpperCase()}${message.role.slice(1)}`}>
            {message.text}
          </p>
        ))}
        {loading && <p className='maddyEmpty'>Maddy is thinking...</p>}
        {!chatMessages.length && !loading && <p className='maddyEmpty'>Ask Maddy about your backend setup.</p>}
      </div>

      <div className='maddyForm' role='form'>
        <input
          value={question}
          onChange={(event) => setQuestion(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              handleSubmit(event);
            }
          }}
          placeholder='Ask a question...'
          aria-label='Ask Maddy a question'
          disabled={loading}
        />
        <button type='button' onClick={handleSubmit} disabled={loading || !question.trim()} aria-label='Send question'>
          <Send size={16} />
        </button>
      </div>
    </section>
  );
};

export default MaddyChatbot;
