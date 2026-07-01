import { Grid, Icon, Image, RiveryButton, Text } from 'components';
import { RenderGuard } from 'components/RenderGuard';
import { useIsInNewS2TRiver } from 'modules/RiverRightBar';

export function S2TDataSourceDisplay({
  value,
  icon = null,
  image = null,
  onClick,
}) {
  const isNewRiver = useIsInNewS2TRiver();
  return (
    <Grid
      gap={1}
      bg="background-secondary"
      borderRadius={4}
      templateColumns="auto 2fr 1fr"
      w="full"
      p={2}
      alignItems="center"
    >
      {icon ? (
        <Icon color="primary" as={icon} boxSize={5} />
      ) : image ? (
        <Image src={image} h="20px" w="50px" />
      ) : (
        <div />
      )}
      <Text>{value}</Text>
      <RenderGuard condition={isNewRiver}>
        <RiveryButton
          ml="auto"
          label="Change"
          variant="default"
          size="small"
          onClick={onClick}
        />
      </RenderGuard>
    </Grid>
  );
}
