import { RiveryButton } from 'components';
import { FeatureEnabler } from 'modules/FeatureEnabler/FeatureEnabler';

export function SaveRiverButton({
  disabled = false,
  onSave,
  loading,
  ...props
}) {
  return (
    <FeatureEnabler>
      <RiveryButton
        label={loading ? 'Saving...' : 'Save'}
        isLoading={loading}
        variant="outlined-primary"
        ml={2}
        onClick={() => onSave()}
        disabled={disabled}
        {...props}
      />
    </FeatureEnabler>
  );
}
