import { RiverTypes } from 'api/types';
import { AppRoutes } from 'app/routes';
import {
  Box,
  Confetti,
  Divider,
  GridBox,
  Icon,
  LogicIcon,
  RiveryButton,
  RiveryModal,
  Text,
  useQuery,
  VStack,
} from 'components';
import { Tagger } from 'components/Tracking/Tagger';
import { MonitoringIcon } from 'layout/Sidebar/components/icons';
import React from 'react';
import { generatePath, useHistory } from 'react-router-dom';
import { useCore } from 'store/core/hooks';
import './RunDialog.scss';

export const RiverRunDialog = () => {
  const history = useHistory();
  const { envId: env, selectedAccountId: account } = useCore();
  const onClose = () => {
    history.push({
      search: '',
    });
  };

  const options = [
    {
      content: (
        <div>
          Create <strong>Logic</strong> transformations & workflow orchestration
        </div>
      ),
      icon: <Icon as={LogicIcon} h={5} w={5} />,
      label: 'view data flow',
      tagger: 'congrats_logic',
      onClick: () => {
        history.push(
          generatePath(AppRoutes.RIVER_NEW, {
            env,
            account,
            type: RiverTypes.LOGIC,
          }),
          { firstRiver: true },
        );
      },
    },
    {
      content: (
        <div>
          View and Monitor all your data pipeline <strong>activities</strong>
        </div>
      ),
      icon: <Icon as={MonitoringIcon} height={5} width={5} color="#26114d" />,
      label: 'view activities',
      tagger: 'congrats_activities',
      onClick: () => {
        history.push(
          generatePath(AppRoutes.ACTIVITIES, {
            env,
            account,
          }),
        );
      },
    },
  ];

  const query = useQuery();
  const hasParam = query.has('run_popup');
  return (
    <RiveryModal
      show={hasParam}
      onClose={onClose}
      centered
      ariaLabel="Run Popup"
      style={{
        body: {
          minWidth: '720px',
        },
      }}
    >
      <VStack
        pt={6}
        gap={1}
        alignItems="center"
        className="background-confetti"
      >
        <Confetti />
        <Text fontWeight="bold">Congratulations!</Text>
        <Box fontWeight="light" pb={4}>
          <Text>
            You have completed your first
            <strong> source to target flow.</strong>
          </Text>
          <Text>
            Now you are ready to manage your data pipeline like a pro!
          </Text>
        </Box>
        <Divider w="full" borderColor="gray.300" />
        {/* {isSuperAdminUser ? (
          <Box px={2} gap={1}>
            <RiveryButton
              role="button"
              mb="3"
              p="4"
              label="Back to Onboarding"
              onClick={() => history.push(generatePath('/onboarding_BETA'))}
            />
          </Box>
        ) : ( */}
        <>
          <Text fontWeight="bold" fontSize="md">
            What’s Next?
          </Text>
          <GridBox px={5} gap={1}>
            {options?.map(button => (
              <Tagger tags={button.tagger} key={button.label}>
                <BoxOption key={button.label} {...button} />
              </Tagger>
            ))}
          </GridBox>
        </>
        {/* )} */}
      </VStack>
    </RiveryModal>
  );
};

const BoxOption = ({ content, icon, onClick, ...rest }) => (
  <RiveryButton
    variant="outlined-primary"
    role="button"
    mb="3"
    textTransform="capitalize"
    label={content}
    onClick={onClick}
    leftIcon={icon}
    data-pendo-id={rest['data-pendo-id']}
  />
);
