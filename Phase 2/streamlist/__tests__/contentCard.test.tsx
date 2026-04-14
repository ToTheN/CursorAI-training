import React from 'react';
import { Text } from 'react-native';
import renderer, { act } from 'react-test-renderer';
import { ContentCard } from '../src/components/ContentCard';

jest.mock('react-native-vector-icons/MaterialIcons', () => {
  const React = require('react');
  const { View } = require('react-native');
  return function MaterialIconsMock(): React.ReactElement {
    return <View />;
  };
});

describe('ContentCard', () => {
  it('renders title, subtitle, and formatted rating when shown', () => {
    let tree: renderer.ReactTestRenderer | undefined;
    act(() => {
      tree = renderer.create(
        <ContentCard
          title="Sample Film"
          subtitle="2021 • Sci-Fi"
          imageUri={null}
          showRating
          ratingValue={8.2}
          layoutWidth={120}
        />,
      );
    });
    if (tree === undefined) {
      throw new Error('expected renderer tree');
    }
    const texts: string[] = tree.root
      .findAllByType(Text)
      .map((node) => String(node.props.children ?? ''));
    expect(texts.some((t: string) => t.includes('Sample Film'))).toBe(true);
    expect(texts.some((t: string) => t.includes('2021'))).toBe(true);
    expect(texts.some((t: string) => t.includes('8.2'))).toBe(true);
  });
});
