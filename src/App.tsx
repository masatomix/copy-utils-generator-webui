import { Routes, Route, Link } from "react-router-dom";
import { AppBar, Toolbar, Button, Typography, Container } from "@mui/material";
import Home from "./pages/Home";
import Gamen1 from "./pages/Gamen1";
import Gamen2 from "./pages/Gamen2";
import Evm from "./pages/Evm";
import EvmSeries from "./pages/EvmSeries";

function App() {
  return (
    <>
      <AppBar position="fixed">
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            <Button color="inherit" component={Link} to="/">
              Copy Utils Generator
            </Button>
          </Typography>
          <Button color="inherit" component={Link} to="/gamen1">
            クラス生成
          </Button>
          <Button color="inherit" component={Link} to="/gamen2">
            マッピング生成
          </Button>
          <Button color="inherit" component={Link} to="/gamen3">
            EVM
          </Button>
          <Button color="inherit" component={Link} to="/gamen4">
            EVM(時系列)
          </Button>
        </Toolbar>
      </AppBar>

      <Container sx={{ marginTop: 4 }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/gamen1" element={<Gamen1 />} />
          <Route path="/gamen2" element={<Gamen2 />} />
          <Route path="/gamen3" element={<Evm />} />
          <Route path="/gamen4" element={<EvmSeries />} />
        </Routes>
      </Container>
    </>
  );
}

export default App;
