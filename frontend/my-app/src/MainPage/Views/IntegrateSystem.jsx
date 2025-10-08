import { useState } from 'react';
import '../style.css';

function IntegrateSystem() {
    const [selectedLanguage, setSelectedLanguage] = useState('python');

    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';

    const languages = [
        { id: 'python', name: 'Python', icon: '🐍' },
        { id: 'javascript', name: 'JavaScript', icon: '📜' },
        { id: 'nodejs', name: 'Node.js', icon: '🟢' },
        { id: 'curl', name: 'cURL', icon: '🔧' },
        { id: 'php', name: 'PHP', icon: '🐘' },
        { id: 'csharp', name: 'C#', icon: '⚙️' },
        { id: 'go', name: 'Go', icon: '🔵' },
        { id: 'ruby', name: 'Ruby', icon: '💎' },
    ];

    const codeExamples = {
        python: `import requests

API_URL = "${apiUrl}"
LICENSE_KEY = "your-license-key-here"

response = requests.get(
    f"{API_URL}/licenses/validate",
    params={"license_key": LICENSE_KEY}
)

if response.status_code == 200:
    data = response.json()
    print(f"✓ Valid! Uses: {data['uses']}")
elif response.status_code == 404:
    print("✗ License not found")
elif response.status_code == 403:
    print("✗ No uses remaining")`,

        javascript: `const API_URL = "${apiUrl}";
const LICENSE_KEY = "your-license-key-here";

const response = await fetch(
    \`\${API_URL}/licenses/validate?license_key=\${LICENSE_KEY}\`
);

if (response.ok) {
    const data = await response.json();
    console.log(\`✓ Valid! Uses: \${data.uses}\`);
} else if (response.status === 404) {
    console.log("✗ License not found");
} else if (response.status === 403) {
    console.log("✗ No uses remaining");
}`,

        nodejs: `const axios = require('axios');

const API_URL = "${apiUrl}";
const LICENSE_KEY = "your-license-key-here";

try {
    const res = await axios.get(\`\${API_URL}/licenses/validate\`, {
        params: { license_key: LICENSE_KEY }
    });
    console.log(\`✓ Valid! Uses: \${res.data.uses}\`);
} catch (err) {
    if (err.response?.status === 404) {
        console.log("✗ License not found");
    } else if (err.response?.status === 403) {
        console.log("✗ No uses remaining");
    }
}`,

        curl: `#!/bin/bash
API_URL="${apiUrl}"
LICENSE_KEY="your-license-key-here"

curl -s "$API_URL/licenses/validate?license_key=$LICENSE_KEY" \\
  | jq -r 'if .detail then "✓ Valid! Uses: \\(.uses)" else "✗ Invalid" end'

# Or without jq:
response=$(curl -s -w "%{http_code}" \\
  "$API_URL/licenses/validate?license_key=$LICENSE_KEY")
http_code=\${response: -3}

if [ "$http_code" = "200" ]; then
    echo "✓ License is valid"
else
    echo "✗ License is invalid"
fi`,

        php: `<?php
$apiUrl = '${apiUrl}';
$licenseKey = 'your-license-key-here';

$url = $apiUrl . '/licenses/validate?license_key=' . urlencode($licenseKey);
$response = file_get_contents($url, false);

if ($response !== false) {
    $data = json_decode($response, true);
    echo "✓ Valid! Uses: " . $data['uses'];
} else {
    echo "✗ License not found or invalid";
}
?>`,

        csharp: `using System;
using System.Net.Http;

var apiUrl = "${apiUrl}";
var licenseKey = "your-license-key-here";

using var client = new HttpClient();
var url = $"{apiUrl}/licenses/validate?license_key={licenseKey}";

try {
    var response = await client.GetAsync(url);
    
    if (response.IsSuccessStatusCode) {
        var content = await response.Content.ReadAsStringAsync();
        Console.WriteLine($"✓ Valid! {content}");
    } else if (response.StatusCode == System.Net.HttpStatusCode.NotFound) {
        Console.WriteLine("✗ License not found");
    } else if (response.StatusCode == System.Net.HttpStatusCode.Forbidden) {
        Console.WriteLine("✗ No uses remaining");
    }
} catch (Exception ex) {
    Console.WriteLine($"Error: {ex.Message}");
}`,

        go: `package main

import (
    "encoding/json"
    "fmt"
    "net/http"
)

func main() {
    apiUrl := "${apiUrl}"
    licenseKey := "your-license-key-here"
    
    url := fmt.Sprintf("%s/licenses/validate?license_key=%s", apiUrl, licenseKey)
    resp, err := http.Get(url)
    
    if err != nil {
        fmt.Println("Error:", err)
        return
    }
    defer resp.Body.Close()
    
    if resp.StatusCode == 200 {
        var result map[string]interface{}
        json.NewDecoder(resp.Body).Decode(&result)
        fmt.Printf("✓ Valid! Uses: %v\\n", result["uses"])
    } else if resp.StatusCode == 404 {
        fmt.Println("✗ License not found")
    } else if resp.StatusCode == 403 {
        fmt.Println("✗ No uses remaining")
    }
}`,

        ruby: `require 'net/http'
require 'json'

api_url = "${apiUrl}"
license_key = "your-license-key-here"

uri = URI("#{api_url}/licenses/validate?license_key=#{license_key}")
response = Net::HTTP.get_response(uri)

case response.code.to_i
when 200
  data = JSON.parse(response.body)
  puts "✓ Valid! Uses: #{data['uses']}"
when 404
  puts "✗ License not found"
when 403
  puts "✗ No uses remaining"
end`
    };

    const copyCode = () => {
        const code = codeExamples[selectedLanguage];
        navigator.clipboard.writeText(code);
    };

    return (
        <div className="license-container">
            <div className="integrate-card">
                <h2 className="license-title">Integration Guide</h2>
                <p className="integrate-description">
                    Quick examples on how to integrate license validation into your application
                </p>

                <div className="language-selector">
                    {languages.map(lang => (
                        <button
                            key={lang.id}
                            className={`lang-btn ${selectedLanguage === lang.id ? 'active-lang' : ''}`}
                            onClick={() => setSelectedLanguage(lang.id)}
                        >
                            <span className="lang-icon">{lang.icon}</span>
                            <span className="lang-name">{lang.name}</span>
                        </button>
                    ))}
                </div>

                <div className="code-block-container">
                    <div className="code-header">
                        <span className="code-title">
                            {languages.find(l => l.id === selectedLanguage)?.name} Example
                        </span>
                        <button className="copy-code-btn" onClick={copyCode}>
                            📋 Copy Code
                        </button>
                    </div>
                    <pre className="code-block">
                        <code>{codeExamples[selectedLanguage]}</code>
                    </pre>
                </div>

                <div className="integration-notes">
                    <h3 className="notes-title">📌 Important Notes</h3>
                    <ul className="notes-list">
                        <li>Replace <code>your-license-key-here</code> with the actual license key to validate</li>
                        <li><strong>No authentication required</strong> - This endpoint is publicly accessible</li>
                        <li>The API endpoint: <code>GET /licenses/validate?license_key=...</code></li>
                        <li>Returns <code>200</code> if valid with remaining uses count</li>
                        <li>Returns <code>404</code> if license key not found</li>
                        <li>Returns <code>403</code> if license has no uses remaining</li>
                        <li>Response includes <code>uses</code> field: number or "unlimited"</li>
                    </ul>
                </div>
            </div>
        </div>
    );
}

export default IntegrateSystem;