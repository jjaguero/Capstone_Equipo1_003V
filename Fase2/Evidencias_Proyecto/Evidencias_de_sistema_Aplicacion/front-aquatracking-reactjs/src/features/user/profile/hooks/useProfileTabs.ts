import { useState } from 'react'

export type ProfileTab = 'profile' | 'security' | 'consumption'

export const useProfileTabs = (initialTab: ProfileTab = 'profile') => {
  const [activeTab, setActiveTab] = useState<ProfileTab>(initialTab)

  return {
    activeTab,
    setActiveTab,
    isProfile: activeTab === 'profile',
    isSecurity: activeTab === 'security',
    isConsumption: activeTab === 'consumption',
  }
}
