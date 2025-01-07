import { Route, Router } from "@solidjs/router";
import "./App.css";
import Sidebar from "./Sidebar";
import Home from "./pages/Home";

function App() {
  return (
    <main class="flex flex-row gap-x-16">
      <Router>
        <Route path="/" component={Home} />
      </Router>
    </main>
  );
}

export default App;
