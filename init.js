const MODULE_ID = "the_void-br";
const SYSTEM_ID = "daggerheart";
const MAPPING_FILE = `modules/${MODULE_ID}/domains-mapping.json`;
const SETTING_KEY = "lastSystemVersion";

Hooks.once("ready", async function () {
  const currentSystemVersion = game.system.version;
  const lastSystemVersion = game.settings.get(MODULE_ID, SETTING_KEY) || null;

  // Se a versão não mudou, não faz nada
  if (lastSystemVersion === currentSystemVersion) {
    console.log(`Art Override | Sistema ${SYSTEM_ID} na mesma versão (${currentSystemVersion}), nada a fazer.`);
    return;
  }

  console.log(`Art Override | Detectada nova versão do sistema ${SYSTEM_ID}: ${lastSystemVersion || "nenhuma"} → ${currentSystemVersion}`);
  console.log(`Art Override | Iniciando substituição de imagens...`);

  // Carrega o mapeamento único
  let mapping;
  try {
    const response = await fetch(MAPPING_FILE);
    mapping = await response.json();
  } catch (err) {
    console.error(`Art Override | Erro ao carregar ${MAPPING_FILE}`, err);
    return;
  }

let totalUpdatedCount = 0;

  // Loop dinâmico pelas chaves do JSON (cada chave é o ID de um Compendium)
  for (const [compendiumId, itemsMap] of Object.entries(mapping)) {
    const pack = game.packs.get(compendiumId);
    
    if (!pack) {
      console.warn(`Art Override | Compendium '${compendiumId}' não encontrado. Pulando...`);
      continue;
    }

    const wasLocked = pack.locked;
    if (wasLocked) {
      console.log(`Art Override | Desbloqueando compendium: ${compendiumId}`);
      await pack.configure({ locked: false });
    }

    const items = await pack.getDocuments();
    let packUpdatedCount = 0;

    for (const item of items) {
      const mapEntry = itemsMap[item.id];
      // Aceita tanto a chave "domain" quanto "img" no seu JSON para maior flexibilidade futura
      const imagePath = mapEntry?.domain || mapEntry?.img; 

      if (mapEntry && imagePath && item.img !== imagePath) {
        await item.update({ img: imagePath });
        packUpdatedCount++;
        console.log(`Art Override | Atualizado: ${mapEntry.__DOCUMENT_NAME__} (${item.id}) em ${compendiumId}`);
      }
    }

    totalUpdatedCount += packUpdatedCount;

    if (wasLocked) {
      console.log(`Art Override | Bloqueando compendium novamente: ${compendiumId}`);
      await pack.configure({ locked: true });
    }
  }

  console.log(`Art Override | Total geral de itens atualizados: ${totalUpdatedCount}`);

  // Salva versão atual do sistema
  await game.settings.set(MODULE_ID, SETTING_KEY, currentSystemVersion);
  console.log(`Art Override | Versão ${currentSystemVersion} registrada, script não rodará até o sistema ser atualizado.`);
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