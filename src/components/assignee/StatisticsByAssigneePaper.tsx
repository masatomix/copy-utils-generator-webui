import { Paper, Stack, Box, Typography, Divider } from "@mui/material";
import { HelpPopover } from "../HelpPopover";
import { AssigneeStatsView } from "./AssigneeStatsView";
import type { AssigneeStatistics } from "evmtools-node/domain";

export const StatisticsByAssigneePaper = ({
  statisticsByName,
}: {
  statisticsByName: AssigneeStatistics[];
}) => {
  return (
    <Paper variant="outlined" sx={{ p: 3, mt: 4 }}>
      <Stack direction="row" spacing={1} alignItems="center">
        <Box display="flex" alignItems="baseline" gap={1}>
          <Typography variant="h6">要員ごと統計</Typography>
          <Typography variant="body2">
            (プロジェクト開始からの累積データ)
          </Typography>
        </Box>
        <HelpPopover
          title="要員ごと統計"
          content={`このセクションでは、担当者ごとの統計情報を表示します。
                    プロジェクト開始からの累積データです。
    
                    項目説明:
    
                    担当者
                    タスクの担当者名です。
                    
                    タスク数
                    プロジェクト全体で、担当者に割り当てられているタスクの総数です。
                    
                    工数合計、工数平均、PV、EV、EV-PV、SPI
                    計算方法は、プロジェクト情報の定義とおなじ。ひとごとで足し合わせた結果です。
                  `}
        />
      </Stack>
      <Divider sx={{ mb: 2 }} />
      <AssigneeStatsView data={statisticsByName} />
    </Paper>
  );
};
