"""Custom middleware to handle internal service requests"""

class SkipHostValidationMiddleware:
    """Placeholder middleware for internal service API calls."""
    #  when the server starts
    def __init__(self, get_response):
        self.get_response = get_response
    # every click on a link
    def __call__(self, request):
        response = self.get_response(request)
        return response
