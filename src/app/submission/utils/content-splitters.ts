export interface DateParts {
  day: string;
  month: string;
  year: string;
}

export class DateSplitter {
  private readonly monthNames: Record<string, string> = {
    enero: '1', febrero: '2', marzo: '3', abril: '4', mayo: '5', junio: '6', 
    julio: '7', agosto: '8', septiembre: '9', octubre: '10', noviembre: '11', diciembre: '12',
    january: '1', february: '2', march: '3', april: '4', may: '5', june: '6', 
    july: '7', august: '8', september: '9', october: '10', november: '11', december: '12'
  };
  
  split(date: string): DateParts {
    let day = '';
    let month = '';
    let year = '';
    
    const formats = this.getDateFormats();
    
    for (const format of formats) {
      const match = date.match(format.regex);
      if (match) {
        const result = format.handler(match);
        day = result.day || '';
        month = result.month || '';
        year = result.year || '';
        break;
      }
    }
    
    return { day, month, year };
  }
  
  private getDateFormats(): Array<{
    regex: RegExp;
    handler: (m: RegExpMatchArray) => Partial<DateParts>;
  }> {
    const monthNames = this.monthNames;
    
    return [
      { regex: /^(\d{4})$/, handler: (m) => ({ year: m[1] }) }, // AAAA
      { regex: /^(\d{1,2})\/(\d{4})$/, handler: (m) => ({ month: m[1], year: m[2] }) }, // MM/AAAA
      { regex: /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/, handler: (m) => ({ day: m[1], month: m[2], year: m[3] }) }, // DD/MM/AAAA
      { regex: /^(\d{4})\/(\d{1,2})$/, handler: (m) => ({ year: m[1], month: m[2] }) }, // AAAA/MM
      { regex: /^(\d{4})\/(\d{1,2})\/(\d{1,2})$/, handler: (m) => ({ year: m[1], month: m[2], day: m[3] }) }, // AAAA/MM/DD
      { regex: /^([a-zA-Zñ]+)\s+de\s+(\d{4})$/, handler: (m) => ({ month: monthNames[m[1].toLowerCase()], year: m[2] }) }, // M de AAAA
      { regex: /^([a-zA-Zñ]+)\s+(\d{4})$/, handler: (m) => ({ month: monthNames[m[1].toLowerCase()], year: m[2] }) }, // M AAAA
      { regex: /^(\d{4})\s+([a-zA-Zñ]+)$/, handler: (m) => ({ month: monthNames[m[2].toLowerCase()], year: m[1] }) }, // AAAA M
      { regex: /^([a-zA-Zñ]+),\s*(\d{4})$/, handler: (m) => ({ month: monthNames[m[1].toLowerCase()], year: m[2] }) }, // M, AAAA
      { regex: /^([a-zA-Zñ]+)-([a-zA-Zñ]+)\s+(\d{4})$/, handler: (m) => ({ month: monthNames[m[2].toLowerCase()], year: m[3] }) }, // M-M AAAA
      { regex: /^(\d{1,2})\s+de\s+([a-zA-Zñ]+)\s+de\s+(\d{4})$/, handler: (m) => ({ day: m[1], month: monthNames[m[2].toLowerCase()], year: m[3] }) }, // D de M de AAAA
      { regex: /^(\d{1,2})\s+([a-zA-Zñ]+)\s+de\s+(\d{4})$/, handler: (m) => ({ day: m[1], month: monthNames[m[2].toLowerCase()], year: m[3] }) }, // D M de AAAA
      { regex: /^(\d{1,2})\s+([a-zA-Zñ]+)\s+(\d{4})$/, handler: (m) => ({ day: m[1], month: monthNames[m[2].toLowerCase()], year: m[3] }) }, // D M AAAA
      { regex: /^(\d{1,2})\s+de\s+([a-zA-Zñ]+)\s+(\d{4})$/, handler: (m) => ({ day: m[1], month: monthNames[m[2].toLowerCase()], year: m[3] }) }, // D de M AAAA
      { regex: /^(\d{1,2})\s+al\s+(\d{1,2})\s+de\s+([a-zA-Zñ]+)\s+de\s+(\d{4})$/, handler: (m) => ({ month: monthNames[m[3].toLowerCase()], year: m[4] }) }, // D1 al D2 de M de AAAA
      { regex: /^(\d{1,2})-(\d{1,2})\s+de\s+([a-zA-Zñ]+)\s+de\s+(\d{4})$/, handler: (m) => ({ month: monthNames[m[3].toLowerCase()], year: m[4] }) }, // D1-D2 de M de AAAA
    ];
  }
}

export interface JournalParts {
  year?: string;
  volume?: string;
  tomo?: string;
  issue?: string;
}

export class VolumeIssueSplitter {
  split(data: string): JournalParts {
    let result: JournalParts = {};
    
    // Procesar patrones de número
    this.processPatterns(data, this.getIssuePatterns(), result);
    
    // Procesar patrones de año
    this.processPatterns(data, this.getYearPatterns(), result);
    
    // Procesar patrones de volumen
    this.processPatterns(data, this.getVolumePatterns(), result);
    
    // Procesar patrones extras
    if (!result.volume || !result.issue) {
      this.processPatterns(data, this.getExtraPatterns(), result);
    }
    
    return result;
  }
  
  private processPatterns(
    data: string, 
    patterns: Array<{ regex: RegExp; fields: string[] }>,
    result: JournalParts
  ): void {
    for (const pattern of patterns) {
      const match = data.match(pattern.regex);
      if (match) {
        pattern.fields.forEach((field, index) => {
          const capturedValue = match.slice(index + 1).find(value => value !== undefined);
          if (capturedValue && result[field] === undefined) {
            if (field === 'tomo' && pattern.regex.toString().includes('IVXLCDM')) {
              result[field] = this.romanToInt(match[0].toUpperCase()).toString();
            } else {
              result[field] = field === 'year' ? capturedValue : parseInt(capturedValue, 10).toString();
            }
          }
        });
        break;
      }
    }
  }
  
  private getIssuePatterns(): Array<{ regex: RegExp; fields: string[] }> {
    return [
      {
        regex: /(?:\bN[º°.\s]*\s*(\d+)|\((?:N[º°.\s]*?)?\s*(\d+)\)|N\.(\d+)|(?:Número|número)\s*(\d+)|\((\d+)\))/i,
        fields: ['issue'],
      }
    ];
  }
  
  private getYearPatterns(): Array<{ regex: RegExp; fields: string[] }> {
    return [
      {
        regex: /(?:Año|año)?\s*(\d{4})/i,
        fields: ['year'],
      }
    ];
  }
  
  private getVolumePatterns(): Array<{ regex: RegExp; fields: string[] }> {
    return [
      {
        regex: /(?:[Vv](?:ol(?:\.|umen)?)?\.?\s*(\d+)|\b\w+,\s*(\d+))/i,
        fields: ['volume'],
      },
      {
        regex: /\b[IVXLCDM]+\b/g,
        fields: ['tomo'],
      }
    ];
  }
  
  private getExtraPatterns(): Array<{ regex: RegExp; fields: string[] }> {
    return [
      {
        regex: /(\d+)\.(\d+)/,
        fields: ['issue', 'volume'],
      },
      {
        regex: /(\d+)\s?\((\d+)\)/,
        fields: ['volume', 'issue'],
      }
    ];
  }
  
  private romanToInt(roman: string): number {
    const romanNumeralMap: Record<string, number> = {
      I: 1, IV: 4, V: 5, IX: 9, X: 10, XL: 40, L: 50,
      XC: 90, C: 100, CD: 400, D: 500, CM: 900, M: 1000
    };
  
    let i = 0;
    let num = 0;
  
    while (i < roman.length) {
      if (i + 1 < roman.length && romanNumeralMap[roman.substring(i, i + 2)]) {
        num += romanNumeralMap[roman.substring(i, i + 2)];
        i += 2;
      } else {
        num += romanNumeralMap[roman.charAt(i)];
        i += 1;
      }
    }
  
    return num;
  }
}