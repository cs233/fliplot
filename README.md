# fliplot

Fliplot is an alternative to GTKWave, but implemented as a VS Code extension
using HTML and JavaScript/TypeScript.

Part of the student experience in CS 233 is implementing datapaths in Verilog
and using a waveform viewer for debugging. Traditionally, we've been using
GTKWave, but asking students to install it proved difficult. We've tried
offering GTKWave via a Ubuntu workspace in PrairieLearn but that also has its
problems. Therefore, the goal of the Fliplot project is to offer a waveform
viewer as a vscode extension so students can easily use it within a vscode
workspace in PrairieLearn (alongside editing Verilog code).

![](demo.gif)

# Getting Started

Here are the basic steps to start development.

### Requirements

Requires nodejs `>=14.18.0` (and optionally python `>=3.9`).

This project is a vscode extension so you need to have vscode installed. You
should also do local development within vscode itself to take advantage of
features for debugging extensions.

Lastly, install javascript dependencies using: `npm install`.

### Run/Debug extension

The main way to "run" this project is to open vscode with this extension
installed. This is already setup as a vscode launch task (see
`.vscode/launch.json`).

1. Open the top-level folder in vscode, if not already.
2. Compile code: `npm run build`.
3. Navigate to the "Run and Debug" panel on sidebar.
4. Select "Run Extension" and click Run (green arrow).

A new vscode window should open with this extension enabled. You might find it
useful to have devtools console open (Help > Toggle Developer Tools).

### Start Python server (deprecated)

This used to be a Python app. It doesn't quite work anymore since most parts
has been ported to vscode extension, but you can still try out the Python
server.

1. (optional) Create and activate a new python virtual-environment (or use conda):
    ```bash
    python3 -m virtualenv .venv
    ./.venv/bin/activate
    ```
2. Install python dependencies: `pip install flask`
3. Start flask server:
    ```bash
     export FLASK_APP=flask_app
     export FLASK_ENV=development
     flask run
    ```
4. You can now make requests to the server:
    ```bash
    curl -X POST 'http://localhost:5000/parse-vcd' \
      -H 'content-type: application/json' \
      -d '{"fname": "examples/sample.vcd"}'
    ```
