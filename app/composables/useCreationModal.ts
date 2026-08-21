type CreationModalType = 'brief' | 'checklist'

export const useCreationModal = () => {
  const activeType = useState<CreationModalType | null>('creation-modal-type', () => null)
  const editingId = useState<string | null>('creation-modal-editing-id', () => null)

  const openCreationModal = (type: CreationModalType) => {
    activeType.value = type
    editingId.value = null
  }

  const openEditModal = (type: CreationModalType, id: string) => {
    activeType.value = type
    editingId.value = id
  }

  const closeCreationModal = () => {
    activeType.value = null
    editingId.value = null
  }

  return {
    activeType,
    editingId,
    openCreationModal,
    openEditModal,
    closeCreationModal
  }
}
