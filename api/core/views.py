from django.http import JsonResponse


def health(request):
    return JsonResponse({'status': 'ok'})


def check_auth(request):
    return JsonResponse({"status": request.user.is_authenticated})