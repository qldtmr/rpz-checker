document.addEventListener("DOMContentLoaded", function() {
    const form = document.getElementById("domain-check-form");
    const resultDiv = document.getElementById("result");

    form.addEventListener("submit", function(e) {
        e.preventDefault();
        const domainInput = document.getElementById("domain").value;
        // Split by commas or new lines to support multiple domains
        const domains = domainInput.split(/[\n,]+/).map(d => d.trim()).filter(d => d.length > 0);

        fetch('/check-domain', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({domains: domains})
        })
        .then(response => response.json())
        .then(data => {
            resultDiv.innerHTML = data.map(domainResult => `<p>${domainResult.domain}: ${domainResult.status} - ${domainResult.reason}</p>`).join('');
        })
        .catch((error) => {
            console.error('Error:', error);
            resultDiv.innerHTML = `<p>An error occurred.</p>`;
        });
    });
});