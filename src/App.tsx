import { Route, Router } from "@solidjs/router";
import "./App.css";
import NotFound from "./pages/404";
import Home from "./pages/Home";
import ServerList from "./pages/ServerList";

function App() {
  return (
    <main class="">
      <Router>
        <Route path="/" component={Home} />
        <Route path="/live" component={ServerList} />
        <Route path="*404" component={NotFound} />
      </Router>
    </main>
  );
}

export default App;
