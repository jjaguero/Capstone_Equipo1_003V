import { Link, useLocation } from 'react-router'
import { PiCaretRightDuotone, PiHouseDuotone } from 'react-icons/pi'

interface BreadcrumbItem {
  label: string
  path?: string
}

const routeLabels: Record<string, string> = {
  'user': 'Usuario',
  'admin': 'Administrador',
  'dashboard': 'Dashboard',
  'realtime': 'Tiempo Real',
  'consumption-history': 'Historial de Consumo',
  'consumption': 'Consumo',
  'sensors': 'Sensores',
  'alerts': 'Alertas',
  'settings': 'Configuración',
  'profile': 'Perfil',
  'homes': 'Hogares',
  'users': 'Usuarios',
  'statistics': 'Estadísticas',
  'sectors': 'Sectores',
}

const Breadcrumb = () => {
  const location = useLocation()
  const pathnames = location.pathname.split('/').filter((x) => x)

  const breadcrumbs: BreadcrumbItem[] = [
    { label: 'Inicio', path: '/' }
  ]

  let currentPath = ''
  pathnames.forEach((segment, index) => {
    currentPath += `/${segment}`
    
    if (!segment.match(/^[0-9a-f]{24}$/i)) {
      breadcrumbs.push({
        label: routeLabels[segment] || segment.charAt(0).toUpperCase() + segment.slice(1),
        path: index === pathnames.length - 1 ? undefined : currentPath
      })
    }
  })

  if (breadcrumbs.length <= 2) {
    return null
  }

  return (
    <nav className="flex items-center space-x-2 text-sm mb-6 animate-fadeIn">
      {breadcrumbs.map((crumb, index) => (
        <div key={index} className="flex items-center">
          {index > 0 && (
            <PiCaretRightDuotone className="w-4 h-4 text-gray-400 mx-2" />
          )}
          {crumb.path ? (
            <Link
              to={crumb.path}
              className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center gap-1"
            >
              {index === 0 && <PiHouseDuotone className="w-4 h-4" />}
              {crumb.label}
            </Link>
          ) : (
            <span className="text-gray-900 dark:text-gray-100 font-medium flex items-center gap-1">
              {index === 0 && <PiHouseDuotone className="w-4 h-4" />}
              {crumb.label}
            </span>
          )}
        </div>
      ))}
    </nav>
  )
}

export default Breadcrumb
