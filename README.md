# domovní čísla

Statický web — malovaná domovní čísla. Bez buildu, React se načítá z esm.sh.

## Struktura

```
index.html          vstup webu
css/styles.css      globální styly
js/app.js           aplikace (React + htm)
js/data.js          data vzorů + pomocné funkce
assets/cisla/       fotky čísel (nN.webp)
assets/icons/       favicony
assets/portret.png
design/             zdrojový návrh (.dc.html), není součástí webu
```

## Lokálně

```sh
python3 -m http.server 8000
# http://localhost:8000
```

(Přes `file://` nefunguje — ES moduly potřebují server.)

## Nasazení

GitHub Pages z větve `main`, složka `/ (root)`.
