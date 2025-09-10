const marker = new Mark(document.body);
let matches = [];
let currentIndex = -1;

const DEFAULT_STYLES = {
  highlightColor: 'yellow',
  currentMatchColor: 'orange',
  currentMatchOutlineColor: '#A04000' // Default outline color
};

function applyStylesFromStorage() {
  chrome.storage.sync.get(DEFAULT_STYLES, (settings) => {
    updateDynamicStyles(settings);
  });
}

function updateDynamicStyles(settings) {
  const styleId = 'regex-finder-styles';
  let styleElement = document.getElementById(styleId);

  if (!styleElement) {
    styleElement = document.createElement('style');
    styleElement.id = styleId;
    document.head.appendChild(styleElement);
  }

  // The outline color is now dynamic based on user settings.
  styleElement.textContent = `
    mark {
      background-color: ${settings.highlightColor} !important;
      color: black !important;
      padding: 1px 0 !important;
    }

    mark.current-match {
      background-color: ${settings.currentMatchColor} !important;
      outline: 1px solid ${settings.currentMatchOutlineColor} !important;
    }
  `;
}

applyStylesFromStorage();

// Listen for changes to any of the color settings.
chrome.storage.onChanged.addListener((changes, namespace) => {
    if (namespace === 'sync' && (changes.highlightColor || changes.currentMatchColor || changes.currentMatchOutlineColor)) {
        applyStylesFromStorage();
    }
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "search") {
    handleSearch(message.query, message.options, sendResponse);
  } else if (message.action === "clear") {
    marker.unmark();
    matches = [];
    currentIndex = -1;
    sendResponse({ count: 0 });
  } else if (message.action === "next") {
    if (matches.length > 0) {
      currentIndex = (currentIndex + 1) % matches.length;
      scrollToElement(matches[currentIndex]);
      sendResponse({ count: matches.length, currentIndex: currentIndex + 1 });
    }
  } else if (message.action === "previous") {
    if (matches.length > 0) {
      currentIndex = (currentIndex - 1 + matches.length) % matches.length;
      scrollToElement(matches[currentIndex]);
      sendResponse({ count: matches.length, currentIndex: currentIndex + 1 });
    }
  }
  return true;
});

function handleSearch(query, options, sendResponse) {
  marker.unmark({
    done: () => {
      const markOptions = {
        done: (totalCount) => {
          const allFoundElements = Array.from(document.querySelectorAll('mark'));
          const visibleMatches = allFoundElements.filter(el => el.offsetParent !== null);
          const invisibleMatches = allFoundElements.filter(el => el.offsetParent === null);

          invisibleMatches.forEach(el => {
            el.replaceWith(...el.childNodes);
          });

          matches = visibleMatches;

          matches.sort((a, b) => {
            const rectA = a.getBoundingClientRect();
            const rectB = b.getBoundingClientRect();
            return rectA.top - rectB.top;
          });

          currentIndex = matches.length > 0 ? 0 : -1;

          if (currentIndex !== -1) {
            scrollToElement(matches[currentIndex]);
          }
          
          sendResponse({ count: matches.length, currentIndex: currentIndex !== -1 ? 1 : 0 });
        },
        exclude: [
          "textarea",
          "input",
          "script",
          "style"
        ]
      };

      if (options.wholeWord || options.useRegex) {
        if (!options.useRegex) {
          query = RegExp.escape(query);
        }
        if (options.wholeWord) {
          query = `\\b${query}\\b`;
        }
        try {
          const flags = 'g' + (options.caseSensitive ? '' : 'i');
          const regex = new RegExp(query, flags);
          marker.markRegExp(regex, markOptions);
        } catch (e) {
          console.error("Invalid Regex:", e);
          sendResponse({ count: 0 });
        }
      } else {
        markOptions.caseSensitive = options.caseSensitive;
        marker.mark(query, markOptions);
      }
    }
  });
}

function scrollToElement(element) {
  if (!element) return;
  document.querySelectorAll('mark.current-match').forEach(el => {
    el.classList.remove('current-match');
  });
  element.classList.add('current-match');
  element.scrollIntoView({
    behavior: 'smooth',
    block: 'center'
  });
}