import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { ClonedContextNode } from '../../../../common/types';
import ContentScript from '../../../../contentScript/content-script';
import { useDataStore } from '../store/useDataStore';

type ContextTypeTree = {
  value: string;
  title: string;
  children: ContextTypeTree[];
};

function extractContextTypesTree(nodes: ClonedContextNode[]): ContextTypeTree[] {
  const map = new Map<string, ClonedContextNode[]>();

  for (const node of nodes) {
    if (!map.has(node.contextType)) {
      map.set(node.contextType, []);
    }

    node.children?.forEach((child) => map.get(node.contextType)!.push(child));
  }

  return Array.from(map.entries()).map(([contextType, children]) => ({
    value: contextType,
    title: contextType,
    children: extractContextTypesTree(children),
  }));
}

export const useContextTree = () => {
  const [contextTypes, setContextTypes] = useState<string[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [currentItem, setCurrentItem] = useState<ClonedContextNode | null>(null);
  
  // Sử dụng zustand store thay vì useState
  const { selectedData, toggleItem, isSelected } = useDataStore();

  const { data: contextTree } = useQuery({
    queryFn: ContentScript.getContextTree,
    queryKey: ['getContextTree'],
    initialData: null,
    refetchInterval: 1000,
  });

  const contextTypesTree = contextTree 
    ? extractContextTypesTree([contextTree]) 
    : [];

  const handleContextTypeChange = (value: unknown, _labelList: React.ReactNode[], _extra: any) => {
    setContextTypes(value as string[]);
  };

  const openItemDetails = (node: ClonedContextNode, e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentItem(node);
    setModalVisible(true);
  };

  return {
    contextTree,
    contextTypes,
    contextTypesTree,
    selectedData,
    modalVisible,
    currentItem,
    handleContextTypeChange,
    openItemDetails,
    toggleSelectItem: toggleItem,
    isSelected,
    setModalVisible,
  };
}; 