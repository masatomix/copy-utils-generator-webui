import { useState } from "react";
import { excelBuffer2json } from "excel-csv-read-write";
import templateSource from "./templates/classTemplate.hbs?raw";
import {
  ClassConverterHandlebarsImpl,
  classDefinitionFactoryExceBufferImpl,
} from "copy-utils-generator/infrastructure";
import { GenerateClassUserCase } from "copy-utils-generator/usercase";
import type { ClassInfo, ClassRepository } from "copy-utils-generator/domain";

declare global {
  interface Window {
    XlsxPopulate: typeof import("xlsx-populate");
  }
}

function App() {
  const [fileName, setFileName] = useState("");
  const [generatedCodes, setGeneratedCodes] = useState<Array<string>>([]);

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
        // const workbook = await window.XlsxPopulate.fromDataAsync(arrayBuffer);
        // console.log(workbook.sheet(0).cell("B1"));

        const records = await excelBuffer2json(arrayBuffer);
        console.table(records);

        // ダミーのテンプレート処理
        // const source =
        // "生成したクラス一覧:\n{{#each this}}{{this.className}} - {{this.description}}\n{{/each}}";
        console.log(templateSource);
        // const template = Handlebars.compile(templateSource);
        // const output = template(records);

        const factory = new classDefinitionFactoryExceBufferImpl(arrayBuffer);

        class ReactClassRepository implements ClassRepository {
          constructor() {}
          save(classInfo: ClassInfo, code: string): void {
            setGeneratedCodes((prev) => {
              return [...prev, code];
            });
          }
        }

        new GenerateClassUserCase(
          factory,
          new ClassConverterHandlebarsImpl(templateSource),
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
    a.download = `generatedCode_${index}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadAll = () => {
    for (const [index, code] of generatedCodes.entries()) {
      console.log(index)
      downloadCodes(index);
    }
  };

  return (
    <div style={{ padding: 16 }}>
      <h1>copy-utils-generator Web UI (Demo)</h1>
      <input type="file" accept=".xlsx" onChange={onFileChange} />
      {fileName && <p>読み込みファイル: {fileName}</p>}

      {generatedCodes && generatedCodes.length > 0 && (
        <>
          <h2>生成結果({generatedCodes.length}件)</h2>
          <button onClick={() => downloadAll()}>全てダウンロード</button>
          {generatedCodes.map((code, index) => {
            return (
              <div key={index} style={{ marginBottom: 20 }}>
                {/* <pre style={{ backgroundColor: "#eee", padding: 12 }}>
                  {code}
                </pre> */}
                <button onClick={() => downloadCodes(index)}>
                  {index} テキストとしてダウンロード
                </button>
              </div>
            );
          })}
        </>
      )}
    </div>
  );
}

export default App;
