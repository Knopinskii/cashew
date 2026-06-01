from django.db.models import Sum, Q
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
        qs = Income.objects.filter(user=self.request.user).select_related('category', 'wallet')
        wallet_id = self.request.query_params.get('wallet_id')
        if wallet_id:
            qs = qs.filter(wallet__id=wallet_id)
        return qs



class TransactionViewSet(BaseViewSet):
    serializer_class = TransactionSerializer
    queryset = Transaction.objects.none()

    def get_queryset(self):
        qs = Transaction.objects.filter(user=self.request.user).select_related('category', 'wallet')
        wallet_id = self.request.query_params.get('wallet_id')
        if wallet_id:
            qs = qs.filter(wallet__id=wallet_id)
        return qs


class WalletViewSet(BaseViewSet):
    serializer_class = WalletSerializer
    queryset = Wallet.objects.none()


class StatsView(APIView):
    def get(self, request):
        now = timezone.now()
        categories = ExpenseCategory.objects.filter(user=request.user).annotate(
            spent=Sum(
                'transaction__amount',
                filter=Q(
                    transaction__date__month=now.month,
                    transaction__date__year=now.year,
                )
            )
        )

        data = []
        for category in categories:
            data.append({
                'category_name': category.name,
                'monthly_limit': category.monthly_limit,
                'spent': category.spent or 0,
            })

        return Response(data)