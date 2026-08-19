from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from django.utils import timezone
from datetime import timedelta
from api.models import (
    UserProfile, Workspace, Board, List, Card, Achievement,
    Comment, ActivityLog
)


class Command(BaseCommand):
    help = 'Load sample data for development'

    def handle(self, *args, **options):
        self.stdout.write('Loading sample data...')

        # Create sample users
        users = []
        user_data = [
            ('alice_admin', 'alice@company.com', 'Admin', '#ef4444'),
            ('bob_manager', 'bob@company.com', 'Teacher', '#3b82f6'),
            ('charlie_student', 'charlie@company.com', 'Student', '#10b981'),
            ('dana_student', 'dana@company.com', 'Student', '#f59e0b'),
        ]

        for username, email, role, color in user_data:
            user, created = User.objects.get_or_create(
                username=username,
                defaults={
                    'email': email,
                    'first_name': username.split('_')[0].capitalize()
                }
            )
            if created:
                user.set_password('password123')
                user.save()

            profile, _ = UserProfile.objects.get_or_create(
                user=user,
                defaults={
                    'role': role,
                    'avatar_color': color,
                    'student_id': f'STU-{user.id:03d}' if role == 'Student' else None,
                    'department': 'Computer Science' if role == 'Student' else None
                }
            )
            users.append(user)

        self.stdout.write(self.style.SUCCESS(f'Created {len(users)} users'))

        # Create workspaces
        workspace1, created = Workspace.objects.get_or_create(
            id='workspace-1',
            defaults={
                'name': 'Product & Engineering',
                'description': 'Development, roadmaps, and release tasks for our core software products.',
                'created_by': users[0],
                'course_code': 'CS101',
                'semester': '2024-Spring'
            }
        )
        workspace1.members.set(users)

        workspace2, created = Workspace.objects.get_or_create(
            id='workspace-2',
            defaults={
                'name': 'Marketing & Growth',
                'description': 'Campaign design, content planning, and user acquisition workflows.',
                'created_by': users[1],
                'course_code': 'MKT201',
                'semester': '2024-Spring'
            }
        )
        workspace2.members.set(users[:3])

        self.stdout.write(self.style.SUCCESS('Created workspaces'))

        # Create boards
        board1, created = Board.objects.get_or_create(
            id='board-1',
            defaults={
                'workspace': workspace1,
                'name': 'Sprint 1 - MVP Features',
                'description': 'Core features for MVP release',
                'is_favorite': True,
                'academic_year': '2024-2025'
            }
        )

        board2, created = Board.objects.get_or_create(
            id='board-2',
            defaults={
                'workspace': workspace2,
                'name': 'Q1 Campaign',
                'description': 'First quarter marketing campaign',
                'is_favorite': False,
                'academic_year': '2024-2025'
            }
        )

        self.stdout.write(self.style.SUCCESS('Created boards'))

        # Create lists
        list1, created = List.objects.get_or_create(
            id='list-1',
            defaults={
                'board': board1,
                'name': 'To Do',
                'order': 0,
                'category_type': 'Academic'
            }
        )

        list2, created = List.objects.get_or_create(
            id='list-2',
            defaults={
                'board': board1,
                'name': 'In Progress',
                'order': 1,
                'category_type': 'Sports'
            }
        )

        list3, created = List.objects.get_or_create(
            id='list-3',
            defaults={
                'board': board1,
                'name': 'Done',
                'order': 2,
                'category_type': 'Volunteering'
            }
        )

        self.stdout.write(self.style.SUCCESS('Created lists'))

        # Create achievements
        achievement1, _ = Achievement.objects.get_or_create(
            id='achievement-1',
            defaults={
                'name': 'Task Master',
                'description': 'Complete 10 activities',
                'is_achieved': True
            }
        )

        achievement2, _ = Achievement.objects.get_or_create(
            id='achievement-2',
            defaults={
                'name': 'Hour Warrior',
                'description': 'Accumulate 100 hours',
                'is_achieved': False
            }
        )

        # Create cards
        today = timezone.now().date()
        card1, created = Card.objects.get_or_create(
            id='card-1',
            defaults={
                'list': list1,
                'student': users[2],
                'activity_title': 'Design System Documentation',
                'description': 'Create comprehensive design system documentation',
                'activity_type': 'Academic',
                'status': 'In Progress',
                'start_date': today,
                'end_date': today + timedelta(days=7),
                'hours_spent': 5.5,
                'location': 'Library',
                'mentor': 'Dr. Smith',
                'order': 0
            }
        )
        card1.achievements.add(achievement1)

        card2, created = Card.objects.get_or_create(
            id='card-2',
            defaults={
                'list': list2,
                'student': users[3],
                'activity_title': 'Community Service',
                'description': 'Volunteer at local community center',
                'activity_type': 'Volunteering',
                'status': 'Planned',
                'start_date': today + timedelta(days=1),
                'end_date': today + timedelta(days=8),
                'hours_spent': 0,
                'location': 'Community Center',
                'order': 1
            }
        )

        card3, created = Card.objects.get_or_create(
            id='card-3',
            defaults={
                'list': list3,
                'student': users[2],
                'activity_title': 'Math Competition',
                'description': 'Participated in regional math competition',
                'activity_type': 'Academic',
                'status': 'Completed',
                'start_date': today - timedelta(days=30),
                'end_date': today - timedelta(days=29),
                'hours_spent': 3,
                'location': 'Convention Center',
                'order': 0
            }
        )

        self.stdout.write(self.style.SUCCESS('Created cards'))

        # Create comments
        comment1, created = Comment.objects.get_or_create(
            id='comment-1',
            defaults={
                'card': card1,
                'user': users[1],
                'text': 'Great progress on the design system! Keep it up.'
            }
        )

        self.stdout.write(self.style.SUCCESS('Created comments'))

        # Create activity logs
        log1, created = ActivityLog.objects.get_or_create(
            id='log-1',
            defaults={
                'card': card1,
                'user': users[2],
                'text': 'Started working on design system documentation'
            }
        )

        log2, created = ActivityLog.objects.get_or_create(
            id='log-2',
            defaults={
                'card': card1,
                'user': users[2],
                'text': 'Completed initial version of documentation'
            }
        )

        self.stdout.write(self.style.SUCCESS('Created activity logs'))
        self.stdout.write(self.style.SUCCESS('Sample data loaded successfully!'))
