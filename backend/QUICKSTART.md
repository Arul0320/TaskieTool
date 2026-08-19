# Quick Start Guide - Django Backend

## What's Included?

A complete Django REST Framework backend with:
- ✅ Dynamic data models (all values stored in database)
- ✅ User management with role-based access
- ✅ Workspaces, Boards, Lists, and Cards
- ✅ Comments, Attachments, and Activity Logs
- ✅ Dashboard with statistics
- ✅ REST API with automatic Swagger documentation
- ✅ CORS enabled for frontend integration

## Quick Setup (Windows)

### 1. Navigate to Django Backend
```bash
cd django_backend
```

### 2. Create Virtual Environment
```bash
python -m venv venv
venv\Scripts\activate
```

### 3. Install Dependencies
```bash
pip install -r requirements.txt
```

### 4. Setup Environment Variables
```bash
# Copy the example and create .env
copy .env.example .env
# Edit .env with your settings (optional for development)
```

### 5. Initialize Database
```bash
python manage.py migrate
```

### 6. Create Admin User
```bash
python manage.py createsuperuser
# Username: admin
# Email: admin@example.com
# Password: (your choice)
```

### 7. Load Sample Data (Optional)
```bash
python manage.py load_sample_data
```

### 8. Run Development Server
```bash
python manage.py runserver
```

Server runs at: **http://localhost:8000**

## Access Points

| Feature | URL |
|---------|-----|
| API Root | http://localhost:8000/api/ |
| API Docs (Swagger) | http://localhost:8000/api/docs/ |
| Admin Panel | http://localhost:8000/admin/ |

## Default Sample Data (if loaded)

**Admin User:**
- Username: `alice_admin`
- Password: `password123`

**Teacher:**
- Username: `bob_manager`
- Password: `password123`

**Students:**
- Username: `charlie_student` / `dana_student`
- Password: `password123`

## API Endpoints Overview

### Users
```
GET    /api/users/                  - List users
GET    /api/users/me/               - Current user
GET    /api/users/profile/          - Current user profile
```

### Workspaces
```
GET    /api/workspaces/             - List workspaces
POST   /api/workspaces/             - Create workspace
GET    /api/workspaces/{id}/        - Get workspace
POST   /api/workspaces/{id}/add_member/    - Add member
POST   /api/workspaces/{id}/remove_member/ - Remove member
```

### Boards
```
GET    /api/boards/                 - List boards
POST   /api/boards/                 - Create board
GET    /api/boards/{id}/            - Get board
POST   /api/boards/{id}/toggle_favorite/   - Toggle favorite
```

### Lists
```
GET    /api/lists/                  - List categories
POST   /api/lists/                  - Create list
GET    /api/lists/{id}/             - Get list
```

### Cards (Activities)
```
GET    /api/cards/                  - List activities
POST   /api/cards/                  - Create activity
GET    /api/cards/{id}/             - Get activity
PUT    /api/cards/{id}/             - Update activity
DELETE /api/cards/{id}/             - Delete activity
POST   /api/cards/{id}/add_comment/ - Add comment
POST   /api/cards/{id}/add_achievement/ - Add achievement
POST   /api/cards/{id}/log_activity/ - Log activity
```

### Dashboard
```
GET    /api/dashboard/stats/        - Dashboard statistics
```

## Example API Calls

### Get Current User
```bash
curl http://localhost:8000/api/users/me/
```

### List All Workspaces
```bash
curl http://localhost:8000/api/workspaces/
```

### Get Dashboard Stats
```bash
curl http://localhost:8000/api/dashboard/stats/
```

### Create New Activity Card
```bash
curl -X POST http://localhost:8000/api/cards/ \
  -H "Content-Type: application/json" \
  -d '{
    "id": "card-new",
    "list": "list-1",
    "activity_title": "New Activity",
    "description": "Description here",
    "activity_type": "Academic",
    "status": "Planned",
    "start_date": "2024-01-20",
    "end_date": "2024-01-27",
    "hours_spent": 0,
    "student": 3
  }'
```

## Database Models

All data is stored dynamically with these models:

- **UserProfile** - Extended user information with roles
- **Workspace** - Courses/Programs with members
- **Board** - Activity trackers/Terms
- **List** - Activity categories
- **Card** - Individual activities with details
- **Comment** - Discussion on activities
- **Attachment** - File uploads/evidence
- **ActivityLog** - Complete audit trail
- **Achievement** - Milestones/badges

## File Structure

```
django_backend/
├── config/                 # Django configuration
│   ├── settings.py         # Settings & database config
│   ├── urls.py             # URL routing
│   └── wsgi.py             # WSGI configuration
├── api/                    # Main API app
│   ├── models.py           # Database models
│   ├── serializers.py      # API serializers
│   ├── views.py            # API views/endpoints
│   ├── urls.py             # API routes
│   ├── admin.py            # Admin configuration
│   └── signals.py          # Django signals
├── manage.py               # Django management command
├── requirements.txt        # Python dependencies
├── .env.example            # Environment variables template
└── README.md               # Full documentation
```

## Troubleshooting

### Port 8000 Already in Use
```bash
python manage.py runserver 8001
```

### Database Errors
```bash
# Reset database
python manage.py migrate --fake api zero
python manage.py migrate
python manage.py load_sample_data
```

### Module Not Found
```bash
# Reinstall dependencies
pip install -r requirements.txt
```

## Frontend Integration

Update your frontend to use the Django backend:

```typescript
// frontend/.env
VITE_API_URL=http://localhost:8000/api
```

## Stop the Server

Press **Ctrl+C** in the terminal running the server.

## Next Steps

1. ✅ Start the Django backend
2. ✅ View API docs at http://localhost:8000/api/docs/
3. ✅ Test endpoints with Swagger
4. ✅ Connect your React frontend
5. ✅ Build your features!

---

For full documentation, see [README.md](./README.md)
