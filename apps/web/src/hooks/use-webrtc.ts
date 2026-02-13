import { useCallback, useEffect, useRef, useState } from "react";

export type TranscriptEntry = {
  role: "user" | "assistant";
  text: string;
};

export const useWebRTC = () => {
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);
  const dataChannelRef = useRef<RTCDataChannel | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);
  const assistantTextRef = useRef("");

  useEffect(() => {
    // Create a peer connection
    const pc = new RTCPeerConnection();
    pcRef.current = pc;

    // Set up to play remote audio from the model
    const audioElement = document.createElement("audio");
    audioElement.autoplay = true;
    audioElementRef.current = audioElement;
    pc.ontrack = (e) => {
      if (audioElementRef.current) {
        audioElementRef.current.srcObject = e.streams[0];
      }
    };

    // Set up connection state tracking
    pc.onconnectionstatechange = () => {
      setIsConnected(pc.connectionState === "connected");
      if (
        pc.connectionState === "failed" ||
        pc.connectionState === "disconnected"
      ) {
        setError(new Error(`WebRTC connection ${pc.connectionState}`));
      }
    };

    // Cleanup function
    return () => {
      // Close data channel
      if (dataChannelRef.current) {
        dataChannelRef.current.close();
        dataChannelRef.current = null;
      }

      // Stop all tracks
      pc.getSenders().forEach((sender) => {
        if (sender.track) {
          sender.track.stop();
        }
      });

      // Close peer connection
      pc.close();
      pcRef.current = null;

      // Clean up audio element
      if (audioElementRef.current) {
        audioElementRef.current.srcObject = null;
        audioElementRef.current = null;
      }
    };
  }, []);

  // Initialize the connection
  const initializeConnection = useCallback(async (token: string) => {
    if (!pcRef.current) {
      setError(new Error("Peer connection not initialized"));
      return;
    }

    const pc = pcRef.current;

    try {
      // Add local audio track for microphone input in the browser
      const ms = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });
      pc.addTrack(ms.getTracks()[0]);

      // Set up data channel for sending and receiving events
      const dc = pc.createDataChannel("oai-events");
      dataChannelRef.current = dc;

      dc.addEventListener("message", (e) => {
        try {
          const data = JSON.parse(e.data);

          if (data.type === "response.audio_transcript.delta") {
            assistantTextRef.current += data.delta;
            setTranscript((prev) => {
              const last = prev[prev.length - 1];
              if (last?.role === "assistant") {
                return [
                  ...prev.slice(0, -1),
                  { role: "assistant", text: assistantTextRef.current },
                ];
              }
              return [
                ...prev,
                { role: "assistant", text: assistantTextRef.current },
              ];
            });
          }

          if (data.type === "response.audio_transcript.done") {
            assistantTextRef.current = "";
          }

          if (
            data.type ===
            "conversation.item.input_audio_transcription.completed"
          ) {
            setTranscript((prev) => [
              ...prev,
              { role: "user", text: data.transcript },
            ]);
          }
        } catch (e) {
          console.error("Failed to parse data channel message:", e);
        }
      });

      // Start the session using the Session Description Protocol (SDP)
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      const sdpResponse = await fetch("/api/session", {
        method: "POST",
        body: offer.sdp,
        headers: {
          "Content-Type": "application/sdp",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!sdpResponse.ok) {
        throw new Error(`Failed to create session: ${sdpResponse.statusText}`);
      }

      const answer: RTCSessionDescriptionInit = {
        type: "answer",
        sdp: await sdpResponse.text(),
      };
      await pc.setRemoteDescription(answer);
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Unknown error");
      setError(error);
      console.error("Failed to initialize WebRTC connection:", error);
    }
  }, []);

  const disconnect = () => {
    if (dataChannelRef.current) {
      dataChannelRef.current.close();
      dataChannelRef.current = null;
    }

    const pc = pcRef.current;
    if (pc) {
      pc.getSenders().forEach((sender) => {
        if (sender.track) sender.track.stop();
      });
      pc.close();
    }

    if (audioElementRef.current) {
      audioElementRef.current.srcObject = null;
    }

    // Reset to a fresh peer connection
    const newPc = new RTCPeerConnection();
    pcRef.current = newPc;

    newPc.ontrack = (e) => {
      if (audioElementRef.current) {
        audioElementRef.current.srcObject = e.streams[0];
      }
    };

    newPc.onconnectionstatechange = () => {
      setIsConnected(newPc.connectionState === "connected");
      if (
        newPc.connectionState === "failed" ||
        newPc.connectionState === "disconnected"
      ) {
        setError(new Error(`WebRTC connection ${newPc.connectionState}`));
      }
    };

    setIsConnected(false);
    setIsMuted(false);
    setError(null);
    setTranscript([]);
    assistantTextRef.current = "";
  };

  const toggleMute = () => {
    const pc = pcRef.current;
    if (!pc) return;
    const sender = pc.getSenders().find((s) => s.track?.kind === "audio");
    if (sender?.track) {
      sender.track.enabled = !sender.track.enabled;
      setIsMuted(!sender.track.enabled);
    }
  };

  // Function to send events through the data channel
  const sendEvent = (event: object) => {
    if (
      dataChannelRef.current &&
      dataChannelRef.current.readyState === "open"
    ) {
      dataChannelRef.current.send(JSON.stringify(event));
    } else {
      console.warn("Data channel is not open");
    }
  };

  return {
    isConnected,
    isMuted,
    error,
    transcript,
    sendEvent,
    disconnect,
    toggleMute,
    initializeConnection,
    audioElement: audioElementRef.current,
    dataChannel: dataChannelRef.current,
  };
};
