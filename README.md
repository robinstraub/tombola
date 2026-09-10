# Tombola du Japon 🌸

> **⚠️ Entièrement _vibe codé_.** Ce dépôt a été produit intégralement au
> prompt, en pair-programming avec un agent IA. Ce n'est pas un exemple de mon
> code « à la main » et ce n'est pas représentatif de mes compétences — juste
> un petit projet fait pour le plaisir et pour aller vite.

Application web de tirage au sort sur le thème du Japon, pensée pour être
projetée devant un public. On dépose un fichier Excel/CSV de participants, et
une roulette façon machine à sous tire une personne au sort à chaque tour.

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
- **Vitesse réglable** : un curseur sous le bouton principal ajuste la durée du
  spin de la roulette (de ~0,5 s à ~3,2 s).
- **Liste des gagnants** en panneau latéral, dans l'ordre du tirage.
- Direction artistique en registre encre & bois sur fond de jardin japonais
  peint à l'aquarelle (torii, pavillon, esprits), pluie de pétales de cerisier.

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

Des fichiers d'exemple (`public/participants-exemple.xlsx` et `.csv`) sont
fournis pour tester rapidement, et téléchargeables directement depuis l'écran
d'accueil via « Télécharger un fichier d'exemple ».

## Déploiement

Le build produit un dossier `dist/` 100 % statique (les chemins d'assets sont
relatifs, cf. `base: './'` dans `vite.config.ts`). Le parsing Excel (SheetJS)
est chargé à la demande via un `import()` dynamique, donc le payload initial
reste léger.

Sur Cloudflare Pages : build command `npm run build`, output directory `dist`.
