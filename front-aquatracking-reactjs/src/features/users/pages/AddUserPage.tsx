import { Card, Input, Select, Button, Notification, toast } from '@/components/ui'
import { FormItem } from '@/components/ui/Form'
import { useNavigate } from 'react-router'
import { useState } from 'react'
import { PiUserPlusDuotone, PiArrowLeftDuotone } from 'react-icons/pi'
import { apiClient } from '@/api/client'
import { ENDPOINTS } from '@/api/endpoints'
import { useSectors } from '@/hooks/useSectors'
import { useRutFormatter } from '@/hooks/useRutFormatter'
import { usePhoneFormatter } from '@/hooks/usePhoneFormatter'

const AddUserPage = () => {
  const navigate = useNavigate()
  const { sectors } = useSectors()
  const [loading, setLoading] = useState(false)
  const rutFormatter = useRutFormatter()
  const phoneFormatter = usePhoneFormatter()
  const [userForm, setUserForm] = useState({
    name: '',
    email: '',
    password: '',
  })

  const handleCreateUser = async () => {
    if (!userForm.name || !userForm.email || !rutFormatter.rawValue || !userForm.password) {
      toast.push(
        <Notification type="warning" title="Advertencia">
          Por favor completa los campos obligatorios
        </Notification>
      )
      return
    }

    try {
      setLoading(true)
      
      await apiClient.post(ENDPOINTS.USERS, {
        name: userForm.name,
        email: userForm.email,
        rut: rutFormatter.rawValue,
        phone: phoneFormatter.rawValue,
        password: userForm.password,
        role: 'user',
      })
      
      toast.push(
        <Notification type="success" title="Éxito">
          Usuario creado correctamente
        </Notification>
      )

      setTimeout(() => {
        navigate('/admin/users')
      }, 1000)
    } catch (error: any) {
      toast.push(
        <Notification type="danger" title="Error">
          {error.response?.data?.message || error.message || 'Error al crear usuario'}
        </Notification>
      )
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    navigate('/admin/users')
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
          <h3 className="mb-1">Agregar Usuario</h3>
          <p className="text-gray-500">Crea un nuevo usuario en el sistema</p>
        </div>
      </div>

      <Card>
        <div className="flex flex-col gap-6">
          <div>
            <h5 className="mb-4 flex items-center gap-2">
              <PiUserPlusDuotone className="text-2xl" />
              Información Personal
            </h5>
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormItem label="Nombre Completo">
                  <Input
                    placeholder="Juan Pérez"
                    value={userForm.name}
                    onChange={(e) => setUserForm(prev => ({ ...prev, name: e.target.value }))}
                  />
                </FormItem>

                <FormItem label="RUT">
                  <Input
                    placeholder="12.345.678-9"
                    value={rutFormatter.displayValue}
                    maxLength={12} // 11 caracteres + puntos y guión
                    onChange={(e) => rutFormatter.handleChange(e.target.value)}
                  />
                </FormItem>
              </div>

              <FormItem label="Email">
                <Input
                  type="email"
                  placeholder="usuario@ejemplo.com"
                  value={userForm.email}
                  onChange={(e) => setUserForm(prev => ({ ...prev, email: e.target.value }))}
                />
              </FormItem>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormItem label="Teléfono">
                  <Input
                    placeholder="+56 9 1234 5678"
                    value={phoneFormatter.displayValue}
                    maxLength={15} // +56 9 1234 5678
                    onChange={(e) => phoneFormatter.handleChange(e.target.value)}
                  />
                </FormItem>

                <FormItem label="Contraseña">
                  <Input
                    type="password"
                    placeholder="••••••••"
                    value={userForm.password}
                    onChange={(e) => setUserForm(prev => ({ ...prev, password: e.target.value }))}
                  />
                </FormItem>
              </div>
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
          onClick={handleCreateUser}
          loading={loading}
        >
          Agregar Usuario
        </Button>
      </div>
    </div>
  )
}

export default AddUserPage
