'use client'

import React, { useState, useRef } from 'react';

const BeehivePage: React.FC = () => {
  const [isPulsing, setIsPulsing] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [transcription, setTranscription] = useState('');
  const [isSending, setIsSending] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);

  const sendTranscriptToBackend = async (transcript: string) => {
    try {
      const response = await fetch('http://localhost:3000/api/transcript', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ transcript }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to send transcript');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error sending transcript:', error);
      throw error;
    }
  };

  const handleImageClick = async () => {
    try {
      if (!isRecording) {
        const recognition = new (window as any).webkitSpeechRecognition();
        recognition.continuous = false;
        recognition.lang = 'en-US';

        recognition.onresult = async (event: any) => {
          const transcript = event.results[0][0].transcript;
          setTranscription(transcript);
          
          setIsSending(true);
          try {
            const response = await sendTranscriptToBackend(transcript);
            console.log('Transcript sent successfully');
            console.log('Backend response:', response);  // Added this line to log the response
          } catch (error) {
            console.error('Failed to send transcript:', error);
          } finally {
            setIsSending(false);
          }
        };

        recognition.onerror = (event: any) => {
          console.error('Speech recognition error:', event.error);
          setIsRecording(false);
        };

        recognition.onend = () => {
          setIsRecording(false);
        };

        setIsRecording(true);
        recognition.start();
      }
    } catch (error) {
      console.error('Error starting speech recognition:', error);
      setIsRecording(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4">
      <img
        src="/banana.jpg"
        alt="Beehive"
        className={`beehive-image ${isPulsing ? 'pulse' : ''} cursor-pointer w-96 h-auto ${
          isRecording ? 'opacity-50' : ''
        }`}
        onClick={handleImageClick}
      />
      {transcription && (
        <div className="mt-4 p-4 bg-gray-100 rounded-lg">
          <p>{transcription}</p>
          {isSending && (
            <p className="text-sm text-gray-500 mt-2">Sending transcript...</p>
          )}
        </div>
      )}
    </div>
  );
};

export default BeehivePage;