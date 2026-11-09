import { h, createContext, type ComponentChildren } from 'preact';
import { useContext } from 'preact/hooks';
import { translateAiText, type AiUiTranslations } from './translations';
const Context = createContext<AiUiTranslations>({});
export function AiTranslationProvider({
  translations,
  children,
}: {
  translations: AiUiTranslations;
  children?: ComponentChildren;
}) {
  return <Context.Provider value={translations}>{children}</Context.Provider>;
}
export function useAiText(override?: AiUiTranslations) {
  const inherited = useContext(Context);
  const translations = override ?? inherited;
  return (text: string, values?: Record<string, string | number>) =>
    translateAiText(text, translations, values);
}
