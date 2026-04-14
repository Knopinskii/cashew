from rest_framework import viewsets
from finance.models import IncomeCategory, ExpenseCategory, Income, Transaction
from finance.serializers import IncomeCategorySerializer, ExpenseCategorySerializer, IncomeSerializer, TransactionSerializer

# Create your views here.

class BaseViewSet(viewsets.ModelViewSet):
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class IncomeCategoryViewSet(BaseViewSet):
    queryset = IncomeCategory.objects.all()
    serializer_class = IncomeCategorySerializer

class ExpenseCategoryViewSet(BaseViewSet):
    queryset = ExpenseCategory.objects.all()
    serializer_class = ExpenseCategorySerializer

class IncomeViewSet(BaseViewSet):
    queryset = Income.objects.all()
    serializer_class = IncomeSerializer

class TransactionViewSet(BaseViewSet):
    queryset = Transaction.objects.all()
    serializer_class = TransactionSerializer
