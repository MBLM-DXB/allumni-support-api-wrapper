"use strict";
/**
 * Desk365 API Client
 * Implements the SupportApiInterface for Desk365
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Desk365Client = void 0;
const axios_1 = __importDefault(require("axios"));
const types_1 = require("./types");
/**
 * Desk365 API Client implementation
 * Handles communication with the Desk365 API
 */
class Desk365Client {
    /**
     * Creates a new Desk365 API client
     * @param config - Configuration for the client
     */
    constructor(config) {
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
        }
        catch (error) {
            this.subdomain = 'unknown';
        }
    }
    /**
     * Validates the API configuration by attempting to ping the API
     * @returns A result object with success status and message
     */
    async validateConfig() {
        var _a;
        try {
            // Try to list tickets as a simple validation
            await this.request('/tickets', 'GET', undefined, { ticket_count: 1 });
            return {
                success: true,
                message: `Successfully connected to Desk365 API with subdomain '${this.subdomain}'`
            };
        }
        catch (error) {
            let message = 'Failed to validate Desk365 API configuration';
            if (axios_1.default.isAxiosError(error)) {
                const axiosError = error;
                if (((_a = axiosError.response) === null || _a === void 0 ? void 0 : _a.status) === 403) {
                    message = `Authentication failed: API key may not be valid for subdomain '${this.subdomain}'. Desk365 API keys are tied to specific subdomains.`;
                }
                else if (axiosError.response) {
                    message = `API error: ${axiosError.response.status} ${axiosError.response.statusText}`;
                }
                else if (axiosError.code === 'ENOTFOUND') {
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
    async ping() {
        try {
            // Try to validate configuration first
            const validation = await this.validateConfig();
            if (!validation.success) {
                throw new Error(validation.message);
            }
            return `Connected to Desk365 API at ${this.baseUrl}`;
        }
        catch (error) {
            console.error('Failed to ping Desk365 API:', error);
            throw error;
        }
    }
    /**
     * Direct ping using the exact endpoint from the API example
     * @returns A success message if the ping is successful
     */
    async directPing() {
        try {
            // Use the exact ping endpoint from the curl example
            const response = await (0, axios_1.default)({
                method: 'GET',
                url: `${this.baseUrl}/v3/ping`,
                headers: this.headers
            });
            console.log('Ping response status:', response.status);
            if (this.verbose) {
                console.log('Ping response data:', response.data);
            }
            return `Successfully pinged Desk365 API at ${this.baseUrl}/v3/ping`;
        }
        catch (error) {
            if (axios_1.default.isAxiosError(error) && error.response) {
                console.error(`Ping error: HTTP ${error.response.status} ${error.response.statusText}`);
                if (this.verbose && error.response.data) {
                    console.error('Response data:', error.response.data);
                }
            }
            else {
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
    async request(endpoint, method = 'GET', data, params) {
        var _a, _b, _c;
        // Ensure endpoint starts with /v3/
        if (!endpoint.startsWith('/v3/')) {
            endpoint = `/v3${endpoint}`;
        }
        // Build URL
        const url = `${this.baseUrl}${endpoint}`;
        // Prepare request options
        const config = {
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
        }
        else {
            console.log(`📤 Making ${method} request to ${endpoint}`);
            console.log('Request parameters:', params);
            if (data)
                console.log('Request data:', JSON.stringify(data, null, 2));
        }
        try {
            const response = await (0, axios_1.default)(config);
            if (!this.verbose) {
                console.log(`📥 Response: ${response.status} ${response.statusText}`);
            }
            else {
                console.log(`📥 Response status: ${response.status}`);
            }
            return response.data;
        }
        catch (error) {
            if (axios_1.default.isAxiosError(error)) {
                const axiosError = error;
                // Concise error logging for non-verbose mode
                if (!this.verbose) {
                    console.error(`📛 Error: ${(_a = axiosError.response) === null || _a === void 0 ? void 0 : _a.status} ${(_b = axiosError.response) === null || _b === void 0 ? void 0 : _b.statusText}`);
                    if ((_c = axiosError.response) === null || _c === void 0 ? void 0 : _c.data) {
                        console.error('Response:', typeof axiosError.response.data === 'object' ?
                            JSON.stringify(axiosError.response.data) :
                            axiosError.response.data);
                    }
                }
                else {
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
                            data: axiosError.response.data,
                        });
                        if (axiosError.response.data && typeof axiosError.response.data === 'object' && 'errors' in axiosError.response.data) {
                            console.error('📛 Response error details:', {
                                errors: axiosError.response.data.errors
                            });
                        }
                    }
                }
                if (axiosError.response) {
                    const errorData = axiosError.response.data || { message: 'Unknown error' };
                    throw new Error(`Desk365 API Error: ${errorData.message || errorData.error || axiosError.response.statusText}`);
                }
                else if (axiosError.request) {
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
    async createTicket(request) {
        var _a;
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
            const params = {
                action: 'create',
                ...desk365Request
            };
            if (this.verbose) {
                console.log(`Making GET request to /v3/tickets with create action`);
                console.log('Request parameters:', params);
            }
            else {
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
                status: 'OPEN',
                priority: request.priority || types_1.TicketPriority.MEDIUM,
                userEmail: request.userEmail,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };
        }
        catch (error) {
            // Concise error logging
            if (axios_1.default.isAxiosError(error) && error.response) {
                const status = error.response.status;
                const statusText = error.response.statusText;
                const allowedMethods = (_a = error.response.headers) === null || _a === void 0 ? void 0 : _a.allow;
                console.error(`Create ticket error: HTTP ${status} ${statusText}`);
                if (allowedMethods) {
                    console.error(`Allowed methods: ${allowedMethods}`);
                }
                // Only log detailed data in verbose mode
                if (this.verbose && error.response.data) {
                    console.error('Response data:', typeof error.response.data === 'object'
                        ? JSON.stringify(error.response.data, null, 2)
                        : error.response.data.substring(0, 200));
                }
            }
            else {
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
    async createTicketAlt(request) {
        var _a;
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
            }
            else {
                console.log(`📤 GET /v3/tickets/create (query params)`);
            }
            // Make a GET request to the tickets/create endpoint with query parameters
            const response = await this.request('/tickets/create', 'GET', undefined, params);
            if (this.verbose) {
                console.log('Response data:', response);
            }
            return this.mapDeskTicketToTicket(response);
        }
        catch (error) {
            // Concise error logging
            if (axios_1.default.isAxiosError(error) && error.response) {
                const status = error.response.status;
                const statusText = error.response.statusText;
                const allowedMethods = (_a = error.response.headers) === null || _a === void 0 ? void 0 : _a.allow;
                console.error(`Create ticket (alt) error: HTTP ${status} ${statusText}`);
                if (allowedMethods) {
                    console.error(`Allowed methods: ${allowedMethods}`);
                }
                // Only log detailed data in verbose mode
                if (this.verbose && error.response.data) {
                    console.error('Response data:', typeof error.response.data === 'object'
                        ? JSON.stringify(error.response.data, null, 2)
                        : error.response.data.substring(0, 200));
                }
            }
            else {
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
    async listUserTickets(userEmail, options) {
        const filters = {
            contact: [userEmail]
        };
        const params = {
            ...this.buildParams(options),
            filters: filters
        };
        const response = await this.request('/tickets', 'GET', undefined, params);
        const page = (options === null || options === void 0 ? void 0 : options.page) || 1;
        const limit = (options === null || options === void 0 ? void 0 : options.limit) || 30;
        return this.mapDeskPaginatedResponseToPaginatedTicketsResponse(response, page, limit);
    }
    /**
     * Searches for tickets based on filter options
     * @param options - Filter options
     * @returns Paginated list of tickets
     */
    async searchTickets(options) {
        const filters = {};
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
        const page = (options === null || options === void 0 ? void 0 : options.page) || 1;
        const limit = (options === null || options === void 0 ? void 0 : options.limit) || 30;
        return this.mapDeskPaginatedResponseToPaginatedTicketsResponse(response, page, limit);
    }
    /**
     * Gets the details of a specific ticket
     * @param ticketId - The ID of the ticket
     * @returns The ticket details including conversation
     */
    async getTicketDetails(ticketId) {
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
    async respondToTicket(request) {
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
        }
        else {
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
    async respondToTicketWithAttachments(request, attachments) {
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
                    }
                    catch (err) {
                        console.error(`Error processing file ${attachment}:`, err);
                    }
                }
                else {
                    console.warn('File path attachments are only supported in Node.js environments');
                }
            }
            else {
                // If attachment is a File object, add it directly
                formData.append('files', attachment);
                if (this.verbose) {
                    console.log(`Added file: ${attachment.name} (${attachment.size} bytes)`);
                }
            }
        }
        if (this.verbose) {
            console.log('Making POST request to /v3/tickets/add_reply_with_attachment');
            console.log('FormData contains:', `ticket_number: ${request.ticketId}`, `reply_object: ${JSON.stringify(replyObject, null, 2)}`, `${attachments.length} file(s)`);
        }
        else {
            console.log(`📤 POST /v3/tickets/add_reply_with_attachment (${attachments.length} file(s))`);
        }
        try {
            // Use axios directly for this request due to FormData handling
            const response = await axios_1.default.post(url, formData, {
                headers: {
                    ...this.headers,
                    'Content-Type': 'multipart/form-data'
                }
            });
            if (this.verbose) {
                console.log(`📥 Response status: ${response.status}`);
                console.log('Response data:', response.data);
            }
            else {
                console.log(`📥 Response: ${response.status} ${response.statusText}`);
            }
            return this.mapDeskMessageToTicketMessage(response.data);
        }
        catch (error) {
            if (axios_1.default.isAxiosError(error) && error.response) {
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
    async addNoteToTicket(ticketId, note, isPrivate = true, agentEmail, notifyEmails) {
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
        }
        else {
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
    async addNoteWithAttachmentsToTicket(ticketId, note, attachments, isPrivate = true, agentEmail, notifyEmails) {
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
                    }
                    catch (err) {
                        console.error(`Error processing file ${attachment}:`, err);
                    }
                }
                else {
                    console.warn('File path attachments are only supported in Node.js environments');
                }
            }
            else {
                // If attachment is a File object, add it directly
                formData.append('files', attachment);
                if (this.verbose) {
                    console.log(`Added file: ${attachment.name} (${attachment.size} bytes)`);
                }
            }
        }
        if (this.verbose) {
            console.log('Making POST request to /v3/tickets/add_note_with_attachment');
            console.log('FormData contains:', `ticket_number: ${ticketId}`, `note_object: ${JSON.stringify(noteObject, null, 2)}`, `${attachments.length} file(s)`);
        }
        else {
            console.log(`📤 POST /v3/tickets/add_note_with_attachment (${attachments.length} file(s))`);
        }
        try {
            // Use axios directly for this request due to FormData handling
            const response = await axios_1.default.post(url, formData, {
                headers: {
                    ...this.headers,
                    'Content-Type': 'multipart/form-data'
                }
            });
            if (this.verbose) {
                console.log(`📥 Response status: ${response.status}`);
                console.log('Response data:', response.data);
            }
            else {
                console.log(`📥 Response: ${response.status} ${response.statusText}`);
            }
            return response.data;
        }
        catch (error) {
            if (axios_1.default.isAxiosError(error) && error.response) {
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
    async closeTicket(ticketId) {
        var _a;
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
        }
        else {
            console.log(`📤 PUT /v3/tickets/update (close)`);
        }
        try {
            const response = await this.request('/tickets/update', 'PUT', requestBody, queryParams);
            return this.mapDeskTicketToTicket(response);
        }
        catch (error) {
            // Check if this is a 405 Method Not Allowed error
            if (axios_1.default.isAxiosError(error) && ((_a = error.response) === null || _a === void 0 ? void 0 : _a.status) === 405) {
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
    async reopenTicket(ticketId) {
        var _a;
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
        }
        else {
            console.log(`📤 PUT /v3/tickets/update (reopen)`);
        }
        try {
            const response = await this.request('/tickets/update', 'PUT', requestBody, queryParams);
            return this.mapDeskTicketToTicket(response);
        }
        catch (error) {
            // Check if this is a 405 Method Not Allowed error
            if (axios_1.default.isAxiosError(error) && ((_a = error.response) === null || _a === void 0 ? void 0 : _a.status) === 405) {
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
    async listAssignedTickets(adminEmail, options) {
        const filters = {
            assigned_to: [adminEmail]
        };
        const params = {
            ...this.buildParams(options),
            filters: JSON.stringify(filters)
        };
        const response = await this.request('/tickets', 'GET', undefined, params);
        const page = (options === null || options === void 0 ? void 0 : options.page) || 1;
        const limit = (options === null || options === void 0 ? void 0 : options.limit) || 30;
        return this.mapDeskPaginatedResponseToPaginatedTicketsResponse(response, page, limit);
    }
    /**
     * Assigns a ticket to a specific agent/admin
     * @param ticketId - The ID of the ticket
     * @param assignTo - The email of the agent to assign the ticket to
     * @returns The updated ticket
     */
    async assignTicket(ticketId, assignTo) {
        var _a;
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
        }
        else {
            console.log(`📤 PUT /v3/tickets/update (assign)`);
        }
        try {
            // First try with PUT as documented
            const response = await this.request('/tickets/update', 'PUT', requestBody, queryParams);
            return this.mapDeskTicketToTicket(response);
        }
        catch (error) {
            // Check if this is a 405 Method Not Allowed error
            if (axios_1.default.isAxiosError(error) && ((_a = error.response) === null || _a === void 0 ? void 0 : _a.status) === 405) {
                console.error('❌ The Desk365 API returned a 405 Method Not Allowed error for PUT.');
                console.error('   Trying with POST method instead...');
                // Try with POST as a fallback
                try {
                    console.log(`📤 POST /v3/tickets/update (assign - fallback)`);
                    const postResponse = await this.request('/tickets/update', 'POST', requestBody, queryParams);
                    console.log('✅ Fallback to POST method successful');
                    return this.mapDeskTicketToTicket(postResponse);
                }
                catch (postError) {
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
    async escalateTicket(ticketId, priority) {
        var _a;
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
        }
        else {
            console.log(`📤 PUT /v3/tickets/update`);
        }
        try {
            const response = await this.request('/tickets/update', 'PUT', requestBody, queryParams);
            return this.mapDeskTicketToTicket(response);
        }
        catch (error) {
            // Check if this is a 405 Method Not Allowed error
            if (axios_1.default.isAxiosError(error) && ((_a = error.response) === null || _a === void 0 ? void 0 : _a.status) === 405) {
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
    async updateTicket(request) {
        var _a;
        try {
            // Warning: Desk365 API documentation indicates this should use PUT
            console.log('⚠️ Warning: Attempting to update ticket using PUT as per Desk365 API documentation');
            const queryParams = {
                ticket_number: request.ticketId
            };
            const requestBody = {};
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
            }
            else {
                console.log(`📤 PUT /v3/tickets/update`);
            }
            try {
                const response = await this.request('/tickets/update', 'PUT', requestBody, queryParams);
                return this.mapDeskTicketToTicket(response);
            }
            catch (error) {
                // Check if this is a 405 Method Not Allowed error
                if (axios_1.default.isAxiosError(error) && ((_a = error.response) === null || _a === void 0 ? void 0 : _a.status) === 405) {
                    console.error('❌ The Desk365 API returned a 405 Method Not Allowed error.');
                    console.error('   This indicates the API may not support updating tickets via the API.');
                    console.error('   Consider using the Desk365 web interface for this operation.');
                }
                throw error;
            }
        }
        catch (error) {
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
    buildParams(options) {
        if (!options)
            return {};
        const params = {};
        if (options.page) {
            params.offset = (options.page - 1) * (options.limit || 30);
        }
        if (options.limit) {
            // Desk365 only supports 30, 50, or 100 tickets per call
            if (options.limit <= 30) {
                params.ticket_count = 30;
            }
            else if (options.limit <= 50) {
                params.ticket_count = 50;
            }
            else {
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
    mapDeskTicketToTicket(deskTicket) {
        var _a, _b;
        // Handle case where deskTicket might be undefined or missing properties
        if (!deskTicket) {
            console.warn('Warning: Received undefined or null ticket data from Desk365 API');
            return {
                id: 'unknown',
                subject: 'Unknown Subject',
                description: 'No description available',
                status: types_1.TicketStatus.OPEN,
                priority: types_1.TicketPriority.MEDIUM,
                userEmail: 'unknown@example.com',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };
        }
        return {
            id: ((_a = deskTicket.ticket_number) === null || _a === void 0 ? void 0 : _a.toString()) || ((_b = deskTicket.id) === null || _b === void 0 ? void 0 : _b.toString()) || 'unknown',
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
    mapDeskTicketToTicketDetails(deskTicket) {
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
    mapDeskMessageToTicketMessage(deskMessage) {
        var _a;
        return {
            id: deskMessage.id,
            ticketId: (_a = deskMessage.ticket_number) === null || _a === void 0 ? void 0 : _a.toString(),
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
    mapDeskAttachmentToTicketAttachment(deskAttachment) {
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
     * @param page - The current page number
     * @param limit - The number of items per page
     * @returns The mapped paginated response
     * @private
     */
    mapDeskPaginatedResponseToPaginatedTicketsResponse(deskResponse, page = 1, limit = 30) {
        return {
            tickets: (deskResponse.tickets || []).map(this.mapDeskTicketToTicket.bind(this)),
            total: deskResponse.count || 0,
            page,
            limit,
            totalPages: Math.ceil((deskResponse.count || 0) / limit)
        };
    }
    /**
     * Maps a Desk365 status to our generic TicketStatus
     * @param deskStatus - The Desk365 status
     * @returns The mapped status
     * @private
     */
    mapDeskStatusToStatus(deskStatus) {
        // Map Desk365 specific statuses to our generic statuses
        const statusMap = {
            'open': types_1.TicketStatus.OPEN,
            'closed': types_1.TicketStatus.CLOSED,
            'pending': types_1.TicketStatus.PENDING,
            'resolved': types_1.TicketStatus.RESOLVED,
            // Add other status mappings as needed
        };
        return statusMap[deskStatus === null || deskStatus === void 0 ? void 0 : deskStatus.toLowerCase()] || types_1.TicketStatus.OPEN;
    }
    /**
     * Maps our generic TicketStatus to Desk365 status
     * @param status - Our generic status
     * @returns The Desk365 status
     * @private
     */
    mapStatusToDesk365Status(status) {
        // Map our generic statuses to Desk365 specific statuses
        const statusMap = {
            [types_1.TicketStatus.OPEN]: 'open',
            [types_1.TicketStatus.CLOSED]: 'closed',
            [types_1.TicketStatus.PENDING]: 'pending',
            [types_1.TicketStatus.RESOLVED]: 'resolved',
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
    mapDeskPriorityToPriority(deskPriority) {
        // Convert to number if string
        const priorityValue = typeof deskPriority === 'string' ? parseInt(deskPriority, 10) : deskPriority;
        // Map Desk365 specific priorities to our generic priorities
        // For "Priority": Low=1, Medium=5, High=10, Urgent=20
        if (priorityValue === 1)
            return types_1.TicketPriority.LOW;
        if (priorityValue === 5)
            return types_1.TicketPriority.MEDIUM;
        if (priorityValue === 10)
            return types_1.TicketPriority.HIGH;
        if (priorityValue === 20)
            return types_1.TicketPriority.URGENT;
        return types_1.TicketPriority.MEDIUM; // Default
    }
    /**
     * Maps our generic TicketPriority to Desk365 priority
     * @param priority - Our generic priority
     * @returns The Desk365 priority value
     * @private
     */
    mapPriorityToDesk365Priority(priority) {
        if (!priority)
            return 5; // Default to medium
        // Map our generic priorities to Desk365 specific priorities
        // For "Priority": Low=1, Medium=5, High=10, Urgent=20
        const priorityMap = {
            [types_1.TicketPriority.LOW]: 1,
            [types_1.TicketPriority.MEDIUM]: 5,
            [types_1.TicketPriority.HIGH]: 10,
            [types_1.TicketPriority.URGENT]: 20,
        };
        return priorityMap[priority] || 5;
    }
    /**
     * Gets information about available API endpoints
     * This can help debug API path issues
     */
    async getApiInfo() {
        try {
            // Try to get API docs or other endpoint that might help
            const swaggerResponse = await (0, axios_1.default)({
                method: 'GET',
                url: `${this.baseUrl}/api-docs`,
                headers: this.headers
            });
            return swaggerResponse.data;
        }
        catch (error) {
            console.error('Failed to get API info:', error);
            return null;
        }
    }
}
exports.Desk365Client = Desk365Client;
