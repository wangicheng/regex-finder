const marker = new Mark(document.body);
let matches = [];
let currentIndex = -1;

function injectHighlightStyles() {
  const styleId = 'regex-finder-styles';
  if (document.getElementById(styleId)) {
    return;
  }

  const style = document.createElement('style');
  style.id = styleId;
  style.textContent = `
    mark {
      background-color: yellow !important;
      color: black !important;
      padding: 1px 0 !important;
    }

    mark.current-match {
      background-color: orange !important;
      outline: 1px solid #A04000 !important;
    }
  `;
  document.head.appendChild(style);
}

injectHighlightStyles();

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
        caseSensitive: options.caseSensitive,
        done: (count) => {
          matches = document.querySelectorAll('mark');
          currentIndex = matches.length > 0 ? 0 : -1;
          if (currentIndex !== -1) {
            scrollToElement(matches[currentIndex]);
          }
          sendResponse({ count: count, currentIndex: currentIndex !== -1 ? 1 : 0 });
        }
      };

      if (options.useRegex) {
        let regexQuery = query;
        if (options.wholeWord) {
          regexQuery = `\\b${query}\\b`;
        }
        
        try {
          const flags = 'g' + (options.caseSensitive ? '' : 'i');
          const regex = new RegExp(regexQuery, flags);
          marker.markRegExp(regex, markOptions);
        } catch (e) {
          console.error("Invalid Regex:", e);
          sendResponse({ count: 0 });
        }
      } else {
        markOptions.separateWordSearch = options.wholeWord;
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