// chronos.ts - El núcleo de la librería

type ChronosUnit = 'year' | 'month' | 'day' | 'hour' | 'minute' | 'second' | 'millisecond';
type ChronosFormatToken = 
  | 'YYYY' | 'YY' | 'MMMM' | 'MMM' | 'MM' | 'M' | 'DD' | 'D' 
  | 'HH' | 'H' | 'hh' | 'h' | 'mm' | 'm' | 'ss' | 's' | 'SSS' | 'A' | 'a'
  | 'ZZ' | 'Z' | 'dddd' | 'ddd';

interface ChronosDuration {
  years?: number;
  months?: number;
  days?: number;
  hours?: number;
  minutes?: number;
  seconds?: number;
  milliseconds?: number;
}

interface ChronosLocale {
  months: string[];
  monthsShort: string[];
  weekdays: string[];
  weekdaysShort: string[];
  weekStart: number;
  meridiem?: (hour: number, minute: number) => string;
}

class Chronos {
  private date: Date;
  private locale: ChronosLocale;
  private timezoneOffset: number | null;

  constructor(
    input?: Date | string | number | Chronos,
    timezone?: string | number,
    locale?: ChronosLocale
  ) {
    this.locale = locale || this.getDefaultLocale();
    
    if (input instanceof Chronos) {
      this.date = new Date(input.date);
      this.timezoneOffset = input.timezoneOffset;
    } else if (input instanceof Date) {
      this.date = new Date(input);
      this.timezoneOffset = this.parseTimezoneOffset(timezone);
    } else if (typeof input === 'string') {
      this.date = this.parseString(input, timezone);
      this.timezoneOffset = this.parseTimezoneOffset(timezone);
    } else if (typeof input === 'number') {
      this.date = new Date(input);
      this.timezoneOffset = this.parseTimezoneOffset(timezone);
    } else {
      this.date = new Date();
      this.timezoneOffset = this.parseTimezoneOffset(timezone);
    }
    
    if (this.timezoneOffset !== null) {
      this.applyTimezoneOffset();
    }
  }

  // Métodos básicos
  clone(): Chronos {
    return new Chronos(this);
  }

  isValid(): boolean {
    return !isNaN(this.date.getTime());
  }

  // Getters
  get year(): number {
    return this.date.getFullYear();
  }

  get month(): number {
    return this.date.getMonth() + 1;
  }

  get day(): number {
    return this.date.getDate();
  }

  get hour(): number {
    return this.date.getHours();
  }

  get minute(): number {
    return this.date.getMinutes();
  }

  get second(): number {
    return this.date.getSeconds();
  }

  get millisecond(): number {
    return this.date.getMilliseconds();
  }

  get dayOfWeek(): number {
    return this.date.getDay();
  }

  // Setters
  set year(value: number) {
    this.date.setFullYear(value);
  }

  set month(value: number) {
    this.date.setMonth(value - 1);
  }

  set day(value: number) {
    this.date.setDate(value);
  }

  // Operaciones
  add(duration: ChronosDuration): Chronos {
    const result = this.clone();
    if (duration.years) result.date.setFullYear(result.date.getFullYear() + duration.years);
    if (duration.months) result.date.setMonth(result.date.getMonth() + duration.months);
    if (duration.days) result.date.setDate(result.date.getDate() + duration.days);
    if (duration.hours) result.date.setHours(result.date.getHours() + duration.hours);
    if (duration.minutes) result.date.setMinutes(result.date.getMinutes() + duration.minutes);
    if (duration.seconds) result.date.setSeconds(result.date.getSeconds() + duration.seconds);
    if (duration.milliseconds) {
      result.date.setMilliseconds(result.date.getMilliseconds() + duration.milliseconds);
    }
    return result;
  }

  subtract(duration: ChronosDuration): Chronos {
    const invertedDuration = Object.fromEntries(
      Object.entries(duration).map(([k, v]) => [k, -v])
    ) as ChronosDuration;
    return this.add(invertedDuration);
  }

  diff(target: Chronos, unit: ChronosUnit = 'millisecond'): number {
    const diffMs = this.date.getTime() - target.date.getTime();
    
    switch (unit) {
      case 'year':
        return this.diffInYears(target);
      case 'month':
        return this.diffInMonths(target);
      case 'day':
        return Math.floor(diffMs / (1000 * 60 * 60 * 24));
      case 'hour':
        return Math.floor(diffMs / (1000 * 60 * 60));
      case 'minute':
        return Math.floor(diffMs / (1000 * 60));
      case 'second':
        return Math.floor(diffMs / 1000);
      default:
        return diffMs;
    }
  }

  // Comparaciones
  isBefore(target: Chronos): boolean {
    return this.date.getTime() < target.date.getTime();
  }

  isAfter(target: Chronos): boolean {
    return this.date.getTime() > target.date.getTime();
  }

  isSame(target: Chronos, unit?: ChronosUnit): boolean {
    if (!unit) return this.date.getTime() === target.date.getTime();
    
    switch (unit) {
      case 'year':
        return this.year === target.year;
      case 'month':
        return this.year === target.year && this.month === target.month;
      case 'day':
        return (
          this.year === target.year &&
          this.month === target.month &&
          this.day === target.day
        );
      // ... otros casos
      default:
        return this.date.getTime() === target.date.getTime();
    }
  }

  // Formateo
  format(formatStr: string = 'YYYY-MM-DD HH:mm:ss'): string {
    const tokens: ChronosFormatToken[] = [
      'YYYY', 'YY', 'MMMM', 'MMM', 'MM', 'M', 'DD', 'D',
      'HH', 'H', 'hh', 'h', 'mm', 'm', 'ss', 's', 'SSS',
      'A', 'a', 'ZZ', 'Z', 'dddd', 'ddd'
    ];
    
    let result = formatStr;
    
    for (const token of tokens) {
      result = result.replace(token, this.formatToken(token));
    }
    
    return result;
  }

  // Internacionalización
  setLocale(locale: ChronosLocale): Chronos {
    const result = this.clone();
    result.locale = locale;
    return result;
  }

  // Timezone
  setTimezone(timezone: string | number): Chronos {
    const result = this.clone();
    result.timezoneOffset = this.parseTimezoneOffset(timezone);
    if (result.timezoneOffset !== null) {
      result.applyTimezoneOffset();
    }
    return result;
  }

  // Métodos helpers privados
  private formatToken(token: ChronosFormatToken): string {
    switch (token) {
      case 'YYYY':
        return String(this.year).padStart(4, '0');
      case 'YY':
        return String(this.year % 100).padStart(2, '0');
      case 'MMMM':
        return this.locale.months[this.date.getMonth()];
      case 'MMM':
        return this.locale.monthsShort[this.date.getMonth()];
      case 'MM':
        return String(this.month).padStart(2, '0');
      case 'M':
        return String(this.month);
      case 'DD':
        return String(this.day).padStart(2, '0');
      case 'D':
        return String(this.day);
      // ... otros tokens
      default:
        return token;
    }
  }

  private diffInYears(target: Chronos): number {
    const yearsDiff = this.year - target.year;
    if (this.month < target.month || 
        (this.month === target.month && this.day < target.day)) {
      return yearsDiff - 1;
    }
    return yearsDiff;
  }

  private diffInMonths(target: Chronos): number {
    const monthsDiff = (this.year - target.year) * 12 + (this.month - target.month);
    if (this.day < target.day) {
      return monthsDiff - 1;
    }
    return monthsDiff;
  }

  private parseTimezoneOffset(timezone?: string | number): number | null {
    if (typeof timezone === 'number') return timezone;
    if (typeof timezone === 'string') {
      // Lógica para parsear strings de timezone como 'UTC-5' o 'America/New_York'
      // (Implementación simplificada)
      if (timezone === 'UTC') return 0;
      const match = timezone.match(/^UTC([+-])(\d+)$/);
      if (match) {
        return parseInt(match[2]) * (match[1] === '+' ? 60 : -60);
      }
      // Aquí podríamos integrar Intl.DateTimeFormat para timezones IANA
    }
    return null; // Usar timezone local
  }

  private applyTimezoneOffset(): void {
    if (this.timezoneOffset === null) return;
    const localOffset = this.date.getTimezoneOffset();
    const diff = this.timezoneOffset - localOffset;
    this.date = new Date(this.date.getTime() + diff * 60000);
  }

  private parseString(input: string, timezone?: string | number): Date {
    // Implementación de parser de strings ISO y otros formatos comunes
    // (Implementación simplificada)
    if (/^\d{4}-\d{2}-\d{2}$/.test(input)) {
      return new Date(input + 'T00:00:00');
    }
    if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/.test(input)) {
      return new Date(input);
    }
    throw new Error(`Unsupported date string format: ${input}`);
  }

  private getDefaultLocale(): ChronosLocale {
    return {
      months: [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
      ],
      monthsShort: [
        'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
      ],
      weekdays: [
        'Sunday', 'Monday', 'Tuesday', 'Wednesday', 
        'Thursday', 'Friday', 'Saturday'
      ],
      weekdaysShort: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
      weekStart: 0,
      meridiem: (hour: number) => hour >= 12 ? 'PM' : 'AM'
    };
  }
}

// API estática
Chronos.now = (timezone?: string | number): Chronos => {
  return new Chronos(new Date(), timezone);
};

Chronos.utc = (input?: Date | string | number): Chronos => {
  return new Chronos(input, 'UTC');
};

Chronos.locale = (locale: ChronosLocale): void => {
  // Implementación para cambiar el locale global
};

// Helpers para crear durations
Chronos.duration = (duration: ChronosDuration): ChronosDuration => duration;

export default Chronos;