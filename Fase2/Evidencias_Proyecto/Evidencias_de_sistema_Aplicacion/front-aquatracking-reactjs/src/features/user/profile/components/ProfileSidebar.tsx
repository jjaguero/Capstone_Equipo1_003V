import { Card } from '@/components/ui'
import {
  PiUserDuotone,
  PiLockKeyDuotone,
  PiDropDuotone,
} from 'react-icons/pi'
import { ProfileTab } from '../hooks/useProfileTabs'

interface ProfileSidebarProps {
  activeTab: ProfileTab
  onTabChange: (tab: ProfileTab) => void
}

export const ProfileSidebar = ({ activeTab, onTabChange }: ProfileSidebarProps) => {
  const tabs = [
    { id: 'profile' as ProfileTab, icon: PiUserDuotone, label: 'Perfil' },
    { id: 'security' as ProfileTab, icon: PiLockKeyDuotone, label: 'Seguridad' },
    { id: 'consumption' as ProfileTab, icon: PiDropDuotone, label: 'Consumo' },
  ]

  return (
    <Card className="bg-white/80 shadow-lg backdrop-blur-sm transition-all duration-300 hover:shadow-xl">
      <div className="flex flex-col gap-2 p-2">
        {tabs.map(({ id, icon: Icon, label }) => (
          <button
            key={id}
            onClick={() => onTabChange(id)}
            className={`flex items-center gap-3 rounded-lg px-4 py-3 transition-all duration-200 ${
              activeTab === id
                ? 'bg-indigo-50 text-indigo-600 shadow-sm dark:bg-indigo-900/20 dark:text-indigo-400'
                : 'text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800'
            }`}
          >
            <Icon className="text-xl" />
            <span className="font-medium">{label}</span>
          </button>
        ))}
      </div>
    </Card>
  )
}
