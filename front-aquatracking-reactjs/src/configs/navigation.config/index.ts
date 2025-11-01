import {
    NAV_ITEM_TYPE_TITLE,
    NAV_ITEM_TYPE_ITEM,
    NAV_ITEM_TYPE_COLLAPSE,
} from '@/constants/navigation.constant'

import type { NavigationTree } from '@/@types/navigation'

const navigationConfig: NavigationTree[] = [
    // ========================================
    // 👤 NAVEGACIÓN DE USUARIO
    // ========================================
    {
        key: 'user.dashboard',
        path: '/user/dashboard',
        title: 'Mi Dashboard',
        translateKey: 'nav.user.dashboard',
        icon: 'dashboard',
        type: NAV_ITEM_TYPE_ITEM,
        authority: ['user'],
        subMenu: [],
    },
    {
        key: 'user.section',
        path: '',
        title: 'Mi Consumo',
        translateKey: 'nav.user.section',
        icon: 'consumption',
        type: NAV_ITEM_TYPE_TITLE,
        authority: ['user'],
        subMenu: [
            {
                key: 'user.consumption',
                path: '/user/consumption',
                title: 'Historial de Consumo',
                translateKey: 'nav.user.consumption',
                icon: 'consumption',
                type: NAV_ITEM_TYPE_ITEM,
                authority: ['user'],
                subMenu: [],
            },
            {
                key: 'user.sensors',
                path: '/user/sensors',
                title: 'Mis Sensores',
                translateKey: 'nav.user.sensors',
                icon: 'sensors',
                type: NAV_ITEM_TYPE_ITEM,
                authority: ['user'],
                subMenu: [],
            },
            {
                key: 'user.alerts',
                path: '/user/alerts',
                title: 'Mis Alertas',
                translateKey: 'nav.user.alerts',
                icon: 'alerts',
                type: NAV_ITEM_TYPE_ITEM,
                authority: ['user'],
                subMenu: [],
            },
        ],
    },

    // ========================================
    // 🔧 NAVEGACIÓN DE ADMINISTRADOR
    // ========================================
    {
        key: 'admin.dashboard',
        path: '/admin/dashboard',
        title: 'Dashboard General',
        translateKey: 'nav.admin.dashboard',
        icon: 'dashboard',
        type: NAV_ITEM_TYPE_ITEM,
        authority: ['admin'],
        subMenu: [],
    },
    {
        key: 'admin.management',
        path: '',
        title: 'Gestión del Sistema',
        translateKey: 'nav.admin.management',
        icon: 'statistics',
        type: NAV_ITEM_TYPE_TITLE,
        authority: ['admin'],
        subMenu: [
            {
                key: 'admin.users',
                path: '/admin/users',
                title: 'Usuarios',
                translateKey: 'nav.admin.users',
                icon: 'users',
                type: NAV_ITEM_TYPE_ITEM,
                authority: ['admin'],
                subMenu: [],
            },
            {
                key: 'admin.homes',
                path: '/admin/homes',
                title: 'Hogares',
                translateKey: 'nav.admin.homes',
                icon: 'homes',
                type: NAV_ITEM_TYPE_ITEM,
                authority: ['admin'],
                subMenu: [],
            },
            {
                key: 'admin.sensors',
                path: '/admin/sensors',
                title: 'Sensores',
                translateKey: 'nav.admin.sensors',
                icon: 'sensors',
                type: NAV_ITEM_TYPE_ITEM,
                authority: ['admin'],
                subMenu: [],
            },
            {
                key: 'admin.sectors',
                path: '/admin/sectors',
                title: 'Sectores',
                translateKey: 'nav.admin.sectors',
                icon: 'statistics',
                type: NAV_ITEM_TYPE_ITEM,
                authority: ['admin'],
                subMenu: [],
            },
        ],
    },
    {
        key: 'admin.monitoring',
        path: '',
        title: 'Monitoreo',
        translateKey: 'nav.admin.monitoring',
        icon: 'alerts',
        type: NAV_ITEM_TYPE_TITLE,
        authority: ['admin'],
        subMenu: [
            {
                key: 'admin.alerts',
                path: '/admin/alerts',
                title: 'Alertas',
                translateKey: 'nav.admin.alerts',
                icon: 'alerts',
                type: NAV_ITEM_TYPE_ITEM,
                authority: ['admin'],
                subMenu: [],
            },
            {
                key: 'admin.statistics',
                path: '/admin/statistics',
                title: 'Estadísticas',
                translateKey: 'nav.admin.statistics',
                icon: 'dashboard',
                type: NAV_ITEM_TYPE_ITEM,
                authority: ['admin'],
                subMenu: [],
            },
        ],
    },

    // ========================================
    // ⚙️ CONFIGURACIÓN (COMPARTIDA)
    // ========================================
    {
        key: 'settings',
        path: '/settings',
        title: 'Configuración',
        translateKey: 'nav.settings',
        icon: 'settings',
        type: NAV_ITEM_TYPE_ITEM,
        authority: ['admin', 'user'],
        subMenu: [],
    },
]

export default navigationConfig
