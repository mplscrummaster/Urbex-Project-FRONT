// src/composables/useTutorial.js
import { driver } from 'driver.js'
import 'driver.js/dist/driver.css'

export function useTutorial() {
  const startTutorial = (type) => {
    const d = driver({
      showProgress: true,
      nextBtnText: 'Suivant →',
      prevBtnText: '← Précédent',
      doneBtnText: 'Terminer',
      overlayOpacity: 0.75,
      stagePadding: 6,
      allowClose: true,
    })

    // You can define multiple tutorials by "type"
    const stepsByType = {
      scenarios: [
        {
          element: '.p-scenarios__filters',
          popover: {
            title: 'Filtres',
            description:
              'Ici, tu peux filtrer les scénarios selon leur statut (terminés, commencés, etc.).',
            position: 'bottom',
          },
        },
        {
          element: '.p-scenarios__list',
          popover: {
            title: 'Liste des scénarios',
            description:
              'Voici tous tes scénarios bookmarkés. Clique sur un pour voir sa fiche détaillée.',
            position: 'top',
          },
        },
        {
          element: '.p-scenarios__section-title',
          popover: {
            title: 'Groupes de scénarios',
            description: 'Les scénarios sont regroupés par statut. "En cours", "Terminés", etc.',
            position: 'right',
          },
        },
      ],

      // Example: later, you can add another tutorial type
      profile: [
        {
          element: '.profile__avatar',
          popover: {
            title: 'Ton avatar',
            description: 'Clique ici pour modifier ton image de profil.',
            position: 'right',
          },
        },
      ],
    }

    if (!stepsByType[type]) {
      console.warn(`[useTutorial] Unknown tutorial type: "${type}"`)
      return
    }

    d.defineSteps(stepsByType[type])
    d.drive()
  }

  const autoTutorial = (type) => {
    const isNewUser = localStorage.getItem('StartTutorial') === 'true'
    if (isNewUser) {
      startTutorial(type)
      localStorage.setItem('StartTutorial', 'false')
    }
  }

  return { startTutorial, autoTutorial }
}
