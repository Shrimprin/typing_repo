import axios from 'axios';
import { useSession } from 'next-auth/react';
import { useParams } from 'next/navigation';
import { Dispatch, SetStateAction, useCallback, useEffect, useState } from 'react';

import { FileItem, TypingStatus, Typo } from '@/types';
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
  const [cursorColumns, setCursorColumns] = useState<number[]>([]);
  const [typedTextLines, setTypedTextLines] = useState<string[]>([]);
  const [cursorRow, setCursorRow] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { data: session } = useSession();
  const params = useParams();

  const setupTypingState = async (fileItemId: number) => {
    setErrorMessage(null);

    try {
      const url = `/api/repositories/${params.id}/file_items/${fileItemId}`;
      const accessToken = session?.user?.accessToken;
      const fetchedFileItem: FileItem = await fetcher(url, accessToken);

      const { textLines, initialCursorColumns, initialTypedTextLines } = initializeTextState(
        fetchedFileItem.content || '',
      );
      setTargetTextLines(textLines);

      if (!fetchedFileItem.typingProgress) {
        setCursorColumns(initialCursorColumns);
        setTypedTextLines(initialTypedTextLines);
        setCursorRow(0);
        return;
      }

      const { row: currentRow, column: currentColumn, typos = [] } = fetchedFileItem.typingProgress;

      let { restoredCursorColumns, restoredTypedTextLines } = restoreCompletedRows(
        currentRow,
        textLines,
        typos,
        initialCursorColumns,
      );

      ({ restoredCursorColumns, restoredTypedTextLines } = restoreCurrentRow(
        currentRow,
        currentColumn,
        textLines,
        typos,
        restoredCursorColumns,
        restoredTypedTextLines,
      ));

      setCursorColumns(restoredCursorColumns);
      setTypedTextLines(restoredTypedTextLines);
      setCursorRow(currentRow);
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
          typingProgress: {
            row: cursorRow,
            column: cursorColumns[cursorRow],
            time: 100.5, // TODO: タイピング時間を計測する
            totalTypoCount: 10, // TODO: タイポ数を計測する
            typosAttributes: calculateTypos(typedTextLines, targetTextLines),
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
    const initialCursorColumns = targetTextLines.map((line) => line.indexOf(line.trimStart()));
    const initialTypedTextLines = targetTextLines.map((_, index) => ' '.repeat(initialCursorColumns[index]));
    setCursorColumns(initialCursorColumns);
    setTypedTextLines(initialTypedTextLines);
    setCursorRow(0);
    setTypingStatus('ready');
  };

  const handleComplete = useCallback(async () => {
    try {
      const url = `/api/repositories/${params.id}/file_items/${fileItem?.id}`;
      const accessToken = session?.user?.accessToken;
      const postData = {
        fileItem: {
          status: 'typed',
          typingProgress: {
            row: cursorRow,
            column: cursorColumns[cursorRow],
            time: 100.5, // TODO: タイピング時間を計測する
            totalTypoCount: 10, // TODO: タイポ数を計測する
            typosAttributes: calculateTypos(typedTextLines, targetTextLines),
          },
        },
      };

      const res = await axiosPatch(url, accessToken, postData);
      const sortedFileItems: FileItem[] = sortFileItems(res.data);
      setFileItems(sortedFileItems);
      setTypingStatus('completed');
    } catch (error) {
      if (axios.isAxiosError(error)) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage('An error occurred. Please try again.');
      }
    }
  }, [
    fileItem?.id,
    params,
    session,
    cursorRow,
    cursorColumns,
    typedTextLines,
    targetTextLines,
    setFileItems,
    setTypingStatus,
  ]);

  const isComplete = useCallback(
    (newCursorColumns: number[]) => {
      return (
        cursorRow === targetTextLines.length - 1 && newCursorColumns[cursorRow] === targetTextLines[cursorRow].length
      );
    },
    [cursorRow, targetTextLines],
  );

  const handleCharacterInput = useCallback(
    (character: string) => {
      const newTypedTextLines = [...typedTextLines];
      const newCursorColumns = [...cursorColumns];

      newTypedTextLines[cursorRow] += character;
      newCursorColumns[cursorRow] = Math.min(targetTextLines[cursorRow].length, cursorColumns[cursorRow] + 1);
      const newCursorRow =
        newCursorColumns[cursorRow] === targetTextLines[cursorRow].length
          ? Math.min(targetTextLines.length - 1, cursorRow + 1)
          : cursorRow;

      return { newTypedTextLines, newCursorColumns, newCursorRow };
    },
    [typedTextLines, cursorColumns, cursorRow, targetTextLines],
  );

  const handleBackspace = useCallback(() => {
    const newTypedTextLines = [...typedTextLines];
    const newCursorColumns = [...cursorColumns];
    const backspacedCursorColumn = cursorColumns[cursorRow] - 1;
    const newCursorRow = backspacedCursorColumn < 0 ? Math.max(0, cursorRow - 1) : cursorRow;

    // 最初の行かつ最初の文字の場合は何もしない
    if (cursorRow === 0 && backspacedCursorColumn < 0) {
      return { newTypedTextLines, newCursorColumns, newCursorRow };
    }

    newTypedTextLines[newCursorRow] = typedTextLines[newCursorRow].slice(0, -1);
    newCursorColumns[newCursorRow] =
      backspacedCursorColumn < 0 ? newCursorColumns[newCursorRow] - 1 : backspacedCursorColumn;

    return { newTypedTextLines, newCursorColumns, newCursorRow };
  }, [typedTextLines, cursorColumns, cursorRow]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (typingStatus !== 'typing') return;

      let result: {
        newTypedTextLines: string[];
        newCursorColumns: number[];
        newCursorRow: number;
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
      setCursorColumns(result.newCursorColumns);
      setCursorRow(result.newCursorRow);

      if (isComplete(result.newCursorColumns)) {
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
    cursorRow,
    cursorColumns,
    targetTextLines,
    typedTextLines,
    typingStatus,
    errorMessage,
    startTyping,
    resumeTyping,
    pauseTyping,
    resetTyping,
    setupTypingState,
  };
}

function calculateTypos(typedTextLines: string[], targetTextLines: string[]): Typo[] {
  return typedTextLines.flatMap((typedTextLine, row) => {
    const targetTextLine = targetTextLines[row] || '';
    return [...typedTextLine]
      .map((typedChar, column) => ({ typedChar, column, targetChar: targetTextLine[column] }))
      .filter(({ typedChar, targetChar }) => typedChar !== targetChar)
      .map(({ typedChar, column }) => ({
        row,
        column,
        character: typedChar,
      }));
  });
}

function initializeTextState(content: string) {
  const textLines = content?.split(/(?<=\n)/) || [];
  const initialCursorColumns = textLines.map((textLine) => textLine.indexOf(textLine.trimStart()));
  const initialTypedTextLines = textLines.map((_, row) => ' '.repeat(initialCursorColumns[row]));

  return {
    textLines,
    initialCursorColumns,
    initialTypedTextLines,
  };
}

function restoreCompletedRows(currentRow: number, textLines: string[], typos: Typo[], initialCursorColumns: number[]) {
  const restoredCursorColumns = [...initialCursorColumns];
  const restoredTypedTextLines = textLines.map((_, row) => ' '.repeat(initialCursorColumns[row]));

  textLines.slice(0, currentRow).forEach((textLine, row) => {
    restoredTypedTextLines[row] = restoreTypedTextLine(row, textLine, typos);
    restoredCursorColumns[row] = textLine.length;
  });

  return { restoredCursorColumns, restoredTypedTextLines };
}

function restoreCurrentRow(
  currentRow: number,
  currentColumn: number,
  textLines: string[],
  typos: Typo[],
  restoredCursorColumns: number[],
  restoredTypedTextLines: string[],
) {
  const currentTextLine = textLines[currentRow];
  const currentTargetText = currentTextLine.substring(0, currentColumn);
  restoredTypedTextLines[currentRow] = restoreTypedTextLine(currentRow, currentTargetText, typos);
  restoredCursorColumns[currentRow] = currentColumn;

  return { restoredCursorColumns, restoredTypedTextLines };
}

function restoreTypedTextLine(row: number, targetTextLine: string, typos: Typo[]): string {
  const typoMap = new Map(typos.filter((typo) => typo.row === row).map((typo) => [typo.column, typo.character]));

  return [...targetTextLine].map((char, index) => typoMap.get(index) ?? char).join('');
}

function updateFileItemRecursively(fileItems: FileItem[], updatedFileItem: FileItem): FileItem[] {
  return fileItems.map((fileItem) => {
    if (fileItem.id === updatedFileItem.id) return updatedFileItem;

    return fileItem.fileItems?.length
      ? { ...fileItem, fileItems: updateFileItemRecursively(fileItem.fileItems, updatedFileItem) }
      : fileItem;
  });
}
