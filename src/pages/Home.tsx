import { Typography, Container } from "@mui/material";

const Home = () => (
  <Container sx={{ mt: 8 }}>
    <Typography variant="h4">ホームページ</Typography>
    <Typography>
      ようこそ！左のメニューから「ユーザー一覧」へどうぞ。
    </Typography>
  </Container>
);

export default Home;
