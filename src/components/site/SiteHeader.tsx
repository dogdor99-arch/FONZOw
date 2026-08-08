import React, { useState } from 'react';
import { Link } from 'wouter';
import ProductList from './ProductList';

const SiteHeader: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white">
      <nav className="flex items-center justify-between px-4 py-3">
        {/* Logo */}
        <Link href="/" className="text-lg font-bold">
          Fonzo Guitar
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex gap-x-6 text-sm font-medium">
          <Link href="/" className="text-gray-600 hover:text-black">หน้าแรก</Link>
          <Link href="/guitars" className="text-gray-600 hover:text-black">กีตาร์ทั้งหมด</Link>
          <Link href="/accessories" className="text-gray-600 hover:text-black">อุปกรณ์เสริม</Link>
          <Link href="/shop" className="text-gray-600 hover:text-black">ร้านค้า/ช็อป</Link>
          <Link href="/dealers" className="text-gray-600 hover:text-black">ตัวแทนจำหน่าย</Link>
          <Link href="/brand-story" className="text-gray-600 hover:text-black">เรื่องราวแบรนด์</Link>
          <Link href="/contact" className="text-gray-600 hover:text-black">ติดต่อเรา</Link>
        </div>

        {/* Mobile Toggle Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden p-2 rounded-md hover:bg-gray-100 text-gray-700"
          aria-label="Toggle Menu"
        >
          {isOpen ? (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>

        {/* Product List */}
        <ProductList />
      </nav>

      {/* Mobile Drawer */}
      {isOpen && (
        <nav className="fixed inset-x-0 top-[57px] bottom-0 bg-white z-50 md:hidden overflow-y-auto border-t">
          <ul className="flex flex-col p-4 space-y-1 text-base font-medium">
            <li>
              <Link href="/" onClick={() => setIsOpen(false)} className="block px-4 py-3 rounded-lg hover:bg-gray-100 border-b border-gray-100">
                หน้าแรก
              </Link>
            </li>
            <li>
              <Link href="/guitars" onClick={() => setIsOpen(false)} className="block px-4 py-3 rounded-lg hover:bg-gray-100 border-b border-gray-100">
                กีตาร์ทั้งหมด
              </Link>
            </li>
            <li>
              <Link href="/accessories" onClick={() => setIsOpen(false)} className="block px-4 py-3 rounded-lg hover:bg-gray-100 border-b border-gray-100">
                อุปกรณ์เสริม
              </Link>
            </li>
            <li>
              <Link href="/shop" onClick={() => setIsOpen(false)} className="block px-4 py-3 rounded-lg hover:bg-gray-100 border-b border-gray-100">
                ร้านค้า/ช็อป
              </Link>
            </li>
            <li>
              <Link href="/dealers" onClick={() => setIsOpen(false)} className="block px-4 py-3 rounded-lg hover:bg-gray-100 border-b border-gray-100">
                ตัวแทนจำหน่าย
              </Link>
            </li>
            <li>
              <Link href="/brand-story" onClick={() => setIsOpen(false)} className="block px-4 py-3 rounded-lg hover:bg-gray-100 border-b border-gray-100">
                เรื่องราวแบรนด์
              </Link>
            </li>
            <li>
              <Link href="/contact" onClick={() => setIsOpen(false)} className="block px-4 py-3 rounded-lg hover:bg-gray-100 border-b border-gray-100">
                ติดต่อเรา
              </Link>
            </li>
          </ul>
        </nav>
      )}
    </header>
  );
};

export default SiteHeader;