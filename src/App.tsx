import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import { AppBar, Toolbar, Button } from "@mui/material";
import Home from "./pages/Home";
import Gamen1 from "./pages/Gamen1";
import Gamen2 from "./pages/Gamen2";

function App() {
  return (
    <BrowserRouter>
      <AppBar position="static">
        <Toolbar>
          <Button color="inherit" component={Link} to="/">
            ホーム
          </Button>
          <Button color="inherit" component={Link} to="/gamen1">
            画面1
          </Button>
          <Button color="inherit" component={Link} to="/gamen2">
            画面2
          </Button>
        </Toolbar>
      </AppBar>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/gamen1" element={<Gamen1 />} />
        <Route path="/gamen2" element={<Gamen2 />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
