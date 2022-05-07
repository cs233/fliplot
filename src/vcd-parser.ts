
// Verilog standard terminology.
const VALUE = new Set(['0', '1', 'X', 'z', 'Z']);
const VECTOR_VALUE_CHANGE = new Set(['b', 'B', 'r', 'R']);

interface DataMap {
  [index: string]: DataEntry;
}

interface DataEntry {
  vcdid: string,
  name: string,
  type: string,
  width: number,
  references: string[],
  wave: Array<TimeValue>;
}

interface TimeValue {
  time: number;
  bin: string;
}

/**
 * A parser for VCD. This is a re-implementation of the original Python parser (vcdvcd.py).
 */
export class VcdParser {
  private data: DataMap;
  private end_time: number;
  private signals: string[];

  /**
  * @param only_signals Only parse the signal names under `$scope` and exit.
  *        The parsed data will only contain the signals section.
  *        This speeds up parsing if you only want the list of signals.
  * @param store_tvs If false, don't store time values in the data.
  *        Still parse them sequentially however, which may make them be printed if printing is enabled.
  *        This makes huge files more manageable, but prevents fast random access.
  * @param signal_filters Only consider signals in this list. If empty, all signals are considered.
  */
  constructor(
    private only_signals = false,
    private store_tvs = true,
    private signal_filters: string[] = [],
  ) {
    this.data = {};
    this.end_time = 0;
    this.signals = [];
  }

  public get_data(): object {
    return this.data;
  }

  public get_end_time(): number {
    return this.end_time;
  }

  public get_signals(): string[] {
    return this.signals;
  }

  /**
  * @param content VCD file contents
  * @returns Data object with parsed info
  */
  public parse(content: string): object {
    this.data = {};
    this.end_time = 0;
    this.signals = [];
    this.parse_vcd(content);
    return this.format_vcd();
  }

  private parse_vcd(content: string) {
    const all_signals = (this.signal_filters.length == 0);
    let time = 0;
    let heirarchy = [];

    for (let line of content.split(/\r?\n/)) {
      line = line.trim();
      if (line.length == 0) {
        continue;
      }

      const line0 = line[0];
      if (VECTOR_VALUE_CHANGE.has(line0)) {
        const [value, ident_code] = line.slice(1).split(/\s+/);
        this.add_time_value(time, value, ident_code);
      } else if (VALUE.has(line0)) {
        const value = line0;
        const ident_code = line.slice(1);
        this.add_time_value(time, value, ident_code);
      } else if (line0 === '#') {
        time = parseInt(line.slice(1))
        this.end_time = time;
      } else if (line.includes('$enddefinitions')) {
        if (this.only_signals) {
          break;
        }
      } else if (line.includes('$scope')) {
        heirarchy.push(line.split(/\s+/)[2]);
      } else if (line.includes('$upscope')) {
        heirarchy.pop();
      } else if (line.includes('$var')) {
        const ls = line.split(/\s+/);
        const type = ls[1];
        const size = parseInt(ls[2]);
        const ident_code = ls[3];
        const name = ls.slice(4, -1).join('');
        const path = heirarchy.join('.');
        const ref = path + '.' + name;
        if (all_signals || this.signal_filters.includes(ref)) {
          this.signals.push(ref);
          if (!this.data.hasOwnProperty(ident_code)) {
            this.data[ident_code] = {
              vcdid: ident_code,
              name: name,
              type: type,
              width: size,
              references: [],
              wave: []
            };
          }
          this.data[ident_code].references.push(ref);
        }
      }
    }
  }

  private add_time_value(time: number, value: string, ident_code: string) {
    if (this.data.hasOwnProperty(ident_code)) {
      let entry = this.data[ident_code];
      if (this.store_tvs) {
        entry.wave.push({
          time: time,
          bin: value
        });
      }
    }
  }

  private format_vcd(): object {
    let max_time = 0;
    let signals = [];

    console.log('before formatting:', this.data);
    for (const [vcdid, signal] of Object.entries(this.data)) {
      if (signal.wave.length > 0) {
        const wave_time = signal.wave[signal.wave.length - 1].time;
        max_time = Math.max(wave_time, max_time);
      }
      signals.push(signal);
    }

    return {
      now: max_time,
      type: 'struct',
      signals: signals
    };
  }
}
