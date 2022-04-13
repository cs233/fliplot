const vscode = require('vscode');

function activate(context) {
  context.subscriptions.push(
    vscode.commands.registerCommand("fliplot.start", () => {
      const panel = vscode.window.createWebviewPanel(
        "fliplot",
        "Fliplot Title",
        vscode.ViewColumn.One,
        {
          enableScripts: true
        }
      );
      loadWebviewContent(context, panel.webview);
    })
  );
}

function loadWebviewContent(context, webview) {
  const extensionUri = context.extensionUri;
  const mainCssPath = vscode.Uri.joinPath(extensionUri, "css", "styles.css");
  const mainJsPath = vscode.Uri.joinPath(extensionUri, "dist", "main.js");
  const mainCssUri = webview.asWebviewUri(mainCssPath);
  const mainJsUri = webview.asWebviewUri(mainJsPath);

  const indexHtmlPath = vscode.Uri.joinPath(extensionUri, "index.tmpl.html");
  vscode.workspace.fs.readFile(indexHtmlPath)
    .then(bytes => {
      const content = new TextDecoder().decode(bytes)
          .replaceAll("${mainCssUri}", mainCssUri)
          .replaceAll("${mainJsUri}", mainJsUri);
      webview.html = content;
    }, err => {
      console.error("error while loading index html file:", err);
    });
}

module.exports = {
  activate: activate
}
