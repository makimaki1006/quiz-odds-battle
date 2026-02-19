import { GameProvider } from "./hooks/useGameState";
import Dashboard from "./components/layout/Dashboard";

function App() {
  return (
    <GameProvider>
      <Dashboard />
    </GameProvider>
  );
}

export default App;
