# TaskFlow - Student Activity Tracker

A comprehensive web-based platform for tracking and managing student activities and achievements across academic, sports, volunteer, club, and leadership categories.

## Features

- **Course Management**: Create and manage academic courses/programs
- **Activity Tracking**: Track student activities with detailed information including:
  - Activity type (Academic, Sports, Volunteering, Club, Leadership, Other)
  - Status tracking (Planned, In Progress, Completed, Cancelled)
  - Hours spent on activities
  - Start and end dates
  - Location information
  - Mentor/supervisor assignment
  
- **Achievement Logging**: Record and verify student achievements
- **Evidence Management**: Upload certificates, photos, and other activity evidence
- **Activity Categories**: Organize activities by custom categories for better tracking
- **Real-time Updates**: Comments and activity history for collaboration
- **Dashboard Analytics**: View comprehensive statistics:
  - Total courses enrolled
  - Total activities logged
  - Completed activities count
  - Total hours spent on activities
  - Recent activity feed

## User Roles

- **Admin**: System administrators with full access
- **Teacher**: Course instructors who create courses and manage student activities
- **Student**: Students who log their activities and achievements

## Technology Stack

- **Frontend**: React 19 with TypeScript
- **Build Tool**: Vite
- **Backend**: Express.js
- **UI Components**: Lucide React Icons
- **Styling**: Tailwind CSS
- **Animation**: Motion

## Getting Started

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

### Build

```bash
npm run build
```

### Start Production Server

```bash
npm start
```

## Project Structure

```
src/
├── components/
│   ├── BoardView.tsx       # Activity tracker view
│   ├── CardModal.tsx       # Activity detail modal
│   ├── CreateModal.tsx     # Course/tracker creation
│   ├── Dashboard.tsx       # Analytics dashboard
│   ├── LoginView.tsx       # Authentication
│   └── Navbar.tsx          # Navigation bar
├── App.tsx                 # Main application
├── types.ts               # TypeScript interfaces
└── main.tsx              # Entry point
```

## API Endpoints

- `POST /api/auth/login` - User authentication
- `GET /api/auth/me` - Current user info
- `GET /api/workspaces` - List courses
- `GET /api/boards` - List activity trackers
- `GET /api/cards` - List student activities
- `GET /api/dashboard` - Dashboard statistics

## License

MIT
