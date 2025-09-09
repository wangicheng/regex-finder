function updatePreviewStyles() {
  const highlightColor = document.getElementById('highlightColor').value;
  const currentMatchColor = document.getElementById('currentMatchColor').value;
  const currentMatchOutlineColor = document.getElementById('currentMatchOutlineColor').value;

  const styleId = 'dynamic-preview-styles';
  let styleElement = document.getElementById(styleId);

  if (!styleElement) {
    styleElement = document.createElement('style');
    styleElement.id = styleId;
    document.head.appendChild(styleElement);
  }

  // Scoped to the preview text to avoid affecting anything else on the page.
  styleElement.textContent = `
    #previewText mark {
      background-color: ${highlightColor} !important;
      color: black !important;
      padding: 1px 0 !important;
    }

    #previewText mark.current-match {
      background-color: ${currentMatchColor} !important;
      outline: 1px solid ${currentMatchOutlineColor} !important;
    }
  `;
}


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
    updatePreviewStyles(); // Update preview on initial load
  });
}

function resetColorOptions() {
    const defaults = {
        highlightColor: '#ffff00',
        currentMatchColor: '#ffa500',
        currentMatchOutlineColor: '#A04000'
    };
    
    // Update the UI controls
    document.getElementById('highlightColor').value = defaults.highlightColor;
    document.getElementById('currentMatchColor').value = defaults.currentMatchColor;
    document.getElementById('currentMatchOutlineColor').value = defaults.currentMatchOutlineColor;
    
    // Update the visual preview
    updatePreviewStyles();

    // Save the new defaults to storage
    chrome.storage.sync.set(defaults, () => {
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

// Add event listeners for live preview on color change
document.getElementById('highlightColor').addEventListener('input', updatePreviewStyles);
document.getElementById('currentMatchColor').addEventListener('input', updatePreviewStyles);
document.getElementById('currentMatchOutlineColor').addEventListener('input', updatePreviewStyles);