import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbProps,
  Icon,
  Text,
} from '@chakra-ui/react';
import { RoutesBuilder } from 'app/routes';
import { Home } from 'components/Icons';
import { useDocumentTitle } from 'hooks/useDocumentTitle';
import * as React from 'react';
import { ReactNode } from 'react';
import { FiChevronRight } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { useCore } from 'store/core';

type BreadCrumb = {
  label: string;
  href?: string;
};
export interface BreadcrumbsProps extends BreadcrumbProps {
  links: BreadCrumb[];
  children?: ReactNode;
}

const isLastIndex = (links, index) => index === links.length - 1;
export function Breadcrumbs({
  links,
  children = null,
  ...rest
}: BreadcrumbsProps) {
  useDocumentTitle(links.map(link => link.label).join(' - '));
  const { selectedAccountId: accountId, envId } = useCore();
  return (
    <Breadcrumb
      separator={<Icon as={FiChevronRight} boxSize={2.5} color="font" />}
      pb={5}
      {...rest}
    >
      <BreadcrumbItem>
        <BreadcrumbLink
          as={Link}
          to={RoutesBuilder.home({ accountId, envId })}
          color="font-secondary"
        >
          <Icon as={Home} mt={1} />
        </BreadcrumbLink>
      </BreadcrumbItem>
      {links.map(({ label, href }, index) => (
        <BreadcrumbItem key={`${label}-${href}`}>
          {Boolean(href) ? (
            <BreadcrumbLink
              as={Link}
              to={href}
              color={isLastIndex(links, index) ? 'font' : 'font-link'}
              textDecoration="underline"
              _hover={{
                color: isLastIndex(links, index) ? 'font' : 'font-link-hover',
              }}
            >
              {label}
            </BreadcrumbLink>
          ) : (
            <Text
              textTransform="capitalize"
              color={isLastIndex(links, index) ? 'font' : 'font-secondary'}
            >
              {label}
            </Text>
          )}
        </BreadcrumbItem>
      ))}
      {children}
    </Breadcrumb>
  );
}
