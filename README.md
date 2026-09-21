# my-ai-skills

Coleção pessoal de skills de agente do Gustavo Eklund. Uma skill por diretório,
versionadas em conjunto, validadas por lint e publicadas como plugin do Claude
Code.

> As skills carregam as minhas suposições, os meus caminhos e o meu jeito de
> trabalhar. Sirva-se como referência, mas prefira escrever as suas: skill
> copiada de outra pessoa vem com o contexto dela junto.

## Instalação

**Como plugin do Claude Code** (versão fixada, é o caminho recomendado):

```
/plugin marketplace add GustavoEklund/my-ai-skills
/plugin install gustavo-eklund-skills@gustavo-eklund-skills
```

**Por symlink** (loop de desenvolvimento, sempre a `main`):

```sh
git clone https://github.com/GustavoEklund/my-ai-skills.git ~/Projects/my-ai-skills
cd ~/Projects/my-ai-skills && npm install && npm run link
```

`npm run link` cria um symlink por skill em `~/.claude/skills` e
`~/.agents/skills`, então um `git pull` já atualiza tudo. Os harnesses leem o
`SKILL.md` na inicialização: reinicie o agente depois de adicionar uma skill.

## Skills

<!-- BEGIN SKILLS -->

### productivity

| Skill | Invocação | Descrição |
| --- | --- | --- |
| [`grill-me`](skills/productivity/grill-me/SKILL.md) | `/grill-me` | Starts a grilling session, a relentless round-based interview that pressure-tests a plan or design before any of it gets built. |
| [`grilling`](skills/productivity/grilling/SKILL.md) | model + `/grilling` | Interrogates the user about a plan, design, or decision until every branch is settled, asking batched rounds of numbered questions that each carry a recommended answer. Use when the user wants to pressure-test thinking before committing to it, or says grill me, poke holes in this, or challenge this plan. |

<!-- END SKILLS -->

Skills do bucket `meta/` não são publicadas no plugin. Elas existem só para
manter este repositório e carregam como project skills via `.claude/skills/`.

## Como o repositório funciona

O contrato completo está em [CLAUDE.md](CLAUDE.md): layout, buckets, campos de
frontmatter permitidos, a diferença entre skill de conteúdo e skill de atalho,
e as regras de versionamento.

O ponto que justifica o tooling: toda description é pré-carregada no system
prompt, então duas skills que disparam na mesma situação não são só desperdício
de contexto, são uma escolha ambígua para o modelo. Duas camadas cuidam disso:

- **`npm run lint`** valida frontmatter, unicidade de nomes, regras de atalho,
  tamanho de corpo, links, manifesto do plugin, consistência de versão, formato
  do changelog, e compara as descriptions entre si procurando redundância.
- **[`authoring-skills`](skills/meta/authoring-skills/SKILL.md)** é o
  julgamento que o script não consegue fazer: antes de criar uma skill, ela
  obriga a comparar a superfície de gatilho contra o índice e escolher entre
  estender, separar com fronteira declarada, ou extrair conteúdo comum.

`npm run index` regenera o índice deste README e do CLAUDE.md a partir do
sistema de arquivos, e `npm run index:check` (rodando no CI) falha se o índice
divergir. Índice desatualizado é pior que índice nenhum.

## Versionamento

[Semantic Versioning](https://semver.org/lang/pt-BR/) para a coleção inteira e
[Keep a Changelog](https://keepachangelog.com/pt-BR/1.1.0/) em
[CHANGELOG.md](CHANGELOG.md). MAJOR quando uma skill é removida, renomeada, ou
muda o contrato de invocação; MINOR quando uma skill nasce ou ganha capacidade;
PATCH quando só a redação muda.

`npm run release -- <major|minor|patch>` corta a versão, e o push da tag abre a
Release no GitHub com a seção do changelog como corpo.

## Créditos

- O método de [`grilling`](skills/productivity/grilling/SKILL.md) vem da skill
  de mesmo nome de [Matt Pocock](https://github.com/mattpocock/skills) (MIT),
  reescrita aqui. O par content/alias também é convenção dele.
- A ideia de manter um repositório único de skills com symlinks para vários
  harnesses vem do [my-skills do Fabio Akita](https://github.com/akitaonrails/my-skills).

## Licença

[MIT](LICENSE).
