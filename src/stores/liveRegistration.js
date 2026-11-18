import { defineStore } from 'pinia'
import { createAuthorizedDeviceApi } from '@/utils/serverUrl'
import { raiseIfDeviceApiError } from '@/utils/deviceErrors'
import { ref } from 'vue'
import { useEventyayApi } from '@/stores/eventyayapi'

export const useLiveRegistrationStore = defineStore('liveRegistration', () => {
  const products = ref([])
  const isLoadingProducts = ref(false)
  const isRegistering = ref(false)
  const productsLoaded = ref(false)

  function createApiClient() {
    const processApi = useEventyayApi()
    processApi.refreshServerUrl()
    return createAuthorizedDeviceApi(processApi.url, processApi.apitoken, {
      Accept: 'application/json',
      'Content-Type': 'application/json'
    })
  }

  function getApiContext() {
    const processApi = useEventyayApi()
    return { organizer: processApi.organizer, eventSlug: processApi.eventSlug }
  }

  async function fetchProducts({ force = false } = {}) {
    if (productsLoaded.value && !force) {
      return products.value
    }

    isLoadingProducts.value = true

    try {
      const { organizer, eventSlug } = getApiContext()
      const api = createApiClient()
      const response = await api.get(
        `/api/v1/organizers/${organizer}/events/${eventSlug}/products/`
      )

      const fetchedProducts = Array.isArray(response?.results) ? response.results : []
      products.value = fetchedProducts.filter(
        (product) => product?.active !== false && product?.admission !== false
      )
      productsLoaded.value = true
      return products.value
    } catch (err) {
      raiseIfDeviceApiError(err, useEventyayApi())
      throw err
    } finally {
      isLoadingProducts.value = false
    }
  }

  function restoreProductsFromSnapshot(snapshotProducts) {
    if (!Array.isArray(snapshotProducts) || !snapshotProducts.length) {
      return
    }
    products.value = snapshotProducts
    productsLoaded.value = true
  }

  async function registerAndMarkPaid() {
    // Disabled until upstream Eventyay order/payment API is independently
    // verified with server-owned idempotency and issuer-authorized entitlements.
    // Never write an unverified payment status or create ambiguous orders.
    throw new Error('Ticket registration requires verified online server issuance and payment authorization.')
  }

  return {
    products,
    isLoadingProducts,
    isRegistering,
    productsLoaded,
    fetchProducts,
    restoreProductsFromSnapshot,
    registerAndMarkPaid
  }
})
