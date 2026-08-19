from django.db import models
from django.contrib.auth.models import User
from django.core.validators import MinValueValidator

# Role choices
ROLE_CHOICES = (
    ('Teacher', 'Teacher'),
    ('Student', 'Student'),
)

# Activity type choices
ACTIVITY_TYPE_CHOICES = (
    ('Academic', 'Academic'),
    ('Sports', 'Sports'),
    ('Volunteering', 'Volunteering'),
    ('Club', 'Club'),
    ('Leadership', 'Leadership'),
    ('Other', 'Other'),
)

# Activity status choices
ACTIVITY_STATUS_CHOICES = (
    ('Planned', 'Planned'),
    ('In Progress', 'In Progress'),
    ('Completed', 'Completed'),
    ('Cancelled', 'Cancelled'),
)


class UserProfile(models.Model):
    """Extended User Profile"""
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    role = models.CharField(max_length=20, choices=ROLE_CHOICES)
    avatar_color = models.CharField(max_length=7)
    student_id = models.CharField(max_length=50, blank=True, null=True)
    department = models.CharField(max_length=100, blank=True, null=True)
    joined_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} ({self.role})"

    class Meta:
        ordering = ['-joined_at']


class Workspace(models.Model):
    """Workspace/Course"""
    id = models.CharField(max_length=50, primary_key=True)
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='created_workspaces')
    members = models.ManyToManyField(User, related_name='workspaces')
    course_code = models.CharField(max_length=50, blank=True, null=True)
    semester = models.CharField(max_length=50, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name

    class Meta:
        ordering = ['-created_at']


class Board(models.Model):
    """Board/Activity Tracker"""
    id = models.CharField(max_length=50, primary_key=True)
    workspace = models.ForeignKey(Workspace, on_delete=models.CASCADE, related_name='boards')
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    is_favorite = models.BooleanField()
    academic_year = models.CharField(max_length=9, blank=True, null=True)  # e.g., "2023-2024"
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name

    class Meta:
        ordering = ['-created_at']


class List(models.Model):
    """Activity Category List"""
    id = models.CharField(max_length=50, primary_key=True)
    board = models.ForeignKey(Board, on_delete=models.CASCADE, related_name='lists')
    name = models.CharField(max_length=255)
    order = models.IntegerField()
    category_type = models.CharField(max_length=100, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.board.name} - {self.name}"

    class Meta:
        ordering = ['order', 'created_at']
        unique_together = ['board', 'name']


class Achievement(models.Model):
    """Achievement/Milestone"""
    id = models.CharField(max_length=50, primary_key=True)
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    is_achieved = models.BooleanField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name


class Card(models.Model):
    """Activity Card"""
    id = models.CharField(max_length=50, primary_key=True)
    list = models.ForeignKey(List, on_delete=models.CASCADE, related_name='cards')
    student = models.ForeignKey(User, on_delete=models.CASCADE, related_name='activities')
    activity_title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    activity_type = models.CharField(max_length=20, choices=ACTIVITY_TYPE_CHOICES)
    status = models.CharField(max_length=20, choices=ACTIVITY_STATUS_CHOICES)
    start_date = models.DateField()
    end_date = models.DateField()
    hours_spent = models.FloatField(validators=[MinValueValidator(0)])
    location = models.CharField(max_length=255, blank=True, null=True)
    mentor = models.CharField(max_length=255, blank=True, null=True)
    achievements = models.ManyToManyField(Achievement, related_name='cards', blank=True)
    order = models.IntegerField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.activity_title

    class Meta:
        ordering = ['order', 'created_at']


class Comment(models.Model):
    """Comment on Card"""
    id = models.CharField(max_length=50, primary_key=True)
    card = models.ForeignKey(Card, on_delete=models.CASCADE, related_name='comments')
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    text = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Comment by {self.user.username} on {self.card.activity_title}"

    class Meta:
        ordering = ['created_at']


class Attachment(models.Model):
    """File Attachment"""
    id = models.CharField(max_length=50, primary_key=True)
    card = models.ForeignKey(Card, on_delete=models.CASCADE, related_name='attachments')
    name = models.CharField(max_length=255)
    file = models.FileField(upload_to='attachments/%Y/%m/%d/')
    url = models.URLField(blank=True, null=True)
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

    class Meta:
        ordering = ['-uploaded_at']


class ActivityLog(models.Model):
    """Activity History/Log"""
    id = models.CharField(max_length=50, primary_key=True)
    card = models.ForeignKey(Card, on_delete=models.CASCADE, related_name='activity_logs')
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    text = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Log entry for {self.card.activity_title}"

    class Meta:
        ordering = ['-created_at']
