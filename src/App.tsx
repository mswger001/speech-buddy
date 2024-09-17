import React, { useState } from "react";
import RandomSentence from "./components/RandomSentence";
import RecordButton from "./components/RecordButton";
import "./App.css";

const App: React.FC = () => {
  const [transcript, setTranscript] = useState<string>("");
  const [sentence, setSentence] = useState<string>("");

  const handleStopRecording = (newTranscript: string) => {
    setTranscript(newTranscript);
  };

  return (
    <div style={{ padding: "20px" }} className="container">
      <h1>AI Speech Buddy</h1>
      <RandomSentence transcript={transcript} setTranscript={setTranscript} />
    </div>
  );
};

export default App;
