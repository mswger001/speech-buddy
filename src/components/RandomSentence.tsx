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
  "I will read that book tomorrow.",
  "We went to the beach last weekend.",
  "The dog barked all night.",
  "She decided to take a walk in the park.",
  "He likes to play the guitar in his free time.",
  "They traveled to France last summer.",
  "The car broke down on the way to the office.",
  "He forgot his wallet at home.",
  "She is learning how to play the piano.",
  "They have a meeting scheduled for next week.",
  "The baby is sleeping in the crib.",
  "He cooked a delicious dinner for his friends.",
  "She missed her flight to New York.",
  "They enjoy hiking in the mountains.",
  "I forgot to bring my umbrella.",
  "He loves watching science fiction movies.",
  "She spends hours painting landscapes.",
  "They went camping in the forest last weekend.",
  "The bus was delayed due to traffic.",
  "He has been working on that project for months.",
  "She invited all her friends to the party.",
  "They planted trees in their backyard.",
  "I finished reading that book yesterday.",
  "He is a great chess player.",
  "She plans to visit her grandparents next month.",
  "They live in a small town by the river.",
  "The rain started pouring just as we left.",
  "He runs every morning before work.",
  "She joined a local yoga class.",
  "They rented a cabin in the woods for the weekend.",
  "I found my keys under the couch.",
  "He built a birdhouse for the garden.",
  "She painted the walls a light blue color.",
  "They took a boat ride around the island.",
  "The flowers in the garden are blooming beautifully.",
  "He is training for a marathon.",
  "She learned how to bake bread during the pandemic.",
  "They bought a new coffee machine for the kitchen.",
  "I haven't seen that movie yet.",
  "He works as a software developer.",
  "She took a photography class last year.",
  "They rescued a stray kitten from the street.",
  "The concert was canceled due to bad weather.",
  "He enjoys going to the gym after work.",
  "She is writing a novel in her spare time.",
  "They ordered pizza for dinner last night.",
  "The train arrived at the station on time.",
  "He likes to watch the sunset from his balcony.",
  "She bought a new pair of shoes.",
  "They adopted a puppy from the animal shelter.",
  "The library is open until 8 PM tonight.",
  "He drives a red sports car.",
  "She always drinks coffee in the morning.",
  "They are planning a vacation to Spain.",
  "The flight was delayed by two hours.",
  "He has been practicing the piano for years.",
  "She prefers to work from home.",
  "They hosted a barbecue for their neighbors.",
  "I forgot to charge my phone last night.",
  "He enjoys reading detective novels.",
  "She travels abroad for work frequently.",
  "They have two children, a boy and a girl.",
  "The weather was perfect for a picnic.",
  "He is studying for his final exams.",
  "She watched a documentary about space exploration.",
  "They bought tickets to the theater show.",
  "The bakery sells fresh bread every morning.",
  "He spends his weekends volunteering at a shelter.",
  "She decorated the living room with new furniture.",
  "They installed solar panels on their roof.",
  "I went for a walk along the beach.",
  "He took the day off to relax.",
  "She donated clothes to the charity shop.",
  "They celebrated their anniversary at a fancy restaurant.",
  "The coffee shop is always busy in the mornings.",
  "He forgot to set his alarm last night.",
  "She enjoys painting landscapes in her free time.",
  "They are planning a surprise party for their friend.",
  "I spent the afternoon reading by the pool.",
  "He took up cycling as a new hobby.",
  "She baked cookies for the school bake sale.",
  "They rented a car for their road trip.",
  "The sun was shining brightly in the sky.",
  "He is looking for a new job.",
  "She called her mom to check in.",
  "They moved to a new apartment last month.",
  "I ordered a new laptop online.",
  "He likes to collect vintage records.",
  "She went to the art gallery on Friday.",
  "They took their dog for a long walk in the park.",
  "The kids are playing in the backyard.",
  "He finished his homework before dinner.",
  "She loves gardening and growing her own vegetables.",
  "They have been married for five years.",
  "The bus station was crowded this morning.",
  "He forgot his jacket at the restaurant.",
  "She enjoys practicing yoga every morning.",
  "They bought plane tickets to visit family.",
  "I found a new recipe to try for dinner.",
  "He fixed the leaky faucet in the kitchen.",
  "She sings in a choir on the weekends.",
  "They spent the day at the amusement park.",
  "The hotel has a beautiful view of the ocean.",
  "He studied architecture in college.",
  "She prepared a presentation for the meeting.",
  "They went to a comedy show last night.",
  "The restaurant was fully booked, so we ate elsewhere.",
];

// Use environment variable for the API key
const apiKey = "AIzaSyC4s6cd7CQG_tm0HcjJSbKgL3o7pwgA1-Y"; // Ensure to keep your API key secure
const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

const RandomSentence: React.FC<{
  // onStopRecording: (transcript: string) => void;
}> = () => {
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
      const randomIndex = Math.floor(Math.random() * sentences.length);
      const selectedSentence = sentences[randomIndex];
      // const generatedSentence = result.response.text; // Accessing text directly
      setSentence(selectedSentence);
      setLocalTranscript(""); // Clear transcript on new sentence
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
    const prompt = `I tried to say: "${transcript}", but the intended sentence was: "${original}". Provide feedback on pronunciation differences and suggestions. make it short, ignore punctuation, try help me on how to pronounce each word not said right ignore capitals too`;

    try {
      const result = await model.generateContent(prompt);
      const feedbackText = result.response.text; // Access text correctly
      setFeedback(feedbackText);
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
    };

    recognition.onend = () => {
      console.log("Recording stopped.");
      setIsRecording(false);
      console.log(localTranscript);

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
      console.log(localTranscript);
      // Call the feedback function with the latest transcript
      getPronunciationFeedback(sentence, localTranscript);
    }

    return () => {
      recognition.stop();
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [isRecording]);

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
        <h3>Your Transcript:</h3>
        <p>{localTranscript}</p>
      </div>
      {sentence && localTranscript && (
        <div className="feedback-section">
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
