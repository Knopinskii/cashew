import calendar
from datetime import date, timedelta
from decimal import Decimal

from django.conf import settings
from django.contrib.auth import get_user_model
from django.test import TestCase
from rest_framework.test import APIClient

from finance.models import ExpenseCategory, Transaction, Wallet

User = get_user_model()


class ReportViewTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username="owner", email="owner@example.com", password="pw"
        )
        self.wallet = Wallet.objects.create(user=self.user, name="Main", currency="EUR")
        self.rent = ExpenseCategory.objects.create(
            user=self.user, name="Rent", category_type=ExpenseCategory.STABLE
        )
        self.food = ExpenseCategory.objects.create(
            user=self.user, name="Food", category_type=ExpenseCategory.FLOATING
        )
        self.client = APIClient()
        self.client.force_authenticate(self.user)

    def spend(self, category, when, amount):
        return Transaction.objects.create(
            user=self.user,
            wallet=self.wallet,
            category=category,
            amount=Decimal(amount),
            date=when,
        )

    def report(self, **params):
        response = self.client.get("/api/finance/report/", params)
        self.assertEqual(response.status_code, 200)
        return response.json()

    def category(self, payload, name):
        return next(c for c in payload["categories"] if c["name"] == name)

    def test_finished_month_is_compared_whole(self):
        self.spend(self.food, date(2025, 1, 20), "100.00")
        self.spend(self.food, date(2025, 2, 15), "60.00")
        self.spend(self.food, date(2025, 2, 26), "40.00")

        payload = self.report(month=2, year=2025, wallet_id=str(self.wallet.id))

        self.assertEqual(payload["period"]["cutoff_day"], 28)
        self.assertFalse(payload["period"]["partial"])
        # Both February transactions count, including the one on the 26th.
        self.assertEqual(payload["totals"]["spent"], 100.0)
        self.assertEqual(payload["totals"]["previous"], 100.0)

    def test_running_month_stops_at_today(self):
        today = date.today()
        days_in_month = calendar.monthrange(today.year, today.month)[1]
        if today.day == days_in_month:
            self.skipTest("last day of the month leaves nothing to cut off")

        self.spend(self.food, today, "30.00")
        self.spend(self.food, date(today.year, today.month, days_in_month), "500.00")

        payload = self.report(month=today.month, year=today.year)

        self.assertEqual(payload["period"]["cutoff_day"], today.day)
        self.assertTrue(payload["period"]["partial"])
        # The later transaction exists but lies beyond today, so it is excluded.
        self.assertEqual(payload["totals"]["spent"], 30.0)

    def test_previous_month_is_cut_at_the_same_day(self):
        self.spend(self.food, date(2025, 3, 5), "10.00")
        self.spend(self.food, date(2025, 4, 5), "70.00")
        self.spend(self.food, date(2025, 4, 20), "200.00")

        # The cutoff comes from the month being viewed: May has 31 days, so the
        # April period runs 1..31 and both April transactions fall inside it.
        payload = self.report(month=5, year=2025)
        self.assertEqual(payload["totals"]["previous"], 270.0)

    def test_average_uses_only_months_with_activity(self):
        self.spend(self.food, date(2025, 1, 10), "100.00")
        self.spend(self.food, date(2025, 3, 10), "200.00")
        self.spend(self.food, date(2025, 4, 10), "50.00")

        payload = self.report(month=4, year=2025)

        # January and March are averaged; February never happened and does not
        # drag the figure down.
        self.assertEqual(payload["totals"]["average"], 150.0)
        self.assertEqual(payload["totals"]["compared_months"], 2)

    def test_projection_holds_todays_pace(self):
        self.spend(self.food, date(2025, 2, 1), "28.00")
        payload = self.report(month=2, year=2025)

        # A finished month: 28 spent over 28 days is 1.00 a day, 28.00 projected.
        self.assertEqual(payload["totals"]["daily_average"], 1.0)
        self.assertEqual(payload["totals"]["projected"], 28.0)

    def test_category_type_is_reported(self):
        self.spend(self.rent, date(2025, 2, 1), "800.00")
        self.spend(self.food, date(2025, 2, 2), "50.00")

        payload = self.report(month=2, year=2025)

        self.assertEqual(self.category(payload, "Rent")["category_type"], "stable")
        self.assertEqual(self.category(payload, "Food")["category_type"], "floating")
        # Sorted by spend, so rent leads.
        self.assertEqual(payload["categories"][0]["name"], "Rent")

    def test_wallet_filter_excludes_other_wallets(self):
        other = Wallet.objects.create(user=self.user, name="Cash", currency="EUR")
        self.spend(self.food, date(2025, 2, 1), "10.00")
        Transaction.objects.create(
            user=self.user, wallet=other, category=self.food,
            amount=Decimal("999.00"), date=date(2025, 2, 2),
        )

        payload = self.report(month=2, year=2025, wallet_id=str(self.wallet.id))
        self.assertEqual(payload["totals"]["spent"], 10.0)

    def test_another_users_spending_is_invisible(self):
        stranger = User.objects.create_user(
            username="stranger", email="stranger@example.com", password="pw"
        )
        stranger_wallet = Wallet.objects.create(
            user=stranger, name="Theirs", currency="EUR"
        )
        stranger_category = ExpenseCategory.objects.create(
            user=stranger, name="Theirs", category_type=ExpenseCategory.FLOATING
        )
        Transaction.objects.create(
            user=stranger, wallet=stranger_wallet, category=stranger_category,
            amount=Decimal("5000.00"), date=date(2025, 2, 1),
        )

        payload = self.report(month=2, year=2025)
        self.assertEqual(payload["totals"]["spent"], 0)
        self.assertEqual(payload["categories"], [])

    def test_bad_month_is_rejected(self):
        self.assertEqual(
            self.client.get("/api/finance/report/", {"month": 13}).status_code, 400
        )
        self.assertEqual(
            self.client.get("/api/finance/report/", {"month": "abc"}).status_code, 400
        )

    def test_anonymous_access_is_denied(self):
        self.assertEqual(
            APIClient().get("/api/finance/report/").status_code, 401
        )


class RefreshTokenTests(TestCase):
    """The frontend renews access tokens in the background; if this flow breaks
    the symptom is everyone being signed out, which is worth a test."""

    def setUp(self):
        self.password = "not-a-real-password"
        self.user = User.objects.create_user(
            username="renewer", email="renewer@example.com", password=self.password
        )
        self.client = APIClient()

    def test_refresh_returns_a_working_access_token(self):
        pair = self.client.post(
            "/api/auth/jwt/create/",
            {"email": self.user.email, "password": self.password},
        ).json()
        self.assertIn("refresh", pair, "login must hand back a refresh token")

        refreshed = self.client.post(
            "/api/auth/jwt/refresh/", {"refresh": pair["refresh"]}
        )
        self.assertEqual(refreshed.status_code, 200)
        access = refreshed.json()["access"]
        self.assertNotEqual(access, pair["access"])

        self.client.credentials(HTTP_AUTHORIZATION=f"JWT {access}")
        self.assertEqual(self.client.get("/api/finance/report/").status_code, 200)

    def test_a_junk_refresh_token_is_rejected(self):
        response = self.client.post(
            "/api/auth/jwt/refresh/", {"refresh": "not.a.token"}
        )
        self.assertEqual(response.status_code, 401)

    def test_refresh_outlives_access(self):
        # The whole point of the pair: access is short lived, refresh carries
        # the session. Equal lifetimes would sign the user out on schedule.
        self.assertGreater(
            settings.SIMPLE_JWT["REFRESH_TOKEN_LIFETIME"],
            settings.SIMPLE_JWT["ACCESS_TOKEN_LIFETIME"],
        )


class PaginationTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username="lister", email="lister@example.com", password="pw"
        )
        self.wallet = Wallet.objects.create(user=self.user, name="Main", currency="EUR")
        self.category = ExpenseCategory.objects.create(user=self.user, name="Food")
        self.client = APIClient()
        self.client.force_authenticate(self.user)

    def make_transactions(self, count):
        Transaction.objects.bulk_create(
            Transaction(
                user=self.user,
                wallet=self.wallet,
                category=self.category,
                amount=Decimal("1.00"),
                date=date(2025, 1, 1) + timedelta(days=index),
            )
            for index in range(count)
        )

    def test_transactions_come_back_in_an_envelope(self):
        self.make_transactions(3)
        payload = self.client.get("/api/finance/transactions/").json()

        self.assertEqual(payload["count"], 3)
        self.assertIsNone(payload["next"])
        self.assertEqual(len(payload["results"]), 3)

    def test_a_long_list_is_split_and_nothing_is_lost(self):
        self.make_transactions(60)

        first = self.client.get("/api/finance/transactions/").json()
        self.assertEqual(first["count"], 60)
        self.assertEqual(len(first["results"]), 50)
        self.assertIsNotNone(first["next"], "a second page must be advertised")

        second = self.client.get("/api/finance/transactions/", {"page": 2}).json()
        self.assertEqual(len(second["results"]), 10)
        self.assertIsNone(second["next"])

        # The client walks the pages; the two together must be the whole set
        # with nothing repeated. A page that repeats or drops rows is the exact
        # failure the ordering on the model exists to prevent.
        ids = [row["id"] for row in first["results"] + second["results"]]
        self.assertEqual(len(set(ids)), 60)

    def test_small_collections_are_not_paginated(self):
        # Wallets and categories are bounded by how people use the app, so they
        # stay plain lists rather than making every caller unwrap six rows.
        for url in (
            "/api/finance/wallets/",
            "/api/finance/expense-categories/",
            "/api/finance/income-categories/",
        ):
            with self.subTest(url=url):
                self.assertIsInstance(self.client.get(url).json(), list)


class IsolationTests(TestCase):
    """Two users, one database. These are the failures you learn about from the
    person they happened to, so they are worth asserting rather than assuming."""

    def setUp(self):
        self.owner = User.objects.create_user(
            username="owner", email="owner@example.com", password="pw"
        )
        self.stranger = User.objects.create_user(
            username="stranger", email="stranger@example.com", password="pw"
        )
        self.owner_wallet = Wallet.objects.create(
            user=self.owner, name="Mine", currency="EUR"
        )
        self.owner_category = ExpenseCategory.objects.create(
            user=self.owner, name="Food"
        )
        self.stranger_category = ExpenseCategory.objects.create(
            user=self.stranger, name="Theirs"
        )
        self.client = APIClient()
        self.client.force_authenticate(self.stranger)

    def test_a_stranger_cannot_spend_from_someone_elses_wallet(self):
        response = self.client.post(
            "/api/finance/transactions/",
            {
                "wallet": str(self.owner_wallet.id),
                "category": str(self.stranger_category.id),
                "amount": "10.00",
                "date": "2025-02-01",
            },
        )

        self.assertEqual(response.status_code, 400)
        self.assertEqual(Transaction.objects.filter(wallet=self.owner_wallet).count(), 0)

    def test_a_stranger_cannot_use_someone_elses_category(self):
        stranger_wallet = Wallet.objects.create(
            user=self.stranger, name="Theirs", currency="EUR"
        )
        response = self.client.post(
            "/api/finance/transactions/",
            {
                "wallet": str(stranger_wallet.id),
                "category": str(self.owner_category.id),
                "amount": "10.00",
                "date": "2025-02-01",
            },
        )

        self.assertEqual(response.status_code, 400)
        self.assertEqual(Transaction.objects.count(), 0)

    def test_a_stranger_cannot_read_someone_elses_transactions(self):
        Transaction.objects.create(
            user=self.owner,
            wallet=self.owner_wallet,
            category=self.owner_category,
            amount=Decimal("99.00"),
            date=date(2025, 2, 1),
        )

        payload = self.client.get("/api/finance/transactions/").json()
        self.assertEqual(payload["count"], 0)

    def test_a_stranger_cannot_edit_someone_elses_transaction(self):
        theirs = Transaction.objects.create(
            user=self.owner,
            wallet=self.owner_wallet,
            category=self.owner_category,
            amount=Decimal("99.00"),
            date=date(2025, 2, 1),
        )

        # Not in the stranger's queryset at all, so it may as well not exist.
        response = self.client.patch(
            f"/api/finance/transactions/{theirs.id}/", {"amount": "1.00"}
        )
        self.assertEqual(response.status_code, 404)
        theirs.refresh_from_db()
        self.assertEqual(theirs.amount, Decimal("99.00"))
