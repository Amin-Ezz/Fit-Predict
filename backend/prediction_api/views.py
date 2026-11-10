from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .serializers import PredictionRequestSerializer
from .ml_model import CardiorespiratoryPredictor, load_or_train_model

# Initialize singleton predictor instance
try:
    predictor = CardiorespiratoryPredictor()
except Exception as e:
    print("Warning: Predictor initialization deferred:", e)
    predictor = None

class PredictView(APIView):
    """
    POST /api/v1/predict/
    Accepts 10 physiological features and returns MLP cardiorespiratory predictions
    """
    def post(self, request):
        serializer = PredictionRequestSerializer(data=request.data)
        if not serializer.is_valid():
            return Response({
                'error': 'داده‌های ورودی نامعتبر هستند.',
                'details': serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)

        features = serializer.validated_data['features']
        
        global predictor
        if predictor is None:
            predictor = CardiorespiratoryPredictor()

        try:
            result = predictor.predict_features(features)
            return Response(result, status=status.HTTP_200_OK)
        except Exception as exc:
            return Response({
                'error': 'خطای پردازش در استنتاج مدل شبکه عصبی.',
                'detail': str(exc)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class ModelMetadataView(APIView):
    """
    GET /api/v1/model-info/
    Returns real validation metrics on test partition
    """
    def get(self, request):
        global predictor
        if predictor is None:
            predictor = CardiorespiratoryPredictor()
        return Response(predictor.evaluation, status=status.HTTP_200_OK)

class HealthCheckView(APIView):
    """
    GET /api/v1/health/
    """
    def get(self, request):
        return Response({
            'status': 'online',
            'service': 'FitPredict Neural Prediction Service',
            'version': '1.2.4',
            'backend': 'Django 5 + scikit-learn MLP'
        }, status=status.HTTP_200_OK)
