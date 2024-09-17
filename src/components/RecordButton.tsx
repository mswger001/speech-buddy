import React, { useState, useEffect } from "react";

const RecordButton: React.FC<{
  onStopRecording: (transcript: string) => void;
  sentence: string;
}> = ({ onStopRecording, sentence }) => {
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [transcript, setLocalTranscript] = useState<string>("");
  const [wordCount, setWordCount] = useState<number>(0);
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onstart = () => {
      console.log("Recording started...");
      setIsRecording(true);
      setLocalTranscript("");
      setWordCount(0);
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const currentTranscript = Array.from(event.results)
        .map((result) => result[0].transcript)
        .join(" ");
      setLocalTranscript(currentTranscript);

      const currentWordCount = currentTranscript
        .split(" ")
        .filter((word) => word).length;
      setWordCount(currentWordCount);

      if (timeoutId) clearTimeout(timeoutId);
      setTimeoutId(setTimeout(() => stopRecording(), 2000));

      if (currentWordCount >= 5) {
        stopRecording();
      }
    };

    recognition.onend = () => {
      console.log("Recording stopped.");
      setIsRecording(false);
      if (timeoutId) clearTimeout(timeoutId);
    };



    if (isRecording) {
      recognition.start();
    } else {
      recognition.stop();
    }

    return () => {
      recognition.stop();
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [isRecording]);

  const stopRecording = () => {
    setIsRecording(false);
    if (timeoutId) clearTimeout(timeoutId);
    console.log(sentence);
    onStopRecording(transcript); // Send the transcript to the parent component
  };

  return (
    <div style={{ marginTop: "20px" }}>
      <button className="btn" onClick={() => setIsRecording((prev) => !prev)}>
        {isRecording ? "Stop Recording" : "Start Recording"}
      </button>
      <div>
        <h3>Transcript:</h3>
        <p>{transcript}</p>
        <h3>Feedback</h3>
        <p>{sentence}</p>
      </div>
    </div>
  );
};

export default RecordButton;
