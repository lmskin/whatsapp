# 📦 WhatsApp-Integrated Internal System (React + Node.js + PostgreSQL + REST + WhatsApp API)

## 🚀 Overview

This project connects **WhatsApp Cloud API** with your **internal business database** using a modern full-stack setup:

- **Frontend**: React (admin dashboard)
- **Backend**: Node.js + Express (REST API)
- **Database**: PostgreSQL
- **Messaging**: WhatsApp Cloud API (Meta)
- **Tunnel**: ngrok for exposing local webhooks

## 🛠 Tech Stack

| Layer        | Technology           | Purpose                                 |
|--------------|----------------------|-----------------------------------------|
| Frontend     | React                | Admin UI (view and send messages)       |
| Backend      | Node.js + Express    | REST API, message parsing, DB access    |
| Database     | PostgreSQL           | Stores user, message, and order data    |
| API Gateway  | RESTful API          | Communication between frontend/backend  |
| Messaging    | WhatsApp Cloud API   | Handle user messages from WhatsApp      |
| NLP          | WhatsApp MCP Server  | Natural language processing             |
| Tunnel       | ngrok                | Expose local webhook to Meta's servers  |

## 📁 Folder Structure

```
project-root/
├── client/                 # React frontend
│   └── src/
│       ├── components/
│       ├── pages/
│       └── services/
├── server/                 # Node.js backend
│   ├── controllers/
│   ├── routes/
│   ├── models/
│   ├── services/
│   └── app.js
├── db/                     # PostgreSQL schema/migrations
├── .env
└── README.md
```

## ⚙️ Setup Instructions

### 1. Install Prerequisites

- [Node.js](https://nodejs.org/) (v18+)
- [PostgreSQL](https://www.postgresql.org/download/)
- [ngrok](https://ngrok.com/)
- WhatsApp Cloud API access via [Meta Developer Console](https://developers.facebook.com/)

### 2. Configure `.env`

```
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=your_db
DB_USER=postgres
DB_PASS=your_password

# WhatsApp Cloud API
WA_PHONE_NUMBER_ID=your_phone_id
WA_ACCESS_TOKEN=your_meta_access_token
WA_API_VERSION=v17.0

# Server
PORT=3001
```

### 3. Set Up the Database

1. Create a PostgreSQL database:
```sql
CREATE DATABASE whatsapp_db;
```

2. Run the schema creation script from `db/setup.sql`:
```bash
psql -U postgres -d whatsapp_db -f db/setup.sql
```

3. Apply database migrations:
```bash
npm run migrate
```

4. Create a `.env` file in the root directory with your database and WhatsApp credentials.

### 4. Start PostgreSQL

Set up your schema:

```
-- db/schema.sql
CREATE TABLE messages (
  id SERIAL PRIMARY KEY,
  wa_user_id TEXT NOT NULL,
  content TEXT,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE orders (
  id SERIAL PRIMARY KEY,
  order_number TEXT,
  status TEXT,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 5. Start Backend & Frontend

**Backend:**
```
cd server
npm install
npm run dev
```

**Frontend:**
```
cd client
npm install
npm start
```

### 6. Expose Localhost with ngrok

Install ngrok:

```
npm install -g ngrok
```

Authenticate:

```
ngrok config add-authtoken <YOUR_NGROK_AUTH_TOKEN>
```

Expose port 3001:

```
ngrok http 3001
```

Copy the generated HTTPS URL, e.g.:

```
https://abc123.ngrok.io
```

### 7. Register Webhook in Meta App

In your WhatsApp App Settings:

- Webhook URL:  
  `https://abc123.ngrok.io/webhook/whatsapp`
- Verify Token:  
  Match the one in your `.env` or Express logic
- Subscribe to the **messages** field

## 📡 WhatsApp Message Flow

1. User sends WhatsApp message  
2. Meta delivers it to your `POST /webhook/whatsapp`
3. Your server:
   - Parses the message
   - Queries PostgreSQL (e.g., order status)
   - Sends a reply via WhatsApp Cloud API

## 🔧 API Endpoints

| Method | Endpoint               | Description                          |
|--------|------------------------|--------------------------------------|
| GET    | `/api/messages`        | List all recent messages             |
| POST   | `/api/send`            | Send a message to WhatsApp           |
| POST   | `/webhook/whatsapp`    | WhatsApp webhook receiver            |

## 💻 React Frontend Features

- Admin dashboard to:
  - View message history
  - Manually send replies
  - Track user conversation threads
- Axios used to call backend APIs

## 🔒 Security & Notes

- Validate webhook with `X-Hub-Signature-256`
- Use HTTPS (ngrok does this for you)
- Sanitize user input before querying DB
- Store access tokens securely

## ✅ Optional: Integrate MCP Server

- Set up [WhatsApp MCP server](https://github.com/msaelices/whatsapp-mcp-server)
- Use it to parse natural language queries and call your REST API

## 📚 References

- [WhatsApp Cloud API](https://developers.facebook.com/docs/whatsapp/cloud-api/)
- [ngrok](https://ngrok.com/docs)
- [Express.js Docs](https://expressjs.com/)
- [React Docs](https://react.dev/)
- [PostgreSQL Docs](https://www.postgresql.org/docs/)

## 🚶‍♂️ Getting Started with this Codebase

This repository comes with a fully prepared project structure. Here's how to get started:

### 1. Clone the Repository

```bash
git clone <repository-url>
cd whatsapp-integration
```

### 2. Install Dependencies

We've prepared convenient scripts to install all dependencies:

```bash
npm run install-all
```

This will install:
- Root dependencies (concurrently)
- Server dependencies (Express, PostgreSQL, etc.)
- Client dependencies (React, Axios, etc.)

### 3. Set Up the Database

1. Create a PostgreSQL database:
```sql
CREATE DATABASE whatsapp_db;
```

2. Run the schema creation script from `db/setup.sql`:
```bash
psql -U postgres -d whatsapp_db -f db/setup.sql
```

3. Apply database migrations:
```bash
npm run migrate
```

4. Create a `.env` file in the root directory with your database and WhatsApp credentials.

### 4. Start the Development Environment

Run both frontend and backend together:

```bash
npm run dev
```

This will start:
- Backend server on port 3001
- React frontend on port 3000
- Hot reloading for both

### 5. Access the Application

The admin dashboard is available at: http://localhost:3000

### 6. Testing WhatsApp Integration

Use ngrok to expose your localhost and configure webhook URLs in the Meta Developer Console.

## ✅ MCP Server Integration

This project integrates with the [WhatsApp MCP server](https://github.com/msaelices/whatsapp-mcp-server) to provide natural language processing capabilities for better user interactions.

### 1. Install and Set Up MCP Server

The easiest way to set up the MCP server is using our provided scripts:

**On Linux/macOS:**
```bash
npm run setup-mcp
```

**On Windows:**
```bash
npm run setup-mcp-win
```

These scripts will:
1. Clone the MCP server repository
2. Install dependencies
3. Generate an API key
4. Create a .env file for the MCP server

Alternatively, you can set it up manually:

```bash
# Clone the MCP server repository
git clone https://github.com/msaelices/whatsapp-mcp-server.git
cd whatsapp-mcp-server

# Install dependencies
npm install

# Create .env file with content:
# PORT=4000
# API_KEY=your_generated_api_key
```

### 2. Configure MCP Server Integration

Add these environment variables to your main project's `.env` file:

```
# MCP Server
MCP_ENDPOINT=http://localhost:4000
MCP_API_KEY=your_mcp_api_key  # Use the API key generated during setup
MCP_DEFAULT_LANGUAGE=en
```

### 3. Start All Services

You can start all services (backend, frontend, and MCP server) using a single command:

```bash
npm run dev-with-mcp
```

Or start them separately:

```bash
# Start MCP server
npm run start-mcp

# In another terminal, start the main application
npm run dev
```

### 4. Testing MCP Integration

We provide a test script to verify the MCP integration:

```bash
npm run test-mcp
```

This will test both direct connection to the MCP server and the integration through our API.

### 5. Understanding MCP Flow

The message processing flow with MCP is:

1. User sends a WhatsApp message
2. Our server receives it via webhook
3. Message is sent to MCP server for intent analysis
4. MCP server identifies intent and entities
5. Our server processes the intent (e.g., check order status)
6. A response is sent back to the user

See the flow diagram in the `mcp-flow.txt` file for a visual representation.

### 6. Training the MCP Server

You can train the MCP server with new examples through the API:

```bash
curl -X POST http://localhost:3001/api/mcp/train \
  -H "Content-Type: application/json" \
  -d '{
    "examples": [
      {
        "text": "What is the status of my order #12345?",
        "intent": "check_order_status",
        "entities": {
          "orderNumber": "12345"
        }
      },
      {
        "text": "I want to place an order for 2 pizzas",
        "intent": "create_order",
        "entities": {
          "items": ["2 pizzas"]
        }
      }
    ]
  }'
```

The system comes pre-configured with basic examples for:
- Checking order status
- Creating orders
- Greetings and thank you messages
- General inquiries

### 7. MCP API Endpoints

The following MCP-related endpoints are available:

| Method | Endpoint           | Description                      |
|--------|-------------------|----------------------------------|
| POST   | `/api/mcp/train`  | Train the MCP server with examples |
| GET    | `/api/mcp/status` | Get MCP server connection status |
| POST   | `/api/mcp/test`   | Test message processing with MCP |

### 8. Database Schema for MCP

This integration adds two new tables to the database:

- `mcp_sessions`: Stores user conversation context
- `mcp_training_logs`: Logs MCP training activity

### 9. Available Intents

The system recognizes the following intents out of the box:

- `check_order_status`: When users ask about order status
- `create_order`: When users want to place an order
- `greeting`: Simple hello messages
- `thanks`: Thank you messages
- `general_inquiry`: Other general questions

You can add more by training the MCP server with additional examples.
