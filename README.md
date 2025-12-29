# Arbor

A web application that enables branching conversations with AI, allowing users to explore multiple conversation paths from any point. Features a visual graph sidebar to navigate the conversation tree.

## Features

- **Branching Conversations**: Create branches from any AI response
- **Text Selection Branching**: Highlight text in AI responses to branch from specific topics
- **Visual Graph Sidebar**: Interactive tree visualization using React Flow
- **Context Inheritance**: New branches inherit context from parent conversations
- **Auto-generated Titles**: Conversations automatically get descriptive titles
- **Smart Summaries**: AI-generated summaries preserve context across branches

## Tech Stack

### Frontend
- React + TypeScript
- Vite (build tool)
- Tailwind CSS (styling)
- Zustand (state management)
- React Flow (graph visualization)

### Backend
- Node.js + Express
- TypeScript
- PostgreSQL + Prisma ORM
- Gemini API (Google AI)

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL database
- Google Gemini API key (get it from [Google AI Studio](https://aistudio.google.com/app/apikey))

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd Neur_chat
```

2. **Install backend dependencies**
```bash
cd backend
npm install
```

3. **Set up environment variables**
```bash
cp .env.example .env
```

Edit `.env` and add your database URL and Gemini API key:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/arbor?schema=public"
GEMINI_API_KEY="your-gemini-api-key-here"
PORT=3001
```

4. **Set up the database**
```bash
npm run prisma:migrate
npm run prisma:generate
```

5. **Install frontend dependencies**
```bash
cd ../frontend
npm install
```

### Running the Application

1. **Start the backend server**
```bash
cd backend
npm run dev
```

The backend will run on `http://localhost:3001`

2. **Start the frontend development server** (in a new terminal)
```bash
cd frontend
npm run dev
```

The frontend will run on `http://localhost:3000`

3. **Open your browser** and navigate to `http://localhost:3000`

## Project Structure

```
Neur_chat/
├── backend/
│   ├── prisma/
│   │   └── schema.prisma          # Database schema
│   ├── src/
│   │   ├── routes/
│   │   │   └── conversation.ts    # API routes
│   │   ├── services/
│   │   │   └── gemini.ts          # Gemini API integration
│   │   ├── types/
│   │   │   └── index.ts           # TypeScript types
│   │   └── index.ts               # Express server
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   │   └── client.ts          # API client
│   │   ├── components/
│   │   │   ├── ChatArea.tsx       # Main chat interface
│   │   │   ├── GraphSidebar.tsx   # Tree visualization
│   │   │   └── MessageBubble.tsx  # Individual messages
│   │   ├── store/
│   │   │   └── conversationStore.ts # Zustand store
│   │   ├── types/
│   │   │   └── index.ts           # TypeScript types
│   │   ├── App.tsx                # Main app component
│   │   ├── main.tsx               # Entry point
│   │   └── index.css              # Tailwind styles
│   ├── index.html
│   ├── package.json
│   ├── vite.config.ts
│   └── tailwind.config.js
│
└── README.md
```

## API Endpoints

- `POST /api/conversation` - Create new root conversation
- `POST /api/conversation/:id/message` - Send message and get AI response
- `POST /api/conversation/:id/branch` - Create branch from a message
- `GET /api/tree/:id` - Get full conversation tree
- `PUT /api/conversation/:id` - Update conversation (title, etc.)
- `DELETE /api/conversation/:id` - Delete conversation and children
- `POST /api/conversation/:id/summarize` - Generate summary of conversation

## Usage

### Starting a Conversation
1. The app automatically creates a new conversation tree when you first load it
2. Type a message in the input box and press Send
3. The AI will respond using Google Gemini

### Branching from a Response
1. Hover over any AI response to see the branch icon
2. Click the branch icon to create a new conversation branch
3. The new branch inherits context from the parent conversation

### Branching from Selected Text
1. Highlight any text in an AI response
2. Click "Branch from selection" button
3. A new branch is created focused on the selected text

### Navigating the Tree
- Use the graph sidebar to see all conversation branches
- Click any node in the graph to switch to that conversation
- The active conversation is highlighted in blue

## Development

### Building for Production

**Frontend:**
```bash
cd frontend
npm run build
```

**Backend:**
```bash
cd backend
npm run build
npm start
```

### Database Management

**Create a new migration:**
```bash
cd backend
npm run prisma:migrate
```

**Open Prisma Studio:**
```bash
npm run prisma:studio
```

## License

MIT
