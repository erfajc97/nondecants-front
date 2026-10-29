import { PROFILE_TABS } from '../data';
import type { ProfileTabId } from '../types';

interface ProfileSidebarProps {
  activeTab: ProfileTabId;
  onTabChange: (tab: ProfileTabId) => void;
}

const TAB_ICONS: Record<ProfileTabId, React.ReactNode> = {
  perfil: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
      <circle cx="12" cy="7" r="4"/>
    </svg>
  ),
  pedidos: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
      <line x1="3" y1="6" x2="21" y2="6"/>
      <path d="M16 10a4 4 0 0 1-8 0"/>
    </svg>
  ),
  direcciones: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
      <circle cx="12" cy="10" r="3"/>
    </svg>
  ),
};

export default function ProfileSidebar({ activeTab, onTabChange }: ProfileSidebarProps) {
  return (
    <nav className="flex md:flex-col gap-1 overflow-x-auto md:overflow-visible pb-2 md:pb-0">
      {PROFILE_TABS.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={[
              'flex items-center gap-2.5 whitespace-nowrap rounded-[3px] border-l-2 px-4 py-3 font-body text-sm font-medium transition-colors',
              isActive
                ? 'border-accent bg-gold-light text-text'
                : 'border-transparent text-text-soft hover:text-text',
            ].join(' ')}
          >
            {TAB_ICONS[tab.id]}
            {tab.label}
          </button>
        );
      })}
    </nav>
  );
}
