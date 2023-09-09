export class CodeRunner {
  private iframeEl: HTMLIFrameElement;

  constructor() {
    this.iframeEl = document.createElement("iframe");
    this.iframeEl.style.display = "none";
    document.body.appendChild(this.iframeEl);

    this.setupIframe();
  }

  private setupIframe() {
    this.iframeEl.sandbox.add("allow-scripts");
    this.iframeEl.sandbox.add("allow-same-origin");
    this.iframeEl.sandbox.add("allow-forms");
  }

  public run(code: string): any {
    // @ts-ignore
    const iframeWindow = this.iframeEl.contentWindow;
    // @ts-ignore
    iframeWindow.eval(code);

    // @ts-ignore
    return iframeWindow.fillPixels();
  }
}
