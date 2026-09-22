# Avaliações de imóveis

Cada subpasta é uma avaliação independente e vira uma URL própria:

`/diagnostico/nome-do-imovel/`

Para adicionar uma nova avaliação:

1. Duplique a pasta `casa-capricornio`.
2. Renomeie a cópia com o slug do imóvel, sem espaços ou acentos (ex.: `casa-verde`).
3. Substitua o `report.pdf` dentro da cópia, mantendo esse nome.
4. Edite somente o `report.json` dentro da cópia para alterar título, textos e rodapé.
5. Faça commit e publique.

Exemplo de URL final: `https://pegorarostudio.com/diagnostico/casa-verde/`.

O código da página, o CSS e o leitor de PDF não precisam ser alterados.
