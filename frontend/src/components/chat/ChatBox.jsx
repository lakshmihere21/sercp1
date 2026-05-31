import { useState, useEffect, useRef } from 'react';
import { chatAPI } from '../../services/api';
import { getSocket, emitSendMessage, emitTyping } from '../../services/socket';
import { useAuth } from '../../contexts/AuthContext';
import { timeAgo } from '../../utils/helpers';

const ROLE_COLORS = {
  admin:     'bg-purple-100 text-purple-800',
  responder: 'bg-blue-100 text-blue-800',
  citizen:   'bg-slate-100 text-slate-800',
  volunteer: 'bg-green-100 text-green-800',
};

export default function ChatBox({ alertId, className = '' }) {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [newMsg, setNewMsg] = useState('');
  const [loading, setLoading] = useState(true);
  const [typingUser, setTypingUser] = useState(null);
  const bottomRef = useRef(null);
  const typingTimer = useRef(null);

  // Load history
  useEffect(() => {
    if (!alertId) return;
    chatAPI.getMessages(alertId)
      .then(res => setMessages(res.data.data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [alertId]);

  // Socket listeners
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const handleMessage = (msg) => {
      setMessages(prev => [...prev, msg]);
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
    };

    const handleTyping = ({ name, isTyping }) => {
      if (isTyping) setTypingUser(name);
      else setTypingUser(null);
    };

    socket.on('NEW_MESSAGE', handleMessage);
    socket.on('USER_TYPING', handleTyping);

    return () => {
      socket.off('NEW_MESSAGE', handleMessage);
      socket.off('USER_TYPING', handleTyping);
    };
  }, []);

  // Auto-scroll on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleTypingChange = (val) => {
    setNewMsg(val);
    emitTyping(alertId, true);
    clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(() => emitTyping(alertId, false), 1500);
  };

  const sendMessage = () => {
    const text = newMsg.trim();
    if (!text) return;
    emitSendMessage({ alertId, message: text, type: 'text' });
    setNewMsg('');
    emitTyping(alertId, false);
    clearTimeout(typingTimer.current);
  };

  const isOwn = (msg) =>
    (msg.sender?._id || msg.sender) === user?._id;

  return (
    <div className={`flex flex-col ${className}`}>
      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-3 p-3 min-h-0">
        {loading && (
          <div className="flex justify-center py-6">
            <div className="animate-spin w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full" />
          </div>
        )}

        {!loading && messages.length === 0 && (
          <div className="text-center py-8 text-slate-400">
            <p className="text-3xl mb-2">💬</p>
            <p className="text-sm">No messages yet. Start the conversation.</p>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={msg._id || i} className={`flex ${isOwn(msg) ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-xs lg:max-w-sm px-4 py-2.5 rounded-2xl text-sm shadow-sm ${
              isOwn(msg)
                ? 'bg-blue-600 text-white rounded-br-sm'
                : `${ROLE_COLORS[msg.senderRole] || 'bg-slate-100'} rounded-bl-sm`
            }`}>
              {!isOwn(msg) && msg.senderName && (
                <p className="text-xs font-semibold opacity-70 mb-1 capitalize">
                  {msg.senderName} · {msg.senderRole}
                </p>
              )}
              <p className="leading-relaxed">{msg.message}</p>
              <p className={`text-xs mt-1 text-right ${isOwn(msg) ? 'text-blue-200' : 'opacity-50'}`}>
                {timeAgo(msg.createdAt)}
              </p>
            </div>
          </div>
        ))}

        {typingUser && (
          <div className="flex justify-start">
            <div className="bg-slate-100 text-slate-500 text-xs px-3 py-1.5 rounded-full italic">
              {typingUser} is typing...
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="flex gap-2 p-3 border-t border-slate-100">
        <input
          value={newMsg}
          onChange={e => handleTypingChange(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
          className="input-field text-sm py-2"
          placeholder="Type a message..."
          maxLength={500}
        />
        <button
          onClick={sendMessage}
          disabled={!newMsg.trim()}
          className="btn-primary px-4 py-2 text-sm disabled:opacity-40"
        >
          →
        </button>
      </div>
    </div>
  );
}
