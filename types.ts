export interface HistogramData {
  name: string;
  count: number;
}

export interface ModalInfo {
  range: string;
  average: number;
}

export interface AnalysisResult {
  min: number;
  max: number;
  count: number;
  mean: number;
  mode: ModalInfo[];
  histogram: HistogramData[];
}