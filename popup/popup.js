const inputBox = document.querySelector(".input-check-box");
inputBox.addEventListener("change", () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const activeTab = tabs[0];
    if (activeTab) {
      const message = { event: inputBox.checked ? "onStart" : "onStop" };
      chrome.tabs.sendMessage(activeTab.id, message);
    }
  });
});