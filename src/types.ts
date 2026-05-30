export interface Payee {
  id: string;
  name: string;
  mobile: string;
  email: string;
  address: string;
  companyName: string;
  others: string;
}

export interface ChequeRecord {
  id: string;
  payeeName: string;
  chequeDate: string;
  amount: number;
  amountInWords: string;
}

export interface PrintHistoryRecord {
  id: string;
  chequeId: string;
  payeeName: string;
  amount: number;
  timestamp: string;
}

export interface ElementPosition {
  x: number;
  y: number;
}

export interface PrintPositions {
  acPayee: ElementPosition;
  date: ElementPosition;
  payee: ElementPosition;
  words: ElementPosition;
  amount: ElementPosition;
  dateSpacing: number;
  fontSizeOffset?: number;
}
