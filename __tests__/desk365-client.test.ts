import axios from 'axios';
import { Desk365Client } from '../client';
import { TicketPriority, TicketStatus } from '../types';

// Mock axios to avoid actual API calls
jest.mock('axios');

describe('Desk365Client', () => {
  let client: Desk365Client;
  
  beforeEach(() => {
    // Reset axios mocks before each test
    jest.clearAllMocks();
    
    // Create a new client instance for each test
    client = new Desk365Client({
      baseUrl: 'https://test.desk365.io/apis',
      apiKey: 'test-api-key'
    });
  });
  
  describe('createTicket', () => {
    it('should create a ticket successfully', async () => {
      // Prepare mock response
      const mockResponse = {
        data: {
          ticket_number: '12345',
          subject: 'Test Ticket',
          description: 'Test Description',
          status: 'open',
          priority: 5,
          contact_email: 'user@example.com',
          created_on: '2023-01-01 12:00:00',
          updated_on: '2023-01-01 12:00:00'
        }
      };
      
      // Setup axios mock implementation
      (axios as jest.MockedFunction<typeof axios>).mockResolvedValueOnce(mockResponse);
      
      // Call the method
      const result = await client.createTicket({
        subject: 'Test Ticket',
        description: 'Test Description',
        priority: TicketPriority.MEDIUM,
        userEmail: 'user@example.com'
      });
      
      // Assertions
      expect(axios).toHaveBeenCalledWith({
        method: 'POST',
        url: 'https://test.desk365.io/apis/v3/tickets/create',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'test-api-key'
        },
        data: {
          subject: 'Test Ticket',
          description: 'Test Description',
          priority: 5,
          contact_email: 'user@example.com'
        }
      });
      
      expect(result).toEqual({
        id: '12345',
        subject: 'Test Ticket',
        description: 'Test Description',
        status: TicketStatus.OPEN,
        priority: TicketPriority.MEDIUM,
        userEmail: 'user@example.com',
        createdAt: '2023-01-01 12:00:00',
        updatedAt: '2023-01-01 12:00:00'
      });
    });
  });
  
  describe('listUserTickets', () => {
    it('should list tickets for a user', async () => {
      // Prepare mock response
      const mockResponse = {
        data: {
          count: 1,
          tickets: [
            {
              ticket_number: '12345',
              subject: 'Test Ticket',
              description: 'Test Description',
              status: 'open',
              priority: 5,
              contact_email: 'user@example.com',
              created_on: '2023-01-01 12:00:00',
              updated_on: '2023-01-01 12:00:00'
            }
          ]
        }
      };
      
      // Setup axios mock implementation
      (axios as jest.MockedFunction<typeof axios>).mockResolvedValueOnce(mockResponse);
      
      // Call the method
      const result = await client.listUserTickets('user@example.com', { page: 1, limit: 30 });
      
      // Assertions
      expect(axios).toHaveBeenCalledWith({
        method: 'GET',
        url: 'https://test.desk365.io/apis/v3/tickets',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'test-api-key'
        },
        params: {
          offset: 0,
          ticket_count: 30,
          filters: JSON.stringify({ contact: ['user@example.com'] })
        }
      });
      
      expect(result).toEqual({
        tickets: [
          {
            id: '12345',
            subject: 'Test Ticket',
            description: 'Test Description',
            status: TicketStatus.OPEN,
            priority: TicketPriority.MEDIUM,
            userEmail: 'user@example.com',
            createdAt: '2023-01-01 12:00:00',
            updatedAt: '2023-01-01 12:00:00'
          }
        ],
        total: 1,
        page: 1,
        limit: 30,
        totalPages: 1
      });
    });
  });
  
  describe('getTicketDetails', () => {
    it('should get ticket details', async () => {
      // Prepare mock response
      const mockResponse = {
        data: {
          ticket_number: '12345',
          subject: 'Test Ticket',
          description: 'Test Description',
          status: 'open',
          priority: 5,
          contact_email: 'user@example.com',
          assign_to: 'admin@example.com',
          created_on: '2023-01-01 12:00:00',
          updated_on: '2023-01-01 12:00:00'
        }
      };
      
      // Setup axios mock implementation
      (axios as jest.MockedFunction<typeof axios>).mockResolvedValueOnce(mockResponse);
      
      // Call the method
      const result = await client.getTicketDetails('12345');
      
      // Assertions
      expect(axios).toHaveBeenCalledWith({
        method: 'GET',
        url: 'https://test.desk365.io/apis/v3/tickets/details',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'test-api-key'
        },
        params: {
          ticket_number: '12345'
        }
      });
      
      expect(result).toEqual({
        id: '12345',
        subject: 'Test Ticket',
        description: 'Test Description',
        status: TicketStatus.OPEN,
        priority: TicketPriority.MEDIUM,
        userEmail: 'user@example.com',
        assignedTo: 'admin@example.com',
        createdAt: '2023-01-01 12:00:00',
        updatedAt: '2023-01-01 12:00:00',
        conversation: [],
        attachments: []
      });
    });
  });
  
  // Add more tests for other methods as needed
}); 