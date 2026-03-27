import { Injectable } from '@angular/core';
import * as XLSX from 'xlsx';

@Injectable({
  providedIn: 'root',
})
export class ExportExcelService {
  exportarRelatorio(nomeArquivo: string, dados: any[]) {

    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(dados);

    const range = XLSX.utils.decode_range(ws['!ref']!);

    // formatação de moeda
    for (let R = 1; R <= range.e.r; ++R) {

      const valorUnit = ws[XLSX.utils.encode_cell({ r: R, c: 2 })];
      const valorTotal = ws[XLSX.utils.encode_cell({ r: R, c: 3 })];

      if (valorUnit) valorUnit.z = '"R$" #,##0.00';
      if (valorTotal) valorTotal.z = '"R$" #,##0.00';
    }

    const ultimaLinha = range.e.r + 2;

    ws[`C${ultimaLinha}`] = { t: 's', v: 'TOTAL:' };

    ws[`D${ultimaLinha}`] = {
      t: 'n',
      f: `SUM(D2:D${range.e.r + 1})`,
      z: '"R$" #,##0.00'
    };

    ws['!ref'] = XLSX.utils.encode_range({
      s: { r: 0, c: 0 },
      e: { r: ultimaLinha - 1, c: range.e.c }
    });

    ws['!cols'] = [
      { wch: 30 },
      { wch: 12 },
      { wch: 18 },
      { wch: 20 }
    ];

    ws['!autofilter'] = {
      ref: XLSX.utils.encode_range({
        s: { r: 0, c: 0 },
        e: { r: range.e.r, c: range.e.c }
      })
    };

    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Relatorio');

    const hoje = new Date();

    const data =
      hoje.getFullYear() +
      String(hoje.getMonth() + 1).padStart(2, '0') +
      String(hoje.getDate()).padStart(2, '0');

    XLSX.writeFile(wb, `${data}_${nomeArquivo}.xlsx`);
  }
}
