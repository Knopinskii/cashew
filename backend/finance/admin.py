from django.contrib import admin
from finance.models import IncomeCategory, ExpenseCategory, Income, Transaction

admin.site.register(IncomeCategory)
admin.site.register(ExpenseCategory)
admin.site.register(Income)
admin.site.register(Transaction)