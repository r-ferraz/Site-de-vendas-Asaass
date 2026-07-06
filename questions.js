// Versão 2.1 - Atualização de codificação
window.akinQuestions = [
    {
        id: 'objetivos',
        type: 'multiple',
        question: 'O que você mais deseja alcançar com a perda de peso?',
        description: 'Selecione todas as opções que se aplicam',
        options: [
            'Melhorar minha saúde geral',
            'Prevenir problemas de saúde',
            'Me sentir melhor com meu corpo',
            'Aumentar meu nível de energia',
            'Melhorar minha saúde mental',
            'Dormir melhor e ter mais disposição'
        ]
    },
    {
        id: 'tratamento_anterior',
        type: 'single',
        question: 'Você já fez algum tratamento médico para emagrecer antes?',
        options: ['Sim', 'Não']
    },
    {
        id: 'tentativas_anteriores',
        type: 'multiple',
        question: 'O que você já tentou para emagrecer?',
        options: [
            'Dieta por conta própria',
            'Exercício físico',
            'Contagem de calorias',
            'Apps de emagrecimento',
            'Nutricionista',
            'Nenhuma das anteriores'
        ]
    },
    {
        id: 'tempo_tentativa',
        type: 'single',
        question: 'Há quanto tempo você tenta emagrecer de forma consistente?',
        options: [
            'Menos de 1 ano',
            'De 1 a 5 anos',
            'De 5 a 10 anos',
            'A vida toda'
        ]
    },
    {
        id: 'desafios',
        type: 'multiple',
        question: 'Quais são seus maiores desafios hoje?',
        options: [
            'Efeito sanfona',
            'Falta de tempo',
            'Dificuldade em manter a rotina',
            'Metabolismo lento',
            'Fome constante',
            'Ansiedade descontada na comida'
        ]
    },
    {
        id: 'contato',
        type: 'input_group',
        question: 'Como podemos falar com você?',
        inputs: [
            { label: 'Nome Completo', type: 'text', id: 'nome', placeholder: 'Seu nome completo' },
            { label: 'WhatsApp', type: 'tel', id: 'whatsapp', placeholder: '(00) 00000-0000' },
            { label: 'E-mail', type: 'email', id: 'email', placeholder: 'seu@email.com' }
        ]
    },
    {
        id: 'data_nasc',
        type: 'input',
        question: 'Qual sua data de nascimento?',
        inputType: 'date',
        placeholder: 'dd/mm/aaaa'
    },
    {
        id: 'sexo',
        type: 'single',
        question: 'Qual seu sexo biológico?',
        options: ['Masculino', 'Feminino']
    },
    {
        id: 'medidas',
        type: 'input_group',
        question: 'Quais suas medidas atuais?',
        inputs: [
            { label: 'Peso (kg)', type: 'number', id: 'peso', placeholder: 'ex: 85' },
            { label: 'Altura (cm)', type: 'number', id: 'altura', placeholder: 'ex: 175' }
        ]
    },
    {
        id: 'target',
        type: 'single',
        question: 'Você tem um peso alvo que deseja alcançar?',
        options: ['Sim', 'Não']
    },
    {
        type: 'input',
        question: 'Qual sua meta de peso (kg)?',
        inputType: 'number',
        id: 'meta_peso',
        placeholder: 'ex: 70',
        condition: (data) => data.target === 'Sim'
    },
    {
        id: 'saude_historico',
        type: 'multiple_grid',
        question: 'Você possui ou já possuiu alguma destas condições?',
        options: [
            'Diabetes Tipo 2',
            'Pancreatite',
            'Pedra na vesícula',
            'Câncer de tireoide',
            'Distúrbios alimentares',
            'Nenhuma das anteriores'
        ]
    },
    {
        id: 'bariatrica',
        type: 'single',
        question: 'Já realizou cirurgia bariátrica?',
        options: ['Sim', 'Não']
    },
    {
        id: 'preferencia',
        type: 'single',
        question: 'O que é mais importante para você no tratamento?',
        options: [
            'Minimizar efeitos colaterais',
            'Maximizar a perda de peso',
            'Equilíbrio entre ambos'
        ]
    }
];
