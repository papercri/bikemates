import { effectScope } from 'vue'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useRideImagePicker } from './useRideImagePicker'

const originalCreateObjectURL = URL.createObjectURL
const originalRevokeObjectURL = URL.revokeObjectURL

function setupPicker(initialImageUrl: string | null = null) {
  const scope = effectScope()

  const picker = scope.run(() => useRideImagePicker(() => initialImageUrl))

  if (!picker) {
    throw new Error('No se ha podido crear el picker en el scope de prueba')
  }

  return { picker, dispose: () => scope.stop() }
}

function fileInputWith(file: File | null): HTMLInputElement {
  const input = document.createElement('input')
  input.type = 'file'

  Object.defineProperty(input, 'files', {
    configurable: true,
    value: file ? [file] : [],
  })

  return input
}

function changeImage(
  handleImageChange: (event: Event) => void,
  file: File | null,
): HTMLInputElement {
  const input = fileInputWith(file)
  const event = new Event('change')

  input.dispatchEvent(event)
  handleImageChange(event)

  return input
}

function imageFile(type: string): File {
  return new File(['contenido'], 'portada', { type })
}

describe('useRideImagePicker', () => {
  let previewCounter = 0

  beforeEach(() => {
    previewCounter = 0
    URL.createObjectURL = () => `blob:preview-${++previewCounter}`
    URL.revokeObjectURL = vi.fn<(objectURL: string) => void>()
  })

  afterEach(() => {
    URL.createObjectURL = originalCreateObjectURL
    URL.revokeObjectURL = originalRevokeObjectURL
    vi.restoreAllMocks()
  })

  it('selects a valid image and exposes its preview', () => {
    const { picker } = setupPicker()

    changeImage(picker.handleImageChange, imageFile('image/png'))

    expect(picker.selectedImage.value).not.toBeNull()
    expect(picker.imagePreviewUrl.value).toBe('blob:preview-1')
    expect(picker.imageError.value).toBeNull()
    expect(picker.removeCurrentImage.value).toBe(false)
  })

  it('rejects an invalid image and keeps the previous selection', () => {
    const { picker } = setupPicker()

    changeImage(picker.handleImageChange, imageFile('image/gif'))

    expect(picker.imageError.value).toBe('Selecciona una imagen JPEG, PNG, WebP o AVIF.')
    expect(picker.selectedImage.value).toBeNull()
    expect(picker.imagePreviewUrl.value).toBeNull()
  })

  it('ignores the event when no file is selected', () => {
    const { picker } = setupPicker()

    changeImage(picker.handleImageChange, null)

    expect(picker.selectedImage.value).toBeNull()
    expect(picker.imageError.value).toBeNull()
  })

  it('restores the current image when a newly selected image is cleared', () => {
    const { picker } = setupPicker('https://cdn.example.com/actual.jpg')

    changeImage(picker.handleImageChange, imageFile('image/png'))
    picker.clearSelectedImage()

    expect(picker.selectedImage.value).toBeNull()
    expect(picker.imagePreviewUrl.value).toBeNull()
    expect(picker.removeCurrentImage.value).toBe(false)
    expect(picker.currentImageVisible.value).toBe(true)
  })

  it('flags the current image for removal when it is cleared without a new file', () => {
    const { picker } = setupPicker('https://cdn.example.com/actual.jpg')

    picker.clearSelectedImage()

    expect(picker.removeCurrentImage.value).toBe(true)
    expect(picker.currentImageVisible.value).toBe(false)
  })

  it('revokes the preview object URL when the scope is disposed', () => {
    const { picker, dispose } = setupPicker()

    changeImage(picker.handleImageChange, imageFile('image/webp'))
    dispose()

    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:preview-1')
    expect(picker.imagePreviewUrl.value).toBeNull()
  })
})
