export const BASE_API_URL = 'http://localhost:3001/api';
export const LIMIT = 9;
export interface HeaderItem {
  url: string;
  label: string;
  icon?: string;
}

export interface FormFieldGroup {
  title?: string;
  fields: FormField[];
  collapsible?: boolean;
}

export interface FormField {
  type: 'text' | 'password' | 'checkbox' | 'textarea' | 'combo';
  name: string;
  defaultValue?: string;
  required?: boolean;
  label: string;
  data?: ComboOption[];
  extraOptions: {
    placeholder?: string;
    numRows?: number;
  };
}

export interface ComboDataProvider {
  getData(formField: FormField, dataMap: FormDataMap): Promise<ComboOption[]>;
}

export interface ComboOption {
  value: string;
  label: string;
}
export interface ButtonDescriptor {
  label: string;
  id: string;
  icon?: string;
  primary?: boolean;
}

export interface FormManifest {
  id: string;
  title?: string;
  numColumns?: number;
  fieldGroups: FormFieldGroup[];
  buttons: ButtonDescriptor[];
}

export const PublicHeaderItems = [
  {
    label: 'Home',
    url: '/',
  },
  {
    label: 'Signup',
    url: '/signup',
  },
  {
    label: 'Login',
    url: '/login',
  },
];

export interface FormDataMap {
  [name: string]: string;
}
