# TaskieTool Django Backend

A comprehensive Django REST Framework backend for the TaskieTool student activity tracking system.

## Features

- **Dynamic Data Models**: All data is stored dynamically using Django ORM
- **User Management**: Role-based user profiles (Admin, Teacher, Student)
- **Workspace Management**: Create and manage courses/workspaces
- **Activity Tracking**: Track student activities with detailed information
- **Comments & Attachments**: Collaborative features with file uploads
- **Activity Logs**: Complete audit trail of all activities
- **Dashboard Statistics**: Real-time analytics and reporting
- **REST API**: Fully documented REST API with Swagger/OpenAPI
- **CORS Support**: Ready for frontend integration

## Installation

### Prerequisites
- Python 3.8+
- pip or Poetry

### Setup Steps

1. **Create Virtual Environment**
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. **Install Dependencies**
```bash
pip install -r requirements.txt
```

3. **Configure Environment**
```bash
cp .env.example .env
# Edit .env with your settings
```

4. **Initialize Database**
```bash
python manage.py migrate
```

5. **Create Superuser**
```bash
python manage.py createsuperuser
```

6. **Load Sample Data (Optional)**
```bash
python manage.py loaddata sample_data.json
```

7. **Run Development Server**
```bash
python manage.py runserver
```

Server will be available at `http://localhost:8000`

## API Documentation

### Swagger UI
- Navigate to: `http://localhost:8000/api/docs/`
- Full interactive API documentation

### Available Endpoints

#### Users
- `GET /api/users/` - List all users
- `GET /api/users/me/` - Get current user
- `GET /api/users/profile/` - Get current user profile

#### Workspaces
- `GET /api/workspaces/` - List workspaces
- `POST /api/workspaces/` - Create workspace
- `GET /api/workspaces/{id}/` - Get workspace details
- `POST /api/workspaces/{id}/add_member/` - Add member
- `POST /api/workspaces/{id}/remove_member/` - Remove member

#### Boards
- `GET /api/boards/` - List boards
- `POST /api/boards/` - Create board
- `POST /api/boards/{id}/toggle_favorite/` - Toggle favorite

#### Lists
- `GET /api/lists/` - List activity categories
- `POST /api/lists/` - Create list

#### Cards (Activities)
- `GET /api/cards/` - List all activities
- `POST /api/cards/` - Create activity
- `GET /api/cards/{id}/` - Get activity details
- `PUT /api/cards/{id}/` - Update activity
- `DELETE /api/cards/{id}/` - Delete activity
- `POST /api/cards/{id}/add_comment/` - Add comment
- `POST /api/cards/{id}/add_achievement/` - Add achievement
- `POST /api/cards/{id}/log_activity/` - Log activity

#### Comments
- `GET /api/comments/` - List comments
- `POST /api/comments/` - Create comment

#### Attachments
- `GET /api/attachments/` - List attachments
- `POST /api/attachments/` - Upload attachment

#### Activity Logs
- `GET /api/logs/` - List activity logs

#### Dashboard
- `GET /api/dashboard/stats/` - Get dashboard statistics

## Data Models

### UserProfile
```python
- user (OneToOne)
- role (Admin, Teacher, Student)
- avatar_color
- student_id
- department
- joined_at
```

### Workspace
```python
- id (CharField, Primary Key)
- name
- description
- created_by (User)
- members (Many-to-Many with User)
- course_code
- semester
- created_at
- updated_at
```

### Board
```python
- id (CharField, Primary Key)
- workspace (ForeignKey)
- name
- description
- is_favorite
- academic_year
- created_at
- updated_at
```

### List
```python
- id (CharField, Primary Key)
- board (ForeignKey)
- name
- order
- category_type
- created_at
- updated_at
```

### Card
```python
- id (CharField, Primary Key)
- list (ForeignKey)
- student (ForeignKey to User)
- activity_title
- description
- activity_type (Academic, Sports, Volunteering, Club, Leadership, Other)
- status (Planned, In Progress, Completed, Cancelled)
- start_date
- end_date
- hours_spent
- location
- mentor
- achievements (Many-to-Many)
- order
- created_at
- updated_at
```

### Comment
```python
- id (CharField, Primary Key)
- card (ForeignKey)
- user (ForeignKey)
- text
- created_at
- updated_at
```

### Attachment
```python
- id (CharField, Primary Key)
- card (ForeignKey)
- name
- file (FileField)
- url (URLField)
- uploaded_at
```

### ActivityLog
```python
- id (CharField, Primary Key)
- card (ForeignKey)
- user (ForeignKey)
- text
- created_at
```

### Achievement
```python
- id (CharField, Primary Key)
- name
- description
- is_achieved
- created_at
```

## Authentication

The API uses Django's built-in authentication. Include credentials in requests:

```bash
curl -X GET http://localhost:8000/api/users/me/ \
  -H "Authorization: Bearer {token}"
```

## Admin Panel

Access Django admin at: `http://localhost:8000/admin/`

## Development

### Run Tests
```bash
python manage.py test
```

### Format Code
```bash
black .
```

### Lint Code
```bash
flake8 .
```

## Deployment

For production deployment:
1. Set `DEBUG=False` in `.env`
2. Set a secure `DJANGO_SECRET_KEY`
3. Configure allowed hosts
4. Use a production database (PostgreSQL recommended)
5. Set up static/media file serving
6. Enable HTTPS

## Support

For issues or questions, please open an issue on the repository.
