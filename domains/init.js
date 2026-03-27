const MODULE_ID = "domain-art";
const SYSTEM_ID = "daggerheart";
const COMPENDIUM_ID = "daggerheart.domains";
const MAPPING_FILE = `modules/${MODULE_ID}/domains-mapping.json`;
const SETTING_KEY = "lastSystemVersion";

Hooks.once("ready", async function () {
  const currentSystemVersion = game.system.version;
  const lastSystemVersion = game.settings.get(MODULE_ID, SETTING_KEY) || null;

  // Se a versão não mudou, não faz nada
  if (lastSystemVersion === currentSystemVersion) {
    console.log(`Domain Art Override | Sistema ${SYSTEM_ID} na mesma versão (${currentSystemVersion}), nada a fazer.`);
    return;
  }

  console.log(`Domain Art Override | Detectada nova versão do sistema ${SYSTEM_ID}: ${lastSystemVersion || "nenhuma"} → ${currentSystemVersion}`);
  console.log(`Domain Art Override | Iniciando substituição de imagens...`);

  // Carrega o mapeamento
  let mapping;
  try {
    const response = await fetch(MAPPING_FILE);
    mapping = await response.json();
  } catch (err) {
    console.error(`Domain Art Override | Erro ao carregar ${MAPPING_FILE}`, err);
    return;
  }

  const pack = game.packs.get(COMPENDIUM_ID);
  if (!pack) {
    console.error(`Domain Art Override | Compendium ${COMPENDIUM_ID} não encontrado.`);
    return;
  }

  const wasLocked = pack.locked;
  if (wasLocked) {
    console.log("Domain Art Override | Desbloqueando compendium...");
    await pack.configure({ locked: false });
  }

  const items = await pack.getDocuments();
  let updatedCount = 0;

  for (const item of items) {
    const mapEntry = mapping[COMPENDIUM_ID]?.[item.id];
    if (mapEntry && mapEntry.domain && item.img !== mapEntry.domain) {
      await item.update({ img: mapEntry.domain });
      updatedCount++;
      console.log(`Domain Art Override | Atualizado: ${mapEntry.__DOCUMENT_NAME__} (${item.id})`);
    }
  }

  console.log(`Domain Art Override | Total de itens atualizados: ${updatedCount}`);

  if (wasLocked) {
    console.log("Domain Art Override | Bloqueando compendium novamente...");
    await pack.configure({ locked: true });
  }

  // Salva versão atual do sistema
  await game.settings.set(MODULE_ID, SETTING_KEY, currentSystemVersion);
  console.log(`Domain Art Override | Versão ${currentSystemVersion} registrada, script não rodará até o sistema ser atualizado.`);
});

// Registra a setting para salvar a última versão do sistema
Hooks.once("init", function () {
  game.settings.register(MODULE_ID, SETTING_KEY, {
    name: "Última versão processada do sistema",
    scope: "world",
    config: false,
    type: String,
    default: ""
  });
});