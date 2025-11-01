import { lazy } from 'react';
import type { Routes } from '@/@types/routes';

const aquaTrackingRoutes: Routes = [
  // ========================================
  // 👤 RUTAS DE USUARIO (USER)
  // ========================================
  
  // Dashboard Principal del Usuario
  {
    key: 'user.dashboard',
    path: '/user/dashboard',
    component: lazy(() => import('@/features/user/dashboard/pages/UserDashboardPage')),
    authority: ['user'],
  },

  // Consumo
  {
    key: 'user.consumption',
    path: '/user/consumption',
    component: lazy(() => import('@/features/user/consumption-history/pages/ConsumptionHistoryPage')),
    authority: ['user'],
  },

  // Sensores
  {
    key: 'user.sensors',
    path: '/user/sensors',
    component: lazy(() => import('@/features/user/sensors/pages/SensorsPage')),
    authority: ['user'],
  },
  {
    key: 'user.sensors.detail',
    path: '/user/sensors/:sensorId',
    component: lazy(() => import('@/features/user/sensors/pages/SensorDetailPage')),
    authority: ['user'],
  },

  // Alertas
  {
    key: 'user.alerts',
    path: '/user/alerts',
    component: lazy(() => import('@/features/user/alerts/pages/UserAlertsPage')),
    authority: ['user'],
  },

  // ========================================
  // 🔧 RUTAS DE ADMINISTRADOR (ADMIN)
  // ========================================

  // Dashboard Principal del Admin
  {
    key: 'admin.dashboard',
    path: '/admin/dashboard',
    component: lazy(() => import('@/features/admin/consumption/pages/ConsumptionPage')),
    authority: ['admin'],
  },

  // Gestión de Usuarios
  {
    key: 'admin.users.list',
    path: '/admin/users',
    component: lazy(() => import('@/features/admin/users/pages/UsersManagementPage')),
    authority: ['admin'],
  },
  {
    key: 'admin.users.add',
    path: '/admin/users/add',
    component: lazy(() => import('@/features/admin/users/pages/AddUserPage')),
    authority: ['admin'],
  },

  // Gestión de Hogares
  {
    key: 'admin.homes.list',
    path: '/admin/homes',
    component: lazy(() => import('@/features/admin/homes/pages/HomesManagementPage')),
    authority: ['admin'],
  },
  {
    key: 'admin.homes.add',
    path: '/admin/homes/add',
    component: lazy(() => import('@/features/admin/homes/pages/AddHomePage')),
    authority: ['admin'],
  },

  // Gestión de Sensores
  {
    key: 'admin.sensors.list',
    path: '/admin/sensors',
    component: lazy(() => import('@/features/user/sensors/pages/SensorsManagementPage')),
    authority: ['admin'],
  },

  // Gestión de Alertas
  {
    key: 'admin.alerts.list',
    path: '/admin/alerts',
    component: lazy(() => import('@/features/admin/alerts/pages/AlertsPage')),
    authority: ['admin'],
  },

  // Gestión de Sectores
  {
    key: 'admin.sectors.list',
    path: '/admin/sectors',
    component: lazy(() => import('@/features/admin/sectors/pages/SectorsPage')),
    authority: ['admin'],
  },

  // Estadísticas
  {
    key: 'admin.statistics',
    path: '/admin/statistics',
    component: lazy(() => import('@/features/admin/statistics/pages/StatisticsPage')),
    authority: ['admin'],
  },


  {
    key: 'settings.profile',
    path: '/settings',
    component: lazy(() => import('@/features/user/profile/pages/UserProfilePage')),
    authority: ['user', 'admin'],
  },
];

export default aquaTrackingRoutes;
