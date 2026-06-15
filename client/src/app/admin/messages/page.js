'use client';

import { useState, useEffect } from 'react';
import { fetchApi } from '@/utils/api';

export default function AdminMessagesPage() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState(null);

  const loadMessages = async () => {
    setLoading(true);
    try {
      const data = await fetchApi('/api/contactmessages');
      setMessages(data);
      // If we had a selected message, update its state
      if (selectedMessage) {
        const updated = data.find(m => m.id === selectedMessage.id);
        if (updated) setSelectedMessage(updated);
      }
    } catch (err) {
      console.error('Error fetching messages:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMessages();
  }, []);

  const handleSelectMessage = async (msg) => {
    setSelectedMessage(msg);
    if (!msg.isRead) {
      try {
        await fetchApi(`/api/contactmessages/${msg.id}/read`, {
          method: 'POST'
        });
        // Reload list to update isRead indicator
        const data = await fetchApi('/api/contactmessages');
        setMessages(data);
        // Update selected message state
        const updated = data.find(m => m.id === msg.id);
        if (updated) setSelectedMessage(updated);
      } catch (err) {
        console.error('Failed to mark message as read:', err);
      }
    }
  };

  const handleDeleteMessage = async (msg, e) => {
    // Prevent click from bubbling to list-item select handler
    e?.stopPropagation();
    if (!confirm(`Delete message from "${msg.senderName}"? This cannot be undone.`)) return;
    try {
      await fetchApi(`/api/contactmessages/${msg.id}`, { method: 'DELETE' });
      // Clear detail pane if deleted message was selected
      if (selectedMessage?.id === msg.id) setSelectedMessage(null);
      loadMessages();
    } catch (err) {
      console.error('Failed to delete message:', err);
      alert(`Delete failed: ${err.message}`);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-64 font-mono text-on-surface-variant">
        <span className="material-symbols-outlined text-electric-cyan text-3xl animate-spin mb-4">sync</span>
        <span>Loading messages inbox...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-sora text-3xl font-bold text-on-surface">Inbox Messages</h1>
        <p className="font-sans text-sm text-on-surface-variant">Read and track collaboration proposals submitted via the landing page.</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 h-[600px] items-stretch">
        
        {/* Messages List Sidebar */}
        <div className="w-full lg:w-1/3 glass-card rounded-2xl overflow-y-auto divide-y divide-white/5 border border-white/5 h-full">
          {messages.length > 0 ? (
            messages.map(msg => {
              const isSelected = selectedMessage?.id === msg.id;
              return (
                <div 
                  key={msg.id}
                  onClick={() => handleSelectMessage(msg)}
                  className={`p-4 cursor-pointer hover:bg-white/5 transition-colors relative flex flex-col justify-between ${
                    isSelected ? 'bg-electric-cyan/5 border-l-2 border-l-electric-cyan' : ''
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-mono text-xs font-semibold text-on-surface line-clamp-1 pr-2">
                      {msg.senderName}
                    </span>
                    <time className="font-mono text-[10px] text-on-surface-variant shrink-0">
                      {new Date(msg.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </time>
                  </div>
                  <div className="flex justify-between items-center gap-2">
                    <div className="text-xs text-on-surface-variant line-clamp-1 font-sans flex-1">
                      {msg.subject}
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      {!msg.isRead && (
                        <span className="w-2 h-2 rounded-full bg-electric-cyan animate-pulse"></span>
                      )}
                      <button
                        onClick={(e) => handleDeleteMessage(msg, e)}
                        className="p-1 rounded text-on-surface-variant/50 hover:text-error hover:bg-error/10 transition-colors"
                        title="Delete message"
                      >
                        <span className="material-symbols-outlined text-sm">delete</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="p-8 text-center text-on-surface-variant text-xs">
              No inquiries found in database.
            </div>
          )}
        </div>

        {/* Message Details Pane */}
        <div className="flex-grow w-full lg:w-2/3 glass-card rounded-2xl p-6 border border-white/5 flex flex-col h-full justify-between">
          {selectedMessage ? (
            <div className="space-y-6 flex-grow flex flex-col justify-between overflow-y-auto">
              <div className="space-y-4 border-b border-white/5 pb-6">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                  <div>
                    <h2 className="font-sora text-xl font-bold text-on-surface">{selectedMessage.senderName}</h2>
                    <a href={`mailto:${selectedMessage.senderEmail}`} className="font-mono text-xs text-electric-cyan hover:underline">
                      {selectedMessage.senderEmail}
                    </a>
                  </div>
                  <time className="font-mono text-xs text-on-surface-variant">
                    {new Date(selectedMessage.createdAt).toLocaleString('en-US', { 
                      month: 'long', 
                      day: 'numeric', 
                      year: 'numeric',
                      hour: 'numeric',
                      minute: '2-digit'
                    })}
                  </time>
                </div>
                <div className="text-sm font-semibold text-on-surface">
                  Subject: <span className="font-sans font-normal text-on-surface-variant">{selectedMessage.subject}</span>
                </div>
              </div>

              {/* Message content body */}
              <div className="flex-grow py-4 text-sm text-on-surface-variant font-sans whitespace-pre-wrap leading-relaxed overflow-y-auto">
                {selectedMessage.body}
              </div>
              
              <div className="pt-6 border-t border-white/5 flex justify-between items-center gap-2">
                <span className="font-mono text-[10px] uppercase text-on-surface-variant flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm text-green-400">check_circle</span>
                  Status: {selectedMessage.isRead ? 'Read' : 'Processing'}
                </span>
                <button
                  onClick={(e) => handleDeleteMessage(selectedMessage, e)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-full font-mono text-xs uppercase text-error border border-error/20 hover:bg-error/10 transition-colors"
                >
                  <span className="material-symbols-outlined text-sm">delete</span>
                  Delete
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col justify-center items-center h-full text-on-surface-variant font-mono">
              <span className="material-symbols-outlined text-4xl text-on-surface-variant/30 mb-2">mail_outline</span>
              <span>Select an inquiry from the inbox sidebar to read.</span>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
