import { useState, useEffect } from 'react'
import { apiClient } from '@/api/client'
import { ENDPOINTS } from '@/api/endpoints'
import type { 
  SupportTicket, 
  CreateSupportTicketRequest, 
  UpdateSupportTicketRequest,
  AddCommentRequest,
  SupportTicketStats 
} from '@/@types/entities'

export const useSupportTickets = (userId?: string, userRole?: string) => {
  const [tickets, setTickets] = useState<SupportTicket[]>([])
  const [stats, setStats] = useState<SupportTicketStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchTickets = async () => {
    try {
      setLoading(true)
      setError(null)

      let response
      if (userRole === 'admin') {
        // Admin ve todos los tickets
        response = await apiClient.get<SupportTicket[]>(ENDPOINTS.SUPPORT_TICKETS)
      } else if (userId) {
        // Usuario ve solo sus tickets
        response = await apiClient.get<SupportTicket[]>(ENDPOINTS.SUPPORT_TICKETS_BY_USER(userId))
      } else {
        setTickets([])
        setLoading(false)
        return
      }

      setTickets(response.data)
    } catch (err: any) {
      setError(err.message || 'Error al cargar tickets')
      console.error('Error fetching tickets:', err)
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const response = await apiClient.get<SupportTicketStats>(ENDPOINTS.SUPPORT_TICKET_STATS)
      setStats(response.data)
    } catch (err) {
      console.error('Error fetching ticket stats:', err)
    }
  }

  const createTicket = async (data: CreateSupportTicketRequest): Promise<SupportTicket> => {
    try {
      const response = await apiClient.post<SupportTicket>(ENDPOINTS.SUPPORT_TICKETS, data)
      await fetchTickets()
      if (userRole === 'admin') {
        await fetchStats()
      }
      return response.data
    } catch (err) {
      console.error('Error creating ticket:', err)
      throw err
    }
  }

  const updateTicket = async (id: string, data: UpdateSupportTicketRequest): Promise<SupportTicket> => {
    try {
      const response = await apiClient.patch<SupportTicket>(ENDPOINTS.SUPPORT_TICKET_BY_ID(id), data)
      await fetchTickets()
      if (userRole === 'admin') {
        await fetchStats()
      }
      return response.data
    } catch (err) {
      console.error('Error updating ticket:', err)
      throw err
    }
  }

  const addComment = async (id: string, comment: AddCommentRequest): Promise<SupportTicket> => {
    try {
      const response = await apiClient.post<SupportTicket>(
        ENDPOINTS.SUPPORT_TICKET_ADD_COMMENT(id), 
        comment
      )
      await fetchTickets()
      return response.data
    } catch (err) {
      console.error('Error adding comment:', err)
      throw err
    }
  }

  const assignTicket = async (id: string, adminId: string): Promise<SupportTicket> => {
    try {
      const response = await apiClient.patch<SupportTicket>(
        ENDPOINTS.SUPPORT_TICKET_ASSIGN(id, adminId),
        {}
      )
      await fetchTickets()
      await fetchStats()
      return response.data
    } catch (err) {
      console.error('Error assigning ticket:', err)
      throw err
    }
  }

  const deleteTicket = async (id: string): Promise<void> => {
    try {
      await apiClient.delete(ENDPOINTS.SUPPORT_TICKET_BY_ID(id))
      await fetchTickets()
      if (userRole === 'admin') {
        await fetchStats()
      }
    } catch (err) {
      console.error('Error deleting ticket:', err)
      throw err
    }
  }

  useEffect(() => {
    fetchTickets()
    if (userRole === 'admin') {
      fetchStats()
    }
  }, [userId, userRole])

  return {
    tickets,
    stats,
    loading,
    error,
    createTicket,
    updateTicket,
    addComment,
    assignTicket,
    deleteTicket,
    refetch: fetchTickets,
  }
}

export default useSupportTickets
