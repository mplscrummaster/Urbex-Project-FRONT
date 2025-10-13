import { driver } from 'driver.js'
import 'driver.js/dist/driver.css'

export function useTutorial() {
  let index = 0
  const startTutorial = (page) => {
    // define steps here
    let steps = []

    if (page === 'scenarios') {
      steps = [
        {
          popover: {
            title: 'Bievenue',
            description: 'Bienvenue dans application de exploration urban !',
            side: 'bottom',
          },
        },
        {
          element: '.scenarios',
          popover: {
            title: 'Scenarios',
            description: 'Ici tu peux trouver la liste des scénarios bookmarkés.',
            side: 'bottom',
          },
        },
        {
          element: '.p-scenarios__filters',
          popover: {
            title: 'Filtres',
            description:
              'Ici, tu peux filtrer les scénarios selon leur statut (terminés, commencés, etc.).',
            side: 'bottom',
            align: 'start',
          },
        },
        {
          element: '.p-scenarios__list',
          popover: {
            title: 'Liste des scénarios',
            description: 'Voici tous tes scénarios bookmarkés.',
            side: 'top',
          },
        },
        {
          element: '.p-scenarios__section',
          popover: {
            title: 'Groupes de scénarios',
            description: 'Les scénarios sont regroupés par statut.',
            side: 'right',
          },
        },
        {
          element: '.global-map',
          popover: {
            title: 'Carte globale',
            description: 'Allons sur la carte globale pour trouver un scénario !',
            side: 'bottom',
          },
        },
      ]
    }

    if (page === 'global_map') {
      steps = [
        {
          element: '.p-explore-map__map', // main map container
          popover: {
            title: 'Carte interactive',
            description:
              'Voici la carte principale. Tu peux zoomer, déplacer et explorer les communes.',
            side: 'top',
          },
        },

        {
          element: '.p-explore-map__overlay', // the map overlay with search
          popover: {
            title: 'Recherche',
            description:
              'Tu peux chercher une commune ou un code postal ici pour aller directement à un endroit précis.',
            side: 'right',
          },
        },
        {
          element: '.p-explore-map__map', // bottom drawer (or .bottom-drawer if you have a stable selector)
          popover: {
            title: 'Tiroir de scénarios',
            description:
              'Quand tu sélectionnes une commune, les scénarios apparaissent dans une liste. Clique sur une commune pour l’ouvrir.',
            side: 'top',
          },
        },
        {
          element: '.p-explore-map__map', // final message
          popover: {
            title: 'À toi de jouer !',
            description: 'Explore la carte et découvre des scénarios autour de toi. 🌍',
            side: 'center',
          },
        },
      ]
    }

    if (page === 'leaderboard') {
      steps = [
        {
          element: '.leaderboard-bar', // main container
          popover: {
            title: 'Bar de navigation',
            description: 'Ici tu peux voir le classement des meilleurs joueurs global et amis.',
            side: 'bottom',
            align: 'center',
          },
        },
        {
          element: '.p-leaderboard__item',
          popover: {
            title: 'Top joueur',
            description: 'Cliquez ici pour voir le profil et les détails du top joueur.',
            side: 'top',
            align: 'center',
          },
        },
        {
          element: '.leaderboard', // fallback
          popover: {
            title: 'Navigation',
            description: 'Vous pouvez scroller pour voir les autres joueurs dans le classement.',
            side: 'left',
            align: 'center',
          },
        },
      ]
    }

    // Create driver instance with steps directly
    const d = driver({
      showProgress: true,
      nextBtnText: 'Suivant',
      prevBtnText: 'Precedent',
      doneBtnText: 'tamere',
      overlayOpacity: 0.75,
      stagePadding: 6,
      steps,
      allowClose: true,
      onPopoverRender: (popover) => {
        if (index === steps.length - 1) {
          // ici c'est le dernier popover
          popover.nextButton.style.display = 'none'
        }
        index++
      },
    })

    d.drive() // start the tutorial
  }

  const autoTutorial = (page) => {
    const newUser = localStorage.getItem('StartTutorial')
    if (newUser === 'true') {
      startTutorial(page)
    }
    if (page === 'user_profile' && newUser === 'true') {
      localStorage.setItem('StartTutorial', 'false')
    }
  }

  return { startTutorial, autoTutorial }
}
