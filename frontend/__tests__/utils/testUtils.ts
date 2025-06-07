import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

export const clickButton = async (buttonName: string) => {
  const button = screen.getByRole('button', { name: buttonName });
  await userEvent.click(button);
};
