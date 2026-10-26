# Isekai Chronicle RPG — Criador de Fichas

Site estático responsivo para criar, editar, salvar, importar e exportar fichas de personagem do Isekai Chronicle RPG.

## Recursos

- Identidade do personagem, raça, ocupação, background e nível 1–100.
- Seis atributos com base 8, 15 pontos iniciais e modificadores calculados.
- Campo separado para bônus adicionais de atributo.
- PV, PM, PE, Postura e Evasão Passiva editáveis.
- Seleção das 33 Naturalidades e opção separada de Magia de Mana.
- Até 3 títulos armazenados e apenas 1 equipado.
- Registro de habilidades, perícias, magias, equipamento e notas de campanha.
- Cálculo automático de PM a partir do PAC: `max(1, ceil(PAC / 2))`.
- Salvamento local no navegador, exportação/importação JSON e impressão/Salvar como PDF.
- Layout responsivo para desktop e celular.

## Rodar localmente

1. Extraia o ZIP.
2. Abra `index.html` no navegador.

Não precisa instalar dependências nem executar um servidor.

## Publicar gratuitamente

### Opção A — GitHub Pages

1. Crie uma conta em [GitHub](https://github.com/), se ainda não tiver.
2. Crie um repositório público, por exemplo `isekai-chronicle-fichas`.
3. Envie `index.html`, `styles.css` e `app.js` para a raiz do repositório (o `README.md` também pode ser enviado).
4. Abra **Settings → Pages**.
5. Em **Build and deployment**, selecione **Deploy from a branch**, escolha `main` e `/ (root)`, depois salve.
6. Aguarde o deploy. O GitHub exibirá o endereço público da página nas configurações de Pages.

### Opção B — Vercel

1. Crie uma conta em [Vercel](https://vercel.com/).
2. Importe o repositório GitHub que contém estes arquivos.
3. Use as configurações padrão para site estático; não há comando de build nem diretório de saída especial.
4. Clique em **Deploy**. A Vercel fornecerá o endereço público.

## Armazenamento e limites importantes

Esta versão não tem servidor ou banco de dados. As fichas ficam no `localStorage` do navegador e não são sincronizadas entre dispositivos nem compartilhadas com o mestre. Use **Exportar JSON** para criar backups e **Importar JSON** para restaurá-los.

Para um sistema multiusuário com login, fichas sincronizadas e compartilhamento entre jogador e mestre, será necessário adicionar backend e autenticação (por exemplo, Supabase ou Firebase).

## Regras e automações

A interface registra as regras já estabelecidas e automatiza modificadores e PM calculado por PAC. Recursos raciais, progressão de PV/PE/PM/Postura, acesso a Tiers, custos completos de magias e bônus de equipamentos continuam editáveis, pois precisam de tabelas oficiais completas para serem calculados com segurança. O site não inventa esses valores.

## Arquivos

- `index.html` — estrutura e campos.
- `styles.css` — tema dark fantasy responsivo.
- `app.js` — cálculos, persistência, importação/exportação e interações.
