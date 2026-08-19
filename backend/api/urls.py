from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    UserViewSet, UserProfileViewSet, WorkspaceViewSet, BoardViewSet,
    ListViewSet, CardViewSet, CommentViewSet, AttachmentViewSet,
    ActivityLogViewSet, AchievementViewSet, DashboardViewSet
)

router = DefaultRouter()
router.register(r'users', UserViewSet)
router.register(r'profiles', UserProfileViewSet)
router.register(r'workspaces', WorkspaceViewSet)
router.register(r'boards', BoardViewSet)
router.register(r'lists', ListViewSet)
router.register(r'cards', CardViewSet)
router.register(r'comments', CommentViewSet)
router.register(r'attachments', AttachmentViewSet)
router.register(r'logs', ActivityLogViewSet)
router.register(r'achievements', AchievementViewSet)
router.register(r'dashboard', DashboardViewSet, basename='dashboard')

app_name = 'api'

urlpatterns = [
    path('', include(router.urls)),
]
