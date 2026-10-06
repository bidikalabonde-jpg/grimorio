/**
 * Dados padrão e de exemplo para O Grimório do Mestre
 */
const DEFAULT_RPG_DATA = {
  activeCampaignId: "camp_1",
  settings: {
    stealthMode: false, // Ocultar notas confidenciais
    soundEnabled: true,
  },
  campaigns: [
    {
      id: "camp_1",
      name: "A Sombra do Trono Partido",
      system: "D&D 5e / Fantasia Medieval",
      setting: "Reino de Valoria",
      description: "Após a misteriosa morte do Rei Alden III, os quatro ducados de Valoria disputam a coroa enquanto uma antiga ordem de cultistas das profundezas sussurra nas sombras das catacumbas da capital.",
      createdAt: "2026-09-15",
      players: [
        { name: "Sir Bryan (Lucas)", character: "Paladino da Convicção (Nível 4)", notes: "Busca honrar a família caída" },
        { name: "Sylas (Marina)", character: "Ladina Arcana (Nível 4)", notes: "Possui uma dívida secreta com a Guilda dos Corvos" },
        { name: "Elowen (Gabriel)", character: "Druida do Círculo da Lua (Nível 4)", notes: "Protetora da Floresta dos Murmúrios" },
        { name: "Ignis (Pedro)", character: "Mago Evocador (Nível 4)", notes: "Carrega um tomo com páginas seladas a sangue" }
      ],
      sessions: [
        {
          id: "sess_1",
          number: 1,
          date: "2026-09-20",
          title: "O Javali Sangrento e o Mensageiro Morto",
          summary: "Os aventureiros se conheceram na Estalagem do Javali Sangrento em Pedralta. Um mensageiro real entrou em choque, ferido por flechas negras, entregando um selo de cera quebrado com o emblema do Duque Roderic antes de sucumbir.",
          xpAwarded: "350 XP cada",
          rewards: "50 PO, 1 Poção de Cura, Selo Real Misterioso",
          hooks: "Descobrir quem enviou os assassinos da estrada do norte."
        },
        {
          id: "sess_2",
          number: 2,
          date: "2026-09-27",
          title: "As Criptas de Cinzafunda",
          summary: "Seguindo os rastros dos emboscadores, o grupo adentrou a velha cripta sob o moinho abandonado. Enfrentaram esqueletos corrompidos e descobriram que os cultistas estão colhendo sangue de nobres.",
          xpAwarded: "450 XP cada",
          rewards: "Gema de Quartzo Sombrio (100 PO), Adaga Entalhada em Osso",
          hooks: "O símbolo encontrado na parede é o mesmo do medalhão que Sylas viu na infância."
        }
      ],
      secrets: [
        {
          id: "sec_1",
          title: "A Traição do Duque Roderic",
          content: "Roderic não quer apenas a coroa: ele fez um pacto com o Devorador de Éter. Foi ele quem envenenou o cálice do Rei na celebração do Solstício.",
          category: "Trama Principal",
          revealed: false
        },
        {
          id: "sec_2",
          title: "O Segredo de Sylas (Ladina)",
          content: "O medalhão de Sylas é na verdade a chave para o Tesouro Oculto da Primeira Dinastia, escondido sob a Catedral da Luz.",
          category: "Personagens",
          revealed: false
        },
        {
          id: "sec_3",
          title: "A Próxima Reviravolta da Sessão 3",
          content: "O capitão da guarda que contratou os aventureiros para investigar o moinho foi substituído por um Doppelganger há 3 dias.",
          category: "Reviravolta Iminente",
          revealed: false
        }
      ],
      npcs: [
        {
          id: "npc_1",
          name: "Lorde Roderic Valen",
          role: "Duque do Sul & Pretendente ao Trono",
          faction: "Casa Valen / Conspiradores",
          status: "Hostil Oculto",
          location: "Fortaleza de Espinhalta",
          appearance: "Homem de meia-idade, cabelos prateados, olhos de falcão, veste veludo carmesim e uma capa debruada de arminho.",
          personality: "Cortês e refinado em público, impiedoso e frio em privado. Nunca levanta a voz.",
          secret: "Fez pacto com forças das profundezas para salvar a vida de sua filha doente, mas agora é controlado por elas.",
          stats: "CA 17, PV 85, Ataque: Espada Longa Encantada (+7, 1d8+4 dano cortante + 2d6 necrótico)"
        },
        {
          id: "npc_2",
          name: "Mestre Corvo Elian",
          role: "Lojista de Artefatos & Informante",
          faction: "Independentes / Guilda das Sombras",
          status: "Neutro / Aliado de Ocasião",
          location: "Beco dos Frascos, Pedralta",
          appearance: "Gnomo ancião com óculos de múltiplas lentes de latão e dedos manchados de tinta azulada.",
          personality: "Adora charadas, fala rápido demais e só troca segredos valiosos por chás raros ou moedas antigas.",
          secret: "Mantém uma porta dimensional no armário dos fundos que conecta à biblioteca da Capital.",
          stats: "CA 13, PV 32, Truques: Ilusão Menor, Mãos Mágicas, Rajada Mística"
        },
        {
          id: "npc_3",
          name: "Capitã Valeria Ferros",
          role: "Comandante da Guarda Urbana",
          faction: "Leais à Coroa",
          status: "Aliada",
          location: "Quartel de Pedralta",
          appearance: "Mulher musculosa, armadura de placas desgastada por batalhas, cicatriz profunda no queixo.",
          personality: "Rígida, justa, odeia burocratas e nobres corruptos.",
          secret: "Desconfia que o regente esteja envolvido no assassinato do mensageiro real.",
          stats: "CA 18, PV 68, Ataque: Martelo de Guerra Duplo (+6, 1d10+3)"
        }
      ],
      items: [
        {
          id: "item_1",
          name: "Lâmina do Julgamento Solar",
          type: "Arma Marcial (Espada Longa)",
          rarity: "Lendário",
          attunement: true,
          value: "15.000 PO",
          description: "Forjada sob a luz de um eclipse pelos sacerdotes de Solis. A lâmina emana uma aura dourada suave que dissipa trevas mágicas e causa dano radiante extra contra mortos-vivos e corruptos.",
          properties: "+2 nas jogadas de ataque e dano; emite luz solar em raio de 6 metros sob comando; 1x ao dia conjura 'Coluna de Chamas'."
        },
        {
          id: "item_2",
          name: "Amuleto da Mente Selada",
          type: "Acessório / Amuleto",
          rarity: "Raro",
          attunement: true,
          value: "3.500 PO",
          description: "Uma pedra da lua lapidada engastada em prata fosca. Sussurros inaudíveis protegem os pensamentos do usuário.",
          properties: "O usuário é imune a magias que leiam seus pensamentos ou detectem mentiras a menos que deseje."
        },
        {
          id: "item_3",
          name: "Frasco de Névoa Espectral",
          type: "Consumível",
          rarity: "Incomum",
          attunement: false,
          value: "250 PO",
          description: "Ao quebrar o frasco no chão, uma espessa névoa de tom lilás cobre um raio de 9 metros, permitindo que aliados fiquem parcialmente translúcidos.",
          properties: "Cria escuridão branda e concede vantagem em testes de Furtividade por 1 minuto."
        }
      ],
      locations: [
        {
          id: "loc_1",
          name: "Vila de Pedralta",
          type: "Povoado / Hub Inicial",
          danger: "Baixo",
          description: "Vilarejo construído sobre as ruínas de uma antiga pedreira dos anões. Famoso por sua cerveja escura e feiras de outono.",
          pointsOfInterest: "Estalagem do Javali Sangrento, Templo do Amanhecer, Loja de Pergaminhos do Mestre Corvo, Pedreira Abandonada."
        },
        {
          id: "loc_2",
          name: "Criptas de Cinzafunda",
          type: "Masmorra / Ruínas",
          danger: "Médio-Alto",
          description: "Túmulos ancestrais dos primeiros lordes de Valoria, há muito selados após a peste da cinza. Agora tomados por cultistas das sombras.",
          pointsOfInterest: "Antecâmara dos Sarcófagos, Altar do Olho Sem Pálpebra, Cripta Lacrada com Chave Tripla."
        }
      ]
    }
  ]
};
