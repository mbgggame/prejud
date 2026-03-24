// Template padrão de contrato - PreJud
// NÃO colocar lógica aqui, apenas texto com placeholders

export const SERVICE_AGREEMENT_TEMPLATE = `
CONTRATO DE PRESTAÇÃO DE SERVIÇOS

Este contrato foi formalizado por meio da plataforma PreJud, com registro digital e rastreabilidade de eventos.

CONTRATANTE:
Nome: {{client_name}}
CPF/CNPJ: {{client_document}}

CONTRATADO:
Nome: {{freelancer_name}}
CPF/CNPJ: {{freelancer_document}}

As partes acima identificadas têm entre si justo e acordado o presente contrato, que se regerá pelas cláusulas seguintes:

CLÁUSULA 1 – DO OBJETO
O presente contrato tem por objeto a prestação de serviços de:
{{service_description}}

CLÁUSULA 2 – DO PRAZO
Início: {{start_date}}
Término: {{end_date}}

CLÁUSULA 3 – DO VALOR E PAGAMENTO
O valor total é de R$ {{amount}}.

Forma de pagamento:
{{payment_terms}}

CLÁUSULA 4 – DAS OBRIGAÇÕES DO CONTRATADO
- Executar os serviços conforme acordado;
- Cumprir os prazos estabelecidos;
- Entregar os resultados combinados.

CLÁUSULA 5 – DAS OBRIGAÇÕES DO CONTRATANTE
- Fornecer informações necessárias;
- Efetuar pagamento conforme acordado;
- Aprovar ou solicitar ajustes dentro do prazo.

CLÁUSULA 6 – DAS REVISÕES
O contratante terá direito a {{revision_limit}} revisão(ões).

CLÁUSULA 7 – DA RESCISÃO
O contrato poderá ser rescindido por qualquer das partes, mediante comunicação prévia.

CLÁUSULA 8 – DA MULTA
Em caso de descumprimento, poderá ser aplicada multa de até 10% do valor do contrato.

CLÁUSULA 9 – DA CONFIDENCIALIDADE
As partes concordam em manter sigilo sobre informações trocadas.

CLÁUSULA 10 – DOS DIREITOS AUTORAIS
Os direitos sobre o serviço serão transferidos ao contratante após o pagamento integral.

CLÁUSULA 11 – DO FORO
Fica eleito o foro de {{city}}/{{state}}.

{{city}}, {{date}}

____________________________________
CONTRATANTE

____________________________________
CONTRATADO
`;