import { ChangeEvent, FormEvent } from 'react';
import {
  ButtonDescriptor,
  FormDataMap,
  FormField,
  FormManifest,
} from '../models/common';
import {
  Button,
  Card,
  Checkbox,
  Label,
  Select,
  TextInput,
  Textarea,
} from 'flowbite-react';

function ManifestForm({
  manifest,
  data,
  onButtonClick,
}: {
  manifest: FormManifest;
  data: FormDataMap;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onButtonClick?: (btnDesc: ButtonDescriptor, data: FormDataMap) => any;
}) {
  function onChangeHandler(e: ChangeEvent) {
    const el = e.target as HTMLFormElement;
    const name: string = el.getAttribute('id') as string;
    const value = el.value;
    data[name] = value;
  }
  function renderField(field: FormField) {
    let fieldValue = data[field.name];
    if (fieldValue == null) {
      fieldValue = field.defaultValue as string;
    }
    const commonLabel = (
      <div className="mb-2 block">
        <Label htmlFor={field.name} value={field.label} />
      </div>
    );
    switch (field.type) {
      case 'checkbox':
        return (
          <div className="flex items-center gap-2">
            <Checkbox id={field.name} />
            <Label htmlFor={field.name}>{field.label}</Label>
          </div>
        );
      case 'password':
      case 'text':
        return (
          <>
            {commonLabel}
            <TextInput
              id={field.name}
              type={field.type}
              placeholder={field.extraOptions?.placeholder}
              required={field.required}
              value={fieldValue}
              shadow
              onChange={onChangeHandler}
            />
          </>
        );
      case 'textarea':
        return (
          <>
            {commonLabel}
            <Textarea
              id={field.name}
              placeholder={field.extraOptions?.placeholder}
              value={fieldValue}
              required={field.required}
              onChange={onChangeHandler}
              rows={4}
            />
          </>
        );
      case 'combo': {
        return (
          <>
            {commonLabel}
            <Select id={field.name} required={field.required}>
              {field.data?.map((op) => {
                return <option value={op.value}>{op.label}</option>;
              })}
            </Select>
          </>
        );
      }
    }
    return '';
  }
  function clickHandler(btn: ButtonDescriptor) {
    return function () {
      onButtonClick && onButtonClick(btn, data);
    };
  }
  return (
    <Card className="max-w-full">
      <form className="flex flex-col gap-4">
        {manifest.title ? (
          <div className="mform-title">{manifest.title}</div>
        ) : (
          ''
        )}
        <div className="mform-body">
          {manifest.fieldGroups.map((group, index) => {
            return (
              <div className="mform-group" key={`mform-group-${index}`}>
                {group.fields.map((field, idx) => {
                  return (
                    <div key={`mform-field-${idx}`}>{renderField(field)}</div>
                  );
                })}
              </div>
            );
          })}
        </div>
        <div className="mform-footer">
          {manifest.buttons.map((btn, index) => {
            return (
              <div className="flex flex-wrap gap-2" key={`mform-btn-${index}`}>
                <Button
                  color={btn.primary ? 'blue' : 'gray'}
                  onClick={clickHandler(btn)}
                >
                  {btn.label}
                </Button>
              </div>
            );
          })}
        </div>
      </form>
    </Card>
  );
}

export default ManifestForm;
