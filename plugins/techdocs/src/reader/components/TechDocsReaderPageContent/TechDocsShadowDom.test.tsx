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

import React, { useState, useEffect } from 'react';
import { render, waitFor, screen } from '@testing-library/react';
import { TechDocsShadowDom, TechDocsShadowDomProps } from './TechDocsShadowDom';

const createDom = (body: string) => {
  const newDom = document.createElement('html');
  newDom.innerHTML = `<head></head><body>${body}</body>`;
  return newDom;
};

describe('TechDocsShadowDom', () => {
  it('Should render children', () => {
    const dom = createDom('<h1>Title</h1>');
    const onAppend = jest.fn();
    render(
      <TechDocsShadowDom element={dom} onAppend={onAppend}>
        Children
      </TechDocsShadowDom>,
    );
    expect(screen.getByText('Children')).toBeInTheDocument();
  });

  it('Should not re-render if dom HTML still same', async () => {
    const Component = ({
      onAppend,
    }: Pick<TechDocsShadowDomProps, 'onAppend'>) => {
      const [dom, setDom] = useState(createDom('<h1>Title1</h1>'));

      useEffect(() => {
        setDom(createDom('<h1>Title1</h1>'));
      }, []);

      return <TechDocsShadowDom element={dom} onAppend={onAppend} />;
    };

    const onAppend = jest.fn();
    render(<Component onAppend={onAppend} />);

    await waitFor(() => {
      const shadowHost = screen.getByTestId('techdocs-native-shadowroot');
      const h1 = shadowHost.shadowRoot?.querySelector('h1');
      expect(h1).toHaveTextContent('Title1');
    });
    expect(onAppend).toHaveBeenCalledTimes(1);
  });

  it('Should re-render if dom HTML does not still same', async () => {
    const Component = ({
      onAppend,
    }: Pick<TechDocsShadowDomProps, 'onAppend'>) => {
      const [dom, setDom] = useState(createDom('<h1>Title1</h1>'));

      useEffect(() => {
        setDom(createDom('<h1>Title2</h1>'));
      }, []);

      return <TechDocsShadowDom element={dom} onAppend={onAppend} />;
    };

    const onAppend = jest.fn();
    render(<Component onAppend={onAppend} />);

    await waitFor(() => {
      const shadowHost = screen.getByTestId('techdocs-native-shadowroot');
      const h1 = shadowHost.shadowRoot?.querySelector('h1');
      expect(h1).toHaveTextContent('Title2');
    });
    expect(onAppend).toHaveBeenCalledTimes(2);
  });
});
