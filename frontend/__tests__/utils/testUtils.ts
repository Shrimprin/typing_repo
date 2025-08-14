import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

export const clickButton = async (buttonName: string) => {
  const button = screen.getByRole('button', { name: buttonName });
  await userEvent.click(button);
};

export const clickCheckboxByText = async (text: string) => {
  const checkbox = getCheckboxByText(text);
  await userEvent.click(checkbox);
};

export const getCheckboxByText = (text: string) => {
  // shadcn/uiのチェックボックスはチェックボックスとテキストが兄弟の構造のため、
  // テキストから要素を経由してチェックボックスを取得する
  const textElement = screen.getByText(text);
  const cardElement = textElement.closest('[data-slot="card"]');
  if (!cardElement) {
    throw new Error(`Card element containing text "${text}" not found`);
  }
  return cardElement.querySelector('[role="checkbox"]') as HTMLElement;
};
