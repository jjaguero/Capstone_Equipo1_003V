import { useState, useEffect } from 'react';
import ApiService from '@/services/ApiService';

export interface PredictionFeatures {
  members: number;
  month: number;
  dayOfWeek: number;
  sector: string;
}

export interface Prediction {
  homeId: string;
  predictedLiters: number;
  date: string;
  confidence: string;
  features: PredictionFeatures;
}

export const usePredictions = (homeId: string | undefined, days: number = 7) => {
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!homeId) {
      setLoading(false);
      return;
    }

    const fetchPredictions = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await ApiService.fetchDataWithAxios<Prediction[]>({
          url: `/predictions/home/${homeId}/next-days?days=${days}`,
          method: 'get',
        });
        setPredictions(response);
      } catch (err: any) {
        console.error('Error fetching predictions:', err);
        setError(err.message || 'Error al cargar predicciones');
        setPredictions([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPredictions();
  }, [homeId, days]);

  return { predictions, loading, error };
};

export const useTomorrowPrediction = (homeId: string | undefined) => {
  const [prediction, setPrediction] = useState<Prediction | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!homeId) {
      setLoading(false);
      return;
    }

    const fetchPrediction = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await ApiService.fetchDataWithAxios<Prediction>({
          url: `/predictions/home/${homeId}`,
          method: 'get',
        });
        setPrediction(response);
      } catch (err: any) {
        console.error('Error fetching prediction:', err);
        setError(err.message || 'Error al cargar predicción');
        setPrediction(null);
      } finally {
        setLoading(false);
      }
    };

    fetchPrediction();
  }, [homeId]);

  return { prediction, loading, error };
};
