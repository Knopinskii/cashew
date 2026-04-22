from rest_framework import serializers
from finance.models import IncomeCategory, ExpenseCategory, Income, Transaction


class IncomeCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = IncomeCategory
        fields = ['id','name']

   

class ExpenseCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = ExpenseCategory
        fields = ['id','name','monthly_limit']

   

class IncomeSerializer(serializers.ModelSerializer):
    user = serializers.ReadOnlyField(source='user.username')

    class Meta:
        model = Income
        fields = ['id', 'category', 'amount', 'note', 'date']

    def validate_category(self, value):
        if value.user != self.context['request'].user:
            raise serializers.ValidationError("Invalid category.")
        return value

class TransactionSerializer(serializers.ModelSerializer):
    user = serializers.ReadOnlyField(source='user.username')

    class Meta:
        model = Transaction
        fields = ['id','category', 'amount', 'note', 'date']

    def validate_category(self, value):
        if value.user != self.context['request'].user:
            raise serializers.ValidationError("Invalid category.")
        return value
