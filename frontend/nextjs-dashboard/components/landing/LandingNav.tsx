'use client';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Shield, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function LandingNav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        scrolled
          ? 'bg-white/95 backdrop-blur-md shadow-sm border-b border-slate-100'
          : 'bg-transparent'
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-slate-900 text-lg">CookieConsent</span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-8">
            <Link href="#features" className="text-sm text-slate-600 hover:text-slate-900 transition-colors">
              Features
            </Link>
            <Link href="#how-it-works" className="text-sm text-slate-600 hover:text-slate-900 transition-colors">
              How it works
            </Link>
            <Link href="#pricing" className="text-sm text-slate-600 hover:text-slate-900 transition-colors">
              Pricing
            </Link>
            <Link href="#faq" className="text-sm text-slate-600 hover:text-slate-900 transition-colors">
              FAQ
            </Link>
          </nav>

          {/* Desktop CTAs */}
          <div className="hidden md:flex items-center gap-3">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/login">Log in</Link>
            </Button>
            <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white" asChild>
              <Link href="/register">Start Free</Link>
            </Button>
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-slate-100 transition-colors"
            onClick={() => setOpen(!open)}
            aria-label="Toggle menu"
          >
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile menu */}
        {open && (
          <div className="md:hidden bg-white border-t border-slate-100 py-4 space-y-3">
            {['#features', '#how-it-works', '#pricing', '#faq'].map((href) => (
              <Link
                key={href}
                href={href}
                className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 rounded-lg"
                onClick={() => setOpen(false)}
              >
                {href.replace('#', '').replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
              </Link>
            ))}
            <div className="flex flex-col gap-2 px-4 pt-2 border-t border-slate-100">
              <Button variant="outline" asChild className="w-full">
                <Link href="/login">Log in</Link>
              </Button>
              <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white" asChild>
                <Link href="/register">Start Free</Link>
              </Button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
