from django.contrib import admin
from django.urls import path, include, re_path

urlpatterns = [
    path("admin/", admin.site.urls),
    path('api/finance/', include('finance.urls')),
    path('api/users/', include('users.urls')),
    path('api-auth/', include('rest_framework.urls')),
    re_path(r'^auth/', include('djoser.urls')),
    re_path(r'^auth/', include('djoser.urls.authtoken')),
]
