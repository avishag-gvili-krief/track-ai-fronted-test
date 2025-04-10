import AppRoutes from "./routes";
import { useAuth } from "./hooks/useAuth";
import LoadingOverlay from "./component/LoadingOverlay";

function App() {
  const { isInitialized } = useAuth();

  return (
    <>
      <LoadingOverlay />

      {isInitialized && <AppRoutes />}
    </>
  );
}

export default App;
