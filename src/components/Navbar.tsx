'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Search, Flame, Briefcase, Trophy, Building2, Plus, Sparkles, User, UserCheck } from 'lucide-react';
import { useHireRoomStore } from '@/lib/store';
import { SearchModal } from './SearchModal';

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { currentUser, switchRole, campfireRooms, candidateProfile } = useHireRoomStore();
  const [searchOpen, setSearchOpen] = useState(false);

  // Total unread messages across Campfire rooms
  const totalUnread = campfireRooms.reduce((acc, r) => acc + (r.unreadCount || 0), 0);

  const isCompany = currentUser.role === 'company';

  const navLinks = [
    {
      name: 'Dashboard',
      href: isCompany ? '/company/dashboard' : '/dashboard',
      active: isCompany ? pathname.startsWith('/company/dashboard') : pathname === '/dashboard',
    },
    {
      name: 'Campfire',
      href: '/campfire',
      active: pathname.startsWith('/campfire'),
      badge: totalUnread > 0 ? `${totalUnread}` : null,
      icon: <Flame className="w-3.5 h-3.5 text-accent mr-1 fill-accent" />,
    },
    {
      name: 'Open roles',
      href: '/roles',
      active: pathname === '/roles' || pathname.startsWith('/roles?type=job'),
    },
    {
      name: 'Challenges',
      href: '/roles?type=challenge',
      active: pathname.startsWith('/challenges') || pathname.includes('type=challenge'),
    },
    {
      name: 'Companies',
      href: '/companies',
      active: pathname === '/companies',
    },
  ];

  return (
    <>
      <header className="sticky top-0 z-40 w-full bg-surface/90 backdrop-blur-md border-b border-ink-border/70 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Left: Brand */}
          <div className="flex items-center space-x-8">
            <Link href="/" className="flex items-center space-x-2 group">
              <div className="w-8 h-8 rounded-xl bg-ink flex items-center justify-center text-white shadow-soft group-hover:scale-105 transition-transform">
                <span className="font-serif font-bold text-lg leading-none tracking-tight">H</span>
              </div>
              <span className="font-display font-semibold text-2xl tracking-tight text-ink">
                Hire<span className="text-accent italic">Room</span>
              </span>
            </Link>

            {/* Navigation items */}
            <nav className="hidden md:flex items-center space-x-1">
              {navLinks.map(link => (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`flex items-center px-3.5 py-1.5 rounded-full text-sm font-medium transition-all ${
                    link.active
                      ? 'bg-surface-subtle text-ink font-semibold shadow-xs'
                      : 'text-ink-muted hover:text-ink hover:bg-surface-subtle/60'
                  }`}
                >
                  {link.icon}
                  {link.name}
                  {link.badge && (
                    <span className="ml-1.5 px-1.5 py-0.2 bg-accent text-white text-[11px] font-bold rounded-full">
                      {link.badge}
                    </span>
                  )}
                </Link>
              ))}
            </nav>
          </div>

          {/* Right: Search, Role Switcher, CTA & Profile */}
          <div className="flex items-center space-x-3">
            {/* Search Button */}
            <button
              onClick={() => setSearchOpen(true)}
              className="flex items-center space-x-2 px-3 py-1.5 rounded-full bg-surface-subtle/80 hover:bg-surface-subtle text-ink-muted hover:text-ink text-xs font-medium border border-ink-border/50 transition-colors"
            >
              <Search className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Search</span>
              <kbd className="hidden sm:inline-block px-1.5 py-0.5 bg-surface rounded text-[10px] text-ink-faint border border-ink-border font-mono">
                ⌘K
              </kbd>
            </button>

            {/* Role Switcher Pill (Candidate <-> Company) */}
            <div className="flex items-center bg-surface-subtle p-0.5 rounded-full border border-ink-border">
              <button
                onClick={() => switchRole('candidate')}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                  !isCompany
                    ? 'bg-surface text-ink font-semibold shadow-xs'
                    : 'text-ink-muted hover:text-ink'
                }`}
              >
                Candidate
              </button>
              <button
                onClick={() => switchRole('company')}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                  isCompany
                    ? 'bg-ink text-white font-semibold shadow-xs'
                    : 'text-ink-muted hover:text-ink'
                }`}
              >
                Company
              </button>
            </div>

            {/* Post CTA or Candidate Onboarding CTA */}
            {isCompany ? (
              <Link
                href="/company/post"
                className="hidden sm:flex items-center space-x-1.5 px-4 py-1.5 bg-ink text-white text-xs font-semibold rounded-full hover:bg-ink/90 shadow-soft transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Post in 4 Questions</span>
              </Link>
            ) : (
              <Link
                href="/onboarding/candidate"
                className="hidden sm:flex items-center space-x-1.5 px-3.5 py-1.5 bg-surface text-ink-muted hover:text-ink border border-ink-border text-xs font-medium rounded-full hover:bg-surface-subtle transition-all"
              >
                <Sparkles className="w-3.5 h-3.5 text-accent" />
                <span>Update Profile</span>
              </Link>
            )}

            {/* User Avatar */}
            <Link
              href={isCompany ? "/company/dashboard" : "/onboarding/candidate?step=5"}
              className="w-8 h-8 rounded-full border border-ink-border overflow-hidden bg-surface-subtle flex items-center justify-center shrink-0 hover:ring-2 hover:ring-accent/40 transition-all"
              title={currentUser.name}
            >
              {currentUser.avatar ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="w-4 h-4 text-ink-muted" />
              )}
            </Link>
          </div>
        </div>
      </header>

      {/* Global Cmd+K Search Modal */}
      <SearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
