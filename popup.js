document.addEventListener('DOMContentLoaded', () => {
  const searchInput = document.getElementById('searchInput');
  const clearBtn = document.getElementById('clearBtn');
  const caseBtn = document.getElementById('caseBtn');
  const wordBtn = document.getElementById('wordBtn');
  const regexBtn = document.getElementById('regexBtn');
  const optionsBtn = document.getElementById('optionsBtn');
  const resultsCountDiv = document.getElementById('resultsCount');
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');

  let searchOptions = {
    caseSensitive: false,
    wholeWord: false,
    useRegex: false
  };

  // Load saved settings and query
  chrome.storage.local.get(['searchOptions', 'searchQuery'], (result) => {
    if (result.searchOptions) {
      searchOptions = result.searchOptions;
      updateUI();
    }
    if (result.searchQuery) {
      searchInput.value = result.searchQuery;
      toggleClearButton();
      triggerSearch(); // Trigger search with loaded query
    }
  });

  // Function to update the UI based on current settings
  function updateUI() {
    caseBtn.classList.toggle('active', searchOptions.caseSensitive);
    wordBtn.classList.toggle('active', searchOptions.wholeWord);
    regexBtn.classList.toggle('active', searchOptions.useRegex);
  }

  // Function to show/hide the clear button
  function toggleClearButton() {
    clearBtn.style.display = searchInput.value ? 'flex' : 'none';
  }

  // Function to trigger a search
  function triggerSearch() {
    const query = searchInput.value;
    chrome.storage.local.set({ searchQuery: query }); // Save query
    toggleClearButton();
    if (query) {
      sendMessageToContentScript({ action: "search", query, options: searchOptions });
    } else {
      sendMessageToContentScript({ action: "clear" });
    }
  }

  // Add event listeners to the search option buttons
  [caseBtn, wordBtn, regexBtn].forEach(btn => {
    btn.addEventListener('click', () => {
      const optionKey = {
        'caseBtn': 'caseSensitive',
        'wordBtn': 'wholeWord',
        'regexBtn': 'useRegex'
      }[btn.id];

      searchOptions[optionKey] = !searchOptions[optionKey];
      updateUI();
      // Save settings and re-trigger search
      chrome.storage.local.set({ searchOptions });
      triggerSearch();
    });
  });

  searchInput.addEventListener('input', triggerSearch);

  clearBtn.addEventListener('click', () => {
    searchInput.value = '';
    triggerSearch();
    searchInput.focus();
  });
  
  prevBtn.addEventListener('click', () => sendMessageToContentScript({ action: "previous" }));
  nextBtn.addEventListener('click', () => sendMessageToContentScript({ action: "next" }));

  // Handle options button click to navigate
  optionsBtn.addEventListener('click', () => {
    chrome.runtime.openOptionsPage();
  });
  
  // Automatically focus the input field
  searchInput.focus();
});

// Function to send a message to the content script, now including search options
async function sendMessageToContentScript(message) {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (tab && tab.id) {
    chrome.tabs.sendMessage(tab.id, message, (response) => {
      if (chrome.runtime.lastError) { /* Handle error */ return; }
      const resultsCountDiv = document.getElementById('resultsCount');
      if (response && response.count > 0) {
         resultsCountDiv.textContent = `${response.currentIndex}/${response.count} matches`;
      } else if (response && response.count === 0) {
         resultsCountDiv.textContent = 'No results';
      } else {
         resultsCountDiv.textContent = '';
      }
    });
  }
}