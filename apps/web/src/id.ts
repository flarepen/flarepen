export class IDGenerator {
  id = 0;
  prefix = '';

  constructor(prefix: string) {
    this.prefix = prefix;
  }

  getNextID() {
    this.id = this.id + 1;
    return `${this.prefix}${this.id}`;
  }

  setID(id: number | undefined) {
    if (id) {
      this.id = id;
    }
  }
}

export const elementIDGenerator = new IDGenerator('e');
export const groupIDGenerator = new IDGenerator('g');
