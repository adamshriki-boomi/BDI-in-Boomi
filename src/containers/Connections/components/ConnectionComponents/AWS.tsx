import { ListItem, OrderedList, Text } from '@chakra-ui/react';
import { API } from 'api';
import { ExternalLink, GridBox } from 'components';
import { Input, Radio, Secret } from 'components/Form';
import * as React from 'react';
import { useEffect } from 'react';
import { useAsyncFn } from 'react-use';
import { useCore } from 'store/core/hooks';

enum connectionMethodTypes {
  AWS_KEYS = 'aws_keys',
  IAM_ROLE = 'iam_role',
  MANUAL = 'manual',
}

export function AWSConnection({ api, formMetadata }) {
  const { activeAccountId } = useCore();
  const { dsId } = formMetadata;

  const connectionMethod = api?.watch('s3_connection_method');
  const connectionMethodComponent = {
    [connectionMethodTypes.AWS_KEYS]: AWSKeys,
    [connectionMethodTypes.IAM_ROLE]: IAmRole,
    [connectionMethodTypes.MANUAL]: Manual,
  };

  const externalID =
    api?.watch('external_id') || `rivery:aws:extid:${activeAccountId}`;

  const Component = connectionMethodComponent?.[connectionMethod];
  const { stackUrl, stackAccountID, manualAttachedPolicy } =
    useAWSDetails(dsId);

  return (
    <section>
      <Radio
        api={api}
        label="Credentials Type"
        name="s3_connection_method"
        values={radioValues}
      />
      <GridBox gap={4} p={3}>
        {Component ? (
          <Component
            stackAccountID={stackAccountID}
            stackUrl={stackUrl}
            api={api}
            externalID={externalID}
            manualAttachedPolicy={manualAttachedPolicy}
            dsId={dsId}
          />
        ) : null}
      </GridBox>
    </section>
  );
}

function IAmRole({ stackUrl, externalID, api }) {
  const awsStack = stackUrl?.replace('{externalId}', externalID);
  return (
    <>
      <OrderedList>
        <ListItem>
          <ExternalLink url={awsStack} label="Launch Stack" m={1} />
          in order to launch AWS CloudFormation Stack
        </ListItem>
        <ListItem>
          In the Parameters section, insert the following External ID -
          <Text display="inline" fontWeight="medium" color="primary">
            {externalID}
          </Text>
        </ListItem>

        <ListItem>
          In the "Review" tab, check "I acknowledge that AWS CloudFormation
          might create IAM resources" and click "Create".
        </ListItem>

        <ListItem>
          Copy the "RiveryAssumeRoleArn" value from the <u>Output</u> tab in the
          stack.
        </ListItem>

        <ListItem>
          Paste the <u>Role ARN</u> below:
        </ListItem>
      </OrderedList>
      <Input
        api={api}
        label="Role ARN"
        name="role_arn"
        aria-label="role_arn"
        flex="1 1 auto"
      />
    </>
  );
}
function AWSKeys({ api }) {
  return (
    <>
      <Input
        label="AWS Access Key"
        name="aws_access_key"
        flex="1 1 auto"
        api={api}
      />
      <Secret
        name="aws_access_secret"
        api={api}
        label="AWS Access Secret"
        flex="1 1 auto"
      />
    </>
  );
}

function Manual({
  api,
  stackAccountID,
  externalID,
  manualAttachedPolicy,
  dsId,
}) {
  const iam = 'https://console.aws.amazon.com/iam/';
  return (
    <>
      <OrderedList>
        <ListItem>
          Open the
          <ExternalLink url={iam} label="AWS IAM console" m={1} />.
        </ListItem>
        <ListItem>
          Click the <u>Policies</u> on the sidebar, and select
          <u>Create Policy</u>
          <OrderedList>
            <ListItem>
              Switch to <u>JSON</u> tab.
            </ListItem>
            <ListItem>
              Paste the
              <ExternalLink
                url={manualAttachedPolicy}
                label="Attached Policy"
                m={1}
              />
              , and click <u>Review Policy</u>.
            </ListItem>
            <ListItem>
              Set the policy name to
              <Text ml="1" display="inline" textTransform="capitalize">
                "Rivery-{dsId}-Policy"
              </Text>
              ,<span> and click </span>
              <u>Create Policy</u>.
            </ListItem>
          </OrderedList>
        </ListItem>
        <ListItem>
          Click the <u>Roles</u> on the sidebar, <span> and click </span>
          <u>Create Role.</u>
        </ListItem>
        <ListItem>
          Select <u>Another AWS account</u>, and set Account ID:
          <Text display="inline" fontWeight="medium" color="primary" ml={1}>
            {stackAccountID}
          </Text>
          .
        </ListItem>
        <ListItem>
          <p>
            Check the <u>Require external ID</u> checkbox, and insert the
            following External ID -
            <Text display="inline" fontWeight="medium" color="primary">
              {externalID}
            </Text>
          </p>
          <p>
            then click <u>Next</u>.
          </p>
        </ListItem>
        <ListItem>
          On the <u>Attach Policy</u>, please attach the
          <Text ml="1" display="inline" textTransform="capitalize">
            "Rivery-{dsId}-Policy".
          </Text>
        </ListItem>
        <ListItem>
          Set Role name:
          <Text
            display="inline"
            ml="1"
            textDecoration="underline"
            textTransform="capitalize"
          >
            Rivery-{dsId}-Role
          </Text>
          .
        </ListItem>
        <ListItem>
          Copy the <u>Role ARN</u> From the Role's screen and paste it here in
          the field below:
        </ListItem>
      </OrderedList>
      <Input
        label="Role ARN"
        name="role_arn"
        aria-label="role_arn"
        flex="1 1 auto"
        api={api}
      />
    </>
  );
}

const radioValues = [
  {
    label: 'AWS Keys',
    value: 'aws_keys',
  },
  {
    label: 'IAM Role - Automatic',
    value: 'iam_role',
  },
  {
    label: 'IAM Role - Manual',
    value: 'manual',
  },
];

const useAWSDetails = dsId => {
  const [state, getAWSDetails] = useAsyncFn(async () => {
    const response = dsId && (await API.connections.getAWSDetailsCall(dsId));
    return response;
  }, []);

  const stackUrl = state?.value?.stack_url;
  const stackAccountID = state?.value?.stack_account_id;
  const manualAttachedPolicy = state?.value?.manual_attached_policy;

  useEffect(() => {
    getAWSDetails();
  }, [getAWSDetails]);

  return { state, stackUrl, stackAccountID, manualAttachedPolicy };
};
