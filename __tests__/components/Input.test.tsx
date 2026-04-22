import React from 'react';
import ReactTestRenderer, { act } from 'react-test-renderer';
import { Input } from '../../src/components/common/Input';
import { FocusProvider } from '../../src/hooks/useFocus';

const wrapper = (children: React.ReactElement) => (
  <FocusProvider>{children}</FocusProvider>
);

describe('Input', () => {
  it('renders with value and placeholder', () => {
    let tree: ReactTestRenderer.ReactTestRenderer | null = null;
    act(() => {
      tree = ReactTestRenderer.create(
        wrapper(
          <Input
            value=""
            placeholder="Enter email"
            onChangeText={() => {}}
            name="email"
          />
        )
      );
    });
    expect(tree!.toJSON()).toBeTruthy();
  });

  it('renders with title', () => {
    let tree: ReactTestRenderer.ReactTestRenderer | null = null;
    act(() => {
      tree = ReactTestRenderer.create(
        wrapper(
          <Input
            title="Email"
            value=""
            placeholder="Enter email"
            onChangeText={() => {}}
            name="email"
          />
        )
      );
    });
    expect(tree!.toJSON()).toBeTruthy();
  });

  it('displays error when touched and error provided', () => {
    let tree: ReactTestRenderer.ReactTestRenderer | null = null;
    act(() => {
      tree = ReactTestRenderer.create(
        wrapper(
          <Input
            value=""
            placeholder="Enter email"
            onChangeText={() => {}}
            name="email"
            touched
            error="Invalid email"
          />
        )
      );
    });
    const json = tree!.toJSON();
    expect(json).toBeTruthy();
    expect(JSON.stringify(json)).toContain('Invalid email');
  });

  it('calls onChangeText when text changes', () => {
    const onChangeText = jest.fn();
    let tree: ReactTestRenderer.ReactTestRenderer | null = null;
    act(() => {
      tree = ReactTestRenderer.create(
        wrapper(
          <Input
            value=""
            placeholder="Enter email"
            onChangeText={onChangeText}
            name="email"
          />
        )
      );
    });
    const textInput = tree!.root.findByType(require('react-native').TextInput);
    act(() => {
      textInput.props.onChangeText('test@example.com');
    });
    expect(onChangeText).toHaveBeenCalledWith('test@example.com');
  });

  it('removes spaces when allowSpacing is false', () => {
    const onChangeText = jest.fn();
    let tree: ReactTestRenderer.ReactTestRenderer | null = null;
    act(() => {
      tree = ReactTestRenderer.create(
        wrapper(
          <Input
            value=""
            placeholder="Code"
            onChangeText={onChangeText}
            name="code"
            allowSpacing={false}
          />
        )
      );
    });
    const textInput = tree!.root.findByType(require('react-native').TextInput);
    act(() => {
      textInput.props.onChangeText('abc 123');
    });
    expect(onChangeText).toHaveBeenCalledWith('abc123');
  });
});
