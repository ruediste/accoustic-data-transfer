import "./App.css";
import { startRecorderProcessorInput } from "./workletRecorder";
import { startPlayback } from "./audioBufferPlayer";
import { workletPlayback } from "./workletPlayback";
import { useState } from "react";

function App() {
  const [input, setInput] = useState("Hello");
  return (
    <div className="App">
      <button onClick={() => startRecorderProcessorInput()}>
        Start Recording
      </button>
      <button onClick={() => startPlayback()}>Start Buffer Playback</button>

      <input value={input} onChange={(e) => setInput(e.target.value)} />
      <button onClick={() => workletPlayback(input)}>Play</button>
    </div>
  );
}

export default App;
