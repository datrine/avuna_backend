import { useEffect, useRef, useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";

function App() {
  const [count, setCount] = useState(0);
  const videoRef = useRef(null);
  useEffect(() => {}, []);
  return (
    <div>
      <video
        autoPlay
        onCanPlay={(e) => e.currentTarget.play()}
        ref={videoRef}
        controls
      ></video>
      <button
        onClick={() => {
          let startOfRange = 0;
          let endOfRange = 1500000;
          let sizeOfContent = Number.MAX_SAFE_INTEGER;
          const mimeCodec =
            /*'video/mp4; codecs="avc1.4d002a"'; */ 'video/mp4; codecs="avc1.42E01E, mp4a.40.2"';
          if (
            !("MediaSource" in window && MediaSource.isTypeSupported(mimeCodec))
          ) {
            console.log("Unsupported MIME type or codec: ", mimeCodec);
            return;
          }
          let mediaSource = new MediaSource();
          const video = videoRef.current;
          video.src = URL.createObjectURL(mediaSource);
          mediaSource.addEventListener("sourceopen", function () {
            let mediaSource = this;
            const sourceBuffer = mediaSource.addSourceBuffer(mimeCodec);
            sourceBuffer.addEventListener("updateend", () => {
              try {
                if (startOfRange < sizeOfContent) {
                   fetchNextChunk();
                } else {
                  console.log("End of video file reached");
                  video.play()
                }
                console.log(mediaSource.readyState);
              } catch (error) {
                console.log(error);
                console.log(mediaSource.readyState);
              }
            });

            sourceBuffer.addEventListener("error", function () {
              console.log(this);
              console.log(mediaSource.readyState);
            });

            sourceBuffer.addEventListener("update", function () {
              console.log(this);
              console.log(mediaSource.readyState);
            });

            if (!sourceBuffer.updating) {
              fetchNextChunk()
                .then((buff) => {
                  sourceBuffer.appendBuffer(buff);
                })
                .catch(console.log);
            } else {
              console.log(
                "Source buffer is updating, waiting for it to be available"
              );
            }
          });

          mediaSource.addEventListener("sourceended", function (ev) {
            console.log(ev);
          });

          mediaSource.addEventListener("sourceclose", function (ev) {
            console.log(ev);
          });

          mediaSource.addEventListener("error", function (ev) {
            console.log(ev);
          });
          async function fetchNextChunk() {
            try {
              const response = await fetch(
                "http://localhost:8080/video/partial",
                {
                  headers: {
                    Range: `bytes=${startOfRange}-${endOfRange}`,
                  },
                }
              );
              const strArray = response.headers
                .get("Content-Range")
                .replace(/bytes/, "")
                .split("/");
              sizeOfContent = parseInt(strArray[1], 10);
              const ranges = strArray[0].trim().split("-");
              console.log({ranges})
              startOfRange = parseInt(ranges[1], 10);
              endOfRange = startOfRange + 150000;
              console.log({ sizeOfContent, startOfRange, endOfRange });
              let videoBuffer = await response.arrayBuffer();
              return videoBuffer;
            } catch (error) {
              console.log(error);
            }
          }
        }}
      >
        Play
      </button>
    </div>
  );
}

export default App;
