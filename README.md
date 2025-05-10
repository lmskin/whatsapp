# 📦 WhatsApp-Integrated Internal System (React + Node.js + PostgreSQL + REST + WhatsApp API)

## 🚀 Overview

This project connects **WhatsApp Cloud API** with your **internal business database** using a modern full-stack setup:

- **Frontend**: React (admin dashboard)
- **Backend**: Node.js + Express (REST API)
- **Database**: PostgreSQL
- **Messaging**: WhatsApp Cloud API (Meta)
- **Tunnel**: ngrok for exposing local webhooks
- **Socket.IO**: Real-time communication

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
| WebSockets   | Socket.IO            | Real-time updates between client/server |

## 📁 Folder Structure

```
project-root/
├── client/                 # React frontend
│   ├── public/
│   └── src/
│       ├── components/
│       ├── pages/
│       ├── services/
│       ├── App.js
│       └── index.js
├── server/                 # Node.js backend
│   ├── controllers/
│   ├── routes/
│   ├── models/
│   ├── services/
│   ├── config/
│   └── app.js
├── db/                     # PostgreSQL schema/migrations
├── config/                 # Configuration files
│   ├── .env-example
│   ├── db-config.txt
│   ├── mcp-flow.txt
│   └── ngrok.yml
├── scripts/                # Setup and start scripts
│   ├── setup/              # Setup scripts
│   │   ├── setup-database.bat/.ps1/.sh
│   │   ├── setup-mcp.bat/.sh
│   │   └── create-env.bat/.ps1
│   └── start/              # Start scripts
│       ├── start-all-services.bat/.ps1
│       ├── start-ui.bat
│       ├── start-with-ngrok.bat/.ps1/.sh
│       └── start-client.js
├── whatsapp-mcp-server/    # MCP Server implementation
│   ├── src/
│   ├── tests/
│   ├── pyproject.toml
│   └── Dockerfile
├── system-flowchart.md     # System architecture flowchart  
├── .env-example            # Environment variables template
├── package.json            # Root package.json with scripts
└── README.md
```

## 📜 Available npm Scripts

For convenience, this project provides several npm scripts to help you set up and run the application. You can run them with `npm run <script-name>`:

| Script Name     | Description                                               |
|-----------------|-----------------------------------------------------------|
| `start`         | Start the production server                               |
| `server`        | Start only the backend server                             |
| `client`        | Start only the React frontend                             |
| `install-server`| Install dependencies for server only                      |
| `install-client`| Install dependencies for client only                      |
| `install-all`   | Install dependencies for root, server, and client         |
| `dev`           | Start both server and client for development              |
| `build`         | Build the React frontend for production                   |
| `setup-mcp`     | Set up the MCP server (Linux/macOS)                       |
| `setup-mcp-win` | Set up the MCP server (Windows)                           |
| `start-mcp`     | Start the MCP server                                      |
| `dev-with-mcp`  | Start server, client, and MCP server together             |
| `start-ui`      | Start the UI using the batch script                       |
| `start-all`     | Start all services using batch script                     |
| `start-all-ps`  | Start all services using PowerShell script                |
| `start-ngrok`   | Start ngrok tunnel using batch script                     |
| `start-ngrok-ps`| Start ngrok tunnel using PowerShell script                |
| `start-ngrok-sh`| Start ngrok tunnel using shell script (Linux/macOS)       |
| `create-env`    | Create .env file using batch script                       |
| `create-env-ps` | Create .env file using PowerShell script                  |
| `setup-db`      | Set up database using batch script                        |
| `setup-db-ps`   | Set up database using PowerShell script                   |
| `setup-db-sh`   | Set up database using shell script (Linux/macOS)          |
| `migrate`       | Run database migrations                                   |

## ⚙️ Setup Instructions

### 1. Install Prerequisites

- [Node.js](https://nodejs.org/) (v18+)
- [PostgreSQL](https://www.postgresql.org/download/)
- [ngrok](https://ngrok.com/)
- [Python](https://www.python.org/) (v3.8+ for MCP server)
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

# Socket.IO
SOCKET_PORT=4000
```

### 3. Set Up the Database

1. Create a PostgreSQL database:
```sql
CREATE DATABASE whatsapp_db;
```

2. Run the database setup script using one of these commands:
```bash
# Windows Command Prompt
npm run setup-db

# Windows PowerShell
npm run setup-db-ps

# Linux/macOS
npm run setup-db-sh
```

3. Apply database migrations:
```bash
npm run migrate
```

4. Create a `.env` file in the root directory with your database and WhatsApp credentials:
```bash
# Windows Command Prompt
npm run create-env

# Windows PowerShell
npm run create-env-ps
```

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

### 5. Install Dependencies

Install all dependencies with a single command:

```bash
npm run install-all
```

### 6. Start Backend & Frontend

You can start all services with a single command:

```bash
# Windows Command Prompt
npm run start-all

# Windows PowerShell
npm run start-all-ps
```

Or start individual components:

**Backend:**
```bash
npm run server
```

**Frontend:**
```bash
npm run client
```

**Development Mode (both):**
```bash
npm run dev
```

**With MCP Server:**
```bash
npm run dev-with-mcp
```

### 7. Expose Localhost with ngrok

Install ngrok:

```bash
npm install -g ngrok
```

Authenticate:

```bash
ngrok config add-authtoken <YOUR_NGROK_AUTH_TOKEN>
```

Expose port 3001 using the provided script:

```bash
# Windows Command Prompt
npm run start-ngrok

# Windows PowerShell
npm run start-ngrok-ps

# Linux/macOS
npm run start-ngrok-sh
```

Copy the generated HTTPS URL, e.g.:

```
https://abc123.ngrok.io
```

### 8. Register Webhook in Meta App

In your WhatsApp App Settings:

- Webhook URL:  
  `https://abc123.ngrok.io/webhook/whatsapp`
- Verify Token:  
  Match the one in your `.env` or Express logic
- Subscribe to the **messages** field

## 📡 WhatsApp Message Flow

Please see the `system-flowchart.md` file for a detailed diagram of how messages flow through the system.

## 🚀 Key Features

- **Two-way Communication**: Send and receive WhatsApp messages
- **Admin Dashboard**: View and manage conversations
- **Order Tracking**: Allow customers to check order status via WhatsApp
- **Automated Responses**: Configure auto-replies for common questions
- **Real-time Updates**: Socket.IO integration for live updates
- **Natural Language Processing**: Optional MCP server for advanced message understanding
- **Multi-platform Support**: Run on Windows, macOS, or Linux

## 🧩 Components

### Frontend (React)
- Admin dashboard for viewing and responding to WhatsApp messages
- Message history and user management
- Real-time updates with Socket.IO
- Order management interface

### Backend (Node.js + Express)
- REST API for frontend communication
- WhatsApp Cloud API integration
- Message processing and routing
- Database interactions
- WebSocket server for real-time updates

### MCP Server (Python)
- Natural Language Processing for message understanding
- Intent detection and entity extraction
- Response generation based on user queries

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.
