import * as React from "react";

export type MinimalFieldApi = {
  name: string;
  state: {
    meta: {
      errors: (string | undefined)[];
    };
  };
};

export const FormFieldContext = React.createContext<MinimalFieldApi | null>(null);

export const useFormField = () => {
  const field = React.useContext(FormFieldContext);
  const id = React.useId();

  if (!field) {
    throw new Error("useFormField should be used within <FormField>");
  }

  return {
    id,
    name: field.name,
    formItemId: `${field.name}-form-item-${id}`,
    formMessageId: `${field.name}-form-item-message-${id}`,
    formDescriptionId: `${field.name}-form-item-description-${id}`,
    error: field.state.meta.errors.length > 0 ? field.state.meta.errors[0]?.toString() : null,
  };
};
