import React, { memo, useEffect, useState } from "react";
import { Box } from "@strapi/design-system";
import { Page, Layouts } from "@strapi/strapi/admin";
import { useIntl } from "react-intl";
import { useFetchClient } from "@strapi/strapi/admin";
import getTrad from "../../utils/getTrad";
import Role from "../../components/Role";
import {
  ErrorAlertMessage,
  SuccessAlertMessage,
} from "../../components/AlertMessage";

const HomePage = () => {
  const { formatMessage } = useIntl();
  const [expression, setExpression] = useState("");
  const [showSuccess, setSuccess] = useState(false);
  const [showError, setError] = useState(false);
  const { get, put } = useFetchClient();

  useEffect(() => {
    get("/api/strapi-plugin-sso/sso-roles").then((response) => {
      setExpression(response.data?.expression ?? "");
    });
  }, []);

  const onSave = async () => {
    try {
      await put("/api/strapi-plugin-sso/sso-roles", { expression });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (e) {
      console.error(e);
      setError(true);
      setTimeout(() => setError(false), 3000);
    }
  };

  return (
    <Page.Protect
      permissions={[
        { action: "plugin::strapi-plugin-sso.read", subject: null },
      ]}
    >
      <Layouts.Header
        title="Single Sign On"
        subtitle={formatMessage({
          id: getTrad("page.title"),
        })}
      />
      {showSuccess && <SuccessAlertMessage onClose={() => setSuccess(false)} />}
      {showError && <ErrorAlertMessage onClose={() => setError(false)} />}
      <Box padding={10}>
        <Role
          expression={expression}
          onChange={setExpression}
          onSave={onSave}
        />
      </Box>
    </Page.Protect>
  );
};

export default memo(HomePage);
