document.addEventListener('DOMContentLoaded', () => {
    const problemInput = document.getElementById('problemInput');
    const importBtn = document.getElementById('importBtn');
    const problemContainer = document.getElementById('problemContainer');
    const codeEditor = document.getElementById('codeEditor');
    const languageSelect = document.getElementById('languageSelect');
    const runBtn = document.getElementById('runBtn');
    const submitBtn = document.getElementById('submitBtn');
    const outputPanel = document.getElementById('outputPanel');

    // Piston API Runtimes
    const RUNTIMES = {
        'python': { language: 'python', version: '3.10.0' },
        'javascript': { language: 'javascript', version: '18.15.0' },
        'java': { language: 'java', version: '15.0.2' },
        'cpp': { language: 'c++', version: '10.2.0' }
    };

    // Import Problem via AI
    importBtn.addEventListener('click', async () => {
        const query = problemInput.value.trim();
        if (!query) return;

        const key = (typeof DEFAULT_AI_KEY !== 'undefined' && DEFAULT_AI_KEY) ? DEFAULT_AI_KEY : localStorage.getItem('ai_api_key');
        if (!key) {
            alert('Please configure AI API Key in Settings (on Home/Repo page) or use the default key.');
            return;
        }

        importBtn.disabled = true;
        importBtn.textContent = 'Fetching...';
        problemContainer.innerHTML = '<div style="text-align: center; margin-top: 50px;">Loading problem details...</div>';

        try {
            const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${key}`,
                    'HTTP-Referer': window.location.href,
                    'X-Title': 'Code Syncer'
                },
                body: JSON.stringify({
                    model: "openai/gpt-3.5-turbo",
                    messages: [
                        {
                            role: "system",
                            content: `You are a LeetCode problem fetcher. 
                            User will provide a URL or Name. 
                            Return a JSON object with:
                            {
                                "title": "Problem Title",
                                "difficulty": "Easy/Medium/Hard",
                                "description": "Full problem description in Markdown format",
                                "starter_code": {
                                    "python": "def solution(): pass",
                                    "javascript": "function solution() {}",
                                    "java": "class Solution {}",
                                    "cpp": "class Solution {}"
                                }
                            }
                            Do not include markdown backticks around the JSON.`
                        },
                        {
                            role: "user",
                            content: `Fetch details for: ${query}`
                        }
                    ]
                })
            });

            if (!response.ok) throw new Error('AI API Error');

            const data = await response.json();
            let content = data.choices[0].message.content;
            content = content.replace(/```json/g, '').replace(/```/g, '').trim();
            
            const problem = JSON.parse(content);
            renderProblem(problem);

        } catch (error) {
            console.error(error);
            problemContainer.innerHTML = `<div style="color: var(--danger-color); text-align: center; margin-top: 50px;">Error: ${error.message}</div>`;
        } finally {
            importBtn.disabled = false;
            importBtn.textContent = 'Import';
        }
    });

    function renderProblem(problem) {
        // Difficulty Badge Class
        let diffClass = 'diff-easy';
        if (problem.difficulty === 'Medium') diffClass = 'diff-medium';
        if (problem.difficulty === 'Hard') diffClass = 'diff-hard';

        // Render Markdown
        const htmlDesc = marked.parse(problem.description);

        problemContainer.innerHTML = `
            <div style="border-bottom: 1px solid var(--border-color); padding-bottom: 10px; margin-bottom: 20px;">
                <h1 style="margin-bottom: 10px;">${problem.title}</h1>
                <span class="difficulty-badge ${diffClass}">${problem.difficulty}</span>
            </div>
            <div>${htmlDesc}</div>
        `;

        // Set Starter Code
        const lang = languageSelect.value;
        if (problem.starter_code && problem.starter_code[lang]) {
            codeEditor.value = problem.starter_code[lang];
        } else {
            codeEditor.value = "// No starter code available for this language.";
        }

        // Store current problem for language switching
        window.currentProblem = problem;
    }

    // Language Change
    languageSelect.addEventListener('change', () => {
        if (window.currentProblem && window.currentProblem.starter_code) {
            const lang = languageSelect.value;
            codeEditor.value = window.currentProblem.starter_code[lang] || "// Code";
        }
    });

    // Run Code (Piston)
    runBtn.addEventListener('click', async () => {
        const code = codeEditor.value;
        const lang = languageSelect.value;
        const runtime = RUNTIMES[lang];

        if (!code) return;

        runBtn.disabled = true;
        runBtn.textContent = 'Running...';
        outputPanel.innerHTML = 'Running...';

        try {
            const response = await fetch('https://emkc.org/api/v2/piston/execute', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    language: runtime.language,
                    version: runtime.version,
                    files: [{ content: code }]
                })
            });

            const data = await response.json();
            
            if (data.run) {
                let output = data.run.stdout || '';
                if (data.run.stderr) output += '\nError:\n' + data.run.stderr;
                outputPanel.innerText = output || 'No output';
            } else {
                outputPanel.innerText = 'Error: ' + (data.message || 'Unknown error');
            }

        } catch (error) {
            outputPanel.innerText = 'Error: ' + error.message;
        } finally {
            runBtn.disabled = false;
            runBtn.textContent = 'Run Code';
        }
    });

    // AI Judge
    submitBtn.addEventListener('click', async () => {
        if (!window.currentProblem) {
            alert('Import a problem first!');
            return;
        }

        const code = codeEditor.value;
        const lang = languageSelect.value;
        const key = (typeof DEFAULT_AI_KEY !== 'undefined' && DEFAULT_AI_KEY) ? DEFAULT_AI_KEY : localStorage.getItem('ai_api_key');

        submitBtn.disabled = true;
        submitBtn.textContent = 'Judging...';
        outputPanel.innerHTML = 'AI Judge is evaluating...';

        try {
            const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${key}`,
                    'HTTP-Referer': window.location.href,
                    'X-Title': 'Code Syncer'
                },
                body: JSON.stringify({
                    model: "openai/gpt-3.5-turbo",
                    messages: [
                        {
                            role: "system",
                            content: "You are a coding judge. Evaluate the user's solution against the problem description. Check for correctness, edge cases, and time complexity. Return a short report: Pass/Fail, reasoning, and potential improvements."
                        },
                        {
                            role: "user",
                            content: `Problem: ${window.currentProblem.title}\nDescription: ${window.currentProblem.description}\n\nUser Code (${lang}):\n${code}`
                        }
                    ]
                })
            });

            const data = await response.json();
            const result = data.choices[0].message.content;
            outputPanel.innerText = result;

        } catch (error) {
            outputPanel.innerText = 'Judge Error: ' + error.message;
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = 'AI Judge';
        }
    });

    // Tab Key Support
    codeEditor.addEventListener('keydown', (e) => {
        if (e.key === 'Tab') {
            e.preventDefault();
            const start = codeEditor.selectionStart;
            const end = codeEditor.selectionEnd;
            codeEditor.value = codeEditor.value.substring(0, start) + '    ' + codeEditor.value.substring(end);
            codeEditor.selectionStart = codeEditor.selectionEnd = start + 4;
        }
    });
});
