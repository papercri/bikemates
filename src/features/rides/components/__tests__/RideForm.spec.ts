import { mount, RouterLinkStub } from '@vue/test-utils'
import { defineComponent, nextTick } from 'vue'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { RideFormValues } from '../../types'
import MeetingPointPicker from '../MeetingPointPicker.vue'
import RideForm from '../RideForm.vue'

const MeetingPointPickerStub = defineComponent({
  name: 'MeetingPointPicker',
  props: { initialValue: { type: String, default: '' } },
  emits: ['select'],
  template: '<div data-stub="meeting-point-picker" />',
})

function futureDate(daysFromNow = 7): string {
  const date = new Date(Date.now() + daysFromNow * 24 * 60 * 60 * 1000)
  const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60_000)

  return localDate.toISOString().slice(0, 16)
}

function validValues(overrides: Partial<RideFormValues> = {}): RideFormValues {
  return {
    title: 'Vuelta por Collserola',
    description: 'Recorrido sencillo por pista forestal con parada de café.',
    startsAt: futureDate(),
    meetingPoint: 'Plaça de l’Església, Barcelona',
    latitude: 41.4,
    longitude: 2.17,
    bikeType: 'gravel',
    level: 'Intermedio',
    distanceKm: '30',
    elevationM: '300',
    durationMinutes: '120',
    wikilocUrl: '',
    audience: 'everyone',
    maxParticipants: '',
    isCircular: true,
    ...overrides,
  }
}

function mountForm(props?: Record<string, unknown>) {
  return mount(RideForm, {
    props: {
      initialValues: validValues(),
      isSubmitting: false,
      errorMessage: null,
      ...props,
    },
    global: {
      stubs: { MeetingPointPicker: MeetingPointPickerStub, RouterLink: RouterLinkStub },
    },
  })
}

function fileInput(wrapper: ReturnType<typeof mountForm>) {
  return wrapper.get('input#ride-image')
}

function fieldValue(wrapper: ReturnType<typeof mountForm>, selector: string): string {
  return wrapper.get<HTMLInputElement | HTMLSelectElement>(selector).element.value
}

function selectFile(wrapper: ReturnType<typeof mountForm>, file: File): void {
  Object.defineProperty(fileInput(wrapper).element, 'files', {
    value: [file],
    configurable: true,
  })
}

/** El envío exige aceptar las normas de la comunidad. */
async function acceptRules(wrapper: ReturnType<typeof mountForm>): Promise<void> {
  await wrapper.get('#acceptedRules').setValue(true)
}

describe('RideForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders the four editorial sections with their fields', () => {
    const wrapper = mountForm()

    const legends = wrapper.findAll('legend').map((legend) => legend.text())
    expect(legends).toEqual([
      'Datos básicos',
      'Recorrido',
      'Detalles de la salida',
      'Imagen de portada',
    ])

    expect(fieldValue(wrapper, '#title')).toBe('Vuelta por Collserola')
    expect(fieldValue(wrapper, '#distanceKm')).toBe('30')
    expect(fieldValue(wrapper, '#bikeType')).toBe('gravel')
    expect(fieldValue(wrapper, '#level')).toBe('Intermedio')
    expect(fieldValue(wrapper, '#audience')).toBe('everyone')
  })

  it('emits a valid submission with the current values and no image', async () => {
    const wrapper = mountForm()

    await acceptRules(wrapper)
    await wrapper.get('form').trigger('submit')

    const emitted = wrapper.emitted('submit')
    expect(emitted).toHaveLength(1)
    expect(emitted?.[0]?.[0]).toMatchObject({
      values: expect.objectContaining({ title: 'Vuelta por Collserola', distanceKm: '30' }),
      image: null,
      removeCurrentImage: false,
    })
  })

  it('submits the route type from the circular switch', async () => {
    const wrapper = mountForm()

    await wrapper.get('#routeType').setValue(false)
    await acceptRules(wrapper)
    await wrapper.get('form').trigger('submit')

    expect(wrapper.emitted('submit')?.[0]?.[0]).toMatchObject({
      values: expect.objectContaining({ isCircular: false }),
    })
  })

  it('blocks the submission and explains the first validation error', async () => {
    const wrapper = mountForm({ initialValues: validValues({ distanceKm: '0' }) })

    await acceptRules(wrapper)
    await wrapper.get('form').trigger('submit')

    expect(wrapper.emitted('submit')).toBeUndefined()
    expect(wrapper.get('[role="alert"]').text()).toBe('La distancia debe estar entre 0 y 1000 km.')
  })

  it('shows each field error next to its control and a summary by the button', async () => {
    const wrapper = mountForm({
      initialValues: validValues({ title: 'abc', distanceKm: '0' }),
    })

    await acceptRules(wrapper)
    await wrapper.get('form').trigger('submit')

    expect(wrapper.emitted('submit')).toBeUndefined()

    // Error junto a cada campo, asociado al control.
    expect(wrapper.get('#title-error').text()).toBe(
      'El título debe tener entre 5 y 100 caracteres.',
    )
    expect(wrapper.get('#distanceKm-error').text()).toBe(
      'La distancia debe estar entre 0 y 1000 km.',
    )
    expect(wrapper.get('#title').attributes('aria-invalid')).toBe('true')
    expect(wrapper.get('#distanceKm').attributes('aria-invalid')).toBe('true')

    // El resumen junto al botón muestra el primer error en orden de visualización.
    expect(wrapper.get('[role="alert"]').text()).toBe(
      'El título debe tener entre 5 y 100 caracteres.',
    )
  })

  it('clears the validation error as soon as the form is edited', async () => {
    const wrapper = mountForm({ initialValues: validValues({ distanceKm: '0' }) })

    await acceptRules(wrapper)
    await wrapper.get('form').trigger('submit')
    expect(wrapper.find('[role="alert"]').exists()).toBe(true)

    await wrapper.get('#distanceKm').setValue('25')
    expect(wrapper.find('[role="alert"]').exists()).toBe(false)
  })

  it('shows the server error reported by the parent', () => {
    const wrapper = mountForm({ errorMessage: 'No se ha podido publicar la ruta.' })

    expect(wrapper.text()).toContain('No se ha podido publicar la ruta.')
  })

  it('ignores the submit while the parent is already submitting', async () => {
    const wrapper = mountForm({ isSubmitting: true })

    await acceptRules(wrapper)
    await wrapper.get('form').trigger('submit')

    expect(wrapper.emitted('submit')).toBeUndefined()
  })

  it('switches the submit label between create and edit modes', () => {
    const create = mountForm()
    const edit = mountForm({ mode: 'edit' })

    expect(create.get('button[type="submit"]').text()).toBe('Publicar ruta')
    expect(edit.get('button[type="submit"]').text()).toBe('Guardar cambios')
  })

  it('shows the busy labels and disables the button while submitting', () => {
    const create = mountForm({ isSubmitting: true })
    const edit = mountForm({ isSubmitting: true, mode: 'edit' })

    expect(create.get('button[type="submit"]').text()).toBe('Publicando…')
    expect(edit.get('button[type="submit"]').text()).toBe('Guardando…')
    expect(create.get('button[type="submit"]').attributes('disabled')).toBeDefined()
  })

  it('updates the meeting point coordinates when the picker emits a place', async () => {
    const wrapper = mountForm({ initialValues: validValues({ latitude: null, longitude: null }) })

    await wrapper.getComponent(MeetingPointPicker).vm.$emit('select', {
      id: '123',
      label: 'Monistrol de Montserrat',
      latitude: 41.7633,
      longitude: 1.8428,
    })

    expect(wrapper.text()).toContain('Punto seleccionado: Monistrol de Montserrat')

    await acceptRules(wrapper)
    await wrapper.get('form').trigger('submit')

    const payload = wrapper.emitted('submit')?.[0]?.[0]
    expect(payload).toMatchObject({
      values: expect.objectContaining({
        meetingPoint: 'Monistrol de Montserrat',
        latitude: 41.7633,
        longitude: 1.8428,
      }),
    })
  })

  it('clears the meeting point when the picker emits a null place', async () => {
    const wrapper = mountForm()

    await wrapper.getComponent(MeetingPointPicker).vm.$emit('select', null)
    await acceptRules(wrapper)
    await wrapper.get('form').trigger('submit')

    expect(wrapper.emitted('submit')).toBeUndefined()
    expect(wrapper.get('[role="alert"]').text()).toBe(
      'Busca y selecciona un punto de encuentro válido.',
    )
  })

  it('counts the description characters as they grow', async () => {
    const wrapper = mountForm({ initialValues: validValues({ description: 'Corta' }) })

    expect(wrapper.text()).toContain('5/8000')

    await wrapper.get('#description').setValue('Recorrido por pista forestal.')
    expect(wrapper.text()).toContain('29/8000')
  })

  it('blocks the submission and surfaces the image error', async () => {
    const wrapper = mountForm()

    selectFile(wrapper, new File(['x'], 'mal.gif', { type: 'image/gif' }))
    await fileInput(wrapper).trigger('change')

    expect(wrapper.text()).toContain('Selecciona una imagen JPEG, PNG, WebP o AVIF.')

    await acceptRules(wrapper)
    await wrapper.get('form').trigger('submit')

    expect(wrapper.emitted('submit')).toBeUndefined()
    expect(fileInput(wrapper).attributes('aria-invalid')).toBe('true')
  })

  it('previews the current image in edit mode and removes it on demand', async () => {
    const wrapper = mountForm({
      mode: 'edit',
      initialImageUrl: 'https://cdn.example/antigua.png',
    })

    expect(wrapper.get('img').attributes('src')).toBe('https://cdn.example/antigua.png')

    const removeButton = wrapper
      .findAll('button')
      .find((button) => button.text().includes('Quitar imagen'))

    if (!removeButton) {
      throw new Error('Falta el botón de quitar imagen.')
    }

    await removeButton.trigger('click')

    expect(wrapper.find('img').exists()).toBe(false)

    await acceptRules(wrapper)
    await wrapper.get('form').trigger('submit')

    expect(wrapper.emitted('submit')?.[0]?.[0]).toMatchObject({ removeCurrentImage: true })
  })

  it('emits the selected image with the submission', async () => {
    URL.createObjectURL = vi.fn<() => string>(() => 'blob:preview-1')
    URL.revokeObjectURL = vi.fn<() => void>()

    const wrapper = mountForm()
    const file = new File(['x'], 'portada.png', { type: 'image/png' })

    selectFile(wrapper, file)
    await fileInput(wrapper).trigger('change')
    await acceptRules(wrapper)
    await wrapper.get('form').trigger('submit')

    expect(wrapper.emitted('submit')?.[0]?.[0]).toMatchObject({ image: file })
  })

  it('opens the community rules and privacy dialogs from the consent links', async () => {
    const wrapper = mount(RideForm, {
      props: { initialValues: validValues(), isSubmitting: false, errorMessage: null },
      global: {
        stubs: { MeetingPointPicker: MeetingPointPickerStub, RouterLink: RouterLinkStub },
      },
      attachTo: document.body,
    })

    const consentButtons = wrapper.findAll('button')
    const rules = consentButtons.find((button) => button.text().includes('normas de la comunidad'))
    const privacy = consentButtons.find((button) =>
      button.text().includes('política de privacidad'),
    )

    await rules!.trigger('click')
    await nextTick()
    expect(document.querySelector('[role="dialog"]')?.textContent).toContain(
      'Normas de la comunidad',
    )

    document.querySelector<HTMLElement>('[data-dialog-close]')?.click()
    await nextTick()

    await privacy!.trigger('click')
    await nextTick()
    expect(document.querySelector('[role="dialog"]')?.textContent).toContain(
      'Política de privacidad',
    )

    wrapper.unmount()
  })

  it('syncs the local copy when the parent replaces the initial values', async () => {
    const wrapper = mountForm()

    await wrapper.setProps({ initialValues: validValues({ title: 'Ruta reeditada' }) })

    expect(fieldValue(wrapper, '#title')).toBe('Ruta reeditada')
  })
})
