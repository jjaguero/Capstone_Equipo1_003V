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
    <div className="space-y-8">
      <Card className="bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300">
        <div className="flex items-center justify-between mb-8 animate-fadeIn">
          <div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
              Gestión de Usuarios
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Administra los usuarios del sistema
            </p>
          </div>
          <Button
            variant="solid"
            size="sm"
            icon={<PiUserPlusDuotone />}
            onClick={() => navigate('/admin/users/add')}
            className="bg-indigo-600 hover:bg-indigo-700 text-white transition-all duration-200 shadow-md hover:shadow-lg"
          >
            Agregar Usuario
          </Button>
        </div>

        <div className="animate-slideUp" style={{ animationDelay: '0.1s' }}>
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
                  <div className="flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-8 h-8 mx-auto mb-2 border-2 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
                      <p className="text-gray-600 dark:text-gray-400 text-sm">Cargando usuarios...</p>
                    </div>
                  </div>
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
        </div>
      </Card>
    </div>
  )
}

export default UsersManagementPage 
