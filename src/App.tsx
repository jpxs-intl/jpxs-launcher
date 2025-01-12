import { Route, Router } from "@solidjs/router";
import "./App.css";
import NotFound from "./pages/404";
import Home from "./pages/Home";
import ServerList from "./pages/ServerList";
import Settings from "./pages/Settings";
import Instances from "./pages/Instances";
import PlayerSearch from "./pages/PlayerSearch";

function App() {
  return (
    <main class="">
      <Router>
        <Route path="/" component={Home} />
        <Route path="/live" component={ServerList} />
        <Route path="/instances" component={Instances} />
        <Route path="/playersearch" component={PlayerSearch} />
        <Route path="/settings" component={Settings} />
        <Route path="*404" component={NotFound} />
      </Router>
    </main>
  );
}

export default App;
