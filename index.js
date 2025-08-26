const fs = require("fs");
const path = require("path");
const puppeteer = require("puppeteer");

(async () => {
  // 1. Lê o arquivo de chaves
  const chavesPath = path.join(__dirname, "chaves.txt");
  const chaves = fs.readFileSync(chavesPath, "utf-8")
    .split("\n")
    .map(l => l.replace(/['\r]/g, "").trim())
    .filter(l => l.length > 0);

  console.log(`🔑 ${chaves.length} chaves carregadas.`);

  // 2. Pergunta ao usuário se são entradas ou saídas
  const readline = require("readline-sync");
  const tipo = readline.question("Digite o tipo de nota (entradas/saidas): ").toLowerCase();
  if (!["entradas", "saidas"].includes(tipo)) {
    console.log("Tipo inválido! Use 'entradas' ou 'saidas'.");
    process.exit();
  }

  // 3. Abre o navegador
  const browser = await puppeteer.launch({
    headless: false, // true = sem interface, false = com interface (pra testar)
    defaultViewport: null,
    args: ["--start-maximized"]
  });

  const page = await browser.newPage();

  // 4. Define a pasta de downloads
  const downloadPath = path.join(__dirname, tipo === "saidas" ? "XML_SAIDAS" : "XML_ENTRADAS");
  fs.mkdirSync(downloadPath, { recursive: true });

  await page._client().send("Page.setDownloadBehavior", {
    behavior: "allow",
    downloadPath: downloadPath,
  });

  console.log(`📁 Downloads serão salvos em: ${downloadPath}`);

  // 5. Processa cada chave
  for (let chave of chaves) {
    console.log(`📥 Baixando XML da chave: ${chave}`);
    try {
      // Abre a página de consulta do Meu Danfe
      await page.goto("https://meudanfe.com.br/consulta", { waitUntil: "networkidle2" });

      // Digita a chave
      await page.type("input[name='chave']", chave, { delay: 50 });

      // Clica no botão "Consultar"
      await Promise.all([
        page.click("button[type='submit']"),
        page.waitForNavigation({ waitUntil: "networkidle2" })
      ]);

      // Baixa o XML
      const btnSelector = "a.btn.btn-primary[href*='xml']";
      await page.waitForSelector(btnSelector, { timeout: 10000 });
      await page.click(btnSelector);

      console.log(`✅ XML da chave ${chave} solicitado.`);

      // Espera 1s para o download iniciar
      await new Promise(resolve => setTimeout(resolve, 1000));

    } catch (err) {
      console.error(`❌ Erro na chave ${chave}:`, err.message);
    }
  }

  await browser.close();
  console.log("🎉 Processo concluído!");
})();
