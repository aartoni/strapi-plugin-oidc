import { Box, Button, Field, Textarea } from "@strapi/design-system";
import React from "react";
import { useIntl } from "react-intl";
import { getTranslation } from "../../utils/translations";

export default function Role({ expression, onChange, onSave }) {
  const { formatMessage } = useIntl();

  return (
    <Box>
      <Field.Root>
        <Field.Label>
          {formatMessage({ id: getTranslation("role.expression.label") })}
        </Field.Label>
        <Textarea
          value={expression}
          onChange={(e) => onChange(e.target.value)}
          placeholder="contains(groups[*], 'admins') && 'Super Admin' || 'Editor'"
        />
        <Field.Hint>
          {formatMessage({ id: getTranslation("role.expression.hint") })}
        </Field.Hint>
      </Field.Root>
      <Box paddingTop={4}>
        <Button onClick={onSave}>
          {formatMessage({ id: getTranslation("page.save") })}
        </Button>
      </Box>
    </Box>
  );
}
