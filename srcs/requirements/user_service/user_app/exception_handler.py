from rest_framework.views import exception_handler
from rest_framework.response import Response
from rest_framework.exceptions import (
    NotAuthenticated,
    AuthenticationFailed,
    PermissionDenied,
    NotFound,
    MethodNotAllowed,
    ValidationError,
)


def custom_exception_handler(exc, context):
    """
    Tüm 4xx durumlarını HTTP 200 + {success: false, error: ...} formatına çevirir.
    Böylece tarayıcı konsolunda kırmızı hata satırları görünmez; frontend
    yanıtın `success` alanına bakarak hata/başarı ayrımı yapar.
    """
    response = exception_handler(exc, context)

    if response is None:
        return None

    # Hata mesajını anlamlı bir string'e çevir
    detail = response.data
    if isinstance(detail, dict):
        error_msg = detail.get('detail') or detail
    else:
        error_msg = detail

    # Varsayılan gövde
    body = {"success": False, "error": error_msg}

    # 401 / 403 — kimlik doğrulama / yetki
    if isinstance(exc, (NotAuthenticated, AuthenticationFailed)):
        body["error"] = "Authentication required."
    elif isinstance(exc, PermissionDenied):
        body["error"] = "Permission denied."
    elif isinstance(exc, NotFound):
        body["error"] = "Not found."
    elif isinstance(exc, MethodNotAllowed):
        body["error"] = "Method not allowed."
    elif isinstance(exc, ValidationError):
        body["errors"] = detail

    return Response(body, status=200)
