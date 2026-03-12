const MODULE_ID = 'the_void-br';

console.log(`${MODULE_ID} | Script carregado.`);

// Usamos o hook 'ready' para garantir que o sistema já carregou suas configurações
Hooks.on('ready', async () => {
    if (game.system.id !== 'daggerheart') return;

    // Apenas o mestre precisa rodar a lógica de registro
    if (game.user.isGM) {
        await registrarDominiosVoid();
    }
});

async function registrarDominiosVoid() {
    // Identifica qual a chave correta da configuração (o sistema às vezes muda entre maiúsculo/minúsculo)
    let chaveConfig = 'Homebrew';
    if (!game.settings.settings.has('daggerheart.Homebrew')) {
        chaveConfig = 'homebrew';
    }

    try {
        // Pega as configurações atuais de Homebrew do sistema
        const configHomebrew = game.settings.get('daggerheart', chaveConfig);
        
        // No sistema Daggerheart, 'domains' é um objeto onde cada chave é o ID do domínio
        let dominiosAtuais = configHomebrew.domains || {};
        let houveMudanca = false;

        // Definição dos seus domínios
        const meusDominios = {
            "sangue": {
                "id": "sangue",
                "label": "Sangue",
                "src": `modules/${MODULE_ID}/Imagens/Void/sangue-dom.webp`
            },
            "pavor": {
                "id": "pavor",
                "label": "Pavor",
                "src": `modules/${MODULE_ID}/Imagens/Void/pavor-dom.webp`
            }
        };

        // Verifica se cada domínio já existe. Se não existir, adiciona.
        for (let id in meusDominios) {
            if (!dominiosAtuais[id]) {
                dominiosAtuais[id] = meusDominios[id];
                houveMudanca = true;
                console.log(`${MODULE_ID} | Adicionando domínio: ${id}`);
            }
        }

        if (houveMudanca) {
            // Cria um novo objeto de configuração para salvar
            const novaConfig = {
                ...configHomebrew,
                domains: dominiosAtuais
            };

            // Salva no banco de dados do Foundry
            await game.settings.set('daggerheart', chaveConfig, novaConfig);
            
            ui.notifications.info("The Void: Novos domínios registrados! Recarregando para aplicar...");
            
            // Recarrega após 1.5 segundos para o sistema ler a nova configuração
            setTimeout(() => location.reload(), 1500);
        }

    } catch (err) {
        console.error(`${MODULE_ID} | Erro ao registrar domínios:`, err);
    }
}