from django.contrib import admin
from .models import (
    UserProfile, Workspace, Board, List, Card, Comment,
    Attachment, ActivityLog, Achievement
)


@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ['user', 'role', 'student_id', 'department', 'joined_at']
    list_filter = ['role', 'joined_at']
    search_fields = ['user__username', 'student_id']


@admin.register(Workspace)
class WorkspaceAdmin(admin.ModelAdmin):
    list_display = ['name', 'created_by', 'course_code', 'semester', 'created_at']
    list_filter = ['created_at', 'semester']
    search_fields = ['name', 'course_code']


@admin.register(Board)
class BoardAdmin(admin.ModelAdmin):
    list_display = ['name', 'workspace', 'is_favorite', 'academic_year', 'created_at']
    list_filter = ['is_favorite', 'created_at']
    search_fields = ['name']


@admin.register(List)
class ListAdmin(admin.ModelAdmin):
    list_display = ['name', 'board', 'category_type', 'order']
    list_filter = ['category_type']
    search_fields = ['name']


@admin.register(Card)
class CardAdmin(admin.ModelAdmin):
    list_display = ['activity_title', 'student', 'activity_type', 'status', 'start_date', 'hours_spent']
    list_filter = ['status', 'activity_type', 'start_date']
    search_fields = ['activity_title', 'student__username']


@admin.register(Comment)
class CommentAdmin(admin.ModelAdmin):
    list_display = ['user', 'card', 'created_at']
    list_filter = ['created_at']
    search_fields = ['text', 'user__username']


@admin.register(Attachment)
class AttachmentAdmin(admin.ModelAdmin):
    list_display = ['name', 'card', 'uploaded_at']
    list_filter = ['uploaded_at']
    search_fields = ['name']


@admin.register(ActivityLog)
class ActivityLogAdmin(admin.ModelAdmin):
    list_display = ['card', 'user', 'created_at']
    list_filter = ['created_at']
    search_fields = ['text', 'user__username']


@admin.register(Achievement)
class AchievementAdmin(admin.ModelAdmin):
    list_display = ['name', 'is_achieved']
    list_filter = ['is_achieved']
    search_fields = ['name']
