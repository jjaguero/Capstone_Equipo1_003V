import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router'
import {
    PiHouseDuotone,
    PiPencilDuotone,
    PiDropDuotone,
    PiUserDuotone,
    PiEyeDuotone,
    PiPlusDuotone,
    PiTrashDuotone,
} from 'react-icons/pi'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Table from '@/components/ui/Table'
import Dialog from '@/components/ui/Dialog'
import Select from '@/components/ui/Select'
import Badge from '@/components/ui/Badge'
import { useHomes } from '@/features/admin/homes/hooks/useHomes'
import { useUsers } from '@/features/admin/users/hooks/useUsers'
import { useSensors } from '@/features/user/sensors/hooks/useSensors'
import { useSectors } from '@/hooks/useSectors'
import { toast } from '@/components/ui/toast'
import { apiClient } from '@/api/client'
import { ENDPOINTS } from '@/api/endpoints'
import type { Home, User, Sector, Sensor } from '@/@types/entities'
import {
    SENSOR_LOCATIONS,
    LOCATION_SENSOR_MAP,
    SENSOR_STATUS,
    getAvailableSensorTypes,
    getLocationLabel,
    getSensorTypeLabel,
} from '@/features/user/sensors/constants/sensors.constant'

const { Tr, Th, Td, THead, TBody } = Table

const HomesManagementPage = () => {
    const navigate = useNavigate()
    const { homes, loading, fetchAllHomes, updateHome: updateHomeHook } = useHomes()
    const { users } = useUsers()
    const { sensors } = useSensors(undefined, true)
    const { sectors } = useSectors()

    const [searchTerm, setSearchTerm] = useState('')
    const [editDialogOpen, setEditDialogOpen] = useState(false)
    const [sensorsDialogOpen, setSensorsDialogOpen] = useState(false)
    const [addSensorDialogOpen, setAddSensorDialogOpen] = useState(false)
    const [selectedHome, setSelectedHome] = useState<Home | null>(null)

    // Formulario de edición (solo miembros)
    const [members, setMembers] = useState(0)

    const [selectedSensorTypes, setSelectedSensorTypes] = useState<Set<string>>(new Set())

    // Filtrar hogares por búsqueda
    const filteredHomes = useMemo(() => {
        return homes.filter((home: Home) =>
            home.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            home.address.toLowerCase().includes(searchTerm.toLowerCase())
        )
    }, [homes, searchTerm])

    // Abrir modal de edición
    const handleEdit = (home: Home) => {
        setSelectedHome(home)
        setMembers(home.members || 0)
        setEditDialogOpen(true)
    }

    // Guardar cambios
    const handleSave = async () => {
        if (!selectedHome) return

        try {
            await updateHomeHook(selectedHome._id, { members })
            toast.push(
                <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
                    <p className="font-semibold text-green-800 dark:text-green-200">
                        Hogar actualizado
                    </p>
                    <p className="text-sm text-green-600 dark:text-green-300">
                        Los cambios se guardaron correctamente
                    </p>
                </div>
            )
            setEditDialogOpen(false)
            fetchAllHomes()
        } catch (error) {
            console.error('Error updating home:', error)
            toast.push(
                <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
                    <p className="font-semibold text-red-800 dark:text-red-200">Error</p>
                    <p className="text-sm text-red-600 dark:text-red-300">
                        No se pudo actualizar el hogar
                    </p>
                </div>
            )
        }
    }

    // Calcular consumo de hoy por hogar (simulado por ahora)
    const getTodayConsumption = (homeId: string) => {
        const homeSensors = sensors.filter((s: any) => s.homeId === homeId)

        // Por ahora retornamos un valor aleatorio para simular
        return homeSensors.length > 0 ? Math.floor(Math.random() * 500) : 0
    }

    // Obtener cantidad de sensores activos por hogar
    const getActiveSensorsCount = (homeId: string) => {
        return sensors.filter((s: any) => s.homeId === homeId && s.status === 'active').length
    }

    // Helper para obtener nombre del propietario
    const getOwnerName = (ownerId: string | undefined) => {
        if (!ownerId) return 'Sin asignar'
        const owner = users.find((u: User) => u._id === ownerId)
        return owner ? owner.name : 'Sin asignar'
    }

    // Helper para obtener nombre del sector
    const getSectorName = (sectorId: string | undefined) => {
        if (!sectorId) return 'N/A'
        const sector = sectors.find((s: Sector) => s._id === sectorId)
        return sector?.name || 'N/A'
    }

    // Obtener sensores de un hogar específico
    const getHomeSensors = (homeId: string) => {
        return sensors.filter((s: Sensor) => s.homeId === homeId)
    }

    // Abrir modal de sensores
    const handleViewSensors = (home: Home) => {
        setSelectedHome(home)
        setSensorsDialogOpen(true)
    }

    const handleAddSensor = (home: Home) => {
        setSelectedHome(home)
        setSelectedSensorTypes(new Set())
        setAddSensorDialogOpen(true)
    }

    const handleToggleSensorType = (location: string, subType: string) => {
        const key = `${location}|${subType}`
        const newSelected = new Set(selectedSensorTypes)
        
        if (newSelected.has(key)) {
            newSelected.delete(key)
        } else {
            newSelected.add(key)
        }
        
        setSelectedSensorTypes(newSelected)
    }

    const handleSelectAllInLocation = (location: string, types: Array<{value: string; label: string}>) => {
        const newSelected = new Set(selectedSensorTypes)
        const allSelected = types.every(type => newSelected.has(`${location}|${type.value}`))
        
        if (allSelected) {
            types.forEach(type => newSelected.delete(`${location}|${type.value}`))
        } else {
            types.forEach(type => newSelected.add(`${location}|${type.value}`))
        }
        
        setSelectedSensorTypes(newSelected)
    }

    const handleSaveSensor = async () => {
        if (!selectedHome) return

        if (selectedSensorTypes.size === 0) {
            toast.push(
                <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg">
                    <p className="font-semibold text-yellow-800 dark:text-yellow-200">
                        Sin sensores
                    </p>
                    <p className="text-sm text-yellow-600 dark:text-yellow-300">
                        Selecciona al menos un sensor
                    </p>
                </div>
            )
            return
        }

        try {
            const promises = Array.from(selectedSensorTypes).map(async (key) => {
                const [location, subType] = key.split('|')
                const timestamp = Date.now()
                const randomNum = Math.floor(Math.random() * 10000)
                const serialNumber = `SN-${subType.toUpperCase()}-${timestamp}-${randomNum}`

                await new Promise(resolve => setTimeout(resolve, 10))

                return apiClient.post(ENDPOINTS.SENSORS, {
                    serialNumber,
                    category: 'agua',
                    location,
                    subType,
                    status: 'active',
                    homeId: selectedHome._id,
                })
            })

            await Promise.all(promises)

            toast.push(
                <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
                    <p className="font-semibold text-green-800 dark:text-green-200">
                        Sensores agregados
                    </p>
                    <p className="text-sm text-green-600 dark:text-green-300">
                        Se agregaron {selectedSensorTypes.size} sensores correctamente
                    </p>
                </div>
            )
            setAddSensorDialogOpen(false)
            setSelectedSensorTypes(new Set())
            window.location.reload()
        } catch (error) {
            console.error('Error adding sensors:', error)
            toast.push(
                <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
                    <p className="font-semibold text-red-800 dark:text-red-200">Error</p>
                    <p className="text-sm text-red-600 dark:text-red-300">
                        No se pudo agregar el sensor
                    </p>
                </div>
            )
        }
    }

    // Cambiar estado del sensor
    const handleChangeSensorStatus = async (sensorId: string, newStatus: string) => {
        try {
            await apiClient.patch(`${ENDPOINTS.SENSORS}/${sensorId}`, { status: newStatus })
            toast.push(
                <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
                    <p className="font-semibold text-green-800 dark:text-green-200">
                        Estado actualizado
                    </p>
                    <p className="text-sm text-green-600 dark:text-green-300">
                        El estado del sensor se cambió correctamente
                    </p>
                </div>
            )
            window.location.reload() // TODO: Mejorar con refetch del hook
        } catch (error) {
            console.error('Error updating sensor status:', error)
            toast.push(
                <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
                    <p className="font-semibold text-red-800 dark:text-red-200">Error</p>
                    <p className="text-sm text-red-600 dark:text-red-300">
                        No se pudo cambiar el estado del sensor
                    </p>
                </div>
            )
        }
    }

    return (
        <div className="space-y-8">
            <Card className="bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300">
                <div className="flex items-center justify-between mb-8 animate-fadeIn">
                    <div>
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                            Gestión de Hogares
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 mt-1">
                            Administra los hogares y su consumo de agua
                        </p>
                    </div>
                    <Button
                        variant="solid"
                        icon={<PiPlusDuotone />}
                        onClick={() => navigate('/admin/homes/add')}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white transition-all duration-200 shadow-md hover:shadow-lg"
                    >
                        Crear Hogar
                    </Button>
                </div>

                <div className="mb-6 animate-slideUp" style={{ animationDelay: '0.1s' }}>
                    <Input
                        placeholder="Buscar por nombre o dirección..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        prefix={<PiHouseDuotone className="text-lg" />}
                        className="transition-all duration-200 focus:ring-2 focus:ring-indigo-500"
                    />
                </div>

                <div className="animate-slideUp" style={{ animationDelay: '0.2s' }}>
                <Table>
                    <THead>
                        <Tr>
                            <Th>Hogar</Th>
                            <Th>Dirección</Th>
                            <Th>Propietario</Th>
                            <Th>Sector</Th>
                            <Th>Miembros</Th>
                            <Th>Sensores Activos</Th>
                            <Th>Consumo Hoy</Th>
                            <Th className="text-right">Acciones</Th>
                        </Tr>
                    </THead>
                    <TBody>
                        {loading ? (
                            <Tr>
                                <Td colSpan={8} className="text-center py-8 text-gray-500">
                                    Cargando hogares...
                                </Td>
                            </Tr>
                        ) : filteredHomes.length === 0 ? (
                            <Tr>
                                <Td colSpan={8} className="text-center py-8 text-gray-500">
                                    No se encontraron hogares
                                </Td>
                            </Tr>
                        ) : (
                            filteredHomes.map((home: Home) => {
                                const todayConsumption = getTodayConsumption(home._id)
                                const activeSensors = getActiveSensorsCount(home._id)

                                return (
                                    <Tr key={home._id}>
                                        <Td>
                                            <div className="flex items-center gap-2">
                                                <PiHouseDuotone className="text-xl text-primary-500" />
                                                <span className="font-medium">{home.name}</span>
                                            </div>
                                        </Td>
                                        <Td>{home.address}</Td>
                                        <Td>
                                            <div className="flex items-center gap-2">
                                                <PiUserDuotone className="text-gray-400" />
                                                <span>{getOwnerName(home.ownerId)}</span>
                                            </div>
                                        </Td>
                                        <Td>{getSectorName(home.sectorId)}</Td>
                                        <Td>{home.members || 0}</Td>
                                        <Td>
                                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                                                {activeSensors} activos
                                            </span>
                                        </Td>
                                        <Td>
                                            <div className="flex items-center gap-2">
                                                <PiDropDuotone className="text-blue-500 text-lg" />
                                                <span className="font-semibold text-blue-600 dark:text-blue-400">
                                                    {todayConsumption} L
                                                </span>
                                            </div>
                                        </Td>
                                        <Td className="text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <Button
                                                    size="sm"
                                                    variant="solid"
                                                    icon={<PiEyeDuotone />}
                                                    onClick={() => handleViewSensors(home)}
                                                >
                                                    Sensores
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    icon={<PiPencilDuotone />}
                                                    onClick={() => handleEdit(home)}
                                                >
                                                    Editar
                                                </Button>
                                            </div>
                                        </Td>
                                    </Tr>
                                )
                            })
                        )}
                    </TBody>
                </Table>
                </div>
            </Card>

            {/* Dialog de edición */}
            <Dialog
                isOpen={editDialogOpen}
                onClose={() => setEditDialogOpen(false)}
                onRequestClose={() => setEditDialogOpen(false)}
            >
                <div className="p-6">
                    <h5 className="text-xl font-bold mb-6">Editar Hogar</h5>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-2">
                                Número de miembros
                            </label>
                            <Input
                                type="number"
                                min="0"
                                value={members}
                                onChange={(e) => setMembers(parseInt(e.target.value) || 0)}
                            />
                            <p className="text-xs text-gray-500 mt-2">
                                Solo puedes modificar el número de miembros del hogar
                            </p>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 mt-6">
                        <Button variant="plain" onClick={() => setEditDialogOpen(false)}>
                            Cancelar
                        </Button>
                        <Button variant="solid" onClick={handleSave}>
                            Guardar Cambios
                        </Button>
                    </div>
                </div>
            </Dialog>

            {/* Dialog de sensores */}
            <Dialog
                isOpen={sensorsDialogOpen}
                onClose={() => setSensorsDialogOpen(false)}
                onRequestClose={() => setSensorsDialogOpen(false)}
                width={1000}
            >
                <div className="flex flex-col max-h-[90vh]">
                    <div className="p-6 border-b dark:border-gray-700">
                        <div className="flex items-center justify-between">
                            <div>
                                <h5 className="text-xl font-bold">
                                    Sensores de {selectedHome?.name}
                                </h5>
                                <p className="text-sm text-gray-500 mt-1">
                                    {selectedHome?.address}
                                </p>
                            </div>
                            <Button
                                size="sm"
                                variant="solid"
                                icon={<PiPlusDuotone />}
                                onClick={() => {
                                    setSensorsDialogOpen(false)
                                    handleAddSensor(selectedHome!)
                                }}
                            >
                                Agregar Sensor
                            </Button>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-6">
                        {selectedHome && getHomeSensors(selectedHome._id).length === 0 ? (
                            <div className="text-center py-12 text-gray-500">
                                <PiDropDuotone className="text-6xl mx-auto mb-4 text-gray-300" />
                                <p className="text-lg font-medium">No hay sensores instalados</p>
                                <p className="text-sm mt-2">
                                    Agrega sensores para monitorear el consumo de agua
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                            {selectedHome &&
                                getHomeSensors(selectedHome._id).map((sensor: Sensor) => (
                                    <Card key={sensor._id} className="p-4">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <PiDropDuotone className="text-3xl text-blue-500" />
                                                <div>
                                                    <p className="font-semibold">
                                                        {sensor.serialNumber}
                                                    </p>
                                                    <div className="flex items-center gap-2 text-sm text-gray-500">
                                                        <span>
                                                            {getLocationLabel(
                                                                sensor.location || ''
                                                            )}
                                                        </span>
                                                        <span>•</span>
                                                        <span>
                                                            {getSensorTypeLabel(
                                                                sensor.subType || ''
                                                            )}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-3">
                                                <select
                                                    className="px-3 py-1.5 text-sm border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                                                    value={sensor.status}
                                                    onChange={(e) =>
                                                        handleChangeSensorStatus(
                                                            sensor._id,
                                                            e.target.value
                                                        )
                                                    }
                                                >
                                                    {SENSOR_STATUS.map((status) => (
                                                        <option
                                                            key={status.value}
                                                            value={status.value}
                                                        >
                                                            {status.label}
                                                        </option>
                                                    ))}
                                                </select>

                                                <Badge
                                                    className={
                                                        sensor.status === 'active'
                                                            ? 'bg-green-100 text-green-800'
                                                            : sensor.status === 'inactive'
                                                              ? 'bg-red-100 text-red-800'
                                                              : sensor.status === 'maintenance'
                                                                ? 'bg-yellow-100 text-yellow-800'
                                                                : 'bg-gray-100 text-gray-800'
                                                    }
                                                >
                                                    {SENSOR_STATUS.find(
                                                        (s) => s.value === sensor.status
                                                    )?.label || sensor.status}
                                                </Badge>
                                            </div>
                                        </div>
                                    </Card>
                                ))}
                        </div>
                        )}
                    </div>

                    <div className="border-t dark:border-gray-700 p-6">
                        <div className="flex justify-end">
                            <Button variant="plain" onClick={() => setSensorsDialogOpen(false)}>
                                Cerrar
                            </Button>
                        </div>
                    </div>
                </div>
            </Dialog>

            <Dialog
                isOpen={addSensorDialogOpen}
                onClose={() => setAddSensorDialogOpen(false)}
                onRequestClose={() => setAddSensorDialogOpen(false)}
            >
                <div className="flex flex-col max-w-3xl max-h-[90vh]">
                    <div className="p-6 border-b dark:border-gray-700">
                        <h5 className="text-xl font-bold">
                            Agregar Sensores a {selectedHome?.name}
                        </h5>
                    </div>

                    <div className="flex-1 overflow-y-auto p-6 space-y-6">
                        {SENSOR_LOCATIONS.map((location) => {
                            const types = getAvailableSensorTypes(location.value)
                            const homeSensors = selectedHome ? getHomeSensors(selectedHome._id) : []
                            
                            const availableTypes = types.filter(type => {
                                const exists = homeSensors.some((sensor: Sensor) => 
                                    sensor.location === location.value && sensor.subType === type.value
                                )
                                return !exists
                            })

                            if (availableTypes.length === 0) return null

                            const allSelected = availableTypes.every(type => 
                                selectedSensorTypes.has(`${location.value}|${type.value}`)
                            )

                            return (
                                <div key={location.value} className="border rounded-lg p-4 dark:border-gray-700">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-3">
                                            <PiDropDuotone className="text-blue-500 text-2xl" />
                                            <h6 className="text-lg font-semibold">{location.label}</h6>
                                        </div>
                                        <Button
                                            variant="plain"
                                            size="sm"
                                            onClick={() => handleSelectAllInLocation(location.value, availableTypes)}
                                            className="text-sm text-indigo-600 hover:text-indigo-700"
                                        >
                                            {allSelected ? 'Deseleccionar todos' : 'Seleccionar todos'}
                                        </Button>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        {availableTypes.map((type) => {
                                            const key = `${location.value}|${type.value}`
                                            const isSelected = selectedSensorTypes.has(key)

                                            return (
                                                <label
                                                    key={type.value}
                                                    className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                                                        isSelected
                                                            ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                                                            : 'border-gray-200 hover:border-gray-300 dark:border-gray-700'
                                                    }`}
                                                >
                                                    <input
                                                        type="checkbox"
                                                        checked={isSelected}
                                                        onChange={() => handleToggleSensorType(location.value, type.value)}
                                                        className="w-5 h-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                                    />
                                                    <div className="flex-1">
                                                        <p className="text-sm font-medium">{type.label}</p>
                                                    </div>
                                                </label>
                                            )
                                        })}
                                    </div>
                                </div>
                            )
                        })}
                    </div>

                    <div className="border-t dark:border-gray-700 p-6">
                        <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                            <p className="text-sm text-blue-800 dark:text-blue-200">
                                <strong>{selectedSensorTypes.size}</strong> sensor{selectedSensorTypes.size !== 1 ? 'es' : ''} seleccionado{selectedSensorTypes.size !== 1 ? 's' : ''}
                            </p>
                            <p className="text-xs text-blue-600 dark:text-blue-300 mt-1">
                                Los números de serie se generarán automáticamente
                            </p>
                        </div>

                        <div className="flex justify-end gap-3">
                            <Button
                                variant="plain"
                                onClick={() => setAddSensorDialogOpen(false)}
                            >
                                Cancelar
                            </Button>
                            <Button 
                                variant="solid" 
                                onClick={handleSaveSensor}
                                disabled={selectedSensorTypes.size === 0}
                            >
                                Agregar {selectedSensorTypes.size} Sensor{selectedSensorTypes.size !== 1 ? 'es' : ''}
                            </Button>
                        </div>
                    </div>
                </div>
            </Dialog>
        </div>
    )
}

export default HomesManagementPage
