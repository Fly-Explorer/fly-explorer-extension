import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ParserConfig } from '../../../../core';
import ContentScript from '../../../../contentScript/content-script';
import { getNameFromId } from '../../../../utils';

export const useParser = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isCodeEditorOpened, setIsCodeEditorOpened] = useState(false);

  const { data: parsers } = useQuery({
    queryKey: ['getSuitableParserConfigs'],
    queryFn: ContentScript.getSuitableParserConfigs,
    refetchInterval: 1000,
  });

  const { mutate: saveLocalParserConfig, isPending: isLocalParserSaving } = useMutation({
    mutationFn: ContentScript.saveLocalParserConfig,
  });

  const { isPending: isElementPicking, mutateAsync: pickElement } = useMutation({
    mutationFn: ContentScript.pickElement,
  });

  const { isPending: isParserDeleting, mutateAsync: deleteParser } = useMutation({
    mutationFn: (pcId: string) => ContentScript.deleteParser(pcId),
    onSuccess: () => {
      queryClient
        .invalidateQueries({ queryKey: ['getSuitableParserConfigs'] })
        .then(() => navigate('/'));
    },
  });

  const { isPending: isParserImproving, mutateAsync: improveParserConfig } = useMutation({
    mutationFn: ({ pc, html }: { pc: ParserConfig; html: string }) =>
      ContentScript.improveParserConfig(pc, html),
  });

  const handlePickElementClick = async () => {
    if (!parsers?.length) return;
    const pc = parsers[0];
    const html = await pickElement();
    if (!html) return;
    await improveParserConfig({ html, pc });
  };

  const handleDeleteParserClick = async () => {
    if (!parsers?.length) return;
    const pc = parsers[0];
    await deleteParser(pc.id);
  };

  const toggleCodeEditor = () => {
    setIsCodeEditorOpened((val) => !val);
  };

  const getParserName = () => {
    if (!parsers?.length) return 'Parser';
    const parser = parsers[0];
    return parser.name
      ? parser.name
      : parser.title
        ? parser.title
        : parser.id
          ? getNameFromId(parser.id)
          : 'Parser';
  };

  return {
    parsers,
    isCodeEditorOpened,
    isLocalParserSaving,
    isElementPicking,
    isParserDeleting,
    isParserImproving,
    saveLocalParserConfig,
    handlePickElementClick,
    handleDeleteParserClick,
    toggleCodeEditor,
    getParserName,
  };
}; 