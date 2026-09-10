# Tombola du Japon 🌸

Application web de tirage au sort sur le thème du Japon (dojo & sakura), pensée
pour être projetée devant un public. On dépose un fichier Excel/CSV de
participants, et une roulette façon machine à sous tire une personne au sort à
chaque tour.

SPA statique (React + TypeScript + Vite), à déployer tel quel sur un CDN
(Cloudflare Pages, etc.).

## Fonctionnalités

- **Dépôt de fichier** par glisser-déposer ou clic (`.xlsx`, `.xls`, `.csv`).
  La colonne « Nom / Name / Participant… » est détectée automatiquement, sinon
  la première colonne est utilisée. Doublons et ligne d'en-tête ignorés.
- **Roulette machine à sous** : colonnes de kanji / hiragana / katakana qui
  défilent, puis panneau central qui révèle le nom du gagnant.
- **Tirage sans remise** : une personne tirée est retirée du pool, on ne peut
  pas la retirer une seconde fois. On tire autant de fois qu'on veut.
- **Réinitialiser** (remet tout le monde dans le pool) ou **changer de
  fichier**.
- Direction artistique dojo : nuit indigo, laque & or, pluie de pétales de
  cerisier. Titres en typographies japonisantes.

> Les lots ne sont pas gérés dans cette première itération : on tire des
> personnes, c'est tout.

## Développement

```bash
npm install
npm run dev          # serveur de dev
npm run build        # build statique -> dist/
npm run preview      # prévisualise le build

npm run lint         # oxlint
npm run typecheck    # tsc --noEmit
npm run format       # prettier --write
```

Un fichier `participants-exemple.xlsx` est fourni à la racine pour tester
rapidement.

## Déploiement

Le build produit un dossier `dist/` 100 % statique (les chemins d'assets sont
relatifs, cf. `base: './'` dans `vite.config.ts`). Le parsing Excel (SheetJS)
est chargé à la demande via un `import()` dynamique, donc le payload initial
reste léger.

Sur Cloudflare Pages : build command `npm run build`, output directory `dist`.
