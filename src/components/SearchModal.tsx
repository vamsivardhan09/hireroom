'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Briefcase, Trophy, Building, X, ArrowRight } from 'lucide-react';
import { useHireRoomStore } from '@/lib/store';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const router = useRouter();
  const { listings, companies } = useHireRoomStore();
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) {
          onClose();
        } else {
          // handled by parent
        }
      }
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filteredListings = query.trim()
    ? listings.filter(
        l =>
          l.title.toLowerCase().includes(query.toLowerCase()) ||
          l.companyName.toLowerCase().includes(query.toLowerCase()) ||
          l.skills.some(s => s.toLowerCase().includes(query.toLowerCase()))
      )
    : listings.slice(0, 4);

  const filteredCompanies = query.trim()
    ? companies.filter(c => c.name.toLowerCase().includes(query.toLowerCase()))
    : companies.slice(0, 2);

  const handleSelectListing = (id: string, type: string) => {
    onClose();
    if (type === 'challenge') {
      router.push(`/challenges/${id}`);
    } else {
      router.push(`/roles?id=${id}`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 bg-ink/40 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-2xl bg-surface rounded-2xl shadow-float border border-ink-border overflow-hidden mx-4">
        {/* Input */}
        <div className="flex items-center px-4 py-3.5 border-b border-ink-border">
          <Search className="w-5 h-5 text-ink-muted mr-3" />
          <input
            type="text"
            placeholder="Search roles, challenges, skills, companies..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            autoFocus
            className="w-full bg-transparent text-ink placeholder:text-ink-faint focus:outline-none text-base"
          />
          <button
            onClick={onClose}
            className="p-1 rounded-md text-ink-muted hover:text-ink hover:bg-surface-subtle"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Results */}
        <div className="max-h-96 overflow-y-auto p-3 space-y-4">
          {/* Listings */}
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-ink-faint px-3 py-1">
              Roles & Challenges
            </div>
            <div className="space-y-1 mt-1">
              {filteredListings.length > 0 ? (
                filteredListings.map(listing => (
                  <div
                    key={listing.id}
                    onClick={() => handleSelectListing(listing.id, listing.type)}
                    className="flex items-center justify-between p-3 rounded-xl hover:bg-surface-subtle cursor-pointer transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-9 h-9 rounded-lg bg-surface-subtle border border-ink-border flex items-center justify-center shrink-0">
                        {listing.type === 'challenge' ? (
                          <Trophy className="w-4 h-4 text-accent" />
                        ) : (
                          <Briefcase className="w-4 h-4 text-ink" />
                        )}
                      </div>
                      <div>
                        <div className="font-medium text-sm text-ink">{listing.title}</div>
                        <div className="text-xs text-ink-muted">
                          {listing.companyName} • {listing.location} • {listing.pay}
                        </div>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-ink-faint" />
                  </div>
                ))
              ) : (
                <div className="text-sm text-ink-muted px-3 py-2">No matching listings found</div>
              )}
            </div>
          </div>

          {/* Companies */}
          {filteredCompanies.length > 0 && (
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-ink-faint px-3 py-1">
                Companies
              </div>
              <div className="space-y-1 mt-1">
                {filteredCompanies.map(c => (
                  <div
                    key={c.id}
                    onClick={() => {
                      onClose();
                      router.push(`/roles?company=${c.id}`);
                    }}
                    className="flex items-center justify-between p-3 rounded-xl hover:bg-surface-subtle cursor-pointer transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <Building className="w-4 h-4 text-ink-muted ml-2 mr-1" />
                      <div>
                        <div className="font-medium text-sm text-ink">{c.name}</div>
                        <div className="text-xs text-ink-muted">{c.oneLiner}</div>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-ink-faint" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2.5 bg-surface-subtle border-t border-ink-border flex items-center justify-between text-xs text-ink-muted">
          <span>Navigate with mouse or keyboard</span>
          <kbd className="px-2 py-0.5 bg-surface border border-ink-border rounded text-[11px] font-mono">
            ESC to close
          </kbd>
        </div>
      </div>
    </div>
  );
}
