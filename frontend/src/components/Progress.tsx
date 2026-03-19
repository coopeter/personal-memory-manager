import * as React from 'react';
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { api } from '../utils/api';

export default function Progress() {
  const { projectId } = useParams();
  const [progress, setProgress] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProgress();
  }, [projectId]);

  const loadProgress = async () => {
    try {
      const res = await api.get(`/api/projects/${projectId}/progress`);
      setProgress(res.data.sort((a: any, b: any) => 
        b.date.localeCompare(a.date)
      ));
    } catch (err) {
      console.error('Failed to load progress', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-4">Loading...</div>;
  }

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">📊 Project Progress</h2>

      <div className="space-y-4">
        {progress.map((day: any) => (
          <div key={day.id} className="p-4 bg-white rounded-lg shadow">
            <div className="font-medium text-lg mb-2">
              {day.date}
            </div>
            <div className="prose max-w-none">
              <ReactMarkdown>{day.content}</ReactMarkdown>
            </div>
          </div>
        ))}

        {progress.length === 0 && (
          <div className="text-center text-gray-500 p-8">
            No progress recorded yet
          </div>
        )}
      </div>
    </div>
  );
}
