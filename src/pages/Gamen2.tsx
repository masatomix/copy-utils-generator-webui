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

  async function generateMappings(arrayBuffer: ArrayBuffer) {
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
  }

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

  return (
    <div style={{ padding: 16 }}>
      <h1>mapping-generator Web UI (Demo)</h1>
      <input type="file" accept=".xlsx" onChange={onFileChange} />
      {fileName && <p>読み込みファイル: {fileName}</p>}

      {generatedCodes && generatedCodes.length > 0 && (
        <>
          <h2>生成結果({generatedCodes.length}件)</h2>
          <button onClick={downloadAll}>全てダウンロード</button>
          {generatedCodes.map((code, index) => {
            const className = parseClassName(classInfos[index].className);
            return (
              <div key={index} style={{ marginBottom: 20 }}>
                <pre style={{ backgroundColor: "#eee", padding: 12 }}>
                  {code}
                </pre>
                <button onClick={() => downloadCode(index)}>
                  {index + 1} 番目のコードをダウンロード ({className}.java)
                </button>
              </div>
            );
          })}
        </>
      )}
    </div>
  );
}

export default Gamen2;
