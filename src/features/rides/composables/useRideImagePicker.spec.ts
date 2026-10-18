import { beforeEach, describe, expect, it, vi } from 'vitest'
import { effectScope, ref, type MaybeRefOrGetter } from 'vue'
import { useRideImagePicker } from './useRideImagePicker'

function imageFile(type = 'image/png', size = 1024): File {
  const file = new File(['contenido'], 'portada.png', { type })
  Object.defineProperty(file, 'size', { value: size })

  return file
}

function inputWithFile(file: File | null): HTMLInputElement {
  const input = document.createElement('input')
  input.type = 'file'
  Object.defineProperty(input, 'files', { value: file ? [file] : [], configurable: true })

  return input
}

/** Monta el composable en un scope propio para poder desmontarlo limpiamente. */
function setupPicker(initialImageUrl: MaybeRefOrGetter<string | null | undefined>) {
  const scope = effectScope()
  const picker = scope.run(() => useRideImagePicker(initialImageUrl))

  if (!picker) {
    throw new Error('No se ha podido crear el selector de imagen.')
  }

  return { ...picker, scope }
}

describe('useRideImagePicker', () => {
  const createObjectURL = vi.fn<() => string>(() => 'blob:preview-1')
  const revokeObjectURL = vi.fn<() => void>()

  beforeEach(() => {
    vi.clearAllMocks()
    URL.createObjectURL = createObjectURL
    URL.revokeObjectURL = revokeObjectURL
    createObjectURL.mockReturnValue('blob:preview-1')
  })

  it('accepts a valid file, previews it and resets the removal flag', () => {
    const { selectedImage, imagePreviewUrl, imageError, removeCurrentImage, handleImageChange } =
      setupPicker(() => 'https://cdn.example/antigua.png')

    removeCurrentImage.value = true
    const file = imageFile()
    handleImageChange({ target: inputWithFile(file) } as unknown as Event)

    expect(selectedImage.value).toBe(file)
    expect(imagePreviewUrl.value).toBe('blob:preview-1')
    expect(createObjectURL).toHaveBeenCalledWith(file)
    expect(imageError.value).toBeNull()
    expect(removeCurrentImage.value).toBe(false)
  })

  it('reports an invalid file without creating a preview', () => {
    const { selectedImage, imagePreviewUrl, imageError, handleImageChange } = setupPicker(null)

    handleImageChange({ target: inputWithFile(imageFile('image/gif')) } as unknown as Event)

    expect(selectedImage.value).toBeNull()
    expect(imagePreviewUrl.value).toBeNull()
    expect(imageError.value).toBe('Selecciona una imagen JPEG, PNG, WebP o AVIF.')
    expect(createObjectURL).not.toHaveBeenCalled()
  })

  it('ignores events without a file', () => {
    const { selectedImage, handleImageChange } = setupPicker(null)

    handleImageChange({ target: inputWithFile(null) } as unknown as Event)
    handleImageChange({ target: document.createElement('div') } as unknown as Event)

    expect(selectedImage.value).toBeNull()
    expect(createObjectURL).not.toHaveBeenCalled()
  })

  it('revokes the previous preview when a new file replaces it', () => {
    const { imagePreviewUrl, handleImageChange } = setupPicker(null)

    handleImageChange({ target: inputWithFile(imageFile()) } as unknown as Event)
    createObjectURL.mockReturnValue('blob:preview-2')
    handleImageChange({ target: inputWithFile(imageFile()) } as unknown as Event)

    expect(revokeObjectURL).toHaveBeenCalledWith('blob:preview-1')
    expect(imagePreviewUrl.value).toBe('blob:preview-2')
  })

  it('marks the current image for removal when clearing without a new file', () => {
    const { removeCurrentImage, currentImageVisible, clearSelectedImage } = setupPicker(
      () => 'https://cdn.example/antigua.png',
    )

    expect(currentImageVisible.value).toBe(true)

    clearSelectedImage()

    expect(removeCurrentImage.value).toBe(true)
    expect(currentImageVisible.value).toBe(false)
  })

  it('keeps the current image when a new selection is discarded', () => {
    const { removeCurrentImage, selectedImage, clearSelectedImage, handleImageChange } =
      setupPicker(() => 'https://cdn.example/antigua.png')

    handleImageChange({ target: inputWithFile(imageFile()) } as unknown as Event)
    clearSelectedImage()

    expect(selectedImage.value).toBeNull()
    expect(removeCurrentImage.value).toBe(false)
  })

  it('hides the current image while a removal is pending', () => {
    const initialImageUrl = ref<string | null>('https://cdn.example/antigua.png')
    const { currentImageVisible, removeCurrentImage } = setupPicker(initialImageUrl)

    removeCurrentImage.value = true
    expect(currentImageVisible.value).toBe(false)

    initialImageUrl.value = null
    expect(currentImageVisible.value).toBe(false)
  })

  it('revokes the object url when the owning scope is disposed', () => {
    const { imagePreviewUrl, handleImageChange, scope } = setupPicker(null)

    handleImageChange({ target: inputWithFile(imageFile()) } as unknown as Event)
    expect(imagePreviewUrl.value).toBe('blob:preview-1')

    scope.stop()

    expect(revokeObjectURL).toHaveBeenCalledWith('blob:preview-1')
    expect(imagePreviewUrl.value).toBeNull()
  })
})
