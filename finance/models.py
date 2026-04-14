from django.db import models

class IncomeCategory(models.Model):
    name = models.CharField(max_length=30)
    user = models.ForeignKey("users.User", on_delete=models.CASCADE,related_name="income_categories")

    class Meta:
        verbose_name = "Income Category"
        verbose_name_plural = "Income Categories"
    
    def __str__(self):
        return self.name
    
class ExpenseCategory(models.Model):
    name = models.CharField(max_length=30)
    user = models.ForeignKey("users.User", on_delete=models.CASCADE, related_name='expense_categories')
    monthly_limit = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)

    class Meta:
        verbose_name = "Expense Category"
        verbose_name_plural = "Expense Categories"


    def __str__(self):
        return self.name
    
class Income(models.Model):
    user = models.ForeignKey('users.User', on_delete=models.CASCADE)
    category = models.ForeignKey('IncomeCategory', on_delete=models.CASCADE)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    note = models.CharField(max_length=30,blank=True, default="") 
    date = models.DateField()

    class Meta:
        verbose_name = "Income"
        verbose_name_plural = "Incomes"

    def __str__(self):
        return f"{self.amount} - {self.category}"
    
class Transaction(models.Model):
    user = models.ForeignKey('users.User', on_delete=models.CASCADE)
    category = models.ForeignKey('ExpenseCategory', on_delete=models.CASCADE)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    note = models.CharField(max_length=30,blank=True, default="")
    date = models.DateField()

    class Meta:
        verbose_name = "Transaction"
        verbose_name_plural = "Transactions"

    def __str__(self):
        return f"{self.amount} - {self.category}"