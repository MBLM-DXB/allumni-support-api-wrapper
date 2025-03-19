/**
 * Desk365 API Client
 * Implements the SupportApiInterface for Desk365
 */

import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';
import {
  CreateTicketRequest,
  PaginatedTicketsResponse,
  SupportApiInterface,
  Ticket,
  TicketDetails,
  TicketFilterOptions,
  TicketMessage,
  TicketPriority,
  TicketResponseRequest,
  UpdateTicketRequest,
  TicketStatus
} from './types';

/**
 * Configuration for the Desk365 API client
 */
export interface Desk365ClientConfig {
  baseUrl: string;
  apiKey: string;
  verbose?: boolean; // Option to control logging verbosity
}

/**
 * Desk365 API Client implementation
 * Handles communication with the Desk365 API
 */
export class Desk365Client implements SupportApiInterface {
  private baseUrl: string;
  private headers: Record<string, string>;
  private verbose: boolean;
  private subdomain: string;

  /**
   * Creates a new Desk365 API client
   * @param config - Configuration for the client
   */
  constructor(config: Desk365ClientConfig) {
    this.baseUrl = config.baseUrl;
    this.headers = {
      'Content-Type': 'application/json',
      'Authorization': config.apiKey
    };
    this.verbose = config.verbose || false;
    
    // Extract subdomain from baseUrl for error messages
    try {
      const url = new URL(config.baseUrl);
      const hostParts = url.hostname.split('.');
      this.subdomain = hostParts[0];
    } catch (error) {
      this.subdomain = 'unknown';
    }
  }

  /**
   * Validates the API configuration by attempting to ping the API
   * @returns A result object with success status and message
   */
  async validateConfig(): Promise<{ success: boolean; message: string }> {
    try {
      // Try to list tickets as a simple validation
      await this.request('/tickets', 'GET', undefined, { ticket_count: 1 });
      return { 
        success: true, 
        message: `Successfully connected to Desk365 API with subdomain '${this.subdomain}'` 
      };
    } catch (error) {
      let message = 'Failed to validate Desk365 API configuration';
      
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError;
        
        if (axiosError.response?.status === 403) {
          message = `Authentication failed: API key may not be valid for subdomain '${this.subdomain}'. Desk365 API keys are tied to specific subdomains.`;
        } else if (axiosError.response) {
          message = `API error: ${axiosError.response.status} ${axiosError.response.statusText}`;
        } else if (axiosError.code === 'ENOTFOUND') {
          message = `Could not connect to Desk365 API: The subdomain '${this.subdomain}' may not exist or is not reachable.`;
        }
      }
      
      return { success: false, message };
    }
  }

  /**
   * Tests connectivity with the Desk365 API
   * @returns A success message if connection is successful
   */
  async ping(): Promise<string> {
    try {
      // Try to validate configuration first
      const validation = await this.validateConfig();
      if (!validation.success) {
        throw new Error(validation.message);
      }
      
      return `Connected to Desk365 API at ${this.baseUrl}`;
    } catch (error) {
      console.error('Failed to ping Desk365 API:', error);
      throw error;
    }
  }

  /**
   * Direct ping using the exact endpoint from the API example
   * @returns A success message if the ping is successful
   */
  async directPing(): Promise<string> {
    try {
      // Use the exact ping endpoint from the curl example
      const response = await axios({
        method: 'GET',
        url: `${this.baseUrl}/v3/ping`,
        headers: this.headers
      });
      
      console.log('Ping response status:', response.status);
      if (this.verbose) {
        console.log('Ping response data:', response.data);
      }
      
      return `Successfully pinged Desk365 API at ${this.baseUrl}/v3/ping`;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        console.error(`Ping error: HTTP ${error.response.status} ${error.response.statusText}`);
        if (this.verbose && error.response.data) {
          console.error('Response data:', error.response.data);
        }
      } else {
        console.error('Ping error:', error instanceof Error ? error.message : String(error));
      }
      throw error;
    }
  }

  /**
   * Makes a request to the Desk365 API
   * @param endpoint - API endpoint
   * @param method - HTTP method
   * @param data - Request data
   * @param params - Query parameters
   * @returns Response data
   * @private
   */
  private async request<T>(
    endpoint: string,
    method: string = 'GET',
    data?: any,
    params?: Record<string, any>
  ): Promise<T> {
    // Ensure endpoint starts with /v3/
    if (!endpoint.startsWith('/v3/')) {
      endpoint = `/v3${endpoint}`;
    }
    
    // Build URL
    const url = `${this.baseUrl}${endpoint}`;

    // Prepare request options
    const config: AxiosRequestConfig = {
      method,
      url,
      headers: this.headers,
      params
    };

    // Add data for non-GET requests
    if (data && method !== 'GET') {
      config.data = data;
    }

    // Minimized logging for non-verbose mode
    if (!this.verbose) {
      console.log(`📤 ${method} ${endpoint}`);
    } else {
      console.log(`📤 Making ${method} request to ${endpoint}`);
      console.log('Request parameters:', params);
      if (data) console.log('Request data:', JSON.stringify(data, null, 2));
    }

    try {
      const response: AxiosResponse<T> = await axios(config);
      
      if (!this.verbose) {
        console.log(`📥 Response: ${response.status} ${response.statusText}`);
      } else {
        console.log(`📥 Response status: ${response.status}`);
      }
      
      return response.data;
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError;
        
        // Concise error logging for non-verbose mode
        if (!this.verbose) {
          console.error(`📛 Error: ${axiosError.response?.status} ${axiosError.response?.statusText}`);
          if (axiosError.response?.data) {
            console.error('Response:', typeof axiosError.response.data === 'object' ? 
              JSON.stringify(axiosError.response.data) : 
              axiosError.response.data);
          }
        } else {
          console.error('📛 Request error details:', {
            url: config.url,
            method: config.method,
            headers: config.headers,
            params: config.params,
            data: config.data
          });
          
          if (axiosError.response) {
            console.error('📛 Response error details:', {
              status: axiosError.response.status,
              statusText: axiosError.response.statusText,
              data: axiosError.response.data
            });
          }
        }
        
        if (axiosError.response) {
          const errorData = axiosError.response.data as { message?: string, error?: string } || { message: 'Unknown error' };
          throw new Error(`Desk365 API Error: ${errorData.message || errorData.error || axiosError.response.statusText}`);
        } else if (axiosError.request) {
          console.error('📛 No response received', axiosError.request);
          throw new Error('Desk365 API Error: No response received from server');
        }
      }
      console.error('Desk365 API Error:', error);
      throw error;
    }
  }

  /**
   * Creates a new support ticket
   * @param request - The ticket creation request
   * @returns The created ticket
   */
  async createTicket(request: CreateTicketRequest): Promise<Ticket> {
    // Map our generic request to Desk365 specific format
    const desk365Request = {
      subject: request.subject,
      description: request.description,
      priority: this.mapPriorityToDesk365Priority(request.priority) || 5, // Medium = 5 in Desk365
      contact_email: request.userEmail,
      email: request.userEmail, // Add email field which appears to be required
      // Handle attachments if needed
    };

    try {
      // Use the tickets endpoint with GET method (since POST isn't supported)
      // Add query parameter for creating a ticket
      const params: Record<string, any> = {
        action: 'create',
        ...desk365Request
      };
      
      if (this.verbose) {
        console.log(`Making GET request to /v3/tickets with create action`);
        console.log('Request parameters:', params);
      } else {
        console.log(`📤 GET /v3/tickets (create action)`);
      }
      
      // Make request using GET method with query parameters
      const response = await this.request('/tickets', 'GET', undefined, params);
      
      // Log response for debugging
      console.log('Create ticket response:', JSON.stringify(response, null, 2));
      
      if (this.verbose) {
        console.log('Response data:', response);
      }
      
      // After creating the ticket, list tickets to get the newly created one
      const tickets = await this.listUserTickets(request.userEmail, { limit: 30 });
      
      if (tickets.tickets.length > 0) {
        // Assume the most recently created ticket is the first one
        const createdTicket = tickets.tickets[0];
        console.log(`Found ticket with ID: ${createdTicket.id}`);
        return createdTicket;
      }
      
      // If no tickets found, create a default ticket object with what we know
      return {
        id: 'unknown',
        subject: request.subject,
        description: request.description,
        status: 'OPEN' as any,
        priority: request.priority || TicketPriority.MEDIUM,
        userEmail: request.userEmail,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
    } catch (error: unknown) {
      // Concise error logging
      if (axios.isAxiosError(error) && error.response) {
        const status = error.response.status;
        const statusText = error.response.statusText;
        const allowedMethods = error.response.headers?.allow;
        
        console.error(`Create ticket error: HTTP ${status} ${statusText}`);
        
        if (allowedMethods) {
          console.error(`Allowed methods: ${allowedMethods}`);
        }
        
        // Only log detailed data in verbose mode
        if (this.verbose && error.response.data) {
          console.error('Response data:', 
            typeof error.response.data === 'object' 
              ? JSON.stringify(error.response.data, null, 2) 
              : error.response.data.substring(0, 200)
          );
        }
      } else {
        // Handle non-Axios errors
        console.error('Create ticket error:', error instanceof Error ? error.message : String(error));
      }
      
      throw error;
    }
  }

  /**
   * Creates a new support ticket (alternative approach)
   * @param request - The ticket creation request
   * @returns The created ticket
   */
  async createTicketAlt(request: CreateTicketRequest): Promise<Ticket> {
    try {
      // Try listing tickets first to ensure we're authenticated
      const tickets = await this.listUserTickets(request.userEmail, { limit: 1 });
      
      // If we can list tickets, try the tickets/create endpoint with GET method
      if (this.verbose) {
        console.log(`Attempting alternative ticket creation for user ${request.userEmail}`);
      }
      
      // Build parameters for the GET request
      const params = {
        subject: request.subject,
        description: request.description,
        priority: this.mapPriorityToDesk365Priority(request.priority) || 5,
        email: request.userEmail,
        contact_email: request.userEmail,
        type: "Question",
        source: "6" // Support Portal=6 according to docs
      };
      
      if (this.verbose) {
        console.log('Request parameters:', params);
      } else {
        console.log(`📤 GET /v3/tickets/create (query params)`);
      }
      
      // Make a GET request to the tickets/create endpoint with query parameters
      const response = await this.request('/tickets/create', 'GET', undefined, params);
      
      if (this.verbose) {
        console.log('Response data:', response);
      }
      
      return this.mapDeskTicketToTicket(response);
    } catch (error: unknown) {
      // Concise error logging
      if (axios.isAxiosError(error) && error.response) {
        const status = error.response.status;
        const statusText = error.response.statusText;
        const allowedMethods = error.response.headers?.allow;
        
        console.error(`Create ticket (alt) error: HTTP ${status} ${statusText}`);
        
        if (allowedMethods) {
          console.error(`Allowed methods: ${allowedMethods}`);
        }
        
        // Only log detailed data in verbose mode
        if (this.verbose && error.response.data) {
          console.error('Response data:', 
            typeof error.response.data === 'object' 
              ? JSON.stringify(error.response.data, null, 2) 
              : error.response.data.substring(0, 200)
          );
        }
      } else {
        // Handle non-Axios errors
        console.error('Create ticket alternative approach error:', error instanceof Error ? error.message : String(error));
      }
      
      throw error;
    }
  }

  /**
   * Lists tickets for a specific user
   * @param userEmail - The email of the user
   * @param options - Filter options
   * @returns Paginated list of tickets
   */
  async listUserTickets(userEmail: string, options?: TicketFilterOptions): Promise<PaginatedTicketsResponse> {
    const filters = {
      contact: [userEmail]
    };
    
    const params = {
      ...this.buildParams(options),
      filters: JSON.stringify(filters)
    };

    const response = await this.request('/tickets', 'GET', undefined, params);
    
    return this.mapDeskPaginatedResponseToPaginatedTicketsResponse(response);
  }

  /**
   * Searches for tickets based on filter options
   * @param options - Filter options
   * @returns Paginated list of tickets
   */
  async searchTickets(options: TicketFilterOptions): Promise<PaginatedTicketsResponse> {
    const filters: Record<string, any> = {};
    
    if (options.userEmail) {
      filters.contact = [options.userEmail];
    }
    
    if (options.assignedTo) {
      filters.assigned_to = [options.assignedTo];
    }
    
    if (options.status) {
      filters.status = [this.mapStatusToDesk365Status(options.status)];
    }
    
    if (options.priority) {
      filters.priority = [this.mapPriorityToDesk365Priority(options.priority).toString()];
    }
    
    const params = {
      ...this.buildParams(options),
      filters: Object.keys(filters).length > 0 ? JSON.stringify(filters) : undefined
    };
    
    const response = await this.request('/tickets', 'GET', undefined, params);
    
    return this.mapDeskPaginatedResponseToPaginatedTicketsResponse(response);
  }

  /**
   * Gets the details of a specific ticket
   * @param ticketId - The ID of the ticket
   * @returns The ticket details including conversation
   */
  async getTicketDetails(ticketId: string): Promise<TicketDetails> {
    const response = await this.request('/tickets/details', 'GET', undefined, {
      ticket_number: ticketId
    });
    
    return this.mapDeskTicketToTicketDetails(response);
  }

  /**
   * Responds to a ticket
   * @param request - The response request
   * @returns The created ticket message
   */
  async respondToTicket(request: TicketResponseRequest): Promise<TicketMessage> {
    // According to the API docs, this should be a POST request
    // with ticket_number as a query param and a JSON body
    const queryParams = {
      ticket_number: request.ticketId
    };
    
    // Prepare the request body according to the API documentation
    const requestBody = {
      body: request.message,
      // Include other optional fields if they are provided in the request
      cc_emails: request.ccEmails,
      bcc_emails: request.bccEmails,
      agent_email: request.agentEmail,
      from_email: request.fromEmail,
      include_prev_ccs: request.includePreviousCcs ? 1 : 0,
      include_prev_messages: request.includePreviousMessages ? 1 : 0
    };
    
    // Make a POST request to the add_reply endpoint
    if (this.verbose) {
      console.log('Making POST request to /v3/tickets/add_reply');
      console.log('Request body:', JSON.stringify(requestBody, null, 2));
    } else {
      console.log(`📤 POST /v3/tickets/add_reply`);
    }
    
    const response = await this.request('/tickets/add_reply', 'POST', requestBody, queryParams);
    
    if (this.verbose) {
      console.log('Response data:', response);
    }
    
    return this.mapDeskMessageToTicketMessage(response);
  }

  /**
   * Responds to a ticket with attachments
   * @param request - The ticket response request
   * @param attachments - Array of file paths or file objects to attach
   * @returns The created ticket message
   */
  async respondToTicketWithAttachments(
    request: TicketResponseRequest, 
    attachments: Array<string | File>
  ): Promise<TicketMessage> {
    const url = `${this.baseUrl}/v3/tickets/add_reply_with_attachment`;
    
    // Create a FormData object for multipart/form-data request
    const formData = new FormData();
    
    // Add ticket number
    formData.append('ticket_number', request.ticketId.toString());
    
    // Prepare the reply object according to the API documentation
    const replyObject = {
      body: request.message,
      cc_emails: request.ccEmails,
      bcc_emails: request.bccEmails,
      agent_email: request.agentEmail,
      from_email: request.fromEmail,
      include_prev_ccs: request.includePreviousCcs ? 1 : 0,
      include_prev_messages: request.includePreviousMessages ? 1 : 0
    };
    
    // Add the reply object as JSON string
    formData.append('reply_object', JSON.stringify(replyObject));
    
    // Check if we're in a Node.js environment
    const isNode = typeof process !== 'undefined' && process.versions && process.versions.node;
    
    // Add the attachments
    for (const attachment of attachments) {
      if (typeof attachment === 'string') {
        if (isNode) {
          try {
            // We're in Node.js, so we can use fs to read the file
            // Need to dynamically import these to avoid browser compatibility issues
            const fs = require('fs');
            const path = require('path');
            const { Blob } = require('buffer');
            
            if (!fs.existsSync(attachment)) {
              console.error(`File not found: ${attachment}`);
              continue;
            }
            
            const fileBuffer = fs.readFileSync(attachment);
            const fileName = path.basename(attachment);
            
            // Create a Blob from the file data
            const fileBlob = new Blob([fileBuffer]);
            
            // Add file to FormData with the original filename
            formData.append('files', fileBlob, fileName);
            
            if (this.verbose) {
              console.log(`Added file: ${fileName} (${fileBuffer.length} bytes)`);
            }
          } catch (err) {
            console.error(`Error processing file ${attachment}:`, err);
          }
        } else {
          console.warn('File path attachments are only supported in Node.js environments');
        }
      } else {
        // If attachment is a File object, add it directly
        formData.append('files', attachment);
        
        if (this.verbose) {
          console.log(`Added file: ${attachment.name} (${attachment.size} bytes)`);
        }
      }
    }
    
    if (this.verbose) {
      console.log('Making POST request to /v3/tickets/add_reply_with_attachment');
      console.log('FormData contains:', 
        `ticket_number: ${request.ticketId}`,
        `reply_object: ${JSON.stringify(replyObject, null, 2)}`,
        `${attachments.length} file(s)`
      );
    } else {
      console.log(`📤 POST /v3/tickets/add_reply_with_attachment (${attachments.length} file(s))`);
    }
    
    try {
      // Use axios directly for this request due to FormData handling
      const response = await axios.post(url, formData, {
        headers: {
          ...this.headers,
          'Content-Type': 'multipart/form-data'
        }
      });
      
      if (this.verbose) {
        console.log(`📥 Response status: ${response.status}`);
        console.log('Response data:', response.data);
      } else {
        console.log(`📥 Response: ${response.status} ${response.statusText}`);
      }
      
      return this.mapDeskMessageToTicketMessage(response.data);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        console.error(`📛 Error: ${error.response.status} ${error.response.statusText}`);
        if (error.response.data) {
          console.error('Response:', typeof error.response.data === 'object' ? 
            JSON.stringify(error.response.data) : 
            error.response.data);
        }
        
        throw new Error(`Desk365 API Error: ${error.response.statusText || error.message}`);
      }
      
      console.error('Error responding to ticket with attachments:', error);
      throw error;
    }
  }

  /**
   * Adds a note to a ticket
   * @param ticketId - The ID of the ticket
   * @param note - The note content
   * @param isPrivate - Whether the note is private (defaults to true)
   * @param agentEmail - The email of the agent adding the note
   * @param notifyEmails - Comma-separated list of emails to notify
   * @returns The created note
   */
  async addNoteToTicket(
    ticketId: string,
    note: string,
    isPrivate: boolean = true,
    agentEmail?: string,
    notifyEmails?: string
  ): Promise<any> {
    const queryParams = {
      ticket_number: ticketId
    };
    
    const requestBody = {
      body: note,
      agent_email: agentEmail,
      notify_emails: notifyEmails,
      private_note: isPrivate ? 1 : 0
    };
    
    if (this.verbose) {
      console.log('Making POST request to /v3/tickets/add_note');
      console.log('Request body:', JSON.stringify(requestBody, null, 2));
    } else {
      console.log(`📤 POST /v3/tickets/add_note`);
    }
    
    const response = await this.request('/tickets/add_note', 'POST', requestBody, queryParams);
    
    if (this.verbose) {
      console.log('Response data:', response);
    }
    
    return response;
  }

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
  async addNoteWithAttachmentsToTicket(
    ticketId: string,
    note: string,
    attachments: Array<string | File>,
    isPrivate: boolean = true,
    agentEmail?: string,
    notifyEmails?: string
  ): Promise<any> {
    const url = `${this.baseUrl}/v3/tickets/add_note_with_attachment`;
    
    // Create a FormData object for multipart/form-data request
    const formData = new FormData();
    
    // Add ticket number
    formData.append('ticket_number', ticketId);
    
    // Prepare the note object according to the API documentation
    const noteObject = {
      body: note,
      agent_email: agentEmail,
      notify_emails: notifyEmails,
      private_note: isPrivate ? 1 : 0
    };
    
    // Add the note object as JSON string
    formData.append('note_object', JSON.stringify(noteObject));
    
    // Check if we're in a Node.js environment
    const isNode = typeof process !== 'undefined' && process.versions && process.versions.node;
    
    // Add the attachments
    for (const attachment of attachments) {
      if (typeof attachment === 'string') {
        if (isNode) {
          try {
            // We're in Node.js, so we can use fs to read the file
            // Need to dynamically import these to avoid browser compatibility issues
            const fs = require('fs');
            const path = require('path');
            const { Blob } = require('buffer');
            
            if (!fs.existsSync(attachment)) {
              console.error(`File not found: ${attachment}`);
              continue;
            }
            
            const fileBuffer = fs.readFileSync(attachment);
            const fileName = path.basename(attachment);
            
            // Create a Blob from the file data
            const fileBlob = new Blob([fileBuffer]);
            
            // Add file to FormData with the original filename
            formData.append('files', fileBlob, fileName);
            
            if (this.verbose) {
              console.log(`Added file: ${fileName} (${fileBuffer.length} bytes)`);
            }
          } catch (err) {
            console.error(`Error processing file ${attachment}:`, err);
          }
        } else {
          console.warn('File path attachments are only supported in Node.js environments');
        }
      } else {
        // If attachment is a File object, add it directly
        formData.append('files', attachment);
        
        if (this.verbose) {
          console.log(`Added file: ${attachment.name} (${attachment.size} bytes)`);
        }
      }
    }
    
    if (this.verbose) {
      console.log('Making POST request to /v3/tickets/add_note_with_attachment');
      console.log('FormData contains:', 
        `ticket_number: ${ticketId}`,
        `note_object: ${JSON.stringify(noteObject, null, 2)}`,
        `${attachments.length} file(s)`
      );
    } else {
      console.log(`📤 POST /v3/tickets/add_note_with_attachment (${attachments.length} file(s))`);
    }
    
    try {
      // Use axios directly for this request due to FormData handling
      const response = await axios.post(url, formData, {
        headers: {
          ...this.headers,
          'Content-Type': 'multipart/form-data'
        }
      });
      
      if (this.verbose) {
        console.log(`📥 Response status: ${response.status}`);
        console.log('Response data:', response.data);
      } else {
        console.log(`📥 Response: ${response.status} ${response.statusText}`);
      }
      
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        console.error(`📛 Error: ${error.response.status} ${error.response.statusText}`);
        if (error.response.data) {
          console.error('Response:', typeof error.response.data === 'object' ? 
            JSON.stringify(error.response.data) : 
            error.response.data);
        }
        
        throw new Error(`Desk365 API Error: ${error.response.statusText || error.message}`);
      }
      
      console.error('Error adding note with attachments:', error);
      throw error;
    }
  }

  /**
   * Closes a ticket
   * @param ticketId - The ID of the ticket to close
   * @returns The updated ticket
   */
  async closeTicket(ticketId: string): Promise<Ticket> {
    // Warning: Desk365 API documentation indicates this should use PUT
    console.log('⚠️ Warning: Attempting to close ticket using PUT as per Desk365 API documentation');
    
    const queryParams = {
      ticket_number: ticketId
    };
    
    const requestBody = {
      status: 'closed'
    };
    
    if (this.verbose) {
      console.log('Making PUT request to /v3/tickets/update');
      console.log('Request body:', JSON.stringify(requestBody, null, 2));
    } else {
      console.log(`📤 PUT /v3/tickets/update (close)`);
    }
    
    try {
      const response = await this.request('/tickets/update', 'PUT', requestBody, queryParams);
      return this.mapDeskTicketToTicket(response);
    } catch (error: any) {
      // Check if this is a 405 Method Not Allowed error
      if (axios.isAxiosError(error) && error.response?.status === 405) {
        console.error('❌ The Desk365 API returned a 405 Method Not Allowed error.');
        console.error('   This indicates the API may not support closing tickets via the API.');
        console.error('   Consider using the Desk365 web interface for this operation.');
      }
      throw error;
    }
  }

  /**
   * Reopens a closed ticket
   * @param ticketId - The ID of the ticket to reopen
   * @returns The updated ticket
   */
  async reopenTicket(ticketId: string): Promise<Ticket> {
    // Warning: Desk365 API documentation indicates this should use PUT
    console.log('⚠️ Warning: Attempting to reopen ticket using PUT as per Desk365 API documentation');
    
    const queryParams = {
      ticket_number: ticketId
    };
    
    const requestBody = {
      status: 'open'
    };
    
    if (this.verbose) {
      console.log('Making PUT request to /v3/tickets/update');
      console.log('Request body:', JSON.stringify(requestBody, null, 2));
    } else {
      console.log(`📤 PUT /v3/tickets/update (reopen)`);
    }
    
    try {
      const response = await this.request('/tickets/update', 'PUT', requestBody, queryParams);
      return this.mapDeskTicketToTicket(response);
    } catch (error: any) {
      // Check if this is a 405 Method Not Allowed error
      if (axios.isAxiosError(error) && error.response?.status === 405) {
        console.error('❌ The Desk365 API returned a 405 Method Not Allowed error.');
        console.error('   This indicates the API may not support reopening tickets via the API.');
        console.error('   Consider using the Desk365 web interface for this operation.');
      }
      throw error;
    }
  }

  /**
   * Lists tickets assigned to a specific admin
   * @param adminEmail - The email of the admin
   * @param options - Filter options
   * @returns Paginated list of tickets
   */
  async listAssignedTickets(adminEmail: string, options?: TicketFilterOptions): Promise<PaginatedTicketsResponse> {
    const filters = {
      assigned_to: [adminEmail]
    };
    
    const params = {
      ...this.buildParams(options),
      filters: JSON.stringify(filters)
    };
    
    const response = await this.request('/tickets', 'GET', undefined, params);
    
    return this.mapDeskPaginatedResponseToPaginatedTicketsResponse(response);
  }

  /**
   * Assigns a ticket to a specific agent/admin
   * @param ticketId - The ID of the ticket
   * @param assignTo - The email of the agent to assign the ticket to
   * @returns The updated ticket
   */
  async assignTicket(ticketId: string, assignTo: string): Promise<Ticket> {
    // Warning: Desk365 API documentation indicates this should use PUT
    console.log('⚠️ Warning: Attempting to assign ticket using PUT as per Desk365 API documentation');
    
    const queryParams = {
      ticket_number: ticketId
    };
    
    // The error indicated that "assigned to" is an invalid field
    // Try with "assign_to" instead of "assigned_to"
    const requestBody = {
      assign_to: assignTo
    };
    
    if (this.verbose) {
      console.log('Making PUT request to /v3/tickets/update');
      console.log('Request body:', JSON.stringify(requestBody, null, 2));
    } else {
      console.log(`📤 PUT /v3/tickets/update (assign)`);
    }
    
    try {
      // First try with PUT as documented
      const response = await this.request('/tickets/update', 'PUT', requestBody, queryParams);
      return this.mapDeskTicketToTicket(response);
    } catch (error: any) {
      // Check if this is a 405 Method Not Allowed error
      if (axios.isAxiosError(error) && error.response?.status === 405) {
        console.error('❌ The Desk365 API returned a 405 Method Not Allowed error for PUT.');
        console.error('   Trying with POST method instead...');
        
        // Try with POST as a fallback
        try {
          console.log(`📤 POST /v3/tickets/update (assign - fallback)`);
          const postResponse = await this.request('/tickets/update', 'POST', requestBody, queryParams);
          console.log('✅ Fallback to POST method successful');
          return this.mapDeskTicketToTicket(postResponse);
        } catch (postError) {
          console.error('❌ Failed to assign ticket using POST method as well.');
          console.error('   This operation may not be supported by the Desk365 API.');
          console.error('   Consider using the Desk365 web interface for this operation.');
          throw postError;
        }
      }
      throw error;
    }
  }

  /**
   * Escalates a ticket by changing its priority
   * @param ticketId - The ID of the ticket
   * @param priority - The new priority
   * @returns The updated ticket
   */
  async escalateTicket(ticketId: string, priority: TicketPriority): Promise<Ticket> {
    // Warning: Desk365 API documentation indicates this should use PUT
    console.log('⚠️ Warning: Attempting to update ticket priority using PUT as per Desk365 API documentation');
    
    const queryParams = {
      ticket_number: ticketId
    };
    
    const requestBody = {
      priority: this.mapPriorityToDesk365Priority(priority)
    };
    
    if (this.verbose) {
      console.log('Making PUT request to /v3/tickets/update');
      console.log('Request body:', JSON.stringify(requestBody, null, 2));
    } else {
      console.log(`📤 PUT /v3/tickets/update`);
    }
    
    try {
      const response = await this.request('/tickets/update', 'PUT', requestBody, queryParams);
      return this.mapDeskTicketToTicket(response);
    } catch (error: any) {
      // Check if this is a 405 Method Not Allowed error
      if (axios.isAxiosError(error) && error.response?.status === 405) {
        console.error('❌ The Desk365 API returned a 405 Method Not Allowed error.');
        console.error('   This indicates the API may not support updating ticket priority.');
        console.error('   Consider using the Desk365 web interface for this operation.');
      }
      throw error;
    }
  }

  /**
   * Updates a ticket's properties
   * @param request - The update request
   * @returns The updated ticket
   */
  async updateTicket(request: UpdateTicketRequest): Promise<Ticket> {
    try {
      // Warning: Desk365 API documentation indicates this should use PUT
      console.log('⚠️ Warning: Attempting to update ticket using PUT as per Desk365 API documentation');
      
      const queryParams = {
        ticket_number: request.ticketId
      };
      
      const requestBody: Record<string, any> = {};
      
      if (request.status) {
        requestBody.status = this.mapStatusToDesk365Status(request.status);
      }
      
      if (request.priority) {
        requestBody.priority = this.mapPriorityToDesk365Priority(request.priority);
      }
      
      if (request.assignedTo) {
        requestBody.assign_to = request.assignedTo;
      }
      
      if (this.verbose) {
        console.log('Making PUT request to /v3/tickets/update');
        console.log('Request body:', JSON.stringify(requestBody, null, 2));
      } else {
        console.log(`📤 PUT /v3/tickets/update`);
      }
      
      try {
        const response = await this.request('/tickets/update', 'PUT', requestBody, queryParams);
        return this.mapDeskTicketToTicket(response);
      } catch (error: any) {
        // Check if this is a 405 Method Not Allowed error
        if (axios.isAxiosError(error) && error.response?.status === 405) {
          console.error('❌ The Desk365 API returned a 405 Method Not Allowed error.');
          console.error('   This indicates the API may not support updating tickets via the API.');
          console.error('   Consider using the Desk365 web interface for this operation.');
        }
        throw error;
      }
    } catch (error) {
      console.error('Error updating ticket:', error);
      throw error;
    }
  }

  /**
   * Builds query parameters for filtering tickets
   * @param options - Filter options
   * @returns The query parameters
   * @private
   */
  private buildParams(options?: TicketFilterOptions): Record<string, any> {
    if (!options) return {};
    
    const params: Record<string, any> = {};
    
    if (options.page) {
      params.offset = (options.page - 1) * (options.limit || 30);
    }
    
    if (options.limit) {
      // Desk365 only supports 30, 50, or 100 tickets per call
      if (options.limit <= 30) {
        params.ticket_count = 30;
      } else if (options.limit <= 50) {
        params.ticket_count = 50;
      } else {
        params.ticket_count = 100;
      }
    }
    
    if (options.sortBy) {
      params.order_by = options.sortBy === 'createdAt' ? 'created_time' : 'updated_time';
      
      if (options.sortOrder) {
        params.order_type = options.sortOrder.toLowerCase();
      }
    }
    
    if (options.includeDescription) {
      params.include_description = 1;
    }

    if (options.includeCustomFields) {
      params.include_custom_fields = 1;
    }
    
    return params;
  }

  /**
   * Maps a Desk365 ticket to our generic Ticket interface
   * @param deskTicket - The Desk365 ticket
   * @returns The mapped ticket
   * @private
   */
  private mapDeskTicketToTicket(deskTicket: any): Ticket {
    // Handle case where deskTicket might be undefined or missing properties
    if (!deskTicket) {
      console.warn('Warning: Received undefined or null ticket data from Desk365 API');
      return {
        id: 'unknown',
        subject: 'Unknown Subject',
        description: 'No description available',
        status: TicketStatus.OPEN,
        priority: TicketPriority.MEDIUM,
        userEmail: 'unknown@example.com',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
    }
    
    return {
      id: deskTicket.ticket_number?.toString() || deskTicket.id?.toString() || 'unknown',
      subject: deskTicket.subject || 'Unknown Subject',
      description: deskTicket.description || 'No description available',
      status: this.mapDeskStatusToStatus(deskTicket.status || 'open'),
      priority: this.mapDeskPriorityToPriority(deskTicket.priority || 5),
      userEmail: deskTicket.contact_email || deskTicket.email || 'unknown@example.com',
      assignedTo: deskTicket.assigned_to || deskTicket.assign_to,
      createdAt: deskTicket.created_on || new Date().toISOString(),
      updatedAt: deskTicket.updated_on || new Date().toISOString()
    };
  }

  /**
   * Maps a Desk365 ticket to our generic TicketDetails interface
   * @param deskTicket - The Desk365 ticket
   * @returns The mapped ticket details
   * @private
   */
  private mapDeskTicketToTicketDetails(deskTicket: any): TicketDetails {
    return {
      ...this.mapDeskTicketToTicket(deskTicket),
      conversation: [], // Would need separate API call to get conversation history
      attachments: [] // Would need separate API call to get attachments
    };
  }

  /**
   * Maps a Desk365 message to our generic TicketMessage interface
   * @param deskMessage - The Desk365 message
   * @returns The mapped ticket message
   * @private
   */
  private mapDeskMessageToTicketMessage(deskMessage: any): TicketMessage {
    return {
      id: deskMessage.id,
      ticketId: deskMessage.ticket_number?.toString(),
      message: deskMessage.content,
      sender: deskMessage.email,
      isStaff: deskMessage.is_agent || false,
      createdAt: deskMessage.created_on,
      attachments: []
    };
  }

  /**
   * Maps a Desk365 attachment to our generic TicketAttachment interface
   * @param deskAttachment - The Desk365 attachment
   * @returns The mapped ticket attachment
   * @private
   */
  private mapDeskAttachmentToTicketAttachment(deskAttachment: any): any {
    return {
      id: deskAttachment.id,
      fileName: deskAttachment.filename,
      fileSize: deskAttachment.size,
      contentType: deskAttachment.content_type,
      url: deskAttachment.url
    };
  }

  /**
   * Maps a Desk365 paginated response to our generic PaginatedTicketsResponse
   * @param deskResponse - The Desk365 paginated response
   * @returns The mapped paginated response
   * @private
   */
  private mapDeskPaginatedResponseToPaginatedTicketsResponse(deskResponse: any): PaginatedTicketsResponse {
    return {
      tickets: (deskResponse.tickets || []).map(this.mapDeskTicketToTicket.bind(this)),
      total: deskResponse.count || 0,
      page: 1, // Calculated from offset in the request
      limit: 30, // Defaults to 30 in Desk365 API
      totalPages: Math.ceil((deskResponse.count || 0) / 30)
    };
  }

  /**
   * Maps a Desk365 status to our generic TicketStatus
   * @param deskStatus - The Desk365 status
   * @returns The mapped status
   * @private
   */
  private mapDeskStatusToStatus(deskStatus: string): TicketStatus {
    // Map Desk365 specific statuses to our generic statuses
    const statusMap: Record<string, TicketStatus> = {
      'open': TicketStatus.OPEN,
      'closed': TicketStatus.CLOSED,
      'pending': TicketStatus.PENDING,
      'resolved': TicketStatus.RESOLVED,
      // Add other status mappings as needed
    };
    
    return statusMap[deskStatus?.toLowerCase()] || TicketStatus.OPEN;
  }

  /**
   * Maps our generic TicketStatus to Desk365 status
   * @param status - Our generic status
   * @returns The Desk365 status
   * @private
   */
  private mapStatusToDesk365Status(status: TicketStatus): string {
    // Map our generic statuses to Desk365 specific statuses
    const statusMap: Record<string, string> = {
      [TicketStatus.OPEN]: 'open',
      [TicketStatus.CLOSED]: 'closed',
      [TicketStatus.PENDING]: 'pending',
      [TicketStatus.RESOLVED]: 'resolved',
      // Add other status mappings as needed
    };
    
    return statusMap[status] || 'open';
  }

  /**
   * Maps a Desk365 priority to our generic TicketPriority
   * @param deskPriority - The Desk365 priority
   * @returns The mapped priority
   * @private
   */
  private mapDeskPriorityToPriority(deskPriority: number | string): TicketPriority {
    // Convert to number if string
    const priorityValue = typeof deskPriority === 'string' ? parseInt(deskPriority, 10) : deskPriority;
    
    // Map Desk365 specific priorities to our generic priorities
    // For "Priority": Low=1, Medium=5, High=10, Urgent=20
    if (priorityValue === 1) return TicketPriority.LOW;
    if (priorityValue === 5) return TicketPriority.MEDIUM;
    if (priorityValue === 10) return TicketPriority.HIGH;
    if (priorityValue === 20) return TicketPriority.URGENT;
    
    return TicketPriority.MEDIUM; // Default
  }

  /**
   * Maps our generic TicketPriority to Desk365 priority
   * @param priority - Our generic priority
   * @returns The Desk365 priority value
   * @private
   */
  private mapPriorityToDesk365Priority(priority?: TicketPriority): number {
    if (!priority) return 5; // Default to medium
    
    // Map our generic priorities to Desk365 specific priorities
    // For "Priority": Low=1, Medium=5, High=10, Urgent=20
    const priorityMap: Record<string, number> = {
      [TicketPriority.LOW]: 1,
      [TicketPriority.MEDIUM]: 5,
      [TicketPriority.HIGH]: 10,
      [TicketPriority.URGENT]: 20,
    };
    
    return priorityMap[priority] || 5;
  }

  /**
   * Gets information about available API endpoints
   * This can help debug API path issues
   */
  async getApiInfo(): Promise<any> {
    try {
      // Try to get API docs or other endpoint that might help
      const swaggerResponse = await axios({
        method: 'GET',
        url: `${this.baseUrl}/api-docs`,
        headers: this.headers
      });
      
      return swaggerResponse.data;
    } catch (error) {
      console.error('Failed to get API info:', error);
      return null;
    }
  }
}
