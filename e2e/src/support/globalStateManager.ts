class GlobalStateManager {
  private state: Record<string, any[]>;

  constructor() {
    this.state = {};
  }

  appendValue(key: string, incredmentalValue: any): void {
    this.state[key] = this.state[key] || [];
    this.state[key].push(incredmentalValue);
  }

  popValue(key: string): any {
    if (this.state && this.state[key] && this.state[key].length > 0) {
      return this.state[key].pop();
    }
  }

  getValue(key: string): any {
    const values = this.state[key];
    return values[values.length - 1];
  }

  // method to get value by key
  get(key: string): any[] {
    return this.state[key];
  }

  // method to set value by key
  set(key: string, value: any[]): void {
    this.state[key] = value;
  }
}

export default GlobalStateManager;
