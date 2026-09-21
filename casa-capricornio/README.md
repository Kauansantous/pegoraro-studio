# Página editorial do imóvel

## O único arquivo que você edita

Abra `property.json`. Nele estão todos os textos, títulos, imagens, PDFs, botões, descrição do Google e rodapé desta página.

Para trocar uma foto, coloque o novo arquivo dentro de `images/` e altere somente o campo `src` correspondente no `property.json`.

Para trocar o PDF, copie o arquivo para esta pasta e altere `materials.guide.file` e `materials.book.file` no `property.json`. Os dois cartões podem apontar para o mesmo projeto completo ou para arquivos separados.

Para criar outro imóvel:

1. Duplique a pasta inteira.
2. Renomeie a pasta com o endereço desejado.
3. Edite somente `property.json`.
4. Coloque as fotos em `images/` e os dois PDFs na pasta do imóvel.

Não altere `index.html`, `style.css` nem os arquivos compartilhados em `assets/`.
