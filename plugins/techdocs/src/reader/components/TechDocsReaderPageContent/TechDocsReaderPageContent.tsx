/*
 * Copyright 2022 The Backstage Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import React, { useCallback } from 'react';

import { makeStyles, Grid, Portal } from '@material-ui/core';

import {
  useTechDocsAddons,
  TechDocsAddonLocations as locations,
  useTechDocsReaderPage,
} from '@backstage/plugin-techdocs-react';
import { CompoundEntityRef } from '@backstage/catalog-model';
import { Content, ErrorPage } from '@backstage/core-components';

import { TechDocsSearch } from '../../../search';
import { TechDocsStateIndicator } from '../TechDocsStateIndicator';

import { useTechDocsReaderDom } from './dom';
import { withTechDocsReaderProvider } from '../TechDocsReaderProvider';
import { TechDocsShadowDom } from './TechDocsShadowDom';

const useStyles = makeStyles({
  search: {
    width: '100%',
    '@media (min-width: 76.1875em)': {
      width: 'calc(100% - 34.4rem)',
      margin: '0 auto',
    },
  },
});

/**
 * Props for {@link TechDocsReaderPageContent}
 * @public
 */
export type TechDocsReaderPageContentProps = {
  /**
   * @deprecated No need to pass down entityRef as property anymore. Consumes the entityName from `TechDocsReaderPageContext`. Use the {@link @backstage/plugin-techdocs-react#useTechDocsReaderPage} hook for custom reader page content.
   */
  entityRef?: CompoundEntityRef;
  /**
   * Show or hide the search bar, defaults to true.
   */
  withSearch?: boolean;
  /**
   * Callback called when the content is rendered.
   */
  onReady?: () => void;
};

/**
 * Renders the reader page content
 * @public
 */
export const TechDocsReaderPageContent = withTechDocsReaderProvider(
  (props: TechDocsReaderPageContentProps) => {
    const { withSearch = true, onReady } = props;
    const classes = useStyles();
    const addons = useTechDocsAddons();

    const {
      entityMetadata: { value: entityMetadata, loading: entityMetadataLoading },
      entityRef,
      shadowRoot,
      setShadowRoot,
    } = useTechDocsReaderPage();

    const dom = useTechDocsReaderDom(entityRef);

    const handleAppend = useCallback(
      (newShadowRoot: ShadowRoot) => {
        setShadowRoot(newShadowRoot);
        if (onReady instanceof Function) {
          onReady();
        }
      },
      [setShadowRoot, onReady],
    );

    const contentElement = shadowRoot?.querySelector(
      '[data-md-component="content"]',
    );

    const primarySidebarElement = shadowRoot?.querySelector(
      'div[data-md-component="sidebar"][data-md-type="navigation"], div[data-md-component="navigation"]',
    );
    let primarySidebarAddonLocation = primarySidebarElement?.querySelector(
      '[data-techdocs-addons-location="primary sidebar"]',
    );
    if (!primarySidebarAddonLocation) {
      primarySidebarAddonLocation = document.createElement('div');
      primarySidebarAddonLocation.setAttribute(
        'data-techdocs-addons-location',
        'primary sidebar',
      );
      primarySidebarElement?.prepend(primarySidebarAddonLocation);
    }

    const secondarySidebarElement = shadowRoot?.querySelector(
      'div[data-md-component="sidebar"][data-md-type="toc"], div[data-md-component="toc"]',
    );
    let secondarySidebarAddonLocation = secondarySidebarElement?.querySelector(
      '[data-techdocs-addons-location="secondary sidebar"]',
    );
    if (!secondarySidebarAddonLocation) {
      secondarySidebarAddonLocation = document.createElement('div');
      secondarySidebarAddonLocation.setAttribute(
        'data-techdocs-addons-location',
        'secondary sidebar',
      );
      secondarySidebarElement?.prepend(secondarySidebarAddonLocation);
    }

    // No entity metadata = 404. Don't render content at all.
    if (entityMetadataLoading === false && !entityMetadata)
      return <ErrorPage status="404" statusMessage="PAGE NOT FOUND" />;

    // Do not return content until dom is ready; instead, render a state
    // indicator, which handles progress and content errors on our behalf.
    if (!dom) {
      return (
        <Content>
          <Grid container>
            <Grid xs={12} item>
              <TechDocsStateIndicator />
            </Grid>
          </Grid>
        </Content>
      );
    }

    return (
      <Content>
        <Grid container>
          <Grid xs={12} item>
            <TechDocsStateIndicator />
          </Grid>
          {withSearch && (
            <Grid className={classes.search} xs="auto" item>
              <TechDocsSearch entityId={entityRef} />
            </Grid>
          )}
          <Grid xs={12} item>
            <TechDocsShadowDom element={dom} onAppend={handleAppend}>
              <Portal container={primarySidebarAddonLocation}>
                {addons.renderComponentsByLocation(locations.PrimarySidebar)}
              </Portal>
              <Portal container={contentElement}>
                {addons.renderComponentsByLocation(locations.Content)}
              </Portal>
              <Portal container={secondarySidebarAddonLocation}>
                {addons.renderComponentsByLocation(locations.SecondarySidebar)}
              </Portal>
            </TechDocsShadowDom>
          </Grid>
        </Grid>
      </Content>
    );
  },
);

/**
 * Props for {@link Reader}
 *
 * @public
 * @deprecated use `TechDocsReaderPageContentProps` instead.
 */
export type ReaderProps = TechDocsReaderPageContentProps;

/**
 * Component responsible for rendering TechDocs documentation
 * @public
 * @deprecated use `TechDocsReaderPageContent` component instead.
 */
export const Reader = TechDocsReaderPageContent;
