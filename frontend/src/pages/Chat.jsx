import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { io } from 'socket.io-client';
import toast from 'react-hot-toast';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const Chat = () => {
  const { bookingId } = useParams();
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState('');
  const bottomRef = useRef(null);

  const socket = useMemo(() => {
    const token = localStorage.getItem('token');
    return io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:5001', {
      auth: { token },
      transports: ['websocket'],
    });
  }, []);

  useEffect(() => {
    return () => {
      socket.disconnect();
    };
  }, [socket]);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get(`/messages/${bookingId}`);
        setMessages(res.data);
      } catch (e) {
        toast.error(e.response?.data?.error || 'Failed to load messages');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [bookingId]);

  useEffect(() => {
    socket.emit('join_booking', { bookingId });

    socket.on('message', (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    socket.on('error_message', (payload) => {
      toast.error(payload?.error || 'Socket error');
    });

    return () => {
      socket.off('message');
      socket.off('error_message');
    };
  }, [socket, bookingId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = (e) => {
    e.preventDefault();
    const body = text.trim();
    if (!body) return;

    socket.emit('send_message', { bookingId, body });
    setText('');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h1 className="text-xl font-bold text-gray-900">Chat</h1>
            <p className="text-sm text-gray-600">Booking #{bookingId}</p>
          </div>

          <div className="h-[60vh] overflow-y-auto p-6 space-y-3 bg-gray-50">
            {messages.map((m) => {
              const mine = m.sender_user_id === user?.id;
              return (
                <div key={m.id || `${m.sender_user_id}-${m.created_at}-${Math.random()}`} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[75%] rounded-2xl px-4 py-2 shadow-sm ${mine ? 'bg-primary-600 text-white' : 'bg-white text-gray-900'}`}>
                    <div className="text-sm whitespace-pre-wrap">{m.body}</div>
                    <div className={`text-[11px] mt-1 ${mine ? 'text-primary-100' : 'text-gray-400'}`}>
                      {new Date(m.created_at).toLocaleString()}
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={bottomRef} />
          </div>

          <form onSubmit={handleSend} className="p-4 border-t border-gray-200 flex gap-2">
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            <button
              type="submit"
              className="bg-primary-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-700"
            >
              Send
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Chat;
