const https = require('https');

https.get('https://projeto-receita-certa.vercel.app/', (res) => {
  let html = '';
  res.on('data', (d) => { html += d; });
  res.on('end', () => {
    const match = html.match(/src=\"(\/assets\/index-[^\"]+\.js)\"/);
    if(match) {
      https.get('https://projeto-receita-certa.vercel.app'+match[1], (res2) => {
        let js = '';
        res2.on('data', (d) => { js += d; });
        res2.on('end', () => {
          console.log('Railway:', js.includes('projeto-receita-certa-production.up.railway.app'));
          console.log('Render:', js.includes('projeto-receita-certa.onrender.com'));
        });
      });
    }
  });
});
