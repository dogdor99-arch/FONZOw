import React, { useState } from 'react';
import { Menu, X } from 'lucide-react';

export const SiteHeader: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <a href="/" className="flex items-center gap-2 font-bold text-xl">
          <span>Fonzo Guitar</span>
        </a>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex gap-6 text-sm font-medium">
          <a href="/" className="transition-colors hover:text-primary">หน้าแรก</a>
          <a href="/guitars" className="transition-colors hover:text-primary">กีตาร์ทั้งหมด</a>
          <a href="/about" className="transition-colors hover:text-primary">เกี่ยวกับเรา</a>
          <a href="/contact" className="transition-colors hover:text-primary">ติดต่อเรา</a>
        </nav>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden p-2 rounded-md hover:bg-accent text-foreground"
          aria-label="Toggle Menu"
        >
          {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Navigation Drawer (Full Height Fix) */}
      {isOpen && (
        <div className="fixed inset-0 top-16 z-50 bg-background/98 backdrop-blur md:hidden flex flex-col p-6 h-[calc(100vh-4rem)] overflow-y-auto">
          <nav className="flex flex-col gap-4 text-lg font-medium">
            <a 
              href="/" 
              onClick={() => setIsOpen(false)}
              className="py-2 border-b border-border/50 hover:text-primary transition-colors"
            >
              หน้าแรก
            </a>
            <a 
              href="/guitars" 
              onClick={() => setIsOpen(false)}
              className="py-2 border-b border-border/50 hover:text-primary transition-colors"
            >
              กีตาร์ทั้งหมด
            </a>
            <a 
              href="/about" 
              onClick={() => setIsOpen(false)}
              className="py-2 border-b border-border/50 hover:text-primary transition-colors"
            >
              เกี่ยวกับเรา
            </a>
            <a 
              href="/contact" 
              onClick={() => setIsOpen(false)}
              className="py-2 border-b border-border/50 hover:text-primary transition-colors"
            >
              ติดต่อเรา
            </a>
          </nav>
        </div>
      )}
    </header>
  );
};

export default SiteHeader;