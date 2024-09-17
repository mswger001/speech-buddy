import React, { useState, useEffect } from "react";
import { GoogleGenerativeAI } from "@google/generative-ai"; // Ensure correct import path

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }

  interface SpeechRecognitionEvent extends Event {
    results: SpeechRecognitionResultList;
  }

  interface SpeechRecognitionErrorEvent extends Event {
    error: string;
  }
}

const sentences: string[] = [
  "The cat is sitting on the mat.",
  "She took the wrong bus to work.",
  "They were late for the meeting.",
  "I went to the store to buy some groceries.",
  "He doesn't like to play soccer.",
  "She was the last person to arrive.",
  "They have completed the project successfully.",
];

// Use environment variable for the API key
const apiKey = "AIzaSyC4s6cd7CQG_tm0HcjJSbKgL3o7pwgA1-Y"; // Ensure to keep your API key secure
const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

const RandomSentence: React.FC<{
  transcript: string;
  setTranscript: (transcript: string) => void;
  // onStopRecording: (transcript: string) => void;
}> = ({ transcript, setTranscript }) => {
  const [sentence, setSentence] = useState<string>("");
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [localTranscript, setLocalTranscript] = useState<string>("");
  const [wordCount, setWordCount] = useState<number>(0);
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);
  const [feedback, setFeedback] = useState<string>(""); // For feedback on pronunciation

  const getRandomSentence = async () => {
    const prompt = "Generate a simple sentence from a random sport."; // Adjust as needed

    try {
      const result = await model.generateContent(prompt);
      const generatedSentence = result.response.text; // Accessing text directly
      setSentence(generatedSentence);
      setTranscript(""); // Clear transcript on new sentence
    } catch (error) {
      console.error("Error generating content:", error);
    }
  };

  const speakSentence = () => {
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(sentence);
      window.speechSynthesis.speak(utterance);
    } else {
      console.error("Text-to-speech is not supported in this browser.");
    }
  };

  const getPronunciationFeedback = async (
    original: string,
    transcript: string
  ) => {
    const prompt = `I tried to say: "${transcript}", but the intended sentence was: "${original}". Provide feedback on pronunciation differences and suggestions. make it short`;

    try {
      const result = await model.generateContent(prompt);
      const feedbackText = result.response.text(); // Accessing text directly
      setFeedback(feedbackText);
      //console.log(feedbackText);
    } catch (error) {
      console.error("Error getting feedback:", error);
    }
  };

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
      setTimeoutId(setTimeout(() => stopRecording(), 20000));

      if (currentWordCount >= 5) {
        stopRecording();
      }
    };

    recognition.onend = () => {
      console.log("Recording stopped.");
      setIsRecording(false);
      if (timeoutId) clearTimeout(timeoutId);
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error("Error occurred in recognition: " + event.error);
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
    // onStopRecording(localTranscript); // Use local transcript to send to parent component
    getPronunciationFeedback(sentence, localTranscript); // Get feedback on pronunciation
  };

  return (
    <div>
      <button className="btn" onClick={getRandomSentence}>
        Get Random Sentence
      </button>
      <div className="sentence">
        {sentence
          ? `"${sentence}"`
          : "Click the button to get a random sentence"}
      </div>
      {sentence && (
        <div>
          <button className="btn" onClick={speakSentence}>
            Speak Sentence
          </button>
        </div>
      )}

      <div style={{ marginTop: "20px" }}>
        <button className="btn" onClick={() => setIsRecording((prev) => !prev)}>
          {isRecording ? "Stop Recording" : "Start Recording"}
        </button>
      </div>
      {sentence && localTranscript && (
        <div className="feedback-section">
          <h3>Your Transcript:</h3>
          <p>{localTranscript}</p>
          {feedback && (
            <div>
              <h4>Feedback on Pronunciation:</h4>
              <p>{feedback}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default RandomSentence;
