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
import { apiClient } from '@/api/client'
import { ENDPOINTS } from '@/api/endpoints'
import {
  PiChatCircleDotsDuotone,
  PiPlusDuotone,
  PiClockDuotone,
  PiCheckCircleDuotone,
  PiWarningDuotone,
  PiPaperPlaneTiltDuotone,
} from 'react-icons/pi'
import type { Sensor, SupportTicket } from '@/@types/entities'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

const UserSupportPage = () => {
  const { currentUser } = useAquaTrackingAuth()
  const { tickets: fetchedTickets, loading, createTicket, addComment, refetch } = useSupportTickets(
    currentUser?._id,
    currentUser?.role
  )

  const [tickets, setTickets] = useState<SupportTicket[]>([])
  const [sensors, setSensors] = useState<Sensor[]>([])
  const [loadingSensors, setLoadingSensors] = useState(false)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null)
  const [newComment, setNewComment] = useState('')
  const [sendingComment, setSendingComment] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Form state para crear ticket
  const [formData, setFormData] = useState<{
    subject: string
    description: string
    category: 'sensor_issue' | 'sensor_maintenance_request' | 'high_consumption' | 'leak_detection' | 'general_inquiry' | 'other'
    priority: 'low' | 'medium' | 'high' | 'urgent'
    sensorId: string
  }>({
    subject: '',
    description: '',
    category: 'sensor_issue',
    priority: 'medium',
    sensorId: '',
  })
  const [creating, setCreating] = useState(false)

  // Sincronizar tickets del hook con estado local
  useEffect(() => {
    setTickets(fetchedTickets)
  }, [fetchedTickets])

  // No usar scroll automático en useEffect, lo haremos manualmente al enviar mensaje

  // Cargar sensores del hogar
  useEffect(() => {
    const fetchSensors = async () => {
      try {
        if (!currentUser?.homeId) return
        setLoadingSensors(true)
        const response = await apiClient.get<Sensor[]>(ENDPOINTS.SENSORS_BY_HOME(currentUser.homeId))
        setSensors(response.data)
      } catch (error) {
        console.error('Error fetching sensors:', error)
        toast.push(<Notification type="warning">No se pudieron cargar los sensores</Notification>)
      } finally {
        setLoadingSensors(false)
      }
    }

    fetchSensors()
  }, [currentUser?.homeId])

  const categoryOptions = [
    { value: 'sensor_issue', label: 'Problema con Sensor' },
    { value: 'sensor_maintenance_request', label: 'Solicitar Mantenimiento de Sensor' },
    { value: 'high_consumption', label: 'Consumo Elevado' },
    { value: 'leak_detection', label: 'Posible Fuga' },
    { value: 'general_inquiry', label: 'Consulta General' },
    { value: 'other', label: 'Otro' },
  ]

  const priorityOptions = [
    { value: 'low', label: 'Baja' },
    { value: 'medium', label: 'Media' },
    { value: 'high', label: 'Alta' },
    { value: 'urgent', label: 'Urgente' },
  ]

  const sensorOptions = [
    { value: '', label: 'Ninguno (No aplica)' },
    ...sensors.map((s) => ({
      value: s._id,
      label: `${s.subType} - ${s.location} (${s.status})`,
    })),
  ]

  const handleCreateTicket = async () => {
    if (!currentUser?._id || !currentUser?.homeId) {
      toast.push(
        <Notification type="danger">
          Error: No se pudo identificar el usuario. Intenta recargar la página.
        </Notification>
      )
      return
    }

    if (!formData.subject || !formData.description) {
      toast.push(
        <Notification type="warning">Completa todos los campos requeridos</Notification>
      )
      return
    }

    // Validar que si es mantenimiento, debe tener sensor
    if (formData.category === 'sensor_maintenance_request' && !formData.sensorId) {
      toast.push(
        <Notification type="warning">
          Debes seleccionar un sensor para solicitar mantenimiento
        </Notification>
      )
      return
    }

    try {
      setCreating(true)
      await createTicket({
        userId: currentUser._id,
        homeId: currentUser.homeId,
        sensorId: formData.sensorId || undefined,
        subject: formData.subject,
        description: formData.description,
        category: formData.category,
        priority: formData.priority,
      })

      toast.push(
        <Notification type="success">Ticket creado. Un técnico lo revisará pronto.</Notification>
      )

      setShowCreateDialog(false)
      setFormData({
        subject: '',
        description: '',
        category: 'sensor_issue',
        priority: 'medium',
        sensorId: '',
      })
      refetch()
    } catch (error: any) {
      console.error('Error creating ticket:', error)
      const errorMessage = error?.response?.data?.message || error?.message || 'Error al crear ticket'
      toast.push(
        <Notification type="danger">
          {errorMessage}
        </Notification>
      )
    } finally {
      setCreating(false)
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
        userRole: currentUser.role,
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
      setTickets((prevTickets: SupportTicket[]) =>
        prevTickets.map((t: SupportTicket) =>
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
      setTickets((prevTickets: SupportTicket[]) =>
        prevTickets.map((t: SupportTicket) =>
          t._id === response._id ? response : t
        )
      )
      
      // No mostrar toast para no interrumpir el chat
    } catch (error) {
      console.error('Error sending comment:', error)
      toast.push(<Notification type="danger">Error al enviar mensaje</Notification>)
      // Revertir el cambio optimista en caso de error
      setSelectedTicket(selectedTicket)
      setTickets((prevTickets: SupportTicket[]) =>
        prevTickets.map((t: SupportTicket) =>
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

  const getPriorityBadge = (priority: string) => {
    const badges = {
      low: <Badge content="Baja" className="bg-slate-100 text-slate-700 text-xs px-2 py-1" />,
      medium: <Badge content="Media" className="bg-blue-100 text-blue-700 text-xs px-2 py-1" />,
      high: <Badge content="Alta" className="bg-orange-100 text-orange-700 text-xs px-2 py-1" />,
      urgent: <Badge content="Urgente" className="bg-red-100 text-red-700 text-xs px-2 py-1" />,
    }
    return badges[priority as keyof typeof badges] || badges.medium
  }

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      sensor_issue: 'Problema con Sensor',
      sensor_maintenance_request: 'Solicitar Mantenimiento',
      high_consumption: 'Consumo Alto',
      leak_detection: 'Posible Fuga',
      general_inquiry: 'Consulta General',
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
            <p className="text-gray-600 dark:text-gray-400">Cargando tickets de soporte...</p>
          </div>
        </div>
      </Container>
    )
  }

  if (!currentUser?.homeId) {
    return (
      <Container>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center max-w-md">
            <div className="w-16 h-16 mx-auto mb-4 bg-amber-100 rounded-full flex items-center justify-center">
              <PiWarningDuotone className="text-4xl text-amber-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
              Configuración Pendiente
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Tu cuenta no está asociada a un hogar aún. Contacta al administrador para completar la configuración.
            </p>
          </div>
        </div>
      </Container>
    )
  }

  return (
    <Container>
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <Button 
            variant="solid" 
            icon={<PiPlusDuotone />} 
            onClick={() => setShowCreateDialog(true)}
            title="Crear un nuevo ticket de soporte - Describe tu problema y recibe ayuda"
          >
            Nuevo Ticket
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <div className="flex items-center gap-4">
            <div className="bg-blue-100 text-blue-600 p-3 rounded-lg">
              <PiChatCircleDotsDuotone className="text-2xl" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Tickets</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{tickets.length}</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-4">
            <div className="bg-amber-100 text-amber-600 p-3 rounded-lg">
              <PiClockDuotone className="text-2xl" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">En Proceso</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {tickets.filter((t) => t.status === 'open' || t.status === 'in_progress').length}
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-4">
            <div className="bg-green-100 text-green-600 p-3 rounded-lg">
              <PiCheckCircleDuotone className="text-2xl" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Resueltos</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {tickets.filter((t) => t.status === 'resolved' || t.status === 'closed').length}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Layout estilo Chat - 2 columnas */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Columna izquierda: Lista de tickets */}
        <div className="col-span-1 lg:col-span-4 xl:col-span-3">
          <Card className="h-[600px] flex flex-col">
            {/* Header */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <h4 className="font-semibold text-gray-900 dark:text-gray-100">Mis Tickets</h4>
            </div>

            {/* Lista scrolleable */}
            <ScrollBar className="flex-1">
              {tickets.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <PiChatCircleDotsDuotone className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                  <p className="text-sm mb-2">No tienes tickets de soporte activos</p>
                  <p className="text-xs">Usa el botón "Nuevo Ticket" arriba para crear uno</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                  {tickets.map((ticket) => (
                    <div
                      key={ticket._id}
                      className={`p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${
                        selectedTicket?._id === ticket._id ? 'bg-indigo-50 dark:bg-indigo-900/20' : ''
                      }`}
                      onClick={() => setSelectedTicket(ticket)}
                    >
                      <div className="flex items-start gap-3">
                        <Avatar className="bg-indigo-200 text-indigo-700" size={40}>
                          {ticket.subject.slice(0, 2).toUpperCase()}
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className="font-semibold text-sm text-gray-900 dark:text-gray-100 truncate">
                              {ticket.subject}
                            </h4>
                            {getStatusBadge(ticket.status)}
                          </div>
                          <p className="text-xs text-gray-600 dark:text-gray-400 mb-1 line-clamp-2">
                            {ticket.description}
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            {getPriorityBadge(ticket.priority)}
                            <span className="text-xs text-gray-500">
                              {format(new Date(ticket.createdAt), "dd 'de' MMM", { locale: es })}
                            </span>
                          </div>
                        </div>
                      </div>
                      {ticket.comments.length > 0 && (
                        <div className="mt-2 ml-11">
                          <Badge content={`${ticket.comments.length} mensajes`} className="text-xs bg-gray-100 text-gray-700 px-2 py-1" />
                        </div>
                      )}
                    </div>
                  ))}
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
                  <p className="mb-2">Selecciona un ticket para ver la conversación</p>
                  <p className="text-xs">o crea uno nuevo usando el botón arriba</p>
                </div>
              </div>
            ) : (
              <>
                {/* Header del chat - compacto */}
                <div className="flex-shrink-0 p-3 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                  <div className="flex items-start justify-between">
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
                        {getPriorityBadge(selectedTicket.priority)}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Área de mensajes con scroll */}
                <ScrollBar className="flex-1 min-h-0 bg-gray-50 dark:bg-gray-900" style={{ maxHeight: 'calc(600px - 180px)' }}>
                  <div className="p-4">
                    {selectedTicket.comments.length === 0 ? (
                      <div className="flex items-center justify-center min-h-[300px] text-gray-500">
                        <div className="text-center">
                          <p className="text-sm">No hay mensajes aún.</p>
                          <p className="text-xs mt-2">Escribe un mensaje para comunicarte con soporte.</p>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {selectedTicket.comments.map((comment, index) => (
                          <div
                            key={index}
                            className={`flex ${comment.userRole === 'user' ? 'justify-end' : 'justify-start'}`}
                          >
                            <div
                              className={`max-w-[70%] rounded-2xl px-4 py-3 ${
                                comment.userRole === 'user'
                                  ? 'bg-indigo-600 text-white'
                                  : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-700'
                              }`}
                            >
                              <p className="text-xs font-semibold mb-1 opacity-90">
                                {comment.userName} {comment.userRole === 'user' ? '(Tú)' : '(Soporte)'}
                              </p>
                              <p className="text-sm whitespace-pre-wrap">{comment.message}</p>
                              <p className={`text-xs mt-2 ${comment.userRole === 'user' ? 'opacity-75' : 'text-gray-500'}`}>
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
                {selectedTicket.status !== 'closed' ? (
                  <div className="flex-shrink-0 p-3 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                    <div className="flex items-center gap-2">
                      <Input
                        type="text"
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Escribe tu mensaje... (Presiona Enter para enviar)"
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
                        title="Enviar mensaje al equipo de soporte"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="flex-shrink-0 p-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-center">
                    <p className="text-sm text-gray-500">Este ticket está cerrado.</p>
                  </div>
                )}
              </>
            )}
          </Card>
        </div>
      </div>

      {/* Dialog para crear ticket - Mantener el original con el formulario */}
      {showCreateDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h5 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                Crear Ticket de Soporte
              </h5>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Asunto <span className="text-red-500">*</span>
                  </label>
                  <p className="text-xs text-gray-500 mb-1">
                    Resumen breve del problema (ej: "Sensor sin señal", "Consumo muy elevado")
                  </p>
                  <Input
                    type="text"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    placeholder="Ej: Sensor de ducha sin señal"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Categoría
                  </label>
                  <p className="text-xs text-gray-500 mb-1">
                    Selecciona la categoría que mejor describa tu problema
                  </p>
                  <Select
                    options={categoryOptions}
                    value={categoryOptions.find((opt) => opt.value === formData.category)}
                    onChange={(option: any) => {
                      setFormData({ ...formData, category: option.value, sensorId: '' })
                    }}
                  />
                </div>

                {(formData.category === 'sensor_issue' || formData.category === 'sensor_maintenance_request') && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Sensor afectado {formData.category === 'sensor_maintenance_request' && <span className="text-red-500">*</span>}
                    </label>
                    <p className="text-xs text-gray-500 mb-1">
                      {formData.category === 'sensor_maintenance_request' 
                        ? 'IMPORTANTE: El sensor seleccionado dejará de enviar datos hasta que se complete el mantenimiento'
                        : 'Selecciona el sensor que presenta problemas (opcional)'}
                    </p>
                    {loadingSensors ? (
                      <div className="text-sm text-gray-500 py-2">Cargando sensores...</div>
                    ) : sensors.length === 0 ? (
                      <div className="text-sm text-gray-500 py-2">
                        No se encontraron sensores en tu hogar
                      </div>
                    ) : (
                      <Select
                        options={sensorOptions}
                        value={sensorOptions.find((opt) => opt.value === formData.sensorId)}
                        onChange={(option: any) => setFormData({ ...formData, sensorId: option.value })}
                        placeholder="Selecciona un sensor..."
                      />
                    )}
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Prioridad
                  </label>
                  <p className="text-xs text-gray-500 mb-1">
                    Urgente: Requiere atención inmediata | Alta: Importante pero no urgente | Media/Baja: Puede esperar
                  </p>
                  <Select
                    options={priorityOptions}
                    value={priorityOptions.find((opt) => opt.value === formData.priority)}
                    onChange={(option: any) => setFormData({ ...formData, priority: option.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Descripción <span className="text-red-500">*</span>
                  </label>
                  <p className="text-xs text-gray-500 mb-1">
                    Explica el problema con el mayor detalle posible. Incluye cuándo comenzó y qué has intentado.
                  </p>
                  <Input
                    textArea
                    value={formData.description}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    placeholder="Describe el problema detalladamente..."
                    rows={4}
                  />
                </div>
              </div>

              <div className="flex gap-2 justify-end mt-6">
                <Button 
                  variant="plain" 
                  onClick={() => setShowCreateDialog(false)}
                  title="Cancelar y cerrar el formulario"
                >
                  Cancelar
                </Button>
                <Button 
                  variant="solid" 
                  loading={creating} 
                  onClick={handleCreateTicket}
                  title="Crear ticket de soporte - Nuestro equipo lo revisará pronto"
                >
                  Crear Ticket
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </Container>
  )
}

export default UserSupportPage
