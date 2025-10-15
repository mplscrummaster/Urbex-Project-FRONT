import { driver } from 'driver.js'
import 'driver.js/dist/driver.css'
import '@/styles/base/tutorial.scss'
import { useUsersStore } from '@/stores/users'

export function useTutorial() {
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
          element: '.p-explore-map__map',
          popover: {
            title: 'Carte interactive',
            description:
              'Voici la carte principale. Tu peux zoomer, déplacer et explorer les communes.',
            side: 'top',
          },
        },

        {
          element: '.p-explore-map__overlay',
          popover: {
            title: 'Recherche',
            description:
              'Tu peux chercher une commune ou un code postal ici pour aller directement à un endroit précis.',
            side: 'right',
            align: 'center',
          },
        },
        {
          element: '.p-explore-map__map',
          popover: {
            title: 'Chercher de scénario',
            description:
              'Sélectionnes une commune, pour voir les scénarios qui apparaissent dans une liste.',
            side: 'top',
            align: 'center',
          },
        },
        {
          element: '.c-bottom-drawer__content',
          popover: {
            title: 'Liste des scénarios',
            description: 'Voici la liste des scénarios de la commune choisie.',
            side: 'right',
          },
        },
        {
          element: '.c-scenario-card__bookmark-icon',
          popover: {
            title: 'Bookmark',
            description:
              'Tu peux bookmarker un scénario et souregarder dans tes scénarios favoris.',
            side: 'right',
          },
        },
        {
          element: '.c-bottom-drawer__content', // final message
          popover: {
            title: 'Choisir un scénario',
            description: 'Choisis un scénario et commence ton exploration !',
            side: 'center',
          },
        },
      ]
    }

    if (page === 'scenario_detail') {
      steps = [
        {
          element: '.p-scenario-detail__title',
          popover: {
            title: 'Titre du scénario',
            description: 'Voici le titre du scénario actuellement sélectionné.',
            side: 'bottom',
            align: 'center',
          },
        },
        {
          element: '.p-scenario-detail__bookmark-btn',
          popover: {
            title: 'Favoris',
            description: 'Cliquez ici pour ajouter ou retirer le scénario de vos favoris.',
            side: 'left',
          },
        },
        {
          element: '.c-collapsible-card--intro',
          popover: {
            title: 'Introduction',
            description: 'Lis l’introduction du scénario avant de commencer.',
            side: 'bottom',
          },
        },
        {
          element: '.c-collapsible-card__btn--primary',
          popover: {
            title: 'Button',
            description: 'Commencer le scénario !',
            side: 'bottom',
          },
        },
        {
          element: '.p-scenario-detail__missions',
          popover: {
            title: 'Missions',
            description:
              'Voici la liste des missions du scénario. Certaines peuvent être verrouillées jusqu’à ce que vous complétiez les précédentes.',
            side: 'top',
          },
        },
        {
          element: '.c-collapsible-card--outro',
          popover: {
            title: 'Conclusion',
            description:
              'Une fois toutes les missions terminées, vous pourrez voir la conclusion du scénario.',
            side: 'top',
          },
        },
        {
          element: '.p-scenario-detail__play-btn',
          popover: {
            title: 'Commencer/Continuer',
            description: 'Clique ici pour démarrer ou reprendre le scénario sur la carte.',
            side: 'bottom',
          },
        },
      ]
    }

    if (page === 'game_map') {
      steps = [
        {
          popover: {
            title: 'Carte du jeu',
            description:
              'Bienvenue sur la carte du jeu ! Ici, tu peux voir ta position et les missions du scénario en cours.',
            side: 'center',
          },
        },
        {
          element: '.p-game-map__map',
          popover: {
            title: 'Carte interactive',
            description:
              'Voici la carte principale du scénario. Dezoomer le map et trouvez les markers de missions',
            side: 'top',
            align: 'center',
          },
        },
        {
          element: '.mission-marker',
          popover: {
            title: 'Marqueurs de missions',
            description:
              'Chaque marqueur représente une mission. Les missions verrouillées sont grisées, les terminées ont une coche.',
            side: 'top',
          },
        },
        {
          element: '.p-game-map__map',
          popover: {
            title: 'Mission',
            description:
              'Clique sur une mission pour ouvrir sa fiche et commencer ou continuer ta progression.',
            side: 'top',
          },
        },
        {
          element: '.p-game-map__locate',
          popover: {
            title: 'Localisation',
            description:
              'Ce bouton te permet de te recentrer sur ta position actuelle à tout moment',
            side: 'left',
          },
        },
        {
          element: '.p-game-map__overlay',
          popover: {
            title: 'Fiche du scénario',
            description:
              'Tu peux voir ici un résumé du scénario en cours ainsi que la progression de tes missions',
            side: 'left',
          },
        },
        {
          element: '.leaderboard',
          popover: {
            title: 'Experience system',
            description:
              "Pour chaques missions, tu peux recevoir de l'exp. Plus tu avances, plus tu gagnes d'exp ! Tu peux aussi voir les meilleurs joueurs de chaque scénario.",
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
          element: '.leaderboard', // fallback
          popover: {
            title: 'Navigation',
            description: 'Vous pouvez scroller pour voir les autres joueurs dans le classement.',
            side: 'left',
            align: 'center',
          },
        },
        {
          element: '.user-profile',
          popover: {
            title: 'Ton profil',
            description: 'Cliquez ici pour voir ton profil personnel et les détails',
            side: 'center',
          },
        },
      ]
    }

    if (page === 'user_profile') {
      steps = [
        {
          popover: {
            title: 'Bienvenue sur ton profil !',
            description:
              'Ici, tu peux consulter les informations de ton compte et voir ton niveau de progression.',
            side: 'bottom',
            align: 'center',
          },
        },
        {
          element: '.profile__content',
          popover: {
            title: 'Ta carte de profil',
            description:
              'Ici s’affichent ton nom, ton photo de profil et ton niveau de progression liées à ton compte.',
            side: 'top',
            align: 'center',
          },
        },
        {
          element: '.profile__addFriendBtn',
          popover: {
            title: 'Ajouter un ami',
            description: 'Clique ici pour ajouter un ami de l’application.',
            side: 'top',
            align: 'center',
          },
        },
        {
          element: '.profile__deleteFriendBtn',
          popover: {
            title: 'Supprimer un ami',
            description: 'Clique ici pour supprimer un ami de l’application.',
            side: 'top',
            align: 'center',
          },
        },
        {
          element: '.btn-logout',
          popover: {
            title: 'Se déconnecter',
            description:
              'Clique ici pour te déconnecter de l’application et revenir à la page d’accueil.',
            side: 'top',
            align: 'center',
          },
        },
        {
          popover: {
            title: 'Fin du tutoriel',
            description:
              'Tu connais maintenant les bases de la page de profil. Continue ton exploration ! 🚀',
            side: 'center',
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
      overlayOpacity: 0.75,
      stagePadding: 6,
      steps,
      allowClose: true,
      onPopoverRender: (popover) => {
        if (popover.title.textContent === 'Carte globale') {
          popover.nextButton.style.display = 'none'
        } else if (popover.title.textContent === 'Choisir un scénario') {
          popover.nextButton.style.display = 'none'
        } else if (popover.title.textContent === 'Commencer/Continuer') {
          popover.nextButton.style.display = 'none'
        } else if (popover.title.textContent === 'Experience system') {
          popover.nextButton.style.display = 'none'
        } else if (popover.title.textContent === 'Ton profil') {
          popover.nextButton.style.display = 'none'
        } else if (popover.title.textContent === 'Fin du tutoriel') {
          popover.nextButton.style.display = 'block'
          popover.nextButton.textContent = 'Terminer' // змінюємо текст
          //demander a users.setStartTutorial(false)
          const users = useUsersStore()
          users.setStartTutorialToFalseApi()
          localStorage.removeItem('StartTutorial')
        }
      },
    })

    d.drive() // start the tutorial
  }

  const autoTutorial = async (page) => {
    const newUser = Number(localStorage.getItem('StartTutorial'))
    console.log('newUser', newUser)
    console.log('newUser === 1', newUser === 1)

    if (newUser === 1) {
      console.log('start tutorial')

      startTutorial(page)
      //demander a users.setStartTutorial(true)
    }
  }

  return { startTutorial, autoTutorial }
}
