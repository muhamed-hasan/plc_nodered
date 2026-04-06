"use client";
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navigation() {
  const pathname = usePathname();

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        plcVision.
      </div>
      <nav className="nav-menu">
        <Link 
          href="/" 
          className={`nav-link ${pathname === '/' ? 'active' : ''}`}
        >
          Dashboard
        </Link>
        <Link 
          href="/rules" 
          className={`nav-link ${pathname?.startsWith('/rules') ? 'active' : ''}`}
        >
          Rules Engine
        </Link>
        <Link 
          href="/settings" 
          className={`nav-link ${pathname?.startsWith('/settings') ? 'active' : ''}`}
        >
          Hardware Settings
        </Link>
      </nav>
    </aside>
  );
}
