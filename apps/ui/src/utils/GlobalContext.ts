/* eslint-disable @typescript-eslint/no-explicit-any */
export class Context {
  private data: Map<string, any> = new Map();
  get(key: string): any {
    return this.data.get(key);
  }
  set(key: string, value: any): void {
    this.data.set(key, value);
  }
  remove(key: string) {
    this.data.delete(key);
  }
  clear(): void {
    this.data.clear();
  }
}

export const GlobalContext = new Context();