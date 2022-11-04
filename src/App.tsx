import "./App.css";
import { startRecorderProcessorInput } from "./audioWorkletProcessor";
import { startPlayback } from "./audioBufferPlayer";
import { startWorkletPlayback } from "./workletPlayback";

function App() {
  return (
    <div className="App">
      <button onClick={() => startRecorderProcessorInput()}>
        Start Recording
      </button>
      <button onClick={() => startPlayback()}>Start Buffer Playback</button>
      <button onClick={() => startWorkletPlayback()}>
        Start Worklet Playback
      </button>
    </div>
  );
}

export default App;
