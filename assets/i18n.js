/**
 * ZIRA AI · i18n (pt-BR / en)
 * Persistência: localStorage "zira-lang"
 */
(function (global) {
  'use strict';

  var STORAGE_KEY = 'zira-lang';
  var DEFAULT_LANG = 'pt-BR';

  var STRINGS = {
    'pt-BR': {
      meta: {
        title: 'M2SCALE · Plataforma para Escritórios de Arquitetura e Engenharia',
        description:
          'M2SCALE · Organiza atendimento, equipe, obras e prazos para escritórios de arquitetura e engenharia. Operação clara no WhatsApp, desktop e obra.',
        ogTitle: 'M2SCALE · Plataforma para Escritórios de Arquitetura e Engenharia',
        ogDescription:
          'Organiza atendimento, equipe, obras e prazos. Operação real no escritório, do WhatsApp à obra, com mais clareza e previsibilidade.',
        twitterTitle: 'M2SCALE · Plataforma para Escritórios',
        twitterDescription:
          'Atendimento, equipe, obras e prazos organizados para escritórios de arquitetura e engenharia.',
      },
      nav: {
        brandAria: 'M2 SCALE · Página inicial',
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
          'Transforme WhatsApp em operação previsível: atendimento, equipe, obra e prazo no mesmo controle.',
        counterLabel: 'escritórios já evoluíram com a ZIRA AI',
        sr:
          'ZIRA AI, plataforma para arquitetura e engenharia. Mais de 100 escritórios já evoluíram para uma operação mais clara, integrada e previsível.',
        proof:
          'Escritórios que padronizam a operação reduzem retrabalho, aceleram resposta e ganham margem para crescer.',
      },
      zira: {
        desc:
          'No WhatsApp, o Zira identifica a solicitação, separa oportunidades comerciais de outros assuntos, prioriza o que exige atenção do time e organiza o contexto para que cada atendimento avance com mais clareza. Quando a resposta não deve ser automatizada, o sistema encaminha o caso corretamente, sem ruído e sem improviso.',
        imageAlt: '',
      },
      problem: {
        title: 'Seu problema não é falta de lead. É falta de controle depois que o lead entra.',
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
        imageAlt: 'Atendimento e tarefas no celular com Zira AI',
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
        s2Title: 'ZIRA AI organiza a demanda',
        s2Body:
          'Mesmo quando o cliente não consegue explicar direito o que quer, o Zira ajuda a estruturar a solicitação e transforma uma conversa solta em contexto útil para o time.',
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
        ziraMascotAlt: 'ZIRA AI',
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
        q1: 'O Zira AI substitui o WhatsApp do escritório?',
        a1:
          'Não: o time continua no WhatsApp que o escritório já usa. O Zira organiza leads, prioridades e histórico por cima dessa mesma linha de atendimento, para ninguém depender de grupos soltos ou print.',
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
          'O Zira é configurado à realidade do seu escritório: tipos de obra, etapas, responsáveis e prioridades alinhamos na implantação. Não existe um molde rígido único para todos: há um núcleo comum de atendimento e obra que mapeamos para como vocês já trabalham hoje.',
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
        logoAlt: 'ZIRA AI',
      },
      cta: {
        title:
          'Ganhe eficiência operacional sem trocar o que já funciona no seu escritório.',
        desc:
          'Na demonstração, mapeamos gargalos reais da sua rotina e mostramos como a M2SCALE organiza atendimento, equipe e obra para você crescer com previsibilidade.',
        btn: 'Agendar conversa',
      },
      footer: {
        navAria: 'Links do rodapé',
        contentAria: 'Conteúdo do rodapé',
        opsAria: 'Operação do rodapé',
        brand: 'M2 SCALE',
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
        copy: '© 2026 M2 SCALE · ZIRA AI. Todos os direitos reservados.',
        privacy: 'Privacidade e dados',
        terms: 'Termos comerciais',
      },
      wa: {
        aria: 'Atendimento ZIRA AI no WhatsApp',
        message:
          'Olá! Gostaria de falar sobre o ZIRA AI.',
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
        intro: 'Olá! Gostaria de agendar uma conversa sobre o ZIRA AI.',
        lineName: 'Nome',
        lineEmail: 'E-mail',
        linePhone: 'Telefone',
        lineCompany: 'Empresa',
        ariaCloseOverlay: 'Fechar',
      },
      schema: {
        organizationName: 'M2 SCALE',
        softwareDesc:
          'Plataforma que organiza atendimento, equipe, obras e prazos para escritórios de arquitetura e engenharia, com atendimento integrado via WhatsApp.',
      },
      blogPage: {
        metaTitle:
          'Blog M2SCALE · Gestão de escritório, obra, WhatsApp e engenharia',
        metaDesc:
          'Artigos sobre gestão de escritório de arquitetura e engenharia: retrabalho no WhatsApp, priorização da equipe, jornada do cliente na obra e LGPD. Conteúdo para escalar operação sem perder contexto.',
        ogTitle:
          'Blog M2SCALE · Operação em escritório e obra',
        ogDesc:
          'Guias sobre retrabalho, gestão à vista, expectativa do cliente e compliance — para escritórios que usam WhatsApp mas precisam de previsibilidade.',
        twitterTitle:
          'Blog M2SCALE · Gestão de escritório e obra',
        twitterDesc:
          'Gestão de escritório, obra, relacionamento com cliente e melhores práticas LGPD para arquitetura e engenharia.',
        navBrandAria: 'M2 SCALE · página inicial',
        navBack: '← Voltar ao site',
        heroTitle: 'Blog',
        heroLead:
          'Textos curtos sobre operação real de escritório: prioridade, transparência com o cliente e o que costuma quebrar quando tudo gira em mensagens soltas.',
        post1meta: 'Operação · 8 min',
        post1h2:
          'Como reduzir retrabalho quando o WhatsApp é o “sistema” do escritório',
        post1p1:
          'Quando o inbox vira backlog sem dono, a equipe técnica reabre o mesmo arquivo três vezes porque ninguém sabe qual era a última decisão válida. O primeiro passo não é ferramenta nova por si só: é definir o que conta como “entrada fechada” em cada tipo de obra e quem fecha.',
        post1p2:
          'Listas rápidas de verificação por fase (projeto, compatibilização, canteiro) reduzem ida e volta de WhatsApp que não adiciona informação. O Zira encaixa nessa lógica ao manter histórico e prioridade visíveis para quem executa, sem depender de print em grupo.',
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
          'Se o WhatsApp é o sistema, o mínimo viável para SEO operacional é: um dono por conversa até fechar escopo; histórico pesquisável; e prioridade explícita. Ferramentas como o Zira sustentam isso ao ligar inbox a etapa da obra sem exigir que o time mude de canal da noite para o dia.',
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
        footerCr: '© M2 SCALE',
        footerSite: 'Site principal',
        tocTitle: 'Nesta página',
        tocAriaLabel: 'Artigos nesta página',
        toc1: 'Retrabalho e WhatsApp como “sistema”',
        toc2: 'Gestão à vista antes do drama com o cliente',
        toc3: 'Jornada do lead até a obra',
        toc4: 'Priorização da caixa de entrada',
        toc5: 'LGPD para escritório e mensagens',
      },
      adminPage: {
        metaTitle: 'Painel · Leads · M2SCALE',
        metaDesc:
          'Visualize solicitações de contato enviadas pela landing ZIRA AI. Acesso restrito.',
        ogTitle: 'Painel · Leads · M2SCALE',
        ogDesc: 'Solicitações de agendamento e dados de contato.',
        twitterTitle: 'Painel · Leads · M2SCALE',
        twitterDesc: 'Solicitações de contato · M2SCALE.',
        brand: 'M2 SCALE',
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
      },
    },
    en: {
      meta: {
        title: 'M2SCALE · Platform for Architecture & Engineering Firms',
        description:
          'M2SCALE · Client intake, staffing, projects, and deadlines aligned for architecture & engineering firms: from WhatsApp to the field.',
        ogTitle: 'M2SCALE · Platform for Architecture & Engineering Firms',
        ogDescription:
          'Aligns intake, team, projects, and timelines. Real world firm operations from WhatsApp to the site, with clarity and predictability.',
        twitterTitle: 'M2SCALE · Firm Operations Platform',
        twitterDescription:
          'Aligned intake, staffing, jobs, and deadlines for architecture & engineering studios.',
      },
      nav: {
        brandAria: 'M2 SCALE · Home',
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
          'The platform that organizes client intake, staffing, jobs, and deadlines for architecture and engineering offices.',
        counterLabel: 'firms have moved to clearer operations with ZIRA AI',
        sr:
          'ZIRA AI, operations for architecture & engineering. Over 100 firms have moved to clearer, integrated, more predictable work.',
        proof:
          'Over 100 firms have moved to clearer, integrated, more predictable operations.',
      },
      zira: {
        desc:
          'On WhatsApp, Zira understands each request, separates commercial opportunities from other topics, prioritizes what needs the team’s attention, and frames context so every touchpoint moves forward with clarity. When a reply should not be automated, it routes the case correctly, with no noise and no guesswork.',
        imageAlt: '',
      },
      problem: {
        title: 'The pain is not only lead gen. It is losing grip on execution.',
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
        imageAlt: 'Mobilized inquiries and tasks inside Zira AI',
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
        s2Title: 'ZIRA AI organizes the demand',
        s2Body:
          'Even when language is fuzzy ZIRA reshapes chatter into workable scope so one loose thread converts into actionable context.',
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
        ziraMascotAlt: 'ZIRA AI',
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
          'Direct answers about rollout, privacy, execution, and how Zira adapts to the real rhythms of your office.',
        q1: 'Does ZIRA replace my studio WhatsApp line?',
        a1:
          'No: you keep WhatsApp exactly where prospects already ping you. ZIRA organizes leads, sequencing, and history on top of that same channel so no one hunts screenshots or buried groups.',
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
          'Zira maps to how your studio actually behaves: scopes, milestones, responsibilities, and priorities tuned during onboarding. No single rigid template for everyone: there’s a shared backbone for intake and builds that aligns with your current playbook.',
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
        logoAlt: 'ZIRA AI',
      },
      cta: {
        title:
          'Move ahead on operations without giving up what already works in your firm.',
        desc:
          'On the call, you see where you gain clarity and predictability. We walk through how Zira fits your current procedures and how we adapt stages, roles, and flows to your team’s routine, so you can decide with confidence.',
        btn: 'Book a call',
      },
      footer: {
        navAria: 'Footer navigation',
        contentAria: 'Footer content links',
        opsAria: 'Footer operations links',
        brand: 'M2 SCALE',
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
        copy: '© 2026 M2 SCALE · ZIRA AI. All rights reserved.',
        privacy: 'Privacy & data',
        terms: 'Commercial terms',
      },
      wa: {
        aria: 'Chat with ZIRA AI on WhatsApp',
        message: 'Hello! I would like to talk about ZIRA AI.',
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
        intro: 'Hello! I’d like to book a conversation about ZIRA AI.',
        lineName: 'Name',
        lineEmail: 'Email',
        linePhone: 'Phone',
        lineCompany: 'Company',
        ariaCloseOverlay: 'Close',
      },
      schema: {
        organizationName: 'M2 SCALE',
        softwareDesc:
          'Platform that aligns intake, staffing, projects, and deadlines for architecture and engineering firms, with WhatsApp native orchestration.',
      },
      blogPage: {
        metaTitle:
          'M2SCALE Blog · Architecture firm ops, WhatsApp discipline & field coordination',
        metaDesc:
          'Operational articles for AE firms: rework when chat is HQ, telemetry before crises, client pacing, backlog ownership, lightweight compliance. Readable guidance for principals running real builds.',
        ogTitle:
          'M2SCALE Blog · Studio operations without noisy inboxes',
        ogDesc:
          'Stories on rework, leadership telemetry, stakeholder alignment and pragmatic privacy workflows for multidisciplinary teams.',
        twitterTitle:
          'M2SCALE Blog · Architecture & engineering ops',
        twitterDesc:
          'Operational insight for principals: intake priority, WhatsApp workflows, mobilization pacing and compliance-lite habits.',
        navBrandAria: 'M2 SCALE · homepage',
        navBack: '← Back to site',
        heroTitle: 'Blog',
        heroLead:
          'Notes on grounded studio mechanics: sequencing work, projecting calm to owners, and what breaks fastest when chats become your source of truth.',
        post1meta: 'Operations · 8 min',
        post1h2:
          'Shrinking rework when WhatsApp doubles as headquarters',
        post1p1:
          'When inbound noise never gets an owner, the technical loop reopens CAD four times because nobody trusts which decision was definitive. Fixing that is rarely “more tools”; it starts with naming what qualifies as locked scope per job archetype, and who seals it.',
        post1p2:
          'Snippet checklists aligned to schematic, coordination, and field phases kill loops that chew bandwidth without conveying new clarity. That is the muscle ZIRA preserves with visible history plus priority for whoever executes, not screenshot archaeology.',
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
          'When WhatsApp is your control tower the minimum credible rigor is owned threads until scope settles, searchable history and explicit sequencing. Stacks like Zira bridge inbox to milestone without forcing crews to ditch the channel overnight.',
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
        footerCr: '© M2 SCALE',
        footerSite: 'Main website',
        tocTitle: 'On this page',
        tocAriaLabel: 'Articles on this page',
        toc1: 'Rework when WhatsApp is HQ',
        toc2: 'Telemetry before client drama',
        toc3: 'Lead journey into execution',
        toc4: 'Inbox triage discipline',
        toc5: 'Privacy for studios + chats',
      },
      adminPage: {
        metaTitle: 'Dashboard · Leads · M2SCALE',
        metaDesc:
          'View contact requests captured from the ZIRA AI landing. Restricted area.',
        ogTitle: 'Dashboard · Leads · M2SCALE',
        ogDesc: 'Appointment requests and captured contact fields.',
        twitterTitle: 'Dashboard · Leads · M2SCALE',
        twitterDesc: 'Contact submissions · M2SCALE.',
        brand: 'M2 SCALE',
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
    var orgName = S.organizationName || 'M2 SCALE';

    var graph = [
      {
        '@type': 'Organization',
        '@id': 'https://www.zira.ai/#organization',
        name: orgName,
        url: 'https://www.zira.ai/',
        logo: 'https://www.zira.ai/assets/logo-preta.png',
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
        name: 'ZIRA AI',
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