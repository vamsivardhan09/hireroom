'use client';

import React, { useState } from 'react';
import {
  Flame,
  Send,
  Pin,
  Shield,
  User,
  Users,
  Lock,
  MessageSquare,
  Sparkles,
  Info,
} from 'lucide-react';
import { useHireRoomStore } from '@/lib/store';

export default function CampfireHubPage() {
  const { campfireRooms, messages, sendMessage, currentUser, listings } = useHireRoomStore();

  const [selectedRoomId, setSelectedRoomId] = useState<string>(campfireRooms[0]?.id || 'room-1');
  const [inputText, setInputText] = useState('');

  const currentRoom = campfireRooms.find(r => r.id === selectedRoomId) || campfireRooms[0];
  const currentListing = listings.find(l => l.id === currentRoom?.listingId);

  const roomMessages = messages.filter(m => m.roomId === currentRoom?.id);
  const pinnedMessages = roomMessages.filter(m => m.isPinned);
  const regularMessages = roomMessages.filter(m => !m.isPinned);

  const isHost = currentUser.role === 'company' || currentUser.role === 'admin';

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !currentRoom) return;

    sendMessage(currentRoom.id, inputText.trim());
    setInputText('');
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-bg py-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex flex-col">
      {/* Top Banner */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-xl bg-accent-light flex items-center justify-center text-accent">
            <Flame className="w-5 h-5 fill-accent" />
          </div>
          <div>
            <h1 className="font-display text-2xl text-ink font-semibold tracking-tight">
              Campfire <span className="italic text-accent">Rooms</span>
            </h1>
            <p className="text-xs text-ink-muted">
              Live Q&A and announcements for every listing. No WhatsApp groups or lost DMs.
            </p>
          </div>
        </div>

        <div className="text-xs text-ink-faint">
          Logged in as <strong className="text-ink">{currentUser.name}</strong> ({currentUser.role})
        </div>
      </div>

      {/* Main Chat Grid: Rooms Sidebar on Left, Active Chat on Right */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
        {/* Rooms Sidebar */}
        <div className="md:col-span-4 bg-surface rounded-3xl border border-ink-border p-4 shadow-soft flex flex-col space-y-2">
          <div className="text-xs font-semibold uppercase tracking-wider text-ink-faint px-3 py-1">
            Listing Rooms ({campfireRooms.length})
          </div>

          <div className="space-y-1.5 overflow-y-auto max-h-[600px]">
            {campfireRooms.map(room => {
              const isSelected = room.id === currentRoom?.id;
              const unread = room.unreadCount || 0;

              return (
                <div
                  key={room.id}
                  onClick={() => setSelectedRoomId(room.id)}
                  className={`p-3.5 rounded-2xl cursor-pointer transition-all border flex items-center justify-between ${
                    isSelected
                      ? 'border-ink bg-surface-subtle shadow-xs'
                      : 'border-transparent hover:bg-surface-subtle/50'
                  }`}
                >
                  <div className="flex items-center space-x-3 min-w-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={room.companyLogo}
                      alt={room.companyName}
                      className="w-9 h-9 rounded-xl object-cover border border-ink-border shrink-0"
                    />
                    <div className="min-w-0">
                      <div className="text-xs font-semibold text-ink truncate">
                        {room.listingTitle}
                      </div>
                      <div className="text-[11px] text-ink-muted truncate">
                        {room.companyName} • {room.memberCount} members
                      </div>
                    </div>
                  </div>

                  {unread > 0 && (
                    <span className="px-2 py-0.5 rounded-full bg-accent text-white text-[10px] font-bold shrink-0 ml-2">
                      {unread}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Chat Feed */}
        <div className="md:col-span-8 bg-surface rounded-3xl border border-ink-border shadow-card flex flex-col overflow-hidden min-h-[550px]">
          {/* Room Header */}
          {currentRoom && (
            <div className="px-6 py-4 border-b border-ink-border flex items-center justify-between bg-surface">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-2xl bg-surface-subtle border border-ink-border flex items-center justify-center text-accent">
                  <Flame className="w-5 h-5 fill-accent" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm text-ink">{currentRoom.listingTitle}</h3>
                  <div className="text-xs text-ink-muted">
                    Hosted by {currentRoom.companyName} • {currentRoom.memberCount} participants
                  </div>
                </div>
              </div>

              {isHost && (
                <span className="px-2.5 py-1 rounded-full bg-ink text-white text-[11px] font-semibold flex items-center space-x-1">
                  <Shield className="w-3 h-3 text-accent" />
                  <span>Host Controls</span>
                </span>
              )}
            </div>
          )}

          {/* Messages Scroll Area */}
          <div className="flex-1 p-6 overflow-y-auto space-y-4">
            {/* Pinned Announcements */}
            {pinnedMessages.map(msg => (
              <div
                key={msg.id}
                className="p-4 rounded-2xl bg-accent-light/40 border border-accent/30 space-y-1.5 shadow-xs"
              >
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-1.5 text-accent font-semibold">
                    <Pin className="w-3.5 h-3.5" />
                    <span>PINNED ANNOUNCEMENT FROM HOST</span>
                  </div>
                  <span className="text-ink-faint text-[10px]">
                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p className="text-xs text-ink leading-relaxed font-medium">{msg.body}</p>
              </div>
            ))}

            {/* Regular Chat Messages */}
            {regularMessages.length === 0 && pinnedMessages.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-ink-muted">
                No messages yet. Ask a question or share your progress!
              </div>
            ) : (
              regularMessages.map(msg => {
                const isMyMessage = msg.userId === currentUser.id;

                return (
                  <div
                    key={msg.id}
                    className={`flex items-start space-x-3 ${isMyMessage ? 'flex-row-reverse space-x-reverse' : ''}`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={msg.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
                      alt={msg.userName}
                      className="w-8 h-8 rounded-full object-cover border border-ink-border shrink-0 mt-0.5"
                    />
                    <div className={`max-w-md ${isMyMessage ? 'items-end' : ''}`}>
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="text-xs font-semibold text-ink">{msg.userName}</span>
                        {msg.isHost && (
                          <span className="px-1.5 py-0.2 bg-ink text-white text-[9px] font-bold rounded">
                            HOST
                          </span>
                        )}
                        <span className="text-[10px] text-ink-faint">
                          {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>

                      <div
                        className={`p-3 rounded-2xl text-xs leading-relaxed ${
                          isMyMessage
                            ? 'bg-ink text-white rounded-tr-none'
                            : 'bg-surface-subtle text-ink rounded-tl-none border border-ink-border'
                        }`}
                      >
                        {msg.body}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Composer */}
          <form onSubmit={handleSend} className="p-4 border-t border-ink-border bg-surface flex items-center space-x-3">
            <input
              type="text"
              placeholder={`Message in ${currentRoom?.listingTitle || 'Campfire'}...`}
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              className="flex-1 px-4 py-2.5 rounded-2xl border border-ink-border bg-surface-subtle/50 text-xs text-ink focus:outline-none focus:border-ink"
            />
            <button
              type="submit"
              disabled={!inputText.trim()}
              className="p-2.5 rounded-2xl bg-ink text-white hover:bg-ink/90 disabled:opacity-40 transition-all shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
