import React, {memo, useEffect, useState} from 'react';
import {Box} from '@strapi/design-system';
import {Page, Layouts} from '@strapi/strapi/admin';
import {useIntl} from 'react-intl';
import {useFetchClient} from '@strapi/strapi/admin';
import getTrad from "../../utils/getTrad";
import Role from "../../components/Role";
import {ErrorAlertMessage, SuccessAlertMessage} from "../../components/AlertMessage";

const HomePage = () => {
  const {formatMessage} = useIntl();
  const [ssoRoles, setSSORoles] = useState([])
  const [roles, setRoles] = useState([])
  const [showSuccess, setSuccess] = useState(false)
  const [showError, setError] = useState(false)
  const {get, put} = useFetchClient();

  useEffect(() => {
    get('/api/strapi-plugin-sso/sso-roles').then((response) => {
      setSSORoles(response.data)
    })
    get('/admin/roles').then((response) => {
      setRoles(response.data.data)
    })
  }, [setSSORoles, setRoles])

  const onChangeRoleCheck = (value, ssoId, role) => {
    for (const ssoRole of ssoRoles) {
      if (ssoRole['oauth_type'] === ssoId) {
        if (ssoRole['role']) {
          if (value) {
            ssoRole['role'].push(role)
          } else {
            ssoRole['role'] = ssoRole['role'].filter(selectRole => selectRole !== role)
          }
        } else {
          ssoRole['role'] = [role]
        }
      }
    }
    setSSORoles(ssoRoles.slice())
  }

  const onSaveRole = async () => {
    try {
      await put('/api/strapi-plugin-sso/sso-roles', {
        roles: ssoRoles.map(role => ({
          'oauth_type': role['oauth_type'], role: role['role']
        }))
      })
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (e) {
      console.error(e)
      setError(true)
      setTimeout(() => setError(false), 3000)
    }
  }

  return (
    <Page.Protect permissions={[{action: 'plugin::strapi-plugin-sso.read', subject: null}]}>
      <Layouts.Header
        title={'Single Sign On'}
        subtitle={formatMessage({
          id: getTrad('page.title'),
          defaultMessage: 'Default role setting at first login'
        })}
      />
      {showSuccess && <SuccessAlertMessage onClose={() => setSuccess(false)}/>}
      {showError && <ErrorAlertMessage onClose={() => setError(false)}/>}
      <Box padding={10}>
        <Role
          roles={roles}
          ssoRoles={ssoRoles}
          onSaveRole={onSaveRole}
          onChangeRoleCheck={onChangeRoleCheck}
        />
      </Box>
    </Page.Protect>
  );
}

export default memo(HomePage);
