# Changelog

Todas as mudanças relevantes deste projeto são registradas neste arquivo.

O formato segue [Keep a Changelog](https://keepachangelog.com/pt-BR/1.1.0/) e o
versionamento segue [Semantic Versioning](https://semver.org/lang/pt-BR/). O
que conta como MAJOR, MINOR e PATCH está definido em [CLAUDE.md](CLAUDE.md).

## [Unreleased]

## [0.1.0] - 2026-09-21

### Added

- `grilling`: entrevista em rodadas que pressiona um plano ou design até não
  sobrar decisão implícita. Modela o trabalho como grafo de decisões, pergunta
  a fronteira inteira de uma vez com recomendação em cada pergunta, e fecha com
  um resumo separando o que ficou decidido, assumido e em aberto.
- `grill-me`: atalho de usuário (`/grill-me`) que delega para `grilling`.
- `authoring-skills`: procedimento para adicionar, dividir, renomear ou
  aposentar skills sem criar sobreposição com as que já existem.
- Lint (`npm run lint`) sobre frontmatter, unicidade de nomes, regras de
  atalho, tamanho de corpo, links, profundidade de referências, manifesto do
  plugin, consistência de versão, formato do changelog e similaridade entre
  descriptions.
- Índice gerado (`npm run index`) em `CLAUDE.md` e `README.md`, com
  `npm run index:check` no CI para impedir que ele fique desatualizado.
- Publicação como plugin do Claude Code, com o próprio repositório servindo de
  marketplace.

[unreleased]: https://github.com/GustavoEklund/my-ai-skills/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/GustavoEklund/my-ai-skills/releases/tag/v0.1.0
