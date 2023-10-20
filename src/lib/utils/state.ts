export type File = {
  name: string;
  data: string;
};

export type State = {
  files: File[];
};

const defaultState: State = {
  files: [],
};

export class StateManager {
  private state;
  private openedFile: File | null = null;
  constructor(initialState?: State) {
    this.state = initialState ?? defaultState;
  }

  getFiles() {
    return this.state.files;
  }

  // CRUD operations on a file
  createFile(file: File) {
    this.state.files.push(file);
    return file;
  }

  getFile(name: string) {
    const file = this.state.files.find((file) => file.name === name);
    if (!file) throw new Error("File not found");
    return file;
  }

  updateFile(name: string, data: string) {
    const file = this.state.files.find((file) => file.name === name);
    if (!file) throw new Error("File not found");
    file.data = data;
    return file;
  }

  deleteFile(name: string) {
    const file = this.state.files.find((file) => file.name === name);
    if (!file) throw new Error("File not found");
    this.state.files = this.state.files.filter((file) => file.name !== name);
    StateManager.saveState(this.state);
  }

  renameFile(oldName: string, newName: string) {
    const file = this.getFile(oldName);
    if (!file) throw new Error("File not found");
    file.name = newName;
  }

  public static loadState(): State | null {
    const state = localStorage.getItem("state");
    return state ? (JSON.parse(state) as State) : null;
  }

  public static saveState(state: State) {
    localStorage.setItem("state", JSON.stringify(state));
  }

  // read and update operations on open file
  getOpenedFile() {
    return this.openedFile;
  }

  setOpenedFile(file: File) {
    this.openedFile = file;
  }

  // Read the file and set it as the opened file
  openFile(name: string) {
    const file = this.getFile(name);
    this.setOpenedFile(file);
    return file;
  }

  // Save the opened file
  saveOpenedFile(data: string) {
    if (this.openedFile === null) throw new Error("No file opened");
    this.updateFile(this.openedFile.name, data);
  }

  // getters and setters for state
  getState() {
    return this.state;
  }
}
