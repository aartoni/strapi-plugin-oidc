import { Box, Button, Field, Textarea } from "@strapi/design-system";
import React from "react";
import { useIntl } from "react-intl";
import getTrad from "../../utils/getTrad";

export default function Role({ expression, onChange, onSave }) {
  const { formatMessage } = useIntl();

  return (
    <Box>
      <Field.Root>
        <Field.Label>
          {formatMessage({
            id: getTrad("role.expression.label"),
          })}
        </Field.Label>
        <Textarea
          value={expression}
          onChange={(e) => onChange(e.target.value)}
          placeholder="contains(groups[*], 'admins') && 'Super Admin' || 'Editor'"
        />
        <Field.Hint>
          {formatMessage({
            id: getTrad("role.expression.hint"),
          })}
        </Field.Hint>
      </Field.Root>
      <Box paddingTop={4}>
        <Button onClick={onSave}>
          {formatMessage({ id: getTrad("page.save") })}
        </Button>
      </Box>
    </Box>
  );
}
