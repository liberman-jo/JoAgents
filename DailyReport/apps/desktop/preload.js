const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("dailyReport", {
  openReport: () => ipcRenderer.invoke("open-report")
});
