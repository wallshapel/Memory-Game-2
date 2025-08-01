// src/config/swagger.ts
import swaggerJsdoc from "swagger-jsdoc";
import type { Options } from "swagger-jsdoc";

export const swaggerOptions: Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Memory Game API",
      version: "1.0.0",
      description: "REST API for Memory Game (Express + TypeScript)",
    },
    servers: [
      {
        url: "http://localhost:3000",
        description: "Development server",
      },
    ],
  },
  apis: ["./src/routes/*.ts", "./src/models/*.ts"],
};

export const swaggerSpec = swaggerJsdoc(swaggerOptions);
