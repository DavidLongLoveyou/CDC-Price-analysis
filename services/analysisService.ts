import type { AnalysisResult, HistogramData, ModalInfo } from '../types';

function parseInput(text: string): number[] {
  if (!text.trim()) {
    throw new Error('Dữ liệu đầu vào trống. Vui lòng cung cấp các số liệu.');
  }
  
  const numbers = text
    .split(/[\s,]+/) // Split by spaces or commas
    .filter(Boolean) // Remove empty strings
    .map(s => {
      const cleanedString = s.replace(/,/g, '');
      // If the string contains a dot and the part after the last dot is NOT 3 characters long,
      // it's treated as a decimal. All other dots are removed.
      if (cleanedString.includes('.') && cleanedString.substring(cleanedString.lastIndexOf('.') + 1).length !== 3) {
          const lastDotIndex = cleanedString.lastIndexOf('.');
          const integerPart = cleanedString.substring(0, lastDotIndex).replace(/\./g, '');
          const decimalPart = cleanedString.substring(lastDotIndex + 1);
          return Number(`${integerPart}.${decimalPart}`);
      }
      // Otherwise, all dots are treated as thousand separators.
      return Number(cleanedString.replace(/\./g, ''));
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