# WhatsApp Integration System Flowchart

```
                                  ┌────────────────────┐
                                  │                    │
                                  │  WhatsApp User     │
                                  │                    │
                                  └─────────┬──────────┘
                                            │
                                            │ Sends message via 
                                            │ WhatsApp
                                            ▼
┌─────────────────────────────────────────────────────────────────────┐
│                           Meta WhatsApp Cloud                        │
└─────────────────────────────────┬───────────────────────────────────┘
                                  │
                                  │ Webhook delivery
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│                              ngrok                                   │
│                (Exposes localhost to the internet)                   │
└─────────────────────────────────┬───────────────────────────────────┘
                                  │
                                  │ Forwards webhook to localhost
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│                          Express Server                              │
│                                                                      │
│  ┌─────────────────┐     ┌─────────────────┐    ┌──────────────────┐│
│  │                 │     │                 │    │                  ││
│  │  Webhook route  │────▶│  Controllers    │───▶│  Services        ││
│  │                 │     │                 │    │                  ││
│  └─────────────────┘     └─────────┬───────┘    └─────────┬────────┘│
│                                    │                      │         │
│                                    │                      │         │
│                                    ▼                      │         │
│                          ┌─────────────────┐             │         │
│                          │                 │             │         │
│                          │     Models      │◀────────────┘         │
│                          │                 │                       │
│                          └────────┬────────┘                       │
│                                   │                                │
└───────────────────────────────────┼────────────────────────────────┘
                                    │
                                    │ Database queries
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│                          PostgreSQL Database                         │
│                                                                      │
│   ┌──────────────┐   ┌───────────────┐   ┌───────────────────────┐  │
│   │              │   │               │   │                       │  │
│   │   Messages   │   │    Orders     │   │   MCP related tables  │  │
│   │              │   │               │   │                       │  │
│   └──────────────┘   └───────────────┘   └───────────────────────┘  │
│                                                                      │
└──────────────────────────────────────┬──────────────────────────────┘
                                       │
                                       │ NLP processing (optional)
                                       │
                                       ▼
┌─────────────────────────────────────────────────────────────────────┐
│                        WhatsApp MCP Server                           │
│                                                                      │
│  ┌─────────────────┐     ┌─────────────────┐    ┌──────────────────┐│
│  │                 │     │                 │    │                  ││
│  │ Intent Analysis │────▶│ Entity Detection│───▶│ Response Creation││
│  │                 │     │                 │    │                  ││
│  └─────────────────┘     └─────────────────┘    └──────────────────┘│
│                                                                      │
└──────────────────────────────────────┬──────────────────────────────┘
                                       │
                                       │ Response flows back
                                       │ through the server
                                       ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    Express Server - Send API                         │
└─────────────────────────────────┬───────────────────────────────────┘
                                  │
                                  │ Sends response via
                                  │ WhatsApp Cloud API
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│                           Meta WhatsApp Cloud                        │
└─────────────────────────────────┬───────────────────────────────────┘
                                  │
                                  │ Delivers message
                                  │
                                  ▼
                         ┌────────────────────┐
                         │                    │
                         │  WhatsApp User     │
                         │                    │
                         └────────────────────┘
                         
                         
                         
┌─────────────────────────────────────────────────────────────────────┐
│                        Admin Dashboard Flow                          │
└─────────────────────────────────────────────────────────────────────┘

┌────────────────────┐     ┌────────────────────┐    ┌────────────────┐
│                    │     │                    │    │                │
│   React Frontend   │────▶│ Axios API Requests │───▶│ Express Server │
│                    │     │                    │    │                │
└────────────────────┘     └────────────────────┘    └───────┬────────┘
        ▲                                                    │
        │                                                    │
        │                                                    │
        │                                                    ▼
        │                                           ┌────────────────┐
        │                                           │                │
        └───────────────────────────────────────────│   Database     │
                                                    │                │
                                                    └────────────────┘
```

## Detailed Workflow

### 1. Incoming Message Flow

1. **User sends message via WhatsApp**
   - A WhatsApp user sends a message to your business number

2. **Meta WhatsApp Cloud API processes message**
   - Meta's servers receive the message
   - Forwards it to your webhook URL

3. **ngrok tunnel forwards the request**
   - The webhook hits your ngrok URL
   - ngrok forwards it to your local server (port 3001)

4. **Express server receives webhook**
   - `POST /webhook/whatsapp` endpoint receives the message
   - Validates the webhook signature for security

5. **Controller processes the webhook data**
   - Message controller extracts message content, sender info
   - Determines message type (text, media, etc.)

6. **Services layer handles business logic**
   - Message service processes the message content
   - Queries relevant data from the database if needed (e.g., order status)
   - May send message to MCP server for natural language processing

7. **MCP Server (optional)**
   - Analyzes the message for intent and entities
   - Determines user's intentions (check order, place new order, etc.)
   - Returns structured data with recognized intents

8. **Database interaction**
   - Stores incoming message in the messages table
   - Retrieves requested data (e.g., order status)
   - Updates conversation context if needed

9. **Response generation and sending**
   - Service layer creates appropriate response based on message content
   - Controller passes response to WhatsApp API
   - Message sent back to the user through Meta WhatsApp Cloud API

### 2. Admin Dashboard Flow

1. **Admin accesses React frontend**
   - Admin opens the dashboard at http://localhost:3000
   - React frontend loads with the message history view

2. **Frontend requests data**
   - React components use Axios to make API calls
   - Requests message history, conversation threads, etc.

3. **Express API endpoints**
   - `GET /api/messages` returns message history
   - Other endpoints provide specific functionalities

4. **Admin sends message**
   - Admin can compose and send messages through the UI
   - `POST /api/send` endpoint sends messages to WhatsApp users

5. **Real-time updates**
   - Socket.io connections (if implemented) provide real-time updates
   - New messages appear in the dashboard without page refresh 