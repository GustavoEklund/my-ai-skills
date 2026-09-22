---
name: humanizing-pt-br
description: |
  Rewrite AI-sounding Brazilian Portuguese so it reads like the writer without changing
  what it says. Applies the humanizer method with the tells Portuguese actually produces:
  gerúndio riders, "vale ressaltar" staging, "faz-se necessário" formality, stock words,
  and English constructions calqued into Portuguese. Use when editing or reviewing prose
  written in Portuguese.
metadata:
  boundary: humanizer covers English prose; this covers Brazilian Portuguese and replaces the patterns that do not survive the language change.
---

Call the Skill tool with "humanizer" first, then apply the substitutions below.

Everything procedural there carries over unchanged: the four steps, the rule that
a writing sample overrides the patterns, the ban on adding a fact the source does
not have, and the "when not to act" guardrail. Only the surface changes, because
the tells are habits of a language and Portuguese has its own.

## What does not survive the language change

| Pattern | Why it does not transfer | Use instead |
| --- | --- | --- |
| §10 hyphenated pairs | Portuguese does not stack compound modifiers before a noun | nothing, drop it |
| §12 overused AI words | the list is English vocabulary; direct translations are not the Portuguese tells | P3 |
| §15 shallow -ing riders | the construction is English grammar | P1 |
| §18 avoiding is, are, has | inverted in Portuguese: the tell is reaching *past* `é` for something more formal | P5 |
| §20 decorative headings | the title-case half does not apply; Portuguese headings are sentence case | P9 |
| §21 curly quotation marks | weaker signal, and `«»` is a legitimate Portuguese convention | judgement |

The other nineteen patterns apply as written. §1 through §9, §11, §13, §14,
§16, §17, §19, §22 through §25 are habits of structure, not of English.

## Portuguese tells

Numbered by strength, same convention as the source. P1 through P4 justify an
edit on one sighting. The rest are *weak alone*.

### P1. Gerúndio riders

A clause hung off the main sentence with a gerund, adding consequence instead of
fact. The strongest tell in Portuguese model prose.

> O sistema valida o token, **garantindo que apenas usuários autenticados
> acessem o recurso**.

Cut it, or make it its own sentence with a subject: *Só usuários autenticados
passam da validação.* Watch for `garantindo`, `permitindo`, `proporcionando`,
`possibilitando`, `resultando em`, `fazendo com que`.

### P2. Staging with "vale ressaltar"

An announcement that something matters, standing in for the thing that matters.

> **Vale ressaltar que** o cache expira em 60 segundos.

Delete the opener and keep the fact. Same for `é importante destacar/notar`,
`cabe mencionar`, `não podemos deixar de mencionar`, `é fundamental entender
que`.

### P3. Stock Portuguese AI words

Current rather than permanent, the same way §12 is. Weigh each against the
sentence; several in one passage is the signal.

`no cenário atual`, `nos dias de hoje`, `desempenha um papel crucial`, `de forma
eficaz`, `solução robusta`, `ferramenta poderosa`, `ampla gama`, `vasta gama`,
`rico ecossistema`, `abordagem`, `alavancar`, `otimizar` (when it means only
"improve"), `transformador`, `revolucionário`, `mergulhar fundo`, `aprofundar-se
em`, `em suma`, `por fim, mas não menos importante`.

### P4. "Não apenas X, mas também Y"

The Portuguese form of §1. Same treatment: state Y, drop the contrast, unless
the reader would actually have assumed X.

> A API **não apenas** valida o payload, **mas também** registra a tentativa.

→ *A API valida o payload e registra a tentativa.*

### P5. Reaching past "é" for something more formal

Inverted from §18. The model avoids the plain copula by climbing into
bureaucratic register.

`faz-se necessário` → *é preciso*. `trata-se de` → *é*. `consiste em` → *é*.
`pode-se observar que` → *veja que*, or just state it. `o mesmo` / `a mesma` used
as a pronoun (*o usuário faz login e **o mesmo** é redirecionado*) → *ele*, or
repeat the noun.

### P6. English calqued into Portuguese *(weak alone)*

`no final do dia` (at the end of the day), `em termos de` (in terms of), `isso é
porque` (that's because), `fazer a diferença`, `dar uma olhada mais profunda`,
`entregar valor`. Each is grammatical Portuguese, which is why they slip
through; together they read as translation.

### P7. "Além disso" opening every paragraph *(weak alone)*

`Além disso`, `Ademais`, `Outrossim`, `Por outro lado` used as connective tissue
rather than because the relation holds. Act only when the connector repeats
across paragraphs **and** the writing sample does not use it. Some writers chain
clauses this way on purpose: see [voice-sample.md](voice-sample.md).

### P8. Nominalization *(weak alone)*

A verb turned into a noun and propped up with a light verb.

> **a realização da implementação** do módulo → *implementar o módulo*
> **efetuar o processamento** dos dados → *processar os dados*

### P9. Title Case In Portuguese Headings *(weak alone)*

An English habit applied to a language that does not have it. Portuguese
headings take sentence case: only the first word and proper nouns.

### P10. "De forma / de maneira + adjetivo" *(weak alone)*

`de forma eficiente` → *com eficiência*, or an `-mente` adverb, or nothing. Do
not convert a writer's own `-mente` adverbs into this shape; the traffic runs
one way.

### P11. "Tanto ... quanto" triads *(weak alone)*

The Portuguese surface of §6. Three parallel items where two carry the meaning.

## Voice

If the user gives a sample, it wins, exactly as in the source skill.

Without one, and when the text is the repository owner's own writing,
[voice-sample.md](voice-sample.md) holds a sample of it and the habits to leave
alone. Anyone else should give their own: applying one writer's voice to another
writer's text is the failure this skill is supposed to prevent.
