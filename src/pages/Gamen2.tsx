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

function Gamen2() {
  const [fileName, setFileName] = useState("");
  const [generatedCodes, setGeneratedCodes] = useState<Array<string>>([]);
  const [clazzes, setClazzes] = useState<Array<ClassInfo>>([]);

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setFileName(files[0].name);

    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const arrayBuffer = reader.result;
        if (!(arrayBuffer instanceof ArrayBuffer)) {
          console.error("FileReader result is not an ArrayBuffer");
          return;
        }

        const records = await excelBuffer2json(arrayBuffer);
        console.table(records);

        const factory = new MappingFactoryExcelBufferImpl(arrayBuffer);

        class ReactClassRepository implements ClassRepository {
          save(classInfo: ClassInfo, code: string): void {
            setGeneratedCodes((prev) => {
              return [...prev, code];
            });
            setClazzes((prev) => {
              return [...prev, classInfo];
            });
          }
        }

        new GenerateMappingClassUserCase(
          factory,
          new ConverterHandlebarsImpl(templateSource),
          new ReactClassRepository()
        )
          .execute()
          .catch((error) => console.error(error));

        // workbook 操作
        console.log("読み込み成功", records.length, " 件");
      } catch (error) {
        console.error("読み込み失敗", error);
      }
    };
    reader.readAsArrayBuffer(files[0]);
  };

  const downloadCodes = (index: number) => {
    const blob = new Blob([generatedCodes[index]], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${parseClassName(clazzes[index].className)}.java`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadAll = () => {
    for (const [index, code] of generatedCodes.entries()) {
      console.log(index);
      downloadCodes(index);
    }
  };

  return (
    <div style={{ padding: 16 }}>
      <h1>mapping-generator Web UI (Demo)</h1>
      <input type="file" accept=".xlsx" onChange={onFileChange} />
      {fileName && <p>読み込みファイル: {fileName}</p>}

      {generatedCodes && generatedCodes.length > 0 && (
        <>
          <h2>生成結果({generatedCodes.length}件)</h2>
          <button onClick={() => downloadAll()}>全てダウンロード</button>
          {generatedCodes.map((code, index) => {
            return (
              <div key={index} style={{ marginBottom: 20 }}>
                <pre style={{ backgroundColor: "#eee", padding: 12 }}>
                  {code}
                </pre>
                <button onClick={() => downloadCodes(index)}>
                  {index} テキストとしてダウンロード (
                  {parseClassName(clazzes[index].className)}.java)
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
