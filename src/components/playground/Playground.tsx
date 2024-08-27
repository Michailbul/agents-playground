"use client";

import { AgentFaceVisualizer } from "@/components/visualization/AgentMultibandAudioVisualizer";
import { useConfig } from "@/hooks/useConfig";
import { useMultibandTrackVolume } from "@/hooks/useTrackVolume";
import {
  useConnectionState,
  useLocalParticipant,
  useTracks,
} from "@livekit/components-react";
import { ConnectionState, Track } from "livekit-client";
import { FaMicrophone, FaMicrophoneSlash } from 'react-icons/fa';
import { ReactNode } from "react";

export interface PlaygroundProps {
  themeColors: string[];
  onConnect: (connect: boolean) => void;
}

export default function Playground({
  themeColors,
  onConnect,
}: PlaygroundProps) {
  const { config } = useConfig();
  const { localParticipant } = useLocalParticipant();
  const roomState = useConnectionState();
  const tracks = useTracks();

  const agentAudioTrack = tracks.find(
    (trackRef) =>
      trackRef.publication.kind === Track.Kind.Audio &&
      trackRef.participant.isAgent
  );

  const [subscribedVolumes] = useMultibandTrackVolume(agentAudioTrack?.publication?.track);

  const toggleMicrophone = () => {
    localParticipant.setMicrophoneEnabled(!localParticipant.isMicrophoneEnabled);
  };

  return (
    <div className="flex flex-col items-center justify-center h-full">
      <AgentFaceVisualizer
        state="speaking"
        barWidth={30}
        minBarHeight={30}
        maxBarHeight={150}
        accentColor={config.settings.theme_color}
        accentShade={500}
        frequencies={subscribedVolumes ? [subscribedVolumes] : []}
        borderRadius={12}
        gap={16}
      />
      <button 
        onClick={toggleMicrophone}
        className="mt-4 text-3xl"
      >
        {localParticipant.isMicrophoneEnabled ? <FaMicrophone /> : <FaMicrophoneSlash />}
      </button>
      <button
        onClick={() => onConnect(roomState === ConnectionState.Disconnected)}
        className="mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
      >
        {roomState === ConnectionState.Connected ? 'Disconnect' : 'Connect'}
      </button>
    </div>
  );
}
