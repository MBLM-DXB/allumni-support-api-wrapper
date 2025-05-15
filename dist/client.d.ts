/**
 * Desk365 API Client
 * Implements the SupportApiInterface for Desk365
 */
import { CreateTicketRequest, PaginatedTicketsResponse, SupportApiInterface, Ticket, TicketDetails, TicketFilterOptions, TicketMessage, TicketPriority, TicketResponseRequest, UpdateTicketRequest } from './types';
/**
 * Configuration for the Desk365 API client
 */
export interface Desk365ClientConfig {
    baseUrl: string;
    apiKey: string;
    verbose?: boolean;
}
/**
 * Desk365 API Client implementation
 * Handles communication with the Desk365 API
 */
export declare class Desk365Client implements SupportApiInterface {
    private baseUrl;
    private headers;
    private verbose;
    private subdomain;
    /**
     * Creates a new Desk365 API client
     * @param config - Configuration for the client
     */
    constructor(config: Desk365ClientConfig);
    /**
     * Validates the API configuration by attempting to ping the API
     * @returns A result object with success status and message
     */
    validateConfig(): Promise<{
        success: boolean;
        message: string;
    }>;
    /**
     * Tests connectivity with the Desk365 API
     * @returns A success message if connection is successful
     */
    ping(): Promise<string>;
    /**
     * Direct ping using the exact endpoint from the API example
     * @returns A success message if the ping is successful
     */
    directPing(): Promise<string>;
    /**
     * Makes a request to the Desk365 API
     * @param endpoint - API endpoint
     * @param method - HTTP method
     * @param data - Request data
     * @param params - Query parameters
     * @returns Response data
     * @private
     */
    private request;
    /**
     * Creates a new support ticket
     * @param request - The ticket creation request
     * @returns The created ticket
     */
    createTicket(request: CreateTicketRequest): Promise<Ticket>;
    /**
     * Creates a new support ticket (alternative approach)
     * @param request - The ticket creation request
     * @returns The created ticket
     */
    createTicketAlt(request: CreateTicketRequest): Promise<Ticket>;
    /**
     * Lists tickets for a specific user
     * @param userEmail - The email of the user
     * @param options - Filter options
     * @returns Paginated list of tickets
     */
    listUserTickets(userEmail: string, options?: TicketFilterOptions): Promise<PaginatedTicketsResponse>;
    /**
     * Searches for tickets based on filter options
     * @param options - Filter options
     * @returns Paginated list of tickets
     */
    searchTickets(options: TicketFilterOptions): Promise<PaginatedTicketsResponse>;
    /**
     * Gets the details of a specific ticket
     * @param ticketId - The ID of the ticket
     * @returns The ticket details including conversation
     */
    getTicketDetails(ticketId: string): Promise<TicketDetails>;
    /**
     * Responds to a ticket
     * @param request - The response request
     * @returns The created ticket message
     */
    respondToTicket(request: TicketResponseRequest): Promise<TicketMessage>;
    /**
     * Responds to a ticket with attachments
     * @param request - The ticket response request
     * @param attachments - Array of file paths or file objects to attach
     * @returns The created ticket message
     */
    respondToTicketWithAttachments(request: TicketResponseRequest, attachments: Array<string | File>): Promise<TicketMessage>;
    /**
     * Adds a note to a ticket
     * @param ticketId - The ID of the ticket
     * @param note - The note content
     * @param isPrivate - Whether the note is private (defaults to true)
     * @param agentEmail - The email of the agent adding the note
     * @param notifyEmails - Comma-separated list of emails to notify
     * @returns The created note
     */
    addNoteToTicket(ticketId: string, note: string, isPrivate?: boolean, agentEmail?: string, notifyEmails?: string): Promise<any>;
    /**
     * Adds a note with attachments to a ticket
     * @param ticketId - The ID of the ticket
     * @param note - The note content
     * @param attachments - Array of file paths or file objects to attach
     * @param isPrivate - Whether the note is private (defaults to true)
     * @param agentEmail - The email of the agent adding the note
     * @param notifyEmails - Comma-separated list of emails to notify
     * @returns The created note
     */
    addNoteWithAttachmentsToTicket(ticketId: string, note: string, attachments: Array<string | File>, isPrivate?: boolean, agentEmail?: string, notifyEmails?: string): Promise<any>;
    /**
     * Closes a ticket
     * @param ticketId - The ID of the ticket to close
     * @returns The updated ticket
     */
    closeTicket(ticketId: string): Promise<Ticket>;
    /**
     * Reopens a closed ticket
     * @param ticketId - The ID of the ticket to reopen
     * @returns The updated ticket
     */
    reopenTicket(ticketId: string): Promise<Ticket>;
    /**
     * Lists tickets assigned to a specific admin
     * @param adminEmail - The email of the admin
     * @param options - Filter options
     * @returns Paginated list of tickets
     */
    listAssignedTickets(adminEmail: string, options?: TicketFilterOptions): Promise<PaginatedTicketsResponse>;
    /**
     * Assigns a ticket to a specific agent/admin
     * @param ticketId - The ID of the ticket
     * @param assignTo - The email of the agent to assign the ticket to
     * @returns The updated ticket
     */
    assignTicket(ticketId: string, assignTo: string): Promise<Ticket>;
    /**
     * Escalates a ticket by changing its priority
     * @param ticketId - The ID of the ticket
     * @param priority - The new priority
     * @returns The updated ticket
     */
    escalateTicket(ticketId: string, priority: TicketPriority): Promise<Ticket>;
    /**
     * Updates a ticket's properties
     * @param request - The update request
     * @returns The updated ticket
     */
    updateTicket(request: UpdateTicketRequest): Promise<Ticket>;
    /**
     * Retrieves all conversations for a specific ticket
     * Makes a GET request to /v3/tickets/conversations with the ticket_number as a parameter
     * @param ticketId - The ID of the ticket
     * @returns The list of conversations/messages for the ticket
     */
    getTicketConversations(ticketId: string): Promise<TicketMessage[]>;
    /**
     * Maps a Desk365 conversation object to our generic TicketMessage interface
     * @param deskConversation - The Desk365 conversation object
     * @returns The mapped TicketMessage
     * @private
     */
    private mapDeskConversationToTicketMessage;
    /**
     * Builds query parameters for filtering tickets
     * @param options - Filter options
     * @returns The query parameters
     * @private
     */
    private buildParams;
    /**
     * Maps a Desk365 ticket to our generic Ticket interface
     * @param deskTicket - The Desk365 ticket
     * @returns The mapped ticket
     * @private
     */
    private mapDeskTicketToTicket;
    /**
     * Maps a Desk365 ticket to our generic TicketDetails interface
     * @param deskTicket - The Desk365 ticket
     * @returns The mapped ticket details
     * @private
     */
    private mapDeskTicketToTicketDetails;
    /**
     * Maps a Desk365 message to our generic TicketMessage interface
     * @param deskMessage - The Desk365 message
     * @returns The mapped ticket message
     * @private
     */
    private mapDeskMessageToTicketMessage;
    /**
     * Maps a Desk365 attachment to our generic TicketAttachment interface
     * @param deskAttachment - The Desk365 attachment
     * @returns The mapped ticket attachment
     * @private
     */
    private mapDeskAttachmentToTicketAttachment;
    /**
     * Maps a Desk365 paginated response to our generic PaginatedTicketsResponse
     * @param deskResponse - The Desk365 paginated response
     * @param page - The current page number
     * @param limit - The number of items per page
     * @returns The mapped paginated response
     * @private
     */
    private mapDeskPaginatedResponseToPaginatedTicketsResponse;
    /**
     * Maps a Desk365 status to our generic TicketStatus
     * @param deskStatus - The Desk365 status
     * @returns The mapped status
     * @private
     */
    private mapDeskStatusToStatus;
    /**
     * Maps our generic TicketStatus to Desk365 status
     * @param status - Our generic status
     * @returns The Desk365 status
     * @private
     */
    private mapStatusToDesk365Status;
    /**
     * Maps a Desk365 priority to our generic TicketPriority
     * @param deskPriority - The Desk365 priority
     * @returns The mapped priority
     * @private
     */
    private mapDeskPriorityToPriority;
    /**
     * Maps our generic TicketPriority to Desk365 priority
     * @param priority - Our generic priority
     * @returns The Desk365 priority value
     * @private
     */
    private mapPriorityToDesk365Priority;
    /**
     * Gets information about available API endpoints
     * This can help debug API path issues
     */
    getApiInfo(): Promise<any>;
}
