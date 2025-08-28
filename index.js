const fs = require("fs");
const path = require("path");
const puppeteer = require("puppeteer");
const axios = require("axios");

(async () => {
  // arquivo de chaves
  const chavesPath = path.join(__dirname, "chaves.txt");
  const chaves = fs.readFileSync(chavesPath, "utf-8")
    .split("\n")
    .map(l => l.replace(/['\r]/g, "").trim())
    .filter(l => l.length > 0);

  console.log(`🔑 ${chaves.length} chaves carregadas.`);

  // entradas ou saídas?
  const readline = require("readline-sync");
  const tipo = readline.question("Digite o tipo de nota (entradas/saidas): ").toLowerCase();
  if (!["entradas", "saidas"].includes(tipo)) {
    console.log("Tipo inválido! Use 'entradas' ou 'saidas'.");
    process.exit();
  }

  // navegador
  const browser = await puppeteer.launch({
    headless: true,
    defaultViewport: null,
    args: ["--start-maximized"]
  });

  const page = await browser.newPage();

  // pasta de download ou é saidas ou entradas
  const downloadPath = path.join(__dirname, tipo === "saidas" ? "XML_SAIDAS" : "XML_ENTRADAS");
  fs.mkdirSync(downloadPath, { recursive: true });

  console.log(`📁 Downloads serão salvos em: ${downloadPath}`);

  // carrega a chave
  for (let chave of chaves) {
    console.log(`📥 Baixando XML da chave: ${chave}`);
    try {
      // entra no Meu Danfe
      await page.goto("https://meudanfe.com.br/consulta", { waitUntil: "networkidle2" });

      await page.waitForSelector("input[name='searchTxt']", { timeout: 5000 });

      // digita a chave
      await page.type("input[name='searchTxt']", chave, { delay: 50 });

      // botão "Buscar"
      await Promise.all([
        page.click("#searchBtn"),
        page.waitForNavigation({ waitUntil: "networkidle2" })
      ]);

      // espera o botão de download aparecer
      await page.waitForSelector("#downloadXmlBtn", { timeout: 10000 });

      // pega o link do botão e baixa o arquivo com axios (desisti de usar o puppeteer pq é mais complicado)
      const downloadUrl = await page.$eval("#downloadXmlBtn", el => el.href);
      const response = await axios({
        method: 'get',
        url: downloadUrl,
        responseType: 'stream'
      });

      const filePath = path.join(downloadPath, `${chave}.xml`);
      const writer = fs.createWriteStream(filePath);

      response.data.pipe(writer);

      await new Promise((resolve, reject) => {
        writer.on('finish', resolve);
        writer.on('error', reject);
      });

      console.log(`✅ XML ${chave}.xml salvo em: ${downloadPath}`);

      await new Promise(resolve => setTimeout(resolve, 2000));

    } catch (err) {
      console.error(`❌ Erro na chave ${chave}:`, err.message);
    }
  }

  await browser.close();
  console.log("🎉 Processo concluído!");
})();