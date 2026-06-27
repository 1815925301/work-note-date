import { ref, watch, type Ref } from 'vue'

export function useAutoSave<T>(
  source: Ref<T>,
  saveFn: (value: T) => Promise<void>,
  delay = 500
) {
  const saving = ref(false)
  const saved = ref(false)
  const error = ref<string | null>(null)
  let timer: ReturnType<typeof setTimeout> | null = null

  watch(
    source,
    (value) => {
      if (timer) clearTimeout(timer)
      saved.value = false
      timer = setTimeout(async () => {
        saving.value = true
        error.value = null
        try {
          await saveFn(value)
          saved.value = true
        } catch (e) {
          error.value = e instanceof Error ? e.message : String(e)
        } finally {
          saving.value = false
        }
      }, delay)
    },
    { deep: true }
  )

  return { saving, saved, error }
}
