const MODULE_ID = 'the_void-br';

console.log(`${MODULE_ID} | Module JS Loaded`);

Hooks.on('ready', async () => {
    // Garante que só execute se o sistema for Daggerheart
    if (game.system.id !== 'daggerheart') return;

    await registerVoidDomains();
});

async function registerVoidDomains() {
    // 1. Identificar a chave correta da configuração de Homebrew do sistema
    let settingKey = 'Homebrew';
    if (!game.settings.settings.has('daggerheart.Homebrew')) {
        settingKey = 'homebrew';
    }

    // 2. Tentar obter as configurações atuais
    let homebrewSettings;
    try {
        homebrewSettings = game.settings.get('daggerheart', settingKey);
    } catch (e) {
        console.warn(`${MODULE_ID} | Não foi possível encontrar a configuração de Homebrew do Daggerheart.`);
        return;
    }

    if (!homebrewSettings) return;

    // 3. Definir os dados dos novos domínios
    const domainData = {
        'blood': {
            id: 'sangue',
            label: 'Sangue',
            src: `../Imagens/Void/sangue-dom-6914b0d04de76.webp`            
        },
        'dread': {
            id: 'pavor',
            label: 'Pavor',
            src: `../Imagens/Void/pavor-dom-6914b0d04de76.webp`            
        }
    };

    // 4. Verificar se os domínios já existem para não duplicar
    let updates = false;
    const currentDomains = { ...(homebrewSettings.domains || {}) };

    for (const [key, data] of Object.entries(domainData)) {
        if (!currentDomains[key]) {
            console.log(`${MODULE_ID} | Registrando novo domínio: ${data.label}`);
            currentDomains[key] = data;
            updates = true;
        }
    }

    // 5. Salvar as alterações se algo novo foi adicionado
    if (updates) {
        try {
            const newSettings = {
                ...homebrewSettings,
                domains: currentDomains
            };

            await game.settings.set('daggerheart', settingKey, newSettings);
            ui.notifications.info(`${MODULE_ID} | Domínios Sangue e Pavor registrados com sucesso.`);
        } catch (err) {
            console.error(`${MODULE_ID} | Erro ao atualizar as configurações:`, err);
        }
    }
}
