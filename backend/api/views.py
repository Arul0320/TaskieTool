from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth.models import User
from django.db.models import Q, Count, Sum, F
from django.utils import timezone

from .models import (
    UserProfile, Workspace, Board, List, Card, Comment,
    Attachment, ActivityLog, Achievement
)
from .serializers import (
    UserSerializer, UserProfileSerializer, WorkspaceSerializer,
    BoardSerializer, ListSerializer, CardSerializer, CommentSerializer,
    AttachmentSerializer, ActivityLogSerializer, AchievementSerializer,
    DashboardStatsSerializer
)


class UserViewSet(viewsets.ModelViewSet):
    """User management endpoints"""
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

    @action(detail=False, methods=['get'])
    def me(self, request):
        """Get current user profile"""
        serializer = UserSerializer(request.user)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def profile(self, request):
        """Get current user profile with extended info"""
        try:
            profile = request.user.profile
            serializer = UserProfileSerializer(profile)
            return Response(serializer.data)
        except UserProfile.DoesNotExist:
            return Response({'error': 'Profile not found'}, status=status.HTTP_404_NOT_FOUND)


class UserProfileViewSet(viewsets.ModelViewSet):
    """UserProfile management endpoints"""
    queryset = UserProfile.objects.all()
    serializer_class = UserProfileSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return UserProfile.objects.filter(user__profile__isnull=False)


class WorkspaceViewSet(viewsets.ModelViewSet):
    """Workspace management endpoints"""
    queryset = Workspace.objects.all()
    serializer_class = WorkspaceSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return Workspace.objects.filter(members=user)

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

    def perform_update(self, serializer):
        serializer.save()

    @action(detail=True, methods=['post'])
    def add_member(self, request, pk=None):
        """Add member to workspace"""
        workspace = self.get_object()
        user_id = request.data.get('user_id')
        try:
            user = User.objects.get(id=user_id)
            workspace.members.add(user)
            return Response({'status': 'Member added'})
        except User.DoesNotExist:
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

    @action(detail=True, methods=['post'])
    def remove_member(self, request, pk=None):
        """Remove member from workspace"""
        workspace = self.get_object()
        user_id = request.data.get('user_id')
        try:
            user = User.objects.get(id=user_id)
            workspace.members.remove(user)
            return Response({'status': 'Member removed'})
        except User.DoesNotExist:
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)


class BoardViewSet(viewsets.ModelViewSet):
    """Board management endpoints"""
    queryset = Board.objects.all()
    serializer_class = BoardSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return Board.objects.filter(workspace__members=user)

    @action(detail=True, methods=['post'])
    def toggle_favorite(self, request, pk=None):
        """Toggle board favorite status"""
        board = self.get_object()
        board.is_favorite = not board.is_favorite
        board.save()
        return Response({'is_favorite': board.is_favorite})


class ListViewSet(viewsets.ModelViewSet):
    """List management endpoints"""
    queryset = List.objects.all()
    serializer_class = ListSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return List.objects.filter(board__workspace__members=user)


class CardViewSet(viewsets.ModelViewSet):
    """Card management endpoints"""
    queryset = Card.objects.all()
    serializer_class = CardSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return Card.objects.filter(
            Q(student=user) | Q(list__board__workspace__members=user)
        ).distinct()

    def perform_create(self, serializer):
        serializer.save()

    @action(detail=True, methods=['post'])
    def add_comment(self, request, pk=None):
        """Add comment to card"""
        card = self.get_object()
        text = request.data.get('text')
        if not text:
            return Response({'error': 'Text is required'}, status=status.HTTP_400_BAD_REQUEST)

        comment = Comment.objects.create(
            id=f"comment-{timezone.now().timestamp()}",
            card=card,
            user=request.user,
            text=text
        )
        serializer = CommentSerializer(comment)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['post'])
    def add_achievement(self, request, pk=None):
        """Add achievement to card"""
        card = self.get_object()
        achievement_id = request.data.get('achievement_id')
        try:
            achievement = Achievement.objects.get(id=achievement_id)
            card.achievements.add(achievement)
            return Response({'status': 'Achievement added'})
        except Achievement.DoesNotExist:
            return Response({'error': 'Achievement not found'}, status=status.HTTP_404_NOT_FOUND)

    @action(detail=True, methods=['post'])
    def log_activity(self, request, pk=None):
        """Log activity for card"""
        card = self.get_object()
        text = request.data.get('text')
        if not text:
            return Response({'error': 'Text is required'}, status=status.HTTP_400_BAD_REQUEST)

        log = ActivityLog.objects.create(
            id=f"log-{timezone.now().timestamp()}",
            card=card,
            user=request.user,
            text=text
        )
        serializer = ActivityLogSerializer(log)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class CommentViewSet(viewsets.ModelViewSet):
    """Comment management endpoints"""
    queryset = Comment.objects.all()
    serializer_class = CommentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return Comment.objects.filter(
            Q(user=user) | Q(card__list__board__workspace__members=user)
        ).distinct()


class AttachmentViewSet(viewsets.ModelViewSet):
    """Attachment management endpoints"""
    queryset = Attachment.objects.all()
    serializer_class = AttachmentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return Attachment.objects.filter(
            card__list__board__workspace__members=user
        ).distinct()


class ActivityLogViewSet(viewsets.ModelViewSet):
    """Activity Log management endpoints"""
    queryset = ActivityLog.objects.all()
    serializer_class = ActivityLogSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return ActivityLog.objects.filter(
            card__list__board__workspace__members=user
        ).distinct()


class AchievementViewSet(viewsets.ModelViewSet):
    """Achievement management endpoints"""
    queryset = Achievement.objects.all()
    serializer_class = AchievementSerializer
    permission_classes = [IsAuthenticated]


class DashboardViewSet(viewsets.ViewSet):
    """Dashboard statistics endpoints"""
    permission_classes = [IsAuthenticated]

    @action(detail=False, methods=['get'])
    def stats(self, request):
        """Get dashboard statistics for current user"""
        user = request.user

        # Get workspaces where user is member
        workspaces = Workspace.objects.filter(members=user)
        
        # Get all boards in these workspaces
        boards = Board.objects.filter(workspace__in=workspaces)

        # Calculate stats
        total_courses = workspaces.count()
        
        # Cards for this user or in user's workspaces
        cards = Card.objects.filter(
            Q(student=user) | Q(list__board__workspace__members=user)
        ).distinct()
        
        total_activities = cards.count()
        completed_activities = cards.filter(status='Completed').count()
        total_hours = cards.aggregate(Sum('hours_spent'))['hours_spent__sum'] or 0

        # Recent activity
        recent_activities = ActivityLog.objects.filter(
            card__in=cards
        ).order_by('-created_at')[:10]

        recent_activity_data = [
            {
                'id': log.id,
                'text': log.text,
                'board_name': log.card.list.board.name,
                'user_name': log.user.username,
                'created_at': log.created_at.isoformat()
            }
            for log in recent_activities
        ]

        stats = {
            'total_courses': total_courses,
            'total_activities': total_activities,
            'completed_activities': completed_activities,
            'total_hours': total_hours,
            'recent_activity': recent_activity_data
        }

        serializer = DashboardStatsSerializer(stats)
        return Response(serializer.data)
