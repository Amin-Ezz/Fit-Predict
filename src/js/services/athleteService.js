/**
 * FitPredict Athlete Service
 * Manages athlete status, training metrics, and weekly activity
 */

import { storage } from '../utils.js';

export class AthleteService {
  /**
   * Retrieves active athlete profile
   * @returns {Object}
   */
  getAthleteStatus() {
    return storage.get('athlete_status', {
      name: 'آرش کیانی',
      age: 28,
      gender: 'male',
      height_cm: 182,
      weight_kg: 78.5,
      training_experience_years: 4,
      primary_sport: 'تمرینات ترکیبی و دویدن (Hybrid/Running)',
      weekly_sessions: 4,
      avg_session_minutes: 65,
      avg_sleep_hours: 7.5,
      rpe_intensity: 7,
      resting_heart_rate: 59,
      last_updated: new Date().toISOString()
    });
  }

  /**
   * Updates athlete profile
   * @param {Object} updatedData 
   */
  saveAthleteStatus(updatedData) {
    const current = this.getAthleteStatus();
    const updated = {
      ...current,
      ...updatedData,
      last_updated: new Date().toISOString()
    };
    storage.set('athlete_status', updated);
    return updated;
  }

  /**
   * Returns weekly activity distribution (sample data for charts)
   */
  getWeeklyActivity() {
    return [
      { day: 'شنبه', minutes: 70, intensity: 'بالا', type: 'اینتروال هوازی' },
      { day: 'یکشنبه', minutes: 55, intensity: 'متوسط', type: 'قدرتی میان‌تنه' },
      { day: 'دوشنبه', minutes: 0, intensity: 'استراحت', type: 'ریکاوری غیرفعال' },
      { day: 'سه‌شنبه', minutes: 60, intensity: 'متوسط', type: 'هوازی پیوسته Zone 2' },
      { day: 'چهارشنبه', minutes: 75, intensity: 'بالا', type: 'قدرتی کل بدن' },
      { day: 'پنج‌شنبه', minutes: 45, intensity: 'سبک', type: 'موبیلیتی و کشش' },
      { day: 'جمعه', minutes: 0, intensity: 'استراحت', type: 'ریکاوری هفتگی' }
    ];
  }

  /**
   * Returns longitudinal VO2max and readiness trend data
   */
  getPerformanceTrend() {
    return {
      labels: ['هفته ۱', 'هفته ۲', 'هفته ۳', 'هفته ۴', 'هفته ۵', 'هفته ۶', 'هفته ۷', 'هفته ۸'],
      vo2max_values: [45.2, 45.8, 46.1, 46.5, 46.9, 47.4, 47.8, 48.6],
      readiness_values: [74, 78, 72, 80, 83, 79, 85, 84]
    };
  }
}

export const athleteService = new AthleteService();
