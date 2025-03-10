import { create } from 'zustand';
import { ClonedContextNode } from '../../../../common/types';

interface DataState {
  selectedData: ClonedContextNode[];
  addItem: (item: ClonedContextNode) => void;
  removeItem: (id: string) => void;
  toggleItem: (item: ClonedContextNode) => void;
  clearItems: () => void;
  isSelected: (id: string) => boolean;
}

export const useDataStore = create<DataState>((set, get) => ({
  selectedData: [],
  
  addItem: (item) => 
    set((state) => ({
      selectedData: [...state.selectedData, item]
    })),
  
  removeItem: (id) => 
    set((state) => ({
      selectedData: state.selectedData.filter(item => item.id !== id)
    })),
  
  toggleItem: (item) => {
    const isItemSelected = get().isSelected(item.id!);
    if (isItemSelected) {
      get().removeItem(item.id!);
    } else {
      get().addItem(item);
    }
  },
  
  clearItems: () => set({ selectedData: [] }),
  
  isSelected: (id) => {
    if (!id) return false;
    return get().selectedData.some(item => item.id === id);
  },
})); 