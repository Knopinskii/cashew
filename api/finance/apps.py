from django.apps import AppConfig


class FinanceConfig(AppConfig):
    name = "finance"

    def ready(self):
        # Importing for the side effect of registering the receivers. Django
        # calls ready() once the app registry is populated, which is the only
        # point where importing models is safe.
        from finance import signals  # noqa: F401
