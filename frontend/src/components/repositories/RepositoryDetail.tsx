'use client';

import { useCallback, useState } from 'react';

import { useTypingHandler } from '@/hooks/useTypingHandler';
import type { FileItem, TypingStatus } from '@/types';
import { updateFileItemInTree } from '@/utils/file-item';
import { Card } from '../ui/card';
import Loading from '../ui/loading';
import CongratulationModal from './CongratulationModal';
import FileTree from './FileTree';
import TypingPanel from './TypingPanel';

type RepositoryDetailProps = {
  initialFileItems: FileItem[];
};

export default function RepositoryDetail({ initialFileItems }: RepositoryDetailProps) {
  const [fileItems, setFileItems] = useState<FileItem[]>(initialFileItems);
  const [selectedFileItem, setSelectedFileItem] = useState<FileItem | undefined>();
  const [typingStatus, setTypingStatus] = useState<TypingStatus>('ready');
  const [isLoading, setIsLoading] = useState(false);
  const [showCongratulationModal, setShowCongratulationModal] = useState(false);

  const handleRepositoryCompleted = useCallback(() => {
    setShowCongratulationModal(true);
  }, []);

  const typingHandler = useTypingHandler({
    typingStatus,
    fileItem: selectedFileItem,
    onRepositoryCompleted: handleRepositoryCompleted,
    setFileItems,
    setTypingStatus,
  });

  const handleFileSelect = async (selectedFileItem: FileItem) => {
    if (typingStatus === 'typing') {
      const confirmSwitch = window.confirm(
        'Are you sure you want to switch files? The data you are typing will be lost.',
      );
      if (!confirmSwitch) {
        return;
      }
    }

    setIsLoading(true);

    const setupFileItem = await typingHandler.setupTypingState(selectedFileItem.id);
    const updatedFileItem = setupFileItem || selectedFileItem;
    setSelectedFileItem(updatedFileItem);
    setFileItems((prevFileItems) => updateFileItemInTree(prevFileItems, updatedFileItem));

    switch (updatedFileItem.status) {
      case 'unsupported':
        setTypingStatus('unsupported');
        break;
      case 'typing':
        setTypingStatus('paused');
        break;
      case 'typed':
        setTypingStatus('completed');
        break;
      default:
        setTypingStatus('ready');
        break;
    }
    setIsLoading(false);
  };

  return (
    <div className="flex h-full flex-col">
      <div className="flex flex-1 overflow-hidden">
        <div className="w-1/4 min-w-[250px] overflow-y-auto border-r p-2">
          <FileTree fileItems={fileItems} selectedFileItem={selectedFileItem} onSelectFileItem={handleFileSelect} />
        </div>

        <div className="flex min-w-0 flex-1 flex-col">
          <Card className="mx-4 my-2 flex-1 overflow-hidden">
            {isLoading ? (
              <Loading text="Loading file..." />
            ) : typingHandler.errorMessage ? (
              <div className="p-6 text-center">{typingHandler.errorMessage}</div>
            ) : !selectedFileItem ? (
              <div className="p-6 text-center">Select a file to start typing.</div>
            ) : (
              <TypingPanel fileItem={selectedFileItem} typingHandler={typingHandler} />
            )}
          </Card>
        </div>
      </div>

      <CongratulationModal isOpen={showCongratulationModal} onClose={() => setShowCongratulationModal(false)} />
    </div>
  );
}
