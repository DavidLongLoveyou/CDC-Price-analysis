
import type { AnalysisResult, HistogramData, ModalInfo } from '../types';

function parseInput(text: string): number[] {
  if (!text.trim()) {
    throw new Error('Dữ liệu đầu vào trống. Vui lòng cung cấp các số liệu.');
  }
  
  // Bước 1: Chuẩn hóa các dấu phân cách
  // Thay thế xuống dòng, Tab, hoặc dấu phẩy đi kèm khoảng trắng thành một dấu phân cách chung (Space)
  // Lưu ý: Không thay thế dấu phẩy nằm giữa các con số (ví dụ: 3,5 hoặc 3.729,98)
  const cleanedText = text
    .replace(/[\n\r\t]+/g, ' ') // Xuống dòng, Tab -> Space
    .replace(/,\s+/g, ' ');     // Phẩy + Space (vd: "100, 200") -> Space

  // Bước 2: Tách thành các token
  const tokens = cleanedText.split(/\s+/).filter(t => t.trim() !== '');

  const numbers = tokens.map(token => {
      let val = token.trim();
      
      // Xử lý các trường hợp định dạng số
      
      // Trường hợp 1: Chứa cả dấu chấm và dấu phẩy (VD: 3.729,98 hoặc 1.000.000,50)
      // Định dạng Việt Nam/Châu Âu: Dấu chấm là phân cách hàng nghìn, Dấu phẩy là thập phân
      if (val.includes('.') && val.includes(',')) {
          // Kiểm tra vị trí: Nếu dấu chấm đứng trước dấu phẩy (3.xxx,xx) -> VN Format
          const lastDotIndex = val.lastIndexOf('.');
          const lastCommaIndex = val.lastIndexOf(',');

          if (lastDotIndex < lastCommaIndex) {
              // Xóa hết dấu chấm (hàng nghìn), thay dấu phẩy bằng dấu chấm (thập phân JS)
              val = val.replace(/\./g, '').replace(/,/g, '.');
          } else {
              // Trường hợp hiếm: 1,000.50 (US Format)
              val = val.replace(/,/g, '');
          }
      } 
      // Trường hợp 2: Chỉ chứa dấu phẩy (VD: 5,5 hoặc 10,500)
      else if (val.includes(',')) {
          // Trong ngữ cảnh này (đấu thầu VN), ta ưu tiên dấu phẩy là thập phân
          val = val.replace(/,/g, '.');
      }
      // Trường hợp 3: Chỉ chứa dấu chấm (VD: 5.700 hoặc 10.5)
      else if (val.includes('.')) {
           const parts = val.split('.');
           const lastPart = parts[parts.length - 1];
           
           // Heuristic: Nếu phần sau dấu chấm đúng 3 ký tự (VD: 5.700), 
           // khả năng cao là phân cách hàng nghìn -> Xóa dấu chấm
           // Ngược lại (VD: 10.5), giữ nguyên là thập phân
           if (lastPart.length === 3) {
               val = val.replace(/\./g, '');
           }
      }

      return Number(val);
    })
    .filter(n => !isNaN(n) && isFinite(n));

  if (numbers.length === 0) {
    throw new Error('Không tìm thấy số hợp lệ trong dữ liệu đầu vào.');
  }

  return numbers;
}

function findModalClasses(histogram: HistogramData[]): ModalInfo[] {
  if (histogram.length <= 1) {
    return [];
  }

  let maxCount = 0;
  for (const bin of histogram) {
    if (bin.count > maxCount) {
      maxCount = bin.count;
    }
  }

  if (maxCount === 0) {
      return [];
  }

  const modes = histogram
    .filter(bin => bin.count === maxCount)
    .map(bin => {
      const parts = bin.name.split(' - ');
      if (parts.length === 2) {
        const lower = parseFloat(parts[0]);
        const upper = parseFloat(parts[1]);
        const average = (lower + upper) / 2;
        return { range: bin.name, average: average };
      }
      // Handle single-value bins, e.g., if min === max
      const singleValue = parseFloat(bin.name);
      if (!isNaN(singleValue)) {
          return { range: bin.name, average: singleValue };
      }
      // Fallback
      return { range: bin.name, average: NaN };
    });

  // If all bins have the same frequency, it's a uniform distribution (no mode)
  // We allow this check only if there is more than one bin with data.
  const populatedBins = histogram.filter(bin => bin.count > 0);
  if (modes.length === populatedBins.length && populatedBins.length > 1) {
    return [];
  }
  
  return modes;
}

function generateHistogram(numbers: number[], min: number, max: number): HistogramData[] {
  // Handle edge case of no numbers.
  if (numbers.length === 0) {
     return [];
  }
  // If all numbers are the same, create a single bin.
  if (min === max) {
     return [{ name: min.toString(), count: numbers.length }];
  }

  const range = max - min;
  // Use a variation of Sturges' formula for a reasonable number of bins
  const numBins = Math.ceil(1 + 3.322 * Math.log(numbers.length));
  const binWidth = Math.max(1, Math.ceil(range / numBins));

  const bins: { [key: string]: number } = {};
  
  // Group numbers into bins, ensuring every number is counted.
  for (const num of numbers) {
    const binStart = Math.floor(num / binWidth) * binWidth;
    const binEnd = binStart + binWidth - 1;
    const binName = `${binStart} - ${binEnd}`;
    bins[binName] = (bins[binName] || 0) + 1;
  }
  
  // Get the actual start and end points from the bins we created
  const populatedBinNames = Object.keys(bins);
  if (populatedBinNames.length === 0) {
      return [];
  }
  
  const sortedBinStarts = populatedBinNames.map(name => parseInt(name.split(' - ')[0], 10)).sort((a,b) => a - b);
  const firstBinStart = sortedBinStarts[0];
  const lastBinStart = sortedBinStarts[sortedBinStarts.length - 1];
  
  // Fill in the gaps for any empty bins to create a continuous X-axis on the chart.
  const histogramData: HistogramData[] = [];
  for (let currentBinStart = firstBinStart; currentBinStart <= lastBinStart; currentBinStart += binWidth) {
      const binEnd = currentBinStart + binWidth - 1;
      const binName = `${currentBinStart} - ${binEnd}`;
      histogramData.push({
          name: binName,
          count: bins[binName] || 0
      });
  }

  return histogramData;
}


export const analyzeData = (text: string): AnalysisResult => {
  const numbers = parseInput(text);
  numbers.sort((a, b) => a - b);

  const count = numbers.length;
  const min = numbers[0];
  const max = numbers[numbers.length - 1];
  const sum = numbers.reduce((acc, val) => acc + val, 0);
  const mean = sum / count;
  
  const histogram = generateHistogram(numbers, min, max);
  let mode = findModalClasses(histogram);

  // If no modal class was found, but there is data, provide a user-friendly message.
  if (mode.length === 0 && count > 0) {
     mode = [{ range: "Không có giá trị nổi bật", average: NaN }];
  }

  return {
    count,
    min,
    max,
    mean,
    mode,
    histogram,
  };
};
