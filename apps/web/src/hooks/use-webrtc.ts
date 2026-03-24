import { useCallback, useEffect, useRef, useState } from "react";

export type ShortlistUniversity = {
  name: string;
  country: string;
  category: "reach" | "target" | "safety";
  notes?: string;
};

export type TranscriptEntry =
  | { role: "user" | "assistant"; text: string }
  | {
      role: "shortlist";
      universities: ShortlistUniversity[];
      saved: boolean;
    };

export const useWebRTC = () => {
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);
  const dataChannelRef = useRef<RTCDataChannel | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);

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

  // Initialize the connection, optionally seeding prior conversation context
  const initializeConnection = useCallback(
    async (
      token: string,
      advisor: string,
      priorMessages?: Array<{ role: string; text: string | null }>,
    ) => {
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

        dc.addEventListener("open", () => {
          // Seed prior conversation context so the model can pick up where we left off
          if (priorMessages && priorMessages.length > 0) {
            for (const msg of priorMessages) {
              if (!msg.text) continue;
              dc.send(
                JSON.stringify({
                  type: "conversation.item.create",
                  item: {
                    type: "message",
                    role: msg.role === "assistant" ? "assistant" : "user",
                    content: [
                      {
                        type: "input_text",
                        text: msg.text,
                      },
                    ],
                  },
                }),
              );
            }
          }
          dc.send(JSON.stringify({ type: "response.create" }));
        });

        dc.addEventListener("message", async (e) => {
          try {
            const data = JSON.parse(e.data);

            if (data.type === "response.output_item.done") {
              const item = data.item;

              // Handle function calls
              if (item?.type === "function_call" && item.name === "search_web") {
                const args = JSON.parse(item.arguments);
                try {
                  const res = await fetch("/api/virtual-advisor/search", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ query: args.query }),
                  });
                  const { result } = await res.json();

                  // Send function call output back to the model
                  dc.send(
                    JSON.stringify({
                      type: "conversation.item.create",
                      item: {
                        type: "function_call_output",
                        call_id: item.call_id,
                        output: JSON.stringify({ result }),
                      },
                    })
                  );

                  // Trigger the model to respond with the search results
                  dc.send(JSON.stringify({ type: "response.create" }));
                } catch (err) {
                  console.error("Search function call failed:", err);
                  dc.send(
                    JSON.stringify({
                      type: "conversation.item.create",
                      item: {
                        type: "function_call_output",
                        call_id: item.call_id,
                        output: JSON.stringify({
                          error: "Search failed, please try answering from your own knowledge.",
                        }),
                      },
                    })
                  );
                  dc.send(JSON.stringify({ type: "response.create" }));
                }
                return;
              }

              // Handle save_shortlist — insert into transcript for inline confirmation
              if (
                item?.type === "function_call" &&
                item.name === "save_shortlist"
              ) {
                try {
                  const args = JSON.parse(item.arguments);
                  setTranscript((prev) => [
                    ...prev,
                    {
                      role: "shortlist" as const,
                      universities: args.universities,
                      saved: false,
                    },
                  ]);
                  // Send acknowledgement back to the model so it can continue talking
                  dc.send(
                    JSON.stringify({
                      type: "conversation.item.create",
                      item: {
                        type: "function_call_output",
                        call_id: item.call_id,
                        output: JSON.stringify({
                          status: "pending_confirmation",
                          message:
                            "The shortlist has been sent to the student for review. They will see a confirmation dialog.",
                        }),
                      },
                    })
                  );
                  dc.send(JSON.stringify({ type: "response.create" }));
                } catch (err) {
                  console.error("Failed to parse shortlist:", err);
                }
                return;
              }

              const text = item?.content?.[0]?.transcript;
              if (text) {
                setTranscript((prev) => [...prev, { role: "assistant", text }]);
              }
            }

            if (
              data.type ===
              "conversation.item.input_audio_transcription.completed"
            ) {
              if (data.transcript) {
                setTranscript((prev) => {
                  const last = prev[prev.length - 1];
                  if (last && last.role === "user") {
                    // Merge consecutive user fragments into one bubble
                    return [
                      ...prev.slice(0, -1),
                      { role: "user" as const, text: last.text + "\n" + data.transcript },
                    ];
                  }
                  return [...prev, { role: "user", text: data.transcript }];
                });
              }
            }
          } catch (e) {
            console.error("Failed to parse data channel message:", e);
          }
        });

        // Start the session using the Session Description Protocol (SDP)
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);

        const sdpResponse = await fetch(`/api/session/${advisor}`, {
          method: "POST",
          body: offer.sdp,
          headers: {
            "Content-Type": "application/sdp",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!sdpResponse.ok) {
          throw new Error(
            `Failed to create session: ${sdpResponse.statusText}`
          );
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
    },
    []
  );

  const disconnect = () => {
    // Cancel any in-progress response before closing
    if (
      dataChannelRef.current &&
      dataChannelRef.current.readyState === "open"
    ) {
      dataChannelRef.current.send(
        JSON.stringify({ type: "response.cancel" })
      );
      dataChannelRef.current.close();
      dataChannelRef.current = null;
    }

    // Stop audio playback immediately
    if (audioElementRef.current) {
      audioElementRef.current.pause();
      audioElementRef.current.srcObject = null;
    }

    const pc = pcRef.current;
    if (pc) {
      pc.getSenders().forEach((sender) => {
        if (sender.track) sender.track.stop();
      });
      pc.close();
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

  // Mark a shortlist entry as saved (by transcript index)
  const markShortlistSaved = useCallback((index: number) => {
    setTranscript((prev) =>
      prev.map((entry, i) =>
        i === index && entry.role === "shortlist"
          ? { ...entry, saved: true }
          : entry
      )
    );
  }, []);

  return {
    isConnected,
    isMuted,
    error,
    transcript,
    setTranscript,
    markShortlistSaved,
    sendEvent,
    disconnect,
    toggleMute,
    initializeConnection,
    audioElement: audioElementRef.current,
    dataChannel: dataChannelRef.current,
  };
};
