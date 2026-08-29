import { actions, isInputError } from 'astro:actions'

export default function newsletterFormListener(
    selector = '[data-newsletter-form]',
) {
    document.querySelectorAll<HTMLFormElement>(selector).forEach((form) => {
        const error = form.querySelector<HTMLElement>('.error')

        const showError = (message: string) => {
            if (!error) return

            error.textContent = message
            error.hidden = message === ''
        }

        const submit = async () => {
            const { error: actionError } = await actions.newsletter(
                new FormData(form),
            )

            if (isInputError(actionError)) {
                if (actionError.fields.email_address) {
                    showError(actionError.fields.email_address.join(', '))
                }
            } else {
                showError('')
                // do something
            }
        }

        form.addEventListener('submit', (event) => {
            event.preventDefault()
            void submit()
        })
    })
}
