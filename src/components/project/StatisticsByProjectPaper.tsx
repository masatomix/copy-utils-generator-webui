import { Paper, Stack, Box, Typography, Divider, Button } from "@mui/material";

import DownloadIcon from "@mui/icons-material/Download";
import type { ProjectStatistics } from "evmtools-node/domain";
import { HelpPopover } from "../HelpPopover";
import { ProjectStatsView } from "./ProjectStatsView";
export const StatisticsByProjectPaper = ({
  statisticsByProject,
  downloadAll,
}: {
  statisticsByProject: ProjectStatistics[];
  downloadAll: () => Promise<void>;
}) => {
  return (
    <Paper variant="outlined" sx={{ p: 3, mt: 4 }}>
      <Stack direction="row" spacing={1} alignItems="center">
        <Box display="flex" alignItems="baseline" gap={1}>
          <Typography variant="h6">プロジェクト統計</Typography>
          <Typography variant="body2">
            (プロジェクト開始からの累積データ)
          </Typography>
        </Box>
        <HelpPopover
          title="このセクションについて"
          content={`このセクションでは、プロジェクト全体の統計情報を表示します。

項目説明:

プロジェクト名
Excelファイル内のファイル名から取得したプロジェクトの名前です。

開始予定日
最も早いタスクの「開始予定日」です。

終了予定日
最も遅いタスクの「終了予定日」です。

タスク数
プロジェクト内に登録されているタスクの総数です。

工数合計
すべてのタスクの工数（予定工数）の合計値です。人日単位です。タスクごとに日ごとのPVを算出し、それらを全部足し合わせています。
開始日/終了日が未入力のタスクは1日あたりの工数が計算できないため除外しているなど、Excelファイル上の「予定工数」の総和とは異なる場合があります。

工数平均
タスク1件あたりの平均工数です（＝工数合計 ÷ タスク数）。

基準日
Excelファイルから取得した基準日です。

PV（Planned Value）
基準日終了時点での累積PVの合計値です。タスクごとの累積PVを算出し、それらを全部足し合わせています。
(累積PV = 1日あたりの工数 x 経過した日数)
「1日あたりの工数」は、タスクごとにExcelの「稼働予定日数」と「予定工数」から算出。
「基準日時点の経過日数」は、Excelファイル上のプロットをみながら、プロットの日付<=基準日 の個数で算出。

(Excel上は親タスクにも工数が書いてあるけど、二重計上となるためもちろん除外しています)

EV（Earned Value）
基準日終了時点の累積EVの合計値です。
Excel上のEVを足し合わせています。

EV-PV
EVとPVの差（＝EV − PV）です。プラスなら予定より進捗が早く、マイナスなら遅れています。

SPI（Schedule Performance Index）
スケジュール効率指数。EV ÷ PV で算出されます。
1.0以上なら順調、1.0未満なら遅れを示します。
            `}
        />
      </Stack>

      <Divider sx={{ mb: 2 }} />
      <Button
        variant="contained"
        startIcon={<DownloadIcon />}
        onClick={downloadAll}
        sx={{ mt: 2 }}
      >
        データをダウンロード
      </Button>
      <ProjectStatsView data={statisticsByProject} />
    </Paper>
  );
};
