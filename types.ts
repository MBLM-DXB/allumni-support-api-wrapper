/**
 * Support API Types
 * Contains type definitions for the support ticket system
 */

/**
 * Ticket status enum
 */
export enum TicketStatus {
  OPEN = 'open',
  CLOSED = 'closed',
  PENDING = 'pending',
  RESOLVED = 'resolved'
}

/**
 * Ticket priority enum
 */
export enum TicketPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent'
}

/**
 * Base Ticket interface containing common properties
 */
export interface Ticket {
  id: string;
  subject: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  userEmail: string;
  assignedTo?: string;
  createdAt: string;
  updatedAt: string;
  attachments?: TicketAttachment[];
}

/**
 * Ticket details including conversation history
 */
export interface TicketDetails extends Ticket {
  conversation: TicketMessage[];
  attachments?: TicketAttachment[];
}

/**
 * Ticket message in a conversation
 */
export interface TicketMessage {
  id: string;
  ticketId: string;
  message: string;
  sender: string; // Email of the sender
  isStaff: boolean; // Whether the sender is staff/admin
  createdAt: string;
  attachments?: TicketAttachment[];
}

/**
 * Ticket attachment
 */
export interface TicketAttachment {
  fileName: string;
  fileSize: number;
  fileType: string;
  createdOn: string;
  url: string;
}

/**
 * Create ticket request payload
 */
export interface CreateTicketRequest {
  subject: string;
  description: string;
  priority?: TicketPriority;
  userEmail: string;
  attachments?: File[];
  customFields?: Record<string, string>;
}

/**
 * Response to a ticket
 */
export interface TicketResponseRequest {
  ticketId: string;
  message: string;
  ccEmails?: string; // Comma-separated list of CC email addresses
  bccEmails?: string; // Comma-separated list of BCC email addresses
  agentEmail?: string; // Email of the agent responding to the ticket
  fromEmail?: string; // From email address for the response
  includePreviousCcs?: boolean; // Whether to notify previously added CC email addresses
  includePreviousMessages?: boolean; // Whether to include previous messages in the response
  attachments?: File[]; // Optional file attachments
}

/**
 * Update ticket request payload
 */
export interface UpdateTicketRequest {
  ticketId: string;
  status?: TicketStatus;
  priority?: TicketPriority;
  assignedTo?: string;
}

/**
 * Filter options for ticket queries
 */
export interface TicketFilterOptions {
  userEmail?: string;
  assignedTo?: string;
  status?: TicketStatus;
  priority?: TicketPriority;
  searchQuery?: string;
  page?: number;
  limit?: number;
  sortBy?: 'createdAt' | 'updatedAt' | 'priority';
  sortOrder?: 'asc' | 'desc';
  includeDescription?: boolean;
  includeCustomFields?: boolean;
}

/**
 * Paginated response for ticket listing
 */
export interface PaginatedTicketsResponse {
  tickets: Ticket[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * Raw Desk365 conversation object (API response)
 */
export interface Desk365Conversation {
  ticketNumber: number | string;
  createdBy: string;
  creatorName: string;
  type: string;
  senderType: string;
  publicNote: string | null;
  ccAddress: string | null;
  bccAddress: string | null;
  toAddress: string | null;
  notifiedAgents: string | null;
  body: string;
  bodyText: string;
  attachmentsCount: number;
  attachments: Desk365Attachment[];
  createdOn: string;
  isEmailDeliveribilityFailiure: boolean;
  emailBounceType: string | null;
  emailBouceStatus: string | null;
}

/**
 * Raw Desk365 attachment object (API response)
 */
export interface Desk365Attachment {
  id: string;
  fileName: string;
  fileSize: number;
  contentType: string;
  url: string;
}

/**
 * Normalized response for ticket conversations
 */
export interface TicketConversationResponse {
  count: number;
  agentReplyCount: number;
  contactReplyCount: number;
  publicNoteCount: number;
  privateNoteCount: number;
  forwardMessageCount: number;
  messages: TicketMessage[];
}

/**
 * Support API interface
 * Defines the methods that the support API wrapper must implement
 */
export interface SupportApiInterface {
  // User methods
  createTicket(request: CreateTicketRequest): Promise<Ticket>;
  listUserTickets(userEmail: string, options?: TicketFilterOptions): Promise<PaginatedTicketsResponse>;
  searchTickets(options: TicketFilterOptions): Promise<PaginatedTicketsResponse>;
  getTicketDetails(ticketId: string): Promise<TicketDetails>;
  respondToTicket(request: TicketResponseRequest): Promise<TicketMessage>;
  closeTicket(ticketId: string): Promise<Ticket>;
  reopenTicket(ticketId: string): Promise<Ticket>;
  getTicketConversations(ticketId: string): Promise<TicketMessage[]>;
  
  // Admin methods
  listAssignedTickets(adminEmail: string, options?: TicketFilterOptions): Promise<PaginatedTicketsResponse>;
  assignTicket(ticketId: string, assignTo: string): Promise<Ticket>;
  escalateTicket(ticketId: string, priority: TicketPriority): Promise<Ticket>;
  updateTicket(request: UpdateTicketRequest): Promise<Ticket>;
}
