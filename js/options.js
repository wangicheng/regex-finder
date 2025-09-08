function saveColorOptions() {
  const highlightColor = document.getElementById('highlightColor').value;
  const currentMatchColor = document.getElementById('currentMatchColor').value;
  const currentMatchOutlineColor = document.getElementById('currentMatchOutlineColor').value;
  
  chrome.storage.sync.set({
    highlightColor: highlightColor,
    currentMatchColor: currentMatchColor,
    currentMatchOutlineColor: currentMatchOutlineColor
  }, () => {
    const status = document.getElementById('statusMessage');
    status.textContent = 'Settings saved successfully.';
    setTimeout(() => {
      status.textContent = '';
    }, 2000);
  });
}

function loadColorOptions() {
  const defaults = {
    highlightColor: '#ffff00',
    currentMatchColor: '#ffa500',
    currentMatchOutlineColor: '#A04000'
  };
  
  chrome.storage.sync.get(defaults, (items) => {
    document.getElementById('highlightColor').value = items.highlightColor;
    document.getElementById('currentMatchColor').value = items.currentMatchColor;
    document.getElementById('currentMatchOutlineColor').value = items.currentMatchOutlineColor;
  });
}

function resetColorOptions() {
    const defaults = {
        highlightColor: '#ffff00',
        currentMatchColor: '#ffa500',
        currentMatchOutlineColor: '#A04000'
    };

    chrome.storage.sync.set(defaults, () => {
        loadColorOptions();
        const status = document.getElementById('statusMessage');
        status.textContent = 'Colors have been reset to their defaults.';
        setTimeout(() => {
            status.textContent = '';
        }, 2000);
    });
}

document.addEventListener('DOMContentLoaded', loadColorOptions);
document.getElementById('saveButton').addEventListener('click', saveColorOptions);
document.getElementById('resetButton').addEventListener('click', resetColorOptions);
document.getElementById('shortcutsBtn').addEventListener('click', () => {
  chrome.tabs.create({ url: 'chrome://extensions/shortcuts' });
});