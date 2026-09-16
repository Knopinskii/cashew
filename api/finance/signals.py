from django.conf import settings
from django.db.models.signals import post_save
from django.dispatch import receiver

from finance.models import Wallet


@receiver(post_save, sender=settings.AUTH_USER_MODEL)
def create_default_wallet(sender, instance, created, **kwargs):
    """Give every new account somewhere to record money.

    Without a wallet the app cannot store a single transaction, so an account
    without one is not a blank slate — it is a dead end, and the way out is
    buried in Settings.

    A signal rather than the registration serializer: this way an account made
    with createsuperuser gets one too, and those are exactly the accounts
    nobody thinks to check.

    Categories are deliberately not created. A wallet is unavoidable; a list of
    categories is an opinion about how someone spends their money, and starting
    them off by deleting mine is worse than starting them off empty.
    """
    if not created:
        return
    Wallet.objects.create(user=instance, name="Main", currency="EUR")
