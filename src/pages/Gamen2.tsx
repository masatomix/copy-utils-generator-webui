import { useState } from "react";
import { excelBuffer2json } from "excel-csv-read-write";
import templateSource from "../templates/template.hbs?raw";
import {
  MappingFactoryExcelBufferImpl,
  ConverterHandlebarsImpl,
  parseClassName,
} from "copy-utils-generator/infrastructure";
import { GenerateMappingClassUserCase } from "copy-utils-generator/usercase";
import type { ClassInfo, ClassRepository } from "copy-utils-generator/domain";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Button,
  Typography,
  Box,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

function Gamen2() {
  const [fileName, setFileName] = useState("");
  const [generatedCodes, setGeneratedCodes] = useState<Array<string>>([]);
  const [classInfos, setClassInfos] = useState<Array<ClassInfo>>([]);

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);

    setGeneratedCodes([]);
    setClassInfos([]);

    const reader = new FileReader();
    reader.onload = async () => {
      const arrayBuffer = reader.result;
      if (!(arrayBuffer instanceof ArrayBuffer)) {
        console.error("FileReader result is not an ArrayBuffer");
        return;
      }
      try {
        const records = await excelBuffer2json(arrayBuffer);
        console.table(records);
        await generateMappings(arrayBuffer);

        console.log("読み込み成功", records.length, " 件");
      } catch (error) {
        console.error("読み込み失敗", error);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const generateMappings = async (arrayBuffer: ArrayBuffer): Promise<void> => {
    class InMemoryRepository implements ClassRepository {
      save(classInfo: ClassInfo, code: string): void {
        setGeneratedCodes((prev) => [...prev, code]);
        setClassInfos((prev) => [...prev, classInfo]);
      }
    }

    const factory = new MappingFactoryExcelBufferImpl(arrayBuffer);
    const converter = new ConverterHandlebarsImpl(templateSource);
    const repository = new InMemoryRepository();
    new GenerateMappingClassUserCase(factory, converter, repository).execute();
  };

  const downloadCode = (index: number) => {
    const classInfo = classInfos[index];
    const className = parseClassName(classInfo.className);
    const blob = new Blob([generatedCodes[index]], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${className}.java`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadAll = async () => {
    const zip = new JSZip();

    for (const [index, classInfo] of classInfos.entries()) {
      const className = parseClassName(classInfo.className);
      zip.file(`${className}.java`, generatedCodes[index]);
    }

    const blob = await zip.generateAsync({ type: "blob" });
    saveAs(blob, "generated-mappings.zip");
  };

  const renderCodeAccordion = () =>
    generatedCodes.map((code, index) => {
      const className = parseClassName(classInfos[index].className);
      return (
        <Accordion key={index}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography>
              {index + 1}: {className}.java
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Box
              component="pre"
              p={2}
              sx={{ bgcolor: "#f4f4f4", whiteSpace: "pre-wrap" }}
            >
              {code}
            </Box>
            <Button
              variant="outlined"
              onClick={() => downloadCode(index)}
              sx={{ mt: 1 }}
            >
              このファイルをダウンロード
            </Button>
          </AccordionDetails>
        </Accordion>
      );
    });

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>
        Mapping Generator Web UI (Demo)
      </Typography>

      <Button variant="contained" component="label">
        Excelファイルを選択
        <input type="file" accept=".xlsx" hidden onChange={onFileChange} />
      </Button>

      {fileName && (
        <Typography variant="body2" mt={1}>
          読み込みファイル: {fileName}
        </Typography>
      )}

      {generatedCodes.length > 0 && (
        <Box mt={4}>
          <Typography variant="h6" gutterBottom>
            生成結果（{generatedCodes.length} 件）
          </Typography>
          <Button variant="outlined" onClick={downloadAll} sx={{ mb: 2 }}>
            全てダウンロード（ZIP）
          </Button>
          {renderCodeAccordion()}
        </Box>
      )}
    </Box>
  );
}

export default Gamen2;
