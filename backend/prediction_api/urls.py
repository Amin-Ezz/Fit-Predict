from django.urls import path
from .views import PredictView, ModelMetadataView, HealthCheckView

urlpatterns = [
    path('predict/', PredictView.as_view(), name='api-predict'),
    path('model-info/', ModelMetadataView.as_view(), name='api-model-info'),
    path('health/', HealthCheckView.as_view(), name='api-health'),
]
