/* eslint-disable jsx-a11y/alt-text */
import { ExLoader, LoaderSize } from '@boomi/exosphere';
import { chakra, ChakraProps } from '@chakra-ui/react';
import * as React from 'react';
import { useEffect } from 'react';
import { useToggle } from 'react-use';

export enum Size {
  XXS = '4',
  XS = '5',
  // S = '24',
  S = '30',
  M = '32',
  // 33 = '33',
  L = '40',
  // 45 = '45',
  LM = '48',
  XL = '52',
  XXL = '16',
  XXXL = '100',
  RIVER_IMAGE = '120',
}
export interface ImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  size?: Size;
  showSpinnerBefore?: boolean;
  /**
   * adds a "/" so image is loaded properly from the "static" directory
   */
  relative?: boolean;
  [key: string]: any; // for chakra
}
Image.Size = Size;
export function Image({
  size,
  showSpinnerBefore = true,
  src,
  ...props
}: ImageProps) {
  const [showImage, toggleImage] = useToggle(true);
  const isSrcValid =
    src?.length && !src?.includes('undefined') && !src.includes('null');
  const prefix = src?.startsWith('dist') ? '/' : '';
  useEffect(() => {
    if (isSrcValid) {
      toggleImage(true);
    }
  }, [src, isSrcValid, toggleImage]);
  if (!isSrcValid) {
    return null;
  }
  if (showImage && Boolean(src)) {
    return (
      <chakra.img
        onLoad={() => toggleImage(true)}
        onError={() => isSrcValid && toggleImage(false)}
        src={`${prefix}${src}`}
        height={size}
        width="auto"
        {...props}
      />
    );
  } else if (showSpinnerBefore) {
    return <ExLoader size={LoaderSize.MEDIUM} />;
  } else {
    return null;
  }
}

/**
 * an image loader for displaying images under publuc/dist/images
 * @param src the path to image located under "/dist/images"
 */
ImageStatic.Size = Size;
export function ImageStatic({ src, ...props }: ImageProps & ChakraProps) {
  return <Image src={`dist/images/${src}`} {...props} role="figure" />;
}
