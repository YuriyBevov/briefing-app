type CreationModalType = 'brief' | 'checklist'

export const useCreationModal = () => {
  const activeType = useState<CreationModalType | null>('creation-modal-type', () => null)

  const openCreationModal = (type: CreationModalType) => {
    activeType.value = type
  }

  const closeCreationModal = () => {
    activeType.value = null
  }

  return {
    activeType,
    openCreationModal,
    closeCreationModal
  }
}
