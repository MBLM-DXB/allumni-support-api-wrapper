/**
 * Support API Types
 * Contains type definitions for the support ticket system
 */
/**
 * Ticket status enum
 */
export declare enum TicketStatus {
    OPEN = "open",
    CLOSED = "closed",
    PENDING = "pending",
    RESOLVED = "resolved"
}
/**
 * Ticket priority enum
 */
export declare enum TicketPriority {
    LOW = "low",
    MEDIUM = "medium",
    HIGH = "high",
    URGENT = "urgent"
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
    sender: string;
    isStaff: boolean;
    createdAt: string;
    attachments?: TicketAttachment[];
}
/**
 * Ticket attachment
 */
export interface TicketAttachment {
    id: string;
    fileName: string;
    fileSize: number;
    contentType: string;
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
    ccEmails?: string;
    bccEmails?: string;
    agentEmail?: string;
    fromEmail?: string;
    includePreviousCcs?: boolean;
    includePreviousMessages?: boolean;
    attachments?: File[];
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
    ticket_number: number | string;
    created_by: string;
    creator_name: string;
    type: string;
    sender_type: string;
    public_note: string | null;
    cc_address: string | null;
    bcc_address: string | null;
    to_address: string | null;
    notified_agents: string | null;
    body: string;
    body_text: string;
    attachements_count: number;
    attachements: Desk365Attachment[];
    created_on: string;
    is_email_deliveribility_failiure: boolean;
    email_bounce_type: string | null;
    email_bouce_status: string | null;
}
/**
 * Raw Desk365 attachment object (API response)
 */
export interface Desk365Attachment {
    id: string;
    filename: string;
    size: number;
    content_type: string;
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
    createTicket(request: CreateTicketRequest): Promise<Ticket>;
    listUserTickets(userEmail: string, options?: TicketFilterOptions): Promise<PaginatedTicketsResponse>;
    searchTickets(options: TicketFilterOptions): Promise<PaginatedTicketsResponse>;
    getTicketDetails(ticketId: string): Promise<TicketDetails>;
    respondToTicket(request: TicketResponseRequest): Promise<TicketMessage>;
    closeTicket(ticketId: string): Promise<Ticket>;
    reopenTicket(ticketId: string): Promise<Ticket>;
    getTicketConversations(ticketId: string): Promise<TicketMessage[]>;
    listAssignedTickets(adminEmail: string, options?: TicketFilterOptions): Promise<PaginatedTicketsResponse>;
    assignTicket(ticketId: string, assignTo: string): Promise<Ticket>;
    escalateTicket(ticketId: string, priority: TicketPriority): Promise<Ticket>;
    updateTicket(request: UpdateTicketRequest): Promise<Ticket>;
}
