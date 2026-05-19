/**
 * John AI · i18n (pt-BR / en)
 * Persistência: localStorage "zira-lang"
 */
(function (global) {
  'use strict';

  var STORAGE_KEY = 'zira-lang';
  var DEFAULT_LANG = 'pt-BR';

  var STRINGS = {
    'pt-BR': {
      meta: {
        title: 'Cantevo · Plataforma para Escritórios de Arquitetura e Engenharia',
        description:
          'Cantevo · Organiza atendimento, equipe, obras e prazos para escritórios de arquitetura e engenharia. Operação clara no WhatsApp, desktop e obra.',
        ogTitle: 'Cantevo · Plataforma para Escritórios de Arquitetura e Engenharia',
        ogDescription:
          'Organiza atendimento, equipe, obras e prazos. Operação real no escritório, do WhatsApp à obra, com mais clareza e previsibilidade.',
        twitterTitle: 'Cantevo · Plataforma para Escritórios',
        twitterDescription:
          'Atendimento, equipe, obras e prazos organizados para escritórios de arquitetura e engenharia.',
      },
      nav: {
        brandAria: 'Cantevo · Página inicial',
        platform: 'Plataforma',
        flow: 'Fluxo',
        team: 'Equipe',
        blog: 'Blog',
        faq: 'FAQ',
        contact: 'Contato',
        cta: 'Agendar conversa',
        menuOpen: 'Abrir menu de navegação',
        menuClose: 'Fechar menu de navegação',
        langGroup: 'Idioma',
      },
      hero: {
        title:
          'A plataforma que organiza atendimento, equipe, obras e prazos para escritórios de arquitetura e engenharia.',
        scrollHint: 'Descer para a próxima seção',
        counterLabel: 'escritórios já evoluíram com a John AI',
        sr:
          'John AI, plataforma para arquitetura e engenharia. Mais de 100 escritórios já evoluíram para uma operação mais clara, integrada e previsível.',
        proof:
          'Escritórios que padronizam a operação reduzem retrabalho, aceleram resposta e ganham margem para crescer.',
      },
      zira: {
        desc1:
          'O John AI entende o que chega, interpreta o que o cliente tentou dizer e conecta essa solicitação ao contexto real do escritório. Ele sabe quando uma mensagem é um novo lead, quando é uma dúvida de obra, quando é cobrança, quando precisa virar tarefa e quando deve ser encaminhada para um responsável.',
        desc2:
          'Antes de sugerir uma resposta, ele consulta o que já existe no CANTEVO: cliente, obra, projeto, histórico, prazos, tarefas e responsáveis. Isso permite que o atendimento avance com clareza, sem depender de memória, improviso ou busca manual em conversas antigas.',
        imageAlt: 'Mascote John AI com capacete de obra',
      },
      problem: {
        title:
          'Seu problema não é falta de cliente. É falta de controle depois que o cliente entra.',
        caption:
          'Quando o processo depende de mensagem solta, memória e urgência do dia, o escritório apaga incêndio em vez de escalar com segurança.',
        outro:
          'Com operação orientada por fluxo, você sabe o que está travado, quem atua agora e qual etapa vem depois.',
        b1: 'WhatsApp desorganizado',
        b2: 'Tarefas perdidas',
        b3: 'Obras sem acompanhamento claro',
        b4: 'Cliente cobrando sem contexto',
        b5: 'Equipe sem prioridade definida',
        b6: 'Prazos estourando',
        b7: 'Informações espalhadas',
        imageAlt: 'Atendimento e tarefas no celular com John AI',
      },
      workflow: {
        title: 'Da primeira mensagem ao pós-obra: uma operação única, mensurável e sem ruído.',
        caption:
          'Um ciclo operacional que conecta captação, qualificação, priorização, follow-up, execução e acompanhamento da equipe no mesmo sistema.',
        kicker:
          'Setas mostram sequência entre etapas · curva conecta a última volta do atendimento à mesma entrada do fluxo.',
        flowAria:
          'Fluxo visual em duas linhas com setas e curvas ligando sete etapas do WhatsApp à operação reunida.',
        s1Title: 'Lead no WhatsApp',
        s1Body:
          'O primeiro contato acontece no canal em que o cliente já está, sem fricção e sem perder velocidade no atendimento.',
        s2Title: 'John AI organiza a demanda',
        s2Body:
          'Mesmo quando o cliente não consegue explicar direito o que quer, o John ajuda a estruturar a solicitação e transforma uma conversa solta em contexto útil para o time.',
        s3Title: 'Intenção clara, prioridade definida',
        s3Body:
          'O sistema identifica o que o lead quer, separa curiosos de oportunidades reais e ajuda o escritório a decidir o que merece atenção primeiro.',
        s4Title: 'Sugestões de resposta para atendimentos difíceis',
        s4Body:
          'Quando o cliente é confuso, exigente ou difícil de conduzir, o sistema ajuda o time com respostas mais claras, profissionais e estratégicas.',
        s5Title: 'Follow-up sem depender de memória',
        s5Body:
          'Se o contato demonstra interesse, responde e depois some, o fluxo não morre. O sistema ajuda a retomar no momento certo, sem deixar oportunidade esfriar.',
        s6Title: 'Projeto com etapas e alertas',
        s6Body:
          'Quando o atendimento avança, a operação já nasce organizada, com fases rastreáveis, checklists, agenda e alertas conectados ao mesmo fluxo.',
        s7Title: 'Equipe alinhada no mesmo lugar',
        s7Body:
          'Prazos, tarefas e histórico deixam de ficar espalhados. O time enxerga o que precisa acontecer agora e decide com mais clareza, menos ruído e menos retrabalho.',
        ziraMascotAlt: 'John AI',
      },
      tracking: {
        title:
          'Veja em tempo real quem está produzindo, o que está atrasado e onde sua operação está perdendo dinheiro.',
        caption:
          'Gestão de obra e gestão de equipe deixam de ficar separadas. Você acompanha responsáveis, gargalos e pendências sem planilhas paralelas.',
        p1: 'Tarefas por responsável',
        p2: 'Histórico de ações',
        p3: 'Pendências e atrasos',
        p4: 'Por arquiteto ou engenheiro',
        p5: 'Visão individual da equipe',
      },
      calendar: {
        title: 'Prazos, reuniões, retornos e etapas em uma única tela de decisão.',
        caption:
          'Quando o time inteiro enxerga o mesmo calendário operacional, os conflitos caem, os atrasos diminuem e as entregas ganham previsibilidade.',
        kicker: 'Prazos e etapas organizados em um único fluxo visual.',
        imageAlt: 'Prazos e etapas num único quadro',
      },
      faq: {
        title: 'Perguntas frequentes',
        caption:
          'Respostas objetivas sobre implantação, segurança, operação e retorno prático para o escritório.',
        q1: 'O John AI substitui o WhatsApp do escritório?',
        a1:
          'Não: o time continua no WhatsApp que o escritório já usa. O John organiza leads, prioridades e histórico por cima dessa mesma linha de atendimento, para ninguém depender de grupos soltos ou print.',
        q2: 'Funciona para obras já em andamento ou só para novos projetos?',
        a2:
          'Os dois cenários: atendimento de novos contatos e acompanhamento de obras que já estão na rua. O foco é dar visibilidade de etapa, pendência e responsável, independentemente de o cliente ter entrado ontem ou há meses.',
        q3: 'Quanto tempo leva para o time incorporar na rotina?',
        a3:
          'Escritórios enxutos costumem estabilizar fluxo e priorização em poucas semanas, com treinamento enxuto e ajuste de formulários aos seus tipos de obra. Grandes mudanças de processo combinamos em fases.',
        q4: 'Existe demonstração ou conversa técnica antes de contratar?',
        a4:
          'Sim. Agendamos uma conversa para mapear volume de leads, tamanho da equipe e como vocês fecham obra hoje e mostramos o produto no contexto do seu escritório, sem slides genéricos.',
        q5: 'Onde ficam armazenados dados e conversas?',
        a5:
          'Seguimos práticas de segurança e minimização de dado: apenas o necessário para operar atendimento e obra fica estruturado na plataforma. Detalhes de infraestrutura e contratos comentamos na proposta formal.',
        q6: 'Como é o suporte após a implantação?',
        a6:
          'Há canal dedicado para dúvidas de produto e ajustes operacionais, com SLA combinado conforme o plano. Novas integrações ou customizações de fluxo tratamos como projeto à parte quando fizer sentido.',
        q7: 'O sistema se adapta ao fluxo do meu escritório ou exige um modelo pronto?',
        a7:
          'O John é configurado à realidade do seu escritório: tipos de obra, etapas, responsáveis e prioridades alinhamos na implantação. Não existe um molde rígido único para todos: há um núcleo comum de atendimento e obra que mapeamos para como vocês já trabalham hoje.',
        q8:
          'O John atende só escritório de arquitetura, só de engenharia ou os dois juntos?',
        a8:
          'Os três casos: escritório focado em arquitetura, focado em engenharia ou com as duas frentes no mesmo time. A plataforma organiza atendimento e obra do jeito que você opera hoje, sem obrigar um modelo único.',
      },
      trustStats: {
        ariaLabel: 'Indicadores de confiança',
        clientsLabel: 'clientes satisfeitos',
        ratingLabel: 'avaliações positivas',
      },
      register: {
        title:
          'Agende uma demonstração para entender o que a ferramenta tem a oferecer.',
        stepsAria: 'Como funciona',
        step1Tag: 'Passo 1',
        step2Tag: 'Passo 2',
        step1Title: 'Complete o formulário',
        step1Desc:
          'Forneça suas informações de contato. Garantimos a segurança total de seus dados. Serão usados apenas para contato.',
        step2Title: 'Receba uma ligação personalizada',
        step2Desc:
          'Em um prazo de até 8 horas, um dos nossos especialistas entrará em contato diretamente para agendar a reunião mais crucial com você.',
        errSend:
          'Não foi possível enviar agora. Verifique os campos e tente de novo.',
        labelName: 'Nome',
        labelEmail: 'Email',
        labelPhone: 'Telefone',
        labelCompany: 'Nome da Empresa',
        phName: 'Seu nome',
        phEmail: 'Seu melhor e-mail',
        phPhone: 'Telefone',
        phCompany: 'Nome da empresa',
        countryAria: 'Selecionar país e DDI',
        countryBR: 'Brasil (+55)',
        countryUS: 'Estados Unidos (+1)',
        countryAR: 'Argentina (+54)',
        countryCL: 'Chile (+56)',
        countryCO: 'Colômbia (+57)',
        countryES: 'Espanha (+34)',
        countryPT: 'Portugal (+351)',
        countryUK: 'Reino Unido (+44)',
        countryDE: 'Alemanha (+49)',
        countryFR: 'França (+33)',
        segmentLabel: 'Selecionar segmento',
        segmentPh: 'Qual o seu segmento?',
        segmentEng: 'Engenharia',
        segmentArch: 'Arquitetura',
        segmentDesign: 'Design',
        segmentBoth: 'Engenharia / Arquitetura',
        revenueLabel: 'Selecionar faturamento',
        revenuePh: 'Faturamento mensal',
        rev1: 'Até R$ 50 mil/mês',
        rev2: 'R$ 50 mil – R$ 100 mil/mês',
        rev3: 'R$ 100 mil – R$ 250 mil/mês',
        rev4: 'R$ 250 mil – R$ 500 mil/mês',
        rev5: 'R$ 500 mil – R$ 1 milhão/mês',
        rev6: 'R$ 1 milhão – R$ 3 milhões/mês',
        rev7: 'Acima de R$ 3 milhões/mês',
        rev8: 'Prefiro não informar',
        submit: 'Receber mais informações',
        sending: 'Enviando…',
        toastAria: 'Cadastro enviado com sucesso',
        toastTitle: 'Cadastro enviado!',
        toastDesc:
          'Em até 8 horas um especialista do nosso time entra em contato.',
        toastClose: 'Fechar',
      },
      blogSection: {
        title: 'Conteúdo para quem lidera operação e quer escala com controle',
        caption:
          'Guias práticos para reduzir retrabalho, profissionalizar atendimento e ganhar performance no dia a dia.',
        link: 'Ver blog completo',
        c1topic: 'Operação',
        c1title:
          'Como reduzir retrabalho quando o WhatsApp é o “sistema” do escritório',
        c1excerpt:
          'Checklist prático para priorizar o que entra no inbox sem perder o fio da meada em obra.',
        c1read: 'Ler artigo',
        c2topic: 'Equipe',
        c2title:
          'Gestão à vista: o que monitorar antes do atraso virar drama com o cliente',
        c2excerpt:
          'Indicadores simples para arquiteto e engenheiro saberem quem segura cada frente.',
        c3topic: 'Cliente',
        c3title:
          'Da primeira mensagem à entrega: alinhar expectativa sem prometer milagre',
        c3excerpt:
          'Como manter transparência na jornada do lead sem sobrecarregar o time técnico.',
      },
      adapt: {
        title: 'Seu escritório é único. O fluxo da plataforma se adapta ao seu método.',
        logoAlt: 'John AI',
      },
      cta: {
        title:
          'Ganhe eficiência operacional sem trocar o que já funciona no seu escritório.',
        desc:
          'Na demonstração, mapeamos gargalos reais da sua rotina e mostramos como a Cantevo organiza atendimento, equipe e obra para você crescer com previsibilidade.',
        btn: 'Agendar conversa',
      },
      footer: {
        navAria: 'Links do rodapé',
        contentAria: 'Conteúdo do rodapé',
        opsAria: 'Operação do rodapé',
        brand: 'Cantevo',
        desc:
          'Plataforma para escritórios de arquitetura e engenharia com operação conectada do WhatsApp ao acompanhamento de equipe, obra e prazos.',
        colPlatform: 'Plataforma',
        colContent: 'Conteúdo',
        colOps: 'Operação',
        home: 'Início',
        platform: 'Plataforma',
        flow: 'Fluxo',
        team: 'Equipe',
        blog: 'Blog',
        allArticles: 'Todos os artigos',
        faq: 'FAQ',
        contact: 'Contato',
        wa: 'Atendimento no WhatsApp',
        schedule: 'Agendar conversa',
        adminLeads: 'Painel · leads',
        copy: '© 2026 Cantevo · John AI. Todos os direitos reservados.',
        privacy: 'Privacidade e dados',
        terms: 'Termos comerciais',
      },
      wa: {
        aria: 'Atendimento John AI no WhatsApp',
        message:
          'Olá! Gostaria de falar sobre o John AI.',
      },
      schedule: {
        title: 'Agendar conversa',
        subtitle:
          'Informe nome, e-mail e telefone. Enviaremos uma confirmação e entraremos em contato por esses dados. Empresa opcional.',
        labelName: 'Nome completo',
        labelEmail: 'E-mail',
        labelPhone: 'Telefone (com DDD)',
        labelCompany: 'Empresa ou escritório',
        companyOptional: 'opcional',
        btnSubmit: 'Enviar dados',
        btnCancel: 'Cancelar',
        errRequired: 'Preencha este campo.',
        errEmail: 'Informe um e-mail válido.',
        errPhone: 'Informe um telefone com ao menos 8 dígitos.',
        errSubmit: 'Não foi possível registrar agora. Tente de novo.',
        submitting: 'Enviando…',
        successTitle: 'Recebemos tudo!',
        successSubtitle:
          'Em breve entraremos em contato pelo e-mail ou telefone que você informou.',
        btnDone: 'Fechar',
        intro: 'Olá! Gostaria de agendar uma conversa sobre o John AI.',
        lineName: 'Nome',
        lineEmail: 'E-mail',
        linePhone: 'Telefone',
        lineCompany: 'Empresa',
        ariaCloseOverlay: 'Fechar',
      },
      schema: {
        organizationName: 'Cantevo',
        softwareDesc:
          'Plataforma que organiza atendimento, equipe, obras e prazos para escritórios de arquitetura e engenharia, com atendimento integrado via WhatsApp.',
      },
      blogPage: {
        metaTitle:
          'Blog Cantevo · John AI · Gestão de escritório, obra, BIM, KPIs e compliance',
        metaDesc:
          'Mais de 10 guias sobre operação para escritórios de arquitetura e engenharia: atendimento, equipe, obra, cronograma, BIM, RFIs, fornecedores, KPIs, LGPD e NR-18. Conteúdo para SEO e operação previsível.',
        ogTitle:
          'Blog Cantevo · John AI · Operação em escritório e obra',
        ogDesc:
          'Arquivo de artigos: retrabalho, gestão à vista, jornada do cliente, priorização, LGPD, cronograma, RFIs, obra e indicadores.',
        twitterTitle:
          'Blog Cantevo · Arquitetura, engenharia e obra',
        twitterDesc:
          'Guias práticos para gestão de escritório, canteiro, compliance e performance por projeto.',
        navBrandAria: 'Cantevo · página inicial',
        navBack: '← Voltar ao site',
        heroTitle: 'Blog',
        heroSubtitleBefore:
          'Tudo sobre operação para escritórios de arquitetura e engenharia com a ',
        heroSubtitleBrand: 'Cantevo · John AI',
        heroLead:
          'Guias práticos sobre gestão de escritório, obra, atendimento, equipe e compliance — conteúdo pensado para SEO e para quem precisa de operação previsível, com ou sem WhatsApp no centro.',
        searchLabel: 'Buscar artigos',
        searchPlaceholder: 'Ex.: WhatsApp, obra, LGPD, cronograma…',
        searchHint: 'Filtre por tema ou palavra-chave.',
        readMore: 'Leia mais »',
        noResults: 'Nenhum artigo encontrado. Tente outras palavras.',
        archiveHeading: 'Artigos em destaque',
        archiveEyebrow: 'Arquivo',
        countIdle: '{n} artigos · use a busca para filtrar',
        countFiltered: '{n} de {total} artigos com esta busca',
        skipLink: 'Ir para o conteúdo',
        breadcrumbAria: 'Você está aqui',
        breadcrumbHome: 'Início',
        tocFaq: 'Dúvidas frequentes',
        tocGuides: 'Guias completos',
        faqTitle: 'Dúvidas frequentes',
        faqLead:
          'Respostas diretas sobre o propósito deste blog, público-alvo e como combinar leitura com uma demonstração do John AI.',
        faq1q: 'Este blog substitui uma conversa com o time comercial?',
        faq1a:
          'Não. Os artigos ajudam em conceitos e boas práticas; para ver o John AI no contexto do seu escritório, agende uma demonstração pelo site principal.',
        faq2q: 'O conteúdo é só para quem usa WhatsApp?',
        faq2a:
          'Não. Há temas de obra, priorização, BIM, KPIs e compliance. O WhatsApp aparece quando é canal real em muitos escritórios brasileiros.',
        faq3q: 'Serve para escritório só de arquitetura ou só de engenharia?',
        faq3a:
          'Para os dois e para quem reúne as duas frentes. Os guias citam situações típicas de cada perfil.',
        faq4q: 'Dá para aplicar as práticas sem comprar software?',
        faq4a:
          'Em parte, sim: processo e disciplina vêm primeiro. Plataforma ajuda quando volume, equipe ou risco exigem histórico e prioridade centralizados.',
        faq5q: 'Como sugerir tema para um novo artigo?',
        faq5a:
          'Entre em contato pelo WhatsApp ou formulário do site. Temas reais de operação viram prioridade editorial.',
        faq6q: 'Com que frequência o blog é atualizado?',
        faq6a:
          'Buscamos revisar e ampliar conteúdo de forma contínua; artigos podem ganhar novos trechos quando mercado ou regulamentação mudam.',
        guidesTitle: 'Guias completos',
        guidesLead:
          'Leitura linear dos artigos abaixo — ideal para aprofundar depois de filtrar o arquivo acima.',
        card1excerpt:
          'Entrada fechada por fase, checklists e histórico acessível para parar de reabrir o mesmo assunto dez vezes.',
        card2excerpt:
          'Responsável, próximo passo e entregas visíveis mudam o tom da cobrança antes do calendário estourar.',
        card3excerpt:
          'Cadência e transparência do primeiro contato à obra, sem silêncio que destrói confiança.',
        card4excerpt:
          'Critérios por tipo de obra e filas com dono único até o próximo estado.',
        card5excerpt:
          'Minimização de dados, política interna e consentimento documentado quando projeto circula no chat.',
        card6excerpt:
          'Uma linha do tempo que o cliente entende e que o time sustenta entre modelo e realidade de campo.',
        card7excerpt:
          'Perguntas formais e pacotes de aprovação com rastro: menos decisão implícita no grupo.',
        card8excerpt:
          'Combinar deep work, coordenação síncrona e inspeções sem perder contexto entre salas.',
        card9excerpt:
          'Canal oficial, ata curta e responsável por frente evitam “achismo” que custa caro na execução.',
        card10excerpt:
          'O que medir por obra para o sócio enxergar saúde antes do fechamento contábil.',
        card11excerpt:
          'Registros mínimos, versão única e acesso rápido quando auditoria ou incidente aparece.',
        post1meta: 'Operação · 8 min',
        post1h2:
          'Como reduzir retrabalho quando o WhatsApp é o “sistema” do escritório',
        post1p1:
          'Quando o inbox vira backlog sem dono, a equipe técnica reabre o mesmo arquivo três vezes porque ninguém sabe qual era a última decisão válida. O primeiro passo não é ferramenta nova por si só: é definir o que conta como “entrada fechada” em cada tipo de obra e quem fecha.',
        post1p2:
          'Listas rápidas de verificação por fase (projeto, compatibilização, canteiro) reduzem ida e volta de WhatsApp que não adiciona informação. O John encaixa nessa lógica ao manter histórico e prioridade visíveis para quem executa, sem depender de print em grupo.',
        post2meta: 'Equipe · 6 min',
        post2h2:
          'Gestão à vista: o que monitorar antes do atraso virar drama com o cliente',
        post2p1:
          'Cliente cobra quando percebe vazio de informação, não quando a etapa atrasou um dia. Mostrar responsável atual, próximo compromisso e o que já foi entregue muda completamente o tom da cobrança, mesmo que o calendário ainda esteja apertado.',
        post2p2:
          'Um painel simples por pessoa ou por obra evita aquela sensação de urgência artificial em tudo ao mesmo tempo. Você distribui tensão onde ela faz diferença, em vez de apagar incêndio em fila cronológica maluca.',
        post3meta: 'Cliente · 7 min',
        post3h2:
          'Da primeira mensagem à entrega: alinhar expectativa sem prometer milagre',
        post3p1:
          'O lead quer velocidade e o time quer precisão. Narrar etapas de forma objetiva (“o que já foi decidido”, “o que falta pra fechar o pacote atual”) atravessa períodos lentos sem destruir confiança. Silêncio pesa mais que uma data honesta bem explicada.',
        post3p2:
          'Fluxos bem desenhados deixam o cliente enxergar o caminho do primeiro “oi” até a obra em execução, sem depender que alguém lembre de atualizar grupo à mão todas as tardes.',
        post1p3:
          'Em escritórios médios e grandes, o custo real do retrabalho não é só hora técnica: é prazo perdido com fornecedor, revisão em cima da hora e estresse nas relações com o cliente e com o canteiro. Registrar decisão única por canal evita aquele pingue-pongue de “acho que combinamos outra coisa”.',
        post1p4:
          'Se o WhatsApp é o sistema, o mínimo viável para SEO operacional é: um dono por conversa até fechar escopo; histórico pesquisável; e prioridade explícita. Ferramentas como o John sustentam isso ao ligar inbox a etapa da obra sem exigir que o time mude de canal da noite para o dia.',
        post2p3:
          'Indicadores leves já ajudam: fila média por responsável, obra com mais dias sem atualização oficial e SLA interno só para retrorno ao cliente, não para todas as mensagens internas.',
        post2p4:
          'Quando existe painel único ligado ao fluxo que o time já usa, o gestor deixa de ser “filtro humano” e passa a atuar só onde há exceção. Isso é exatamente o tipo de ganho que buscamos ao falar em gestão de obra integrada ao atendimento no escritório.',
        post3p3:
          'Normalize uma cadência simples — por exemplo segunda e quinta para obras críticas, semanalmente para cobrança de pagamento quando aplicável — e comunique esse ritmo ao cliente cedo.',
        post3p4:
          'O Google e clientes avaliam bem páginas e processos onde o escritório parece estar no comando da informação; em SEO de reputação aplicado à obra, consistência conta tanto quanto velocidade pontual.',
        post4meta: 'Priorização · 7 min',
        post4h2:
          'Caixa de entrada sem dono: como priorizar o que entra antes de virar problema em obra',
        post4p1:
          'Nem todo lead é igual e nem toda urgência gritada no grupo é importante. Um critério claro por tipo de obra — reforma rápida, novo empreendimento, corporativo — evita que a equipe viva em modo “turbo” eterno.',
        post4p2:
          'Listas Kanban ou filas nomeadas já melhoram, desde que cada card tenha dono único até o próximo estado. Mensagens perdidas são sintoma quase sempre de backlog sem ordenação.',
        post4p3:
          'Ao integrar atendimento a etapas reais da obra — da proposta à visita técnica — você reduz a sensação caótica tanto para dentro quanto para fora do escritório, o que impacta marca e até buscas relacionadas ao nome do estúdio quando clientes recomendam o processo, não só o portfólio.',
        post4p4:
          'Por fim: medir retrabalho por tipo de projeto mostra onde investir playbook ou modelo de briefing, em vez de “processo genérico” que não pega bem em projeto de alta complexidade.',
        post5meta: 'Compliance · 6 min',
        post5h2:
          'LGPD na prática para escritório de arquitetura: cliente, obra e uso de ferramentas de mensagens',
        post5p1:
          'Tratar WhatsApp apenas como canal informal aumenta risco quando há dados cadastrais, plantas e valores em circulação. Políticas internas devem definir onde cada tipo de dado pode ficar e por quanto tempo.',
        post5p2:
          'Consentimento pode ser combinado verbalmente mas precisa estar documentado no contrato e na coleta inicial: finalidade dos dados e contato oficial do responsável tratam bem a maior parte das dúvidas do cliente final.',
        post5p3:
          'Sistemas que minimizam cópias soltas ou prints em grupo ajudam a auditar quando necessário, sem transformar cada conversa num processo burocrático.',
        post5p4:
          'Um blog com página única bem estruturada (títulos, meta descrições e FAQs internas aos artigos) soma texto relevante sobre temas que clientes pesquisam: gestão em obra de arquitetura, ferramentas de equipe para engenharia, operação multidisciplinar no Brasil.',
        post6meta: 'Planejamento · 9 min',
        post6h2:
          'Cronograma integrado: alinhar projeto, BIM e canteiro sem perder o cliente',
        post6p1:
          'Cliente de obra não compra modelo 3D: compra previsibilidade. Quando o cronograma do escritório vive só no Gantt interno e o canteiro opera por “combinado no rádio”, nascem duas narrativas conflitantes sobre o mesmo projeto. O caminho é publicar uma linha do tempo que traduz BIM e etapas técnicas em linguagem de marco — com dono e data de corte explícitos.',
        post6p2:
          'Integrar BIM ao planejamento não é adicionar mais software; é definir o que muda status (emissão de pacote, aprovação de loja, liberação de compra) e quem valida. Assim, clash e revisão deixam de ser “surpresa” e passam a ser eventos esperados com folga orçada.',
        post6p3:
          'No canteiro, fotos e atas curtas amarradas ao mesmo ID de obra reduzem discussão sobre “qual versão vale”. Para SEO e autoridade, páginas que explicam como o escritório amarra modelo, compra e execução aparecem em buscas de gestão de obra integrada, cronograma 4D/5D e coordenação multidisciplinar.',
        post6p4:
          'Ferramentas como o John ajudam quando o marco visível ao cliente e a fila interna compartilham a mesma prioridade: menos retrabalho entre projeto e obra, mais clareza sobre o que está bloqueado hoje.',
        post7meta: 'Engenharia · 8 min',
        post7h2:
          'RFIs e submittals: reduzir retrabalho entre projeto, fornecedor e obra',
        post7p1:
          'RFI mal escrito vira conversa infinita; submittal sem checklist vira ida e volta de semanas. Escritórios de engenharia e arquitetura que escalam tratam esses artefatos como contrato operacional: número, impacto no cronograma, responsável pela resposta e prazo máximo.',
        post7p2:
          'Centralizar RFIs evita que a mesma dúvida apareça no WhatsApp, no e-mail e na reunião sem registro. Submittals ganham valor quando há trilha: envio, revisão, aprovação condicionada e distribuição ao canteiro com versão única.',
        post7p3:
          'Do ponto de vista de SEO, conteúdo que ensina fluxo de RFIs em obra, aprovação de materiais e compatibilização reforça buscas de quem procura disciplina em projeto executivo e redução de custo de mudança tardia.',
        post7p4:
          'Quando o inbox conversacional está ligado ao protocolo formal, menos decisão fica implícita — e menos retrabalho aparece na última semana antes da concretagem ou da entrega de vedação.',
        post8meta: 'Equipe · 7 min',
        post8h2:
          'Escritório híbrido: ritmo de entrega com time remoto e visitas de obra',
        post8p1:
          'Arquitetura e engenharia misturam trabalho profundo (cálculo, detalhamento) com interrupções úteis (obra, cliente). Em modelo híbrido, o problema não é localização — é perda de contexto entre quem está no escritório e quem está em campo.',
        post8p2:
          'Combinar janelas síncronas curtas com registro assíncrono de decisão mantém ritmo. Visitas de obra devem gerar checklist mínimo: o que foi visto, o que mudou, próximo passo e dono — senão o conhecimento morre na viagem de volta.',
        post8p3:
          'Para SEO, artigos sobre produtividade em escritório de projeto, colaboração remota em BIM e segurança de informação em times distribuídos captam buscadores de gestores que reformularam política de trabalho após 2020.',
        post8p4:
          'Uma plataforma que mostra fila por pessoa e por obra reduz a sensação de “ninguém sabe o que o outro fez”, típica de times híbridos mal instrumentados.',
        post9meta: 'Obra · 8 min',
        post9h2:
          'Comunicação com empreiteiros: decisão registrada e menos ruído no canteiro',
        post9p1:
          'Canteiro eficiente não é canteiro silencioso: é canteiro com canal certo para o tipo de decisão. Misturar pedido de compra, discussão de método construtivo e reclamação de vizinho no mesmo grupo gera ruído e apaga responsabilidade.',
        post9p2:
          'Defina onde nasce compromisso: ata de reunião curta, e-mail com cópia ao gestor ou ticket com SLA. O empreiteiro precisa saber qual canal “vale” para mudança de escopo — caso contrário, tudo vira urgência aparente.',
        post9p3:
          'Em termos de conteúdo para Google, textos sobre gestão de subempreiteiros, comunicação em obra e registro de ordem de serviço atraem buscas comerciais de construtoras e escritórios que terceirizam execução.',
        post9p4:
          'Histórico pesquisável e prioridade explícita — inclusive quando parte do fluxo passa por mensagens — impedem que a mesma divergência seja negociada três vezes com três níveis de preço diferentes.',
        post10meta: 'Gestão · 9 min',
        post10h2:
          'KPIs por projeto: margem, horas técnicas e prazo na mesma leitura',
        post10p1:
          'Escritório de arquitetura e engenharia muitas vezes só descobre que o projeto “não fechou” no fechamento contábil. KPIs operacionais por obra — horas consumidas vs. orçamento, receita reconhecida, desvio de escopo — antecipam conversa difícil com o cliente.',
        post10p2:
          'Margem por projeto exige custeio de horas real, não só rateio mensal. Prazo e fila de trabalho impactam capital de giro: atraso costuma vir com horas extras não faturadas e replanejamento de equipe.',
        post10p3:
          'Do ponto de vista de SEO B2B, páginas que explicam indicadores para escritório de projeto, precificação de honorários e controle de escopo reforçam autoridade em buscas de sócios e CFOs de firmas de AE.',
        post10p4:
          'Quando atendimento e execução compartilham visibilidade de carga, fica mais fácil dizer “não” a pedidos fora de contrato sem parecer desorganizado.',
        post11meta: 'Compliance · 8 min',
        post11h2:
          'NR-18 e documentação de obra: rastreabilidade que protege escritório e canteiro',
        post11p1:
          'NR-18 e boas práticas de segurança exigem prova de orientação, treinamento e medidas adotadas. Documento solto em pasta pessoal ou print perdido no celular não escala quando há fiscalização ou incidente.',
        post11p2:
          'Versão única do PPCI, ART correlata e ordens de serviço devem estar acessíveis ao responsável de campo. Rastreabilidade é saber quem recebeu qual versão e quando — não é burocracia extra, é redução de risco jurídico e operacional.',
        post11p3:
          'Artigos sobre documentação de canteiro, integração entre escritório técnico e segurança do trabalho melhoram SEO para buscas de compliance em obra, auditoria e gestão de riscos em construção.',
        post11p4:
          'Integrar comunicação de campo a repositório estruturado evita que informação crítica fique apenas em mensagens efêmeras — sem matar a agilidade do canteiro.',
        footerCr: '© Cantevo',
        footerSite: 'Site principal',
        tocTitle: 'Nesta página',
        tocAriaLabel: 'Artigos nesta página',
        toc1: 'Retrabalho e WhatsApp como “sistema”',
        toc2: 'Gestão à vista antes do drama com o cliente',
        toc3: 'Jornada do lead até a obra',
        toc4: 'Priorização da caixa de entrada',
        toc5: 'LGPD para escritório e mensagens',
        toc6: 'Cronograma, BIM e canteiro',
        toc7: 'RFIs e submittals',
        toc8: 'Escritório híbrido',
        toc9: 'Fornecedores e obra',
        toc10: 'KPIs por projeto',
        toc11: 'NR e documentação',
      },
      adminPage: {
        metaTitle: 'Painel · Leads · Cantevo',
        metaDesc:
          'Visualize solicitações de contato enviadas pela landing John AI. Acesso restrito.',
        ogTitle: 'Painel · Leads · Cantevo',
        ogDesc: 'Solicitações de agendamento e dados de contato.',
        twitterTitle: 'Painel · Leads · Cantevo',
        twitterDesc: 'Solicitações de contato · Cantevo.',
        brand: 'Cantevo',
        pageTitle: 'Leads',
        pageSubtitle: 'Agendamentos pela landing',
        statTotal: 'Total',
        statToday: 'Hoje',
        statWeek: '7 dias',
        searchPlaceholder: 'Buscar por nome, e-mail ou telefone…',
        emptyTitle: 'Nenhum lead ainda',
        emptyDesc: 'Quando alguém enviar o formulário «Agendar conversa», aparece aqui.',
        colDate: 'Data',
        colName: 'Nome',
        colEmail: 'E-mail',
        colPhone: 'Telefone',
        colCompany: 'Empresa',
        colSegment: 'Segmento',
        colRevenue: 'Faturamento',
        colLang: 'Idioma',
        exportCsv: 'Exportar CSV',
        refresh: 'Atualizar',
        logout: 'Sair',
        loginTitle: 'Acesso ao painel',
        loginHint: 'Use as credenciais cadastradas no servidor (variáveis ADMIN_USERNAME e ADMIN_PASSWORD).',
        loginUser: 'Usuário',
        loginPass: 'Senha',
        loginSubmit: 'Entrar',
        loginSubmitting: 'Entrando…',
        loginRequired: 'Preencha usuário e senha.',
        loginInvalid: 'Usuário ou senha inválidos.',
        loginNotConfigured: 'Defina ADMIN_USERNAME e ADMIN_PASSWORD nas variáveis de ambiente da Vercel.',
        loginRate: 'Muitas tentativas — aguarde um pouco.',
        loginNet: 'Sem resposta do servidor. Tente novamente.',
        securityWarn:
          'Configure ADMIN_USERNAME, ADMIN_PASSWORD e SESSION_SECRET nas variáveis da Vercel.',
        unauthorized: 'Faça login para ver os dados.',
        chartTitle: 'Leads nos últimos 7 dias',
        chartSub: 'Volume por dia (meia-noite a meia-noite, fuso local)',
        chartAria: 'Gráfico de barras com o número de leads por dia na última semana.',
        waSectionAria: 'Conexão WhatsApp via Evolution API',
        waEvoTitle: 'Evolution API · WhatsApp',
        waBadgeConnected: 'conectado',
        waBadgeAwait: 'aguardando ligação',
        waHintOpen:
          'WhatsApp ligado via Evolution API. Novos leads disparam notificação para este número.',
        waHintQr:
          'Use o código de 8 dígitos no WhatsApp (Aparelhos conectados → Ligar com número) ou escaneie o QR.',
        waConnectedTitle: 'WhatsApp conectado',
        waConnectedSub:
          'O código de pareamento fica oculto enquanto a sessão Evolution estiver ativa.',
        waPairingTitle: 'Código Evolution (8 dígitos)',
        waQrCaption: 'Ou escaneie o QR',
        waCopy: 'Copiar código',
        waCopied: 'Copiado',
      },
    },
    en: {
      meta: {
        title: 'Cantevo · Platform for Architecture & Engineering Firms',
        description:
          'Cantevo · Client intake, staffing, projects, and deadlines aligned for architecture & engineering firms: from WhatsApp to the field.',
        ogTitle: 'Cantevo · Platform for Architecture & Engineering Firms',
        ogDescription:
          'Aligns intake, team, projects, and timelines. Real world firm operations from WhatsApp to the site, with clarity and predictability.',
        twitterTitle: 'Cantevo · Firm Operations Platform',
        twitterDescription:
          'Aligned intake, staffing, jobs, and deadlines for architecture & engineering studios.',
      },
      nav: {
        brandAria: 'Cantevo · Home',
        platform: 'Platform',
        flow: 'Workflow',
        team: 'Team',
        blog: 'Blog',
        faq: 'FAQ',
        contact: 'Contact',
        cta: 'Book a call',
        menuOpen: 'Open navigation menu',
        menuClose: 'Close navigation menu',
        langGroup: 'Language',
      },
      hero: {
        title:
          'The platform that organizes intake, team, projects, and deadlines for architecture and engineering firms.',
        scrollHint: 'Scroll to the next section',
        counterLabel: 'firms have moved to clearer operations with John AI',
        sr:
          'John AI, operations for architecture & engineering. Over 100 firms have moved to clearer, integrated, more predictable work.',
        proof:
          'Over 100 firms have moved to clearer, integrated, more predictable operations.',
      },
      zira: {
        desc1:
          'John AI understands what comes in, interprets what the client meant, and connects each request to your firm’s real context. It knows when a message is a new lead, a site question, a follow-up, something that must become a task, or something that should go to the right owner.',
        desc2:
          'Before suggesting a reply, it checks what already exists in CANTEVO: client, project, site, history, deadlines, tasks, and owners. That keeps service moving with clarity—without relying on memory, guesswork, or digging through old chats.',
        imageAlt: 'Mascote John AI com capacete de obra',
      },
      problem: {
        title:
          'Your problem is not lack of clients. It is lack of control once the client is in.',
        caption:
          'When everything runs on loose messages, memory, and improvised urgency, you lose context; the team reacts instead of steering, and execution stops being predictable.',
        outro:
          'Less operational noise. Clearer view of what must happen, who must act, and what is still pending.',
        b1: 'Disorganized WhatsApp',
        b2: 'Dropped tasks',
        b3: 'Sites without clear oversight',
        b4: 'Clients chasing without context',
        b5: 'Teams with no enforced priorities',
        b6: 'Deadlines slipping',
        b7: 'Information scattered everywhere',
        imageAlt: 'Mobilized inquiries and tasks inside John AI',
      },
      workflow: {
        title: 'From first touch to handover: one connected thread.',
        caption:
          'Seven loops tie together WhatsApp-led intake · structured briefing · sharp prioritisation · scripted moments for tough callers · revived follow-ups · staged delivery with alerting · and crews sharing one truth surface.',
        kicker:
          'Straight arrows cue sequence · the curved braid joins the lower band to the intake row · dashed trace hints at iterating the motion.',
        flowAria:
          'Two-row cycle diagram tying seven checkpoints from inbound WhatsApp to aligned delivery.',
        s1Title: 'Lead enters WhatsApp',
        s1Body:
          'The first handshake happens wherever the buyer already communicates, frictionless and fast-paced.',
        s2Title: 'John AI organizes the demand',
        s2Body:
          'Even when language is fuzzy John AI reshapes chatter into workable scope so one loose thread converts into actionable context.',
        s3Title: 'Clear intent · explicit priority',
        s3Body:
          'Engines separate browsers from earnest jobs and elevate what deserves urgency right now.',
        s4Title: 'Suggested replies for tough conversations',
        s4Body:
          'When moods spike or ambiguity reigns drafted responses keep replies calm, articulate, strategic.',
        s5Title: 'Follow-ups powered by cues, not memory',
        s5Body:
          'If interest fades the pipeline still tracks it nudging reconnection when timing feels right.',
        s6Title: 'Project pacing with checkpoints + alerts',
        s6Body:
          'As momentum compounds work graduates into phased programs checkpoints calendars and alerts tethered inside one roadmap.',
        s7Title: 'Team alignment in one view',
        s7Body:
          'Threads deadlines history unify so everyone reads the same board less noise less rework chasing context.',
        ziraMascotAlt: 'John AI',
      },
      tracking: {
        title:
          'See what each architect, engineer, and teammate is handling, what slipped, and what needs attention now.',
        caption:
          'Project and people management stop living in silos. Everyone sees ownership, ongoing work, and bottlenecks without shadow spreadsheets or a fragmented picture of ops.',
        p1: 'Tasks by owner',
        p2: 'Action history',
        p3: 'Outstanding items & delays',
        p4: 'Architect vs engineer lanes',
        p5: 'Individual team views',
      },
      calendar: {
        title:
          'Deadlines, meetings, follow ups and stages in a single surface.',
        caption:
          'When deadlines, meetings, and project stages share the same flow, the firm runs on one reading of ops: fewer clashes, fewer reworks, and better predictability of what happens next.',
        kicker:
          'Deadlines and milestones organized in one visual workflow.',
        imageAlt: 'Deadlines and stages in one workspace',
      },
      faq: {
        title: 'Frequently asked questions',
        caption:
          'Direct answers about rollout, privacy, execution, and how John adapts to the real rhythms of your office.',
        q1: 'Does John AI replace my studio WhatsApp line?',
        a1:
          'No: you keep WhatsApp exactly where prospects already ping you. John AI organizes leads, sequencing, and history on top of that same channel so no one hunts screenshots or buried groups.',
        q2:
          'Does it work only for kickoff builds or ongoing construction too?',
        a2:
          'Both inbound marketing traffic and mature jobsites benefit. Visibility is about milestone, bottleneck, and owner, whether talk started yesterday or months ago.',
        q3: 'How long until the crew adopts new rituals?',
        a3:
          'Lean teams stabilize routing and prioritization in a handful of weeks with focused training tuned to project archetypes; larger process shifts roll out phased.',
        q4: 'Can we demo the product before buying?',
        a4:
          'Yes. We run a structured walkthrough spanning lead velocity, staffing, and how you execute today, and show the stack in your context rather than glossy decks.',
        q5: 'Where does conversation data live?',
        a5:
          'We minimize payload: store only what is needed to orchestrate servicing and builds. Detailed hosting and contractual guardrails arrive with the formal proposal.',
        q6: 'What happens after go live?',
        a6:
          'Dedicated pathways for escalations ship with SLA bands per plan: deeper integrations or bespoke flows become separate initiatives when warranted.',
        q7: 'Does the product adapt to how we already work, or force one cookie cutter model?',
        a7:
          'John maps to how your studio actually behaves: scopes, milestones, responsibilities, and priorities tuned during onboarding. No single rigid template for everyone: there’s a shared backbone for intake and builds that aligns with your current playbook.',
        q8:
          'Is John for architecture-only firms, engineering-only practices, or both?',
        a8:
          'All three: architecture-only studios, engineering-only practices, or firms that combine both. John organizes intake and delivery around how you already work, without forcing a single rigid playbook.',
      },
      trustStats: {
        ariaLabel: 'Trust indicators',
        clientsLabel: 'satisfied clients',
        ratingLabel: 'positive ratings',
      },
      register: {
        title: 'Book a demo to see what the platform can offer.',
        stepsAria: 'How it works',
        step1Tag: 'Step 1',
        step2Tag: 'Step 2',
        step1Title: 'Complete the form',
        step1Desc:
          'Share your contact details. We protect your data and use it only to get in touch.',
        step2Title: 'Get a tailored call',
        step2Desc:
          'Within 8 hours, a specialist will contact you to schedule the most important conversation with your firm.',
        errSend: 'We could not send right now. Check the fields and try again.',
        labelName: 'Name',
        labelEmail: 'Email',
        labelPhone: 'Phone',
        labelCompany: 'Company name',
        phName: 'Your name',
        phEmail: 'Your best email',
        phPhone: 'Phone number',
        phCompany: 'Company name',
        countryAria: 'Select country and country code',
        countryBR: 'Brazil (+55)',
        countryUS: 'United States (+1)',
        countryAR: 'Argentina (+54)',
        countryCL: 'Chile (+56)',
        countryCO: 'Colombia (+57)',
        countryES: 'Spain (+34)',
        countryPT: 'Portugal (+351)',
        countryUK: 'United Kingdom (+44)',
        countryDE: 'Germany (+49)',
        countryFR: 'France (+33)',
        segmentLabel: 'Industry segment',
        segmentPh: 'What is your segment?',
        segmentEng: 'Engineering',
        segmentArch: 'Architecture',
        segmentDesign: 'Design',
        segmentBoth: 'Engineering / Architecture',
        revenueLabel: 'Monthly revenue (BRL)',
        revenuePh: 'Select a monthly range (BRL)',
        rev1: 'Up to R$ 50,000 / month',
        rev2: 'R$ 50,000 – R$ 100,000 / month',
        rev3: 'R$ 100,000 – R$ 250,000 / month',
        rev4: 'R$ 250,000 – R$ 500,000 / month',
        rev5: 'R$ 500,000 – R$ 1,000,000 / month',
        rev6: 'R$ 1,000,000 – R$ 3,000,000 / month',
        rev7: 'Above R$ 3,000,000 / month',
        rev8: 'Prefer not to say',
        submit: 'Request more information',
        sending: 'Sending…',
        toastAria: 'Registration sent successfully',
        toastTitle: "You're on the list!",
        toastDesc: 'A specialist will reach out within 8 hours.',
        toastClose: 'Close',
      },
      blogSection: {
        title: 'For leaders running real jobsites',
        caption:
          'Notes on studio operations, transparent client orchestration, and field execution, with zero fluff.',
        link: 'View full blog',
        c1topic: 'Operations',
        c1title:
          'Cutting rework while WhatsApp is still your mission control',
        c1excerpt:
          'Prioritize what floods the inbox without losing the storyline of what is actually on site.',
        c1read: 'Read article',
        c2topic: 'People',
        c2title:
          'Operational clarity before delays become courtroom level drama',
        c2excerpt:
          'Lightweight cues so principals know who anchors each frontier.',
        c3topic: 'Client',
        c3title:
          'First DM to turnover: aligning expectations without overpromising',
        c3excerpt:
          'Keep the nurture journey understandable without pinning your technical crew.',
      },
      adapt: {
        title: 'Studios behave differently: the platform flexes accordingly.',
        logoAlt: 'John AI',
      },
      cta: {
        title:
          'Move ahead on operations without giving up what already works in your firm.',
        desc:
          'On the call, you see where you gain clarity and predictability. We walk through how John fits your current procedures and how we adapt stages, roles, and flows to your team’s routine, so you can decide with confidence.',
        btn: 'Book a call',
      },
      footer: {
        navAria: 'Footer navigation',
        contentAria: 'Footer content links',
        opsAria: 'Footer operations links',
        brand: 'Cantevo',
        desc:
          'Platform for architecture and engineering firms with connected operations from WhatsApp intake to team, project and deadline tracking.',
        colPlatform: 'Platform',
        colContent: 'Content',
        colOps: 'Operations',
        home: 'Home',
        platform: 'Platform',
        flow: 'Flow',
        team: 'Team',
        blog: 'Blog',
        allArticles: 'All articles',
        faq: 'FAQ',
        contact: 'Contact',
        wa: 'WhatsApp support',
        schedule: 'Book a call',
        adminLeads: 'Leads · dashboard',
        copy: '© 2026 Cantevo · John AI. All rights reserved.',
        privacy: 'Privacy & data',
        terms: 'Commercial terms',
      },
      wa: {
        aria: 'Chat with John AI on WhatsApp',
        message: 'Hello! I would like to talk about John AI.',
      },
      schedule: {
        title: 'Book a call',
        subtitle:
          'Enter your name, email and phone. We will reply using those details. Company is optional.',
        labelName: 'Full name',
        labelEmail: 'Email',
        labelPhone: 'Phone (with area code)',
        labelCompany: 'Company / studio',
        companyOptional: 'optional',
        btnSubmit: 'Send details',
        btnCancel: 'Cancel',
        errRequired: 'This field is required.',
        errEmail: 'Enter a valid email.',
        errPhone: 'Enter a phone number with at least 8 digits.',
        errSubmit: 'We could not save your request right now. Please retry.',
        submitting: 'Sending…',
        successTitle: "You're all set!",
        successSubtitle:
          'We received your details. We will contact you shortly via email or phone.',
        btnDone: 'Close',
        intro: 'Hello! I’d like to book a conversation about John AI.',
        lineName: 'Name',
        lineEmail: 'Email',
        linePhone: 'Phone',
        lineCompany: 'Company',
        ariaCloseOverlay: 'Close',
      },
      schema: {
        organizationName: 'Cantevo',
        softwareDesc:
          'Platform that aligns intake, staffing, projects, and deadlines for architecture and engineering firms, with WhatsApp native orchestration.',
      },
      blogPage: {
        metaTitle:
          'Cantevo · John AI Blog · AE firm ops, jobsites, BIM, KPIs & compliance',
        metaDesc:
          '10+ playbooks for architecture & engineering firms: intake, staffing, field coordination, schedules, BIM, RFIs, subs, KPIs, privacy and safety documentation. SEO-rich, practitioner-first guidance.',
        ogTitle:
          'Cantevo · John AI Blog · Studio & field operations',
        ogDesc:
          'Article archive: rework control, telemetry, client pacing, triage, privacy, schedules, RFIs, hybrid teams, trade communication, KPIs, safety docs.',
        twitterTitle:
          'Cantevo Blog · Architecture, engineering & construction ops',
        twitterDesc:
          'Practical guides on studio management, jobsites, compliance and per-project performance.',
        navBrandAria: 'Cantevo · homepage',
        navBack: '← Back to site',
        heroTitle: 'Blog',
        heroSubtitleBefore:
          'Everything architecture & engineering firms need to run calmer operations with ',
        heroSubtitleBrand: 'Cantevo · John AI',
        heroLead:
          'Practical guides on studio management, jobsites, intake, staffing and compliance — written for SEO and for teams that need predictable delivery, with or without chat at the center.',
        searchLabel: 'Search articles',
        searchPlaceholder: 'e.g. WhatsApp, jobsite, privacy, schedule…',
        searchHint: 'Filter by topic or keyword.',
        readMore: 'Read more »',
        noResults: 'No articles match. Try different words.',
        archiveHeading: 'Featured articles',
        archiveEyebrow: 'Archive',
        countIdle: '{n} articles · use search to filter',
        countFiltered: '{n} of {total} articles match your search',
        skipLink: 'Skip to content',
        breadcrumbAria: 'Breadcrumb',
        breadcrumbHome: 'Home',
        tocFaq: 'FAQ',
        tocGuides: 'Full guides',
        faqTitle: 'Frequently asked questions',
        faqLead:
          'Straight answers about this blog, who it is for, and how reading pairs with a John AI walkthrough.',
        faq1q: 'Does this blog replace a sales conversation?',
        faq1a:
          'No. Articles explain concepts and habits; book a demo on the main site to see John AI in your studio context.',
        faq2q: 'Is the content only for WhatsApp-heavy teams?',
        faq2a:
          'No. We cover jobsites, prioritization, BIM, KPIs and compliance. WhatsApp shows up because it is a real channel for many Brazilian firms.',
        faq3q: 'Does it apply to architecture-only or engineering-only firms?',
        faq3a:
          'Yes to both, and to multidisciplinary practices. Guides call out scenarios for each profile.',
        faq4q: 'Can we apply the practices without buying software?',
        faq4a:
          'Partly—process and discipline come first. Platforms help when volume, staffing or risk require centralized history and priority.',
        faq5q: 'How do we suggest a new article topic?',
        faq5a:
          'Reach out via WhatsApp or the site contact form. Real operations pain points rise on our editorial backlog.',
        faq6q: 'How often is the blog updated?',
        faq6a:
          'We expand and refresh content continuously; articles may gain new sections when markets or regulations shift.',
        guidesTitle: 'Full guides',
        guidesLead:
          'Read the long-form posts below—best after you have skimmed or filtered the archive above.',
        card1excerpt:
          'Phase gates, checklists and searchable history so the same issue stops reopening ten times.',
        card2excerpt:
          'Owner, next commitment and shipped work visible early—before the calendar becomes the argument.',
        card3excerpt:
          'Cadence and transparency from first DM to mobilization without silence that erodes trust.',
        card4excerpt:
          'Rules per job type and single-owner queues until the next state change.',
        card5excerpt:
          'Data minimization, internal policy and documented consent when projects live in chat.',
        card6excerpt:
          'A timeline clients understand and builders can defend between model and field reality.',
        card7excerpt:
          'Formal Q&A and approval packages with a trail—fewer implicit decisions in group chat.',
        card8excerpt:
          'Blend deep work, sync windows and site walks without losing context across locations.',
        card9excerpt:
          'Official channel, short minutes and trade owners—less guesswork that taxes execution.',
        card10excerpt:
          'What to measure per job so partners see health before accounting closes the month.',
        card11excerpt:
          'Minimum records, single version and fast access when audits or incidents appear.',
        post1meta: 'Operations · 8 min',
        post1h2:
          'Shrinking rework when WhatsApp doubles as headquarters',
        post1p1:
          'When inbound noise never gets an owner, the technical loop reopens CAD four times because nobody trusts which decision was definitive. Fixing that is rarely “more tools”; it starts with naming what qualifies as locked scope per job archetype, and who seals it.',
        post1p2:
          'Snippet checklists aligned to schematic, coordination, and field phases kill loops that chew bandwidth without conveying new clarity. That is the muscle John AI preserves with visible history plus priority for whoever executes, not screenshot archaeology.',
        post2meta: 'People · 6 min',
        post2h2:
          'Before delays become melodrama: telemetry that leadership can actually skim',
        post2p1:
          'Clients escalate when sensing radio silence, even if the slip is a day. Surfacing steward, pending promise, and what already landed reframes urgency without rewriting your calendar.',
        post2p2:
          'Straightforward canvases scoped per teammate or plot keep fake urgency across every channel from starving the roadmap: pressure lands where sequencing decisions actually live.',
        post3meta: 'Client · 7 min',
        post3h2:
          'Prospect handshake to turnover: truthful pacing without unicorn promises',
        post3p1:
          'Momentum wants throughput; architects want fidelity. Transparent pulse (what landed, what is still buffering) helps slow phases feel sane. Silence outweighs admitting a believable ETA.',
        post3p2:
          'Flows that articulate the breadcrumb trail from first DM through mobilization keep owners oriented without pinning your technical bench to heroic daily narrations.',
        post1p3:
          'Across mid sized shops the rework tax is not hourly alone: slipped vendor releases, frantic redlines at night and frayed GC relationships accumulate. Persisting decisions in once place lowers the “I thought we agreed otherwise” pings.',
        post1p4:
          'When WhatsApp is your control tower the minimum credible rigor is owned threads until scope settles, searchable history and explicit sequencing. Stacks like John bridge inbox to milestone without forcing crews to ditch the channel overnight.',
        post2p3:
          'Light gauges help: backlog per steward, stale project clock and an SLA only on owner facing replies—not every internal chatter line.',
        post2p4:
          'Connected boards linked to workflows keep managers out of bottleneck duty and intervene only where exceptions erupt which is precisely the promise of integrated ops leadership.',
        post3p3:
          'Normalize a cadence—for example Mondays and Thursdays for hot jobs—and publish that heartbeat early.',
        post3p4:
          'Search engines and savvy clients alike reward signals that leadership stays ahead of narratives; reputational SEO for AE firms benefits as much from consistent reporting as instantaneous hero replies.',
        post4meta: 'Prioritisation · 7 min',
        post4h2:
          'Untended intake: how to sort what arrives before it derails mobilization',
        post4p1:
          'Not every DM matches every pursuit and not every frantic ping moves the needle. Typology tiers keep everyone from pretending every fire is inferno tier.',
        post4p2:
          'Named queues help when each payload gets a steward until promotion; ghost threads usually mean unstructured backlog fatigue.',
        post4p3:
          'Stitch intake to embodied phases—concept through commissioning—and you tame chaos inward and outward reinforcing brand halo when referrals praise process not only pixels.',
        post4p4:
          'Measuring rework by archetype informs where playbook investment pays off versus generic choreography that flops on complex mandates.',
        post5meta: 'Compliance · 6 min',
        post5h2:
          'Operational privacy reminders for AE studios juggling owners, crews and chats',
        post5p1:
          'Treating chat as casually non corporate grows risky once drawings values and Personally Identifiable Information bounce around unstructured.',
        post5p2:
          'Consent can remain conversational yet must echo in master agreements onboarding sheets and official contacts so purpose limitation stays legible.',
        post5p3:
          'Systems that constrain scattershot forwarding make audits humane without turning everyday dialogue into paralysis.',
        post5p4:
          'Publishing a single well structured evergreen page with purposeful headings FAQs inside articles reinforces queries prospects actually run searches about AE operations discipline multidisciplinary Brazil delivery.',
        post6meta: 'Planning · 9 min',
        post6h2:
          'Integrated master schedule: align design, BIM and field without losing the owner',
        post6p1:
          'Owners buy predictability, not a pretty 3D snapshot. When the studio schedule lives only in an internal Gantt and the field runs on verbal agreements, two conflicting stories emerge. Publish milestones that translate BIM and technical gates into owner language—with named owners and cut dates.',
        post6p2:
          'BIM integration is not “more apps”; it is defining what changes status (package issuance, shop approval, procurement release) and who validates. Clash and redesign then become planned events with float instead of surprises.',
        post6p3:
          'On site, short photo logs tied to a single job ID settle “which version counts” debates. Educational pages that explain how design, procurement and construction connect rank for integrated construction operations, 4D/5D scheduling and multidisciplinary coordination.',
        post6p4:
          'Platforms like John help when client-visible milestones and internal queues share the same priority—less rework between design and field, clearer view of what is blocked today.',
        post7meta: 'Engineering · 8 min',
        post7h2:
          'RFIs & submittals: cut rework across design, vendors and field',
        post7p1:
          'A vague RFI becomes endless chatter; a submittal without a checklist burns weeks. Mature AE firms treat both as operational contracts: ID, schedule impact, responder and deadline.',
        post7p2:
          'Central RFIs stop the same question from living in chat, email and a meeting note. Submittals earn their keep with a trail: submit, review, conditional approval, distribution to field as one version.',
        post7p3:
          'SEO-wise, teaching RFI workflow, material approvals and coordination captures searches from teams tightening executive documentation and late-change costs.',
        post7p4:
          'When conversational intake links to formal protocol, fewer decisions stay implicit—and less last-minute rework hits concrete pours or enclosure milestones.',
        post8meta: 'People · 7 min',
        post8h2:
          'Hybrid studios: delivery rhythm with remote staff and site visits',
        post8p1:
          'Architecture and engineering blend deep work (calculation, detailing) with valuable interruptions (site, client). In hybrid mode the risk isn’t location—it’s context loss between office and field.',
        post8p2:
          'Short synchronous windows plus asynchronous decision logs preserve pace. Site visits need a minimum checklist: observed, changed, next step, owner—or knowledge dies on the drive back.',
        post8p3:
          'SEO articles on project-office productivity, remote BIM collaboration and information security for distributed teams attract leaders revisiting workplace policy.',
        post8p4:
          'A platform surfacing queues per person and per job reduces the “nobody knows what the other shipped” feeling common in poorly instrumented hybrids.',
        post9meta: 'Field · 8 min',
        post9h2:
          'Trade communication: recorded decisions and less noise on site',
        post9p1:
          'An efficient site isn’t a quiet site—it’s one with the right channel per decision type. Mixing procurement, means-and-methods and neighbor complaints in one thread erases accountability.',
        post9p2:
          'Define where commitments are born: short meeting minutes, emailed summaries or tickets with SLA. Trades need to know which channel governs scope changes—or everything feels urgent.',
        post9p3:
          'For Google, guides on subcontractor management, site communication and work-order logs attract commercial searches from builders and design-led contractors.',
        post9p4:
          'Searchable history and explicit priority—even when part of the flow is messaging—stop the same dispute from being negotiated three times at three price levels.',
        post10meta: 'Management · 9 min',
        post10h2:
          'Per-project KPIs: margin, technical hours and schedule in one read',
        post10p1:
          'Many AE firms only learn a job “didn’t work” at month-end close. Operational KPIs per project—hours vs. budget, recognized revenue, scope drift—surface hard client conversations earlier.',
        post10p2:
          'Per-job margin needs real hour costing, not only monthly allocation. Queue and schedule pressure working capital: delay often brings unfunded overtime and staffing reshuffles.',
        post10p3:
          'B2B SEO benefits from pages explaining studio metrics, fee pricing and scope control—content partners and CFOs actually search.',
        post10p4:
          'When intake and execution share workload visibility, saying “no” to out-of-contract asks looks disciplined—not chaotic.',
        post11meta: 'Compliance · 8 min',
        post11h2:
          'Safety documentation & traceability that protect studio and site',
        post11p1:
          'Safety programs require proof of orientation, training and controls. Files on a personal drive or screenshots lost on a phone don’t scale for inspections or incidents.',
        post11p2:
          'Single versions of safety plans, registrations and directives must reach field leads. Traceability means knowing who received which version when—not extra bureaucracy, but lower legal and operational risk.',
        post11p3:
          'Articles on site documentation and alignment between technical studio and safety teams rank for construction compliance, audits and risk management queries.',
        post11p4:
          'Connecting field communication to structured repositories keeps critical facts out of ephemeral chat only—without killing site speed.',
        footerCr: '© Cantevo',
        footerSite: 'Main website',
        tocTitle: 'On this page',
        tocAriaLabel: 'Articles on this page',
        toc1: 'Rework when WhatsApp is HQ',
        toc2: 'Telemetry before client drama',
        toc3: 'Lead journey into execution',
        toc4: 'Inbox triage discipline',
        toc5: 'Privacy for studios + chats',
        toc6: 'Schedule, BIM & field',
        toc7: 'RFIs & submittals',
        toc8: 'Hybrid studio',
        toc9: 'Trades & site',
        toc10: 'Per-project KPIs',
        toc11: 'Safety & documentation',
      },
      adminPage: {
        metaTitle: 'Dashboard · Leads · Cantevo',
        metaDesc:
          'View contact requests captured from the John AI landing. Restricted area.',
        ogTitle: 'Dashboard · Leads · Cantevo',
        ogDesc: 'Appointment requests and captured contact fields.',
        twitterTitle: 'Dashboard · Leads · Cantevo',
        twitterDesc: 'Contact submissions · Cantevo.',
        brand: 'Cantevo',
        pageTitle: 'Leads',
        pageSubtitle: 'Captured from landing',
        statTotal: 'Total',
        statToday: 'Today',
        statWeek: 'Last 7 days',
        searchPlaceholder: 'Search by name, email or phone…',
        emptyTitle: 'No leads yet',
        emptyDesc: 'Once someone submits the “Book a call” form, they show here.',
        colDate: 'Date',
        colName: 'Name',
        colEmail: 'Email',
        colPhone: 'Phone',
        colCompany: 'Company',
        colSegment: 'Segment',
        colRevenue: 'Revenue',
        colLang: 'Language',
        exportCsv: 'Export CSV',
        refresh: 'Refresh',
        logout: 'Sign out',
        loginTitle: 'Dashboard access',
        loginHint: 'Use the credentials configured on the server (ADMIN_USERNAME and ADMIN_PASSWORD env vars).',
        loginUser: 'Username',
        loginPass: 'Password',
        loginSubmit: 'Sign in',
        loginSubmitting: 'Signing in…',
        loginRequired: 'Fill in username and password.',
        loginInvalid: 'Invalid username or password.',
        loginNotConfigured: 'Set ADMIN_USERNAME and ADMIN_PASSWORD as Vercel env vars.',
        loginRate: 'Too many attempts — please wait.',
        loginNet: 'No response from server. Try again.',
        securityWarn:
          'Configure ADMIN_USERNAME, ADMIN_PASSWORD and SESSION_SECRET as Vercel env vars.',
        unauthorized: 'Sign in to view leads.',
        chartTitle: 'Leads over the last 7 days',
        chartSub: 'Volume per calendar day (local midnight to midnight)',
        chartAria: 'Bar chart of lead count per day over the past week.',
        waSectionAria: 'WhatsApp connection via Evolution API',
        waEvoTitle: 'Evolution API · WhatsApp',
        waBadgeConnected: 'connected',
        waBadgeAwait: 'awaiting link',
        waHintOpen:
          'WhatsApp is connected via Evolution API. New leads trigger a notification to this number.',
        waHintQr:
          'Use the 8-digit code in WhatsApp (Linked devices → Link with phone number) or scan the QR.',
        waConnectedTitle: 'WhatsApp connected',
        waConnectedSub: 'The pairing code stays hidden while the Evolution session is active.',
        waPairingTitle: 'Evolution pairing code (8 digits)',
        waQrCaption: 'Or scan the QR',
        waCopy: 'Copy code',
        waCopied: 'Copied',
      },
    },
  };

  var WA_PHONE = '5511987654321';

  function navigate(obj, path) {
    var parts =
      typeof path === 'string' ? path.split('.').filter(Boolean) : path;
    var cur = obj;
    for (var i = 0; i < parts.length; i++) {
      if (!cur || typeof cur !== 'object') return undefined;
      cur = cur[parts[i]];
    }
    return cur;
  }

  function t(lang, dotPath) {
    var bundle = STRINGS[lang];
    return navigate(bundle, dotPath);
  }

  function getStoredLang() {
    try {
      var v = localStorage.getItem(STORAGE_KEY);
      if (v === 'pt-BR' || v === 'en') return v;
    } catch (e) {}
    return DEFAULT_LANG;
  }

  function setStoredLang(lang) {
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch (e) {}
  }

  function qsParamLang() {
    var m =
      typeof window !== 'undefined' &&
      window.location &&
      window.location.search.match(/[?&]lang=(en|pt)(?:&|$)/i);
    if (!m) return null;
    return m[1].toLowerCase() === 'en' ? 'en' : 'pt-BR';
  }

  function buildWaHref(lang, customMessage) {
    var msg;
    if (typeof customMessage === 'string' && customMessage.length > 0) {
      msg = customMessage;
    } else {
      msg =
        (STRINGS[lang] && STRINGS[lang].wa && STRINGS[lang].wa.message) ||
        STRINGS['pt-BR'].wa.message;
    }
    return (
      'https://wa.me/' +
      WA_PHONE +
      '?text=' +
      encodeURIComponent(msg)
    );
  }

  function buildScheduleLeadMessage(lang, data) {
    if (!data) data = {};
    var s =
      STRINGS[lang] && STRINGS[lang].schedule
        ? STRINGS[lang].schedule
        : STRINGS['pt-BR'].schedule;
    var name = String(data.name || '').trim();
    var email = String(data.email || '').trim();
    var phone = String(data.phone || '').trim();
    var company = String(data.company || '').trim();
    var lines = [s.intro];
    lines.push(s.lineName + ': ' + name);
    lines.push(s.lineEmail + ': ' + email);
    lines.push(s.linePhone + ': ' + phone);
    if (company) lines.push(s.lineCompany + ': ' + company);
    return lines.join('\n');
  }

  function buildLeadWaHref(lang, data) {
    return buildWaHref(lang, buildScheduleLeadMessage(lang, data));
  }

  function applyMeta(lang) {
    function set(sel, attr, text) {
      var el = document.querySelector(sel);
      if (el && text !== undefined && text !== null) el.setAttribute(attr, text);
    }

    var page =
      (document.documentElement && document.documentElement.getAttribute('data-i18n-page')) ||
      '';
    var m =
      page === 'blog'
        ? STRINGS[lang].blogPage
        : page === 'admin'
          ? STRINGS[lang].adminPage
          : STRINGS[lang].meta;
    if (!m) return;

    if (page === 'blog' || page === 'admin') {
      document.title = m.metaTitle;
      set('meta[name="description"]', 'content', m.metaDesc);
      set('meta[property="og:title"]', 'content', m.ogTitle);
      set('meta[property="og:description"]', 'content', m.ogDesc);
      set('meta[name="twitter:title"]', 'content', m.twitterTitle);
      set('meta[name="twitter:description"]', 'content', m.twitterDesc);
      set('meta[property="og:locale"]', 'content', lang === 'en' ? 'en_US' : 'pt_BR');
      return;
    }

    document.title = m.title;
    set('meta[name="description"]', 'content', m.description);
    set('#og-title', 'content', m.ogTitle);
    set('#og-desc', 'content', m.ogDescription);
    set('#twitter-title', 'content', m.twitterTitle);
    set('#twitter-desc', 'content', m.twitterDescription);
    set('#og-locale', 'content', lang === 'en' ? 'en_US' : 'pt_BR');
  }

  function applyDataI18n(lang) {
    var nodes = document.querySelectorAll('[data-i18n]');
    for (var i = 0; i < nodes.length; i++) {
      var el = nodes[i];
      var key = el.getAttribute('data-i18n');
      if (!key) continue;
      var val = t(lang, key);
      if (typeof val !== 'string') continue;
      if (el.tagName === 'TITLE') continue;
      el.textContent = val;
    }

    document.querySelectorAll('[data-i18n-attr]').forEach(function (wrapper) {
      var spec = wrapper.getAttribute('data-i18n-attr');
      if (!spec) return;
      var idx = spec.indexOf(':');
      if (idx === -1) return;
      var attr = spec.slice(0, idx);
      var dotKey = spec.slice(idx + 1);
      var aval = t(lang, dotKey);
      if (typeof aval !== 'string') return;
      wrapper.setAttribute(attr, aval);
    });
  }

  function applyWaLinks(lang) {
    var href = buildWaHref(lang);
    document.querySelectorAll('[data-wa-link]').forEach(function (a) {
      a.setAttribute('href', href);
    });
  }

  function applyJsonLdIndex(lang) {
    var script = document.getElementById('zira-ld-json');
    if (!script || !window.JSON) return;

    var f = STRINGS[lang].faq;
    var S = STRINGS[lang].schema;
    var wsLang = lang === 'en' ? 'en-US' : 'pt-BR';
    var desc = S.softwareDesc;
    var orgName = S.organizationName || 'Cantevo';

    var graph = [
      {
        '@type': 'Organization',
        '@id': 'https://www.zira.ai/#organization',
        name: orgName,
        url: 'https://www.zira.ai/',
        logo: 'https://www.zira.ai/assets/cantevo-logo.png',
      },
      {
        '@type': 'WebSite',
        '@id': 'https://www.zira.ai/#website',
        url: 'https://www.zira.ai/',
        name: orgName,
        inLanguage: wsLang,
        publisher: { '@id': 'https://www.zira.ai/#organization' },
      },
      {
        '@type': 'WebPage',
        '@id': 'https://www.zira.ai/#webpage',
        url: 'https://www.zira.ai/',
        name: t(lang, 'meta.title'),
        description: t(lang, 'meta.description'),
        inLanguage: wsLang,
        isPartOf: { '@id': 'https://www.zira.ai/#website' },
        about: { '@id': 'https://www.zira.ai/#software' },
      },
      {
        '@type': 'SoftwareApplication',
        '@id': 'https://www.zira.ai/#software',
        name: 'John AI',
        applicationCategory: 'BusinessApplication',
        operatingSystem: 'Web',
        description: desc,
        publisher: { '@id': 'https://www.zira.ai/#organization' },
      },
      {
        '@type': 'FAQPage',
        '@id': 'https://www.zira.ai/#faq',
        isPartOf: { '@id': 'https://www.zira.ai/#webpage' },
        mainEntity: [
          {
            '@type': 'Question',
            name: f.q1,
            acceptedAnswer: { '@type': 'Answer', text: f.a1 },
          },
          {
            '@type': 'Question',
            name: f.q2,
            acceptedAnswer: { '@type': 'Answer', text: f.a2 },
          },
          {
            '@type': 'Question',
            name: f.q3,
            acceptedAnswer: { '@type': 'Answer', text: f.a3 },
          },
          {
            '@type': 'Question',
            name: f.q4,
            acceptedAnswer: { '@type': 'Answer', text: f.a4 },
          },
          {
            '@type': 'Question',
            name: f.q5,
            acceptedAnswer: { '@type': 'Answer', text: f.a5 },
          },
          {
            '@type': 'Question',
            name: f.q6,
            acceptedAnswer: { '@type': 'Answer', text: f.a6 },
          },
          {
            '@type': 'Question',
            name: f.q7,
            acceptedAnswer: { '@type': 'Answer', text: f.a7 },
          },
          {
            '@type': 'Question',
            name: f.q8,
            acceptedAnswer: { '@type': 'Answer', text: f.a8 },
          },
        ],
      },
    ];

    script.textContent = JSON.stringify(
      { '@context': 'https://schema.org', '@graph': graph },
      null,
      2
    );
  }

  function updateLangButtons(lang) {
    var pt = document.querySelector('[data-lang-btn="pt-BR"]');
    var en = document.querySelector('[data-lang-btn="en"]');
    if (pt) {
      pt.setAttribute('aria-pressed', lang === 'pt-BR' ? 'true' : 'false');
      pt.setAttribute('data-active', lang === 'pt-BR' ? 'true' : 'false');
    }
    if (en) {
      en.setAttribute('aria-pressed', lang === 'en' ? 'true' : 'false');
      en.setAttribute('data-active', lang === 'en' ? 'true' : 'false');
    }
  }

  var currentLang = DEFAULT_LANG;

  function apply(lang) {
    if (lang !== 'pt-BR' && lang !== 'en') lang = DEFAULT_LANG;
    currentLang = lang;

    document.documentElement.setAttribute(
      'lang',
      lang === 'en' ? 'en' : 'pt-BR'
    );

    setStoredLang(lang);
    applyMeta(lang);
    applyDataI18n(lang);
    applyWaLinks(lang);

    var page = document.documentElement && document.documentElement.dataset
      ? document.documentElement.dataset.i18nPage
      : '';
    if (!page || page === 'index') {
      applyJsonLdIndex(lang);
    }

    updateLangButtons(lang);

    if (typeof window !== 'undefined' && window.dispatchEvent) {
      window.dispatchEvent(
        new CustomEvent('zira:lang', { detail: { lang: lang } })
      );
    }
  }

  function bindLangSwitcher() {
    document.querySelectorAll('[data-lang-btn]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var next = btn.getAttribute('data-lang-btn');
        if (!next || (next !== 'pt-BR' && next !== 'en')) return;
        apply(next);
      });
    });
  }

  function init() {
    var fromUrl = qsParamLang();
    var lang =
      fromUrl !== null ? fromUrl : getStoredLang();
    bindLangSwitcher();
    apply(lang);
  }

  global.ZiraI18n = {
    init: init,
    apply: apply,
    getLang: function () {
      return currentLang;
    },
    t: function (dotPath) {
      return t(currentLang, dotPath);
    },
    buildWaHref: buildWaHref,
    buildScheduleLeadMessage: buildScheduleLeadMessage,
    buildLeadWaHref: buildLeadWaHref,
    STRINGS: STRINGS,
  };
})(typeof window !== 'undefined' ? window : this);