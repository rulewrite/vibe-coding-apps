import { extendTheme, type ThemeConfig } from '@chakra-ui/react';

const config: ThemeConfig = {
  initialColorMode: 'light',
  useSystemColorMode: true,
};

const theme = extendTheme({
  config,
  styles: {
    global: {
      body: {
        transition: 'background-color 0.2s',
      },
    },
  },
  components: {
    Box: {
      baseStyle: {
        transition: 'background-color 0.2s',
      },
    },
    Text: {
      baseStyle: {
        transition: 'color 0.2s',
      },
    },
  },
});

export { theme };
