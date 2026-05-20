export type DatePickerProps = {
  value?: string | Date | null;
  onChange?: (date: string | null) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  min?: string;
  max?: string;
};
