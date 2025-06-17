import 'styled-components';
import { AlchemyTheme } from './theme';

declare module 'styled-components' {
  export interface DefaultTheme extends AlchemyTheme {}
}
