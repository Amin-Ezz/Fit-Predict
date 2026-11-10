from rest_framework import serializers

class PredictionFeaturesSerializer(serializers.Serializer):
    age = serializers.IntegerField(
        min_value=16, 
        max_value=75, 
        error_messages={'min_value': 'سن باید حداقل ۱۶ سال باشد.', 'max_value': 'سن نباید بیش از ۷۵ سال باشد.'}
    )
    gender = serializers.CharField(max_length=10, default='male')
    height_cm = serializers.FloatField(
        min_value=140.0, 
        max_value=220.0, 
        error_messages={'min_value': 'قد باید حداقل ۱۴۰ سانتی‌متر باشد.', 'max_value': 'قد نباید بیش از ۲۲۰ سانتی‌متر باشد.'}
    )
    weight_kg = serializers.FloatField(
        min_value=40.0, 
        max_value=160.0, 
        error_messages={'min_value': 'وزن باید حداقل ۴۰ کیلوگرم باشد.', 'max_value': 'وزن نباید بیش از ۱۶۰ کیلوگرم باشد.'}
    )
    training_experience_years = serializers.FloatField(
        min_value=0.5, 
        max_value=30.0, 
        error_messages={'min_value': 'سابقه تمرین باید حداقل ۶ ماه (۰.۵ سال) باشد.'}
    )
    weekly_sessions = serializers.IntegerField(
        min_value=1, 
        max_value=7, 
        error_messages={'min_value': 'حداقل ۱ جلسه تمرین در هفته الزامی است.', 'max_value': 'حداکثر ۷ جلسه در هفته قابل ثبت است.'}
    )
    avg_session_minutes = serializers.IntegerField(
        min_value=20, 
        max_value=180, 
        error_messages={'min_value': 'مدت هر جلسه حداقل ۲۰ دقیقه است.', 'max_value': 'مدت هر جلسه حداکثر ۱۸۰ دقیقه است.'}
    )
    avg_sleep_hours = serializers.FloatField(
        min_value=4.0, 
        max_value=12.0, 
        error_messages={'min_value': 'میانگین خواب حداقل ۴ ساعت است.', 'max_value': 'میانگین خواب حداکثر ۱۲ ساعت است.'}
    )
    rpe_intensity = serializers.IntegerField(
        min_value=1, 
        max_value=10, 
        error_messages={'min_value': 'شدت مقیاس بورگ بین ۱ تا ۱۰ است.'}
    )
    resting_heart_rate = serializers.IntegerField(
        min_value=40, 
        max_value=100, 
        error_messages={'min_value': 'ضربان قلب استراحت باید بین ۴۰ تا ۱۰۰ باشد.'}
    )

class PredictionRequestSerializer(serializers.Serializer):
    features = PredictionFeaturesSerializer()
