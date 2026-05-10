import swaggerJsdoc from 'swagger-jsdoc';

/**
 * Swagger Configuration for Financino API
 * Defines API documentation, servers, authentication, and schema definitions
 */
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Financino API',
      version: '1.0.0',
      description: 'Intelligent expense tracking and financial insights platform API',
      contact: {
        name: 'Financino Support',
        email: 'support@financino.com',
      },
    },
    servers: [
      {
        url: 'http://localhost:5000',
        description: 'Development server',
      },
      {
        url: 'https://api.financino.com',
        description: 'Production server',
      },
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'JWT Authorization header using the Bearer scheme',
        },
      },
      schemas: {
        // User Schema
        User: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            email: { type: 'string', format: 'email' },
            name: { type: 'string' },
            clerkId: { type: 'string' },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        // Expense Schema
        Expense: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            userId: { type: 'string' },
            amount: { type: 'number' },
            category: { type: 'string' },
            description: { type: 'string' },
            date: { type: 'string', format: 'date' },
            receiptUrl: { type: 'string' },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        // Budget Schema
        Budget: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            userId: { type: 'string' },
            category: { type: 'string' },
            limit: { type: 'number' },
            spent: { type: 'number' },
            month: { type: 'string' },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        // Error Response
        Error: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string' },
            error: { type: 'string' },
          },
        },
        // Success Response
        SuccessResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            message: { type: 'string' },
            data: { type: 'object' },
          },
        },
      },
    },
    security: [
      {
        BearerAuth: [],
      },
    ],
  },
  // Specify API files to scan for JSDoc comments
  apis: ['./routes/*.js'],
};

// Generate Swagger specification
const swaggerSpec = swaggerJsdoc(swaggerOptions);

export default swaggerSpec;
