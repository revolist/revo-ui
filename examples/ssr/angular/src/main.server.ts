import { mergeApplicationConfig } from "@angular/core";
import {
  bootstrapApplication,
  BootstrapContext,
} from "@angular/platform-browser";
import { provideServerRendering, RenderMode, withRoutes } from "@angular/ssr";
import { App } from "./app";
import { appConfig } from "./app.config";

const config = mergeApplicationConfig(appConfig, {
  providers: [
    provideServerRendering(
      withRoutes([{ path: "**", renderMode: RenderMode.Server }]),
    ),
  ],
});

export default (context: BootstrapContext) =>
  bootstrapApplication(App, config, context);
