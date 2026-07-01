import React from 'react';

type ComplexTag = string | Record<string, string | number | boolean>;
const PENDO_ID = 'data-pendo-id';
export type TagsProps = ComplexTag | ComplexTag[];

export function Tagger({
  tags,
  children,
  debug = false,
  capture = false,
}: {
  tags: TagsProps;
  children: any;
  debug?: boolean;
  capture?: boolean;
}) {
  if (isEmptyTags(tags) || !children) {
    return children;
  }
  const displayTags = toDisplayTags(tags);

  const result = React.Children.map(children, child => {
    if (typeof child === 'string') {
      return child;
    } else if (child.type === Tagger) {
      return React.cloneElement(child, {
        tags: displayTags.concat(toDisplayTags(child.props.tags ?? [])),
      });
    }
    // Forward the pendo id onto the child element — whether it's a host DOM
    // element or a component, cloneElement lands it on the child's own root
    // DOM node instead of an extra wrapper above it.
    return React.cloneElement(
      child,
      toTagAttributes(displayTags, debug, capture),
    );
  });

  return result;
}

function isEmptyTags(tags) {
  if (!tags) {
    return true;
  }

  if (!tags.length && (typeof tags === 'string' || Array.isArray(tags))) {
    return true;
  }

  return false;
}

function toDisplayTags(tags: TagsProps) {
  return (Array.isArray(tags) ? tags : [tags]).filter(Boolean);
}

function normalizeTag(tag: string) {
  return tag.replace(/\s+/g, '-').toLowerCase();
}

function tagToPendoId(tag: ComplexTag): string {
  if (typeof tag === 'string') {
    return normalizeTag(tag);
  }
  return Object.entries(tag)
    .filter(([, val]) => val !== false && val !== null && val !== undefined)
    .map(([key, val]) => `${normalizeTag(key)}-${val}`)
    .join('-');
}

function toTagAttributes(
  tags: ComplexTag[],
  debug: boolean,
  capture: boolean,
): Object {
  const values = tags.map(tag => ({ [PENDO_ID]: tagToPendoId(tag) }));

  const debugHandlerKey = debug && (capture ? 'onClickCapture' : 'onClick');
  const base = debugHandlerKey
    ? {
        [debugHandlerKey]: e => {
          console.log(
            `[tags debug - ${debugHandlerKey}] clicked: `,
            tags,
            e.target,
            e.currentTarget,
          );
        },
      }
    : {};
  return Object.assign(base, ...values);
}
