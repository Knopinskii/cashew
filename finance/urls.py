from django.urls import path, include
from rest_framework.routers import DefaultRouter

from finance import views


router = DefaultRouter()
router.register('income-categories', views.IncomeCategoryViewSet)
router.register('expense-categories', views.ExpenseCategoryViewSet)
router.register('incomes', views.IncomeViewSet)
router.register('transactions', views.TransactionViewSet)

urlpatterns = [
    path('', include(router.urls)),
]