import os   from "os";
import path from "path";

const HOME = os.homedir();

function getAppDataRoot () {
  switch (process.platform) {           // 'darwin'  |  'win32'  |  'linux'
    case "darwin":                      // macOS
      return path.join(HOME, "Library", "Application Support");

    case "win32":                       // Windows
      // APPDATA is the official roaming-data folder; fall back to the default.
      return process.env.APPDATA ||
             path.join(HOME, "AppData", "Roaming");          // :contentReference[oaicite:1]{index=1}

    default:                            // Linux / *nix
      // XDG spec: $XDG_DATA_HOME or ~/.local/share
      return process.env.XDG_DATA_HOME ||
             path.join(HOME, ".local", "share");
  }
}

const resultsDirPath = path.join(getAppDataRoot(), "Deepsec", "result_files");

const defaultValues = {
    showHelpers: true,
    deepsecApiPath: '',
    resultsDirPath: resultsDirPath,
    notificationDuration: 5, // seconds
    showBatchNotif: true,
    showRunNotif: false,
    showQueryNotif: true,
    stickyErrorNotif: true,
    stickyWarningNotif: true,
    codeStyleTheme: 'coy',
    defaultSpecFilesPath: 'mock-data/run/',
  };

export default defaultValues;
