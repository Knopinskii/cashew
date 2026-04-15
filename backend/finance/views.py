from rest_framework import viewsets
from finance.models import IncomeCategory, ExpenseCategory, Income, Transaction
from finance.serializers import IncomeCategorySerializer, ExpenseCategorySerializer, IncomeSerializer, TransactionSerializer

# Create your views here.

class BaseViewSet(viewsets.ModelViewSet):
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class IncomeCategoryViewSet(BaseViewSet):
    serializer_class = IncomeCategorySerializer
    queryset = IncomeCategory.objects.none()

    def get_queryset(self):
        return IncomeCategory.objects.filter(user=self.request.user)

class ExpenseCategoryViewSet(BaseViewSet):
    serializer_class = ExpenseCategorySerializer
    queryset = ExpenseCategory.objects.none()

    def get_queryset(self):
        return ExpenseCategory.objects.filter(user=self.request.user)

class IncomeViewSet(BaseViewSet):
    serializer_class = IncomeSerializer
    queryset = Income.objects.none()

    def get_queryset(self):
        return Income.objects.filter(user=self.request.user)

class TransactionViewSet(BaseViewSet):
    serializer_class = TransactionSerializer
    queryset = Transaction.objects.none()

    def get_queryset(self):
        return Transaction.objects.filter(user=self.request.user)
