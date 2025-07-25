import { useEffect, useState } from "react";
import {
  AppBar,
  Tabs,
  Tab,
  Container,
  Box,
  Toolbar,
  Link,
} from "@mui/material";
import Gamen1 from "./pages/Gamen1";
import Gamen2 from "./pages/Gamen2";
import Gamen3 from "./pages/Evm";
import Gamen4 from "./pages/EvmSeries";
import Home from "./pages/Home";

const tabNames = ["home", "gamen1", "gamen2", "gamen3", "gamen4"];

function App() {
  const getTabIndexFromHash = () => {
    const hash = window.location.hash.replace(/^#\/?/, ""); // ← スラッシュあり・なし両対応
    const index = tabNames.indexOf(hash);
    return index >= 0 ? index : 0;
  };
  const [tabIndex, setTabIndex] = useState(getTabIndexFromHash);

  useEffect(() => {
    const handleHashChange = () => {
      setTabIndex(getTabIndexFromHash());
    };
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  const handleTabChange = (_: React.SyntheticEvent, newIndex: number) => {
    setTabIndex(newIndex);
    window.location.hash = `/${tabNames[newIndex]}`; // ← スラッシュを付ける
  };

  return (
    <>
      <AppBar position="fixed">
        <Toolbar
          sx={{
            display: "flex",
            justifyContent: "space-between",
            minHeight: 48, // 高さ調整（デフォルトより小さめ）
            px: 1,
          }}
        >
          <Link
            href="#/"
            underline="none"
            sx={{
              color: "#fff",
              fontSize: "1rem",
              fontWeight: "bold",
            }}
            onClick={() => setTabIndex(0)}
          >
            COPY UTILS GENERATOR
          </Link>

          <Tabs
            value={tabIndex}
            onChange={handleTabChange}
            variant="scrollable"
            textColor="inherit"
            indicatorColor="secondary"
            sx={{
              minHeight: 40,
              "& .MuiTab-root": {
                minHeight: 40,
                fontSize: "1.1rem", // ← 小さめ
                px: 1.0,
              },
            }}
          >
            <Tab label="ホーム" />
            <Tab label="クラス生成" />
            <Tab label="マッピング生成" />
            <Tab label="EVM" />
            <Tab label="EVM（時系列）" />
          </Tabs>
        </Toolbar>
      </AppBar>

      {/* AppBarの高さ分の空白を挿入 */}
      <Toolbar sx={{ minHeight: 48 }} />

      <Container sx={{ mt: 4 }}>
        {/* Home */}
        {tabIndex === 0 && <Home />}

        {/* Gamen1 */}
        {tabIndex === 1 && <Gamen1 />}

        {/* Gamen2 */}
        {tabIndex === 2 && <Gamen2 />}

        {/* EVM + EVM（時系列）: どちらかが選択されているときだけマウントを保持 */}
        {(tabIndex === 3 || tabIndex === 4) && (
          <>
            <Box hidden={tabIndex !== 3}>
              <Gamen3 />
            </Box>
            <Box hidden={tabIndex !== 4}>
              <Gamen4 />
            </Box>
          </>
        )}
      </Container>
    </>
  );
}

export default App;
