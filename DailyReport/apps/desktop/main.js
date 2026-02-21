const { app, BrowserWindow, Notification, ipcMain } = require("electron");
const path = require("path");

let mainWindow = null;

const createWindow = () => {
  mainWindow = new BrowserWindow({
    width: 1100,
    height: 720,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  mainWindow.loadFile(path.join(__dirname, "index.html"));
};

const showDailyNotification = () => {
  const notification = new Notification({
    title: "Daily Report Ready",
    body: "Tap to open your report and start the interactive audio."
  });

  notification.on("click", () => {
    if (mainWindow) {
      mainWindow.show();
      mainWindow.focus();
    }
  });

  notification.show();
};

app.whenReady().then(() => {
  createWindow();
  showDailyNotification();

  ipcMain.handle("open-report", () => {
    if (mainWindow) {
      mainWindow.show();
      mainWindow.focus();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
