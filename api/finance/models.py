from django.db import models
from core.models import BaseModel

class IncomeCategory(BaseModel):
    name = models.CharField(max_length=30)
    user = models.ForeignKey("users.User", on_delete=models.CASCADE,related_name="income_categories")

    class Meta:
        verbose_name = "Income Category"
        verbose_name_plural = "Income Categories"
    
    def __str__(self):
        return self.name
    
class ExpenseCategory(BaseModel):
    STABLE = "stable"
    FLOATING = "floating"
    CATEGORY_TYPES = [
        (STABLE, "Stable"),
        (FLOATING, "Floating"),
    ]

    name = models.CharField(max_length=30)
    user = models.ForeignKey("users.User", on_delete=models.CASCADE, related_name='expense_categories')
    monthly_limit = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    # Rent and a phone bill repeat unchanged: the only question is whether they
    # are paid yet. Groceries swing month to month, where the pace is what
    # matters. Reporting on both the same way makes both less useful.
    category_type = models.CharField(
        max_length=8, choices=CATEGORY_TYPES, default=FLOATING
    )

    class Meta:
        verbose_name = "Expense Category"
        verbose_name_plural = "Expense Categories"


    def __str__(self):
        return self.name

class Income(BaseModel):
    user = models.ForeignKey('users.User', on_delete=models.CASCADE)
    category = models.ForeignKey('IncomeCategory', on_delete=models.CASCADE)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    note = models.CharField(max_length=30,blank=True, default="") 
    date = models.DateField()
    wallet = models.ForeignKey('Wallet', on_delete=models.CASCADE )
    

    class Meta:
        verbose_name = "Income"
        verbose_name_plural = "Incomes"
        ordering = ['-date', '-created_at']

    def __str__(self):
        return f"{self.amount} - {self.category}"
    
class Transaction(BaseModel):
    user = models.ForeignKey('users.User', on_delete=models.CASCADE, related_name='transactions')
    category = models.ForeignKey('ExpenseCategory', on_delete=models.CASCADE)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    note = models.CharField(max_length=30,blank=True, default="")
    date = models.DateField()
    wallet = models.ForeignKey('Wallet', on_delete=models.CASCADE )

    class Meta:
        verbose_name = "Transaction"
        verbose_name_plural = "Transactions"
        ordering = ['-date', '-created_at']

    def __str__(self):
        return f"{self.amount} - {self.category}"
    

class Wallet(BaseModel): 
    
    CURRENCY_CHOICES = [
    ('USD', 'Dollar'),
    ('EUR', 'Euro'),
    ('RUB', 'Ruble'),
]


    user = models.ForeignKey("users.User", on_delete=models.CASCADE, related_name='wallets')
    name = models.CharField(max_length=30)
    currency = models.CharField(max_length=3, choices=CURRENCY_CHOICES, default='EUR')


    def __str__(self):
        return self.name
    

