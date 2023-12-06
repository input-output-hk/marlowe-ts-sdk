
import playwright, {
  BrowserContextOptions,
  Page,
  Browser,
  BrowserContext,
  BrowserType
} from 'playwright';
import { env } from '../../env/parseEnv.js'
import { World, IWorldOptions, setWorldConstructor } from "@cucumber/cucumber";
import { GlobalConfig } from '../../env/global.js';
import GlobalStateManager from "../../support/globalStateManager.js";

export type Screen = {
  context: BrowserContext;
  page: Page;
}

export class ScenarioWorld extends World {
  constructor(options: IWorldOptions) {
    super(options)

    this.globalConfig = options.parameters as GlobalConfig;
  }

  globalConfig: GlobalConfig;

  screen!: Screen;
  globalStateManager = new GlobalStateManager();

  async init(contextOptions?: BrowserContextOptions): Promise<Screen> {
    await this.screen?.page?.close();
    await this.screen?.context?.close();

    const context = await this.newContext();
    const page = await context.newPage();

    this.screen = { context, page };

    return this.screen
  }


  private newContext = async (): Promise<BrowserContext> => {
    const automationBrowsers = ['chromium', 'firefox', 'webkit']
    type AutomationBrowser = typeof automationBrowsers[number]
    const automationBrowser = env('UI_AUTOMATION_BROWSER') as AutomationBrowser
    const pathToLaceExtension = env('LACE_WALLET_EXTENSION_PATH') as AutomationBrowser
    const pathToNamiExtension = env('NAMI_WALLET_EXTENSION_PATH') as AutomationBrowser

    const browserType: BrowserType = playwright[automationBrowser];
    const context = await browserType.launchPersistentContext('', {
      devtools: process.env.DEVTOOLS !== 'false',
      headless: process.env.HEADLESS !== 'false',
      args: [
          '--no-sandbox',
          '--disable-gpu',
          '--disable-notifications',
          '--enable-automation',
          '--no-first-run',
          '--no-default-browser-check',
          `--disable-extensions-except=${pathToLaceExtension},${pathToNamiExtension}`,
          '--disable-web-security',
          '--allow-insecure-localhost',
          '--window-size=1920,1080',
          '--allow-file-access-from-files',
          '--disable-dev-shm-usage',
          '--remote-allow-origins=*',
          '--disable-features=IsolateOrigins, site-per-process'
        ]
    })

    return context;
  }
}

setWorldConstructor(ScenarioWorld);
