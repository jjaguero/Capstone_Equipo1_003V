# 📊 Dashboard Administrativo - AquaTracking

## Descripción

Dashboard de control administrativo profesional diseñado específicamente para el rol de **administrador**. Este dashboard proporciona una vista general del sistema con métricas clave, alertas críticas y acceso rápido a las funciones administrativas más importantes.

## 🎯 Propósito

El dashboard administrativo está enfocado en **gestión y control del sistema**, no en análisis detallado de consumo (eso es para usuarios). El administrador necesita:

- ✅ Ver el estado general del sistema de un vistazo
- ✅ Identificar problemas críticos rápidamente
- ✅ Acceder a las funciones de gestión más comunes
- ✅ Monitorear la actividad reciente del sistema

## 📋 Componentes del Dashboard

### 1. **KPI Cards** (Métricas Principales)

Cuatro tarjetas con indicadores clave:

#### 🔹 Usuarios
- Total de usuarios en el sistema
- Usuarios activos (con rol 'user')
- Acceso directo a gestión de usuarios
- Color: Azul

#### 🔹 Hogares
- Total de hogares registrados
- Hogares activos
- Acceso directo a gestión de hogares
- Color: Verde

#### 🔹 Sensores
- Total de sensores instalados
- Sensores online (status 'active')
- Acceso directo a gestión de sensores
- Color: Púrpura

#### 🔹 Alertas
- Total de alertas activas (no resueltas)
- Alertas críticas pendientes
- Cambio de color según criticidad (rojo/verde)
- Acceso directo a gestión de alertas
- Color: Rojo (con alertas) / Verde (sin alertas)

### 2. **Alertas Críticas** (2/3 del ancho)

Panel dedicado a mostrar las **5 alertas más críticas**:

- ✅ Ordenadas por fecha (más recientes primero)
- ✅ Muestra mensaje descriptivo
- ✅ Tiempo transcurrido ("Hace 2h", "Hace 1d")
- ✅ Botón de acción rápida "Ver"
- ✅ Estado visual según criticidad

**Estado sin alertas:**
- Icono de check verde
- Mensaje "No hay alertas críticas"
- Indicador positivo

### 3. **Actividad Reciente** (1/3 del ancho)

Timeline de actividades del sistema:

#### Tipos de actividad:
- 👤 **Nuevos usuarios registrados**
  - Muestra nombre y email
  - Icono azul
  
- 🚨 **Alertas generadas**
  - Muestra hogar afectado y mensaje
  - Icono rojo

**Ordenamiento:**
- Por timestamp descendente
- Muestra las últimas 6 actividades
- Formato de tiempo relativo

### 4. **Acciones Rápidas**

Botones grandes para las acciones más comunes:

- ➕ **Agregar Usuario** → `/admin/users/add`
- 🏠 **Agregar Hogar** → `/admin/homes/add`
- 📊 **Ver Estadísticas** → `/admin/statistics`
- 💧 **Ver Sectores** → `/admin/sectors`

## 🔧 Funcionalidades Técnicas

### Carga de Datos

```typescript
const fetchDashboardData = async () => {
  // Carga paralela de todos los datos necesarios
  const [users, homes, sensors, alerts] = await Promise.all([
    apiClient.get(ENDPOINTS.USERS),
    apiClient.get(ENDPOINTS.HOMES),
    apiClient.get(ENDPOINTS.SENSORS),
    apiClient.get(ENDPOINTS.ALERTS),
  ])
  
  // Calcula métricas en el frontend
  // Filtra alertas críticas
  // Genera actividad reciente
}
```

### Cálculo de Métricas

```typescript
// Usuarios activos (rol 'user', no admins)
activeUsers = users.filter(u => u.role === 'user').length

// Hogares activos
activeHomes = homes.filter(h => h.active).length

// Sensores online
activeSensors = sensors.filter(s => s.status === 'active').length

// Alertas no resueltas
unresolvedAlerts = alerts.filter(a => !a.resolved)

// Alertas críticas
criticalAlerts = unresolvedAlerts.filter(a => a.type === 'critical')
```

### Formato de Tiempo Relativo

```typescript
const formatTimeAgo = (timestamp: string) => {
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)
  
  if (diffMins < 60) return `Hace ${diffMins} min`
  if (diffHours < 24) return `Hace ${diffHours}h`
  return `Hace ${diffDays}d`
}
```

## 🎨 Diseño Visual

### Paleta de Colores

- **Azul** (#3B82F6): Usuarios
- **Verde** (#10B981): Hogares
- **Púrpura** (#8B5CF6): Sensores
- **Rojo** (#EF4444): Alertas críticas
- **Esmeralda** (#10B981): Estado positivo

### Animaciones

```css
.animate-fadeIn { animation: fadeIn 0.5s ease-in }
.animate-slideUp { animation: slideUp 0.6s ease-out }
```

**Delays escalonados:**
- KPI Cards: Sin delay
- Alertas Críticas: 0.1s
- Actividad Reciente: 0.2s
- Acciones Rápidas: 0.3s

### Efectos Hover

- Cards con `hover:shadow-xl`
- Transiciones suaves `transition-all duration-300`
- Botones con efecto de profundidad

## 📱 Responsive Design

- **Mobile (< 640px)**: 1 columna
- **Tablet (640px - 1024px)**: 2 columnas
- **Desktop (> 1024px)**: 4 columnas para KPIs, 3 columnas para contenido

## 🔄 Estado de Carga

```tsx
{loading ? (
  <Spinner con mensaje "Cargando panel de control..." />
) : (
  <Dashboard completo />
)}
```

## 🚀 Navegación

### Desde el Dashboard se puede acceder a:

| Elemento | Destino | Ruta |
|----------|---------|------|
| Card Usuarios | Gestión de Usuarios | `/admin/users` |
| Card Hogares | Gestión de Hogares | `/admin/homes` |
| Card Sensores | Gestión de Sensores | `/admin/sensors` |
| Card Alertas | Gestión de Alertas | `/admin/alerts` |
| Ver Alerta | Detalle de Alertas | `/admin/alerts` |
| Agregar Usuario | Formulario Usuario | `/admin/users/add` |
| Agregar Hogar | Formulario Hogar | `/admin/homes/add` |
| Ver Estadísticas | Estadísticas | `/admin/statistics` |
| Ver Sectores | Sectores | `/admin/sectors` |

## 📊 Datos Mostrados

### Métricas Calculadas
- Total y activos por entidad
- Porcentaje de sensores online
- Cantidad de alertas por criticidad

### Datos en Tiempo Real
- Última sincronización con backend
- Estado actual del sistema
- Actividad reciente (últimas 6 acciones)

## 🔐 Seguridad

- ✅ Solo accesible con rol `admin`
- ✅ Protegido por AuthProvider
- ✅ Validación de autorización en cada endpoint

## 🎯 Diferencias con Vista de Usuario

| Característica | Admin | Usuario |
|----------------|-------|---------|
| **Enfoque** | Gestión del sistema | Consumo personal |
| **Métricas** | Sistema completo | Solo su hogar |
| **Alertas** | Todas las del sistema | Solo sus alertas |
| **Acciones** | CRUD completo | Solo lectura |
| **Configuración** | No tiene acceso | Configuración de perfil |
| **Estadísticas** | Globales y comparativas | Personales |

## 🛠️ Mantenimiento

### Para agregar nuevas métricas:

1. Agregar nueva Card en el grid de KPIs
2. Calcular métrica en `fetchDashboardData()`
3. Actualizar interface `SystemMetrics`

### Para agregar nuevas acciones rápidas:

```tsx
<Button onClick={() => navigate('/nueva-ruta')}>
  <Icon />
  <span>Nueva Acción</span>
</Button>
```

## 📝 Notas Importantes

- ⚠️ El dashboard NO muestra consumo detallado (eso es para usuarios)
- ⚠️ Las alertas mostradas son solo las top 5 más críticas
- ⚠️ La actividad reciente es limitada a 6 eventos
- ✅ Los datos se cargan en paralelo para mejor performance
- ✅ Todos los cálculos se hacen en el frontend

## 🔮 Futuras Mejoras

- [ ] Gráfico de tendencia de alertas (últimos 7 días)
- [ ] Mapa de calor de sectores con más problemas
- [ ] Notificaciones push en tiempo real
- [ ] Widget de consumo total del sistema (hoy/mes)
- [ ] Comparación con período anterior
- [ ] Exportar reporte ejecutivo en PDF
