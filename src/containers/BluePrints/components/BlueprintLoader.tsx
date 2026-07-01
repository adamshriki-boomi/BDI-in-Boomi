import { Center } from '@chakra-ui/react';
import { Image, RenderGuard, Text } from 'components';
import GenAIGIF from 'components/Icons/icons/file.gif';
import { getQueryParams } from 'hooks/router';
import { useEffect, useState } from 'react';

const messages = [
  'Reviewing the provided API documentation and identifying relevant endpoints…',
  'Evaluating authentication requirements and supported authorization methods…',
  'Detecting pagination patterns to enable complete and reliable data retrieval…',
  'Analyzing available parameters for incremental loading and change tracking…',
  'Examining request and response structures to understand the data model…',
  'Inferring field mappings and data types required for a valid YAML blueprint…',
  'Constructing a proposed pipeline structure based on the available information…',
  'Validating the collected details and preparing a draft YAML configuration…',
];

export default function BlueprintLoader({
  text = null,
  minW = '650px',
  showInfoText = false,
}) {
  const { chat_id } = getQueryParams(['chat_id']);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    //Comming from email we should show the last step
    if (chat_id) {
      setCurrentIndex(messages.length - 1);
      return;
    }
    if (currentIndex >= messages.length - 1) return;

    const interval = setInterval(() => {
      setCurrentIndex(prevIndex =>
        prevIndex < messages.length - 1 ? prevIndex + 1 : prevIndex,
      );
    }, 8000); // 8 seconds

    return () => clearInterval(interval);
  }, [chat_id, currentIndex]);

  return (
    <Center flexDir="column" h="full" minW={minW} w="full" bg="white">
      <Image height="135px" width="120px" src={GenAIGIF} alt="streaming" />
      <RenderGuard
        condition={text}
        fallback={<Text textStyle="R5">{messages[currentIndex]}</Text>}
      >
        <Text textStyle="R5">{text}</Text>
      </RenderGuard>
      <RenderGuard condition={showInfoText}>
        <Text mt={6} color="font-secondary" textStyle="R8">
          You can leave the page at any time and return using the dedicated
          email.
        </Text>
      </RenderGuard>
    </Center>
  );
}
