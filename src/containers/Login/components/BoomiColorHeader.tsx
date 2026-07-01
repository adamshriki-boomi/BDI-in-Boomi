import { Box, Flex, Image, Link } from 'components';

export function BoomiColorHeader({ rightLinks = null }) {
  return (
    <>
      <Box
        h="60px"
        bgImage="url('https://static-assets.console.rivery.io/background.svg')"
        bgSize="cover"
        bgPosition="center"
        transform="scaleX(-1)"
        bgRepeat="no-repeat"
        opacity={0.5}
      />
      <Flex
        w="full"
        position="absolute"
        top="12px"
        alignItems="center"
        justifyContent="space-between"
        px={6}
      >
        <Link isExternal href="https://rivery.io/">
          <Image src="src/components/Icons/icons/RTextLogoDark.svg" />
        </Link>
        {rightLinks}
      </Flex>
    </>
  );
}
