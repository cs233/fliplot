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
  let mainCssUri = vscode.Uri.joinPath(extensionUri, "css", "styles.css");
  let mainJsUri = vscode.Uri.joinPath(extensionUri, "dist", "main.js");
  let publicDir = vscode.Uri.joinPath(extensionUri, "public");
  mainCssUri = webview.asWebviewUri(mainCssUri);
  mainJsUri = webview.asWebviewUri(mainJsUri);
  publicDir = webview.asWebviewUri(publicDir);

  const indexHtmlPath = vscode.Uri.joinPath(extensionUri, "index.tmpl.html");
  vscode.workspace.fs.readFile(indexHtmlPath)
    .then(bytes => {
      const content = new TextDecoder().decode(bytes)
          .replaceAll("${mainCssUri}", mainCssUri)
          .replaceAll("${mainJsUri}", mainJsUri)
          .replaceAll("${publicDir}", publicDir);
      webview.html = content;
    }, err => {
      console.error("error while loading index html file:", err);
    });
}

module.exports = {
  activate: activate
}
