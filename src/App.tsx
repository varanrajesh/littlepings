import { GameProvider } from "@/context/GameContext";
import PlayField from "@/components/PlayField";

export default function App() {
  return (
    <GameProvider>
      <PlayField />
    </GameProvider>
  );
}
