"""Custom middleware to handle internal service requests"""

class SkipHostValidationMiddleware:
    """Skip HOST header validation for internal service API calls"""
    
    def __init__(self, get_response):
        self.get_response = get_response
    
    def __call__(self, request):
        # Skip HOST validation for achievement endpoint (internal service calls)
        if request.path.startswith('/api/v1/user/achievements/'):
            # Remove the problematic Host header validation
            request.META['HTTP_HOST'] = 'localhost'
        
        response = self.get_response(request)
        return response
