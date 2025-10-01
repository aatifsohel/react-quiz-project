import Header from "./Header";
import MainComponent from "./MainComponent";

export default function App() {
  return (
    <div className="app">
      <Header />
      <MainComponent>
        <p>1/15</p>
        <p>Question?</p>
      </MainComponent>
    </div>
  );
}
