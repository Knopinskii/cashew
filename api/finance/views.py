import calendar
from collections import defaultdict
from decimal import Decimal, ROUND_HALF_UP

from django.db.models import Sum, Q
from django.utils import timezone
from rest_framework import status, viewsets
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


def _money(value):
    """Two decimal places, or None when there is nothing to compare against."""
    if value is None:
        return None
    return float(Decimal(value).quantize(Decimal('0.01'), rounding=ROUND_HALF_UP))


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
        month = self.request.query_params.get('month')
        if month:
            qs = qs.filter(date__month=month)
        year = self.request.query_params.get('year')
        if year: 
            qs = qs.filter(date__year=year)
        return qs



class TransactionViewSet(BaseViewSet):
    serializer_class = TransactionSerializer
    queryset = Transaction.objects.none()

    def get_queryset(self):
        qs = Transaction.objects.filter(user=self.request.user).select_related('category', 'wallet')
        wallet_id = self.request.query_params.get('wallet_id')
        if wallet_id:
            qs = qs.filter(wallet__id=wallet_id)
        month = self.request.query_params.get('month')
        if month:
            qs = qs.filter(date__month=month)
        year = self.request.query_params.get('year')
        if year: 
            qs = qs.filter(date__year=year)
        return qs


class WalletViewSet(BaseViewSet):
    serializer_class = WalletSerializer
    queryset = Wallet.objects.none()


class StatsView(APIView):
    def get(self, request):
        now = timezone.now()
        month = request.query_params.get('month') or now.month
        year = request.query_params.get('year') or now.year
        wallet_id = request.query_params.get('wallet_id')

        spent_filter = Q(
            transaction__date__month=month,
            transaction__date__year=year,
        )
        if wallet_id:
            spent_filter &= Q(transaction__wallet_id=wallet_id)

        categories = ExpenseCategory.objects.filter(user=request.user).annotate(
            spent=Sum('transaction__amount', filter=spent_filter)
        )

        data = []
        for category in categories:
            data.append({
                'category_name': category.name,
                'monthly_limit': category.monthly_limit,
                'spent': category.spent or 0,
            })

        return Response(data)

class ReportView(APIView):
    """Spending compared against the same stretch of earlier months.

    Every comparison is cut at the same day of month. Half of September
    measured against all of August always looks like an improvement, and a
    report that flatters you is worse than no report.
    """

    def get(self, request):
        today = timezone.localdate()
        try:
            month = int(request.query_params.get('month') or today.month)
            year = int(request.query_params.get('year') or today.year)
        except ValueError:
            return Response(
                {'detail': 'month and year must be integers.'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        if not 1 <= month <= 12:
            return Response(
                {'detail': 'month must be between 1 and 12.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        days_in_month = calendar.monthrange(year, month)[1]
        is_current = month == today.month and year == today.year
        # A finished month is compared whole; the running one stops at today.
        cutoff_day = min(today.day, days_in_month) if is_current else days_in_month

        wallet_id = request.query_params.get('wallet_id')
        transactions = Transaction.objects.filter(user=request.user)
        if wallet_id:
            transactions = transactions.filter(wallet_id=wallet_id)

        # One query for the whole history, then grouped in Python. The alternative
        # is several window-function queries; at personal-finance volumes the
        # clarity is worth more than the microseconds.
        rows = transactions.values_list(
            'category_id', 'category__name', 'category__category_type', 'date', 'amount'
        )

        categories = {}
        # (year, month) -> Decimal, used to work out which months count towards
        # the average: months with no activity at all would drag it to zero.
        period_totals = defaultdict(Decimal)
        active_months = set()

        for category_id, name, category_type, date, amount in rows:
            bucket = categories.setdefault(
                category_id,
                {
                    'id': str(category_id),
                    'name': name,
                    'category_type': category_type,
                    'by_period': defaultdict(Decimal),
                    'by_full_month': defaultdict(Decimal),
                },
            )
            key = (date.year, date.month)
            active_months.add(key)
            bucket['by_full_month'][key] += amount
            if date.day <= cutoff_day:
                bucket['by_period'][key] += amount
                period_totals[key] += amount

        current = (year, month)
        previous = (year - 1, 12) if month == 1 else (year, month - 1)
        earlier = sorted(m for m in active_months if m < current)

        def average(sums):
            if not earlier:
                return None
            return sum((sums.get(m, Decimal(0)) for m in earlier), Decimal(0)) / len(earlier)

        payload_categories = []
        for bucket in categories.values():
            payload_categories.append({
                'id': bucket['id'],
                'name': bucket['name'],
                'category_type': bucket['category_type'],
                'spent': _money(bucket['by_period'].get(current, Decimal(0))),
                'previous': _money(bucket['by_period'].get(previous, Decimal(0))),
                'previous_full_month': _money(bucket['by_full_month'].get(previous, Decimal(0))),
                'average': _money(average(bucket['by_period'])),
            })
        payload_categories.sort(key=lambda item: item['spent'], reverse=True)

        spent = period_totals.get(current, Decimal(0))
        daily_average = spent / cutoff_day if cutoff_day else Decimal(0)

        return Response({
            'period': {
                'month': month,
                'year': year,
                'cutoff_day': cutoff_day,
                'days_in_month': days_in_month,
                'partial': is_current and cutoff_day < days_in_month,
            },
            'totals': {
                'spent': _money(spent),
                'previous': _money(period_totals.get(previous, Decimal(0))),
                'average': _money(average(period_totals)),
                'daily_average': _money(daily_average),
                # Straight-line projection: today's pace held to month end.
                'projected': _money(daily_average * days_in_month),
                'compared_months': len(earlier),
            },
            'categories': payload_categories,
        })
