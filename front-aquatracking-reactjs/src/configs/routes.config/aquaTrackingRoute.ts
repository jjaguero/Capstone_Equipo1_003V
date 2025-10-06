import { lazy } from 'react';
import type { Routes } from '@/@types/routes';

const aquaTrackingRoutes: Routes = [
  {
    key: 'aquatracking.userOverview',
    path: '/user/overview',
    component: lazy(() => import('@/features/user-dashboard/pages/UserDashboardPage')),
    authority: [],
  },
  {
    key: 'aquatracking.userSensors',
    path: '/user/sensors',
    component: lazy(() => import('@/features/sensors/pages/SensorsPage')),
    authority: [],
  },
  {
    key: 'aquatracking.userAlerts',
    path: '/user/alerts',
    component: lazy(() => import('@/features/user-alerts/pages/UserAlertsPage')),
    authority: [],
  },
  {
    key: 'aquatracking.userConsumptionHistory',
    path: '/user/consumption',
    component: lazy(() => import('@/features/consumption-history/pages/ConsumptionHistoryPage')),
    authority: [],
  },
  {
    key: 'aquatracking.sensorDetail',
    path: '/user/sensors/:sensorId',
    component: lazy(() => import('@/features/sensors/pages/SensorDetailPage')),
    authority: [],
  },
  {
    key: 'aquatracking.adminOverview',
    path: '/admin/overview',
    component: lazy(() => import('@/features/consumption/pages/ConsumptionPage')),
    authority: [],
  },
  {
    key: 'aquatracking.adminUsers',
    path: '/admin/users',
    component: lazy(() => import('@/features/users/pages/UsersManagementPage')),
    authority: [],
  },
  {
    key: 'aquatracking.adminAddUser',
    path: '/admin/users/add',
    component: lazy(() => import('@/features/users/pages/AddUserPage')),
    authority: [],
  },
  {
    key: 'aquatracking.adminHomes',
    path: '/admin/homes',
    component: lazy(() => import('@/features/homes/pages/HomesManagementPage')),
    authority: [],
  },
  {
    key: 'aquatracking.adminAddHome',
    path: '/admin/homes/add',
    component: lazy(() => import('@/features/homes/pages/AddHomePage')),
    authority: [],
  },
  {
    key: 'aquatracking.adminSensors',
    path: '/admin/sensors',
    component: lazy(() => import('@/features/sensors/pages/SensorsManagementPage')),
    authority: [],
  },
  {
    key: 'aquatracking.adminConsumption',
    path: '/admin/consumption',
    component: lazy(() => import('@/features/consumption/pages/ConsumptionPage')),
    authority: [],
  },
  {
    key: 'aquatracking.adminAlerts',
    path: '/admin/alerts',
    component: lazy(() => import('@/features/alerts/pages/AlertsPage')),
    authority: [],
  },
  {
    key: 'aquatracking.adminSectors',
    path: '/admin/sectors',
    component: lazy(() => import('@/features/sectors/pages/SectorsPage')),
    authority: [],
  },
  {
    key: 'aquatracking.adminStatistics',
    path: '/admin/statistics',
    component: lazy(() => import('@/features/statistics/pages/StatisticsPage')),
    authority: [],
  },
  {
    key: 'aquatracking.settings',
    path: '/settings',
    component: lazy(() => import('@/features/user-profile/pages/UserProfilePage')),
    authority: [],
  },
];

export default aquaTrackingRoutes;
