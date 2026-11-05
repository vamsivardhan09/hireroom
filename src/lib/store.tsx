'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  User,
  Company,
  Listing,
  CandidateProfile,
  Application,
  Submission,
  CampfireRoom,
  CampfireMessage,
  UserRole,
} from '@/types';
import { DEMO_COMPANIES, DEMO_LISTINGS, DEMO_CANDIDATES } from './seed-data';

interface HireRoomStoreContextType {
  currentUser: User;
  setCurrentUser: (user: User) => void;
  switchRole: (role: UserRole) => void;

  candidateProfile: CandidateProfile;
  updateCandidateProfile: (updates: Partial<CandidateProfile>) => void;

  companies: Company[];
  addCompany: (company: Omit<Company, 'id' | 'createdDaysAgo'>) => Company;

  listings: Listing[];
  addListing: (listing: Omit<Listing, 'id' | 'createdAt' | 'viewsCount' | 'applicantsCount'>) => Listing;
  updateListing: (id: string, updates: Partial<Listing>) => void;

  applications: Application[];
  applyToListing: (listingId: string, screeningAnswers?: Record<string, string>) => Application;
  updateApplicationStatus: (id: string, status: Application['status']) => void;

  submissions: Submission[];
  addSubmission: (submission: Omit<Submission, 'id' | 'submittedAt' | 'totalScore'>) => Submission;

  campfireRooms: CampfireRoom[];
  messages: CampfireMessage[];
  sendMessage: (roomId: string, body: string, isPinned?: boolean) => void;

  // Stats
  candidateStats: {
    totalApplications: number;
    inReview: number;
    shortlisted: number;
    accepted: number;
  };
}

export const emptyCandidateProfile: CandidateProfile = {
  userId: 'cand-current',
  name: '',
  headline: '',
  location: '',
  phone: '',
  experience: '',
  availability: '',
  about: '',
  skills: [],
  education: [],
  githubConnected: false,
  githubRepos: [],
  targetRoles: [],
};

const initialCampfireRooms: CampfireRoom[] = [
  {
    id: 'room-zephyr-challenge',
    listingId: 'list-zephyr-challenge',
    listingTitle: 'HIPAA-Compliant Document Pipeline Challenge',
    companyName: 'Zephyr Health (Demo)',
    companyLogo: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=100&auto=format&fit=crop&q=80',
    isClosed: false,
    memberCount: 28,
    unreadCount: 0,
  },
  {
    id: 'room-apex-challenge',
    listingId: 'list-apex-challenge',
    listingTitle: 'Distributed Inventory Sync Challenge',
    companyName: 'Apex Commerce (Demo)',
    companyLogo: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=100&auto=format&fit=crop&q=80',
    isClosed: false,
    memberCount: 19,
    unreadCount: 0,
  },
  {
    id: 'room-kavach-senior-be',
    listingId: 'list-kavach-senior-be',
    listingTitle: 'Senior Backend Engineer (Go & Distributed Systems)',
    companyName: 'Kavach Systems (Demo)',
    companyLogo: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=100&auto=format&fit=crop&q=80',
    isClosed: false,
    memberCount: 14,
    unreadCount: 0,
  },
];

const HireRoomStoreContext = createContext<HireRoomStoreContextType | null>(null);

export function HireRoomProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User>({
    id: 'user-demo-candidate',
    email: 'candidate@hireroom.dev',
    name: 'Candidate User',
    role: 'candidate',
  });

  const [candidateProfile, setCandidateProfile] = useState<CandidateProfile>(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('hireroom_candidate_profile');
        if (stored) return JSON.parse(stored);
      } catch (e) {
        console.warn('Could not read candidate profile from storage', e);
      }
    }
    return emptyCandidateProfile;
  });

  const [companies, setCompanies] = useState<Company[]>(DEMO_COMPANIES);
  const [listings, setListings] = useState<Listing[]>(DEMO_LISTINGS);
  const [applications, setApplications] = useState<Application[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [campfireRooms, setCampfireRooms] = useState<CampfireRoom[]>(initialCampfireRooms);
  const [messages, setMessages] = useState<CampfireMessage[]>([]);

  // Update Candidate Profile with persistence
  const updateCandidateProfile = (updates: Partial<CandidateProfile>) => {
    setCandidateProfile(prev => {
      const updated = { ...prev, ...updates };
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('hireroom_candidate_profile', JSON.stringify(updated));
        } catch (e) {
          console.warn('Could not save candidate profile', e);
        }
      }
      return updated;
    });
  };

  // Switch role between Candidate, Company, and Admin
  const switchRole = (role: UserRole) => {
    if (role === 'company') {
      setCurrentUser({
        id: 'user-comp-kavach',
        email: 'founder@kavachsystems.example.com',
        name: 'Kavach Systems Team',
        role: 'company',
        companyId: 'comp-kavach',
      });
    } else if (role === 'admin') {
      setCurrentUser({
        id: 'user-admin',
        email: 'admin@hireroom.dev',
        name: 'HireRoom Operations',
        role: 'admin',
      });
    } else {
      setCurrentUser({
        id: 'user-demo-candidate',
        email: 'candidate@hireroom.dev',
        name: candidateProfile.name || 'Candidate User',
        role: 'candidate',
      });
    }
  };

  // Add a new company
  const addCompany = (newComp: Omit<Company, 'id' | 'createdDaysAgo'>): Company => {
    const comp: Company = {
      ...newComp,
      id: `comp-${Date.now()}`,
      createdDaysAgo: 0,
    };
    setCompanies(prev => [comp, ...prev]);
    return comp;
  };

  // Add a new listing
  const addListing = (
    newListing: Omit<Listing, 'id' | 'createdAt' | 'viewsCount' | 'applicantsCount'>
  ): Listing => {
    const listing: Listing = {
      ...newListing,
      id: `list-${Date.now()}`,
      createdAt: new Date().toISOString(),
      viewsCount: 1,
      applicantsCount: 0,
    };
    setListings(prev => [listing, ...prev]);

    // Create Campfire room automatically for the listing (Rule 5 / Prompt R5)
    const newRoom: CampfireRoom = {
      id: `room-${listing.id}`,
      listingId: listing.id,
      listingTitle: listing.title,
      companyName: listing.companyName,
      companyLogo: listing.companyLogo,
      isClosed: false,
      memberCount: 1,
      unreadCount: 0,
    };
    setCampfireRooms(prev => [newRoom, ...prev]);

    return listing;
  };

  // Update an existing listing
  const updateListing = (id: string, updates: Partial<Listing>) => {
    setListings(prev => prev.map(l => (l.id === id ? { ...l, ...updates } : l)));
  };

  // Apply to a listing
  const applyToListing = (
    listingId: string,
    screeningAnswers?: Record<string, string>
  ): Application => {
    const listing = listings.find(l => l.id === listingId);

    const newApp: Application = {
      id: `app-${Date.now()}`,
      listingId,
      candidateId: candidateProfile.userId || currentUser.id,
      candidateName: candidateProfile.name || 'Candidate',
      candidateHeadline: candidateProfile.headline || 'Software Engineer',
      candidateLocation: candidateProfile.location || 'India',
      candidateSkills: candidateProfile.skills || [],
      candidateAvatar: candidateProfile.avatarUrl,
      status: 'new',
      screeningAnswers,
      appliedAt: new Date().toISOString(),
      aiMatch: 'strong',
      totalScore: 85,
    };

    setApplications(prev => [newApp, ...prev]);

    // Increment applicant count on listing
    setListings(prev =>
      prev.map(l => (l.id === listingId ? { ...l, applicantsCount: l.applicantsCount + 1 } : l))
    );

    return newApp;
  };

  // Update application status (Shortlist, Hire, Reject)
  const updateApplicationStatus = (id: string, status: Application['status']) => {
    setApplications(prev => prev.map(a => (a.id === id ? { ...a, status } : a)));
  };

  // Submit challenge assignment
  const addSubmission = (
    sub: Omit<Submission, 'id' | 'submittedAt' | 'totalScore'>
  ): Submission => {
    const newSub: Submission = {
      ...sub,
      id: `sub-${Date.now()}`,
      submittedAt: new Date().toISOString(),
      totalScore: 0,
    };
    setSubmissions(prev => [newSub, ...prev]);
    return newSub;
  };

  // Send Campfire Message
  const sendMessage = (roomId: string, body: string, isPinned = false) => {
    const room = campfireRooms.find(r => r.id === roomId);
    if (!room) return;

    const newMsg: CampfireMessage = {
      id: `msg-${Date.now()}`,
      roomId,
      listingId: room.listingId,
      userId: currentUser.id,
      userName: currentUser.name,
      userRole: currentUser.role,
      isHost: currentUser.role === 'company',
      avatar: currentUser.avatar,
      body,
      isPinned,
      createdAt: new Date().toISOString(),
    };

    setMessages(prev => [...prev, newMsg]);
  };

  // Calculate live Candidate Stats
  const userApplications = applications.filter(
    a => a.candidateId === (candidateProfile.userId || currentUser.id)
  );

  const candidateStats = {
    totalApplications: userApplications.length,
    inReview: userApplications.filter(a => a.status === 'new' || a.status === 'assignment_pending').length,
    shortlisted: userApplications.filter(a => a.status === 'shortlisted').length,
    accepted: userApplications.filter(a => a.status === 'hired').length,
  };

  return (
    <HireRoomStoreContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        switchRole,
        candidateProfile,
        updateCandidateProfile,
        companies,
        addCompany,
        listings,
        addListing,
        updateListing,
        applications,
        applyToListing,
        updateApplicationStatus,
        submissions,
        addSubmission,
        campfireRooms,
        messages,
        sendMessage,
        candidateStats,
      }}
    >
      {children}
    </HireRoomStoreContext.Provider>
  );
}

export function useHireRoomStore() {
  const context = useContext(HireRoomStoreContext);
  if (!context) {
    throw new Error('useHireRoomStore must be used within a HireRoomProvider');
  }
  return context;
}
