import { useRef, useState } from "react";
import { excelBuffer2json } from "excel-csv-read-write";
import templateSource from "../templates/classTemplate.hbs?raw";
import {
  ClassConverterHandlebarsImpl,
  classDefinitionFactoryExceBufferImpl,
  parseClassName,
  parsePackageName,
} from "copy-utils-generator/infrastructure";
import { GenerateClassUserCase } from "copy-utils-generator/usercase";
import type { ClassInfo, ClassRepository } from "copy-utils-generator/domain";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  IconButton,
  Tooltip,
  Typography,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";

function Gamen1() {
  const [fileName, setFileName] = useState("");
  const [generatedCodes, setGeneratedCodes] = useState<Array<string>>([]);
  const [classInfos, setClassInfos] = useState<Array<ClassInfo>>([]);

  // ref を定義
  const fileInputRef = useRef<HTMLInputElement>(null);

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 同じファイル再選択に対応するため value をリセット
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

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
        await generateClasses(arrayBuffer);

        console.log("読み込み成功", records.length, " 件");
      } catch (error) {
        console.error("読み込み失敗", error);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const generateClasses = async (arrayBuffer: ArrayBuffer): Promise<void> => {
    class InMemoryRepository implements ClassRepository {
      constructor() {}
      save(classInfo: ClassInfo, code: string): void {
        setGeneratedCodes((prev) => [...prev, code]);
        setClassInfos((prev) => [...prev, classInfo]);
      }
    }

    const factory = new classDefinitionFactoryExceBufferImpl(arrayBuffer);
    const converter = new ClassConverterHandlebarsImpl(templateSource);
    const repository = new InMemoryRepository();
    new GenerateClassUserCase(factory, converter, repository).execute();
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
      const fqcn = classInfo.className;
      const className = parseClassName(fqcn);
      const packageName = parsePackageName(fqcn);
      const code = generatedCodes[index];

      // パッケージ名をパスに変換（. → /）
      const packagePath = packageName.replace(/\./g, "/");
      const filePath = packagePath
        ? `${packagePath}/${className}.java`
        : `${className}.java`;

      zip.file(filePath, code);
    }

    const blob = await zip.generateAsync({ type: "blob" });
    saveAs(blob, "generated-classes.zip");
  };

  const renderCodeAccordion = () =>
    generatedCodes.map((code, index) => {
      const fqcn = classInfos[index].className;
      return (
        <Accordion key={index}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography>
              {index + 1}: {fqcn}.java
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Box
              component="pre"
              p={2}
              sx={{ bgcolor: "#f4f4f4", whiteSpace: "pre-wrap" }}
            >
              <Tooltip title="クリップボードにコピー">
                <IconButton
                  size="small"
                  sx={{ position: "absolute", right: 30 }}
                  onClick={() => navigator.clipboard.writeText(code)}
                >
                  <ContentCopyIcon fontSize="small" />
                </IconButton>
              </Tooltip>
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
        Class Generator Web UI (Demo)
      </Typography>
      <Typography variant="h6" gutterBottom>
        classdata.xlsx などを指定してください。
      </Typography>

      <Button variant="contained" component="label">
        Excelファイルを選択
        <input
          type="file"
          accept=".xlsx"
          hidden
          onChange={onFileChange}
          ref={fileInputRef}
        />
      </Button>

      <Button
        href={`${import.meta.env.BASE_URL}classdata.xlsx`}
        download
        size="small"
        variant="text"
        sx={{ textTransform: "none", mt: 1 }}
      >
        サンプルのダウンロード
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

export default Gamen1;
