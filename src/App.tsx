import "./App.css";
import { workletRecorder } from "./workletRecorder";
import { workletPlayback } from "./workletPlayback";
import { useEffect, useRef, useState } from "react";
import { performRoundtrip } from "./roundtrip";
import { start } from "repl";
import FFT from "fft.js/lib/fft";

let fft: FFT;
let out: any;

function fftForVisualization(chunk: Float32Array) {
  fft = fft ?? new FFT(chunk.length);
  out = out ?? fft.createComplexArray();

  fft.realTransform(out, chunk);
  const amplitudes = new Float32Array(chunk.length / 2);
  for (let i = 0; i < amplitudes.length; i++) {
    const i2 = i * 2;
    amplitudes[i] =
      Math.sqrt(Math.pow(out[i2], 2) + Math.pow(out[i2 + 1], 2)) /
      Math.sqrt(chunk.length);
  }
  return amplitudes;
}

function floatArrayMax(array: Float32Array) {
  return array.reduce((p, e) => Math.max(p, e), Number.NEGATIVE_INFINITY);
}

function doRoundtrip(canvas: HTMLCanvasElement) {
  const chunks = performRoundtrip();
  const ctx = canvas.getContext("2d")!;
  const imageData = ctx.createImageData(1024, 100);

  // Iterate through every pixel
  for (let y = 0; y < 100 && y < chunks.length; y++) {
    const fft = fftForVisualization(chunks[y]);
    const max = floatArrayMax(fft);
    for (let x = 0; x < 1024; x++) {
      const i = 4 * (y * 1024 + x);
      const value = (255 * fft[x]) / max;
      imageData.data[i + 0] = value; // R value
      imageData.data[i + 1] = value; // G value
      imageData.data[i + 2] = value; // B value
      imageData.data[i + 3] = 255; // A value
    }
  }

  // Draw image data to the canvas
  ctx.putImageData(imageData, 0, 0);
}

let canvasY = 0;

function App() {
  const [input, setInput] = useState("m&f Hackathon");
  const canvasRef = useRef<HTMLCanvasElement>();
  useEffect(() => {
    workletRecorder.onChunkRecorded = (chunk) => {
      const fft = fftForVisualization(chunk);
      const ctx = canvasRef.current!.getContext("2d")!;
      const imageData = ctx.createImageData(1024, 1);
      const max = floatArrayMax(fft);

      // Iterate through every pixel
      for (let x = 0; x < 1024; x++) {
        const i = 4 * x;
        const value = (255 * fft[x]) / max;
        imageData.data[i + 0] = value; // R value
        imageData.data[i + 1] = value; // G value
        imageData.data[i + 2] = value; // B value
        imageData.data[i + 3] = 255; // A value
      }

      // Draw image data to the canvas
      ctx.putImageData(imageData, 0, canvasY++);
      if (canvasY >= canvasRef.current!.height) canvasY = 0;
    };
    return () => {
      workletRecorder.onChunkRecorded = (fft) => {};
    };
  });
  return (
    <div className="App" style={{ backgroundColor: "blue" }}>
      <button onClick={() => workletRecorder.startRecorder()}>
        Start Recording
      </button>
      <button onClick={() => workletRecorder.pauseRecorder()}>
        Pause Recording
      </button>

      <input value={input} onChange={(e) => setInput(e.target.value)} />
      <button onClick={() => workletPlayback(input)}>Play</button>

      <br />
      <button onClick={() => doRoundtrip(canvasRef.current!)}>
        Test Roundtrip
      </button>
      <br />
      <canvas
        width={1024}
        height={100}
        style={{ width: "99%" }}
        ref={(e) => {
          if (e != null) canvasRef.current = e;
        }}
      />
    </div>
  );
}

export default App;
