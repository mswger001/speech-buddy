import React, { useState } from "react";
import RandomSentence from "./components/RandomSentence";
import "./App.css";

const App: React.FC = () => {
  return (
    <div style={{ padding: "20px" }} className="container">
      <h1>AI Speech Buddy</h1>
      <RandomSentence />
    </div>
  );
};

export default App;
