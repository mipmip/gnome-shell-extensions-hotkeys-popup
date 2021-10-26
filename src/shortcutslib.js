const GLib = imports.gi.GLib;
const Gio = imports.gi.Gio;

// Combines the benefits of spawn_sync (easy retrieval of output)
// with those of spawn_async (non-blocking execution).
// Based on https://github.com/optimisme/gjs-examples/blob/master/assets/spawn.js.

/* exported spawnWithCallback */
function spawnWithCallback(workingDirectory, argv, envp, flags, childSetup, callback) {
  let [success, _, stdinFile, stdoutFile, stderrFile] = GLib.spawn_async_with_pipes(
    workingDirectory, argv, envp, flags, childSetup);

  if (!success)
    return;

  GLib.close(stdinFile);
  GLib.close(stderrFile);

  let standardOutput = "";

  let stdoutStream = new Gio.DataInputStream({
    base_stream: new Gio.UnixInputStream({
      fd: stdoutFile
    })
  });

  readStream(stdoutStream, (output) => {
    if (output === null) {
      stdoutStream.close(null);
      callback(standardOutput);
    } else {
      standardOutput += output;
    }
  });
}

function readStream(stream, callback) {
  stream.read_line_async(GLib.PRIORITY_LOW, null, (source, result) => {
    let [line] = source.read_line_finish(result);

    if (line === null) {
      callback(null);
    } else {
      callback(imports.byteArray.toString(line) + "\n");
      readStream(source, callback);
    }
  });
}


/* exported normalize_description */
function normalize_description(str) {
  str = str.replaceAll("-", " ");
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/* exported normalize_key */
function normalize_key(str) {
  return str.replace("['","").replace("']","").replaceAll(",","").replaceAll("'","").replaceAll(">","> ");
}

/* exported translateSchemaNames */
function translateSchemaNames(schema){

  let translations = {
    "org.gnome.shell.keybindings": "Shell",
    "org.gnome.desktop.wm.keybindings": "Window Manager"
  }

  return translations[schema];
}

