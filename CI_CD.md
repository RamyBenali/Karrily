Pour la partie CI/CD et sécurité de Karrily, on a mis en place un pipeline automatique avec **GitHub Actions**. 

L'idée c'est qu'à chaque fois qu'on pousse du code, GitHub lance une série de vérifications :
1. **Sécurité** : On utilise `npm audit` pour checker les failles dans les dépendances et un plugin de sécurité dans **ESLint** pour repérer les mauvaises pratiques dans le code.
2. **Tests** : On a installé **Vitest** pour faire nos tests unitaires. On l'a choisi parce que c'est super rapide et que ça s'intègre parfaitement avec Vite (qu'on utilise déjà pour le frontend).
3. **Qualité** : On a configuré le linter pour qu'il vérifie le style et les erreurs potentielles avant que ça parte en prod.

Ça permet d'être sûr que le projet est stable et que rien n'est cassé quand on ajoute des nouvelles fonctionnalités.
