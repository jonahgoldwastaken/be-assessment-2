function openMenu ({ currentTarget: button }) {
    if (button.dataset.overflow === 'closed') {
        const menu = button.querySelector('[data-overflow-menu]')
        button.dataset.overflow = 'open'
        menu.classList.remove('hide')
    }
}

function closeMenu (button) {
    const menu = button.querySelector('[data-overflow-menu]')
    button.dataset.overflow = 'closed'
    menu.classList.add('hide')
}

export default function overflowMenu () {
    const button = document.querySelector('[data-overflow]')
    if (button) {
        const fallback = document.querySelector('[data-overflow-fallback]')
        const links = Array.from(fallback.children)
        button.insertAdjacentHTML('beforeend', `
        <ul class="overflow hide" data-overflow-menu>
        ${links.map(link =>
        `<li class="overflow__item"><a href=${link.href}>${link.dataset.title}</a></li>`).join('')}
        </ul>
        `)
        document.body.addEventListener('click', ({ target }) => {
            if ((target !== button && target !== (button.children[0])) && button.dataset.overflow === 'open')
                closeMenu(button)
        })
        button.addEventListener('click', openMenu)
        fallback.remove()
    }
}
