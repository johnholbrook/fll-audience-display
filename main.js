// Modules to control application life and create native browser window
const {app, BrowserWindow, Menu, ipcMain, TouchBar} = require('electron')
const path = require('path')

const { TouchBarLabel, TouchBarButton, TouchBarSpacer } = TouchBar

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
global.controllerWindow = null;
global.displayWindow = null;
global.extraTimerWindow = null;

//global to indicate whether the app is running on macs
var isMac = (process.platform == 'darwin');

//define the menu code
const winMenuTemplate = [
  // { role: 'appMenu' } (macOS only)
  ...(isMac ? [{
    label: app.getName(),
    submenu: [
      { role: 'about' },
      { type: 'separator' },
      { role: 'services' },
      { type: 'separator' },
      { role: 'hide' },
      { role: 'hideothers' },
      { role: 'unhide' },
      { type: 'separator' },
      { role: 'quit' }
    ]
  }] : []),
  // { role: 'editMenu' }
  {
    label: 'Edit',
    submenu: [
      { role: 'undo' },
      { role: 'redo' },
      { type: 'separator' },
      { role: 'cut' },
      { role: 'copy' },
      { role: 'paste' },
      //more macOS only stuff in the "Edit" menu
      ...(isMac ? [
        { role: 'pasteAndMatchStyle' },
        { role: 'delete' },
        { role: 'selectAll' },
        { type: 'separator' },
        {
          label: 'Speech',
          submenu: [
            { role: 'startspeaking' },
            { role: 'stopspeaking' }
          ]
        }
      ] : [
        { role: 'delete' },
        { type: 'separator' },
        { role: 'selectAll' }
      ])
    ]
  },
  // { role: 'viewMenu' }
  {
    label: 'View',
    submenu: [
      { role: 'reload' },
      { role: 'forcereload' },
      { role: 'toggledevtools' },
      { type: 'separator' },
      { role: 'resetzoom' },
      { role: 'zoomin' },
      { role: 'zoomout' },
      { type: 'separator' },
      { role: 'togglefullscreen' }
    ]
  },
  // { role: 'windowMenu' }
  {
    label: 'Window',
    submenu: [
      { role: 'minimize' },
      // { role: 'maximize' },
      { role: 'zoom' },
      ...(isMac ? [
        { type: 'separator' },
        { role: 'front' },
        { type: 'separator' },
        { role: 'window' }
      ] : [
        { role: 'close' }
      ])
    ]
  },
  {
    role: 'help',
    submenu: [
      {
        label: 'Learn More',
        click: async () => {
          const { shell } = require('electron')
          await shell.openExternal('https://github.com/dhmmjoph/fll-audience-display')
        }
      }
    ]
  }
]

function createControllerWindow(){
  // Create the browser window.
  controllerWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      // preload: path.join(__dirname, 'preload.js')
      nodeIntegration:true
    }
  })

  if (isMac){
    controllerWindow.setTouchBar(touchBar)
  }

  // and load the index.html of the app.
  controllerWindow.loadFile('./controller/controller.html')
}

function createDisplayWindow(){
  displayWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      // preload: path.join(__dirname, 'preload.js')
      nodeIntegration:true
    }
  })

  if (isMac){
    displayWindow.setTouchBar(touchBar)
  }

  // and load the index.html of the app.
  displayWindow.loadFile('./display/display.html')
}

function createExtraTimerWindow(){
  extraTimerWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      // preload: path.join(__dirname, 'preload.js')
      nodeIntegration:true
    }
  })

  if (isMac){
    extraTimerWindow.setTouchBar(touchBar)
  }

  // and load the index.html of the app.
  extraTimerWindow.loadFile('./extraTimer/extraTimer.html');

  extraTimerWindow.on('closed', function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    extraTimerWindow = null;
  });
}

function createWindow () {
  createControllerWindow();
  createDisplayWindow();

  const winMenu = Menu.buildFromTemplate(winMenuTemplate)
  Menu.setApplicationMenu(winMenu)

  // Open the DevTools.
  // controllerWindow.webContents.openDevTools()

  // Emitted when the window is closed.
  controllerWindow.on('closed', function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    controllerWindow = null;
  });

  displayWindow.on('closed', function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    displayWindow = null;
  });
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') app.quit()
})

app.on('activate', function () {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (controllerWindow === null) createControllerWindow();
  if (displayWindow === null) createDisplayWindow();
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.

//create the extra timer window when prompted by the controller window
ipcMain.on("spawn-extra-timer-window", function(event, arg){
  if (extraTimerWindow === null) createExtraTimerWindow();
});

//distribute the set-timer-text message to appropriate windows
ipcMain.on("set-timer-text", function(event, arg){
  controllerWindow.webContents.send("set-timer-text", arg);
  if (extraTimerWindow != null){
    extraTimerWindow.webContents.send("set-timer-text", arg);
  }
  timer_current.label = arg;
});

//distribute the set-timer-font message to appropriate windows
ipcMain.on("set-timer-font", function(event, arg){
  displayWindow.webContents.send("set-timer-font", arg);
  if (extraTimerWindow != null){
    extraTimerWindow.webContents.send("set-timer-font", arg);
  }
});

ipcMain.on("set-start-button-text", function(event, arg){
  displayWindow.webContents.send("set-start-button-text", arg);
  timer_sp.label = arg;
});

ipcMain.on("current-match-block", function(event, arg){
  curr_block.label = arg;
})

const timer_current = new TouchBarButton({
  backgroundColor: "#000000"
});
const timer_sp = new TouchBarButton({
  label : "Start",
  backgroundColor: '#5CB85C',
  click: () => {
    controllerWindow.webContents.send("start-timer");
  }
});
const timer_reset = new TouchBarButton({
  label : "Reset",
  backgroundColor : "#D9534F",
  click : () => {
    displayWindow.webContents.send("reset-timer");
  }
});


// const curr_block = new TouchBarButton({
//   backgroundColor : "#000000"
// });

const curr_block = new TouchBarLabel();
const prev_block = new TouchBarButton({
  label : "Prev Block",
  backgroundColor : "#0275d8",
  click : () => {
    controllerWindow.webContents.send("prev-match-block");
  }
});
const next_block = new TouchBarButton({
  label : "Next Block",
  backgroundColor : "#0275d8",
  click : () => {
    controllerWindow.webContents.send("next-match-block");
  }
});

// const none_button = new TouchBarButton({
//   label : "None"
// });
const logos_button = new TouchBarButton({
  label : "Logos",
  click : () => {
    displayWindow.webContents.send("new-display-selected", "logos");
    controllerWindow.webContents.send("radio-select", "#logos-radio-button")
  }
});
const schedule_button = new TouchBarButton({
  label : "Schedule",
  click : () => {
    displayWindow.webContents.send("new-display-selected", "schedule");
    controllerWindow.webContents.send("radio-select", "#schedule-radio-button")
  }
});
const intro_button = new TouchBarButton({
  label : "Intro",
  click : () => {
    displayWindow.webContents.send("new-display-selected", "intro");
    controllerWindow.webContents.send("radio-select", "#intro-radio-button")
  }
});
const scores_button = new TouchBarButton({
  label : "Scores",
  click : () => {
    displayWindow.webContents.send("new-display-selected", "scores");
    controllerWindow.webContents.send("radio-select", "#scores-radio-button")
  }
});
// const timer_button = new TouchBarButton({
//   label : "Timer"
// });
const other_events_button = new TouchBarButton({
  label : "Other",
  click : () => {
    displayWindow.webContents.send("new-display-selected", "other-events");
    controllerWindow.webContents.send("radio-select", "#other-events-radio-button")
  }
});
// const display_select_group = new TouchBarGroup({
//   items : [
//     none_button,
//     logos_button,
//     schedule_button,
//     intro_button,
//     scores_button,
//     timer_button,
//     other_events_button
//   ]
// });


const touchBar = new TouchBar({
  items: [
    timer_current,
    timer_sp,
    timer_reset,
    new TouchBarSpacer({ size: 'large' }),
    // prev_block,
    // curr_block,
    // next_block,
    // new TouchBarSpacer({ size : 'large'}),
    logos_button,
    schedule_button,
    intro_button,
    scores_button,
    // timer_button,
    other_events_button
  ]
});