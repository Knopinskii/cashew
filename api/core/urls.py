from django.urls import path

from core import views 




urlpatterns = [
    path('health/', views.health),
    path("check-auth/", views.check_auth)
    ]
