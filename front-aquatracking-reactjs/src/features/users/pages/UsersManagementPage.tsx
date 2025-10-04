import { Card, Table, Button } from '@/components/ui'
import TBody from '@/components/ui/Table/TBody'
import THead from '@/components/ui/Table/THead'
import Td from '@/components/ui/Table/Td'
import Th from '@/components/ui/Table/Th'
import Tr from '@/components/ui/Table/Tr'
import { useUsers } from '@/features/users/hooks/useUsers'
import { useHomes } from '@/features/homes/hooks/useHomes'
import { useNavigate } from 'react-router'
import { PiUserPlusDuotone, PiHouseDuotone } from 'react-icons/pi'
import type { User, Home } from '@/@types/entities'

const UsersManagementPage = () => {
  const navigate = useNavigate()
  const { users, loading: usersLoading } = useUsers()
  const { homes } = useHomes()

  // Contar hogares del usuario
  const getUserHomesCount = (userId: string) => {
    return homes.filter((h: Home) => h.ownerId === userId).length
  }

  return (
    <div>
      <Card>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
              Gestión de Usuarios
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Administra los usuarios del sistema
            </p>
          </div>
          <Button
            variant="solid"
            size="sm"
            icon={<PiUserPlusDuotone />}
            onClick={() => navigate('/admin/users/add')}
          >
            Agregar Usuario
          </Button>
        </div>

        <Table>
          <THead>
            <Tr>
              <Th>Usuario</Th>
              <Th>Email</Th>
              <Th>RUT</Th>
              <Th>Teléfono</Th>
              <Th>Hogares</Th>
              <Th>Rol</Th>
            </Tr>
          </THead>
          <TBody>
            {usersLoading ? (
              <Tr>
                <Td colSpan={6} className="text-center py-8">
                  Cargando usuarios...
                </Td>
              </Tr>
            ) : users.length === 0 ? (
              <Tr>
                <Td colSpan={6} className="text-center py-8">
                  No hay usuarios registrados
                </Td>
              </Tr>
            ) : (
              users.map((user: User) => (
                <Tr key={user._id}>
                  <Td>
                    <div className="font-medium">{user.name}</div>
                  </Td>
                  <Td>{user.email}</Td>
                  <Td>{user.rut}</Td>
                  <Td>{user.phone || 'N/A'}</Td>
                  <Td>
                    <div className="flex items-center gap-2">
                      <PiHouseDuotone className="text-blue-500" />
                      <span className="font-medium">{getUserHomesCount(user._id)}</span>
                    </div>
                  </Td>
                  <Td>
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        user.role === 'admin'
                          ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                          : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                      }`}
                    >
                      {user.role === 'admin' ? 'Administrador' : 'Usuario'}
                    </span>
                  </Td>
                </Tr>
              ))
            )}
          </TBody>
        </Table>
      </Card>
    </div>
  )
}

export default UsersManagementPage 
