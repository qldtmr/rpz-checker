from flask import Flask, request, render_template, jsonify
import dns.resolver
 
app = Flask(__name__)
 
@app.route('/')
def index():
    # Serve the index.html file
    return render_template('index.html')
 
@app.route('/check-domain', methods=['POST'])
def check_domain():
    domains = request.json['domains']
    results = [lookup_domain(domain) for domain in domains]
    # Convert results to a format that can be JSON serialized
    results_json = [{'domain': domain, 'status': result[0], 'reason': result[1]} for domain, result in zip(domains, results)]
    return jsonify(results_json)
 
def lookup_domain(domain):
    try:
        dns.resolver.resolve(f"{domain}.rpz.blacklist", "A")
        reason = dns.resolver.resolve(f"{domain}.rpz.blacklist", "TXT")
        return "Blacklisted", reason[0].strings[0].decode('utf-8')
    except dns.resolver.NoAnswer:
        return "Not blacklisted", "No reason provided - domain is not blacklisted."
    except Exception as e:
        return "Error", f"An error occurred: {e}"
 
if __name__ == '__main__':
    app.run(debug=True)