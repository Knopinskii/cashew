from rest_framework import viewsets
from finance.models import IncomeCategory, ExpenseCategory, Income, Transaction
from finance.serializers import IncomeCategorySerializer, ExpenseCategorySerializer, IncomeSerializer, TransactionSerializer


class BaseViewSet(viewsets.ModelViewSet):
    pass


class IncomeCategoryViewSet(BaseViewSet):
    serializer_class = IncomeCategorySerializer
    queryset = IncomeCategory.objects.none()

    def get_queryset(self):
        user = self.request.user
        return user.income_categories.all() 
    
class ExpenseCategoryViewSet(BaseViewSet):
    serializer_class = ExpenseCategorySerializer
    queryset = ExpenseCategory.objects.none()

    def get_queryset(self):
        user = self.request.user
        return user.expense_categories.all()

class IncomeViewSet(BaseViewSet):
    serializer_class = IncomeSerializer
    queryset = Income.objects.none()

    def get_queryset(self):
        user = self.request.user
        return user.income_set.all()
    
    def perform_create(self, serializer):
      serializer.save(user=self.request.user)

class TransactionViewSet(BaseViewSet):
    serializer_class = TransactionSerializer
    queryset = Transaction.objects.none()

    def get_queryset(self):
        user = self.request.user
        return user.transactions.all()
    
    def perform_create(self, serializer):
      serializer.save(user=self.request.user)
