import { Page } from 'playwright';
import { ElementKey, ElementLocator, GlobalConfig } from '../env/global.js';
import { getCurrentPageId } from './navigation-behavior.js';

export const getElementLocator = (
  page: Page,
  elementKey: ElementKey,
  globalConfig: GlobalConfig
): ElementLocator => {

  const currentPage = getCurrentPageId(page, globalConfig);

  const { pageElementMappings } = globalConfig;
  return pageElementMappings[currentPage]?.[elementKey] || pageElementMappings[currentPage]?.common?.[elementKey]
}
