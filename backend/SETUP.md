# Django Backend Setup Instructions

## Overview

This is a production-ready Django REST Framework backend for the TaskieTool student activity tracking system. All data is stored dynamically in a database.

## Prerequisites

- Python 3.8 or higher
- pip (Python package manager)
- Virtual environment (recommended: venv)

## Installation Steps

### Step 1: Navigate to Backend Directory
```bash
cd django_backend
```

### Step 2: Create Virtual Environment

**On Windows:**
```bash
python -m venv venv
venv\Scripts\activate
```

**On macOS/Linux:**
```bash
python3 -m venv venv
source venv/bin/activate
```

### Step 3: Install Dependencies
```bash
pip install -r requirements.txt
```

### Step 4: Environment Configuration

Create a `.env` file from the template:
```bash
cp .env.example .env
```

Edit `.env` and set your values (optional for local development):
```env
DEBUG=True
DJANGO_SECRET_KEY=your-secret-key-here
ALLOWED_HOSTS=localhost,127.0.0.1
FRONTEND_URL=http://localhost:5173
```

### Step 5: Database Initialization

```bash
# Create database tables
python manage.py migrate

# Create superuser (admin account)
python manage.py createsuperuser
# Follow prompts to enter username, email, password

# Load sample data (optional)
python manage.py load_sample_data
```

### Step 6: Start Development Server

```bash
python manage.py runserver
```

The backend will be available at:
- **API Root:** http://localhost:8000/api/
- **API Documentation:** http://localhost:8000/api/docs/
- **Admin Panel:** http://localhost:8000/admin/

## Project Structure

```
django_backend/
├── config/
│   ├── settings.py          # Main Django settings
│   ├── urls.py              # Root URL configuration
│   ├── wsgi.py              # WSGI application
│   └── __init__.py
├── api/
│   ├── models.py            # Database models
│   ├── serializers.py       # DRF serializers
│   ├── views.py             # API views (ViewSets)
│   ├── urls.py              # API URL routing
│   ├── admin.py             # Django admin configuration
│   ├── apps.py              # App configuration
│   ├── signals.py           # Django signals
│   └── __init__.py
├── management/
│   └── commands/
│       └── load_sample_data.py  # Sample data loader
├── manage.py                # Django CLI
├── requirements.txt         # Python dependencies
├── .env.example             # Environment template
└── README.md                # Full documentation
```

## Database Models

### UserProfile
- Extended user information
- Roles: Admin, Teacher, Student
- Avatar color, student ID, department

### Workspace
- Represents a course or program
- Created by a teacher
- Contains multiple members
- Has associated boards

### Board
- Activity tracker for a workspace
- Can be marked as favorite
- Contains multiple lists
- Academic year tracking

### List
- Activity category (e.g., "To Do", "In Progress")
- Belongs to a board
- Ordered display

### Card
- Individual activity/task
- Assigned to a student
- Has status (Planned, In Progress, Completed, Cancelled)
- Tracks hours spent
- Can have achievements, comments, attachments

### Comment
- Discussion on a card
- Created by a user
- Timestamped

### Attachment
- File uploads on cards
- Evidence/certificates storage

### ActivityLog
- Complete audit trail
- Tracks all changes to cards

### Achievement
- Milestones/badges
- Can be assigned to cards

## API Endpoints

All endpoints require authentication.

### Users
```
GET  /api/users/              - List all users
GET  /api/users/{id}/         - Get specific user
GET  /api/users/me/           - Get current user
GET  /api/users/profile/      - Get current user profile
```

### Workspaces
```
GET  /api/workspaces/                        - List user's workspaces
POST /api/workspaces/                        - Create new workspace
GET  /api/workspaces/{id}/                   - Get workspace details
PUT  /api/workspaces/{id}/                   - Update workspace
DELETE /api/workspaces/{id}/                 - Delete workspace
POST /api/workspaces/{id}/add_member/        - Add member
POST /api/workspaces/{id}/remove_member/     - Remove member
```

### Boards
```
GET  /api/boards/                    - List boards
POST /api/boards/                    - Create board
GET  /api/boards/{id}/               - Get board details
PUT  /api/boards/{id}/               - Update board
DELETE /api/boards/{id}/             - Delete board
POST /api/boards/{id}/toggle_favorite/ - Toggle favorite status
```

### Lists
```
GET  /api/lists/      - List all lists
POST /api/lists/      - Create list
GET  /api/lists/{id}/ - Get list details
PUT  /api/lists/{id}/ - Update list
DELETE /api/lists/{id}/ - Delete list
```

### Cards
```
GET    /api/cards/                     - List all cards
POST   /api/cards/                     - Create card
GET    /api/cards/{id}/                - Get card details
PUT    /api/cards/{id}/                - Update card
DELETE /api/cards/{id}/                - Delete card
POST   /api/cards/{id}/add_comment/    - Add comment to card
POST   /api/cards/{id}/add_achievement/ - Add achievement to card
POST   /api/cards/{id}/log_activity/   - Log activity for card
```

### Comments
```
GET  /api/comments/      - List comments
POST /api/comments/      - Create comment
GET  /api/comments/{id}/ - Get comment details
PUT  /api/comments/{id}/ - Update comment
DELETE /api/comments/{id}/ - Delete comment
```

### Attachments
```
GET  /api/attachments/      - List attachments
POST /api/attachments/      - Upload attachment
GET  /api/attachments/{id}/ - Get attachment details
DELETE /api/attachments/{id}/ - Delete attachment
```

### Activity Logs
```
GET /api/logs/      - List activity logs
GET /api/logs/{id}/ - Get specific log
```

### Dashboard
```
GET /api/dashboard/stats/ - Get dashboard statistics
```

## Example Requests

### Create a Workspace
```bash
curl -X POST http://localhost:8000/api/workspaces/ \
  -H "Content-Type: application/json" \
  -d '{
    "id": "workspace-new",
    "name": "New Course",
    "description": "Course description",
    "course_code": "CS102",
    "semester": "2024-Spring"
  }'
```

### Create an Activity Card
```bash
curl -X POST http://localhost:8000/api/cards/ \
  -H "Content-Type: application/json" \
  -d '{
    "id": "card-123",
    "activity_title": "Research Project",
    "description": "Complete research on topic",
    "activity_type": "Academic",
    "status": "In Progress",
    "start_date": "2024-01-20",
    "end_date": "2024-01-30",
    "hours_spent": 5
  }'
```

### Add Comment to Card
```bash
curl -X POST http://localhost:8000/api/cards/{card_id}/add_comment/ \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Great progress on this activity!"
  }'
```

### Get Dashboard Stats
```bash
curl http://localhost:8000/api/dashboard/stats/
```

## Admin Panel

Access the Django admin interface at http://localhost:8000/admin/

Default admin credentials from `createsuperuser` command.

Manage:
- Users and profiles
- Workspaces and courses
- Boards and activities
- Comments and attachments
- Activity logs

## Common Commands

```bash
# Run migrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser

# Load sample data
python manage.py load_sample_data

# Run development server
python manage.py runserver

# Run tests
python manage.py test

# Shell (interactive Python with Django)
python manage.py shell

# Create app
python manage.py startapp app_name

# Collect static files
python manage.py collectstatic
```

## Environment Variables

```env
DEBUG=True                              # Enable debug mode
DJANGO_SECRET_KEY=your-secret-key       # Django secret key
ALLOWED_HOSTS=localhost,127.0.0.1       # Allowed hosts
FRONTEND_URL=http://localhost:5173      # Frontend URL for CORS
DATABASE_URL=sqlite:///db.sqlite3       # Database connection
```

## Deactivate Virtual Environment

```bash
deactivate
```

## Troubleshooting

### Port 8000 Already in Use
```bash
python manage.py runserver 8001
```

### Database Locked
```bash
# Delete db.sqlite3 and recreate
python manage.py migrate
python manage.py createsuperuser
python manage.py load_sample_data
```

### Module Import Errors
```bash
# Reinstall dependencies
pip install -r requirements.txt
```

### Permission Denied (macOS/Linux)
```bash
chmod +x manage.py
```

## Production Deployment

For production:

1. Set `DEBUG=False`
2. Generate secure `DJANGO_SECRET_KEY`
3. Configure `ALLOWED_HOSTS`
4. Use PostgreSQL or MySQL database
5. Set up static/media file serving
6. Enable HTTPS
7. Use production WSGI server (Gunicorn, uWSGI)
8. Set up environment variables on server

## Support

For issues or questions, please:
1. Check the [README.md](./README.md) for detailed documentation
2. Review the [QUICKSTART.md](./QUICKSTART.md) for quick reference
3. Check Django and DRF documentation
4. Open an issue on the repository

---

**Happy coding! 🚀**
