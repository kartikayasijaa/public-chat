import { Container } from "@chakra-ui/react";
import Chat from "./components/Chat";
import './App.css'

function App() {
  return (
    <>
      <Container height={'100vh'}>
        <Chat />
      </Container>
    </>
  );
}

export default App;
