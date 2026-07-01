import { InfiniteScrollComponent } from 'components';
import { PageOverlaySpinner } from 'components/Loaders/Loader';
import { ActivityBox, PackageBox } from '../PackageBoxComponent';
import { ViewTypes } from '../packages.query';

export function DeploymentsGridComponent({
  list,
  loading,
  type,
  onOpenDrawer,
  setPreparedPackage = null,
  onRevertDeployment = null,
}) {
  const Component = type === ViewTypes.PACKAGES ? PackageBox : ActivityBox;
  return loading ? (
    <PageOverlaySpinner />
  ) : (
    <InfiniteScrollComponent
      listHeight="100%"
      ariaLabel={`${type} list`}
      list={list}
      component={({ item }, index) => (
        <Component
          {...item}
          index={index}
          listLength={list?.length}
          onOpenDrawer={onOpenDrawer}
          setPreparedPackage={setPreparedPackage}
          onRevertDeployment={onRevertDeployment}
        />
      )}
      rowHeight={90}
    />
  );
}
