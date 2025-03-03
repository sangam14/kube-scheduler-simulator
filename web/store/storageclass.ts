import { reactive } from '@nuxtjs/composition-api'
import {
  applyStorageClass,
  deleteStorageClass,
  getStorageClass,
  listStorageClass,
} from '~/api/v1/storageclass'
import {
  V1StorageClass,
  V1StorageClassList,
  V1Pod,
  V1PodList,
} from '@kubernetes/client-node'

type stateType = {
  selectedStorageClass: selectedStorageClass | null
  storageclasses: V1StorageClass[]
}

type selectedStorageClass = {
  // isNew represents whether this is a new StorageClass or not.
  isNew: boolean
  item: V1StorageClass
  resourceKind: string
}

export default function storageclassStore() {
  const state: stateType = reactive({
    selectedStorageClass: null,
    storageclasses: [],
  })

  return {
    get storageclasses() {
      return state.storageclasses
    },

    get count(): number {
      return state.storageclasses.length
    },

    get selected() {
      return state.selectedStorageClass
    },

    select(n: V1StorageClass | null, isNew: boolean) {
      if (n !== null) {
        state.selectedStorageClass = {
          isNew: isNew,
          item: n,
          resourceKind: 'SC',
        }
      }
    },

    resetSelected() {
      state.selectedStorageClass = null
    },

    async fetchlist() {
      state.storageclasses = (await listStorageClass()).items
    },

    async apply(
      n: V1StorageClass,

      onError: (msg: string) => void
    ) {
      await applyStorageClass(n, onError)
      await this.fetchlist()
    },

    async fetchSelected() {
      if (
        state.selectedStorageClass?.item.metadata?.name &&
        !this.selected?.isNew
      ) {
        const s = await getStorageClass(
          state.selectedStorageClass.item.metadata.name
        )
        this.select(s, false)
      }
    },

    async delete(name: string) {
      await deleteStorageClass(name)
      await this.fetchlist()
    },
  }
}

export type StorageClassStore = ReturnType<typeof storageclassStore>
