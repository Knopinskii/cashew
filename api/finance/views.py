from rest_framework import viewsets
from finance.models import IncomeCategory, ExpenseCategory, Income, Transaction, Wallet
from finance.serializers import IncomeCategorySerializer, ExpenseCategorySerializer, IncomeSerializer, TransactionSerializer, WalletSerializer

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