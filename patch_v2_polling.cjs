const fs = require('fs');

let code = fs.readFileSync('server.ts', 'utf8');

const replacement = `
    let data = await runpodResponse.json();
    
    // Polling logic for RunPod async jobs
    if (data.id && (data.status === 'IN_QUEUE' || data.status === 'IN_PROGRESS')) {
      let statusUrl = customBaseUrl.replace(/\\/runsync$/, '/status/' + data.id).replace(/\\/run$/, '/status/' + data.id);
      
      // If the user provided a URL that didn't end in run or runsync, attempt to construct it
      if (statusUrl === customBaseUrl) {
         if (!statusUrl.endsWith('/')) statusUrl += '/';
         statusUrl += 'status/' + data.id;
      }
      
      let attempts = 0;
      while ((data.status === 'IN_QUEUE' || data.status === 'IN_PROGRESS') && attempts < 120) {
        await new Promise(resolve => setTimeout(resolve, 3000));
        try {
          const statusResponse = await fetch(statusUrl, {
            headers: {
              "Authorization": "Bearer " + (customApiKey || '')
            }
          });
          if (statusResponse.ok) {
            const newData = await statusResponse.json();
            data = newData;
            // log the polling status for debug
            fs.appendFileSync("/tmp/runpod_log.txt", "RUNPOD POLL: " + JSON.stringify(data) + "\\n");
          }
        } catch (e) {
          console.error("Polling error", e);
        }
        attempts++;
      }
      
      if (data.status !== 'COMPLETED') {
        throw new Error("RunPod job failed or timed out. Status: " + data.status);
      }
    }

    // Log for debugging
    fs.appendFileSync("/tmp/runpod_log.txt", "RUNPOD RESPONSE FINAL: " + JSON.stringify(data) + "\\n");
`;

code = code.replace(
  /let data = await runpodResponse\.json\(\);[\s\S]*?fs\.appendFileSync\("\/tmp\/runpod_log\.txt", "RUNPOD RESPONSE: " \+ JSON\.stringify\(data\) \+ "\\n"\);/,
  replacement.trim()
);

fs.writeFileSync('server.ts', code);
