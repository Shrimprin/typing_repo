import axios from 'axios';
import { useSession } from 'next-auth/react';
import { useParams } from 'next/navigation';
import { Dispatch, SetStateAction, useCallback, useEffect, useState } from 'react';

import { FileItem, TypingStatus } from '@/types';
import { axiosPatch } from '@/utils/axios';
import { fetcher } from '@/utils/fetcher';
import { sortFileItems } from '@/utils/sort';

type useTypingHandlerProps = {
  typingStatus: TypingStatus;
  fileItem?: FileItem;
  setFileItems: Dispatch<SetStateAction<FileItem[]>>;
  setTypingStatus: (status: TypingStatus) => void;
};

export function useTypingHandler({ typingStatus, fileItem, setFileItems, setTypingStatus }: useTypingHandlerProps) {
  const [targetTextLines, setTargetTextLines] = useState<string[]>([]);
  const [cursorPositions, setCursorPositions] = useState<number[]>([]);
  const [typedTextLines, setTypedTextLines] = useState<string[]>([]);
  const [cursorLine, setCursorLine] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { data: session } = useSession();
  const params = useParams();

  const restoreTypingProgress = async (fileItemId: number) => {
    setErrorMessage(null);
    try {
      const url = `/api/repositories/${params.id}/file_items/${fileItemId}`;
      const accessToken = session?.user?.accessToken;
      const fetchedFileItem: FileItem = await fetcher(url, accessToken);

      const textLines = fetchedFileItem.content?.split(/(?<=\n)/) || [];
      const initialCursorPositions = textLines.map((line) => line.indexOf(line.trimStart()));
      const initialTypedTextLines = textLines.map((_, index) => ' '.repeat(initialCursorPositions[index]));
      setTargetTextLines(textLines);

      if (!fetchedFileItem.typingProgress) {
        setCursorPositions(initialCursorPositions);
        setTypedTextLines(initialTypedTextLines);
        setCursorLine(0);
        return;
      }

      const typedLine = fetchedFileItem.typingProgress.line;
      const typedCharacter = fetchedFileItem.typingProgress.character;
      const restoredCursorPositions = [...initialCursorPositions];
      const restoredTypedTextLines = textLines.map((_, index) => ' '.repeat(initialCursorPositions[index]));

      textLines.slice(0, typedLine).forEach((textLine, i) => {
        restoredTypedTextLines[i] = textLine;
        restoredCursorPositions[i] = textLine.length;
      });

      const currentTextLine = textLines[typedLine];
      const typedCharacters = currentTextLine.substring(0, typedCharacter);
      restoredTypedTextLines[typedLine] = typedCharacters;
      restoredCursorPositions[typedLine] = typedCharacter;

      setCursorPositions(restoredCursorPositions);
      setTypedTextLines(restoredTypedTextLines);
      setCursorLine(typedLine);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage('An error occurred. Please try again.');
      }
    }
  };

  const startTyping = () => {
    setTypingStatus('typing');
  };

  const pauseTyping = async () => {
    try {
      const url = `/api/repositories/${params.id}/file_items/${fileItem?.id}`;
      const accessToken = session?.user?.accessToken;
      const postData = {
        fileItem: {
          status: 'typing',
          typing_progress: {
            time: '00:00:00', // TODO: タイピング時間を計測する
            typo: 0,
            line: cursorLine,
            character: cursorPositions[cursorLine],
            typoPositionsAttributes: [
              {
                line: 1,
                character: 1,
              },
              {
                line: 2,
                character: 2,
              },
            ],
          },
        },
      };

      const response = await axiosPatch(url, accessToken, postData);
      setFileItems((prev) => updateFileItemRecursively(prev, response.data));
      setTypingStatus('paused');
    } catch (error) {
      if (axios.isAxiosError(error)) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage('An error occurred. Please try again.');
      }
    }
  };

  const resumeTyping = () => {
    setTypingStatus('typing');
  };

  const resetTyping = () => {
    const initialCursorPositions = targetTextLines.map((line) => line.indexOf(line.trimStart()));
    const initialTypedTextLines = targetTextLines.map((_, index) => ' '.repeat(initialCursorPositions[index]));
    setCursorPositions(initialCursorPositions);
    setTypedTextLines(initialTypedTextLines);
    setCursorLine(0);
    setTypingStatus('ready');
  };

  const handleComplete = useCallback(async () => {
    try {
      const url = `/api/repositories/${params.id}/file_items/${fileItem?.id}`;
      const accessToken = session?.user?.accessToken;
      const postData = {
        file_item: {
          status: 'typed',
        },
      };

      const res = await axiosPatch(url, accessToken, postData);
      setTypingStatus('completed');
      const sortedFileItems: FileItem[] = sortFileItems(res.data);
      setFileItems(sortedFileItems);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage('An error occurred. Please try again.');
      }
    }
  }, [fileItem?.id, params, session, setFileItems, setTypingStatus]);

  const isComplete = useCallback(
    (newCursorPositions: number[]) => {
      return (
        cursorLine === targetTextLines.length - 1 &&
        newCursorPositions[cursorLine] === targetTextLines[cursorLine].length
      );
    },
    [cursorLine, targetTextLines],
  );

  const handleCharacterInput = useCallback(
    (character: string) => {
      const newTypedTextLines = [...typedTextLines];
      const newCursorPositions = [...cursorPositions];

      newTypedTextLines[cursorLine] += character;
      newCursorPositions[cursorLine] = Math.min(targetTextLines[cursorLine].length, cursorPositions[cursorLine] + 1);
      const newCursorLine =
        newCursorPositions[cursorLine] === targetTextLines[cursorLine].length
          ? Math.min(targetTextLines.length - 1, cursorLine + 1)
          : cursorLine;

      return { newTypedTextLines, newCursorPositions, newCursorLine };
    },
    [typedTextLines, cursorPositions, cursorLine, targetTextLines],
  );

  const handleBackspace = useCallback(() => {
    const newTypedTextLines = [...typedTextLines];
    const newCursorPositions = [...cursorPositions];
    const backspacedCursorPosition = cursorPositions[cursorLine] - 1;
    const newCursorLine = backspacedCursorPosition < 0 ? Math.max(0, cursorLine - 1) : cursorLine;

    // 最初の行かつ最初の文字の場合は何もしない
    if (cursorLine === 0 && backspacedCursorPosition < 0) {
      return { newTypedTextLines, newCursorPositions, newCursorLine };
    }

    newTypedTextLines[newCursorLine] = typedTextLines[newCursorLine].slice(0, -1);
    newCursorPositions[newCursorLine] =
      backspacedCursorPosition < 0 ? newCursorPositions[newCursorLine] - 1 : backspacedCursorPosition;

    return { newTypedTextLines, newCursorPositions, newCursorLine };
  }, [typedTextLines, cursorPositions, cursorLine]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (typingStatus !== 'typing') return;

      let result: {
        newTypedTextLines: string[];
        newCursorPositions: number[];
        newCursorLine: number;
      };

      if (e.key.length === 1) {
        if (e.key === ' ') {
          e.preventDefault();
        }
        result = handleCharacterInput(e.key);
      } else if (e.key === 'Enter') {
        result = handleCharacterInput('\n');
      } else if (e.key === 'Backspace') {
        result = handleBackspace();
      } else {
        e.preventDefault();
        return;
      }

      setTypedTextLines(result.newTypedTextLines);
      setCursorPositions(result.newCursorPositions);
      setCursorLine(result.newCursorLine);

      if (isComplete(result.newCursorPositions)) {
        handleComplete();
      }
    },
    [typingStatus, handleCharacterInput, handleBackspace, isComplete, handleComplete],
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  return {
    cursorLine,
    cursorPositions,
    targetTextLines,
    typedTextLines,
    typingStatus,
    errorMessage,
    startTyping,
    resumeTyping,
    pauseTyping,
    resetTyping,
    restoreTypingProgress,
  };
}

function updateFileItemRecursively(fileItems: FileItem[], updatedFileItem: FileItem): FileItem[] {
  return fileItems.map((fileItem) => {
    if (fileItem.id === updatedFileItem.id) {
      return updatedFileItem;
    }

    if (fileItem.fileItems && fileItem.fileItems.length > 0) {
      return {
        ...fileItem,
        fileItems: updateFileItemRecursively(fileItem.fileItems, updatedFileItem),
      };
    }

    return fileItem;
  });
}
