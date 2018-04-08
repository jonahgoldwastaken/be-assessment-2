function displayPicture ({ currentTarget: input }) {
    const file = input.files[0]
    if (file.type.split('/')[0] !== 'image') return
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.addEventListener('load', () => {
        input.nextElementSibling.innerHTML = `<img src="${reader.result}" role="presentation" class="form-group__image">`
        input.nextElementSibling.classList.add('filled')
    })
}

export default function imageUpload () {
    const picker = document.querySelector('[data-image-upload]')
    if (picker) {
        picker.classList.add('enabled')
        const input = picker.querySelector('input')
        input.addEventListener('change', displayPicture)
    }
}
