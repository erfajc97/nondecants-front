import AppProviders from '@/app/providers/AppProviders';
import { useProfileHook } from './hooks/useProfileHook';
import ProfileSidebar from './components/ProfileSidebar';
import OrdersTab from './components/OrdersTab';
import ProfileTab from './components/ProfileTab';
import AddressesTab from './components/AddressesTab';

const TAB_CONTENT = {
  perfil: ProfileTab,
  direcciones: AddressesTab,
  pedidos: OrdersTab,
} as const;

function ProfileContent() {
  const { activeTab, setActiveTab, user } = useProfileHook();
  const ActiveComponent = TAB_CONTENT[activeTab];

  return (
    <div className="min-h-screen bg-bg">
      {/* Header */}
      <div className="border-b border-border">
        <div className="mx-auto max-w-[1480px] px-[max(16px,3.4vw)] py-8">
          <span className="eyebrow k">Mi cuenta</span>
          <h1 className="mt-1.5 font-display text-[clamp(32px,4vw,56px)] font-normal leading-none tracking-[-0.02em] text-text">
            {user?.name ?? 'Hola'}
          </h1>
        </div>
      </div>

      {/* Layout: sidebar + content */}
      <div className="mx-auto max-w-[1480px] px-[max(16px,3.4vw)] py-10">
        <div className="flex flex-col gap-10 md:flex-row md:gap-14">
          {/* Sidebar */}
          <aside className="md:w-56 shrink-0">
            <ProfileSidebar activeTab={activeTab} onTabChange={setActiveTab} />
          </aside>

          {/* Content */}
          <main className="flex-1 min-w-0">
            <ActiveComponent />
          </main>
        </div>
      </div>
    </div>
  );
}

export default function Profile() {
  return (
    <AppProviders>
      <ProfileContent />
    </AppProviders>
  );
}
