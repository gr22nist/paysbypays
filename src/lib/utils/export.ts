/**
 * 데이터 내보내기 유틸리티
 * CSV 및 Excel 형식으로 데이터를 내보내는 함수들
 */

import ExcelJS from "exceljs";

export interface ExportableRow {
  [key: string]: string | number | null | undefined;
}

/**
 * CSV 형식으로 데이터 내보내기
 */
export function exportToCSV(
  data: ExportableRow[],
  filename: string = "export.csv",
  headers?: string[],
  t?: (key: string) => string
) {
  if (data.length === 0) {
    const message = t ? t("common:messages.noDataToExport") : "내보낼 데이터가 없습니다.";
    alert(message);
    return;
  }

  // 헤더 결정
  const csvHeaders = headers || Object.keys(data[0]);

  // CSV 행 생성
  const csvRows: string[] = [];

  // 헤더 행
  csvRows.push(csvHeaders.map((h) => escapeCSVValue(h)).join(","));

  // 데이터 행
  data.forEach((row) => {
    const values = csvHeaders.map((header) => {
      const value = row[header];
      return escapeCSVValue(value?.toString() || "");
    });
    csvRows.push(values.join(","));
  });

  // CSV 문자열 생성
  const csvContent = csvRows.join("\n");

  // BOM 추가 (Excel에서 한글 깨짐 방지)
  const BOM = "\uFEFF";
  const blob = new Blob([BOM + csvContent], { type: "text/csv;charset=utf-8;" });

  // 다운로드
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * CSV 값 이스케이프 처리
 */
function escapeCSVValue(value: string): string {
  if (value.includes(",") || value.includes('"') || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

/**
 * Excel 형식으로 데이터 내보내기 (실제 .xlsx 파일 생성)
 */
export async function exportToExcel(
  data: ExportableRow[],
  filename: string = "export.xlsx",
  headers?: string[],
  t?: (key: string) => string
) {
  if (data.length === 0) {
    const message = t ? t("common:messages.noDataToExport") : "내보낼 데이터가 없습니다.";
    alert(message);
    return;
  }

  // 헤더 결정
  const excelHeaders = headers || Object.keys(data[0]);

  // 워크북 생성
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Sheet1");

  // 헤더 행 추가
  worksheet.addRow(excelHeaders);

  // 헤더 스타일 적용 (굵게, 배경색)
  const headerRow = worksheet.getRow(1);
  headerRow.font = { bold: true };
  headerRow.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FFE0E0E0" },
  };

  // 데이터 행 추가
  data.forEach((row) => {
    const values = excelHeaders.map((header) => {
      const value = row[header];
      // 숫자는 숫자로, 나머지는 문자열로 변환
      if (typeof value === "number") {
        return value;
      }
      return value?.toString() || "";
    });
    worksheet.addRow(values);
  });

  // 열 너비 자동 조정
  excelHeaders.forEach((header, colIndex) => {
    const column = worksheet.getColumn(colIndex + 1);
    let maxLength = header.length;
    
    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber > 1) {
        const cellValue = row.getCell(colIndex + 1).value?.toString() || "";
        maxLength = Math.max(maxLength, cellValue.length);
      }
    });
    
    column.width = Math.min(maxLength + 2, 50); // 최대 50자
  });

  // 파일 다운로드
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * 거래 내역을 내보내기 (CSV 또는 Excel)
 */
export async function exportTransactions(
  transactions: Array<{
    id: string;
    merchantName?: string;
    amount: number;
    currency?: string;
    status: string;
    paymentMethod?: string;
    createdAt: string;
  }>,
  filename?: string,
  format: "csv" | "excel" = "csv",
  t?: (key: string) => string
) {
  const headers = t ? [
    t("transactions:export.headers.id"),
    t("transactions:export.headers.merchantName"),
    t("transactions:export.headers.amount"),
    t("transactions:export.headers.currency"),
    t("transactions:export.headers.status"),
    t("transactions:export.headers.paymentMethod"),
    t("transactions:export.headers.createdAt"),
  ] : [
    "거래 ID",
    "가맹점명",
    "금액",
    "통화",
    "상태",
    "결제 수단",
    "거래 시각",
  ];

  const idKey = t ? t("transactions:export.headers.id") : "거래 ID";
  const merchantNameKey = t ? t("transactions:export.headers.merchantName") : "가맹점명";
  const amountKey = t ? t("transactions:export.headers.amount") : "금액";
  const currencyKey = t ? t("transactions:export.headers.currency") : "통화";
  const statusKey = t ? t("transactions:export.headers.status") : "상태";
  const paymentMethodKey = t ? t("transactions:export.headers.paymentMethod") : "결제 수단";
  const createdAtKey = t ? t("transactions:export.headers.createdAt") : "거래 시각";

  const rows = transactions.map((tx) => ({
    [idKey]: tx.id,
    [merchantNameKey]: tx.merchantName || "",
    [amountKey]: tx.amount,
    [currencyKey]: tx.currency || "KRW",
    [statusKey]: tx.status,
    [paymentMethodKey]: tx.paymentMethod || "",
    [createdAtKey]: new Date(tx.createdAt).toLocaleString("ko-KR"),
  }));

  const defaultFilename = `transactions_${new Date().toISOString().split("T")[0]}`;
  
  if (format === "excel") {
    await exportToExcel(rows, filename || `${defaultFilename}.xlsx`, headers, t);
  } else {
    exportToCSV(rows, filename || `${defaultFilename}.csv`, headers, t);
  }
}

/**
 * 가맹점 목록을 내보내기 (CSV 또는 Excel)
 */
export async function exportMerchants(
  merchants: Array<{
    mchtCode: string;
    mchtName: string;
    status: string;
    bizType?: string;
  }>,
  filename?: string,
  format: "csv" | "excel" = "csv",
  t?: (key: string) => string
) {
  const headers = t ? [
    t("merchants:export.headers.mchtCode"),
    t("merchants:export.headers.mchtName"),
    t("merchants:export.headers.status"),
    t("merchants:export.headers.bizType"),
  ] : ["가맹점 코드", "가맹점명", "상태", "사업자 유형"];

  const mchtCodeKey = t ? t("merchants:export.headers.mchtCode") : "가맹점 코드";
  const mchtNameKey = t ? t("merchants:export.headers.mchtName") : "가맹점명";
  const statusKey = t ? t("merchants:export.headers.status") : "상태";
  const bizTypeKey = t ? t("merchants:export.headers.bizType") : "사업자 유형";

  const rows = merchants.map((m) => ({
    [mchtCodeKey]: m.mchtCode,
    [mchtNameKey]: m.mchtName,
    [statusKey]: m.status,
    [bizTypeKey]: m.bizType || "",
  }));

  const defaultFilename = `merchants_${new Date().toISOString().split("T")[0]}`;
  
  if (format === "excel") {
    await exportToExcel(rows, filename || `${defaultFilename}.xlsx`, headers, t);
  } else {
    exportToCSV(rows, filename || `${defaultFilename}.csv`, headers, t);
  }
}

/**
 * 정산 내역을 내보내기 (CSV 또는 Excel)
 */
export async function exportSettlements(
  settlements: Array<{
    id: string;
    merchantCode: string;
    merchantName: string;
    grossAmount: number;
    feeAmount: number;
    netAmount: number;
    scheduledDate: string;
    payoutDate?: string;
    status: string;
  }>,
  filename?: string,
  format: "csv" | "excel" = "csv",
  t?: (key: string) => string
) {
  const headers = t ? [
    t("settlements:export.headers.merchantCode"),
    t("settlements:export.headers.merchantName"),
    t("settlements:export.headers.grossAmount"),
    t("settlements:export.headers.feeAmount"),
    t("settlements:export.headers.netAmount"),
    t("settlements:export.headers.scheduledDate"),
    t("settlements:export.headers.payoutDate"),
    t("settlements:export.headers.status"),
  ] : [
    "가맹점 코드",
    "가맹점명",
    "총 금액",
    "수수료",
    "실수령액",
    "지급 예정일",
    "지급일",
    "상태",
  ];

  const merchantCodeKey = t ? t("settlements:export.headers.merchantCode") : "가맹점 코드";
  const merchantNameKey = t ? t("settlements:export.headers.merchantName") : "가맹점명";
  const grossAmountKey = t ? t("settlements:export.headers.grossAmount") : "총 금액";
  const feeAmountKey = t ? t("settlements:export.headers.feeAmount") : "수수료";
  const netAmountKey = t ? t("settlements:export.headers.netAmount") : "실수령액";
  const scheduledDateKey = t ? t("settlements:export.headers.scheduledDate") : "지급 예정일";
  const payoutDateKey = t ? t("settlements:export.headers.payoutDate") : "지급일";
  const statusKey = t ? t("settlements:export.headers.status") : "상태";

  const rows = settlements.map((s) => ({
    [merchantCodeKey]: s.merchantCode,
    [merchantNameKey]: s.merchantName,
    [grossAmountKey]: s.grossAmount,
    [feeAmountKey]: s.feeAmount,
    [netAmountKey]: s.netAmount,
    [scheduledDateKey]: s.scheduledDate,
    [payoutDateKey]: s.payoutDate || "",
    [statusKey]: s.status,
  }));

  const defaultFilename = `settlements_${new Date().toISOString().split("T")[0]}`;
  
  if (format === "excel") {
    await exportToExcel(rows, filename || `${defaultFilename}.xlsx`, headers, t);
  } else {
    exportToCSV(rows, filename || `${defaultFilename}.csv`, headers, t);
  }
}

