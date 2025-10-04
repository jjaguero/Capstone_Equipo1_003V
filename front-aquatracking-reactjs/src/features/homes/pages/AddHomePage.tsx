import { Card, Input, Button, Notification, toast } from '@/components/ui'
import { FormItem } from '@/components/ui/Form'
import { useNavigate } from 'react-router'
import { useState } from 'react'
import { PiHouseDuotone, PiArrowLeftDuotone } from 'react-icons/pi'
import { apiClient } from '@/api/client'
import { ENDPOINTS } from '@/api/endpoints'
import { useSectors } from '@/hooks/useSectors'
import { useUsers } from '@/features/users/hooks/useUsers'
import type { User, Sector } from '@/@types/entities'

const AddHomePage = () => {
  const navigate = useNavigate()
  const { sectors } = useSectors()
  const { users } = useUsers()
  const [loading, setLoading] = useState(false)

  // Filtrar solo usuarios (no admins)
  const regularUsers = users.filter((u: User) => u.role !== 'admin')

  const [homeForm, setHomeForm] = useState({
    name: '',
    address: '',
    sectorId: '',
    ownerId: '',
    members: 1,
  })

  const handleCreateHome = async () => {
    if (!homeForm.name || !homeForm.address || !homeForm.sectorId || !homeForm.ownerId) {
      toast.push(
        <Notification type="warning" title="Advertencia">
          Por favor completa todos los campos obligatorios
        </Notification>
      )
      return
    }

    try {
      setLoading(true)
      
      await apiClient.post(ENDPOINTS.HOMES, {
        name: homeForm.name,
        address: homeForm.address,
        sectorId: homeForm.sectorId,
        ownerId: homeForm.ownerId,
        active: true,
        members: homeForm.members,
      })
      
      toast.push(
        <Notification type="success" title="Éxito">
          Hogar creado correctamente
        </Notification>
      )

      setTimeout(() => {
        navigate('/admin/homes')
      }, 1000)
    } catch (error: any) {
      toast.push(
        <Notification type="danger" title="Error">
          {error.response?.data?.message || error.message || 'Error al crear hogar'}
        </Notification>
      )
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    navigate('/admin/homes')
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <Button
          variant="plain"
          size="sm"
          icon={<PiArrowLeftDuotone />}
          onClick={handleCancel}
        >
          Volver
        </Button>
        <div>
          <h3 className="mb-1">Crear Hogar</h3>
          <p className="text-gray-500">Registra un nuevo hogar en el sistema</p>
        </div>
      </div>

      <Card>
        <div className="p-6">
          <h6 className="mb-4 font-semibold">Información del Hogar</h6>
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormItem label="Nombre del Hogar *">
                <Input
                  placeholder="Casa de Juan"
                  value={homeForm.name}
                  onChange={(e) => setHomeForm(prev => ({ ...prev, name: e.target.value }))}
                />
              </FormItem>

              <FormItem label="Propietario *">
                <select
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                  value={homeForm.ownerId}
                  onChange={(e) => setHomeForm(prev => ({ ...prev, ownerId: e.target.value }))}
                >
                  <option value="">Seleccionar propietario</option>
                  {regularUsers.map((user: User) => (
                    <option key={user._id} value={user._id}>
                      {user.name} - {user.rut}
                    </option>
                  ))}
                </select>
              </FormItem>
            </div>

            <FormItem label="Dirección *">
              <Input
                placeholder="Av. Principal 123, Puerto Varas"
                value={homeForm.address}
                onChange={(e) => setHomeForm(prev => ({ ...prev, address: e.target.value }))}
              />
            </FormItem>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormItem label="Sector *">
                <select
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                  value={homeForm.sectorId}
                  onChange={(e) => setHomeForm(prev => ({ ...prev, sectorId: e.target.value }))}
                >
                  <option value="">Seleccionar sector</option>
                  {sectors.map((sector: Sector) => (
                    <option key={sector._id} value={sector._id}>
                      {sector.name}
                    </option>
                  ))}
                </select>
              </FormItem>

              <FormItem label="Número de Miembros *">
                <Input
                  type="number"
                  min="1"
                  value={homeForm.members}
                  onChange={(e) => setHomeForm(prev => ({ ...prev, members: parseInt(e.target.value) || 1 }))}
                />
              </FormItem>
            </div>
          </div>
        </div>
      </Card>

      <div className="flex justify-end gap-3">
        <Button
          variant="plain"
          onClick={handleCancel}
          disabled={loading}
        >
          Cancelar
        </Button>
        <Button
          variant="solid"
          onClick={handleCreateHome}
          loading={loading}
        >
          Agregar Hogar
        </Button>
      </div>
    </div>
  )
}

export default AddHomePage
