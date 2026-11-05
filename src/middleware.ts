import { NextResponse, type NextRequest } from 'next/server';
import { getAuthUser } from './lib/supabase/middleware';

export async function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const fullPath = `${pathname}${search}`;
  const response = NextResponse.next();

  // 0. API routes have their own route-level auth / secrets (CRON_SECRET, webhook HMAC, getUser)
  if (pathname.startsWith('/api')) {
    return response;
  }

  const user = await getAuthUser(request, response);

  // Helper redirect functions
  const redirectToLogin = () => {
    const loginUrl = new URL('/login', request.url);
    if (pathname !== '/' && pathname !== '/login' && pathname !== '/signup' && pathname !== '/unsubscribe') {
      loginUrl.searchParams.set('next', fullPath);
    }
    return NextResponse.redirect(loginUrl);
  };

  const redirectToOnboarding = (role?: string) => {
    const targetRole = role || user?.role || 'candidate';
    const targetPath = targetRole === 'company' ? '/onboarding/company' : '/onboarding/candidate';
    return NextResponse.redirect(new URL(targetPath, request.url));
  };

  const redirectToDashboard = () => {
    if (user?.isAdmin && pathname.startsWith('/admin')) {
      return response;
    }
    if (user?.role === 'company') {
      return NextResponse.redirect(new URL('/company/dashboard', request.url));
    }
    return NextResponse.redirect(new URL('/dashboard', request.url));
  };

  // 1. PUBLIC LANDING & AUTH & PREFERENCE PAGES: /, /login, /signup, /unsubscribe
  const isAuthOrLanding =
    pathname === '/' || pathname === '/login' || pathname === '/signup' || pathname === '/unsubscribe';
  if (isAuthOrLanding) {
    if (!user) {
      return response; // Allowed for logged out
    }
    if (pathname === '/unsubscribe') {
      return response; // Allowed for signed-in users too
    }
    if (!user.onboardingCompleted) {
      return redirectToOnboarding(user.role);
    }
    // Signed in and onboarded -> redirect to dashboard
    return redirectToDashboard();
  }

  // 2. BROWSE ROLES, CHALLENGES, COMPANIES (Read-only for public)
  const isBrowsePage =
    pathname.startsWith('/roles') ||
    pathname.startsWith('/challenges') ||
    pathname.startsWith('/companies');

  // Note: /challenges/[id]/build and /challenges/[id]/assignment are challenge participation, not read-only browse
  const isChallengeAction =
    pathname.includes('/build') || pathname.includes('/assignment');

  if (isBrowsePage && !isChallengeAction) {
    if (!user) {
      return response; // Allowed for logged out (read-only)
    }
    if (!user.onboardingCompleted) {
      return redirectToOnboarding(user.role);
    }
    return response; // Allowed for signed in and onboarded
  }

  // 3. ONBOARDING PAGES: /onboarding/*
  const isOnboardingPage = pathname.startsWith('/onboarding');
  if (isOnboardingPage) {
    if (!user) {
      return redirectToLogin();
    }
    if (user.onboardingCompleted) {
      return redirectToDashboard();
    }
    // User signed in and onboarding not done: allowed only for user's own role flow
    if (user.role === 'candidate' && !pathname.startsWith('/onboarding/candidate')) {
      return NextResponse.redirect(new URL('/onboarding/candidate', request.url));
    }
    if (user.role === 'company' && !pathname.startsWith('/onboarding/company')) {
      return NextResponse.redirect(new URL('/onboarding/company', request.url));
    }
    return response;
  }

  // 4. ADMIN PAGES: /admin/*
  const isAdminPage = pathname.startsWith('/admin');
  if (isAdminPage) {
    if (!user) {
      return redirectToLogin();
    }
    if (!user.onboardingCompleted) {
      return redirectToOnboarding(user.role);
    }
    if (!user.isAdmin) {
      return redirectToDashboard(); // Non-admin cannot access admin area
    }
    return response;
  }

  // 5. COMPANY PAGES: /company/*
  const isCompanyPage = pathname.startsWith('/company');
  if (isCompanyPage) {
    if (!user) {
      return redirectToLogin();
    }
    if (!user.onboardingCompleted) {
      return redirectToOnboarding(user.role);
    }
    if (user.role !== 'company' && !user.isAdmin) {
      return NextResponse.redirect(new URL('/dashboard', request.url)); // Candidate cannot access company area
    }
    return response;
  }

  // 6. PROTECTED CANDIDATE / APP PAGES: /dashboard, /campfire, /profile, challenge submissions
  // If we reach here, it's a protected route (dashboard, campfire, assignments, etc.)
  if (!user) {
    return redirectToLogin();
  }
  if (!user.onboardingCompleted) {
    return redirectToOnboarding(user.role);
  }

  // If company visits /dashboard, redirect to /company/dashboard
  if (pathname === '/dashboard' && user.role === 'company') {
    return NextResponse.redirect(new URL('/company/dashboard', request.url));
  }

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|pdf|docx)$).*)',
  ],
};
