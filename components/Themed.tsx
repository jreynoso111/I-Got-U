/**
 * Learn more about Light and Dark modes:
 * https://docs.expo.io/guides/color-schemes/
 */
import { Text as DefaultText, View as DefaultView, ViewStyle } from 'react-native';
import { AnimatedBackground } from './AnimatedBackground';

import { useColorScheme } from './useColorScheme';

import Colors from '@/constants/Colors';

type ThemeProps = {
  lightColor?: string;
  darkColor?: string;
};

export type TextProps = ThemeProps & DefaultText['props'];
export type ViewProps = ThemeProps & DefaultView['props'];

export function useThemeColor(
  props: { light?: string; dark?: string },
  colorName: keyof typeof Colors.light & keyof typeof Colors.dark
) {
  const theme = useColorScheme();
  const colorFromProps = props[theme];

  if (colorFromProps) {
    return colorFromProps;
  } else {
    return Colors[theme][colorName];
  }
}

export function Text(props: TextProps) {
  const { style, lightColor, darkColor, ...otherProps } = props;
  const color = useThemeColor({ light: lightColor, dark: darkColor }, 'text');

  return <DefaultText style={[{ color }, style]} {...otherProps} />;
}

export function View(props: ViewProps) {
  const { style, lightColor, darkColor, ...otherProps } = props;
  const backgroundColor = useThemeColor({ light: lightColor, dark: darkColor }, 'background');

  return <DefaultView style={[{ backgroundColor }, style]} {...otherProps} />;
}

export function Card(props: ViewProps) {
  const { style, lightColor, darkColor, ...otherProps } = props;
  const backgroundColor = useThemeColor({ light: lightColor, dark: darkColor }, 'card');
  const borderColor = useThemeColor({ light: lightColor, dark: darkColor }, 'border');

  return (
    <DefaultView
      style={[
        {
          backgroundColor,
          borderRadius: 20,
          padding: 16,
          borderWidth: 1,
          borderColor,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.05,
          shadowRadius: 12,
          elevation: 2,
        },
        style
      ]}
      {...otherProps}
    />
  );
}

import { SafeAreaView } from 'react-native-safe-area-context';

export function Screen(props: ViewProps) {
  const { style, ...otherProps } = props;
  return (
    <AnimatedBackground style={{ flex: 1 }}>
      <SafeAreaView style={[{ flex: 1 }, style]} {...otherProps}>
        <DefaultView style={[{ flex: 1, backgroundColor: 'transparent' }]} {...otherProps} />
      </SafeAreaView>
    </AnimatedBackground>
  );
}
