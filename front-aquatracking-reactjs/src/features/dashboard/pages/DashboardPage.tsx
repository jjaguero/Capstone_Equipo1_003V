import { Card, Table } from '@/components/ui';
import TBody from '@/components/ui/Table/TBody';
import THead from '@/components/ui/Table/THead';
import Td from '@/components/ui/Table/Td';
import Th from '@/components/ui/Table/Th';
import Tr from '@/components/ui/Table/Tr';
import { useUsers } from '@/features/users/hooks/useUsers';
import { useHomes } from '@/features/homes/hooks/useHomes';
import { useSensors } from '@/features/sensors/hooks/useSensors';
import { useSectors } from '@/hooks/useSectors';

const AdminDashboard = () => {
  const { users, loading: usersLoading } = useUsers();
  const { homes, loading: homesLoading } = useHomes();
  const { sensors, loading: sensorsLoading } = useSensors();
  const { sectors, loading: sectorsLoading } = useSectors();

  const totalUsers = users.length;
  const totalHomes = homes.length;
  const activeSensors = sensors.filter(s => s.status === 'active').length;
  const totalSensors = sensors.length;

  return (
    <div className="flex flex-col gap-6">
      <div className="animate-fadeIn">
        <h3 className="mb-2 text-2xl font-bold text-gray-900 dark:text-gray-100">Panel de Administración APR</h3>
        <p className="text-gray-600 dark:text-gray-400">Vista general del sistema AquaTracking</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-slideUp" style={{ animationDelay: '0.1s' }}>
        <Card className="bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <div className="flex flex-col p-6">
            <span className="text-gray-500 text-sm font-medium">Total Usuarios</span>
            <span className="text-2xl font-bold text-indigo-600">{totalUsers}</span>
          </div>
        </Card>

        <Card className="bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <div className="flex flex-col p-6">
            <span className="text-gray-500 text-sm font-medium">Total Hogares</span>
            <span className="text-2xl font-bold text-emerald-600">{totalHomes}</span>
          </div>
        </Card>

        <Card className="bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <div className="flex flex-col p-6">
            <span className="text-gray-500 text-sm font-medium">Sensores Activos</span>
            <span className="text-2xl font-bold text-blue-600">{activeSensors}/{totalSensors}</span>
          </div>
        </Card>

        <Card className="bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <div className="flex flex-col p-6">
            <span className="text-gray-500 text-sm font-medium">Sectores</span>
            <span className="text-2xl font-bold text-amber-600">{sectors.length}</span>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 animate-slideUp" style={{ animationDelay: '0.2s' }}>
        <Card 
          header={{ content: <h5 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Usuarios del Sistema</h5> }}
          className="bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300"
        >
          {usersLoading ? (
            <div className="flex items-center justify-center h-32">
              <div className="text-center">
                <div className="w-8 h-8 mx-auto mb-2 border-2 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
                <p className="text-gray-600 dark:text-gray-400 text-sm">Cargando usuarios...</p>
              </div>
            </div>
          ) : (
            <Table>
              <THead>
                <Tr>
                  <Th>Nombre</Th>
                  <Th>Email</Th>
                  <Th>RUT</Th>
                  <Th>Rol</Th>
                  <Th>Teléfono</Th>
                </Tr>
              </THead>
              <TBody>
                {users.map((user) => (
                  <Tr key={user._id}>
                    <Td>{user.name}</Td>
                    <Td>{user.email}</Td>
                    <Td>{user.rut}</Td>
                    <Td>
                      <span className={`px-2 py-1 rounded text-xs ${
                        user.role === 'admin' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'
                      }`}>
                        {user.role}
                      </span>
                    </Td>
                    <Td>{user.phone}</Td>
                  </Tr>
                ))}
              </TBody>
            </Table>
          )}
        </Card>

        <Card header={{ content: <h5>Hogares Registrados</h5> }}>
          {homesLoading ? (
            <p>Cargando hogares...</p>
          ) : (
            <Table>
              <THead>
                <Tr>
                  <Th>Nombre</Th>
                  <Th>Dirección</Th>
                  <Th>Miembros</Th>
                  <Th>Estado</Th>
                </Tr>
              </THead>
              <TBody>
                {homes.map((home) => (
                  <Tr key={home._id}>
                    <Td>{home.name}</Td>
                    <Td>{home.address}</Td>
                    <Td>{home.members || 0}</Td>
                    <Td>
                      <span className={`px-2 py-1 rounded text-xs ${
                        home.active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {home.active ? 'Activo' : 'Inactivo'}
                      </span>
                    </Td>
                  </Tr>
                ))}
              </TBody>
            </Table>
          )}
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
