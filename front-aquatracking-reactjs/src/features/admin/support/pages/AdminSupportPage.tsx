import { useState, useEffect, useRef } from 'react'
import { useAquaTrackingAuth } from '@/features/auth/hooks/useAquaTrackingAuth'
import useSupportTickets from '@/hooks/useSupportTickets'
import Container from '@/components/shared/Container'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import Breadcrumb from '@/components/shared/Breadcrumb'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import ScrollBar from '@/components/ui/ScrollBar'
import Avatar from '@/components/ui/Avatar'
import toast from '@/components/ui/toast'
import Notification from '@/components/ui/Notification'
import {
  PiChatCircleDotsDuotone,
  PiCheckCircleDuotone,
  PiWarningDuotone,
  PiPaperPlaneTiltDuotone,
  PiXCircleDuotone,
  PiWrenchDuotone,
  PiUsersDuotone,
  PiMagnifyingGlassDuotone,
} from 'react-icons/pi'
import type { SupportTicket } from '@/@types/entities'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

const AdminSupportPage = () => {
  const { currentUser } = useAquaTrackingAuth()
  const { tickets: fetchedTickets, stats, loading, updateTicket, addComment, refetch } = useSupportTickets(
    currentUser?._id || undefined,
    'admin'
  )

  const [tickets, setTickets] = useState<SupportTicket[]>([])
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null)
  const [newComment, setNewComment] = useState('')
  const [sendingComment, setSendingComment] = useState(false)
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Sincronizar tickets del hook con estado local
  useEffect(() => {
    setTickets(fetchedTickets)
  }, [fetchedTickets])

  // No usar scroll automático en useEffect, lo haremos manualmente al enviar mensaje

  const statusOptions = [
    { value: 'all', label: 'Todos' },
    { value: 'open', label: 'Abiertos' },
    { value: 'in_progress', label: 'En Progreso' },
    { value: 'resolved', label: 'Resueltos' },
    { value: 'closed', label: 'Cerrados' },
  ]

  const filteredTickets = tickets
    .filter((t) => filterStatus === 'all' || t.status === filterStatus)
    .filter((t) => 
      searchQuery === '' || 
      t.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.description.toLowerCase().includes(searchQuery.toLowerCase())
    )

  const handleChangeStatus = async (status: string) => {
    if (!selectedTicket) return

    try {
      await updateTicket(selectedTicket._id, { status: status as any })
      toast.push(<Notification type="success">Estado actualizado</Notification>)
      
      await refetch()
      const updatedTicket = tickets.find((t) => t._id === selectedTicket._id)
      if (updatedTicket) setSelectedTicket(updatedTicket)
    } catch (error) {
      console.error('Error updating status:', error)
      toast.push(<Notification type="danger">Error al actualizar estado</Notification>)
    }
  }

  const handleSendTechnician = async () => {
    if (!selectedTicket || !currentUser) return

    try {
      await updateTicket(selectedTicket._id, { status: 'in_progress' })
      
      await addComment(selectedTicket._id, {
        userId: currentUser._id,
        userName: currentUser.name,
        userRole: 'admin',
        message: 'Se ha enviado un técnico a terreno para revisar el problema. Será contactado pronto.',
      })

      toast.push(<Notification type="success">Equipo técnico enviado</Notification>)
      
      await refetch()
      const updatedTicket = tickets.find((t) => t._id === selectedTicket._id)
      if (updatedTicket) setSelectedTicket(updatedTicket)
    } catch (error) {
      console.error('Error sending technician:', error)
      toast.push(<Notification type="danger">Error al enviar equipo técnico</Notification>)
    }
  }

  const handleSendComment = async () => {
    if (!selectedTicket || !newComment.trim() || !currentUser) return

    const messageToSend = newComment.trim()
    
    try {
      setSendingComment(true)
      setNewComment('') // Limpiar input inmediatamente
      
      // Crear comentario para enviar al backend
      const commentData = {
        userId: currentUser._id,
        userName: currentUser.name,
        userRole: 'admin',
        message: messageToSend,
      }

      // Crear comentario optimista para mostrar inmediatamente
      const optimisticComment = {
        ...commentData,
        timestamp: new Date().toISOString(),
      }

      // Actualizar ticket seleccionado inmediatamente
      const updatedTicket = {
        ...selectedTicket,
        comments: [...selectedTicket.comments, optimisticComment],
      }
      setSelectedTicket(updatedTicket)

      // Actualizar también en la lista de tickets sin refetch
      setTickets((prevTickets) =>
        prevTickets.map((t) =>
          t._id === selectedTicket._id ? updatedTicket : t
        )
      )

      // Scroll al final después de agregar el mensaje
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
      }, 50)

      // Enviar al servidor (sin timestamp, el backend lo añade)
      const response = await addComment(selectedTicket._id, commentData)
      
      // Actualizar con la respuesta real del servidor (sin refetch)
      setSelectedTicket(response)
      setTickets((prevTickets) =>
        prevTickets.map((t) =>
          t._id === response._id ? response : t
        )
      )
      
      // No mostrar toast para no interrumpir el chat
    } catch (error) {
      console.error('Error sending comment:', error)
      toast.push(<Notification type="danger">Error al enviar mensaje</Notification>)
      // Revertir el cambio optimista en caso de error
      setSelectedTicket(selectedTicket)
      setTickets((prevTickets) =>
        prevTickets.map((t) =>
          t._id === selectedTicket._id ? selectedTicket : t
        )
      )
      setNewComment(messageToSend) // Restaurar el mensaje
    } finally {
      setSendingComment(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const badges = {
      open: <Badge content="Abierto" className="bg-blue-100 text-blue-800 text-xs px-2 py-1" />,
      in_progress: <Badge content="En Progreso" className="bg-amber-100 text-amber-800 text-xs px-2 py-1" />,
      resolved: <Badge content="Resuelto" className="bg-green-100 text-green-800 text-xs px-2 py-1" />,
      closed: <Badge content="Cerrado" className="bg-gray-100 text-gray-800 text-xs px-2 py-1" />,
    }
    return badges[status as keyof typeof badges] || badges.open
  }

  const getPriorityColor = (priority: string) => {
    const colors = {
      low: 'text-gray-500',
      medium: 'text-blue-500',
      high: 'text-orange-500',
      urgent: 'text-red-500',
    }
    return colors[priority as keyof typeof colors] || colors.medium
  }

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      sensor_issue: 'Sensor',
      high_consumption: 'Consumo Alto',
      leak_detection: 'Fuga',
      general_inquiry: 'Consulta',
      other: 'Otro',
    }
    return labels[category] || category
  }

  if (loading) {
    return (
      <Container>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
            <p className="text-gray-600 dark:text-gray-400">Cargando...</p>
          </div>
        </div>
      </Container>
    )
  }

  return (
    <Container>
      {/* Breadcrumb */}
      <div className="mb-6 animate-fadeIn">
        <Breadcrumb />
      </div>

      {/* Header con Stats */}
      <div className="mb-6 animate-fadeIn">
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 animate-slideUp" style={{ animationDelay: '0.1s' }}>
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <PiChatCircleDotsDuotone className="text-2xl text-blue-600" />
                <div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Total</p>
                  <p className="text-xl font-bold">{stats.total}</p>
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center gap-3">
                <PiWarningDuotone className="text-2xl text-blue-600" />
                <div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Abiertos</p>
                  <p className="text-xl font-bold">{stats.open}</p>
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center gap-3">
                <PiWrenchDuotone className="text-2xl text-amber-600" />
                <div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">En Progreso</p>
                  <p className="text-xl font-bold">{stats.inProgress}</p>
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center gap-3">
                <PiCheckCircleDuotone className="text-2xl text-green-600" />
                <div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Resueltos</p>
                  <p className="text-xl font-bold">{stats.resolved}</p>
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center gap-3">
                <PiXCircleDuotone className="text-2xl text-gray-600" />
                <div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Cerrados</p>
                  <p className="text-xl font-bold">{stats.closed}</p>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>

      {/* Layout estilo Chat - 2 columnas */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 animate-slideUp" style={{ animationDelay: '0.2s' }}>
        {/* Columna izquierda: Lista de tickets */}
        <div className="col-span-1 lg:col-span-4 xl:col-span-3">
          <Card className="h-[600px] flex flex-col">
            {/* Header de la lista */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="relative mb-3">
                <PiMagnifyingGlassDuotone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Buscar tickets..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select
                options={statusOptions}
                value={statusOptions.find((opt) => opt.value === filterStatus)}
                onChange={(option: any) => setFilterStatus(option.value)}
                size="sm"
              />
            </div>

            {/* Lista de tickets scrolleable */}
            <ScrollBar className="flex-1">
              {filteredTickets.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <PiChatCircleDotsDuotone className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                  <p className="text-sm">No hay tickets</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredTickets.map((ticket) => {
                    // Obtener nombre del usuario
                    const userName = typeof ticket.userId === 'object' && ticket.userId?.name 
                      ? ticket.userId.name 
                      : 'Usuario';
                    
                    return (
                    <div
                      key={ticket._id}
                      className={`p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${
                        selectedTicket?._id === ticket._id ? 'bg-indigo-50 dark:bg-indigo-900/20' : ''
                      }`}
                      onClick={() => setSelectedTicket(ticket)}
                    >
                      <div className="flex items-start gap-3">
                        <Avatar className="bg-blue-200 text-blue-700" size={40}>
                          {userName.slice(0, 2).toUpperCase()}
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex-1">
                              <p className="font-semibold text-sm text-gray-900 dark:text-gray-100 truncate">
                                {ticket.subject}
                              </p>
                              <p className="text-xs text-indigo-600 dark:text-indigo-400 font-medium">
                                {userName}
                              </p>
                            </div>
                            {getStatusBadge(ticket.status)}
                          </div>
                          <p className="text-xs text-gray-600 dark:text-gray-400 mb-1 truncate">
                            {ticket.description}
                          </p>
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <span className={getPriorityColor(ticket.priority)}>
                              ● {ticket.priority}
                            </span>
                            <span>•</span>
                            <span>{getCategoryLabel(ticket.category)}</span>
                            <span>•</span>
                            <span>{format(new Date(ticket.createdAt), 'dd/MM')}</span>
                          </div>
                        </div>
                      </div>
                      {ticket.comments.length > 0 && (
                        <div className="mt-2 ml-11">
                          <Badge content={`${ticket.comments.length} mensajes`} className="text-xs bg-gray-100 text-gray-700 px-2 py-1" />
                        </div>
                      )}
                    </div>
                  )})}
                </div>
              )}
            </ScrollBar>
          </Card>
        </div>

        {/* Columna derecha: Conversación */}
        <div className="col-span-1 lg:col-span-8 xl:col-span-9">
          <Card className="h-[600px] flex flex-col">
            {!selectedTicket ? (
              <div className="flex-1 flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <PiChatCircleDotsDuotone className="w-20 h-20 mx-auto mb-4 text-gray-300" />
                  <p>Selecciona un ticket para ver la conversación</p>
                </div>
              </div>
            ) : (
              <>
                {/* Header del chat - compacto */}
                <div className="flex-shrink-0 p-3 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-base text-gray-900 dark:text-gray-100 truncate">
                        {selectedTicket.subject}
                      </h4>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                        {selectedTicket.description}
                      </p>
                      <div className="flex items-center gap-2 mt-2 flex-wrap">
                        {getStatusBadge(selectedTicket.status)}
                        <Badge content={getCategoryLabel(selectedTicket.category)} className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1" />
                        {selectedTicket.sensorId && (
                          <Badge content={`Sensor: ${selectedTicket.sensorId.slice(-6)}`} className="text-xs bg-purple-100 text-purple-700 px-2 py-1" />
                        )}
                      </div>
                    </div>

                    {/* Botones de acción compactos */}
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="solid"
                        className="bg-blue-600 hover:bg-blue-700"
                        icon={<PiUsersDuotone />}
                        onClick={handleSendTechnician}
                        disabled={selectedTicket.status === 'resolved' || selectedTicket.status === 'closed'}
                      />

                      <Button
                        size="sm"
                        variant="solid"
                        className="bg-green-600 hover:bg-green-700"
                        icon={<PiCheckCircleDuotone />}
                        onClick={() => handleChangeStatus('resolved')}
                        disabled={selectedTicket.status === 'resolved' || selectedTicket.status === 'closed'}
                      />

                      <Button
                        size="sm"
                        icon={<PiXCircleDuotone />}
                        onClick={() => handleChangeStatus('closed')}
                        disabled={selectedTicket.status === 'closed'}
                      />
                    </div>
                  </div>
                </div>

                {/* Área de mensajes con scroll */}
                <ScrollBar className="flex-1 min-h-0 bg-gray-50 dark:bg-gray-900" style={{ maxHeight: 'calc(600px - 180px)' }}>
                  <div className="p-4">
                    {selectedTicket.comments.length === 0 ? (
                      <div className="flex items-center justify-center min-h-[300px] text-gray-500">
                        <p className="text-sm">No hay mensajes aún. Envía el primer mensaje al cliente.</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {selectedTicket.comments.map((comment, index) => (
                          <div
                            key={index}
                            className={`flex ${comment.userRole === 'admin' ? 'justify-end' : 'justify-start'}`}
                          >
                            <div
                              className={`max-w-[70%] rounded-2xl px-4 py-3 ${
                                comment.userRole === 'admin'
                                  ? 'bg-indigo-600 text-white'
                                  : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-700'
                              }`}
                            >
                              <p className="text-xs font-semibold mb-1 opacity-90">
                                {comment.userName} {comment.userRole === 'admin' && '(Tú)'}
                              </p>
                              <p className="text-sm whitespace-pre-wrap">{comment.message}</p>
                              <p className={`text-xs mt-2 ${comment.userRole === 'admin' ? 'opacity-75' : 'text-gray-500'}`}>
                                {format(new Date(comment.timestamp), "dd/MM/yyyy HH:mm", { locale: es })}
                              </p>
                            </div>
                          </div>
                        ))}
                        <div ref={messagesEndRef} />
                      </div>
                    )}
                  </div>
                </ScrollBar>

                {/* Input de mensaje - siempre visible en la parte inferior */}
                {selectedTicket.status !== 'closed' && (
                  <div className="flex-shrink-0 p-3 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                    <div className="flex items-center gap-2">
                      <Input
                        type="text"
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Escribe tu mensaje..."
                        onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSendComment()}
                        className="flex-1 text-sm"
                        size="sm"
                      />
                      <Button
                        variant="solid"
                        size="sm"
                        icon={<PiPaperPlaneTiltDuotone />}
                        onClick={handleSendComment}
                        loading={sendingComment}
                        disabled={!newComment.trim()}
                      />
                    </div>
                  </div>
                )}
              </>
            )}
          </Card>
        </div>
      </div>
    </Container>
  )
}

export default AdminSupportPage
