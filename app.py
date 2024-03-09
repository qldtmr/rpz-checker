from flask import Flask, request, render_template, jsonify
from urllib.parse import unquote, urlparse
import re
import dns.resolver

app = Flask(__name__)

def extract_domain_from_url(url):
    # Decode URL-encoded parts
    url = unquote(url)
    # Handle Microsoft 365 Safe Links
    ms_safe_links_pattern = re.compile(r'https?://(?:[a-zA-Z0-9-]+\.)*safelinks\.protection\.outlook\.com/\?url=([^&]+)')
    # Handle Proofpoint
    # Updated pattern to correctly match and extract from Proofpoint URLs
    proofpoint_pattern = re.compile(r'https?://urldefense\.com/v3/__(.*?)__;.*?!')

    ms_match = ms_safe_links_pattern.search(url)
    if ms_match:
        url = unquote(ms_match.group(1))
    
    pp_match = proofpoint_pattern.search(url)
    if pp_match:
        # Correctly extracts and decodes the URL from a Proofpoint rewritten URL
        url = unquote(pp_match.group(1).replace('-', '%').replace('_', '/'))

    # Extract domain from the URL
    parsed_url = urlparse(url)
    domain = parsed_url.netloc
    return domain if domain else url

@app.route('/')
def index():
    # Serve the index.html file
    return render_template('index.html')

@app.route('/check-domain', methods=['POST'])
def check_domain():
    domains = request.json['domains']
    results = []
    for domain in domains:
        processed_domain = extract_domain_from_url(domain)
        status, reason = lookup_domain(processed_domain)
        results.append({'domain': domain, 'processed_domain': processed_domain, 'status': status, 'reason': reason})
    return jsonify(results)

def lookup_domain(domain):
    try:
        dns.resolver.resolve(f"{domain}.rpz.blacklist", "A")
        reason = dns.resolver.resolve(f"{domain}.rpz.blacklist", "TXT")
        return "Blacklisted", reason[0].strings[0].decode('utf-8')
    except dns.resolver.NoAnswer:
        return "Not blacklisted (zone exists)", ""
    except dns.resolver.NXDOMAIN:
        return "Not blacklisted (no zone)", ""
    except Exception as e:
        return "Error", f"An error occurred: {e}"

if __name__ == '__main__':
    app.run(debug=True)
