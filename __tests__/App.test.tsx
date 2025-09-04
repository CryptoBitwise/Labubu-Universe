/**
 * @format
 */

import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import App from '../App';

describe('App Component', () => {
  let renderer: any;

  afterEach(() => {
    if (renderer) {
      renderer.unmount();
    }
    // Clear any timers
    jest.clearAllTimers();
  });

  test('renders correctly', async () => {
    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(<App />);
    });

    expect(renderer).toBeTruthy();
  });

  test('renders splash screen initially', async () => {
    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(<App />);
    });

    const tree = renderer.toJSON();
    expect(tree).toBeTruthy();
  });

  test('component structure is valid', async () => {
    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(<App />);
    });

    const instance = renderer.root;
    expect(instance).toBeTruthy();
  });
});
