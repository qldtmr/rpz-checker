document.addEventListener("DOMContentLoaded", function() {
    const form = document.getElementById("domain-check-form");
    const domainTextArea = document.getElementById("domain");
    const resultDiv = document.getElementById("result");
    const autoRefreshCheckbox = document.getElementById("autoRefresh");
    const refreshIntervalInput = document.getElementById("refreshInterval");
    const autoRefreshStatus = document.getElementById("autoRefreshStatus");
    const lastUpdateTime = document.getElementById("lastUpdateTime");
    const stopButton = document.getElementById("stopButton");
    let autoRefreshTimer = null;
    let countdownTimer = null;
    let countdown = 0;

    const queryOriginalDomainCheckbox = document.getElementById("queryOriginalDomain");
    const debugLogContainer = document.getElementById("debugLogContainer");
    const toggleDebugLogButton = document.getElementById("toggleDebugLog");
    const debugLog = document.getElementById("debugLog");

    // Check if there are domains in the URL hash when the page loads
    if (window.location.hash) {
        // Decode the hash and set it as the textarea value
        var hashDomains = window.location.hash.slice(1).split(',');
        domainTextArea.value = hashDomains.join('\n');
        checkDomains(); // Automatically perform the domain check
    }

    function updateUrlHash(domains) {
        window.location.hash = domains.join(',');
    }

    form.addEventListener("submit", function(e) {
        e.preventDefault();
        checkDomains();
        setupAutoRefresh();
    })

    function checkDomains() {
        const domainInput = domainTextArea.value;
        // Split input by commas or new lines, and map through each entry to trim whitespace
        const entries = domainInput.split(/[\n,]+/).map(entry => entry.trim()).filter(entry => entry.length > 0);

        // Preprocess entries to handle URLs (if necessary, you could expand this to handle specific cases client-side)
        const domains = entries.map(entry => {
            // Optionally preprocess entries for client-side URL handling
            // For this example, we directly send the entry to the backend where the main logic resides
            return entry;
        });

        // Update the URL hash with the current domains
        updateUrlHash(domains);

        // Include queryOriginalDomain option in the request
        const queryOriginalDomain = queryOriginalDomainCheckbox.checked;

        fetch('/check-domain', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({domains: domains, queryOriginalDomain: queryOriginalDomain})
        })
        .then(response => response.json())
        .then(data => {
            const now = new Date().toLocaleString();
            lastUpdateTime.textContent = `Queried at: ${now}`;
            resultDiv.innerHTML = linkify(data.map(domainResult => `
            <p>
            <strong>${domainResult.domain}</strong>
            <span class="${domainResult.status === 'Blacklisted' ? 'status-blacklisted' : 'status-not-blacklisted'}">
                            ${domainResult.status}
            </span>
            <span style="font-family: monospace;">${domainResult.reason}</span>
            </p>
        `).join(''));
            debugLog.textContent += linkify(`Query results: ${JSON.stringify(data, null, 2)}\n`); // Append new logs
            // if (debugLogContainer.style.display === "none") {
            //     debugLogContainer.style.display = "block"; // Show container if hidden
            // }
            // ${domainResult.processed_domain}, 
        })
        .catch((error) => {
            console.error('Error:', error);
            resultDiv.innerHTML += `<p>An error occurred.</p>`;
        });
    }

    // Toggle debug log visibility
    toggleDebugLogButton.addEventListener("click", function() {
        if (debugLogContainer.style.display === "none") {
            debugLogContainer.style.display = "block";
            toggleDebugLogButton.textContent = "Hide debug log";
        } else {
            debugLogContainer.style.display = "none";
            toggleDebugLogButton.textContent = "Show debug log";
        }
    });

    function setupAutoRefresh() {
        if (autoRefreshTimer) {
            clearInterval(autoRefreshTimer);
            autoRefreshTimer = null;
            clearInterval(countdownTimer);
            countdownTimer = null;
        }
        if (autoRefreshCheckbox.checked) {
            const interval = Math.max(1, Math.min(parseInt(refreshIntervalInput.value, 10), 60));
            countdown = interval;
            autoRefreshStatus.textContent = `Auto-refresh in ${countdown} seconds`;
            countdownTimer = setInterval(() => {
                countdown--;
                autoRefreshStatus.textContent = `Auto-refresh in ${countdown} seconds`;
                if (countdown <= 0) countdown = interval;
            }, 1000);
            autoRefreshTimer = setInterval(checkDomains, interval * 1000);
            // stopButton.style.display = 'inline'; // Show the stop button when auto-refresh is active
        } else {
            autoRefreshStatus.textContent = '';
            // stopButton.style.display = 'none';
        }
    }

    // To immediately adjust the auto-refresh behavior if the user changes the checkbox or interval without submitting
    autoRefreshCheckbox.addEventListener('change', setupAutoRefresh);
    refreshIntervalInput.addEventListener('change', setupAutoRefresh);

    function linkify(inputText) {
        var urlRegex = /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;
        return inputText.replace(urlRegex, function(url) {
            return '<a href="' + url + '" target="_blank" class="detected-link">' + url + '</a>';
        });
    }

    function adjustTextAreaHeight(textarea) {
        domainTextArea.style.height = "35px";
        textarea.style.height = 'auto'; // Reset height to recalculate
        textarea.style.height = (textarea.scrollHeight) + 'px';
    }

    domainTextArea.style.height = "35px";

    domainTextArea.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            checkDomains();
        }

        if (e.key == 'Enter' && e.shiftKey) {
            this.style.height = (this.scrollHeight + 20) + 'px';
        }
    });

    // Run this function on input event of textarea
    domainTextArea.addEventListener('input', function() {
        adjustTextAreaHeight(this);
    });

    domainTextArea.addEventListener('paste', function(e) {
        setTimeout(function() { checkDomains(); }, 0);
    });
    
    // Also run on page load in case of any prefilled content
    window.onload = function() {
        document.getElementById('domain').focus();
        adjustTextAreaHeight(document.getElementById('domain'));
    };
});