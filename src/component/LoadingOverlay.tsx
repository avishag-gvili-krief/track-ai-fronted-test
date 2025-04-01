import React from 'react';
import { useLoading } from '../context/LoadingContext';
import '../css/LoadingOverlay.css'; 

export default function LoadingOverlay() {
  const { isLoading } = useLoading();

  if (!isLoading) return null;

  return (
    <div className="loading-overlay-container">
      <img 
        src="/loading.gif" 
        alt="Loading..." 
        className="loading-spinner"
      />
    </div>
  );
}
