# 💧 Feature: Consumption (Vista de Consumo)

## 📋 Descripción

Vista de administración para monitorear y analizar el consumo de agua de todos los hogares del sistema AquaTracking.

---

## 🎯 Funcionalidades

### ✅ Implementado:

1. **KPIs principales**:
   - Consumo total (litros)
   - Promedio diario
   - Total de alertas generadas
   - Cantidad de hogares activos

2. **Gráfico de líneas**:
   - Consumo diario por cada hogar
   - Rango de fechas: 14 sept → 4 oct 2025
   - Serie de datos por home (Casa Juan, Casa Andrés, Casa de Andrus)

3. **Gráfico de barras**:
   - Comparativa de consumo total vs límite por hogar
   - Identificación visual de excesos

4. **Filtros avanzados**:
   - Por hogar específico
   - Por rango de fechas (fecha inicio/fin)
   - Botón limpiar filtros
   - Indicadores visuales de filtros activos

5. **Tabla detallada**:
   - Fecha (día de semana)
   - Hogar
   - Consumo real vs límite
   - Porcentaje de uso con barra de progreso
   - Estado (Normal/Alto/Crítico)
   - Cantidad de alertas por día

---

## 📂 Estructura de archivos

```
src/features/consumption/
├── pages/
│   └── ConsumptionPage.tsx         ← Vista principal
├── components/
│   ├── ConsumptionStats.tsx        ← KPIs en Cards
│   ├── ConsumptionLineChart.tsx    ← Gráfico de líneas
│   ├── ConsumptionBarChart.tsx     ← Gráfico de barras
│   ├── ConsumptionFilters.tsx      ← Filtros
│   └── ConsumptionTable.tsx        ← Tabla detallada
├── hooks/
│   └── useConsumption.ts           ← Lógica de datos
└── index.ts                        ← Exports
```

---

## 🔌 Endpoints utilizados

```typescript
// Backend: api-nestjs-aquatracking

GET /daily-consumption
// Obtiene todos los consumos diarios

GET /daily-consumption/home/:homeId
// Obtiene consumos de un hogar específico

GET /daily-consumption/range?startDate=X&endDate=Y
// Obtiene consumos en un rango de fechas

GET /homes
// Lista de hogares activos (para filtros)
```

---

## 🎨 Componentes del template utilizados

- `<Card>` - Contenedores principales
- `<Chart>` - Wrapper de ApexCharts (líneas y barras)
- `<Select>` - Selector de hogar
- `<Input type="date">` - Selector de fechas
- `<Table>` - Tabla de datos
- `<Badge>` - Estados y alertas
- `<Button>` - Acciones (actualizar, limpiar)
- `<Spinner>` - Loading state
- `<Container>` y `<AdaptiveCard>` - Layout

---

## 📊 Datos mostrados

### KPIs (ConsumptionStats):
```typescript
{
  totalConsumed: 44516,      // Total litros consumidos
  averageDaily: 706,         // Promedio diario
  totalAlerts: 21,           // Alertas generadas
  homesCount: 3              // Hogares activos
}
```

### Daily Consumption:
```typescript
{
  _id: "...",
  homeId: "68ddb480dbd7ffab2815388c",
  date: "2025-09-14T00:00:00.000Z",
  totalLiters: 704,
  limitLiters: 660,
  recommendedLiters: 600,
  bySensor: [
    { sensorId: "...", liters: 580 },
    { sensorId: "...", liters: 124 }
  ],
  alerts: [
    {
      type: "high_consumption",
      message: "⚠️ Consumo alto detectado...",
      triggeredAt: "2025-09-14T00:00:00.000Z"
    }
  ]
}
```

---

## 🎯 Estados de consumo

| Estado | Condición | Color | Badge |
|--------|-----------|-------|-------|
| **Normal** | < 100% del límite | Verde | ✅ Normal |
| **Límite alcanzado** | = 100% del límite | Amarillo | ⚠️ Límite alcanzado |
| **Alto** | 100-149% del límite | Rojo | ⚠️ Alto |
| **Crítico** | ≥ 150% del límite | Rojo oscuro | 🚨 Crítico |

---

## 🚀 Uso

### Navegar a la vista:
```
/admin/consumption
```

### Acceso desde menú:
```
Gestión → Consumo
```

### Filtrar datos:
1. Seleccionar hogar del dropdown
2. Seleccionar rango de fechas
3. Los gráficos y tabla se actualizan automáticamente
4. Clic en "Limpiar filtros" para resetear

---

## 🧪 Testing con datos reales

Los datos fueron generados con el seed script:
- **2,410 measurements** (14 sept → 4 oct)
- **63 daily consumptions** (3 homes × 21 días)
- **21 alertas** (consumos excesivos)

### Casos de prueba:

1. ✅ Vista sin filtros: Muestra todos los homes
2. ✅ Filtrar por home: Muestra solo ese home
3. ✅ Filtrar por fecha: Muestra rango específico
4. ✅ Casa Andrés: Muestra 19 alertas (250L/persona/día)
5. ✅ Casa Juan: Muestra 2 alertas (176L/persona/día)
6. ✅ Casa de Andrus: Muestra 0 alertas (133L/persona/día)

---

## 🔮 Mejoras futuras (opcional)

- [ ] Exportar datos a Excel/PDF
- [ ] Comparativa con período anterior
- [ ] Gráfico de consumo por sensor
- [ ] Predicción de consumo (ML)
- [ ] Alertas en tiempo real (WebSockets)
- [ ] Mapa de calor por hora del día
- [ ] Filtro por sector
- [ ] Comparativa con promedio del sector

---

## 📝 Notas técnicas

- **Framework**: React 19 + TypeScript
- **Gráficos**: ApexCharts (react-apexcharts)
- **Estado**: React Hooks (useState, useEffect, useMemo)
- **API Client**: Axios
- **Estilos**: TailwindCSS + Template ecme-react
- **Iconos**: Phosphor Icons (react-icons/pi)

---

## 🐛 Troubleshooting

### No se muestran datos:
```
✅ Verificar que el backend esté corriendo (localhost:3000)
✅ Verificar que existan datos en daily-consumption collection
✅ Ejecutar el seed script si no hay datos
```

### Gráficos vacíos:
```
✅ Verificar que homes tenga datos
✅ Verificar formato de fechas (ISO 8601)
✅ Revisar console.log en navegador
```

### Filtros no funcionan:
```
✅ Verificar que homes esté cargado
✅ Revisar formato de fechas seleccionadas
✅ Limpiar filtros y volver a intentar
```

---

**Creado**: 2025-10-04  
**Autor**: Sistema AquaTracking  
**Versión**: 1.0.0
