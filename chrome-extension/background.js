chrome.action.onClicked.addListener(async (tab) => {
  const image = await chrome.tabs.captureVisibleTab(tab.windowId, {
    format: "png"
  });
  
  await chrome.storage.local.set({ itt_capture: image });

  // chrome.downloads.download({
  //   url: image,
  //   filename: "1.png",
  // })

  chrome.scripting.executeScript({
    target: {tabId: tab.id},
    files: ['tesseract.min.js', 'content.js']
  });
});
