export interface SupportTicket {
  _id: string
  userId: string | { _id: string; name: string; email: string; rut: string } // Puede ser populate
  homeId: string
  sensorId?: string
  subject: string
  description: string
  category: 'sensor_issue' | 'high_consumption' | 'leak_detection' | 'general_inquiry' | 'other'
  status: 'open' | 'in_progress' | 'resolved' | 'closed'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  assignedTo?: string
  attachments: string[]
  comments: TicketComment[]
  resolvedAt?: string
  closedAt?: string
  createdAt: string
  updatedAt: string
}

export interface TicketComment {
  userId: string
  userName: string
  userRole: string
  message: string
  timestamp: string
}

export interface CreateSupportTicketRequest {
  userId: string
  homeId: string
  sensorId?: string
  subject: string
  description: string
  category: 'sensor_issue' | 'high_consumption' | 'leak_detection' | 'general_inquiry' | 'other'
  priority?: 'low' | 'medium' | 'high' | 'urgent'
  attachments?: string[]
}

export interface UpdateSupportTicketRequest {
  subject?: string
  description?: string
  category?: 'sensor_issue' | 'high_consumption' | 'leak_detection' | 'general_inquiry' | 'other'
  status?: 'open' | 'in_progress' | 'resolved' | 'closed'
  priority?: 'low' | 'medium' | 'high' | 'urgent'
  assignedTo?: string
}

export interface AddCommentRequest {
  userId: string
  userName: string
  userRole: string
  message: string
}

export interface SupportTicketStats {
  total: number
  open: number
  inProgress: number
  resolved: number
  closed: number
  active: number
}
