from rest_framework import serializers
from django.contrib.auth.models import User
from .models import (
    UserProfile, Workspace, Board, List, Card, Comment,
    Attachment, ActivityLog, Achievement
)


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name']


class UserProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer()

    class Meta:
        model = UserProfile
        fields = ['user', 'role', 'avatar_color', 'student_id', 'department', 'joined_at']


class AchievementSerializer(serializers.ModelSerializer):
    class Meta:
        model = Achievement
        fields = ['id', 'name', 'description', 'is_achieved']


class ActivityLogSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.username', read_only=True)

    class Meta:
        model = ActivityLog
        fields = ['id', 'text', 'user_name', 'created_at']


class CommentSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.username', read_only=True)

    class Meta:
        model = Comment
        fields = ['id', 'user_name', 'text', 'created_at']


class AttachmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Attachment
        fields = ['id', 'name', 'file', 'url', 'uploaded_at']


class CardSerializer(serializers.ModelSerializer):
    comments = CommentSerializer(many=True, read_only=True)
    attachments = AttachmentSerializer(many=True, read_only=True)
    activity_logs = ActivityLogSerializer(many=True, read_only=True)
    achievements = AchievementSerializer(many=True, read_only=True)
    student_name = serializers.CharField(source='student.username', read_only=True)

    class Meta:
        model = Card
        fields = [
            'id', 'activity_title', 'description', 'activity_type', 'status',
            'start_date', 'end_date', 'hours_spent', 'location', 'mentor',
            'student_name', 'order', 'comments', 'attachments', 'activity_logs',
            'achievements', 'created_at', 'updated_at'
        ]


class ListSerializer(serializers.ModelSerializer):
    cards = CardSerializer(many=True, read_only=True)

    class Meta:
        model = List
        fields = ['id', 'name', 'order', 'category_type', 'cards', 'created_at']


class BoardSerializer(serializers.ModelSerializer):
    lists = ListSerializer(many=True, read_only=True)

    class Meta:
        model = Board
        fields = [
            'id', 'name', 'description', 'is_favorite', 'academic_year',
            'lists', 'created_at', 'updated_at'
        ]


class WorkspaceSerializer(serializers.ModelSerializer):
    boards = BoardSerializer(many=True, read_only=True)
    created_by_name = serializers.CharField(source='created_by.username', read_only=True)
    members_data = serializers.SerializerMethodField()

    class Meta:
        model = Workspace
        fields = [
            'id', 'name', 'description', 'created_by_name', 'course_code',
            'semester', 'members_data', 'boards', 'created_at', 'updated_at'
        ]

    def get_members_data(self, obj):
        return [{'id': u.id, 'username': u.username, 'email': u.email} for u in obj.members.all()]


class DashboardStatsSerializer(serializers.Serializer):
    total_courses = serializers.IntegerField()
    total_activities = serializers.IntegerField()
    completed_activities = serializers.IntegerField()
    total_hours = serializers.FloatField()
    recent_activity = serializers.ListField()
