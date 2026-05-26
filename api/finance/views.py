from django.db.models import Sum
from django.utils import timezone
from rest_framework import viewsets
from rest_framework.response import Response
from rest_framework.views import APIView

from finance.models import ExpenseCategory, Income, IncomeCategory, Transaction, Wallet
from finance.serializers import (
    ExpenseCategorySerializer,
    IncomeCategorySerializer,
    IncomeSerializer,
    TransactionSerializer,
    WalletSerializer,
)


class BaseViewSet(viewsets.ModelViewSet):
    def get_queryset(self):
        model = self.serializer_class.Meta.model
        return model.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class IncomeCategoryViewSet(BaseViewSet):
    serializer_class = IncomeCategorySerializer
    queryset = IncomeCategory.objects.none()


class ExpenseCategoryViewSet(BaseViewSet):
    serializer_class = ExpenseCategorySerializer
    queryset = ExpenseCategory.objects.none()


class IncomeViewSet(BaseViewSet):
    serializer_class = IncomeSerializer
    queryset = Income.objects.none()

    def get_queryset(self):
        return Income.objects.filter(user=self.request.user).select_related('category', 'wallet')


class TransactionViewSet(BaseViewSet):
    serializer_class = TransactionSerializer
    queryset = Transaction.objects.none()

    def get_queryset(self):
        return Transaction.objects.filter(user=self.request.user).select_related('category', 'wallet')


class WalletViewSet(BaseViewSet):
    serializer_class = WalletSerializer
    queryset = Wallet.objects.none()


class StatsView(APIView):
    def get(self, request):
        now = timezone.now()
        categories = ExpenseCategory.objects.filter(user=request.user)

        data = []
        for category in categories:
            spent = Transaction.objects.filter(
                category=category,
                date__month=now.month,
                date__year=now.year,
            ).aggregate(Sum('amount'))['amount__sum']

            data.append({
                'category_name': category.name,
                'monthly_limit': category.monthly_limit,
                'spent': spent,
            })

        return Response(data)