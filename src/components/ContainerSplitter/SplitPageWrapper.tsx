import { Box, BoxProps, chakra, ChakraProps } from '@chakra-ui/react';
import {
  ReflexContainer,
  ReflexContainerProps,
  ReflexElement,
  ReflexElementProps,
  ReflexSplitter,
} from 'react-reflex';
import 'react-reflex/styles.css';
import './SplitComponent.scss';

const ChakraSplit = chakra(ReflexContainer);
interface SplitWrapperProps extends ReflexContainerProps {
  shouldSplit?: boolean;
  firstChildProps?: ReflexElementProps | BoxProps;
  secondChildProps?: ReflexElementProps | BoxProps;
  thirdChildProps?: ReflexElementProps | BoxProps;
  showThirdChild?: boolean;
}
/**
 * if { height: 'full'}, the splitter pane sets
 * the min-height to 100% as well
 */
export default function ConditionalSplitWrapper({
  shouldSplit = true,
  children,
  firstChildProps,
  secondChildProps,
  thirdChildProps,
  showThirdChild = false,
  ...rest
}: SplitWrapperProps & ChakraProps) {
  const Pane = (pane, props) => (
    <Box as={ReflexElement} {...(props as any)}>
      {pane}
    </Box>
  );

  return shouldSplit ? (
    <ChakraSplit {...rest}>
      {Pane(children[0], firstChildProps)}
      <ReflexSplitter
        className={rest?.height === 'full' ? 'full-height' : ''}
        {...(rest?.visibility === 'hidden' && {
          style: { visibility: 'hidden' },
        })}
      >
        <Box
          className="dragHandle"
          borderRadius="4px"
          {...(rest.orientation === 'horizontal'
            ? {
                transform: 'rotate(180deg)',
                m: 'auto',
                h: '2px',
                w: '40px',
              }
            : { mx: 'auto', h: '40px', w: '2px' })}
        />
      </ReflexSplitter>
      {Pane(children[1], secondChildProps)}

      <ReflexSplitter
        className={rest?.height === 'full' ? 'full-height' : ''}
        {...((rest?.visibility === 'hidden' || !showThirdChild) && {
          style: { visibility: 'hidden' },
        })}
      >
        <Box
          className="dragHandle"
          borderRadius="4px"
          {...(rest.orientation === 'horizontal'
            ? {
                transform: 'rotate(180deg)',
                m: 'auto',
                h: '2px',
                w: '40px',
              }
            : { mx: 'auto', h: '40px', w: '2px' })}
        />
      </ReflexSplitter>
      {showThirdChild && Pane(children[2], thirdChildProps)}
    </ChakraSplit>
  ) : (
    <>{children}</>
  );
}

// function Splitter({ ...rest }) {
//   return (
//     <ReflexSplitter
//       className={rest?.height === 'full' ? 'full-height' : ''}
//       {...(rest?.visibility === 'hidden' && {
//         style: { visibility: 'hidden' },
//       })}
//     >
//       <Box
//         className="dragHandle"
//         borderRadius="4px"
//         {...(rest?.orientation === 'horizontal'
//           ? {
//               transform: 'rotate(180deg)',
//               m: 'auto',
//               h: '2px',
//               w: '40px',
//             }
//           : { mx: 'auto', h: '40px', w: '2px' })}
//       />
//     </ReflexSplitter>
//   );
// }
