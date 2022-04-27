import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
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

function loadWebviewContent(context: vscode.ExtensionContext, webview: vscode.Webview) {
  const extensionUri = context.extensionUri;
  let resourcesDir = vscode.Uri.joinPath(extensionUri, "resources");
  let mainJsUri = vscode.Uri.joinPath(extensionUri, "out", "main.js");
  let resourcesUri = webview.asWebviewUri(resourcesDir);
  mainJsUri = webview.asWebviewUri(mainJsUri);

  const indexHtmlPath = vscode.Uri.joinPath(resourcesDir, "index.html");
  vscode.workspace.fs.readFile(indexHtmlPath)
    .then(bytes => {
      const content = new TextDecoder().decode(bytes)
          .replaceAll("${resourcesDir}", resourcesUri.toString())
          .replaceAll("${mainJsUri}", mainJsUri.toString());
      webview.html = content;
    }, err => {
      console.error("error while loading index html file:", err);
    });
}
